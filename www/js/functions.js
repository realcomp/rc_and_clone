
// Контроллер для общих функций и динамичных элементов
app.controller('funcController', function($scope, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicScrollDelegate) {
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
  $scope.tabsCatProductType = [
  	{
		  title : "Проверенные товары",
		  active : false,
		  icon: 'fa-check-square-o'
		},
    { 
      title: "Чёрный список",
      active : false,
      icon: 'fa-ban' 
    },
    { 
      title: "Ожидают проверки",
      active : false,
      icon: 'fa-pencil-square-o' 
    }
  ];

  // Методы для работы и инициализации
  $scope.tabsCategory = function($event, o) {
  	var element = $event.currentTarget;
  	  	$ionicScrollDelegate.scrollTop();
  	if(element.classList.contains('product__category-tabs-disabled'))
  		return false;

    for (var i = 0; i <= $scope.tabsCatProductType.length - 1; i++) {
      $scope.tabsCatProductType[i].active = false;
    }
    $scope.tabsCatProductType[o].active = true;

  };

  //
  $scope.tabsInit = false;
  $scope.tabsClass = function(item, productsCheck, productsWait) {
  	if(!$scope.tabsInit) {
	  	if(productsCheck.length > 0)
	  		$scope.tabsCatProductType[0].active = true;
	  	else if(productsWait.length > 0)
	  		$scope.tabsCatProductType[2].active = true;
  	}
  	$scope.tabsInit = true;

  	if(item.active) {
  		return 'product__category-tabs-active';
  	}
  	return 'product__category-tabs-deactive';
  };

  //
  $scope.arrayTabAssembly = function(check, black, wait) {
  	var disabledTabArray = [];
  	disabledTabArray.push(check, black, wait);
		$scope.disabledTabArray = disabledTabArray;
	};

	// Сделает табы без товаров не активными
	$scope.tabsClassDisabled = function(index) {
		$scope.tabsD = '';
		if(!$scope.disabledTabArray[index].length) {
			return $scope.tabsD = 'product__category-tabs-disabled';
		}
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
  $scope.slideHasChanged = function($index) {
  	$scope.currentIndex = $index + 1
	};

  // Параметры
  $scope.showParameters = function() {
   	
		$ionicActionSheet.show({
     	buttons: [],

  	  titleText: 'Появится в следующей версии приложения',
     	cancelText: 'Закрыть',

     	buttonClicked: function(index) {
       	return true;
     	},

      cancelOnStateChange: function() {
        return true;
      }
   	});
  };

  // Alert
  $scope.alert = function(text) {
    alert(text);  
	};

	// Генератор массива рейтинга для каждого отзыва
	$scope.reviewRatingGenerator = function(val) {
	 	$scope.arrayRating = [];

    for(var i = 0; i < 5; i++) {
    	if(i < val) {
    		$scope.arrayRating.push(true)
    	}
    	else {
    		$scope.arrayRating.push(false);
    	}	
    }
	};


	// Табы на странице список покупок
  $scope.shoppingArrayTabs = [
  	{
		  title : "Мой список",
		  active : true,
		},
    { 
      title: "Уже купил",
      active : false,
    },
    { 
      title: "Рекомендованы",
      active : false,
    }
  ];

  $scope.shoppingListTabs = function(o) {
    $ionicScrollDelegate.scrollTop();
    for (var i = 0; i <= $scope.shoppingArrayTabs.length - 1; i++) {
      $scope.shoppingArrayTabs[i].active = false;
    }
    $scope.shoppingArrayTabs[o].active = true;

  };

  $scope.shoppingTabsClass = function(item) {

  	if(item.active) {
  		return 'product__shopping-tab-active';
  	}
  	return 'product__shopping-tab-deactive';
  };

});