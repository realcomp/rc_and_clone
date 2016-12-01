import { Component} from '@angular/core';
import { Platform } from 'ionic-angular';
import { Splashscreen, StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { LocalStorage } from '../libs/LocalStorage';
import { DbService } from '../services/db.service';
import { JournalService } from '../services/journal.service';
import { UserService } from '../services/user.service';


@Component({
    templateUrl: 'app.template.html',
})


export class App {


    public rootPage: any;
    private prevLaunched: any;


    /**
     *
     * @param platform
     * @param dbService
     * @param userService
     * @param journalService
     */
    constructor(
        private platform: Platform,
        private dbService: DbService,
        private userService: UserService,
        private journalService: JournalService) {

        // Call any initial plugins when ready
        platform.ready().then(() => {
            StatusBar.overlaysWebView(true); // let status bar overlay webview
            StatusBar.backgroundColorByHexString('#a32630'); // set status bar to white
            Splashscreen.hide();
        });

        // Use TutorialPage for fist launch app
        this.prevLaunched = LocalStorage.get('prevLaunchApp');
        if (!this.prevLaunched) {
            this.rootPage = TutorialPage;
            LocalStorage.set('prevLaunchApp', 1);
        }
        else {
            this.rootPage = TabsPage;
        }
        this.prepareData();
    }


    /**
     *
     */
    private prepareData(): void {


        // Votes products for auth user
        if(this.userService.isAuth()) {
            this.userService.setVotesProductsInStorage();
        }


        // Update Db Version
        this.dbService.updateDbVersion().then(
            (updated) => {
                if (updated) {

                    // Journal
                    this.journalService.getRubricsAndCategories().then(
                        (data) => {
                            if (data['rubrics'] != null) {
                                this.journalService.setRubrics(data['rubrics']);
                            }
                            if (data['categories'] != null) {
                                this.journalService.setCategories(data['categories']);
                            }
                        },
                        (err) => {
                            console.error(err);
                        });
                }
            },
            (error) => {
                console.error(`Error: ${error}`);
            }
        );

    }

}
