var app = angular.module('starter.controllers', [])


// Главная страница пл
app.controller('MainCtrl', function($scope, Category) {
		console.log('controller');
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
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
