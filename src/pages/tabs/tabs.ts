import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { CategoriesPage } from '../categories/categories';
import { ShoppingListPage } from '../shopping-list/shopping-list';
import { JournalPage } from '../journal/journal';
import { ProfilePage } from '../profile/profile';
import { ScannerPage } from '../scanner/scanner';


@Component({
    templateUrl: 'tabs.html'
})


export class TabsPage {

    tab1Root:any = CategoriesPage;
    tab2Root:any = ScannerPage;
    tab3Root:any = ShoppingListPage;
    tab4Root:any = JournalPage;
    tab5Root:any = ProfilePage;
    mySelectedIndex:number;


    /**
     *
     * @param navParams
     */
    constructor(private navParams: NavParams) {
        this.mySelectedIndex = navParams.data.tabIndex || 0;
    }


    /**
     *
     * @param $ev
     */
    public tabChanged($ev): void {
        console.log('change')
    }


    public con($ev) {
        console.log('con!')
        this.mySelectedIndex = 0;
    }

}
