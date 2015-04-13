// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'db-services', 'user-services', 'starter.controllers', 'ionic.rating'])

app.run(function($ionicPlatform, DB) {
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
    console.log('end run');
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
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
    views: {
      'menuContent': {
        templateUrl: "templates/product.html",
        controller: 'ProductCtrl'
      }
    }
  });

  // Default Router
  $urlRouterProvider.otherwise('/app/main');
});
