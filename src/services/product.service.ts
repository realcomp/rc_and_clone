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
    public isBlackListProduct(dangerLevel: number): boolean {
        return dangerLevel > 1;
    }


    /**
     *
     * @param dangerLevel
     * @returns {boolean}
     */
    public isDangerProduct(dangerLevel: number): boolean {
        return dangerLevel === 1;
    }


    /**
     *
     * @param tested
     * @returns {boolean}
     */
    public isWaitProduct(tested: boolean): boolean {
        return tested == false;
    }


    /**
     *
     * @param tested
     * @param dangerLevel
     * @returns {boolean}
     */
    public isFineProduct(tested: boolean, dangerLevel: number): boolean {
        return tested && dangerLevel === 0;
    }


    /**
     *
     * @param categoryProperties
     * @param productValues
     * @returns {Array}
     */
    public getProperties(categoryProperties: any, productValues: any): any[] {

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


    /**
     *
     * @param categoryRatings
     * @param productRatings
     * @returns {any[]}
     */
    public getRatingsCategoryAndProduct(categoryRatings: any, productRatings: any): any[] {
        let finalRatings: any[] = [];

        if(categoryRatings && productRatings) {
            for(let id in productRatings) {
                if(productRatings.hasOwnProperty(id)) {
                    let ratingsOject: any = {};
                    if(id in categoryRatings) {
                        ratingsOject['name'] = categoryRatings[id];
                        ratingsOject['value'] = productRatings[id];
                    }
                    finalRatings.push(ratingsOject);
                }
            }
        }

        return finalRatings;
    }


    /**
     *
     * @param category
     * @returns {any}
     */
    public getSlug(category: any): string {
        return category['show_name_in_product_list'] ? category['name'] : '';
    }

}
