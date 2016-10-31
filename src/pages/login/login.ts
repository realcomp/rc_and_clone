import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { SignupPage } from '../signup/signup';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: {username?: string, password?: string} = {};
  submitted = false;

  constructor(public navCtrl: NavController) { }

  onLogin(form) {
    this.submitted = true;

  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
}
