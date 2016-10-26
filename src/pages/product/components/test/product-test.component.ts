/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { ProductServices } from '../../../../providers/ProductServices';


@Component({
    selector: 'product-test-component',
    templateUrl: 'product-test.component.html'
})


export class ProductTest {


    @Input() product: any;


    /**
     *
     * @param productServices
     */
    constructor(private productServices: ProductServices) {}


    /**
     *
     * @returns {boolean}
     */
    isFineProduct() {
        return this.productServices.isFineProduct(this.product['tested'], this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    isDangerProduct() {
        return this.productServices.isDangerProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    isBlackList() {
        return this.productServices.isBlackListProduct(this.product['danger_level']);
    }



    /**
     *
     * @returns {boolean}
     */
    isWaitProduct() {
        return this.productServices.isWaitProduct(this.product['tested']);
    }


}
