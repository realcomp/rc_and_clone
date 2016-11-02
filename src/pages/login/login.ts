import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';



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
    console.log(1);
  }
}
