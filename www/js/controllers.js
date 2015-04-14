var app = angular.module('starter.controllers', []);

// Контроллер главной
app.controller('MainCtrl', function($scope, $ionicLoading, $interval, Category, DB) {

	console.log('controller');
	$scope.percent = DB.percentLoading();
	var getPercent = function(){ $scope.percent = DB.percentLoading(); };
	var intervalPercent = $interval(function(){
		getPercent();
	}, 500);
	$scope.loadingIndicator = $ionicLoading.show({
	    content: 'Loading Data',
	    animation: 'fade-in',
	    showBackdrop: false,
	    maxWidth: 200,
	    showDelay: 500
	});
	$scope.roots = [];
	$scope.inf = 'ЗАГРУЖАЮ';
	$scope.title = 'Рейтинг товаров';
	DB.loading().then(function() {
		$scope.percent = 100;
		$interval.cancel( intervalPercent );
		intervalPercent = undefined;
		console.log("controler loading");
		Category.roots().then(function(roots) {
			angular.forEach(roots, function(root) {		
      Category.countProductsByObj(root, true).then(function(count) {		
        root['product_tested_count'] = count;		
      });
    });
    $scope.roots = roots;
    $scope.inf = '';
		$ionicLoading.hide();
  	});
	})

});

// Контроллер категорий
app.controller('CategoryCtrl', function($scope, $location, $stateParams, $ionicHistory, Category, Product) {

	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}

	Category.getById($stateParams.id).then(function(category) {
      $scope.title = category.name
      $scope.categories = [];
      $scope.noProducts = false;

			Category.childsByObj(category, category.lvl+1).then(function(categories) {

				if(categories.length > 0) {
					angular.forEach(categories, function(cat) {
	      		$scope.categories.push(cat);
	    		});
				}
				else {
					Product.getByCategoryId($stateParams.id).then(function(products) {
						if(products.length > 0) {

							$scope.products = [];

							$scope.productsCheck = [];
							$scope.productsBlack = [];
							$scope.productsWait = [];

							angular.forEach(products, function(product) {

		      			$scope.products.push(product);

		      			if(!product.tested) {
		      				$scope.productsWait.push(product);
		      			}
		      			else {
			      			if(product.tested && product.danger_level > 1) {
			      				$scope.productsBlack.push(product);
			      			}
		      				$scope.productsCheck.push(product);
		      			}

		    			});
						}
						else {
							$scope.noProducts = true;
						}
					});
				}

			});
	});

});

// Контроллер товаров
app.controller('ProductCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal, Product, Category, Rating) {

	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}

	$scope.reviews = null;
	$scope.ratings = [];
	$scope.main_properties = [];
	$scope.properties = [];

	// Общая информация
	Product.getById($stateParams.id).then(function(product) {
     	$scope.title = product.name
      $scope.product = product;

      $scope.arrayDangerLevel = [];
      for(var i = 0; i < 4; i++) {
      	if(i < product.danger_level) {
      		$scope.arrayDangerLevel.push(true)
      	}
      	else {
      		$scope.arrayDangerLevel.push(false);
      	}	
      }


      $scope.dangerLevelText = '';	
      switch(product.danger_level) {
      	case 1:
      		$scope.dangerLevelText = 'Низкая'
      		break;
      	case 2:
      		$scope.dangerLevelText = 'Средняя';	
      		break;
      	case 3:
      		$scope.dangerLevelText = 'Высокая';	
      		break;
      	case 4:
      		$scope.dangerLevelText = 'Максимальная';	
      		break;				
      };

      if(product.test_cons)      	
      	$scope.arrayMinus = product.test_cons.split(',');
      if(product.test_pros)  
      	$scope.arrayPlus = product.test_pros.split(',');

      Category.getById(product.category_id).then(function(category) {
      	$scope.category = category;
      	$scope.title = category.name;
      	var cproperties = []

      	if (category.properties) {
      		cproperties = JSON.parse(category.properties);
      	}

      	// характеристики товара
      	Product.properties($stateParams.id).then(function(properties) {
      		var pproperties = {};
      		angular.forEach(properties, function(property){
      			pproperties[property.property_id] = property;
      		});

      		angular.forEach(cproperties, function(cp){
      			angular.forEach(cp.properties, function(prop){
      				if (pproperties[prop.id]) {
						if (prop.is_main == true) {
      						$scope.main_properties.push({name: prop.name, value: pproperties[prop.id].value});
      					} else {
      						$scope.properties.push({name: prop.name, value: pproperties[prop.id].value});
      					}
      				}
      			});
      		});
      		console.log($scope.properties);
      	});
      });
	});

	// Отзывы
	Product.reviews($stateParams.id).then(function(resp) {
		$scope.reviews = resp;

		// Массив звезд рейтинга
	 	$scope.arrayRating = [];

    for(var i = 0; i < 5; i++) {
    	if(i < resp.avg_mark) {
    		$scope.arrayRating.push(true)
    	}
    	else {
    		$scope.arrayRating.push(false);
    	}	
    }


		// Преобразованная дата для каждого элемента
		angular.forEach(resp.items, function(item) {
	   	var date = item.created_at;
	   	item.created_date = new Date(item.created_at);
	  });

	 	console.log('ОБЬЕКТ С КОММЕНТАРИЯМИ', $scope.reviews);
	});

	// список названий рейтинга
	Rating.allHash().then(function(gratings) {
		// рейтинги продуктов
		Product.ratings($stateParams.id).then(function(ratings) {
			angular.forEach(ratings, function(rating){
				if (gratings[rating.rating_id]) {
					$scope.ratings.push({name: gratings[rating.rating_id].name, value: rating.value});
				}
			});
		});
	});

	// Шаблон окна с полным изображением товара
  $ionicModal.fromTemplateUrl('templates/modal/modal-product.html', {
    scope: $scope
  }).then(function(modalProduct) {
    $scope.modalProduct = modalProduct;
  });
  $scope.closeLogin = function() {
    $scope.modalProduct.hide();
  };


});


// Контроллер меню
app.controller('MenuCtrl', function($scope) {
	// Тут можно будет проставить ширину для меню на различных устройствах
	if (window.cordova) {
		$scope.menuWidth = parseInt(window.innerWidth * 80	 / 100);
	} else {
		$scope.menuWidth = 565;
	}
});
 

// Контроллер авторизации
app.controller('AuthorizationCtrl', function($scope, $http, $ionicModal, User) {

  // Обьект с парой логин-пароль
  $scope.loginData = {};
	$scope.userProfile = User.profile(true);

	if (User.is_auth()) {
		User.profile().then(function(profile){
			$scope.userProfile = profile;
		});
	} else if (!$scope.loginData['username']) {
		$scope.loginData['username'] = User.lastLoginEmail();
	}

	$scope.email = '';

  // Шаблон
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Закрыть
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $scope.loginData['password'] = '';
  };

  // Открыть
  $scope.login = function() {
    $scope.modal.show();
  };

  // Обработка данных
  $scope.doLogin = function() {

  	$scope.loginError = '';
		
		User.login($scope.loginData.username, $scope.loginData.password).then(function(data) {
			//window.localStorage.clear();
			if ('profile' in data) {
		  		$scope.userProfile = data.profile;
		  		$scope.closeLogin();
	  		} else {
	  			if (data['data']['user_message']) {
	  				$scope.loginError = data['data']['user_message'];
	  			}
			  	else if(data.status == 403) {
			  		$scope.loginError = 'Указан неверный логин или пароль!';
			  	}
			  	else {
			  		$scope.loginError = 'Ошибка авторизации, попробуйте позже!';
			  	}
	  		}
		});

  };

  // Разлогиниться
  $scope.logout = function() {
  	User.logout();
  	$scope.userProfile = null;
  }

});

// Список покупок
app.controller('ShoppingListCtrl', function($scope, User) {
	$scope.shoppingList = [];

	User.shoppingList().then(function(list){
		$scope.shoppingList = list;
	});
});

// Профиль пользователя
app.controller('UserProfileCtrl', function($scope, User) {
	$scope.profile = {};
	User.profile().then(function(profile){
		$scope.profile = profile;
		console.log($scope.profile);
	});
});

// О приложении
app.controller('AboutCtrl', function($scope) {
});
