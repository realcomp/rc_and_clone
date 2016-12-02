/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { ProductItemInterface } from '../../../../interfaces/productItem.interface';
import { ProductItem } from '../../../../components/product-item/product-item.component';

import { ProductService } from '../../../../services/product.service';
import { ModalService } from '../../../../services/modal.service';
import { UserService } from '../../../../services/user.service';

import { ProductPage } from '../../../../pages/product/product';


@Component({
    selector: 'product-item-search-component',
    templateUrl: 'product-item-search.component.html'
})


export class ProductItemSearch extends ProductItem {


    @Input() product: ProductItemInterface;
    @Input() category;
    @Input() votesProducts: number[];


    /**
     *
     * @param navCtrl
     * @param productService
     * @param userService
     * @param modalService
     */
    constructor(protected navCtrl:NavController,
                protected productService: ProductService,
                protected userService: UserService,
                protected modalService: ModalService,
                protected toastCtrl: ToastController) {
        super(navCtrl, productService, userService, modalService, toastCtrl);
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
                isVoted: this.isVoted,
                slug: product.slug,
                categoryTitle: this.category.name,
                properties: this.category.properties
            });
        }, 0);
    }


}

