/**
 * Created by PhpStorm.
 * User: maxim
 * Date: 18.10.16
 * Time: 15:49
 */

'use strict';


export const API = {
    categories: '/v1/catalog/categories',
    products: '/v1/catalog/products',
    articles: '/v1/articles',
    rubricsAndCategories: '/v1/articles/rubrics_and_categories',
    reviews: '/v1/catalog/reviews',
    barcode: '/v1/barcode/product',
    search: '/v1/catalog/search',

    user: {
        authForEmail: 'v1/auth/email',
        register: '/v1/user/register',
        profile: '/v1/user/profile',
        votes: '/v1/votes/products',

    },

    db: {
        info: '/v1/catalog/info'
    }
}
