/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';



@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  speaker: any;
  confirmedExit: boolean = false;

  constructor(public nav: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
    this.speaker = this.navParams.data;
  }



  ionViewWillEnter() {
    let alert = this.alertCtrl.create({
      title: 'Auth',
      buttons: [{
        text: 'OK',
        handler: () => {
          // close the sliding item

        }
      }]
    });
    // now present the alert on top of all other content
    alert.present();
  }


}



