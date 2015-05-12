// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'db-services', 'user-services', 'starter.controllers', 'ionic.rating'])

app.run(function($ionicPlatform, DB, $window, $rootScope) {
  $ionicPlatform.ready(function($) {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    DB.init();

    document.addEventListener("pause", function() {
      DB.pause(true);
      console.log("The application is pause");
    }, false);

    document.addEventListener("resume", function() {
      DB.pause(false);
      console.log("The application is resuming from the background");
    }, false);

    console.log('end run');
  });

  $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
      $rootScope.$apply(function() {
        $rootScope.online = false;
    });
  }, false);

  $window.addEventListener("online", function () {
    $rootScope.$apply(function() {
      $rootScope.online = true;
    });
  }, false);

});

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-left');
	
	console.log('st config');
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
   	controller: 'AuthorizationCtrl'
  })

  .state('app.main', {
    url: "/main",
    views: {
      'menuContent': {
        templateUrl: "templates/main.html",
        controller: 'MainCtrl'
      }
    }
  })

  .state('app.about', {
    url: "/about",
    views: {
      'menuContent': {
        templateUrl: "templates/about.html",
        controller: 'AboutCtrl'
      }
    }
  })

  .state('app.category', {
    url: "/category/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/category.html",
        controller: 'CategoryCtrl'
      }
    }
  })

  .state('app.product', {
    url: "/product/:id",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/product.html",
        controller: 'ProductCtrl'
      }
    }
  })

  .state('app.articles', {
    url: "/article",
    views: {
      'menuContent': {
        templateUrl: "templates/articles.html",
        controller: 'ArticlesCtrl'
      }
    }
  })

  .state('app.article', {
    url: "/article/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/article.html",
        controller: 'ArticleCtrl'
      }
    }
  })

  .state('app.shoppingList', {
    url: "/user/shopping-list",
    views: {
      'menuContent': {
        templateUrl: "templates/shopping-list.html",
        controller: 'ShoppingListCtrl'
      }
    }
  })

  .state('app.userProfile', {
    url: "/user/profile",
    views: {
      'menuContent': {
        templateUrl: "templates/user-profile.html",
        controller: 'UserProfileCtrl'
      }
    }
  })
  ;

  // Default Router
  $urlRouterProvider.otherwise('/app/main');
});

// В случае 404 для изображения задействуем err-src
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
});

// Ну понятно..toggleClass
app.directive('toggleClass', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                element.toggleClass(attrs.toggleClass);
            });
        }
    };
});