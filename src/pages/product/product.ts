import { Component } from '@angular/core';
import { App, NavParams } from 'ionic-angular';

import { ProductInterface } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';


@Component({
  selector: 'page-product',
  templateUrl: 'product.html'
})


export class ProductPage {


  public categoryTitle: string;
  public product: ProductInterface;
  public slug: string;
  public productProperties: any[];


  /**
   *
   * @param app
   * @param navParams
   * @param productService
   */
  constructor(private app:App, private navParams:NavParams, private productService: ProductService) {
    this.categoryTitle = '';
    this.product = <ProductInterface>{};
    this.productProperties = [];
  }


  /**
   *
   */
  ionViewDidLoad() {
    this.product = this.navParams.get('product');
    this.slug = this.navParams.get('slug');
    this.buildProductProps(this.navParams.get('properties'));
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
   * @param categoryProperties
   */
  private buildProductProps(categoryProperties) {
    let productValues = this.product['property_values'];
    this.productProperties = this.productService.getProperties(categoryProperties, productValues);
  }


}