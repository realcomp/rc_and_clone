/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';


import { ArticlePage } from '../../pages/article/article';


@Component({
    selector: 'article-item-component',
    templateUrl: 'article-item.component.html'
})


export class ArticleItem {


    @Input() article:any;
    @Input() rubrics:any;


    public rubric:string;


    /**
     *
     * @param navCtrl
     */
    constructor(protected navCtrl:NavController) {

    }


    public ngOnInit():void {
        this.rubric = this.getRubric();
    }


    /**
     *
     * @param id
     */
    public handlerSelect(id:number) {
        this.goToArticlePage(id, this.rubric);
    }


    /**
     *
     * @param params
     */
    private goToArticlePage(...params):void {
        this.navCtrl.push(ArticlePage, {id: params[0], rubric: params[1]});
    }


    /**
     *
     */
    private getRubric():string {
        let rubric = 'Новости'; // Если ничего на найдем, пусть лучше будут новости
        if (this.article.rubric in this.rubrics) {
            return this.rubrics[this.article.rubric];
        }
        return rubric;
    }

}

