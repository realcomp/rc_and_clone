/**
 * Created by maxim on 31.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';

import { API } from '../config/';
import { LocalStorage } from '../libs/LocalStorage';
import { UrlManager } from '../libs/UrlManager';
import { Utils } from '../libs/Utils';

import { ConnectService } from './connect.service';


@Injectable()
export class JournalService {


    /**
     *
     */
    constructor(private connect: ConnectService) {}


    /**
     *
     * @returns {Promise<T>}
     */
    public getRubricsAndCategories(): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.rubricsAndCategories);
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    if (data != null) {
                        resolve(data);
                    }
                },
                (error) => {
                    reject(`Error: ${error}`);
                }
            );
        });
    }


    /**
     *
     * @param rubrics
     */
    public setRubrics(rubrics: any[]): void {
        rubrics.unshift({
            rubric: null,
            name: 'Все'
        });
        LocalStorage.set('rubrics', rubrics);
    }



    public getRubrics() {

    }


    public getCategories() {

    }


    /**
     *
     * @param categories
     */
    public setCategories(categories: any[]): void {
        categories.unshift({
            id: null,
            name: 'Все'
        });
        LocalStorage.set('categories', categories);
    }

}
