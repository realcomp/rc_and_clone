angular.module('user-services', [])

// Resource service example
.factory('User', function($http, $q, Url, DB) {
    var self = this;
    var user_key = 'rk_user';
    var last_login_email_key = 'rk_last_login_email';
    var user = null;
    var shopping_list = null;
    var dproducts_list = null; // disposable 
    var ndproducts_list = null; // no disposable
    var products_list = null;
    var recommended_list = null;
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

                if (result.status == 200) {
                    self.lastLoginEmail(email);
                    user = result.data;
                    save();
                    return {profile: user.profile};
                }

	    		return null;
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
        console.log("GET "+Url.url('/v1/shopping_list'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/shopping_list?' + 'api_token=' + user.api_token)).
            then(function(result) {
                console.log("shoppin list", result.data);

                if (result.status == 200) {
                    shopping_list = [];
                    shopping_list = result.data.items;
                }

                return shopping_list;
            }, function(status) {
                console.error("shopping list error", status);

                return shopping_list;
            });
    };

    // Получение списка рекомендованных товаров
    self.recommendedList = function() {
        console.log("GET "+Url.url('/v1/shopping_list/recommended'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/shopping_list/recommended?' + 'api_token=' + user.api_token)).
            then(function(result) {
                console.log("recommended list", result.data);

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
        console.log("GET "+Url.url('/v1/user/products'));
        if (!self.is_auth()) {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get(Url.url('/v1/user/products?' + 'api_token=' + user.api_token + (!isNaN(disposable) ? ('&disposable=' + (disposable ? '1' : '0') ) : ''))).
            then(function(result) {
                console.log("products list", result.data);
                var res = {items: []};

                if (result.status == 200 && 'items' in result.data && result.data.items.length) {
                    var places = [];
                    angular.forEach(result.data.items, function(){ places.push('?'); });
                    DB.query('SELECT * FROM products WHERE id IN ('+places.join(',')+')', result.data.items)
                    .then(function(result){
                        console.log(products_list);
                        if (isNaN(disposable)) {
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
                console.error("error products list", status);
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

    return self;
});
