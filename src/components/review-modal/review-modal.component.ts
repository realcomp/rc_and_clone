/**
 * Created by maxim on 24.10.16.
 */


import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { BasicModal } from '../basic-modal/basic-modal.component';
import { UserService } from '../../services/user.service';


@Component({
    selector: 'review-modal-component',
    templateUrl: 'review-modal.component.html'
})


export class ReviewModal extends BasicModal {


    public product_id: number;
    public mark: number;
    public text: string;
    public advantages: string;
    public disadvantages: string;
    public practice: string;
    public messageError: string;


    /**
     *
     * @param navCtrl
     * @param viewCtrl
     * @param navParams
     * @param toastCtrl
     * @param userService
     */
    constructor(
        protected navCtrl: NavController,
        protected viewCtrl: ViewController,
        protected navParams: NavParams,
        private toastCtrl: ToastController,
        private userService: UserService) {
        super(navCtrl, viewCtrl, navParams);

        this.product_id = this.navParams.get('product_id');
        this.mark = 5;
        this.text = '';
        this.advantages = '';
        this.disadvantages = '';
        this.messageError = '';
    }


    /**
     *
     */
    public handlerAddReviewProduct(): void {
        this.userService.addReviewProduct({
            product_id: this.product_id,
            mark: this.mark,
            text: this.text,
            advantages: this.advantages,
            disadvantages: this.disadvantages,
            practice: this.practice
        }).then(
            (data) => {
                this.close();
                this.toastCtrl.create({
                    message: 'Спасибо за отзыв! Мы опубликуем его после проверки модератором',
                    duration: 5000,
                    showCloseButton: true,
                    closeButtonText: 'ок'
                }).present();
            },
            (error) => {
                this.messageError = error;
                console.error(error);
            }
        );
    }


}
