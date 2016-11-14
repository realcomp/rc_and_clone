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


export class ProductItem {


    @Input() article: any;

    /**
     *
     * @param navCtrl
     */
    constructor(protected navCtrl:NavController) {}


    /**
     *
     * @param id
     */
    public handlerSelect(id: number) {
        this.goToArticlePage(id);
    }


    /**
     *
     * @param params
     */
    private goToArticlePage(...params): void {
        this.navCtrl.push(ArticlePage, {id: params[0]});
    }

}

