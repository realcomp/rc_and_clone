// Контроллер категорий
app.controller('CategoryCtrl', function($scope, $q, $location, $stateParams, $ionicHistory, $ionicModal,  $ionicScrollDelegate, Category, Product, Company, Rating, User, DB) {
	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   			disableBack: true
		});
		$location.path('/');
		return false;
	}

	$scope.categories = [];
  	$scope.title = '';

	// Получение категории
	Category.getById($stateParams.id).then(function(category) {
		if (category.rgt - category.lft == 1) {
			$location.path('/app/product-list/' + category.id);
			return;
		}

      	$scope.title = category.name;

		// Вернет дочерние категории или товаров
		Category.childsByObj(category, category.lvl+1).then(function(categories) {
			if (categories.length < 1) {
				$location.path('/app/product-list/' + category.id);
				return;
			}

			angular.forEach(categories, function(cat) {
				cat.href = cat.rgt - cat.lft == 1 ? '#/app/product-list/' + cat.id : '#/app/category/' + cat.id;
	      		$scope.categories.push(cat);
    		});
		});
	});

});
