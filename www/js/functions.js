
// Контроллер для общих функций и динамичных элементов
app.controller('funcController', function($scope, $ionicSlideBoxDelegate, $ionicActionSheet) {

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
  };

  $scope.productType = function(product) {
  	if(product.tested == 0) {
  		$scope.productTemplate = $scope.productTemplates[1];
  	}
  	else if(product.tested && (product.danger_level > 1)) {
  		$scope.productTemplate = $scope.productTemplates[2];
  	}
  	else {
  		$scope.productTemplate = $scope.productTemplates[0];
  	}
  }

  // Шаблоны для разных типов продуктов
  $scope.productTemplates = [ 
  	{ 
  		name: 'product-default',
  		url: 'templates/product/product-default.html'
  	},
    { 
    	name: 'product-wait',
  		url: 'templates/product/product-wait.html'
    },
    { 
    	name: 'product-blacklist',
  		url: 'templates/product/product-blacklist.html'
    } 

  ];

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

	// Массив с табами на странице категорий с товарами
	$scope.orderProp = ['danger_level', '-rating'];
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

  // Методы для работы и инициализации
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
  };

  // Методы для работы слайдера в отзывах
  $scope.currentIndex = 1;
  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
    $scope.currentIndex = $ionicSlideBoxDelegate.currentIndex() + 1;
  }
  $scope.prevSlide = function() {
    $ionicSlideBoxDelegate.previous();
    $scope.currentIndex = $ionicSlideBoxDelegate.currentIndex() + 1;
  }

  // Сортировка
   $scope.showSorting = function() {

		$ionicActionSheet.show({
     	buttons: [
       		{ text: '<span>Рейтингу</span>' },
       		{ text: '<span>Рейтингу(по возврастанию)</span>' },
       		{ text: '<span>Цене</span>' },
       		{ text: '<span>Цене(по возврастанию)</span>' }
     	],

  	  titleText: 'Сортировать по:',
     	cancelText: 'Закрыть',

     	buttonClicked: function(index) {
     		switch(index) {
     			case 0:
     				$scope.orderProp = ['danger_level', '-rating'];
     				break;
     			case 1:
     				$scope.orderProp = ['danger_level', 'rating'];
     				break;
     			case 2:
     				$scope.orderProp = 'price';
     				break;
     			case 3:
     				$scope.orderProp = '-price';
     				break;			
     		}
       	return true;
     	},

      cancelOnStateChange: function() {
        return true;
      }
   	});
  };

  // Параметры
  $scope.showParameters = function() {
   	
		$ionicActionSheet.show({
     	buttons: [
       		{ text: '<span>Ок</span>' }
     	],

  	  titleText: 'Когда-нибудь тут будут параметры сортировки:',
     	cancelText: 'Закрыть',

     	buttonClicked: function(index) {
       	return true;
     	},

      cancelOnStateChange: function() {
        return true;
      }
   	});
  };


});