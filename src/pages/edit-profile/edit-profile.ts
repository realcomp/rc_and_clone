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


export class EditProfilePage {


    public title: string;
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
        this.profile = {};
    }


    /**
     *
     */
    public ionViewWillEnter(): void {
        this.profile = this.navParams.get('profile');
        this.app.setTitle(this.title);


        console.log(this.profile);

    }



}



