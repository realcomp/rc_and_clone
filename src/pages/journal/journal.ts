import { Component } from '@angular/core';
import { App, NavController, ActionSheetController } from 'ionic-angular';

import { LocalStorage } from '../../libs/LocalStorage';
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

    private filters: any;
    private selectedRubricId: any;
    private selectedCategoryId: any;


    /**
     *
     * @param app
     * @param navCtrl
     * @param connect
     * @param actionSheetCtrl
     */
    constructor(
        private app: App,
        private navCtrl: NavController,
        private connect: ConnectService,
        private actionSheetCtrl: ActionSheetController) {

        this.articles = [];
        this.articlesEmpty = false;
        this.title = 'Журнал покупателя';

        this.selectedRubricId = null;
        this.selectedCategoryId = null;
        this.filters = {
            rubric: null,
            category_id: null
        }

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
        this.renderArticles();
    }


    /**
     *
     * @param type
     */
    public openMenu(type: string): void {
        let params = this.getParamsForFilter(type);
        let actionSheet = this.createActionSheet(params);
        actionSheet.present();
    }


    /**
     *
     */
    private renderArticles(): void {
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
     * @param articles
     */
    private updateArticles(articles: any): void {
        this.articles = articles;
        this.articlesEmpty = this.articles.length == 0;
    }


    /**
     *
     * @returns {Promise<T>}
     */
    private getArticles(): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.articles, this.filters);
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
     */
    private resetArticles(): void {
        this.articles = [];
    }


    /**
     *
     * @param type
     * @returns {Array}
     */
    private getParamsForFilter(type: string): any[] {
        let params: any = {};
        switch (type) {
            case 'category':
                params = {
                    type: 'category',
                    title: 'Выбор категории',
                    entity: LocalStorage.get('categories'),
                    callback: (id) => {
                        this.selectedCategoryId = id;
                        this.filters.category_id = id;
                    }
                };
                break;
            case 'rubric':
                params = {
                    type: 'rubric',
                    title: 'Выбор рубрики',
                    entity: LocalStorage.get('rubrics'),
                    callback: (id) => {
                        this.selectedRubricId = id;
                        this.filters.rubric = id;
                    }
                };
                break;
            default:
                console.error(`${type} not supported! Expected: category or rubric`);
        }

        return params;
    }


    /**
     *
     * @param params
     * @returns {ActionSheet}
     */
    private createActionSheet(params): any {
        let { title, entity, type, callback } = params;

        let buttons: any[] = entity.map((item) => {
            let id = item['id'] || item['rubric'];
            return {
                id,
                text: item.name,
                cssClass: this.getCssClassForActionSheet(id, type),
                handler: () => {
                    callback(id);
                    this.resetArticles();
                    this.renderArticles();
                }
            };
        })

        return this.actionSheetCtrl.create({
            title,
            cssClass: 'action-sheets-basic-page',
            buttons
        });
    }


    /**
     *
     * @param id
     * @param type
     * @returns {string}
     */
    private getCssClassForActionSheet(id, type): string {
        let selectedTypeId: any = type === 'rubric' ? this.selectedRubricId: this.selectedCategoryId;
        return selectedTypeId == id ? 'active': '';
    }

}
