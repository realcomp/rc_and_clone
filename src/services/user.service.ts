/**
 * Created by maxim on 31.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { UrlManager } from '../libs/UrlManager';
import { API } from '../config/';
import { ConnectService } from './connect.service';
import { Utils } from '../libs/Utils';
import { LocalStorage } from '../libs/LocalStorage';



@Injectable()
export class UserService {


    /**
     *
     * @param modalCtrl
     * @param connect
     */
    constructor(private connect: ConnectService) {}


    /**
     *
     * @returns {boolean}
     */
    public isAuth(): boolean {
        return !!LocalStorage.get('api_token');
    }


    /**
     *
     */
    public logout(): void {
        LocalStorage.remove('api_token');
    }


    /**
     *
     * @returns {*}
     */
    public getToken(): any {
        return LocalStorage.get('api_token');
    }


    /**
     *
     * @param email
     * @param password
     * @returns {any}
     */
    public authForEmail(email: string, password: string): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.user.authForEmail, {
                email, password
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    if(data != null) {
                        LocalStorage.set('api_token', data['api_token']);
                        resolve(data);
                    }
                },
                (result) => {
                    let error: string = '';
                    if(typeof result['_body'] === 'string') {
                        let data = Utils.jsonParse(result['_body']);
                        if(data != null && data['user_message'] != null) {
                            error = data['user_message'];
                        }
                    }
                    else {
                        this.connect.showErrorAlert();
                    }
                    reject(error);
                }
            );
        });

    }


    /**
     *
     * @returns {Promise<T>}
     */
    public getUserInfo(): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.user.profile, {
                api_token: this.getToken()
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    resolve(data);
                },
                (error) => {
                    this.connect.showErrorAlert();
                    reject(`Error: ${error}`);
                }
            );
        });
    }


}
