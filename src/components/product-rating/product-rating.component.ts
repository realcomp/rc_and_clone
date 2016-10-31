/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { ProductService } from '../../services/product.service';


@Component({
    selector: 'product-rating-component',
    templateUrl: 'product-rating.component.html'
})


export class ProductRating {


    @Input() dangerLevel: number;
    @Input() rating: number;
    @Input() tested: boolean;


    public cl: string;
    public rate: string;

    private classNameFine: string;
    private classNameDanger: string;
    private classNameWait: string;
    private classNameBlackList: string;


    /**
     *
     * @param productService
     */
    constructor(public productService:ProductService) {
        this.classNameFine = 'fine';
        this.classNameDanger = 'danger';
        this.classNameWait = 'wait';
        this.classNameBlackList = 'blacklist';
    }


    /**
     *
     */
    ngOnInit() {
       this.setClassAndRate();
    }


    /**
     *
     */
    private setClassAndRate() {

        if(this.productService.isWaitProduct(this.tested)) {
            this.cl = this.classNameWait;
            this.rate = '?';
        }

        else if(this.productService.isDangerProduct(this.dangerLevel)) {
            this.cl = this.classNameDanger;
            this.rate = String(this.rating);
        }

        else if(this.productService.isBlackListProduct(this.dangerLevel)) {
            this.cl = this.classNameBlackList;
            this.rate = '';
        }

        else  {
            this.cl = this.classNameFine;
            this.rate = String(this.rating);
        }
    }

}

