/**
 * Created by maxim on 31.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { AuthModal } from '../components/auth-modal/auth-modal.component';
import { ReviewModal } from '../components/review-modal/review-modal.component';


@Injectable()
export class ModalService {


    /**
     *
     * @param modalCtrl
     */
    constructor(private modalCtrl: ModalController) {}


    /**
     *
     * @param options
     */
    public createAuthModal(options?: any): void {

        if(options.title == null) {
            options.title = 'Авторизация';
        }

        if(options.subTitle == null) {
            options.subTitle = 'Войдите для совершения действия';
        }

        this.modalCtrl.create(AuthModal, options).present();
    }


    /**
     *
     * @param options
     */
    public createReviewModal(options?: any): void {

        if(options.title == null) {
            options.title = 'Оценка товара';
        }

        this.modalCtrl.create(ReviewModal, options).present();
    }


}
