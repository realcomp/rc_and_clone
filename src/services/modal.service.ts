/**
 * Created by maxim on 31.10.16.
 */


'use strict';


import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { AuthModal } from '../components/auth-modal/auth-modal.component';


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
        this.modalCtrl.create(AuthModal, options).present();
    }

}