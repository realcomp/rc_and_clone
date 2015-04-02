
// Контроллер для функций
app.controller('funcController', function($scope) {

	// Вернет класс оформления для рейтинга
	$scope.productRatingType = function(product) {
		product.ratingv = product.rating;
		//console.log(rating, tested, dangerLevel)

  	if(product.tested == 0) {
  		product.ratingv = '?';
  		return 'product__rating-wait';
  	}
  	else if(product.tested && (product.danger_level > 1)) {
  		product.ratingv = 'X';
  		return 'product__rating-black';
  	}
  	else if(product.tested && (product.danger_level == 1)) {
  		return 'product__rating-violation';
  	}
  	else {
  		return 'product__rating-green';
  	}

  }

});