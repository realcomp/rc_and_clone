/**
 * Created by maxim on 24.10.16.
 */


import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchPage } from '../../pages/search/search';


@Component({
    selector: 'search-action-component',
    templateUrl: 'search-action.component.html'
})


export class SearchAction {


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
