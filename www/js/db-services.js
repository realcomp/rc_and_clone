angular.module('db-services', ['db.config'])
// DB wrapper
.factory('DB', function($q, $http, DB_CONFIG) {
    var self = this;
    self.db = null;
    self.meta_server = null;
    self.meta_db = null;
    self.loaded = false;
    self.deferred = $q.defer();

    var ptables = {};

    self.loading = function() {
        return self.deferred.promise;
    };

    self.init = function() {
    	console.log('db init');
 
        if (window.cordova) {
            //console.log("use cordova sqlite");
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
            self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name});
//        self.db = window.openDB({name: DB_CONFIG.name});
        } else {
            //console.log("use open database");
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }
 
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
            ptables[table.name] = {places: [], fields: []};
 
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
                ptables[table.name].places.push('?');
                ptables[table.name].fields.push(column.name);
            });
 
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query).then(function(res){
                console.log(query);
                console.info('Table ' + table.name + ' initialized');
            }, function(err){ console.error(err); });
        });

        self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(res){
                var r = self.fetch(res);
                //console.log("META",r);

                if (r && r['version']) {
                    self.meta_db = r;
                    //console.log("METADB", self.meta_db);
                }

                $http.get('/v1/catalog/info').then(function(resp){
                    self.meta_server = resp.data;

                    if (self.meta_db && self.meta_db.version == self.meta_server.version) {
                        //console.log("version db eq with server "+self.meta_server.version);
                        self.loaded = true;
                        self.deferred.resolve({loaded: true});
                        return;
                    }

                    angular.forEach(DB_CONFIG.tables, function(table) {
                        self.query('DELETE FROM ' + table.name);
                    });

                    //console.log(resp.data);
                    self.load(self.meta_server);
                    console.log("loaded", self.loaded);
                    self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(result){
                            //console.log("result meta", result);
                        }, function(err){
                            self.deferred.resolve({loaded: false});
                            console.error(err);
                        });
                },
                function(err){
                    self.deferred.resolve({loaded: false});
                    console.log(err);
                });
            }, function(err){
                self.deferred.resolve({loaded: false});
                console.error("META ",err);
            }
        );

        return self.deferred.promise;
    };

    /*
    ** загрузка базы из json
    */ 
    self.load = function(meta) {
        console.info("Load db "+meta.file);
        var url = meta.file;
        url = url.replace('http://api.roscontrol.com', '');
        //console.log("DEBUG url", url);
        $http.get(url).then(function(resp){
                console.info("version "+resp.data.version, "full dump " + resp.data.full_dump);
                console.info("slices count "+resp.data.slices.length);
                var slices = resp.data.slices;
//                console.log(resp.data);

                angular.forEach(slices, function(slice){
//                    console.log(slice);
//                    console.log("slice type "+slice.entity_type, slice.min_id, slice.max_id);
                    if (slice.entity_type == 'category') {
                        self.slice_category(slice.data);
                    } else if (slice.entity_type == 'product') {
                        self.slice_product(slice.data);
                    } else if (slice.entity_type == 'company') {
                        self.slice_company(slice.data);
                    } else if (slice.entity_type == 'rating') {
                        self.slice_rating(slice.data);
                    }
                });

/*                console.info("recount data");
                // подсчет количества продуктов для категории
                // подсчет детей в категории
                self.query('SELECT * FROM categories').then(function(res){
                    var categories = self.fetchAll(res);
                    console.info("recount categories, count "+categories.length);
                    angular.forEach(categories, function(category){
                        // подсчет количества продуктов для категории
                        self.query('SELECT count(*) as count FROM products JOIN categories ON (products.category_id = categories.id) WHERE categories.root = ? AND categories.lft >= ? AND categories.rgt <= ?', [category.root, category.lft, category.rgt])
                        .then(function(res){
                            var count = self.fetch(res);
                            self.query('UPDATE categories SET product_count = ? WHERE id = ? AND product_count != ?', [count.count > 0 ? count.count : 0, category.id, count.count > 0 ? count.count : 0]);
                        });

                        // подсчет детей в категории
                        self.query('SELECT count(*) as count FROM categories WHERE categories.root = ? AND categories.lft > ? AND categories.rgt < ?', [category.root, category.lft, category.rgt])
                        .then(function(res){
                            var count = self.fetch(res);
                            self.query('UPDATE categories SET subcat_count = ? WHERE id = ? AND subcat_count != ?', [count.count > 0 ? count.count : 0, category.id, count.count > 0 ? count.count : 0]);
                        });
                    });
                });*/

                self.query('INSERT INTO metadata VALUES (?, "", "")', [meta.version]).then(
                    function(res){
                        console.log("INSERT VERSION "+meta.version);
                        self.deferred.resolve({loaded: true});
                        self.loaded = true;
                }, function(err){
                    console.error("INSERT VERSION", err);
                    self.deferred.resolve({loaded: false});
                });
            },
            function(err){
                console.log(err);
                self.deferred.resolve({loaded: false});
            }
        );
    };

    self.slice_category = function(data) {
        angular.forEach(data, function(category) {
            if (category.id == 0) {
                // пропускаем эту пустую категорию, чуваки не умеют работать с нестед деревом
                return;
            }

            var tname = 'categories';
            var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields.join(',')+') VALUES ('+ptables[tname].places.join(',')+')';
            var values = [
                category.id,
                category.root,
                category.lft,
                category.rgt,
                category.lvl,
                category.parent_id,
                category.disposable == true ? 1 : 0,
                category.position,
                'stats' in category && 'product_count' in category['stats'] ? category['stats']['product_count'] : 0,
                'stats' in category && 'subcategory_count' in category['stats'] ? category['stats']['subcategory_count'] : 0,
                category.show_brand == true ? 1 : 0,
                category.show_name_in_product_list == true ? 1 : 0,
                category.icon ? category.icon : '',
                category.background ? category.background : '',
                category.name,
                JSON.stringify(category.price_postfix),
                JSON.stringify(category.rating_ids),
                JSON.stringify(category.highlighted_product_ids || [])
            ];
//            console.log(query, values);
            self.query(query, values).then(function(res){
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });
        });
    };

    self.slice_product = function(data) {
        angular.forEach(data, function(product) {
            var tname = 'products';
            var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields.join(',')+') VALUES ('+ptables[tname].places.join(',')+')';
            var values = [
                product.id,
                product.category_id,
                product.company_id,
                product.danger_level,
                product.rating,
                product.tested == true ? 1 : 0,
                product.price,
                product.name,
                product.thumbnail,
                product.images
            ];
//            console.log(query, values);
            self.query(query, values).then(function(res){
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });
        });
    };

    self.slice_company = function(data) {
        angular.forEach(data, function(company) {
            var query = 'INSERT INTO companies (id,name) VALUES (?,?)';
            var values = [
                company.id,
                company.name,
            ];
//            console.log(query, values);
            self.query(query, values).then(function(res){
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });
        });
    };

    self.slice_rating = function(data) {
        angular.forEach(data, function(rating) {
            var query = 'INSERT INTO ratings (id,name) VALUES (?,?)';
            var values = [
                rating.id,
                rating.name,
            ];
//            console.log(query, values);
            self.query(query, values).then(function(res){
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });
        });
    };

    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
 
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                deferred.reject(error);
            });
        });
 
        return deferred.promise;
    };
 
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
 
    self.fetch = function(result) {
      if (result.rows.length) {
          return result.rows.item(0);
      }

      return result.rows.item;
    };
 
    return self;
})

// Resource service example
.factory('Category', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM categories')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM categories WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.roots = function() {
        return DB.query('SELECT * FROM categories WHERE lvl = 0')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.countProducts = function(id, tested) {
        return DB.query('SELECT lft,rgt,root FROM categories WHERE id = ?', [id])
        .then(function(result){
            var count = {'count': 0};
            var cat = DB.fetch(result);
            //console.log("DEBUG cat", cat);

            if (!cat || !cat['lft']) {
                return count;
            }

            var qtested = tested ? ' AND products.tested = 1 ' : '';
            DB.query('SELECT count(*) as count FROM products JOIN categories ON (products.category_id=categories.id) WHERE categories.root = ? AND categories.lft >= ? AND categories.rgt <= ?'+qtested, [cat.root, cat.lft, cat.rgt])
                .then(function(result){
                    count.count = DB.fetch(result).count;
                    //console.log("DEBUG count", count);
                    return count;
                });
            return count;
        });
    };

    self.countProductsByObj = function(category, tested) {
        var qtested = tested ? ' AND products.tested = 1 ' : '';
        var sql = 'SELECT count(*) as count FROM products JOIN categories ON (products.category_id=categories.id) WHERE categories.root = ? AND categories.lft >= ? AND categories.rgt <= ?' + qtested;
//        console.log(sql, [category.root, category.lft, category.rgt]);
        return DB.query(sql, [category.root, category.lft, category.rgt])
            .then(function(result){
                return DB.fetch(result);
            });
    };

    /*
     * получить дочерние каталоги по ид родителя, но лучше вызывать childsByObj
    **/
    self.childsById = function(id, lvl) {
        var params = [id, id, id];
        var w = '';

        if (lvl) {
            w = ' AND lvl = (SELECT lvl + ? FROM categories WHERE id = ?)';
            params.push(lvl, id);
        }

        return DB.query('SELECT * FROM categories WHERE root = (SELECT root FROM categories WHERE id = ?) AND lft > (SELECT lft FROM categories WHERE id = ?) AND rgt < (SELECT rgt FROM categories WHERE id = ?)'
            + w + ' ORDER BY lft', params)
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    /*
     * получить дочерние каталоги по объекту родителя
    **/
    self.childsByObj = function(category, lvl) {
        var params = [category.root, category.lft, category.rgt];
        var w = '';

        if (lvl) {
            w = ' AND lvl = ?';
            params.push(lvl);
        }

        return DB.query('SELECT * FROM categories WHERE root = ? AND lft > ? AND rgt < ?' + w + ' ORDER BY lft', params)
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    return self;
})

// Resource service example
.factory('Product', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM products')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getByCategoryId = function(id) {
        return DB.query('SELECT * FROM products WHERE category_id = ?', [id])
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM products WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    return self;
})

// Resource service example
.factory('Company', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM companies')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM companies WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    return self;
})

// Resource service example
.factory('Rating', function(DB) {
    var self = this;

    self.all = function() {
        return DB.query('SELECT * FROM ratings ORDER BY id')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM ratings WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    return self;
});
