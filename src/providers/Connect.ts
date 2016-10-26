/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network } from 'ionic-native';



@Injectable()
export class Connect {


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
     * @returns {any}
     */
    load(type, url) {

        let typeFormatted: string = type.toUpperCase();
        let urlFormatted = this.changeUrlForRealDevice(url);

        this.promise = new Promise((resolve, reject) => {

            let httpPromise: any = null;
            switch (typeFormatted) {
                case 'GET':
                    httpPromise = this.get(urlFormatted);
                    break;
                case 'POST':
                    httpPromise = this.post(urlFormatted);
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
    get(url) {
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
     * @returns {string}
     */
    post(url) {
        return 'POST';
    }


    /**
     *
     * @returns {boolean}
     */
    noConnection() {
        return (Network.connection === 'none');
    }


    /**
     *
     * @param title
     * @param subTitle
     * @param message
     */
    showErrorAlert(title: string = 'Ошибка загрузки', subTitle: string = 'Не удается загрузить страницу, попробуйте позже!', message?: string ) {

        if (this.noConnection()) {
            subTitle = 'Проверьте соединение с интернетом!'
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
    private changeUrlForRealDevice(url: string) {
        if ('cordova' in window) {
            return 'http://api.roscontrol.com' + url;
        }
        return url;
    }


}