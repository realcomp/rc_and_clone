angular.module('user-services', [])

// Resource service example
.factory('User', function($http, $q, $rootScope, $cordovaOauth, Url, DB) {
    var self = this;
    var user_key = 'rk_user';
    var last_login_email_key = 'rk_last_login_email';
    var user = null;
    var shopping_list = null;
    var time_shopping_list = 0;
    var dproducts_list = null; // disposable 
    var ndproducts_list = null; // no disposable
    var products_list = null;
    var recommended_list = null;
    var votes_list = [];
    var time_get_profile = 0;

    var parse = function(force) {
        if (!force && user) {
            return;
        }

        var uj = localStorage.getItem(user_key);

        if (!uj) {
            return null;
        }

        user = JSON.parse(uj);
        return user;

    }

    var save = function() {
        if (!user) {
            localStorage.removeItem(user_key);
            return;
        }

        localStorage.setItem(user_key, JSON.stringify(user));
    }

    self._do_login = function(result, email) {
        if (result && result.status == 200) {
            if (email) {
                self.lastLoginEmail(email);
            }

            user = result.data;
            save();
            self.productList();
            self.shoppingList();
            self.productVotes();
            return {profile: user.profile};
        }

        return null;
    }

  	self.login = function(email, password) {
        if (!email || !password) {
            var deferred = $q.defer();
            deferred.resolve({data: {user_message: 'не введен email или пароль'}});
            return deferred.promise;
        }

        self.logout();
	  	return $http.get(Url.url('/v1/auth/email?' + 'email=' + email + '&password=' + password)).
	  		then(function(result) {
//                console.log("user", result.data);
                return self._do_login(result,email);
	  	    }, function(status) {
                console.error("login error", status);
		        return status;
		    });
  	};


  	self.logout = function() {
        localStorage.removeItem(user_key);
        user = null;
        shopping_list = null;
        dproducts_list = null; // disposable 
        ndproducts_list = null; // no disposable
        products_list = null;
        recommended_list = null;
        time_get_profile = 0;
  	};


    self.registration = function(firstname, lastname, email) {

        return $http({
            method: 'POST',
            url: Url.url('/v1/user/register'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
             data: 'first_name=' + firstname + '&' +  'last_name=' + lastname + '&' + 'email=' + email
        }).then(function(result) {
            return result
        }, function(data) {
            return data;
        });

    };


    self.get = function() {
        parse();
        return user;
    };

    self.profile = function(now) {
        parse();

        if (now) {
            return self.is_auth() ? user.profile : null;
        }

        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        if (user.profile && time_get_profile) {
            // лазаем в инет за профилем не чаще чем раз в минуту
            var date = new Date();

            if (user.profile && time_get_profile && time_get_profile + 60 < date.getTime()) {
                var deferred = $q.defer();
                deferred.resolve(user.profile);
                return deferred.promise;
            }
        }

        return $http.get(Url.url('/v1/user/profile?' + 'api_token=' + user.api_token)).
            then(function(result) {
//                console.log("profile", result.data);

                if (result.status == 200) {
                    user.profile = result.data;
                    save();
                    var date = new Date();
                    time_get_profile = date.getTime();
                    return user.profile;
                }

                return user.profile;
            }, function(status) {
                console.error("profile error", status);

                if (user) {
                    return user.profile;
                }

                return null;
            });
    };

    self.profileEdit = function(data) {
        parse()

        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        // 
        return $http({
            method: 'POST',
            url: Url.url('/v1/user/profile'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: 'api_token=' + user.api_token + '&' +  'first_name=' + data.first_name + '&'
            + 'last_name=' + data.last_name + '&' + 'phone=' + data.phone + '&' + 'avatar=' + data.avatar
        }).then(function(result) {
            return result
        }, function(data) {
            return data;
        });

    };

    self.is_auth = function() {
        parse();
        return user ? true : false;
    };

    self.api_token = function() {
        parse();

        if (!self.is_auth()) {
            return null;
        }

        return user.api_token;
    };

    self.lastLoginEmail = function(e) {
        if (e) {
            localStorage.setItem(last_login_email_key, e ? e : '');
        } else {
            e = localStorage.getItem(last_login_email_key);
        }

        return e ? e : '';
    };

    // Получение списка покупок пользователя
    self.shoppingList = function() {
        //console.log("GET "+Url.url('/v1/shopping_list'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        var date = new Date();
        if (!shopping_list && time_shopping_list && time_shopping_list + 60 < date.getTime()) {
            var deferred = $q.defer();
            deferred.resolve(shopping_list);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/shopping_list?' + 'api_token=' + user.api_token)).
            then(function(result) {
                //console.log("shoppin list", result.data);

                if (result.status == 200) {
                    time_shopping_list = date.getTime()
                    shopping_list = [];
                    shopping_list = result.data.items;
                    localStorage.setItem('ShoppingListCount', shopping_list.length);
                }

                return shopping_list;
            }, function(status) {
                console.error("shopping list error", status);

                return shopping_list;
            });
    };


    // Обновление списка покупок пользователя
    self.updateShoppingList = function(id) {
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return self.shoppingList().then(function(array) {
            if(!array && !$rootScope.online)
                return;

            var ids = [];
            var del = false;

            for(var i = 0; i < array.length; i++) {
                if(array[i].productId == id) {
                    array.splice(i, 1);
                    del = true;
                }
            }

            for(var i = 0; i < array.length; i++) {
                ids.push({'product_id': array[i].productId});
            }

            if(!del) {
                ids.push({'product_id': id});
            }

            var idsJson = JSON.stringify(ids);

            return $http({
                method: 'PUT',
                url: Url.url('/v1/shopping_list?' + 'api_token=' + user.api_token),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: 'items=' + idsJson
            }).then(function(result) {
                if (result.status == 200) {
                    // console.log('IF');
                    var date = new Date();
                    time_shopping_list = date.getTime()
                    shopping_list = [];
                    shopping_list = result.data.items;
                    localStorage.setItem('ShoppingListCount', ids.length);
                    var resultFull = [];
                    resultFull.push(result, del)
                    self.shoppingList();
                    return resultFull;
                }
                return shopping_list;    

            }, function(result) {
                return result.status;
            });
        }); 
    };


    // Отслеживаем состояние списка покупок пользователя
    self.getShoppingListArray = function() {
        if(shopping_list && shopping_list !== null) {
            localStorage.setItem('ShoppingListCount', shopping_list.length);
        }
        if(shopping_list) {
            var ids = {};
            for(var i = 0, length = shopping_list.length; i < length; i++) {
                ids[shopping_list[i].productId] = shopping_list[i].productId;
            }
            return ids;       
        }
        else {
            return {};
        }
    }


    // Получение списка рекомендованных товаров
    self.recommendedList = function() {
        //console.log("GET "+Url.url('/v1/shopping_list/recommended'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/shopping_list/recommended?' + 'api_token=' + user.api_token)).
            then(function(result) {
                //console.log("recommended list", result.data);

                if (result.status == 200) {
                    recommended_list = [];
                    recommended_list = result.data.product_ids;
                }

                return recommended_list;
            }, function(status) {
                console.error("recommended list error", status);

                return recommended_list;
            });
    };


    // Получение списка товаров пользователя
    self.productList = function(disposable) {
        //console.log("GET "+Url.url('/v1/user/products'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/user/products?limit=1000&' + 'api_token=' + user.api_token + (!isNaN(disposable) ? ('&disposable=' + (disposable ? '1' : '0') ) : ''))).
            then(function(result) {
                //console.log("products list2", result.data);
                var res = {items: [], ids: {}};

                if (result.status == 200 && 'items' in result.data && result.data.items.length) {
                    var places = [];
                    res.ids = [];
                    angular.forEach(result.data.items, function(id){ places.push('?'); res.ids[id] = id; });
                    DB.query('SELECT * FROM products WHERE id IN ('+places.join(',')+')', result.data.items)
                    .then(function(result){
                        //console.log(products_list);
                        if (isNaN(disposable)) {
//                            angular.forEach(DB.fetchAll(result), function(p){products_list[p.id] = p;});
                            products_list = DB.fetchAll(result);
                            res.items = products_list;
                        } else if (disposable) {
                            dproducts_list = DB.fetchAll(result);
                            res.items = dproducts_list;
                        } else {
                            ndproducts_list = DB.fetchAll(result);
                            res.items = ndproducts_list;
                        }
                    });
                }

                return res;
            }, function(status) {
                //console.error("error products list", status);
                var res = {items: []};

                if (isNaN(disposable)) {
                    if (products_list) {
                        res.items = products_list;
                    }
                } else if (disposable) {
                    if (dproducts_list) {
                        res.items = dproducts_list;
                    }
                } else {
                    if (ndproducts_list) {
                        res.items = ndproducts_list;
                    }
                }

                return res;
            });
    };


    // Обновление в список товаров пользователя (это в профиле!)
    self.updateProductList = function(ids) {
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return self.productList().then(function(object) {
            var length = object.ids.length;
            var del = false;
            for(var i = 0; i < length; i++) {
                if(object.ids[i] === ids) {
                    del = true;
                    break;
                }
            }

            var query = '/v1/user/products';
            if(del) {
                query = '/v1/user/products/remove';
            }

            var idsJson = JSON.stringify([ids]);
        
            return $http({
                method: 'POST',
                url: Url.url(query + '?' + 'api_token=' + user.api_token),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: 'product_ids=' + idsJson
            }).then(function(result) {
                var resultFull = [];
                resultFull.push(result, del)

                if (del) {
                for(var i = 0, length = products_list.length; i < length; i++) {
                    if (products_list[i].id == ids) {
                         products_list.splice(i, 1);
                        break;
                    }
                }
                } 
                else {
                    products_list.push({id: ids});
                }

                self.productList();
                return resultFull;
            }, function(data) {
                return data.status;
            });

        });
    };


    // Отслеживаем состояние товаров пользователя
    self.getProductListArray = function() {
        if(products_list) {
            var ids = {};
            for(var i = 0, length = products_list.length; i < length; i++) {
                ids[products_list[i].id] = products_list[i].id;
            }
            return ids;      
        }
        else {
            return {};
        }
    };


    // Ответ от сервера при добавлении товаров в списки
    self.ProductResponse = function(data, slug) {
        if (!$rootScope.online) {
            return {'str': 'Проверьте ваше интернет-соединение!', status: false,  'title': 'Ошибка!'};
        }
        else if (!self.is_auth()){
            return {'str': 'Для добавления в список ' + slug + ' необходимо авторизоваться!', status: false, 'title': 'Внимание!'};
        }
        else if (typeof(data) === 'object') {
            if(data[1] === true)
                return {'str': 'Товар удален из списка ' + slug + '!', status: 'remove', 'title': 'Выполнено!'};
            return {'str': 'Товар добавлен в список ' + slug + '!', status: 'add', 'title': 'Выполнено!'};
        }
        else {
            return {'str': 'Ошибка добавления товара! --- ' + data, status: false, 'title': 'Ошибка!'};
        }
    };


    // Добавление голосов
    self.addProductVotes = function(product) {
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            DB.alert('Для участия в голосовании за товары необходимо авторизоваться!', 'Внимание!');
            return deferred.promise;
        }

        var idsJson = JSON.stringify([[product.id, 1]]);

        // 
        return $http({
            method: 'POST',
            url: Url.url('/v1/votes/products?' + 'api_token=' + user.api_token),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: 'votes=' + idsJson
        }).then(function(result) {
            return result
        }, function(data) {
            return data.status;
        });

    };


    // Получение голосов 
    self.productVotes = function() {
         if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('v1/votes/products?limit=1000&' + 'api_token=' + user.api_token)).
        then(function(result) {
            if (result.status == 200) {
                for(var i = 0, length = result.data.product_ids.length; i < length; i++) {
                    votes_list[result.data.product_ids[i]] = result.data.product_ids[i];
                }
            }
            return result.status;
        }, function(status) {
            return status;
        });

    };

    // Получение голосов в нужном контроллере
    self.getProductVotes = function() {
        if(votes_list && votes_list !== null)
            return votes_list;
        return [];
    };

    //
    self.productReviews = function(id, data) {
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }
        return $http({
            method: 'POST',
            url: Url.url('/v1/catalog/reviews'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: 'api_token=' + user.api_token + '&' +  'mark=' + data.rating + '&' + 'text=' + data.text + '&' + 'advantages=' + data.positive + '&' + 'disadvantages=' + data.negative + '&' + 'product_id=' + id
        }).then(function(result) {
            return result
        }, function(data) {
            return data;
        });

    };

    self.addComment = function(data, text) {

        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        };

        return $http({
            method: 'POST',
            url: Url.url('/v1/comments'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: 'api_token=' + user.api_token + '&' +  'entity_id=' + data.id + '&' + 'entity_class_alias=article&' + 'text=' + text
        }).then(function(result) {
            return result
        }, function(data) {
            return data;
        });

    };


    self.authSocial = function(social, access_token) {
        if (!social || !access_token) {
            var deferred = $q.defer();
            deferred.reject('empty socail or access_token');
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/auth/'+social+'?access_token='+access_token)).then(function(result) {
//console.log(JSON.stringify(result));
            return self._do_login(result);
        },
        function(err){
            console.error("error get auth social "+social, err);
            return err;
        });
    };


    self.vkontakteOauth = function() {
        return $cordovaOauth.vkontakte("4535100", ['uid', 'offline', 'email', 'first_name', 'last_name', 'bdate', 'city', 'country', 'timezone', 'contacts', 'photo_medium']).then(function(result) {
            return self.authSocial('vk', result.access_token);
        }, function(error) {
            var deferred = $q.defer();
            deferred.reject(error);
            return deferred.promise;
        });
    };

    self.facebookOauth = function() {
        return $cordovaOauth.facebook("312893302188904", ['email', "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
//console.log(JSON.stringify(result));
            return self.authSocial('fb', result.access_token);
        }, function(error) {
            var deferred = $q.defer();
            deferred.reject(error);
            return deferred.promise;
        });
    };

    return self;
});
