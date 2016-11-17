/**
 * Created by maxim on 31.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';
import { LocalStorage } from '../libs/LocalStorage';


@Injectable()
export class TabsService {


    /**
     *
     */
    constructor() {}


    /**
     *
     * @param index
     */
    public setIndexActiveTab(index: number): void {
        LocalStorage.set('indexActiveTab', String(index));
    }


    /**
     *
     * @returns {any}
     */
    public getIndexActiveTab(): number {
        return Number(LocalStorage.get('indexActiveTab'));
    }


    /**
     *
     * @param context
     * @param index
     */
    public selectTab(context, index: number = this.getIndexActiveTab()): void {
        context.navCtrl.parent.select(index);
    }

}
