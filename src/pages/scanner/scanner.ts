import { Component } from '@angular/core';

import { PopoverController, AlertController, Platform } from 'ionic-angular';


@Component({
    selector: 'page-scanner',
    templateUrl: 'scanner.html'
})


export class ScannerPage {


    /**
     *
     * @param platform
     * @param alertCtrl
     */
    constructor(private platform:Platform, private alertCtrl: AlertController) {}


    /**
     *
     */
    public scan(): void {
        this.platform.ready().then(() => {
            if ('cordova' in window) {
                window['cordova'].plugins.barcodeScanner.scan((result) => {
                    let alert = this.alertCtrl.create({
                        title: 'Scan Results',
                        subTitle: result.text,
                        buttons: [{
                            text: 'Ок',
                        }]
                    });
                    alert.present();
                }, (error) => {
                    let alert = this.alertCtrl.create({
                        title: 'Attention',
                        subTitle: error,
                        buttons: [{
                            text: 'Ок',
                        }]
                    });
                    alert.present();
                });
            }
            else {
                console.warn('Scanner supported only real devices!')
            }
        });
    }

}
