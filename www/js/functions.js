
// Контроллер для общих функций и динамичных элементов
app.controller('funcController', function($scope, $ionicSlideBoxDelegate, $ionicActionSheet) {

	$scope.orderProp = '-rating';

	// Вернет класс оформления для рейтинга
	$scope.productRatingType = function(product) {
		product.ratingv = product.rating;

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

  // Вернет слово в правильном склонении
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
	};

	// Табы на странице категорий с товарами
  $scope.tabsCatProductType = [
  	{
		  title : "Проверянные", active : false,
		},
    { 
      title: "Ожидают проверки", active : false 
    },
    { 
      title: "Черный список", active : false 
    }
  ];


  $scope.tabsCategory = function(o) {
    for (var i = 0; i <= $scope.tabsCatProductType.length - 1; i++) {
      $scope.tabsCatProductType[i].active = false;
    }
    $scope.tabsCatProductType[o].active = true;

  };
  $scope.tabsInit = false;
  $scope.tabsClass = function(item, productsCheck, productsWait) {

  	if(!$scope.tabsInit) {
	  	if(productsCheck.length > 0)
	  		$scope.tabsCatProductType[0].active = true;
	  	else if(productsWait.length > 0)
	  		$scope.tabsCatProductType[1].active = true;
  	}
  	$scope.tabsInit = true;

  	if(item.active) {
  		return 'product__category-tabs-active';
  	}
  	return 'product__category-tabs-deactive';
  }

  // Методы для работы слайдера в отзывах
  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  }
  $scope.prevSlide = function() {
    $ionicSlideBoxDelegate.previous();
  }

  //  Возможно для сортировки будет использовать такую область
   $scope.asShow = function() {
		$ionicActionSheet.show({
			template: '<select ng-model="orderProp">',
     	buttons: [
       		{ text: '<option value="-rating">по рейтингу</option>' },
       		{ text: '<option value="rating">по рейтингу(по возврастанию)</option>' }
     	],
  	  titleText: 'Сортировать по:',
     	cancelText: 'Закрыть',
     	buttonClicked: function(index) {
				console.log('Click button ActionSheet');
       	return true;
     	},
      cancelOnStateChange: function() {
      	console.log('Click close ActionSheet close');
        return true;
      }
   	});
  }


});