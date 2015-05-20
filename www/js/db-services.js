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
.factory('DB', function($q, $http, $rootScope, $cordovaSQLite, $timeout, $ionicPopup, DB_CONFIG, Url) {
    var self = this;
    var ptables = {};
	var load_slices = 0; // скоко загрузили
	var count_slices = 0; // количество слайсев
    var percent_load = 0; // процент загрузки
    var g_slices = null;      // слайсы которые нужно загрузить
    var pause = false;      // в каком режиме приложение (background)
    var slice_next_marker = 0;   // Маркер для получения следующей страницы результатов. Пустая строка, если это последняя страница
    var put_slice_without_timeout = false;

    self.db = null;
    self.meta_server = null;
    self.meta_db = {version: 0};
    self.loaded = true;
    self.deferred = $q.defer();

    /*
    * функа дергается при изменение состояния работы приложения
    */
    self.pause = function(flag) {
        pause = flag ? true : false;

        if (pause) {
//            self.put_slices();
        }
    };

    self.can_put_slice = function() {
        if (!pause) {
            return false;
        }

        return true;
    };

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

    self.alert = function(msg, title) {
        title = title || 'Ошибка!';
        var alertPopup = $ionicPopup.alert({
             title: title,
             template: msg
           });
           alertPopup.then(function(res) {
//             console.log('Thank you for not eating my delicious ice cream cone');
        });
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

    self.version = function() {
        return self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1')
        .then(function(result){
            return self.fetch(result);
        });
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

            if (!self.db) {
                console.error("Error: open database");
            }
        } else {
            console.log("use open database");
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
            promise = self.create();
        }

        // нужно только для создания базы, если вызвали create, она вызывается только в броузере
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

    /*
    * проверка версий локальной базы и на сервере
    */
    self.check = function() {
        self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(res){
                var r = self.fetch(res);
                console.log("META",r);

                if (r && r['version']) {
                    self.meta_db = r;
                    //console.log("METADB", self.meta_db);
                }

                console.log('GET '+Url.url('/v1/catalog/info?my_version=' + self.meta_db.version));
                $http.get(Url.url('/v1/catalog/info?my_version=' + self.meta_db.version)).then(function(resp){
                    self.meta_server = resp.data;

                    if (!('version' in self.meta_server)) {
                        self.loaded = true;
                        self.deferred.resolve({loaded: false});
                        console.error("not found version in meta info");
                        return;
                    }

                    if (self.meta_db.version >= self.meta_server.version) {
                        console.log("version db eq with server "+self.meta_server.version);
                        self.loaded = true;
                        console.log("DEBUG loaded true meta eq");
                        self.deferred.resolve({loaded: true});
                        return;
                    }

                    if (self.meta_server.prefer_full_dump == true) {
                        console.info("prefer_full_dump = "+self.meta_server.prefer_full_dump);

                        if (window.cordova) {
                            put_slice_without_timeout = false;
                            // запускаем загрузку части слайсов в бакграунде
                            self.load_slices();
                            self.loaded = true;
                            self.deferred.resolve({loaded: true});
                        } else {
                            angular.forEach(DB_CONFIG.tables, function(table) {
                                self.query('DELETE FROM ' + table.name);
                            });

                            console.log(resp.data);
                            count_slices++;
                            self.load_all(self.meta_server);
                        }
                    } else {
                        if (window.cordova) {
                            put_slice_without_timeout = false;
                            self.loaded = true;
                            self.deferred.resolve({loaded: true});
                        } else {
                            put_slice_without_timeout = true;
                        }

                        // запускаем загрузку части слайсов в бакграунде
                        self.load_slices();
                    }

                    return;

                    angular.forEach(DB_CONFIG.tables, function(table) {
                        self.query('DELETE FROM ' + table.name);
                    });

                    console.log(resp.data);
                    count_slices++;
                    self.load_all(self.meta_server);
                    self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(result){
                            //console.log("result meta", result);
                        }, function(err){
                            self.deferred.resolve({loaded: false});
                            console.error(err);
                        });
                },
                function(err){
                    console.error("Error loading "+Url.url('/v1/catalog/info'), err);
                    self.loaded = true;
                    self.deferred.resolve({loaded: true});
                });
            }, function(err){
                console.error("select META error", err);
                self.alert("Ошибка получения версии базы!");
                self.deferred.resolve({loaded: false});
            }
        );
    }

    /*
    ** загрузка базы из json
    */ 
    self.load_all = function(meta) {
        if (!meta || !('file' in meta) || !meta.file) {
            console.error("Error: not set meta file");
            self.deferred.resolve({loaded: false});
            return;
        }

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

                self.transaction(function(tx){
console.log("DEBUG tx");
                    angular.forEach(slices, function(slice){
                        self.put_slice(slice, false, tx);
                    });

//    				console.log("count slice", count);
//    				console.log("count cat slice", count_cat);
    				console.info("slices end");
                    tx.executeSql('INSERT INTO metadata VALUES (?, "", "")', [meta.version], function(tx, res){
                        self.query('SELECT * FROM metadata ORDER BY version DESC LIMIT 1').then(function(result){
                                //console.log("result meta", result);
                                console.log("DEBUG loaded set true");
                                self.deferred.resolve({loaded: true});
                            }, function(err){
                                self.deferred.resolve({loaded: false});
                                console.error(err);
                            });
                    }, function(transaction, error){
                        self.deferred.resolve({loaded: false});
                        console.error("Erro: insert into metadata", error);
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

    self.load_slices = function() {
        $http.get(Url.url('/v1/catalog/slices?version=' + self.meta_server.version + '&my_version=' + self.meta_db.version + (slice_next_marker ? '&marker=' + slice_next_marker : ''))).then(function(resp){
                if (!('data' in resp) || !('slices' in resp.data)) {
                    return;
                }

                g_slices = {};
                load_slices = 0; // скоко загрузили
                count_slices = 0; // количество слайсев
                percent_load = 0; // процент загрузки

                if ('next_marker' in resp.data && resp.data.next_marker > 0) {
                    slice_next_marker = resp.data.next_marker;
                } else {
                    slice_next_marker = 0;
                }

                angular.forEach(resp.data.slices, function(slice){
                    if (!g_slices[slice.entity_type]) {
                        g_slices[slice.entity_type] = [];
                    }

                    g_slices[slice.entity_type].push(slice);
                    count_slices++; // количество слайсев
                });

                $rootScope.$on('putSlice', function(event){
                    if (put_slice_without_timeout) {
                        self.put_slices();
//                        put_slice_without_timeout = false;
                    } else {
                        var timeout = pause ? 100 : 3000;
                        $timeout(function() {
                            self.put_slices();
                        }, timeout);
                    }
                });

                self.put_slices(true);
            },
            function(err){
                console.error("Error load slices", err);
                slice_next_marker = 0;
                if (!self.loaded) {
                    self.deferred.resolve({loaded: false});
                }
            }
        );
    };

    self.put_slices = function(force) {
    console.log("put_slices force", force);
        if (!g_slices) {
            if (!self.loaded) {
                self.loaded = true;
                self.deferred.resolve({loaded: true});
            }

            return;
        }

/*        if (!force && !pause) {
            if (!self.loaded) {
                self.loaded = true;
            }

console.log("put_slices not force and not pause", force, pause, self.loaded);
            self.deferred.resolve({loaded: true});
            return;
        }*/

        var stop = false;

        angular.forEach(['category', 'product', 'company', 'rating'], function(stype){
            if (stop) {
                return;
            }

            if (!(stype in g_slices)) {
                return;
            }
            if (!g_slices[stype]) {
                delete g_slices[stype];
                return;
            }
            if (!g_slices[stype].length) {
                g_slices[stype] = null;
                delete g_slices[stype];
                return;
            }

            stop = true;
//            while (g_slices[stype].length) {
                var slice = g_slices[stype].shift()

                self.transaction(function(tx){
                    self.put_slice(slice, true, tx, function(){$rootScope.$broadcast('putSlice');});
                });
//            };
        });

        if (!stop) {
            g_slices = null;

            if (slice_next_marker > 0) {
                // загрузили не все, продолжаем
                self.load_slices();
            } else {
                self.transaction(function(tx){
                    tx.executeSql('INSERT INTO metadata VALUES (?, "", "")', [self.meta_server.version], function(tx, res){
                        console.log("DEBUG loaded set true");
                        if (!self.loaded) {
                            self.loaded = true;
                            self.deferred.resolve({loaded: true});
                        }
                        $rootScope.$broadcast('dbUpdate');
                        tx.executeSql('DELETE FROM metadata WHERE version = ?', [self.meta_db.version]);
                        self.meta_db.version = self.meta_server.version;
                    });
                });
            }
        }
    };

    self.put_slice = function(slice, rdelete, tx, cb) {
console.log("put_slice", slice.entity_type);
        if (!slice || !('data' in slice) || !slice.data.length) {
            self.inc_load_slices();
            return;
        }

        if (slice.entity_type == 'category') {
            self.slice_category(slice, rdelete, tx, cb);
        } else if (slice.entity_type == 'product') {
            self.slice_product(slice, rdelete, tx, cb);
        } else if (slice.entity_type == 'company') {
            self.slice_company(slice, rdelete, tx, cb);
        } else if (slice.entity_type == 'rating') {
            self.slice_rating(slice, rdelete, tx, cb);
        } else {
//            console.error("Error: undefined entity type "+slice.entity_type);
            if (cb) {
                cb();
            }
        }

        self.inc_load_slices();
    };

    self.slice_category = function(slice, rdelete, tx, cb) {
console.log(slice);
        var data = slice.data;
		var data_count = data.length;
		var count = 0;
        var tname = 'categories';
        var f = function(){
            count ++;

//console.log("slice category count "+count+" data_count "+data_count);
            if (count == data_count) {
                if (cb) {
//console.log("slice category call cb");
                    cb();
                }
            }
        };

        if (rdelete) {
//console.log("slice category delete ",slice.min_id, slice.max_id);
            tx.executeSql("DELETE FROM " + tname + " WHERE id >= ? AND id <= ?", [slice.min_id, slice.max_id]);
        }

        var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields+') VALUES ('+ptables[tname].places+')';
        var froot = false;

        angular.forEach(data, function(category) {
//console.log("slice category data category");
            if (category.id == 0) {
                froot = true;
                // пропускаем эту пустую категорию, чуваки не умеют работать с нестед деревом
                return;
            }

            var values = [
                category.id,
                category.root,
                category.lft,
                category.rgt,
                category.lvl,
                category.disposable == true ? 1 : 0,
                category.position,
                'stats' in category && 'product_count' in category['stats'] ? category['stats']['product_count'] : 0,
                'stats' in category && 'subcategory_count' in category['stats'] ? category['stats']['subcategory_count'] : 0,
                category.show_brand == true ? 1 : 0,
                category.show_name_in_product_list == true ? 1 : 0,
                category.icon ? category.icon : '',
                category.background ? category.background : '',
                category.name,
                'name_sg' in category ? category.name_sg : '',
                JSON.stringify(category.price_postfix),
                JSON.stringify(category.rating_ids),
                JSON.stringify(category.highlighted_product_ids || []),
                'properties' in category && category.properties ? JSON.stringify(category.properties) : ''
            ];
//            console.log(query, values);
            tx.executeSql(query, values, function(transaction, result) {
                f();
            }, function(transaction, error) {
                console.error("Error: executeSql "+query, error.message);
                f();
            });
        });

        if (cb && froot && data.length == 1) {
            cb(true);
        }
    };

    self.slice_product = function(slice, rdelete, tx, cb) {
        var data = slice.data;
		var data_count = data.length;
		var count = 0;
        var tname = 'products';

        var f = function(){
            count ++;

            if (count == data_count) {
                if (cb) {
                    cb();
                }
            }
        };

        if (rdelete) {
            tx.executeSql("DELETE FROM " + tname + " WHERE id >= ? AND id <= ?", [slice.min_id, slice.max_id]);
            tx.executeSql("DELETE FROM product_properties WHERE product_id >= ? AND product_id <= ?", [slice.min_id, slice.max_id]);
            tx.executeSql("DELETE FROM product_ratings WHERE product_id >= ? AND product_id <= ?", [slice.min_id, slice.max_id]);
        }

        var query = 'INSERT INTO ' + tname + ' ('+ptables[tname].fields+') VALUES ('+ptables[tname].places+')';

        angular.forEach(data, function(product) {
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

            tx.executeSql(query, values, function(transaction, result) {
                f();
            }, function(transaction, error) {
                console.error("Error: executeSql "+query, error);
                f();
            });

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

    self.slice_company = function(slice, rdelete, tx, cb) {
        var data = slice.data;
		var data_count = data.length;
		var count = 0;

        var f = function(){
            count ++;

            if (count == data_count) {
                if (cb) {
                    cb();
                }
            }
        };

        if (rdelete) {
            tx.executeSql("DELETE FROM companies WHERE id >= ? AND id <= ?", [slice.min_id, slice.max_id]);
        }

        var query = 'INSERT INTO companies (id,name) VALUES (?,?)';
        angular.forEach(data, function(company) {
            var values = [
                company.id,
                company.name,
            ];
            tx.executeSql(query, values, function(transaction, result) {
                f();
            }, function(transaction, error) {
                console.error("Error: executeSql "+query, error);
                f();
            });
        });
    };

    self.slice_rating = function(slice, rdelete, tx, cb) {
        var data = slice.data;
		var data_count = data.length;
		var count = 0;

        var f = function(){
            count ++;

            if (count == data_count) {
                if (cb) {
                    cb();
                }
            }
        };

        if (rdelete) {
            tx.executeSql("DELETE FROM ratings WHERE id >= ? AND id <= ?", [slice.min_id, slice.max_id]);
        }

        var query = 'INSERT INTO ratings (id,name) VALUES (?,?)';
        angular.forEach(data, function(rating) {
            var values = [
                rating.id,
                rating.name,
            ];
            tx.executeSql(query, values, function(transaction, result) {
                f();
            }, function(transaction, error) {
                console.error("Error: executeSql "+sql, error);
                f();
            });
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

    self.getByIds = function(ids, order) {
        var places = [];
        angular.forEach(ids, function(){ places.push('?'); });
        return DB.query('SELECT * FROM categories WHERE id IN ('+places.join(',')+')' + (order ? ' ORDER BY ' + order : ''), ids)
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.roots = function() {
        return DB.query('SELECT * FROM categories WHERE lvl = 0 ORDER BY position')
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

    self.count = function() {
        return DB.query('SELECT COUNT(*) AS count FROM categories')
        .then(function(result){
            return DB.fetch(result);
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

    self.getByIds = function(ids, order, category) {
        var places = [];
        angular.forEach(ids, function(){ places.push('?'); });
        var q = '';
        var disposable = '*';
        if(category) {
            q = 'JOIN categories ON (products.category_id=categories.id) ';
            disposable = 'products.*,categories.disposable'
        }
        var q2 = 'SELECT ' + disposable + ' FROM products ' + q + 'WHERE products.id IN ('+places.join(',')+')' + (order ? ' ORDER BY ' + order : '');
        return DB.query(q2, ids)
        .then(function(result){
            return DB.fetchAll(result);
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

    self.count = function() {
        return DB.query('SELECT COUNT(*) AS count FROM products')
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
        return DB.query('SELECT * FROM companies ORDER BY name')
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
.factory('Article', function($http, Url, User) {
    var self = this;
    var g_rubrics = null;
    self.list = function(category_id, rubric, limit, offset) {
		var params = [];
        var api_token = User.api_token();

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

        if (api_token) {
            params.push('api_token=' + api_token);
        }

console.log("GET articles", Url.url('/v1/articles' + (params.length ? '?' + params.join('&') : '')));
        return $http.get(Url.url('/v1/articles' + (params.length ? '?' + params.join('&') : '')))
    		.then(function(resp){
//            console.log("DEBUG articles", resp.data);
    			return resp.data;
            },
            function(err){
                console.error("get articles error", err);
                return err;
    		});
    };

    self.getById = function(id) {
        var api_token = User.api_token();

        return $http.get(Url.url('/v1/articles/' + id + (api_token ? '?api_token=' + api_token : '')))
    		.then(function(resp){
    			return resp.data;
    		},
            function(err){
                console.error("error get article id "+id, err);
                return err;
            });
    };

    self.getRubrics = function(id) {
        if(g_rubrics) {
            /*
            var deferred = $q.defer();
            deferred.resolve(g_rubrics);
            return deferred.promise;
            */
        }
        return $http.get(Url.url('v1/articles/rubrics_and_categories'))
            .then(function(resp) {
                g_rubrics = {};
                angular.forEach(resp.data.rubrics, function(elem) {
                    g_rubrics[elem.rubric] = elem;       
                });
                return g_rubrics;
            },
            function(err){
                console.error("error get article id "+id, err);
                return err;
            });
    };

    return self;
})

// Поиск
.factory('Search', function($q, DB) {
    var self = this;

    self.products = function(q, limit, offset) {
        if (!q) {
            var deferred = $q.defer();
            deferred.resolve([]);
            return deferred.promise;
        }

        var qlimit = '';

        if (!angular.isUndefined(limit)) {
            qlimit = ' LIMIT ' + limit;

            if (!angular.isUndefined(offset)) {
                qlimit += ',' + offset;
            }
        }

        q = '%' + q + '%';
        return DB.query('SELECT p.*,c.name AS category_name, co.name AS company_name, c.show_name AS show_name, c.show_brand AS show_brand FROM products p JOIN categories c ON (c.id=p.category_id) LEFT JOIN companies co ON (co.id=p.company_id) WHERE p.name LIKE ? OR c.name LIKE ? ORDER BY p.name' + qlimit, [q, q])
        .then(function(result){
            return DB.fetchAll(result);
        }, function(err){
            console.error("Error search: q " + q + " " + err);
            return [];
        }
        );
    };


    return self;
})
;
