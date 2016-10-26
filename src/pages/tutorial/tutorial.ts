import { Component } from '@angular/core';

import { MenuController, NavController } from 'ionic-angular';

import { TabsPage } from '../tabs/tabs';


export interface Slide {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})


export class TutorialPage {
  slides: Slide[];
  showSkip = true;

  constructor(public navCtrl: NavController, public menu: MenuController) {
    this.slides = [
      {
        title: 'Новый интерфейс',
        description: 'Мы полностью переработали интерфейс под современные стандарты, теперь он удобен, как никогда!',
        image: 'assets/img/ica-slidebox-img-1.png',
      },
      {
        title: 'Новые возможности',
        description: 'В приложение добавлен сканер по штрихкоду, который позволит узнать всю информацию о товаре за считанные секунды.',
        image: 'assets/img/ica-slidebox-img-2.png',
      },
      {
        title: 'Оптимизация и улучшения',
        description: 'Работа приложения значительно опмизирована, так же исправлен ряд ошибок',
        image: 'assets/img/ica-slidebox-img-3.png',
      }
    ];
  }

  startApp() {
    this.navCtrl.push(TabsPage);
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

}
