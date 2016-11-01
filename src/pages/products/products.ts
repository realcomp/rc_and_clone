/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';

import { ConnectService } from '../../services/connect.service';

import { LoadingInterface } from '../../interfaces/loading.interface';


enum ProductStatus {Tested, BlackList, NotTested }


@Component({
    selector: 'page-products',
    templateUrl: 'products.html'
})


export class ProductsPage implements LoadingInterface {


    public products: Array<any>;
    public productsEmpty: boolean;
    public segment: string;
    public title: string;
    public slug: string;
    public filter: string;
    public lastFilter: string;
    public totalCount: any;

    private id: number;
    private properties;
    private limit: number;
    private offset: number;
    private status: ProductStatus;
    private loading: any;
    private stepOffset: number;


    /**
     *
     * @param app
     * @param navCtrl
     * @param navParams
     * @param connect
     * @param loadingCtrl
     */
    constructor(public app:App, public navCtrl:NavController, public navParams:NavParams, public connect:ConnectService, public loadingCtrl: LoadingController) {
        this.products = [];
        this.productsEmpty = false;
        this.segment = 'all';
        this.title = '';
        this.slug = '';
        this.filter = '';

        this.limit = 20;
        this.offset = 0;
        this.stepOffset = 20;
        this.status = ProductStatus.Tested;

    }


    /**
     *
     */
    ionViewDidLoad() {
        this.properties = this.navParams.get('properties');
        this.slug = this.navParams.get('slug');
    }


    /**
     *
     */
    ionViewWillEnter() {
        this.title = this.navParams.get('title');
        this.app.setTitle(this.title);
    }


    /**
     *
     */
    ngAfterViewInit() {
        this.showLoader();
        this.getProductsBeforeViewInit( ()=> {
            this.hideLoader();
        });
    }




    /**
     *
     * @param event
     * @returns {boolean}
     */
    changeFilter(event) {
        let value: string = event.value;

        if(value == this.lastFilter) {
            return;
        }

        switch (value) {
            case 'Tested':
                this.status = ProductStatus.Tested;
                this.lastFilter = 'Tested';
                break;
            case 'NotTested':
                this.status = ProductStatus.NotTested;
                this.lastFilter = 'NotTested';
                break;
            default :
                console.warn(`${value} not supported!`);
                return false;
        }

        this.resetProductAndParams();
        this.showLoader();

        this.getProducts(this.id).then(
            (data) => {
                this.hideLoader();
                let products = this.sortingProducts(data);
                this.updateProducts(products);
            },
            (error) => {
                this.hideLoader();
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );
    }


    /**
     *
     * @param infiniteScroll
     */
    doInfinite(infiniteScroll: any) {
        this.getProducts(this.id).then(
            (data) => {
                infiniteScroll.complete();
                this.offset += this.stepOffset;
                this.updateProducts(data);
            },
            (error) => {
                infiniteScroll.complete();
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );
    }


    /**
     *
     */
    showLoader(content?: string) {
        this.loading = this.loadingCtrl.create({
            //cssClass: 'loading-stupid',
            content: content || 'Загружаю'
        });
        this.loading.present();
    }


    /**
     *
     */
    hideLoader() {
        //let loading = <HTMLElement>document.querySelector('.loading-stupid');
        //if(loading != null) {
        //    loading.style.display = 'none';
        //}
        this.loading.dismissAll();
    }


    /**
     *
     * @param callback
     */
    private getProductsBeforeViewInit(callback: any) {
        this.id = this.navParams.get('id');
        let promise = this.getProducts(this.id);
        promise.then(
            (data) => {

                if(data[0] == null && this.status === ProductStatus.Tested) {
                    this.status = ProductStatus.NotTested;
                    this.getProductsBeforeViewInit( ()=> {
                        this.hideLoader();
                    });
                    return;
                }

                if(data[0] != null && this.status === ProductStatus.NotTested) {
                    this.filter = this.lastFilter = 'NotTested';
                }
                else {
                    this.filter = this.lastFilter = 'Tested';
                }

                callback();

                let products = this.sortingProducts(data);
                this.updateProducts(products);
            },
            (error) => {
                this.hideLoader();
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );

    }



    /**
     *
     * @param id
     * @returns {Promise<T>}
     */
    private getProducts(id?: number) {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.products, {
                category_id: id || 0,
                limit: this.limit,
                offset: this.offset,
                status: this.status
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    this.totalCount = data['total_count'];

                    let items: any = data['data'];
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
        this.products = this.products.concat(products);
        this.productsEmpty = this.products.length == 0;
    }


    /**
     *
     */
    private resetProductAndParams() {
        this.offset = 0;
        this.products = [];
    }


    /**
     *
     * @param products
     * @returns {any}
     */
    private sortingProducts(products: any) {
        products.sort(Utils.sortBy({
            name: 'danger_level'
        }, {
            name: 'rating',
            reverse: true
        }));

        return products;

    }


}
