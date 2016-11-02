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
    public categories: any;
    public segment: string;
    public currentCategory: any;
    public title: string;

    private limit: number;
    private offset: number;
    private loading: any;
    private searchFreeze: boolean;


    /**
     *
     * @param app
     * @param navCtrl
     * @param connect
     * @param loadingCtrl
     */
    constructor(public app:App, public navCtrl:NavController, public connect:ConnectService, public loadingCtrl: LoadingController) {
        this.inputSearchValue = '';

        this.products = [];
        this.productsEmpty = false;
        this.categories = {};
        this.currentCategory = {};
        this.title = '';

        this.limit = 100;
        this.offset = 0;
        this.searchFreeze = false;
    }


    /**
     *
     */
    ionViewDidEnter() {
        this.setFocus()
    }


    /**
     *
     * @param event
     */
    onInput(event): void {
        if(this.inputSearchValue.length >= 3 && !this.searchFreeze) {
            this.doSearch();
        }
    }


    /**
     *
     * @param event
     */
    onCancel(event): void {

    }


    /**
     *
     */
    doSearch(): void {
        this.products = [];
        this.searchFreeze = true;
        this.showLoader();
        this.getProducts().then(
            (data) => {
                this.hideLoader();
                this.buildCategories(data['categories']);
                this.updateProducts(data['products']);
                this.searchFreeze = false;
            },
            (error) => {
                this.hideLoader();
                this.searchFreeze = false;
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );
    }


    /**
     * При клике на товар в списке поиска, получаем id его категории и пишем в currentCategory - текущую категорию товара
     * Далее currentCategory будет проброшен в компонент, как [category]="currentCategory"
     * После чего будет скорее всего осуществлен переход на страницу товара
     * @param id
     */
    setCurrentCategory(id: number): void {
        if(id in this.categories) {
            this.currentCategory = {
                name: this.categories[id]['name_sg'],
                properties: this.categories[id]['properties']
            }
        }

    }


    /**
     *
     */
    showLoader(): void {
        this.loading = this.loadingCtrl.create({
            content: 'Ищу товары'
        });

        this.loading.present();
    }


    /**
     *
     */
    hideLoader(): void {
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
                    let categories = data['data'][0];
                    let products = data['data'][1];
                    if(data != null) {
                        resolve({
                            categories,
                            products
                        });
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
    private updateProducts(products: any): void {
        this.products = this.sortingProducts(products);
        this.addSlugForProducts();
        this.setFocus();
        this.productsEmpty = this.products.length == 0;
    }


    /**
     *
     */
    private resetProducts(): void {
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


    /**
     *
     * @param categories
     */
    private buildCategories(categories: any) {
        if(categories != null) {
            for(let category of categories) {
                this.categories[category.id] = {
                    'show_name_in_product_list': category['show_name_in_product_list'],
                    'name_sg': category['name_sg'],
                    properties: category['properties']
                }
            }
        }
    }


    /**
     *
     */
    private addSlugForProducts(): void {
        if(this.products.length === 0) {
            return;
        }
        for(let product of this.products) {
            let categoryId = product['category_id'];
            product['slug'] = '';
            if(categoryId in this.categories) {
                let slug = this.categories[categoryId]['show_name_in_product_list'] ? this.categories[categoryId]['name_sg'] : '';
                product['slug'] = slug;
            }
        }

    }


    /**
     *
     */
    private setFocus(): void {
        let input = <HTMLElement>document.querySelector('ion-searchbar input');
        if (input != null) {
            setTimeout(() => {
                input.focus();
            }, 500)
        }
    }


}
