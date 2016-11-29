/**
 * Created by maxim on 24.10.16.
 */


import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, LoadingController } from 'ionic-angular';

import { BasicModal } from '../basic-modal/basic-modal.component';
import { UserService } from '../../services/user.service';
import { LoadingInterface } from '../../interfaces/loading.interface';


@Component({
    selector: 'auth-modal-component',
    templateUrl: 'auth-modal.component.html'
})


export class AuthModal extends BasicModal implements LoadingInterface {


    public email: string;
    public password: string;
    public messageError: string;

    private loading: any;


    /**
     *
     * @param navCtrl
     * @param viewCtrl
     * @param navParams
     * @param userService
     * @param loadingCtrl
     */
    constructor(
        protected navCtrl: NavController,
        protected viewCtrl: ViewController,
        protected navParams: NavParams,
        private userService: UserService,
        private loadingCtrl: LoadingController) {
        super(navCtrl, viewCtrl, navParams);

        this.messageError = '';
        this.email = '';
        this.password = '';
    }


    /**
     *
     */
    public onAuthForEmail(): void {
        this.showLoader();
        let promise = this.userService.authForEmail(this.email, this.password);
        promise.then((result) => {
                this.messageError = '';
                this.hideLoader();
                this.close();
            },
            (error) => {
                this.hideLoader();
                this.messageError = error;
            }
        );
    }


    /**
     *
     */
    public showLoader(content?: string): void {
        this.loading = this.loadingCtrl.create({
            content: content || 'Авторизация...'
        });
        this.loading.present();
    }


    /**
     *
     */
    public hideLoader(): void {
        this.loading.dismissAll();
    }




}
