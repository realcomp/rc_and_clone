/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';

import { BasicModal } from '../basic-modal/basic-modal.component';

import { TabsPage } from '../../pages/tabs/tabs';


@Component({
    selector: 'auth-modal-component',
    templateUrl: 'auth-modal.component.html'
})


export class AuthModal extends BasicModal {


    /**
     *
     * @param navCtrl
     * @param viewCtrl
     * @param navParams
     */
    constructor(protected navCtrl:NavController, protected viewCtrl:ViewController, protected navParams:NavParams) {
        super(navCtrl, viewCtrl, navParams);
    }


}

