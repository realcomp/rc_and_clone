/**
 * Created by maxim on 24.10.16.
 */


import { Component, Input } from '@angular/core';

import { ModalService } from '../../../../services/modal.service';
import { UserService } from '../../../../services/user.service';
import { ProductService } from '../../../../services/product.service';


@Component({
    selector: 'product-test-component',
    templateUrl: 'product-test.component.html'
})


export class ProductTest {


    @Input() product: any;
    @Input() ratings: any;
    @Input() isVoted: boolean;


    /**
     *
     * @param productService
     * @param modalService
     * @param userService
     */
    constructor(private productService: ProductService, private modalService: ModalService, private userService: UserService) {}


    /**
     *
     * @returns {boolean}
     */
    public isFineProduct(): boolean {
        return this.productService.isFineProduct(this.product['tested'], this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isDangerProduct(): boolean {
        return this.productService.isDangerProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isBlackList(): boolean {
        return this.productService.isBlackListProduct(this.product['danger_level']);
    }


    /**
     *
     * @returns {boolean}
     */
    public isWaitProduct(): boolean {
        return this.productService.isWaitProduct(this.product['tested']);
    }


    /**
     *
     * @param event
     */
    public handlerClickVoteProduct(event: any): void {
        event.stopPropagation();
        if(this.userService.isAuth()) {
            if(!this.isVoted) {
                let id: number = this.product.id;
                this.userService.addVoteProduct([[id, 1]]);
                this.userService.updateVotesProductsInStorage(id);
                this.isVoted = true;
            }
        }
        else {
            this.presentAuthModal();
        }
    }


    /**
     *
     */
    private presentAuthModal(): void {
        this.modalService.createAuthModal({});
    }


}
