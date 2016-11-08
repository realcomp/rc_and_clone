/**
 * Created by maxim on 18.10.16.
 */


'use strict';


import { Component, ViewChild } from '@angular/core';
import { Platform, Searchbar } from 'ionic-angular';

import { Utils } from '../../libs/Utils';
import { UrlManager } from '../../libs/UrlManager';
import { API } from '../../config/';
import { ConnectService } from '../../services/connect.service';

import { ProductPage } from '../product/product';


@Component({
    selector: 'page-search',
    templateUrl: 'search.html'
})


export class SearchPage {


    @ViewChild('searchbar') searchbar:Searchbar;


    public inputSearchValue: string;
    public products: Array<any>;
    public ratings: any[];
    public productsEmpty: boolean;
    public categories: any;
    public segment: string;
    public currentCategory: any;
    public title: string;

    private limit: number;
    private offset: number;
    private startedSearch: boolean;


    /**
     *
     * @param connect
     * @param platform
     */
    constructor(private connect:ConnectService, private platform:Platform) {
        this.inputSearchValue = '';

        this.products = [];
        this.ratings = [];
        this.productsEmpty = false;
        this.categories = {};
        this.currentCategory = {};
        this.title = '';

        this.limit = 100;
        this.offset = 0;
        this.startedSearch = false;
    }


    /**
     *
     */
    ionViewDidEnter() {
        this.setFocus();
    }


    /**
     *
     * @param event
     */
    onInput(event): void {
        if(this.inputSearchValue.length >= 3 && !this.startedSearch) {
            this.doSearch();
        }
    }



    /**
     *
     */
    doSearch(): void {
        this.resetProducts();
        this.startedSearch = true;
        this.getProducts().then(
            (data) => {
                this.buildCategories(data['categories']);
                this.updateProducts(data['products']);
                this.startedSearch = false;
            },
            (error) => {
                this.startedSearch = false;
                this.connect.showErrorAlert();
                console.error(`Error: ${error}`);
            }
        );
    }


    /**
     * При клике на товар в списке поиска, получаем id его категории и пишем в currentCategory - текущую категорию товара
     * Далее currentCategory будет проброшен в компонент, как [category]="currentCategory"
     * После чего будет скорее всего осуществлен переход на страницу товара
     * @param id
     */
    setCurrentCategory(id: number): void {
        if(id in this.categories) {
            this.currentCategory = {
                name: this.categories[id]['name_sg'],
                properties: this.categories[id]['properties'],
                ratings: this.categories[id]['ratings']
            }
        }
    }



    /**
     *
     * @returns {Promise<T>}
     */
    private getProducts() {
        return new Promise((resolve, reject) => {
            let url = UrlManager.createUrlWithParams(API.search, {
                limit: this.limit,
                offset: this.offset,
                query: this.inputSearchValue
            });
            let promise = this.connect.load('get', url);
            promise.then((result) => {
                    let data = Utils.jsonParse(result['_body']);
                    let categories = data['data'][0];
                    let products = data['data'][1];
                    if(data != null) {
                        resolve({
                            categories,
                            products
                        });
                    }
                },
                (error) => {
                    reject(`Error: ${error}`);
                }
            );
        });
    }


    /**
     *
     * @param products
     */
    private updateProducts(products: any): void {
        this.products = this.sortingProducts(products);
        this.addSlugForProducts();
        this.productsEmpty = this.products.length == 0;
    }


    /**
     *
     */
    private resetProducts(): void {
        this.products = [];
    }


    /**
     *
     * @param products
     * @returns {any}
     */
    private sortingProducts(products: any) {
        products.sort(Utils.sortBy(
            {
                name: 'tested',
                reverse: true
            },
            {
                name: 'danger_level'
            },
            {
                name: 'rating',
                reverse: true
            }
        ));

        return products;

    }


    /**
     *
     * @param categories
     */
    private buildCategories(categories: any) {
        if(categories != null) {
            for(let category of categories) {
                this.categories[category.id] = {
                    'show_name_in_product_list': category['show_name_in_product_list'],
                    'name_sg': category['name_sg'],
                    properties: category['properties'],
                    ratings: category['ratings']
                }
            }
        }
    }


    /**
     *
     */
    private addSlugForProducts(): void {
        if(this.products.length === 0) {
            return;
        }
        for(let product of this.products) {
            let categoryId = product['category_id'];
            product['slug'] = '';
            if(categoryId in this.categories) {
                product['slug'] = this.categories[categoryId]['show_name_in_product_list'] ? this.categories[categoryId]['name_sg'] : '';
            }
        }

    }


    /**
     *
     */
    private setFocus(): void {
        this.platform.ready().then(() => {
            this.searchbar.setFocus();
            if ('cordova' in window) {
                window['cordova'].plugins.Keyboard.show();
            }
        });

    }


}
