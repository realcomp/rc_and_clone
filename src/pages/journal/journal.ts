import { Component } from '@angular/core';
import { App, List, NavController, NavParams } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';
import { Connect } from '../../providers/Connect';

import { ArticlePage } from '../article/article';


@Component({
    selector: 'page-journal',
    templateUrl: 'journal.html'
})


export class JournalPage {


    public articles: Array<any> = [];
    public articlesEmpty: boolean = false;
    public title: string = 'Журнал покупателя';

    private limit: number = 20;
    private offset: number = 0;



    constructor(public app:App, public navCtrl:NavController, public navParams:NavParams, public connect:Connect) {}



    ionViewWillEnter() {
        this.app.setTitle(this.title);
    }



    ngAfterViewInit() {
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
    updateArticles(articles: any) {
        this.articles = articles;
        this.articlesEmpty = this.articles.length == 0 ? true : false;
    }


    /**
     *
     * @param id
     * @returns {Promise<T>}
     */
    getArticles(id?: number) {
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
    handlerSelect(id: number) {
        this.goToProductsPage(id);
    }


    private goToProductsPage(id: number) {
        this.navCtrl.push(ArticlePage, {
            id,
        });
    }

}
