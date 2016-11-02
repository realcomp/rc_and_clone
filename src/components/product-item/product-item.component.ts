/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ProductService } from '../../services/product.service';
import { ProductItemInterface } from '../../interfaces/productItem.interface';

import { ProductPage } from '../../pages/product/product';


@Component({
    selector: 'product-item-component',
    templateUrl: 'product-item.component.html'
})


export class ProductItem {


    @Input() product: ProductItemInterface;
    @Input() slug: string;
    @Input() categoryTitle: string;
    @Input() properties: any;


    /**
     *
     * @param navCtrl
     */
    constructor(protected navCtrl:NavController) {}


    /**
     *
     */
    handlerSelect() {
        this.goToProductPage();
    }


    /**
     *
     */
    protected goToProductPage() {
        let product = this.product;
        this.navCtrl.push(ProductPage, {
            product,
            slug: this.slug,
            categoryTitle: this.categoryTitle,
            properties: this.properties
        });
    }


}

