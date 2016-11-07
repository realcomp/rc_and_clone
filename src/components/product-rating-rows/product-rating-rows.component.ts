/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';


@Component({
    selector: 'product-rating-rows-component',
    templateUrl: 'product-rating-rows.component.html'
})


export class ProductRatingRows {


    @Input() ratings: any[];


    /**
     *
     */
    constructor() {}


}
