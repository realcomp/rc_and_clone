/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProductItemInterface } from '../../../../interfaces/productItem.interface';
import { ProductService } from '../../../../services/product.service';
import { ProductItem } from '../../../../components/product-item/product-item.component';

import { ProductPage } from '../../../../pages/product/product';


@Component({
    selector: 'product-item-search-component',
    templateUrl: 'product-item-search.component.html'
})


export class ProductItemSearch extends ProductItem {


    @Input() product: ProductItemInterface;
    @Input() category;


    /**
     *
     * @param navCtrl
     * @param productService
     */
    constructor(protected navCtrl: NavController, protected productService: ProductService) {
        super(navCtrl, productService);
    }


    /**
     *
     */
    protected goToProductPage(): void {
        let product = this.product;
        setTimeout(() => {
            this.navCtrl.push(ProductPage, {
                product,
                ratings: this.category.ratings,
                slug: product.slug,
                categoryTitle: this.category.name,
                properties: this.category.properties
            });
        }, 0);
    }


}

