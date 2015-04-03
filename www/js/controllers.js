var app = angular.module('starter.controllers', []);

// Контроллер главной
app.controller('MainCtrl', function($scope, $ionicLoading, $interval, Category, DB) {

	console.log('controller');
	$scope.percent = DB.percentLoading();
	var getPercent = function(){ $scope.percent = DB.percentLoading(); };
	var intervalPercent = $interval(function(){
		getPercent();
	}, 500);
	$scope.loadingIndicator = $ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-in',
	    showBackdrop: false,
	    maxWidth: 200,
	    showDelay: 500
	});
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
	$scope.title = 'Рейтинг товаров';
	DB.loading().then(function() {
		$scope.percent = 100;
		$interval.cancel( intervalPercent );
		intervalPercent = undefined;
		console.log("controler loading");
		Category.roots().then(function(roots) {
			angular.forEach(roots, function(root) {		
      Category.countProductsByObj(root, true).then(function(count) {		
        root['product_tested_count'] = count;		
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
	$ionicLoading.hide();
  	});
	})

});

// Контроллер категорий
app.controller('CategoryCtrl', function($scope, $location, $stateParams, $ionicHistory, Category, Product) {

	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}

	Category.getById($stateParams.id).then(function(category) {
      $scope.title = category.name
      $scope.categories = [];
      $scope.noProducts = '';

			Category.childsByObj(category, category.lvl+1).then(function(categories) {

				if(categories.length > 0) {
					angular.forEach(categories, function(cat) {
	      		$scope.categories.push(cat);
	    		});
				}
				else {
					Product.getByCategoryId($stateParams.id).then(function(products) {
						if(products.length > 0) {

							$scope.products = [];

							$scope.productsPositive = [];
							$scope.productsBlack = [];
							$scope.productsWait = [];

							angular.forEach(products, function(product) {

		      			$scope.products.push(product);

		      			if(!product.tested) {
		      				$scope.productsWait.push(product);
		      			}
		      			else if(product.tested && product.danger_level > 1) {
		      				$scope.productsBlack.push(product);
		      			}
		      			else {
		      				$scope.productsPositive.push(product);
		      			}

		    			});
		    			console.log('positive', $scope.productsPositive);
		    			console.log('wait', $scope.productsWait);
		    			console.log('black', $scope.productsBlack);
						}
						else {
							$scope.noProducts = 'Извините, товаров пока не добавлены!';
						}
					});
				}

			});
	});

});

// Контроллер товаров
app.controller('ProductCtrl', function($scope, $location, $stateParams, $ionicHistory, Product) {

	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}

	Product.getById($stateParams.id).then(function(product) {
      $scope.title = product.name
      $scope.product = product;
      console.log(product)
	});

});


