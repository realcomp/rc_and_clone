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
     */
    constructor(protected navCtrl: NavController, protected viewCtrl: ViewController, protected navParams: NavParams) {
        this.title = this.navParams.get('title') || '';
        this.subTitle = this.navParams.get('subTitle') || '';
    }


    /**
     *
     */
    public close(): void {
        this.viewCtrl.dismiss();
        let callback = this.navParams.get('callback');
        if (typeof callback === 'function') {
            callback();
        }
    }


}

