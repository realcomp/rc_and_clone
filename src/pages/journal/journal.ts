import { Component } from '@angular/core';
import { App, NavController, NavParams, ActionSheetController } from 'ionic-angular';

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


    public articles: any[];
    public articlesEmpty: boolean;
    public title: string;

    private index: number;


    /**
     *
     * @param app
     * @param navCtrl
     * @param navParams
     * @param connect
     * @param actionSheetCtrl
     */
    constructor(
        private app:App,
        private navCtrl:NavController,
        private navParams:NavParams,
        private connect:ConnectService,
        private actionsheetCtrl: ActionSheetController) {

        this.articles = [];
        this.articlesEmpty = false;
        this.title = 'Журнал покупателя';

        this.index = 0;

    }


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
    public getArticles(id?: number): any {
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


    public openMenu() {

        let self = this;

        let buttonsArray = ['Все', 'Продукты', 'Бытовая химия'];
        let buttons: any[] = buttonsArray.map((item, index) => {
            return {
                id: index,
                text: item,
                cssClass: (self.index === index ? 'active': ''),
                handler: function() {
                    self.index = this.id;
                }
            };
        })


        let actionSheet = this.actionsheetCtrl.create({
            title: 'Выбор категории',
            cssClass: 'action-sheets-basic-page',
            buttons
        });
        actionSheet.present();
    }

}
