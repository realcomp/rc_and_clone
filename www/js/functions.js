
// Контроллер для функций
app.controller('funcController', function($scope) {

	// Вернет класс оформления для рейтинга
	$scope.productRatingType = function(rating, tested, dangerLevel) {
		$scope.rating = null;
		//console.log(rating, tested, dangerLevel)

  	if(tested == 0) {
  		console.log(1);
  		$scope.rating = '?';
  		return 'product__rating-wait';
  	}
  	else if(tested && (dangerLevel >= 2)) {
  		console.log(2);
  		$scope.rating = 'X';
  		return 'product__rating-black';
  	}
  	else if(tested && (dangerLevel == 1)) {
  		console.log(3);
  		$scope.rating = rating;
  		return 'product__rating-violation';
  	}
  	else {
  		console.log(4);
  		$scope.rating = rating;
  		return 'product__rating-green';
  	}

  }

});