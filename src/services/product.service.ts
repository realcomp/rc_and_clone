/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';



@Injectable()
export class ProductService {



    constructor() {}


    /**
     *
     * @param dangerLevel
     * @returns {boolean}
     */
    isBlackListProduct(dangerLevel: number) {
        return dangerLevel > 1;
    }


    /**
     *
     * @param dangerLevel
     * @returns {boolean}
     */
    isDangerProduct(dangerLevel: number) {
        return dangerLevel === 1;
    }


    /**
     *
     * @param tested
     * @returns {boolean}
     */
    isWaitProduct(tested: boolean) {
        return tested == false;
    }


    /**
     *
     * @param tested
     * @param dangerLevel
     * @returns {boolean}
     */
    isFineProduct(tested: boolean, dangerLevel: number) {
        return tested && dangerLevel === 0;
    }



}