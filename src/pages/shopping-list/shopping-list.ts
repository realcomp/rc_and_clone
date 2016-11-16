/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component } from '@angular/core';
import { App, NavController, ModalController } from 'ionic-angular';

import { UserService } from '../../services/user.service';
import { TabsPage } from '../../pages/tabs/tabs';


@Component({
    selector: 'page-shopping-list',
    templateUrl: 'shopping-list.html'
})


export class ShoppingListPage {


    public title: string;


    /**
     *
     * @param app
     * @param modalCtrl
     * @param userService
     * @param navCtrl
     */
    constructor(private app: App, public modalCtrl: ModalController, private userService: UserService, private navCtrl: NavController) {
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
                this.app.getRootNav().push(TabsPage);
            }
        });
    }

}
