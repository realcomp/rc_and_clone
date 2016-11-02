/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ProductService } from '../../../../services/product.service';
import { ProductItemInterface } from '../../../../interfaces/productItem.interface';
import { ProductItem } from '../../../../components/product-item/product-item.component';

import { ProductPage } from '../../../../pages/product/product';


@Component({
    selector: 'product-item-search-component',
    templateUrl: 'product-item-search.component.html'
})


export class ProductItemSearch extends ProductItem {


    @Input() product: ProductItemInterface;


    /**
     *
     * @param navCtrl
     */
    constructor(protected navCtrl:NavController) {
        super(navCtrl);
    }


    /**
     *
     */
    protected goToProductPage() {
       console.log('ready go to page');
    }


}

