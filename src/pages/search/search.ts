/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, NavController, LoadingController } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';
import { ConnectService } from '../../services/connect.service';

import { LoadingInterface } from '../../interfaces/loading.interface';

import { ProductPage } from '../product/product';


@Component({
    selector: 'page-search',
    templateUrl: 'search.html'
})


export class SearchPage implements LoadingInterface {


    public inputSearchValue: string;


    public products: Array<any>;
    public productsEmpty: boolean;
    public segment: string;
    public title: string;
    public slug: string;
    public filter: string;
    public lastFilter: string;
    public totalCount: any;

    private limit: number;
    private offset: number;
    private loading: any;
    private searchFreeze: boolean;



    constructor(public app:App, public navCtrl:NavController, public connect:ConnectService, public loadingCtrl: LoadingController) {
        this.inputSearchValue = '';

        this.products = [];
        this.productsEmpty = false;
        this.segment = 'all';
        this.title = '';
        this.slug = '';
        this.filter = ''

        this.limit = 100;
        this.offset = 0;
        this.searchFreeze = false;

    }


    onInput(event) {
        if(this.inputSearchValue.length >= 3 && !this.searchFreeze) {
            this.doSearch();
        }
    }

    onCancel(event) {

    }


    doSearch() {
        console.log(12111)
        this.searchFreeze = true;
        this.showLoader();
        this.getProducts().then(
            (data) => {
                this.hideLoader();
                this.updateProducts(data);
                this.searchFreeze = false;
            },
            (error) => {
                this.hideLoader();
                this.connect.showErrorAlert();
                this.searchFreeze = false
                console.error(`Error: ${error}`);
            }
        );
    }

    /**
     *
     */
    showLoader() {
        this.loading = this.loadingCtrl.create({
            content: 'Ищу товары...'
        });

        this.loading.present();
    }


    /**
     *
     */
    hideLoader() {
        this.loading.dismissAll();
    }


    /**
     *
     * @returns {Promise<T>}
     */
    private getProducts() {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.search, {
                limit: this.limit,
                offset: this.offset,
                query: this.inputSearchValue
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    let items = data['data'][1];
                    if(items != null) {
                        resolve(items);
                    }
                },
                (error) => {
                    reject(`Error: ${error}`);
                }
            );
        });
    }


    /**
     *
     * @param products
     */
    private updateProducts(products: any) {
        this.products = this.sortingProducts(products);
        this.productsEmpty = this.products.length == 0;
    }


    /**
     *
     */
    private resetProducts() {
        this.products = [];
    }


    /**
     *
     * @param products
     * @returns {any}
     */
    private sortingProducts(products: any) {
        products.sort(Utils.sortBy(
            {
                name: 'tested',
                reverse: true
            },
            {
                name: 'danger_level'
            },
            {
                name: 'rating',
                reverse: true
            }
        ));

        return products;

    }


}
