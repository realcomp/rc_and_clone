/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, NavController, ModalController, LoadingController, NavParams } from 'ionic-angular';

import { UserService } from '../../services/user.service';
import { TabsService } from '../../services/tabs.service';
import { ModalService } from '../../services/modal.service';

import { LoadingInterface } from '../../interfaces/loading.interface';


@Component({
    selector: 'page-edit-profile',
    templateUrl: 'edit-profile.html'
})


export class EditProfilePage implements LoadingInterface {


    public title: string;
    public messageError: string;
    public messageSuccess: string;
    public profile: any;

    private loading: any;

    /**
     *
     * @param app
     * @param modalCtrl
     * @param modalService
     * @param userService
     * @param navCtrl
     * @param navParams
     * @param loadingCtrl
     * @param tabsService
     */
    constructor(
        private app: App,
        private modalCtrl: ModalController,
        private modalService: ModalService,
        private userService: UserService,
        private navCtrl: NavController,
        private navParams: NavParams,
        private loadingCtrl: LoadingController,
        private tabsService: TabsService
    ) {
        this.title = 'Редактирование профиля';
        this.messageError = '';
        this.messageSuccess = '';
        this.profile = {};
    }


    /**
     *
     */
    public ionViewWillEnter(): void {
        this.profile = Object.assign({}, this.navParams.get('profile'));
        this.app.setTitle(this.title);
    }


    /**
     *
     */
    public showLoader(content?: string): void {
        this.loading = this.loadingCtrl.create({
            content: content || 'Сохранение профиля'
        });
        this.loading.present();
    }


    /**
     *
     */
    public hideLoader(): void {
        this.loading.dismissAll();
    }


    /**
     *
     */
    public handlerSaveProfileData(): void {
        let {first_name, last_name, phone, avatar} = this.profile;

        this.showLoader();
        this.cleanMessages();

        let promise = this.userService.updateUserInfo({
            first_name,
            last_name,
            phone,
            avatar
        });

        promise.then(
            (data) => {
                this.hideLoader();
                let updateProfile = this.navParams.get('updateProfile');
                if(typeof updateProfile === 'function') {
                    updateProfile(this.profile);
                }
                this.messageSuccess = 'Профиль успешно сохранен!';
                console.info('saved profile!');
            },
            (error) => {
                this.hideLoader();
                this.messageError = error;
                console.error(error);
            }
        );
    }


    /**
     *
     */
    private cleanMessages(): void {
        this.messageError = '';
        this.messageSuccess = '';
    }

}



