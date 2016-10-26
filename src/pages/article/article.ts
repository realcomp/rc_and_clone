import { Component } from '@angular/core';

import { NavParams, ViewController } from 'ionic-angular';


@Component({
  selector: 'page-article',
  templateUrl: 'article.html'
})


export class ArticlePage {


  constructor(public navParams: NavParams, public viewCtrl: ViewController) {}

}
