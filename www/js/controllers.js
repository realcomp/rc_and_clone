var app = angular.module('starter.controllers', []);

app.run(function($rootScope) {
    $rootScope.title = '1';
    console.info('run');
});

// Главная страница приложения
app.controller('MainCtrl', function($scope, Category) {

	console.log('controller');
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
	$scope.title = 'Рейтинг товаров';
	setTimeout(function() {
		Category.roots().then(function(roots) {
		angular.forEach(roots, function(root) {
      Category.countProducts(root.id, true).then(function(count){
        root['product_tested_count'] = count;
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
  	});
	}, 1000)

});

// Страница категорий
app.controller('CategoryCtrl', function($scope, $stateParams, $ionicHistory, Category) {
	$scope.title = 'Категория';
	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}
	Category.getById($stateParams.id).then(function(array) {
		angular.forEach(array, function(item) {
      $scope.categoryName = item.name;

      console.log(item);
      console.log($scope.categoryName)
    });
	});

});
