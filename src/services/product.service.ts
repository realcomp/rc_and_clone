/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';



@Injectable()
export class ProductService {


    /**
     *
     */
    constructor() {}


    /**
     *
     * @param dangerLevel
     * @returns {boolean}
     */
    isBlackListProduct(dangerLevel: number): boolean {
        return dangerLevel > 1;
    }


    /**
     *
     * @param dangerLevel
     * @returns {boolean}
     */
    isDangerProduct(dangerLevel: number): boolean {
        return dangerLevel === 1;
    }


    /**
     *
     * @param tested
     * @returns {boolean}
     */
    isWaitProduct(tested: boolean): boolean {
        return tested == false;
    }


    /**
     *
     * @param tested
     * @param dangerLevel
     * @returns {boolean}
     */
    isFineProduct(tested: boolean, dangerLevel: number): boolean {
        return tested && dangerLevel === 0;
    }


    /**
     *
     * @param categoryProperties
     * @param productValues
     * @returns {Array}
     */
    getProperties(categoryProperties: any, productValues: any): any[] {

        let properties = [];

        for(let sectionProperties of categoryProperties) {
            let currentProperties = {};
            currentProperties['name'] = sectionProperties['name'];
            if(sectionProperties['properties'] != null) {
                currentProperties['properties'] = [];
                for(let itemProperties of sectionProperties['properties']) {
                    let idProps = itemProperties['id'];
                    if(idProps in productValues) {
                        currentProperties['properties'].push({
                            name: itemProperties['name'],
                            value: productValues[idProps]
                        })
                    }
                }
            }
            properties.push(currentProperties);
        }

        return properties;
    }

}
