angular.module('db.config', [])
.constant('DB_CONFIG', {
    name: 'PK1',
    tables: [
        {
            name: 'metadata',
            columns: [
                {name: 'version', type: 'integer primary key'},
                {name: 'uuid', type: 'text'},
                {name: 'plist', type: 'text'}
            ],
        },
        {
            name: 'categories',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'root', type: 'integer'},
                {name: 'lft', type: 'integer'},
                {name: 'rgt', type: 'integer'},
                {name: 'lvl', type: 'integer'},
                {name: 'parent_id', type: 'integer'},
                {name: 'disposable', type: 'integer'},
                {name: 'position', type: 'integer'},
                {name: 'product_count', type: 'integer'},
                {name: 'subcat_count', type: 'integer'},
                {name: 'show_brand', type: 'integer'},
                {name: 'show_name', type: 'integer'},
                {name: 'icon', type: 'text'},
                {name: 'background', type: 'text'},
                {name: 'name', type: 'text'},
                {name: 'price_postfix', type: 'text'},
                {name: 'rating_ids', type: 'text'},
                {name: 'highlighted_product_ids', type: 'text'}
            ],
        },
        {
            name: 'products',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'category_id', type: 'integer'},
                {name: 'company_id', type: 'integer'},
                {name: 'danger_level', type: 'integer'},
                {name: 'rating', type: 'integer'},
                {name: 'tested', type: 'integer'},
                {name: 'price', type: 'real'},
                {name: 'name', type: 'text'},
                {name: 'thumbnail', type: 'text'},
                {name: 'images', type: 'text'}
            ],
        },
        {
            name: 'companies',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'name', type: 'text'}
            ]
        }
    ]
});
