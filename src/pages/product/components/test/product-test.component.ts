/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { ProductService } from '../../../../services/product.service';


@Component({
    selector: 'product-test-component',
    templateUrl: 'product-test.component.html'
})


export class ProductTest {


    @Input() product: any;
    @Input() ratings: any;


    /**
     *
     * @param productService
     */
    constructor(private productService: ProductService) {}


    /**
     *
     * @returns {boolean}
     */
    isFineProduct() {
        return this.productService.isFineProduct(this.product['tested'], this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    isDangerProduct() {
        return this.productService.isDangerProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    isBlackList() {
        return this.productService.isBlackListProduct(this.product['danger_level']);
    }



    /**
     *
     * @returns {boolean}
     */
    isWaitProduct() {
        return this.productService.isWaitProduct(this.product['tested']);
    }


}
