var app = angular.module('starter.controllers', []);

// Контроллер главной
app.controller('MainCtrl', function($scope, Category, DB) {

	console.log('controller');
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
	$scope.title = 'Рейтинг товаров';
	DB.loading().then(function() {
console.log("controler loading");
		Category.roots().then(function(roots) {
		angular.forEach(roots, function(root) {
      Category.countProductsByObj(root, true).then(function(count) {
        root['product_tested_count'] = count;
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
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
      	console.log($scope.title)
      $scope.categories = [];
      $scope.noInformation = '';

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
							angular.forEach(products, function(product) {
		      			$scope.products.push(product);
		    			});
						}
						else {
							$scope.noInformation = 'В данной категории пока нет продуктов!';
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
