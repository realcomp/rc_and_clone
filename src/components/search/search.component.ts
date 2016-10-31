/**
 * Created by maxim on 24.10.16.
 */


import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchPage } from '../../pages/search/search';


@Component({
    selector: 'search-component',
    templateUrl: 'search.component.html'
})


export class Search {


    /**
     *
     * @param navCtrl
     */
    constructor(public navCtrl:NavController) {}


    /**
     *
     */
    handlerClick() {
        this.goToSearchPage();
    }


    /**
     *
     */
    private goToSearchPage() {
        this.navCtrl.push(SearchPage);
    }

}
