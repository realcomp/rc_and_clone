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
                    let messageError: string = this.connect.getMessageError(result['_body'] , 'user_message');
                    if (!messageError) {
                        this.connect.showErrorAlert();
                    }
                    reject(messageError);
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


    /**
     *
     * @param data
     * @returns {Promise<T>}
     */
    public updateUserInfo(data: any): any {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.user.profile, {
                api_token: this.getToken()
            });

            let dataString: string = UrlManager.createUrlWithParams('', data).slice(1);

            let promise = this.connect.load('POST', url, dataString);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    resolve(data);
                },
                (result) => {
                    let messageError: string = this.connect.getMessageError(result['_body'] , 'user_message');
                    if (!messageError) {
                        this.connect.showErrorAlert();
                    }
                    reject(messageError);
                }
            );
        });
    }


}
