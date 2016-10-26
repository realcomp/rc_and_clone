/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, List, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';
import { Connect } from '../../providers/Connect';

import { IntefaceLoading } from '../../interfaces/Loading';

import { ProductsPage } from '../products/products';
import { AboutPage } from '../about/about';


interface Category {
    logo: string;
    name: string;
    stats: any
}


@Component({
    selector: 'page-categories',
    templateUrl: 'categories.html'
})


export class CategoriesPage implements IntefaceLoading {


    public categories: Array<any>;
    public categoriesEmpty: boolean;
    public segment: string;
    public title: string;
    public isRootCategories: boolean;

    private limit: number;
    private offset: number;
    private loading: any;


    /**
     *
     * @param app
     * @param navCtrl
     * @param navParams
     * @param connect
     * @param loadingCtrl
     */
    constructor(public app:App, public navCtrl:NavController, public navParams:NavParams, public connect:Connect, public loadingCtrl: LoadingController) {
        this.categories = [];
        this.categoriesEmpty = false;
        this.isRootCategories = false;
        this.segment = 'all';
        this.title = 'Рейтинг товаров';

        this.limit = 30;
        this.offset = 0;

    }


    /**
     *
     */
    ionViewWillEnter() {
        this.title = this.navParams.get('title') || 'Рейтинг товаров';
        this.app.setTitle(this.title);
    }


    /**
     *
     */
    ngAfterViewInit() {
        let id = this.navParams.get('id') || 0;
        if(id == 0) {
            this.isRootCategories = true;
        }

        let promise = this.getCategories(id);
        promise.then(
            (data) => {
                this.updateCategories(data);
            },
            (error) => {
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );

    }


    /**
     *
     * @param category
     */
    handlerSelect(category: any) {
        let id = category.id;
        let title = category.name;
        let properties = category.properties;
        let subCount = Number(category.stats.subcategory_count);

        let slug = '';
        if(category['show_brand']) {
            slug = category['name_sg'];
        }

        if(subCount > 0) {
            this.goToCategoriesPage(id, title);
        }
        else {
            this.goToProductsPage(id, title, properties, slug);
        }
    }


    /**
     *
     */
    handlerLogoClick() {
        this.goToAboutPage();
    }


    /**
     *
     * @param count
     * @returns {any}
     */
    getDecl(count: number) {
        let decl = ['тест', 'теста', 'тестов'];
        return Utils.declOfNum(count, decl);
    }


    /**
     *
     */
    showLoader() {
        this.loading = this.loadingCtrl.create({
            content: 'Загружаю...',
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
     * @param id
     * @returns {Promise<T>}
     */
    private getCategories(id?: number) {
        return new Promise((resolve, reject) => {
            this.showLoader();
            let url = UrlManager.createUrlWithParams(API.categories, {
                parent_id: id || 0,
                limit: this.limit,
                offset: this.offset
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']).data;
                    if(data != null) {
                        resolve(data);
                    }
                    this.hideLoader();
                },
                (error) => {
                    this.hideLoader();
                    reject(`Error: ${error}`);
                }
            );
        });
    }


    /**
     *
     * @param categories
     */
    private updateCategories(categories: any) {
        categories.sort(Utils.sortBy({
            name: 'position',
        }));

        this.categories = categories;
        this.categoriesEmpty = this.categories.length == 0;
    }


    /**
     *
     * @param id
     * @param title
     */
    private goToCategoriesPage(id: number, title: string) {
        this.navCtrl.push(CategoriesPage, {
            id,
            title
        });
    }


    /**
     *
     * @param id
     * @param title
     * @param properties
     * @param slug
     */
    private goToProductsPage(id: number, title: string, properties, slug?: string) {
        this.navCtrl.push(ProductsPage, {
            id,
            title,
            properties,
            slug
        });
    }


    /**
     *
     */
    private goToAboutPage() {
        this.navCtrl.push(AboutPage);
    }


}
