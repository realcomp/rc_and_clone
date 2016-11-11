import { Component, ViewChild} from '@angular/core';

import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { Splashscreen, StatusBar } from 'ionic-native';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { LocalStorage } from '../libs/LocalStorage';


export interface PageObj {
  title: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
}



@Component({
  templateUrl: 'app.template.html',
})



export class App {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageObj[] = [
    { title: 'Schedule', component: TabsPage, icon: 'calendar' },
    { title: 'Speakers', component: TabsPage, index: 1, icon: 'contacts' },
    { title: 'Map', component: TabsPage, index: 2, icon: 'map' },
    { title: 'About', component: TabsPage, index: 3, icon: 'information-circle' },
  ];
  loggedInPages: PageObj[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'Logout', component: TabsPage, icon: 'log-out', logsOut: true }
  ];
  loggedOutPages: PageObj[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Signup', component: SignupPage, icon: 'person-add' }
  ];

  rootPage: any = null;
  private prevLaunched: any = null;

  constructor(
    public events: Events,
    public menu: MenuController,
    platform: Platform
  ) {
    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.overlaysWebView(true); // let status bar overlay webview
      StatusBar.backgroundColorByHexString('#a32630'); // set status bar to white
      Splashscreen.hide();
    });


    // Use TutorialPage for fist launch app
    this.prevLaunched = LocalStorage.get('prev-launch-app');
    if(!this.prevLaunched) {
      this.rootPage = TutorialPage;
      LocalStorage.set('prev-launch-app', '1');
    }
    else {
      this.rootPage = TabsPage;
    }


    this.listenToLoginEvents();
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario



    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});
    }
    else {
      this.nav.setRoot(page.component);
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
      }, 1000);
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }
}