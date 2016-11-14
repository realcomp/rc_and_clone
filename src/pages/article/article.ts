/**
 * Created by maxim on 18.10.16.
 */


'use strict';

import { Component } from '@angular/core';
import { NavParams, LoadingController } from 'ionic-angular';

import { UrlManager } from '../../libs/UrlManager';
import { Utils } from '../../libs/Utils';
import { API } from '../../config/';

import { ConnectService } from '../../services/connect.service';

import { LoadingInterface } from '../../interfaces/loading.interface';


@Component({
    selector: 'page-article',
    templateUrl: 'article.html'
})


export class ArticlePage implements LoadingInterface {


    public title: string;
    public articleTitle: string;
    public html: any;

    private id: number;
    private loading: any;


    /**
     *
     * @param navParams
     * @param connect
     * @param loadingCtrl
     */
    constructor(private navParams: NavParams, private connect: ConnectService, private loadingCtrl: LoadingController) {
        this.title = 'Журнал покупателя';
        this.articleTitle = '';
        this.html = '';

        this.id = null;
        this.loading = null;
    }


    /**
     *
     */
    public ionViewDidLoad(): void {
        this.id = this.navParams.get('id');
    }


    /**
     *
     */
    public ngAfterViewInit(): void {
        this.renderArticle();
    }


    /**
     *
     */
    public showLoader(content?: string): void {
        this.loading = this.loadingCtrl.create({
            content: content || 'Загружаю'
        });
        this.loading.present();
    }


    /**
     *
     */
    public hideLoader(): void {
        this.loading.dismissAll();
    }


    /**
     *
     */
    private renderArticle(): void {
        this.showLoader();
        let promise = this.getArticle();
        promise.then(
            (article) => {
                this.hideLoader();
                this.articleTitle = article.title;
                this.html = article.html;
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
     * @returns {Promise<T>}
     */
    private getArticle(): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(`${API.articles}/${this.id}`);
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    if(data != null) {
                        resolve(data);
                    }
                },
                (error) => {
                    reject(`Error: ${error}`);
                }
            );
        });
    }


}
