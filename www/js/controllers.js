var app = angular.module('starter.controllers', []);

// Главная страница приложения
app.controller('MainCtrl', function($scope, Category) {

	console.log('controller');
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
	$scope.title = 'Рейтинг товаров';
	setTimeout(function() {
		Category.roots().then(function(roots) {
		angular.forEach(roots, function(root) {
      Category.countProducts(root.id, true).then(function(count) {
        root['product_tested_count'] = count;
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
  	});
	}, 1000)

});

// Страница категорий
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
      $scope.CategoryTitle = category.name
      $scope.categories = [];

			Category.childsByObj(category, category.lvl+1).then(function(categories) {

				if(categories.length > 0) {
					angular.forEach(categories, function(cat) {
	      		$scope.categories.push(cat);
	    		});
				}
				else {
					Product.getById($stateParams.id).then(function(products) {
						console.log(products);
					});
				}

			});

	});

});
