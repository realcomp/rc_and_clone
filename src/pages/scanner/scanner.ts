/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, AlertController, Platform, NavController } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { API } from '../../config/';
import { UrlManager } from '../../libs/UrlManager';
import { ConnectService } from '../../services/connect.service';
import { ProductService } from '../../services/product.service';

import { ProductItemInterface } from '../../interfaces/productItem.interface';

import { ProductPage } from '../product/product';
import { TabsPage } from '../tabs/tabs';
import { ScannerNotFoundPage } from '../scanner-not-found/scanner-not-found';


@Component({
    selector: 'page-scanner',
    templateUrl: 'scanner.html'
})


export class ScannerPage {


    public title: string;


    /**
     *
     * @param app
     * @param platform
     * @param alertCtrl
     * @param navCtrl
     * @param connect
     * @param productService
     */
    constructor(
        private app: App,
        private platform:Platform,
        private alertCtrl: AlertController,
        private navCtrl:NavController,
        private connect:ConnectService,
        private productService: ProductService
    ) {
        this.title = 'Сканер по штрихкоду';
    }


    /**
     *
     */
    public ionViewWillEnter() : void {
       this.scan();
    }


    /**
     *
     */
    public scan(): void {
        this.platform.ready().then(() => {
            if ('cordova' in window) {
                window['cordova'].plugins.barcodeScanner.scan((result) => {
                    if(!result.cancelled) {
                        this.onSuccessScan(result.text);
                    }
                    else {
                        this.app.getRootNav().push(TabsPage);
                    }
                }, (error) => {
                    let alert = this.alertCtrl.create({
                        title: 'Ошибка сканирования',
                        subTitle: error,
                        buttons: [{
                            text: 'Закрыть',
                        }]
                    });
                    alert.present();
                });
            }
            else {
                console.warn('Scanner supported only real devices!')
            }
        });
    }


    /**
     *
     * @param code
     */
    private onSuccessScan(code): void {
        let promise = this.getProductOnBarcode(code);
        promise.then(
            (data) => {
                this.processApiResult(data);
            },
            (error) => {
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );
    }


    /**
     *
     * @param data
     */
    private processApiResult(data: any[]): void {
        if(data[0].length > 0 && data[1].length > 0) {
            let category = data[0][0];
            let product = data[1][0];
            let slug = this.productService.getSlug(category);
            this.goToProductPage(product, category['ratings'], slug, category.name, category['properties']);
        }
        else {
            this.navCtrl.push(ScannerNotFoundPage);
        }
    }


    /**
     *
     * @param code
     * @returns {Promise<T>}
     */
    private getProductOnBarcode(code): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.barcode, {
                code
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']).data;
                    if (data != null) {
                        resolve(data);
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
     * @param product
     * @param ratings
     * @param slug
     * @param categoryTitle
     * @param properties
     */
    private goToProductPage(product:ProductItemInterface, ratings: any[], slug: string, categoryTitle: string, properties: any[]): void {
        this.navCtrl.push(ProductPage, {
            product,
            slug,
            categoryTitle,
            ratings,
            properties
        });
    }


}
