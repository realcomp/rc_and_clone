angular.module('user-services', [])

// Resource service example
.factory('User', function($http) {
    var self = this;
    var user_key = 'rk_user';
    var user = null;

  	self.login = function(email, password) {
        self.logout();
	  	return $http.get('/v1/auth/email?' + 'email=' + email + '&password=' + password).
	  		then(function(result) {
                console.log("user", result.data);

                if (result.status == 200) {
                    user = result.data;
                    localStorage.setItem(user_key, JSON.stringify(user));
                    return user.profile;
                }

	    		return null;
	  	    }, function(status) {
                console.log("DEBUG status", status);
		        return status;
		    });
  	};

  	self.logout = function() {
        localStorage.removeItem(user_key);
        user = null;
  	};

    self.profile = function() {
        if (user) {
            return user.profile;
        }

        var uj = localStorage.getItem(user_key);

        if (!uj) {
            return null;
        }

        user = JSON.parse(uj);
        return user.profile;
    };

    self.is_auth = function() {
        return user ? true : false;
    };

    self.profile2 = function() {
        if (!self.is_auth()) {
            return null;
        }

        var uj = localStorage.getItem(user_key);

        if (!uj) {
            return null;
        }

        user = JSON.parse(uj);
        return user.profile;
    };

    return self;
});
