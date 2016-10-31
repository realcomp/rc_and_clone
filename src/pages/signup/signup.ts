import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';



@Component({
  selector: 'page-login',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: {username?: string, password?: string} = {};
  submitted = false;

  constructor(public navCtrl: NavController) {}

}
