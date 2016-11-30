/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network } from 'ionic-native';

import { Utils } from '../libs/Utils';


@Injectable()
export class ConnectService {


    promise: any;


    /**
     *
     * @param http
     * @param alertCtrl
     */
    constructor(public http: Http, public alertCtrl: AlertController) {}


    /**
     *
     * @param type
     * @param url
     * @param data
     * @returns {any}
     */
    public load(type: string, url: string, data?: any): any {

        let typeFormatted: string = type.toUpperCase();
        let urlFormatted = this.formatUrlForRealDevice(url);

        this.promise = new Promise((resolve, reject) => {

            let httpPromise: any = null;
            switch (typeFormatted) {
                case 'GET':
                    httpPromise = this.get(urlFormatted);
                    break;
                case 'POST':
                    httpPromise = this.post(urlFormatted, data);
                    break;
                default :
                    console.warn(`type ${typeFormatted} not supported!`);
            }

            httpPromise.then( (result) => {
                    resolve(result);
                },
                (error) => {
                    reject(error);
                }
            );
        });

        return this.promise;
    }


    /**
     *
     * @param url
     * @returns {Promise<T>}
     */
    public get(url: string): any {
        return new Promise((resolve, reject) => {
            this.http.get(url)
                .subscribe((data) => {
                    resolve(data);
                }, (error) => {
                    reject(error);
                });
        });
    }


    /**
     *
     * @param url
     * @param data
     * @returns {Promise<T>}
     */
    public post(url: string, data: any): any {
        return new Promise((resolve, reject) => {
            this.http.post(url, data)
                .subscribe((data) => {
                    resolve(data);
                }, (error) => {
                    reject(error);
                });
        });
    }


    /**
     *
     * @returns {boolean}
     */
    public noConnection(): boolean {
        return (Network.connection === 'none');
    }


    /**
     *
     * @param body
     * @param field
     * @returns {string}
     */
    public getMessageError(body: any, field: string): string {
        let error: string = '';
        if(typeof body === 'string') {
            let data: any = Utils.jsonParse(body);
            if(data != null && data[field] != null) {
                error = data[field];
            }
        }
        return error;
    }



    /**
     *
     * @param title
     * @param subTitle
     * @param message
     */
    public showErrorAlert(title: string = 'Ошибка загрузки!', subTitle: string = 'Не удается загрузить данные, попробуйте позже.', message?: string ) {

        if (this.noConnection()) {
            subTitle = 'Не удается загрузить данные, потеряно соединение с интернетом';
        }

        const alert = this.alertCtrl.create({
            title,
            subTitle,
            buttons: [{
                text: 'Ок',
            }]
        });

        alert.present();
    }


    /**
     *
     * @param url
     * @returns {string}
     */
    private formatUrlForRealDevice(url: string) {
        if ('cordova' in window) {
            return 'http://api.roscontrol.com' + url;
        }
        return url;
    }


}