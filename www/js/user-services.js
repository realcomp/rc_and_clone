angular.module('user-services', [])

// Resource service example
.factory('User', function($http, $q) {
    var self = this;
    var user_key = 'rk_user';
    var user = null;

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
        self.logout();
	  	return $http.get('/v1/auth/email?' + 'email=' + email + '&password=' + password).
	  		then(function(result) {
                console.log("user", result.data);

                if (result.status == 200) {
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
console.log("DEBUG defered");
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }

        return $http.get('/v1/user/profile?' + 'api_token=' + user.api_token).
            then(function(result) {
                console.log("profile", result.data);

                if (result.status == 200) {
                    user.profile = result.data;
                    save();
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

    return self;
});
