/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';


@Component({
    selector: 'product-props-component',
    templateUrl: 'product-props.component.html',
})


export class ProductProps {


    @Input() properties: any[];


    constructor() {

    }

}
