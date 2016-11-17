/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { UserService } from '../../services/user.service';
import { TabsService } from '../../services/tabs.service';


@Component({
    selector: 'page-shopping-list',
    templateUrl: 'shopping-list.html'
})


export class ShoppingListPage {


    public title: string;


    /**
     *
     * @param modalCtrl
     * @param userService
     * @param navCtrl
     * @param tabsService
     */
    constructor(
        private modalCtrl: ModalController,
        private userService: UserService,
        private navCtrl: NavController,
        private tabsService: TabsService) {
    }


    /**
     *
     */
    public ionViewWillEnter(): void {
        if (this.isAuth()) {
            this.title = 'Список покупок';
        }
        else {
            this.presentAuthModal();
        }
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
    private presentAuthModal(): void {
        this.userService.createAuthModal({
            title: 'Авторизация',
            subTitle: 'Для использования списка покупок войдите на сайт',
            callback: () => {
                this.tabsService.selectTab(this);
            }
        });
    }

}
