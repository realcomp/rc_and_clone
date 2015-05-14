var app = angular.module('starter.controllers', []);

// Контроллер главной
app.controller('MainCtrl', function($scope, $ionicLoading, $interval, Category, DB, Product) {
	//console.log('main controller');

	if (window.cordova) {
		$scope.percent = 100;
	} else {
		$scope.percent = DB.percentLoading();
	}

/*	var getPercent = function(){ $scope.percent = DB.percentLoading(); };
	var intervalPercent = $interval(function(){
		getPercent();
	}, 500);*/
	$scope.loadingIndicator = $ionicLoading.show({
	    content: 'Идет загрузка',
	    animation: 'fade-in',
	    showBackdrop: false,
	    maxWidth: 200,
	    showDelay: 500
	});

	if (!window.cordova) {
		$scope.$on('loadUpdate', function(event) {
			$scope.percent = DB.percentLoading();
		})

		$scope.inf = 'Загрузка...';
	}

	$scope.roots = [];
	$scope.title = 'Рейтинг товаров';

	var load_roots = function(){
		Category.roots().then(function(roots) {
			angular.forEach(roots, function(root) {
      			Category.countProductsByObj(root, true).then(function(count) {
        			root['product_tested_count'] = count;		
      			});
    		});

			if (!window.cordova) {
    			$scope.inf = '';
			}

    		$scope.roots = roots;
			$ionicLoading.hide();
/*			Category.count().then(function(res){
				console.log("count categories", res.count);
			});
			Product.count().then(function(res){
				console.log("count products", res.count);
			});*/
  		});
	};

	DB.loading().then(function() {
		if (!window.cordova) {
			$scope.percent = 100;
		}

//		$interval.cancel( intervalPercent );
//		intervalPercent = undefined;
		//console.log("main controler loading");
		load_roots();
	});

	$scope.$on('dbUpdate', function(event){
//console.log("main ctrl dbUpdate");
		load_roots();
	});
});

// Контроллер категорий
app.controller('CategoryCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal,  $ionicScrollDelegate, Category, Product, Rating) {

	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}

	$scope.hasProducts = false; // есть продукты в категории
	$scope.showProducts = false; // показываем в категории продукты
  	$scope.title = '';

	Category.getById($stateParams.id).then(function(category) {

      	$scope.title = category.name;

			Category.childsByObj(category, category.lvl+1).then(function(categories) {
				if(categories.length > 0) {
					$scope.categories = [];

					angular.forEach(categories, function(cat) {
	      				$scope.categories.push(cat);
	    			});
				}
				else {
					Product.getByCategoryId($stateParams.id).then(function(products) {
						if(products.length > 0) {
							$scope.productsCheck = [];
							$scope.productsBlack = [];
							$scope.productsWait = [];
							$scope.hasProducts = true;
							$scope.productChar = [];
							var arr = [];

							$scope.showCatName = (category.show_name == 1) ? category.name_sg : '';

							angular.forEach(products, function(productFull) {

								var product = {
									'id': productFull.id,
	      					'name': productFull.name,
	      					'thumbnail': productFull.thumbnail,
	      					'price': +productFull.price.toFixed(0),
	      					'rating': productFull.rating,
	      					'tested': productFull.tested,
	      					'danger_level': productFull.danger_level
								}	

			      		// список названий рейтинга
								Rating.allHash().then(function(gratings) {

									// рейтинги продуктов
									Product.ratings(product.id).then(function(ratings) {
										angular.forEach(ratings, function(rating, index) {
											if (gratings[rating.rating_id]) {
												product['value_ch_' + index] = rating.value;
												arr.push(gratings[rating.rating_id].name);
											}
										});

										// Выбираем только уникальные характеристики для сортировки
										var obj = {};
										for(var i = 0; i < arr.length; i++) {
											obj[arr[i]] = true;
										}
										var keys = Object.keys(obj);

										var arrButtons = [];
										arrButtons.push(
											{ text: 'Общий рейтинг', order: ['danger_level', '-rating'], 'active': true },
											{ text: 'Цена', order: ['-price'], 'active': false },
											{ text: 'Алфавит', order: ['name'], 'active': false }
										);

								 		for(var i = 0; i < keys.length; i++) {
								 			arrButtons.push({ 'text': keys[i], 'order': ['-value_ch_' + i, '-rating'], 'active': false });
								 		}
								 		$scope.arrButtons = arrButtons;

									});

								});

								
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

						$scope.tabActive = 0;

						if ($scope.productsCheck.length) {
							$scope.classTabCheck = 'product__category-tabs-active';
							$scope.tabActive = 1;
						} else {
							$scope.classTabCheck = 'product__category-tabs-disabled';
						}

						if ($scope.productsBlack.length) {
							if (!$scope.tabActive) {
								$scope.classTabBlack = 'product__category-tabs-active';
								$scope.tabActive = 2;
							} else {
								$scope.classTabBlack = 'product__category-tabs-deactive';
							}
						} else {
							$scope.classTabBlack = 'product__category-tabs-disabled';
						}

						if ($scope.productsWait.length) {
							if (!$scope.tabActive) {
								$scope.classTabWait = 'product__category-tabs-active';
								$scope.tabActive = 3;
							} else {
								$scope.classTabWait = 'product__category-tabs-deactive';
							}
						} else {
							$scope.classTabWait = 'product__category-tabs-disabled';
						}

							// Шаблон окна с сортировкой товаров
						  $ionicModal.fromTemplateUrl('templates/modal/modal-sorting.html', {
						    scope: $scope
						  }).then(function(modalSorting) {
						    $scope.modalSorting = modalSorting;
						  });
						  $scope.close = function() {
						    $scope.modalSorting.hide();
						  };

						  // Сортировка 
						  $scope.orderProp = ['danger_level', '-rating'];
						  $scope.sorting = function(index, order) {
						  	$ionicScrollDelegate.scrollTop();
						    $scope.orderProp = order;
					      for(var i = 0; i < $scope.arrButtons.length; i++) {
    							$scope.arrButtons[i].active = false;
  							}
    						$scope.arrButtons[index].active = true;
						  };

						}

						$scope.showProducts = true;
					});
				}

			});
	});

});

// Контроллер товаров
app.controller('ProductCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal, $http,  Product, Category, Rating) {

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
			var images = product.images;
			images = images.split(',');
			product['images_array'] = images;

			// Временная проверка массива изображений на 404, последний элемент часто битый..
			for(var i = 0; i < product['images_array'].length; i++) {
				var count = 0;
				$http.get(product['images_array'][i]).
					success(function() {
						count++;
				}).
				error(function(data, status) {
					count++;
					if (status == 404) {
						product['images_array'].splice( (count - 1) , 1);
					}	
				});
			};

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
      	$scope.showCatName = (category.show_name == 1) ? category.name_sg : '';
      	
      	var cproperties = []
      	if (category.properties) {
      		cproperties = JSON.parse(category.properties);
      	}
      	//console.log(cproperties);

      	// характеристики товара
      	Product.properties(product.id).then(function(properties) {
      		var pproperties = {};
      		angular.forEach(properties, function(property){
      			pproperties[property.property_id] = property;
      		});

      		$scope.properties = [];
      		angular.forEach(cproperties, function(cp, index) {
      			angular.forEach(cp.properties, function(prop) {	
      				if (pproperties[prop.id]) {
								prop['value'] = pproperties[prop.id].value;		
		      		}
      			});
      			$scope.properties.push(cp);
      		});
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
	/*
	if (window.cordova) {
		$scope.menuWidth = parseInt(window.innerWidth * 80	 / 100);
	} else {
		$scope.menuWidth = 558;
	}
	*/

	if(window.innerWidth <= 640) {
		if(window.innerWidth <= 360)
			$scope.menuWidth = window.innerWidth - 64;
		else if(window.innerWidth <= 420)
			$scope.menuWidth = window.innerWidth - 67;
		else
			$scope.menuWidth = window.innerWidth - 79;
	}
	else {
		$scope.menuWidth = 557;
	} 

});
 

// Контроллер авторизации
app.controller('AuthorizationCtrl', function($scope, $http, $ionicModal, $ionicBackdrop, $location, User) {

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
	var where = '';

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
    $scope.loginError = '';
		if(where == 'recommended' && !User.is_auth())
    	$location.path('/');
  };

  // Открыть
  $scope.login = function(w) {
  	where = w || '';
  	if(!localStorage.getItem('rk_user')) {
    	$scope.modal.show();
  	}
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
app.controller('ShoppingListCtrl', function($scope, $rootScope,  User, Product, Category, Search) {
	$scope.seachData = function (query, key) {
		$scope.seachActive = false;
		if(key == true) {
			if (query.length < 3)
				return;
			else
				$scope.seachActive = true;	
		}

		$scope.shoppingList = [];
		$scope.recommendedList = [];
		$rootScope.listCount = '';

		User.shoppingList().then(function(list) {
			var ids = [];
			var shoppingList = {};

			if(list)
				$rootScope.listCount = list.length;

			angular.forEach(list, function(p){
				ids.push(p.productId);
				shoppingList[p.productId] = p;
			});

			Product.getByIds(ids).then(function(products) {

				// соберем категории
				var cids = [];
				var cats = {};

				angular.forEach(products, function(product){
					cids.push(product.category_id);
				});

				Category.getByIds(cids, 'name').then(function(categories){
					angular.forEach(categories, function(category){
						cats[category.id] = {c: category, p: []};
					});

					angular.forEach(products, function(product){
						if (shoppingList[product.id] && cats[product.category_id]) {
							var p = shoppingList[product.id];
							var c = cats[product.category_id];
							p['product'] = product;
							c.p.push(p);
						}
					});

					angular.forEach(cats, function(c){
						if (c.p.length) {
							$scope.shoppingList.push(c);
						}
					});
				});
			});

		});

		if(query) {	
			var el = document.getElementsByClassName('product__shopping-search');
			el[0].setAttribute('disabled', true);
			Search.products(query).then(function(products) {
				$scope.searchList = products;
				el[0].removeAttribute('disabled');
				el[0].focus();
			});
		}	

		User.recommendedList().then(function(list) {
			Product.getByIds(list).then(function(products) {
				$scope.recommendedList = products;
			});
		});

	}
	$scope.seachData();

});


// Профиль пользователя
app.controller('UserProfileCtrl', function($scope, User) {
	if (!User.is_auth()) {
		$ionicHistory.nextViewOptions({
   			disableBack: true
		});
		$location.path('/');
		return false;
	}

	$scope.profile = User.profile(true);
	$scope.dproducts = {};
	$scope.products = {};

	User.profile().then(function(profile){
		$scope.profile = profile;
	});

	// походу перепутан параметр в api сайта
	User.productList(0).then(function(data){
		$scope.dproducts = data;
	});

	User.productList(1).then(function(data){
		$scope.products = data;
	});
});

// О приложении
app.controller('AboutCtrl', function($scope, DB, Product, Category) {
	DB.version().then(function(res){
		$scope.dbv = res;
	});
	Product.count().then(function(res){
		$scope.pcount = res.count;
	});
	Category.count().then(function(res){
		$scope.ccount = res.count;
	});

	$scope.iW = window.innerWidth;
  $scope.iH = window.innerHeight;

});

// список статей
app.controller('ArticlesCtrl', function($scope, $ionicHistory, Article) {
	var limit = 10;

	$scope.count_articles = 0
	$scope.real_count_articles = 0
	$scope.articles = [];
	$scope.total_count = 0;
	$scope.hide_loader = false;
	$scope.error = null;
	$scope.distance_procent = '50%';
	$scope.rubrics = [];

/*	Article.list(0, 0, 20, $scope.count_articles).then(function(data){
//		console.log(data);
		if ('items' in data && 'total_count' in data) {
			$scope.total_count = data.total_count;
			$scope.articles = data.items;
			count_articles = $scope.articles.length;
		} else {
			$scope.error = 'проблемы с подключением';
		}

		$scope.hide_loader = true;
	});*/

	Article.getRubrics().then(function(r) {
		$scope.rubrics = r;
	});

	$scope.loadMore = function() {
    Article.list(0, 0, limit, $scope.count_articles).then(function(data) {
			
			if ('items' in data && 'total_count' in data) {
				$scope.count_articles += limit;

				if (data.items.length > 0) {
					$scope.real_count_articles += data.items.length;
					angular.forEach(data.items, function(article){
						$scope.articles.push(article);
					});

					if ($scope.real_count_articles > 100) {
						$scope.distance_procent = '1%';
					} else if ($scope.real_count_articles > 50) {
						$scope.distance_procent = '5%';
					} else if ($scope.real_count_articles > 40) {
						$scope.distance_procent = '10%';
					} else if ($scope.real_count_articles > 30) {
						$scope.distance_procent = '20%';
					} else if ($scope.real_count_articles > 20) {
						$scope.distance_procent = '30%';
					} else if ($scope.real_count_articles > 10) {
						$scope.distance_procent = '40%';
					}
				}

				$scope.error = null;
      		} else {
				$scope.error = 'проблемы с подключением';
			}

  			$scope.$broadcast('scroll.infiniteScrollComplete');
    	});
  	};

  	$scope.moreCanBeLoaded = function(){
  		if ($scope.total_count >= $scope.count_articles) {
  		//console.log("moreDataCanBeLoaded true", $scope.total_count, $scope.count_articles);
  			return false;
  		}

  		//console.log("moreDataCanBeLoaded false", $scope.total_count, $scope.count_articles);
  		return true;
  	};

});

// вывод статьи
app.controller('ArticleCtrl', function($scope, $stateParams, $location, $ionicHistory, Article) {
	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   			disableBack: true
		});
		$location.path('/');
		return false;
	}

	Article.getRubrics().then(function(r) {
		$scope.rubrics = r;
	});

	$scope.article = {html: '', comments: []};
	$scope.hide_loader = false;
	$scope.error = null;

	Article.getById($stateParams.id).then(function(data){
		if ('html' in data) {
			$scope.article = data;
		} else {
			$scope.error = 'проблемы с подключением';
		}

		$scope.hide_loader = true;
	});
});


