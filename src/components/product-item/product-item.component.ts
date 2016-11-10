/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

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
    @Input() properties: any[];
    @Input() ratings: any[];


    /**
     *
     * @param navCtrl
     */
    constructor(protected navCtrl:NavController) {}


    /**
     *
     */
    public handlerSelect(): void {
        this.goToProductPage();
    }


    /**
     *
     */
    protected goToProductPage(): void {
        let product = this.product;
        let ratings: any = this.ratings;
        this.navCtrl.push(ProductPage, {
            product,
            ratings,
            slug: this.slug,
            categoryTitle: this.categoryTitle,
            properties: this.properties
        });
    }

}

