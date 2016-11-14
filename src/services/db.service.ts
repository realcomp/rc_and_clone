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
export class DbService {


    /**
     *
     * @param connect
     */
    constructor(private connect: ConnectService) {}


    /**
     *
     * @returns {Promise<T>}
     */
    public updateDbVersion(): any {

        let versionUpdated = false;

        return new Promise((resolve, reject) => {
            this.getDbInfo().then((data) => {
                    let version: number = data.version;
                    let localVersion = this.getLocalDbVersion();
                    if(localVersion == null || version > localVersion) {
                        this.setLocalDbVersion(version);
                        versionUpdated = true;
                    }
                    resolve(versionUpdated);

                },
                (error) => {
                    reject(`Error: ${error}`);
                }
            );
        })
    }


    /**
     *
     * @returns {Promise<T>}
     */
    public getDbInfo(): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.db.info);
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
     * @returns {*}
     */
    public getLocalDbVersion(): number {
        return LocalStorage.get('dbVersion');
    }


    /**
     *
     * @param version
     */
    public setLocalDbVersion(version:number): void {
        LocalStorage.set('dbVersion', version);
    }

}
