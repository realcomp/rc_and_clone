/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Utils } from '../../../libs/Utils';
import { ProductService } from '../../../services/product.service';

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
     * @param productService
     */
    constructor(private navCtrl:NavController, private productService: ProductService) {}


    /**
     *
     */
    ngOnInit(): void {
        this.setCountTestedText();
    }


    /**
     *
     */
    handlerSelect(): void {
        let { id, name, properties, ratings } = this.category;
        let subCount = Number(this.category.stats['subcategory_count']);
        let slug = this.productService.getSlug(this.category);

        if(subCount > 0) {
            this.goToCategoriesPage(id, name);
        }
        else {
            this.goToProductsPage(id, name, properties, ratings, slug);
        }
    }


    /**
     *
     * @param id
     * @param title
     */
    private goToCategoriesPage(id: number, title: string): void {
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
     * @param ratings
     * @param slug
     */
    private goToProductsPage(id: number, title: string, properties: any, ratings: any, slug?: string): void {
        this.navCtrl.push(ProductsPage, {
            id,
            title,
            properties,
            ratings,
            slug
        });
    }


    /**
     *
     */
    private setCountTestedText(): void {
        const count = this.category.stats['product_tested_count'];
        if(count === 0) {
            this.countTestedText = 'Ожидают проверки';
        }
        else {
            this.countTestedText = count + ' ' + Utils.declOfNum(count, ['тест', 'теста', 'тестов']);
        }
    }

}