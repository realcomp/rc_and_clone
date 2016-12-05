/**
 * Created by maxim on 24.10.16.
 */


import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';


@Component({
    selector: 'basic-modal-component',
    templateUrl: 'basic-modal.component.html'
})


export class BasicModal {


    public title: string;
    public subTitle: string;


    /**
     *
     * @param navCtrl
     * @param viewCtrl
     * @param navParams
     * @param test
     */
    constructor(protected navCtrl: NavController, protected viewCtrl: ViewController, protected navParams: NavParams) {
        this.title = this.navParams.get('title') || '';
        this.subTitle = this.navParams.get('subTitle') || '';
    }


    /**
     *
     * @param isUserClick
     */
    public close(isUserClick?: boolean): void {
        this.viewCtrl.dismiss();
        let callbackClick = this.navParams.get('callbackClick');
        let success = this.navParams.get('success');
        if (typeof callbackClick === 'function' && isUserClick) {
            callbackClick();
        }
        else if(typeof success === 'function') {
            success();
        }
    }


}

