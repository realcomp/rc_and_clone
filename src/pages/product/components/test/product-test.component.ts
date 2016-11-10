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
    public isFineProduct(): boolean {
        return this.productService.isFineProduct(this.product['tested'], this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isDangerProduct(): boolean {
        return this.productService.isDangerProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isBlackList(): boolean {
        return this.productService.isBlackListProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isWaitProduct(): boolean {
        return this.productService.isWaitProduct(this.product['tested']);
    }


}
