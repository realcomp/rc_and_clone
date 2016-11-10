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
    public handlerClick(): void {
        this.goToSearchPage();
    }


    /**
     *
     */
    private goToSearchPage(): void {
        this.navCtrl.push(SearchPage);
    }

}
