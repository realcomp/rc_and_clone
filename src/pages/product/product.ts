import { Component } from '@angular/core';
import { App, NavParams } from 'ionic-angular';

import { ProductInterface } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'page-product',
    templateUrl: 'product.html'
})


export class ProductPage {


    public categoryTitle: string;
    public product: ProductInterface;
    public slug: string;
    public isVoted: boolean;
    public productProperties: any[];
    public productRatings: any[];


    /**
     *
     * @param app
     * @param navParams
     * @param productService
     * @param userService
     * @param modalService
     */
    constructor(
        private app: App,
        private navParams: NavParams,
        private productService: ProductService,
        private userService: UserService,
        private modalService: ModalService)
    {
        this.categoryTitle = '';
        this.product = <ProductInterface>{};
        this.productProperties = [];
        this.productRatings = [];
    }


    /**
     *
     */
    public ionViewDidLoad(): void {
        this.product = this.navParams.get('product');
        this.slug = this.navParams.get('slug');
        this.isVoted = this.navParams.get('isVoted');
        this.buildProductProps(this.navParams.get('properties'));
        this.buildProductRatings(this.navParams.get('ratings'))
    }


    /**
     *
     */
    public ionViewWillEnter(): void {
        this.categoryTitle = this.navParams.get('categoryTitle');
        this.app.setTitle(this.categoryTitle);
    }


    /**
     *
     */
    public openPopupAddReview(): void {
        if(this.userService.isAuth()) {
            this.modalService.createReviewModal({
                product_id: this.product.id
            });
        }
        else {
            this.modalService.createAuthModal({
                subTitle: 'Войдите, чтобы оставить отзыв',
            });
        }
    }


    /**
     *
     * @param categoryProperties
     */
    private buildProductProps(categoryProperties): void {
        let productValues = this.product['property_values'];
        this.productProperties = this.productService.getProperties(categoryProperties, productValues);
    }


    /**
     *
     * @param categoryRatings
     */
    private buildProductRatings(categoryRatings): void {
        let productRatings = this.product['rating_values'];
        this.productRatings = this.productService.getRatingsCategoryAndProduct(categoryRatings, productRatings);
    }


}