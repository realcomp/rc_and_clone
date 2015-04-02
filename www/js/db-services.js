angular.module('db-services', ['db.config'])
// DB wrapper
.factory('DB', function($q, $http, DB_CONFIG) {
    var self = this;
    self.db = null;
    self.meta_server = null;
    self.meta_db = null;
    self.loaded = false;
 
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
 
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
 
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query).then(function(res){console.log(query);}, function(err){ console.error(err); });
            //console.log('Table ' + table.name + ' initialized');
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
                        return;
                    }

                    angular.forEach(DB_CONFIG.tables, function(table) {
                        self.query('DELETE FROM ' + table.name);
                    });

                    //console.log(resp.data);
                    self.load(self.meta_server);
                    self.loaded = true;
                    self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(result){
                            //console.log("result meta", result);
                        }, function(err){ console.error(err); });
                },
                function(err){
                    console.log(err);
                });
            }, function(err){console.error("META ",err);}
        );
    };

    /*
    ** загрузка базы из json
    */ 
    self.load = function(meta) {
        var url = meta.file;
        url = url.replace('http://api.roscontrol.com', '');
        //console.log("DEBUG url", url);
        $http.get(url).then(function(resp){
                var slices = resp.data.slices;
//                console.log(resp.data);

                angular.forEach(slices, function(slice){
//                    console.log(slice);
//                    console.log("slice type "+slice.entity_type);
                    if (slice.entity_type == 'category') {
                        console.log("slice", slice.min_id, slice.max_id);
                        self.slice_category(slice.data);
                    } else if (slice.entity_type == 'product') {
                        console.log("slice", slice.min_id, slice.max_id);
                        self.slice_product(slice.data);
                    } else if (slice.entity_type == 'company') {
                        console.log("slice", slice.min_id, slice.max_id);
                        self.slice_company(slice.data);
                    }
                });
                self.query('INSERT INTO metadata VALUES (?, "", "")', [meta.version]).then(function(res){console.log("INSERT VERSION "+meta.version);}, function(err){console.error("INSERT VERSION", err);});
            },
            function(err){
                console.log(err);
            }
        );
    };

    self.slice_category = function(data) {
        angular.forEach(data, function(category) {
            if (category.id == 0) {
                // пропускаем эту пустую категорию, чуваки не умеют работать с нестед деревом
                return;
            }

            var fields = [];
            var places = [];

            angular.forEach(DB_CONFIG.tables, function(table) {
                if (table.name == 'categories') {
                    angular.forEach(table.columns, function(column) {
                        fields.push(column.name);
                        places.push('?');
                    });
                    return false;
                }
            });

            var query = 'INSERT INTO categories ('+fields.join(',')+') VALUES ('+places.join(',')+')';
            var values = [
                category.id,
                category.root,
                category.lft,
                category.rgt,
                category.lvl,
                category.parent_id,
                category.disposable,
                category.position,
                category.product_count,
                category.subcat_count,
                category.show_brand,
                category.show_name_in_product_list,
                category.icon,
                category.background,
                category.name,
                JSON.stringify(category.price_postfix),
                JSON.stringify(category.rating_ids),
                JSON.stringify(category.highlighted_product_ids || [])
            ];
//            console.log(query, values);
            self.query(query, values).then(function(res){
                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });
        });
    };

    self.slice_product = function(data) {
        angular.forEach(data, function(product) {
            var fields = [];
            var places = [];

            angular.forEach(DB_CONFIG.tables, function(table) {
                if (table.name == 'products') {
                    angular.forEach(table.columns, function(column) {
                        fields.push(column.name);
                        places.push('?');
                    });
                    return false;
                }
            });

            var query = 'INSERT INTO products ('+fields.join(',')+') VALUES ('+places.join(',')+')';
            var values = [
                product.id,
                product.category_id,
                product.company_id,
                product.danger_level,
                product.rating,
                product.tested,
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
                    console.log("Insert " + res.insertId);
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
            return DB.fetchAll(result);
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

            var qtested = tested ? ' AND products.tested = \'true\' ' : '';
            DB.query('SELECT count(*) as count FROM products JOIN categories ON (products.category_id=categories.id) WHERE categories.root = ? AND categories.lft >= ? AND categories.rgt <= ?'+qtested, [cat.root, cat.lft, cat.rgt])
                .then(function(result){
                    count.count = DB.fetch(result).count;
                    //console.log("DEBUG count", count);
                    return count;
                });
            return count;
        });
    };

    return self;
})

// Resource service example
.factory('Product', function(DB) {
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

    return self;
});
