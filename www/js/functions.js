
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

  $scope.declension = function(num, expressions) {
	    var result;
	    count = num % 100;
	    if (count >= 5 && count <= 20) {
	        result = expressions['2'];
	    } else {
	        count = count % 10;
	        if (count == 1) {
	            result = expressions['0'];
	        } else if (count >= 2 && count <= 4) {
	            result = expressions['1'];
	        } else {
	            result = expressions['2'];
	        }
	    }
	  	return result;
		}

});