/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { LoadingController } from 'ionic-angular';

import { Utils } from '../../../../libs/Utils';
import { UrlManager } from '../../../../libs/UrlManager';
import { API } from '../../../../config/';

import { ConnectService } from '../../../../services/connect.service';

import { LoadingInterface } from '../../../../interfaces/loading.interface';


@Component({
    selector: 'product-reviews-component',
    templateUrl: 'product-reviews.component.html'
})


export class ProductReviews implements LoadingInterface {


    @Input() id: number;


    public reviews: any[];
    public totalCount: number;
    public positiveCount: number;
    public positiveProcent: number;
    public negativeProcent: number;

    private limit: number;
    private offset: number;
    private stepOffset: number;
    private loading: any;
    private calculate: boolean;


    /**
     *
     * @param connect
     * @param loadingCtrl
     */
    constructor(private connect:ConnectService, private loadingCtrl: LoadingController) {
        this.reviews = [];
        this.totalCount = 0;
        this.positiveCount = 0;
        this.positiveProcent = 0;
        this.negativeProcent = 0;

        this.limit = 5;
        this.stepOffset = 5;
        this.offset = 0;
        this.calculate = false;
    }


    /**
     *
     */
    ngOnInit() {
        this.loadMoreReviews();
    }


    /**
     *
     * @param showAlert
     * @param showLoader
     */
    loadMoreReviews(showAlert?:boolean, showLoader?:boolean) {
        if(this.id != null) {
            let promise = this.getReviews(this.id, showLoader);
            promise.then(
                (data) => {
                    if(this.calculate === false) {
                        this.calcProcents();
                    }

                    this.offset += this.stepOffset;
                    this.updateReviews(data);
                },
                (error) => {
                    if(showAlert) {
                        this.connect.showErrorAlert();
                    }
                    console.error(`Error: ${error}`);
                }
            );
        }
    }


    /**
     *
     * @param date
     * @returns {*|string}
     */
    getDate(date: string) {
        return Utils.dateFormatting(date);
    }


    /**
     *
     */
    showLoader(content?: string) {
        this.loading = this.loadingCtrl.create({
            content: content || ''
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
     * @param count
     * @returns {any}
     */
    getDecl(count: number) {
        let decl = ['отзыв', 'отзыва', 'отзывов'];
        return Utils.declOfNum(count, decl);
    }


    /**
     *
     * @param id
     * @param showLoader
     * @returns {Promise<T>}
     */
    private getReviews(id: number, showLoader?: boolean) {
        return new Promise((resolve, reject) => {

            if(showLoader) {
                this.showLoader('Загружаю отзывы');
            }

            let url = UrlManager.createUrlWithParams(API.reviews, {
                product_id: id,
                limit: this.limit,
                offset: this.offset
            });

            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    this.totalCount = data['total_count'];
                    this.positiveCount = data['positive'];

                    if(showLoader) {
                        this.hideLoader();
                    }

                    let items = data['items'];
                    if(items != null) {
                        resolve(items);
                    }
                },
                (error) => {
                    if(showLoader) {
                        this.hideLoader();
                    }
                    reject(`Error: ${error}`);
                }
            );
        });
    }


    /**
     *
     * @param reviews
     */
    private updateReviews(reviews: any) {
        this.reviews = this.reviews.concat(reviews);
    }


    /**
     *
     */
    private calcProcents() {
        this.calculate = true;
        if(this.positiveCount == 0 || this.totalCount == 0) {
            return;
        }
        this.positiveProcent = Math.round(this.positiveCount * 100 / this.totalCount);

        if(this.positiveProcent > 0) {
            this.negativeProcent = 100 - this.positiveProcent;
        }

    }

}
