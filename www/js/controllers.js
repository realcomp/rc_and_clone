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
      Category.countProductsByObj(root, true).then(function(count) {
        root['product_tested_count'] = count;
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
  	});
	}, 1000)

});

// Страница категорий
app.controller('CategoryCtrl', function($scope, $location, $stateParams, $ionicHistory, Category) {

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
				//console.log(innerCategoryObj);
									console.log(categories);
				angular.forEach(categories, function(cat) {
      		Category.countProductsByObj(cat).then(function(count) {
        		console.log(count)
        		cat['product_count2'] = count.count;
        		console.log(cat)
        		$scope.categories.push(cat);
      		});
    		});
			});

	});

});
