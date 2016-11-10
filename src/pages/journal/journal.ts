import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';

import { ConnectService } from '../../services/connect.service';

import { ArticlePage } from '../article/article';


@Component({
    selector: 'page-journal',
    templateUrl: 'journal.html'
})


export class JournalPage {


    public articles: Array<any> = [];
    public articlesEmpty: boolean = false;
    public title: string = 'Журнал покупателя';


    /**
     *
     * @param app
     * @param navCtrl
     * @param navParams
     * @param connect
     */
    constructor(public app:App, public navCtrl:NavController, public navParams:NavParams, private connect:ConnectService) {}


    /**
     *
     */
    public ionViewWillEnter(): void {
        this.app.setTitle(this.title);
    }


    /**
     *
     */
    public ngAfterViewInit(): void {
        let promise = this.getArticles();
        promise.then(
            (data) => {
                this.updateArticles(data);
            },
            (error) => { alert(`Error: ${error}`); }
        );
    }


    /**
     *
     * @param categories
     */
    public updateArticles(articles: any): void {
        this.articles = articles;
        this.articlesEmpty = this.articles.length == 0 ? true : false;
    }


    /**
     *
     * @param id
     * @returns {Promise<T>}
     */
    public getArticles(id?: number): Promise<any> {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.articles);
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']).items;
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


    /**
     *
     * @param category
     */
    public handlerSelect(id: number): void {
        this.goToProductsPage(id);
    }


    /**
     *
     * @param id
     */
    private goToProductsPage(id: number): void {
        this.navCtrl.push(ArticlePage, {
            id,
        });
    }

}
