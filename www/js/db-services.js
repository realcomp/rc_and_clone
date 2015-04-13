angular.module('db-services', ['db.config', 'ngCordova'])

// Resource service example
.factory('Url', function() {
    var self = this;

    self.url = function(url) {
        if (window.cordova) {
            return 'http://api.roscontrol.com' + url;
        }

        return url;
    };

    return self;
})

// DB wrapper
.factory('DB', function($q, $http, $rootScope, $cordovaSQLite, DB_CONFIG, Url) {
    var self = this;
	var load_slices = 0; // скоко загрузили
    var ptables = {};
	var count_slices = 0; // количество слайсев
    var percent_load = 0; // процент загрузки

    self.db = null;
    self.meta_server = null;
    self.meta_db = null;
    self.loaded = false;
    self.deferred = $q.defer();

    self.loading = function() {
        return self.deferred.promise;
    };

    self.getLoaded = function() {
        return self.loaded;
    };

    self.percentLoading = function() {
        if (self.loaded) {
            return 100;
        }

        return percent_load;
//        return count_slices ? parseInt(load_slices * 100 / count_slices) : 0;
    };

    self.inc_load_slices = function() {
        load_slices++;
        var pre = percent_load;
        percent_load = count_slices ? parseInt(load_slices * 100 / count_slices) : 0;

        if (pre != percent_load) {
            $rootScope.$broadcast('loadUpdate');
        }

        return load_slices;
    };

    self.init = function() {
        var init_deferred = $q.defer();
        var promise = init_deferred.promise;

    	console.log('db init');

        angular.forEach(DB_CONFIG.tables, function(table) {
            var places = [];
            var fields = [];
            ptables[table.name] = {places: '', fields: ''};
            angular.forEach(table.columns, function(column) {
                places.push('?');
                fields.push(column.name);
            });
            // оптимизация, чтоб не делать в каждом цикле слайса продукта и категории
            ptables[table.name].fields = fields.join(',');
            ptables[table.name].places = places.join(',');
        });

        if (window.cordova) {
            console.log("use cordova sqlite");
            window.plugins.sqlDB.copy(DB_CONFIG.name + '.sqlite', function() {
                self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name + '.sqlite'});
//                self.db = $cordovaSQLite.openDB(DB_CONFIG.name + '.sqlite');
//        self.db = window.openDB({name: DB_CONFIG.name + '.sqlite'});
                init_deferred.resolve();
            }, function (error) {
                console.error("There was an error copying the database: " + error);
                self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name + '.sqlite'});
//                self.db = $cordovaSQLite.openDB(DB_CONFIG.name + '.sqlite');
//                promise = self.create();
                init_deferred.resolve();
            });
        } else {
            console.log("use open database");
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
            promise = self.create();
        }

        promise.then(function(){
            self.check();
        });

        return self.deferred.promise;
    };

    self.create = function() {
        var create_deferred = $q.defer();
        var length = DB_CONFIG.tables.length;
        var count = 0;

        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
 
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
 
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query).then(function(res){
//                console.log(query);
                console.info('Table ' + table.name + ' created');
                count++;

                if (count == length) {
                    create_deferred.resolve({});
                }
            }, function(err){
                console.error("Error create table "+table.name, err);
                self.deferred.resolve({loaded: false});
            });
        });

        return create_deferred.promise;
    }

    self.check = function() {
        self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(res){
                var r = self.fetch(res);
                console.log("META",r);

                if (r && r['version']) {
                    self.meta_db = r;
                    //console.log("METADB", self.meta_db);
                }

console.log('GET '+Url.url('/v1/catalog/info'));
                $http.get(Url.url('/v1/catalog/info')).then(function(resp){
                    self.meta_server = resp.data;

                    if (!('version' in self.meta_server)) {
                        self.loaded = true;
                        console.error("not found version in meta info");
                        return;
                    }

                    if (self.meta_db && self.meta_db.version == self.meta_server.version) {
                        console.log("version db eq with server "+self.meta_server.version);
                        self.loaded = true;
                        console.log("DEBUG loaded true meta eq");
                        self.deferred.resolve({loaded: true});
                        return;
                    }

                    angular.forEach(DB_CONFIG.tables, function(table) {
                        self.query('DELETE FROM ' + table.name);
                    });

                    console.log(resp.data);
                    count_slices++;
                    self.load(self.meta_server);
                    self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(result){
                            //console.log("result meta", result);
                        }, function(err){
                            self.deferred.resolve({loaded: false});
                            console.error(err);
                        });
                },
                function(err){
                    self.loaded = true;
                    self.deferred.resolve({loaded: true});
                    console.error("Error loading "+Url.url('/v1/catalog/info'), err);
                });
            }, function(err){
                self.deferred.resolve({loaded: false});
                console.error("select META error",err);
            }
        );
    }

    /*
    ** загрузка базы из json
    */ 
    self.load = function(meta) {
        console.info("Load db "+meta.file);
        var url = meta.file;
        url = url.replace('http://api.roscontrol.com', '');
        //console.log("DEBUG url", url);
        $http.get(Url.url(url)).then(function(resp){
                var slices = resp.data.slices;
				count_slices += slices.length;
                console.info("version "+resp.data.version, "full dump " + resp.data.full_dump);
                console.info("slices count "+slices.length);
//                console.log(resp.data);
var count = 0;
var count_cat = 0;

                self.transaction(function(tx){
console.log("DEBUG tx");
                angular.forEach(slices, function(slice){
					count++;
//                    console.log(slice);
//                    console.log("slice type "+slice.entity_type, slice.min_id, slice.max_id);
					if (slice.data.length == 0) {
						//load_slices++;
                        self.inc_load_slices();
						return;
					}

                    if (slice.entity_type == 'category') {
						count_cat++;
                        self.slice_category(slice.data, tx);
//						console.log("cat data len", slice.data.length, count_cat);
                    } else if (slice.entity_type == 'product') {
                        self.slice_product(slice.data, tx);
                    } else if (slice.entity_type == 'company') {
                        self.slice_company(slice.data, tx);
                    } else if (slice.entity_type == 'rating') {
                        self.slice_rating(slice.data, tx);
                    }

                    self.inc_load_slices();
                });


				console.log("count slice", count);
				console.log("count cat slice", count_cat);
				console.info("slices end");
                    tx.executeSql('INSERT INTO metadata VALUES (?, "", "")', [meta.version], function(tx, res){
                        console.log("DEBUG loaded set true");
                        self.deferred.resolve({loaded: true});
                    });
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

/*                self.query('INSERT INTO metadata VALUES (?, "", "")', [meta.version]).then(
                    function(res){
                        console.log("INSERT VERSION "+meta.version);
                        self.loaded = true;
						//load_slices++;
                        self.inc_load_slices();
                        self.deferred.resolve({loaded: true});
                }, function(err){
                    console.error("INSERT VERSION", err);
                    self.deferred.resolve({loaded: false});
                });*/
            },
            function(err){
                console.error("Error load ", Url.url(url), err);
                self.deferred.resolve({loaded: false});
            }
        );
    };

    self.slice_category = function(data, tx) {
		var data_count = data.length;
		var count = 0;

        angular.forEach(data, function(category) {
            if (category.id == 0) {
                // пропускаем эту пустую категорию, чуваки не умеют работать с нестед деревом
                return;
            }

            var tname = 'categories';
            var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields+') VALUES ('+ptables[tname].places+')';
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
                JSON.stringify(category.highlighted_product_ids || []),
                'properties' in category && category.properties ? JSON.stringify(category.properties) : ''
            ];
//            console.log(query, values);
            tx.executeSql(query, values);
/*            self.query(query, values).then(function(res){
            tx.executeSql(query, values, function(res){
				count ++;

				if (count == data_count) {
					//load_slices++;
                    self.inc_load_slices();
//					console.log("data count", count, data_count, load_slices);
				}
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });*/
        });
    };

    self.slice_product = function(data, tx) {
		var data_count = data.length;
		var count = 0;

        angular.forEach(data, function(product) {
            var tname = 'products';
            var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields+') VALUES ('+ptables[tname].places+')';
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
                product.images,
                'test' in product && 'summary' in product.test && product.test.summary ? product.test.summary : '',
                'test' in product && 'pros' in product.test && product.test.pros ? product.test.pros : '',
                'test' in product && 'cons' in product.test && product.test.cons ? product.test.cons : ''
            ];
//            console.log(query, values);
            tx.executeSql(query, values);
/*            self.query(query, values).then(function(res){
				count ++;

				if (count == data_count) {
					//load_slices++;
                    self.inc_load_slices();
				}
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });*/

            if ('property_values' in product) {
                for (var property_id in product.property_values) {
//                    self.query('INSERT INTO product_properties (product_id, property_id, value) VALUES (?, ?, ?)', [product.id, property_id, product.property_values[property_id]]);
                    tx.executeSql('INSERT INTO product_properties (product_id, property_id, value) VALUES (?, ?, ?)', [product.id, property_id, product.property_values[property_id]]);
                }
            }

            if ('rating_values' in product) {
                for (var rating_id in product.rating_values) {
//                    self.query('INSERT INTO product_ratings (product_id, rating_id, value) VALUES (?, ?, ?)', [product.id, rating_id, product.rating_values[rating_id]]);
                    tx.executeSql('INSERT INTO product_ratings (product_id, rating_id, value) VALUES (?, ?, ?)', [product.id, rating_id, product.rating_values[rating_id]]);
                }
            }
        });
    };

    self.slice_company = function(data, tx) {
		var data_count = data.length;
		var count = 0;
        angular.forEach(data, function(company) {
            var query = 'INSERT INTO companies (id,name) VALUES (?,?)';
            var values = [
                company.id,
                company.name,
            ];
//            console.log(query, values);
            tx.executeSql(query, values);
/*            self.query(query, values).then(function(res){
				count ++;

				if (count == data_count) {
					//load_slices++;
                    self.inc_load_slices();
				}
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });*/
        });
    };

    self.slice_rating = function(data, tx) {
		var data_count = data.length;
		var count = 0;
        angular.forEach(data, function(rating) {
            var query = 'INSERT INTO ratings (id,name) VALUES (?,?)';
            var values = [
                rating.id,
                rating.name,
            ];
//            console.log(query, values);
            tx.executeSql(query, values);
/*            self.query(query, values).then(function(res){
				count ++;

				if (count == data_count) {
					load_slices++;
				}
//                    console.log("Insert " + res.insertId);
                }, function(err){
                    console.error(err);
                });*/
        });
    };

    self.transaction = function(cb) {
        return self.db.transaction(cb);
        var deferred = $q.defer();
 
        self.db.transaction(function(transaction) {
            console.log("DEBUG transaction");
            deferred.resolve(transaction);
        });
 
        return deferred.promise;
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
.factory('Product', function($http, DB, Url) {
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

    self.reviews = function(id, user_id, limit, offset) {
		var params = ['product_id='+id];

		if (limit) {
			params.push('limit=' + limit);
		}

		if (offset) {
			params.push('offset=' + offset);
		}

        return $http.get(Url.url('/v1/catalog/reviews?' + params.join('&')))
		.then(function(resp){
			return resp.data;
		});
    };

    self.properties = function(id) {
        return DB.query('SELECT * FROM product_properties WHERE product_id = ?', [id])
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.ratings = function(id) {
        return DB.query('SELECT * FROM product_ratings WHERE product_id = ?', [id])
        .then(function(result){
            return DB.fetchAll(result);
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
.factory('Rating', function(DB, $q) {
    var self = this;
    var gratings;

    self.allHash = function() {
        if (gratings) {
            var deferred = $q.defer();
            deferred.resolve(gratings);
            return deferred.promise;
        }

        return self.all().then(function(ratings){
            var r = {};
            angular.forEach(ratings, function(rating){
                r[rating.id] = rating;
            });
            gratings = r;
            return gratings;
        });
    };

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
})

// Resource service example
.factory('Article', function($http, Url) {
    var self = this;

    self.list = function(category_id, rubric, limit, offset) {
		var params = [];

		if (category_id) {
			params.push('category_id=' + category_id);
		}

		if (rubric) {
			params.push('rubric=' + rubric);
		}

		if (limit) {
			params.push('limit=' + limit);
		}

		if (offset) {
			params.push('offset=' + offset);
		}

        return $http.get(Url.url('/v1/articles' + params.length ? '?' + params.join('&') : ''))
		.then(function(resp){
			return resp.data;
		});
    };

    self.getById = function(id) {
        return $http.get('/v1/articles/' + id)
		.then(function(resp){
			return resp.data;
		});
    };

    return self;
})

// Resource service example
.factory('Authorization', function($http) {
    var self = this;

  	self.login = function(data) {
	  	return $http.get('/v1/auth/email?' + 'email=' + data.username + '&password=' + data.password).
	  		success(function(data, status, headers, config) {
	    		return data;
	  		}).error(function(status) {
		    return status;
		  });
  	};

  	self.logout = function(data) {

  	};

    return self;
});

