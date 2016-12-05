/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';

import { UserService } from '../../services/user.service';
import { TabsService } from '../../services/tabs.service';
import { ModalService } from '../../services/modal.service';

import { LoadingInterface } from '../../interfaces/loading.interface';
import { EditProfilePage } from '../../pages/edit-profile/edit-profile';


@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})


export class ProfilePage implements LoadingInterface {


    public title: string;
    public profile: any;

    private loading: any;


    /**
     *
     * @param modalService
     * @param userService
     * @param navCtrl
     * @param loadingCtrl
     * @param tabsService
     */
    constructor(
        private modalService: ModalService,
        private userService: UserService,
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private tabsService: TabsService
    ) {
        this.profile = {};
    }


    /**
     *
     */
    public ionViewWillEnter(): void {
        this.getProfile();
    }


    /**
     *
     * @returns {boolean}
     */
    public isAuth(): boolean {
        return this.userService.isAuth();
    }


    /**
     *
     */
    public showLoader(content?: string): void {
        this.loading = this.loadingCtrl.create({
            content: content || 'Получение профиля'
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
    public handlerClickEdit(): void {
        this.goToEditProfilePage();
    }


    /**
     *
     */
    public handlerClickLogout(): void {
        let confirmResult: boolean = confirm('Вы действительно хотите выйти из учетной записи?');
        if(confirmResult) {
            this.userService.logout();
            this.title = '';
            this.tabsService.selectTab(this);
        }
    }


    /**
     *
     */
    private presentAuthModal(): void {
        this.modalService.createAuthModal({
            subTitle: 'Войдите для просмотра профиля',
            callbackClick: () => {
                this.tabsService.selectTab(this);
            },
            success: ()=> {
                this.getProfile();
            },
        });
    }


    /**
     *
     */
    private getProfile(): void {
        if (this.isAuth()) {
            this.title = 'Мой профиль';
            if(Object.keys(this.profile).length === 0) {
                this.showLoader();
                let promise = this.userService.getUserInfo();
                promise.then(
                    (data) => {
                        this.hideLoader();
                        this.updateProfile(data);
                    },
                    (error) => {
                        this.hideLoader();
                        console.error(`Error: ${error}`);
                    }
                );
            }
        }
        else {
            this.presentAuthModal();
        }
    }


    /**
     *
     * @param profile
     */
    private updateProfile(profile: any): void {
        if(profile) {
            this.profile = profile;
            if(this.profile.avatar == null) {
                this.profile.avatar = 'assets/img/no-avatar.png';
            }
        }
    }


    /**
     *
     */
    private goToEditProfilePage(): void {
        this.navCtrl.push(EditProfilePage, {profile: this.profile, updateProfile: (profile: any) => {
            this.updateProfile(profile);
        }});
    }




}



