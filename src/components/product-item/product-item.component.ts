/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ProductItemInterface } from '../../interfaces/productItem.interface';
import { ProductService } from '../../services/product.service';
import { ModalService } from '../../services/modal.service';
import { UserService } from '../../services/user.service';
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
    @Input() votesProducts: number[];


    public type: string;
    public isVoted: boolean;


    /**
     *
     * @param navCtrl
     * @param productService
     * @param userService
     * @param modalService
     */
    constructor(
        protected navCtrl: NavController,
        protected productService: ProductService,
        protected userService: UserService,
        protected modalService: ModalService) {
        this.isVoted = false;
    }


    /**
     *
     */
    public ngAfterContentInit(): void {
        this.setProductType();
        this.setVoted();
    }



    /**
     *
     */
    public handlerSelect(): void {
        this.goToProductPage();
    }


    /**
     *
     * @param event
     */
    public handlerClickVoteProduct(event: any): void {
        event.stopPropagation();
        if(this.userService.isAuth()) {
            if(!this.isVoted) {
                let id: number = this.product.id;
                this.userService.addVoteProduct([[id, 1]]);
                this.userService.updateVotesProductsInStorage(id);
                this.isVoted = true;
            }
        }
        else {
            this.presentAuthModal();
        }
    }


    /**
     *
     */
    protected presentAuthModal(): void {
        this.modalService.createAuthModal({});
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


    /**
     *
     */
    protected setProductType(): void {
        if(this.productService.isWaitProduct(this.product.tested)) {
            this.type = 'wait';
        }
    }


    /**
     *
     */
    protected setVoted(): void {
        this.isVoted = this.votesProducts.indexOf(this.product.id) > -1;
    }


}

