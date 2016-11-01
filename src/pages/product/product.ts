import { Component } from '@angular/core';
import { App, NavParams } from 'ionic-angular';

import { ProductInterface } from '../../interfaces/product.interface';


@Component({
  selector: 'page-product',
  templateUrl: 'product.html'
})


export class ProductPage {


  public categoryTitle: string;
  public product: ProductInterface;
  public slug: string;
  public productPropsTitleMain: string;
  public productPropsGroupMain;
  public productPropsTitleAddition: string;
  public productPropsGroupAddition;


  /**
   *
   * @param app
   * @param navParams
   */
  constructor(public app:App, public navParams:NavParams) {
    this.categoryTitle = '';
    this.product = <ProductInterface>{};
    this.productPropsTitleMain = 'Основные';
    this.productPropsGroupMain = [];
    this.productPropsTitleAddition = 'Дополнительные';
    this.productPropsGroupAddition = [];
  }


  /**
   *
   */
  ionViewDidLoad() {
    this.product = this.navParams.get('product');
    this.slug = this.navParams.get('slug');
    let properties = this.navParams.get('properties');
    this.buildProductProps(properties);
  }


  /**
   *
   */
  ionViewWillEnter() {
    this.categoryTitle = this.navParams.get('categoryTitle');
    this.app.setTitle(this.categoryTitle);
  }


  ngAfterViewInit() {

  }



  /**
   *
   * @param properties
   */
  private buildProductProps(properties) {
    let productValues = this.product['property_values'];

    // Main
    let propsMain = properties[0];
    for(let item of propsMain['properties']) {
      let id = item['id'];
      if(productValues[id] != null) {
        this.productPropsGroupMain.push({
            name: [item['name']],
            value: productValues[id]
        });
      }
    }

    // Addition
    let propsAddition = properties[1];
    for(let item of propsAddition['properties']) {
      let id = item['id'];
      if(productValues[id] != null) {
        this.productPropsGroupAddition.push({
          name: [item['name']],
          value: productValues[id]
        });
      }
    }

  }


}