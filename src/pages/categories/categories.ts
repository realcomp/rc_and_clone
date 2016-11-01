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

import { AboutPage } from '../about/about';


@Component({
    selector: 'page-categories',
    templateUrl: 'categories.html'
})


export class CategoriesPage implements LoadingInterface {


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
    constructor(public app:App, public navCtrl:NavController, public navParams:NavParams, public connect:ConnectService, public loadingCtrl: LoadingController) {
        this.categories = [];
        this.categoriesEmpty = false;
        this.isRootCategories = false;
        this.segment = 'all';
        this.title = '';

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
     */
    handlerLogoClick() {
        this.goToAboutPage();
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
     */
    private goToAboutPage() {
        this.navCtrl.push(AboutPage);
    }


}
