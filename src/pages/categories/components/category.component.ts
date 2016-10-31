/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Utils } from '../../../libs/Utils';

import { CategoryInterface } from '../../../interfaces/category.interface';

import { ProductsPage } from '../../products/products';
import { CategoriesPage } from '../categories';


@Component({
    selector: 'category-component',
    templateUrl: 'category.component.html'
})


export class Category {


    @Input() category: CategoryInterface;


    public countTestedText: string;


    /**
     *
     * @param navCtrl
     */
    constructor(private navCtrl:NavController) {}


    /**
     *
     */
    ngOnInit() {
        this.setCountTestedText();
    }


    /**
     *
     */
    handlerSelect() {
        let { id, name, properties } = this.category;
        let subCount = Number(this.category.stats['subcategory_count']);
        let slug = this.category['show_brand'] ? this.category['name_sg'] : '';

        if(subCount > 0) {
            this.goToCategoriesPage(id, name);
        }
        else {
            this.goToProductsPage(id, name, properties, slug);
        }
    }


    /**
     *
     * @param id
     * @param title
     */
    private goToCategoriesPage(id: number, title: string) {
        this.navCtrl.push(CategoriesPage, {
            id,
            title
        });
    }


    /**
     *
     * @param id
     * @param title
     * @param properties
     * @param slug
     */
    private goToProductsPage(id: number, title: string, properties, slug?: string) {
        this.navCtrl.push(ProductsPage, {
            id,
            title,
            properties,
            slug
        });
    }


    /**
     *
     */
    private setCountTestedText() {
        const count = this.category.stats['product_tested_count'];
        if(count === 0) {
            this.countTestedText = 'Ожидают проверки';
        }
        else {
            this.countTestedText = count + ' ' + Utils.declOfNum(count, ['тест', 'теста', 'тестов']);
        }
    }

}
