
// Контроллер для функций
app.controller('funcController', function($scope) {

	// Вернет класс оформления для рейтинга
	$scope.productRatingType = function(rating, tested, dangerLevel) {
		$scope.rating = null;
		//console.log(rating, tested, dangerLevel)

  	if(tested == 0) {
  		$scope.rating = '?';
  		return 'product__rating-wait';
  	}
  	else if(tested && (dangerLevel >= 2)) {
  		$scope.rating = 'X';
  		return 'product__rating-black';
  	}
  	else if(tested && (dangerLevel == 1)) {
  		$scope.rating = rating;
  		return 'product__rating-violation';
  	}
  	else {
  		$scope.rating = rating;
  		return 'product__rating-green';
  	}

  }

});