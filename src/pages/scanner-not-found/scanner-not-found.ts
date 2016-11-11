/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ScannerPage } from '../scanner/scanner';
import { SearchPage } from '../search/search';


@Component({
    selector: 'page-scanner-not-found',
    templateUrl: 'scanner-not-found.html'
})


export class ScannerNotFoundPage {


    public title: string;


    /**
     *
     * @param navCtrl
     */
    constructor(private navCtrl:NavController) {
        this.title = 'Результаты сканирования';
    }


    /**
     *
     */
    public handlerClickScanner(): void {
        this.goToScannerPage();
    }


    /**
     *
     */
    public handlerClickSearch(): void {
        this.goToSearchPage();
    }


    /**
     *
     */
    private goToScannerPage(): void {
        this.navCtrl.push(ScannerPage);
    }


    /**
     *
     */
    private goToSearchPage(): void {
        this.navCtrl.push(SearchPage);
    }



}
