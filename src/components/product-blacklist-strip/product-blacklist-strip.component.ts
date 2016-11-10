/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';


@Component({
    selector: 'product-blacklist-strip-component',
    templateUrl: 'product-blacklist-strip.component.html'
})


export class ProductBlackListStrip {


    @Input() dangerLevel: number;


    public dangerLevelText: string;
    public blackStrip: string[];


    /**
     *
     */
    constructor() {
        this.blackStrip = [];
    }


    /**
     *
     */
    public ngOnInit(): void {
        this.createStrip();
        this.dangerLevelText = this.getDangerLevelText(this.dangerLevel);
    }


    /**
     *
     */
    private createStrip(): void {
        for (let i = 1; i <= 4; i++) {
            let currentValue = this.dangerLevel >= i ? 'is-black': '';
            this.blackStrip.push(currentValue);
        }
    }


    /**
     *
     * @param level
     * @returns {string}
     */
    private getDangerLevelText(level: number): string {
        let dangerLevelText: string = '';

        switch (level) {
            case 1:
                dangerLevelText = 'Низкая'
                break;
            case 2:
                dangerLevelText = 'Средняя'
                break;
            case 3:
                dangerLevelText = 'Высокая'
                break;
            case 4:
                dangerLevelText = 'Максимальная'
                break;
        }

        return dangerLevelText;
    }
}
