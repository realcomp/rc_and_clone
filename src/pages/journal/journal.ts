import { Component } from '@angular/core';
import { App, NavController, ActionSheetController } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';

import { ConnectService } from '../../services/connect.service';
import { JournalService } from '../../services/journal.service';


@Component({
    selector: 'page-journal',
    templateUrl: 'journal.html'
})


export class JournalPage {


    public articles: any[];
    public articlesEmpty: boolean;
    public title: string;
    public totalCount: number;
    public rubricsSlugKey: any;

    private filters: any;
    private selectedRubricId: any;
    private selectedCategoryId: any;
    private offset: number;
    private stepOffset: number;
    private limit: number;


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
        private actionSheetCtrl: ActionSheetController,
        private journalService: JournalService
        ) {

        this.articles = [];
        this.articlesEmpty = false;
        this.title = 'Журнал покупателя';
        this.totalCount = 0;

        this.selectedRubricId = null;
        this.selectedCategoryId = null;
        this.filters = {
            rubric: null,
            category_id: null
        }

        this.limit = 10;
        this.offset = 0;
        this.stepOffset = 10;
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
        this.rubricsSlugKey = this.journalService.getRubricsSlugKey();
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
     * @param infiniteScroll
     */
    public doInfinite(infiniteScroll: any): void {
        this.offset += this.stepOffset;
        this.getArticles().then(
            (data) => {
                infiniteScroll.complete();
                this.updateArticles(data);
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
        this.articles = this.articles.concat(articles);
        this.articlesEmpty = this.articles.length == 0;
    }


    /**
     *
     * @returns {Promise<T>}
     */
    private getArticles(): any {
        return new Promise((resolve, reject) => {
            let params = Object.assign({}, this.filters, {limit: this.limit, offset: this.offset});
            let url = UrlManager.createUrlWithParams(API.articles, params);
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    this.totalCount = data['total_count'];
                    let items = data['items'];
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
     */
    private resetArticles(): void {
        this.articles = [];
        this.offset = 0;
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
                    entity: this.journalService.getCategories(),
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
                    entity: this.journalService.getRubrics(),
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
