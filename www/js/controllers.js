var app = angular.module('starter.controllers', ['ionic.rating']);

// Контроллер главной
app.controller('MainCtrl', function($scope, $ionicLoading, $rootScope, $interval, $http, Category, DB, Product, User) {
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
	$scope.network = false;
	$scope.title = 'Рейтинг товаров';
	$rootScope.seachActiveRoot = false;
	$rootScope.thisQuery = '';

	User.productList();
	User.shoppingList();
	User.productVotes();

	var load_roots = function() {
		$http.get('/v1/catalog/info?my_version=0').
		  success(function(data, status, headers, config) {
		  	$scope.network = true;
		  }).
		  error(function(data, status, headers, config) {
		  	$scope.network = false;
		  });
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
app.controller('CategoryCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal,  $ionicScrollDelegate, Category, Product, Company, Rating, User, DB) {


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
      User.productVotes();

			Category.childsByObj(category, category.lvl+1).then(function(categories) {
				if(categories.length > 0) {
					$scope.categories = [];

					angular.forEach(categories, function(cat) {
	      		$scope.categories.push(cat);
	    		});
				}
				else {

					$scope.price = {
						empty: true,
						min: 0,
						max: 0,
						value: 0
					};
					$scope.rating = {
						value: 0
					}

					var productGetCatProduct = function(companyIds, price, rating) {
						Product.getByCategoryId($stateParams.id, companyIds, price, rating).then(function(products) {
						if(products.length > 0) {

							$scope.productsCheck = [];
							$scope.productsBlack = [];
							$scope.productsWait = [];
							$scope.hasProducts = true;
							$scope.productChar = [];
							var arr = [];

							var userShoppingList = User.getShoppingListArray(),
									userProductList = User.getProductListArray();
									productVotes = User.getProductVotes();

							//
							$scope.updateProductList = function(product) {
								User.updateProductList(product.id).then(function(response) {
									var result = User.ProductResponse(response, 'товаров');
									DB.alert(result.str, result.title);
									if(result.status == 'add') {
										product.product_list = true;
									} 
									else if(result.status == 'remove') {
										product.product_list = false;
									}
								});
							}

							//
							$scope.addShoppingList = function(product) {
								User.updateShoppingList(product.id).then(function(response) {
									var result = User.ProductResponse(response, 'покупок');
									DB.alert(result.str, result.title);
									if(result.status == 'add') {
										product.shopping_list = true;
										product.slug = 'В списке покупок';
									} 
									else if(result.status == 'remove') {
										product.shopping_list = false;
										product.slug = 'В список покупок';
									}					
								});
							}

							//
							$scope.addProductVotes = function(product) {
								User.addProductVotes(product).then(function(response) {
									if(response === null)
										return false;

									product['vote_boolean'] = true;
		      				product['vote_text'] = 'Я За!';
								});
							}


							$scope.linkSlug = category.disposable ? 'У меня есть' : 'Покупаю постоянно';
							$scope.showCatName = (category.show_name == 1) ? category.name_sg : '';
							$scope.showBrand = (category.show_brand == 1) ? true : false;

							var companyIds = {};

							var priceMinMake = false;

							angular.forEach(products, function(productFull, index) {
								var product = {
									'id': productFull.id,
	      					'name': productFull.name,
	      					'thumbnail': productFull.thumbnail,
	      					'price': +productFull.price.toFixed(0),
	      					'rating': productFull.rating,
	      					'tested': productFull.tested,
	      					'danger_level': productFull.danger_level,
	      					'product_list': userProductList[productFull.id] ? true : false,
	      					'shopping_list': userShoppingList[productFull.id] ? true : false,
	      					'slug': userShoppingList[productFull.id] ? 'В списке покупок' : 'В список покупок',
	      					'company_name': productFull['company_name']
								};

								if($scope.price.empty) {
									if(product.price >= 1 && !priceMinMake) {
										priceMinMake = true;
										$scope.price.min = product.price;
									}

									if(product.price < $scope.price.min && product.price >= 1) {
										$scope.price.min = product.price;
										$scope.price.value = product.price
									}
									if(products.length - 1 == index) {
										if($scope.price.value == 0)
											$scope.price.value = $scope.price.min;
										$scope.price.empty = false
									}

									if(product.price > $scope.price.max) {
										$scope.price.max = product.price;
									}
								}

								companyIds[productFull.company_id] = true;

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
		      				product['vote_boolean'] = productVotes[productFull.id] ? true : false;
		      				product['vote_text'] = productVotes[productFull.id] ? 'Я Зa!' : 'На тест!'
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
							if($scope.price.value == 0) {
								$scope.price.value == $scope.price.min;
							}

							// Табы
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

						  // Соберем массив производителей текущей категории
						  if(!$scope.companies) {
							  $scope.companies = {};	
							  for(var id in companyIds) {
							  	Company.getById(id).then(function(company) {
							  		if(company['checked'] === undefined) {
							  			company['checked'] = true;			
							  		}
							  		$scope.companies[company.id] = company;	
							  	});
							  }
							}

						  // Шаблон окна фильтрации
						  $ionicModal.fromTemplateUrl('templates/modal/modal-filter.html', {
						    scope: $scope
						  }).then(function(modalFilter) {
						    $scope.modalFilter = modalFilter;
						  });
						  $scope.closeF = function() {
						    $scope.modalFilter.hide();
						  };

						}

						$scope.showProducts = true;
						});
					}
					productGetCatProduct();

					$scope.getFilterParams = function() {
						var ids = [];
						for(var company in $scope.companies) {
							if($scope.companies[company].checked) {
								ids.push($scope.companies[company].id);
							}
						}
						productGetCatProduct(ids, $scope.price.value, $scope.rating.value);
					};

					}

			});
	});

});

// Контроллер товаров
app.controller('ProductCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal, $http,  Product, Category, Rating, User, DB, Company) {
	$scope.overlayload = true;
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

     	User.productVotes().then(function() {
     		productVotes = User.getProductVotes();
				var userProductList = User.getProductListArray(),
						userShoppingList = User.getShoppingListArray();
				product['images_array'] = JSON.parse(product.images);
				product['product_list'] = userProductList[product.id] ? true : false;
				product['shopping_list'] = userShoppingList[product.id] ? true : false;
				product['slug'] = userShoppingList[product.id] ? 'В списке покупок' : 'В список покупок';
				product['vote_boolean'] = productVotes[product.id] ? true : false;
			  product['vote_text'] = productVotes[product.id] ? 'Вы проголосовали!' : 'Проголосовать за тест';

				$scope.updateProductList = function(product) {
					User.updateProductList(product.id).then(function(response) {
						var result = User.ProductResponse(response, 'товаров');
						DB.alert(result.str, result.title);
						if(result.status == 'add') {
							product.product_list = true;
						} 
						else if(result.status == 'remove') {
							product.product_list = false;
						}
					});
				}

				$scope.addShoppingList = function(product) {
					User.updateShoppingList(product.id).then(function(response) {
						var result = User.ProductResponse(response, 'покупок');
						DB.alert(result.str, result.title);
						if(result.status == 'add') {
							product.shopping_list = true;
							product.slug = 'В списке покупок';
						} 
						else if(result.status == 'remove') {
							product.shopping_list = false;
							product.slug = 'В список покупок'
						}					
					});
				}

				$scope.addProductVotes = function(product) {
					User.addProductVotes(product).then(function(response) {
						if(response === null)
										return false;

						product['vote_boolean'] = true;
	  				product['vote_text'] = 'Вы проголосовали!';
					});
				}

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
	      	$scope.arrayMinus  = JSON.parse(product.test_cons);

	      if(product.test_pros) 
	      	$scope.arrayPlus  = JSON.parse(product.test_pros);


	      Category.getById(product.category_id).then(function(category) {
	      	$scope.category = category;
	      	$scope.title = category.name;
	      	$scope.showCatName = category.show_name == 1 ? category.name_sg : '';
	      	$scope.linkSlug = category.disposable ? 'У меня есть' : 'Покупаю постоянно';

	      	if(category.show_brand == 1) {
	      		Company.getById(product.company_id).then(function(company) {
	      			product.company_name = company.name;
	      		})
	      	}
	      	
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
	      			$scope.overlayload = false;
	      		});
	      	});
	      });
     	});
	});

	// Отзывы
	Product.reviews($stateParams.id).then(function(resp) {
		$scope.reviews = resp;

		// Массив звезд рейтинга

    /* Старый рейтинг
    $scope.arrayRating = [];

    for(var i = 0; i < 5; i++) {
    	if(i < resp.avg_mark) {
    		$scope.arrayRating.push(true)
    	}
    	else {
    		$scope.arrayRating.push(false);
    	}	
    }
    */

    var objReviews = {
      positive: {
        count: 0,
        procent: 0
      },
      negative: {
        count: 0,
        procent: 0
      }
    };

    var reviewsCount = resp.items.length;
    for(var i = 0; i < reviewsCount; i++) {
      if(resp.items[i].mark >= 3) {
        objReviews.positive.count++;
      }
      else {
        objReviews.negative.count++;
      }
    };

    objReviews.positive.procent = (objReviews.positive.count * 100 / reviewsCount).toFixed(0);
    objReviews.negative.procent = (objReviews.negative.count * 100 / reviewsCount).toFixed(0);

    $scope.objReviews = objReviews;

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

  // Добавление отзывов от товаре
  $ionicModal.fromTemplateUrl('templates/modal/add-review.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  
  $scope.rating = 1;
  $scope.revData = {
    rating : 1,
    max: 5
  }
  

  /* Пример слушателя
	$scope.$watch('revData.rating', function() {
	  console.log('New value: '+$scope.revData.rating);
	});
	*/ 

  // Открыть
  $scope.showReview = function() {
  	if (!User.is_auth()) {
			DB.alert('Добавлять отзывы о товаре могут только авторизованные пользователи!', 'Внимание!');
			return false;
		}
  	$scope.modal.show();
  };

  // Закрыть
  $scope.closeReview = function() {
    $scope.modal.hide();
  };

  // Попытка добавить отзыв
  $scope.addReview = function(product) {
  	User.productReviews(product.id, $scope.revData).then(function(response) {
  		if(response.status === 200) {
				$scope.closeReview();
				DB.alert('Ваш отзыв успешно добавлен!' , 'Спасибо за отзыв!');
				$scope.reмErr = '';
				  $scope.revData = {
    				rating : 1,
    				max: 5
  				}
			}
			else {
				if(response.status === 400) {
					$scope.revErr = 'Ошибка добавления! ' + response.data.user_message;
				}
				else {
					$scope.revErr = 'Ошибка добавления! Статус: ' + response.status + ' Попробуйте позже!'
				}
			}
  	});
  };

});


// Контроллер меню
app.controller('MenuCtrl', function($scope, $ionicSideMenuDelegate, $rootScope,  User) {
	// Тут можно будет проставить ширину для меню на различных устройствах
	/*
	if (window.cordova) {
		$scope.menuWidth = parseInt(window.innerWidth * 80	 / 100);
	} else {
		$scope.menuWidth = 558;
	}
	*/

	$scope.closeMenu = function(w) {
		$rootScope.where = w;
		if (User.is_auth()) {
			$ionicSideMenuDelegate.toggleRight();
		}
	}

	$scope.shoppingListCountUpdate = function() {
		$scope.shoppingListCount = localStorage.getItem('ShoppingListCount');
	};

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
app.controller('AuthorizationCtrl', function($scope, $http, $ionicModal, $ionicSideMenuDelegate, $rootScope, $ionicBackdrop, $location, User) {


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
    $scope.loginError = '';
		if($rootScope.where == 'recommended') {
			if(!User.is_auth()) {
    		$location.path('/');
			}
    	else {
    		$ionicSideMenuDelegate.toggleRight();
    		$location.path('/app/user/shopping-list');
    	} 
		}
  };

  // Открыть
  $scope.login = function(w) {
  	if(!localStorage.getItem('rk_user')) {
    	$scope.modal.show();
  	}
  };

  var do_login = function(data){
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
  };

  // Обработка данных
  $scope.doLogin = function() {

		$scope.loginError = '';

		User.login($scope.loginData.username, $scope.loginData.password).then(function(data) {
			//window.localStorage.clear();
			do_login(data);
		});

  };

  // Разлогиниться
  $scope.logout = function() {
  	User.logout();
  	$rootScope.where = null;
  	$scope.userProfile = null;
  }

	$scope.socialLogin = function(social) {
		var method = social + 'Oauth';
        User[method]().then(function(result) {
//        	console.log(JSON.stringify(result));
        	do_login(result);
        }, function(error) {
        	console.log(JSON.stringify(error));
        });
    };
});

// Регистрация
app.controller('RegistrationCtrl', function($scope, $ionicModal, $rootScope, $location, User, DB) {

	$scope.regData = {};
	$scope.regErr = '';

	// Шаблон
  $ionicModal.fromTemplateUrl('templates/modal/registration.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Открыть
  $scope.showReg = function() {
  	if(!localStorage.getItem('rk_user')) {
    	$scope.modal.show();
  	}
  };

  // Закрыть
  $scope.closeReg = function() {
    $scope.modal.hide();
  };


  // Попытка регистрации
  $scope.doReg = function() {
  	User.registration($scope.regData.firstName, $scope.regData.lastName, $scope.regData.userEmail).then(function(response) {

			if(response.status === 200) {
				$scope.closeReg();
				DB.alert('Успешная регистрация! Для активации аккаунта перейдите по ссылке, которую мы отправили Вам на электронную почту - ' + $scope.regData.userEmail , 'Поздравляем!');
				$scope.regErr = '';
				$scope.regData = {};
			}
			else {
				if(response.status === 400) {
					$scope.regErr = 'Ошибка регистрации! ' + response.data.user_message;
				}
				else {
					$scope.regErr = 'Ошибка регистрации! Статус: ' + response.status + ' Попробуйте позже!'
				}
			}

		});
  }	

  $scope.windowOpen = function(href) {
  	window.open(href, '_system', 'location=yes');
  }

});


// Список покупок
app.controller('ShoppingListCtrl', function($scope, $rootScope, User, Product, Category, Search, DB) {
	$scope.seachData = function (query, key) {
		$scope.seachActive = false;
		if(key == true) {
			if (query.length < 3)
				return;
			else
				$scope.seachActive = true;	
		}

		$scope.shoppingListShow = false;
		$scope.shoppingList = [];
		$scope.recommendedList = [];
		var userProductList = User.getProductListArray();
		var userShoppingList = User.getShoppingListArray();

		//
		User.shoppingList().then(function(list) {
			var ids = [];
			var shoppingList = {};

			angular.forEach(list, function(p){
				ids.push(p.productId);
				shoppingList[p.productId] = p;
			});

			Product.getByIds(ids).then(function(products) {

				// соберем категории
				var cids = [];
				var cats = {};

				angular.forEach(products, function(product) {
					cids.push(product.category_id);
				});

				Category.getByIds(cids, 'name').then(function(categories) {
					angular.forEach(categories, function(category){
						cats[category.id] = {c: category, p: []};
					});

					angular.forEach(products, function(product) {
						if (shoppingList[product.id] && cats[product.category_id]) {
							var p = shoppingList[product.id];
							var c = cats[product.category_id];
							p['product'] = product;
							c.p.push(p);
						}
					});

					angular.forEach(cats, function(c) {
						if (c.p.length) {
							$scope.shoppingList.push(c);
						}
					});
					$scope.shoppingListShow = true;
				});
			});

		});

		if(query) {	
			$rootScope.thisQuery = query; 

			if($rootScope.seachActiveRoot) {
				return false;
			}

			$rootScope.seachActiveRoot = true;
			goSearch(query);

		}

		function goSearch(query) {
			Search.products(query).then(function(products) {
				for (var i = 0, length = products.length; i < length; i++) {
					products[i]['product_list'] = userProductList[products[i].id] ? true : false;
					products[i]['shopping_list'] = userShoppingList[products[i].id] ? true : false;
					products[i]['slug'] = userShoppingList[products[i].id] ? 'В списке покупок' : 'В список покупок';				
				}
				console.log(products);
				$scope.searchList = products;
				$rootScope.seachActiveRoot = false;

				if(query != $rootScope.thisQuery) {
					goSearch($rootScope.thisQuery);
				}

			});	
		}

		$scope.updateProductList = function(product) {
			User.updateProductList(product.id).then(function(response) {
				var result = User.ProductResponse(response, 'товаров');
				DB.alert(result.str, result.title);
				if(result.status == 'add') {
					product.product_list = true;
				} 
				else if(result.status == 'remove') {
					product.product_list = false;
				}
			});
		}
		$scope.addShoppingList = function(product, shoplist) {
			if(shoplist)
				product.id = product.productId;
			User.updateShoppingList(product.id).then(function(response) {
				var result = User.ProductResponse(response, 'покупок');
				if(!shoplist)
					DB.alert(result.str, result.title);
				if(result.status == 'add') {
					product.shopping_list = true;
					$scope.shopping_list_count = localStorage.getItem('ShoppingListCount');
					product.slug = 'В списке покупок';
				} 
				else if(result.status == 'remove') {
					product.shopping_list = false;
					product.slug = 'В список покупок'
				}					
			});
		}

		// Массив id-шников купленных товаров
		var alreadyBuy = [];
		if(localStorage.getItem('alreadyBuy')) {
			alreadyBuy = JSON.parse(localStorage['alreadyBuy']);
		}

		// Уже купил, функцию дергаем в нескольких местах
		var alreadyBuyFunc = function() {
			if(!alreadyBuy.length)
				return;

			Product.getByIds(alreadyBuy, false, true, true).then(function(products) {
			for (var i = 0, length = products.length; i < length; i++) {
				products[i]['product_list'] = userProductList[products[i].id] ? true : false;
				products[i]['shopping_list'] = userShoppingList[products[i].id] ? true : false;
				products[i]['slug'] = userShoppingList[products[i].id] ? 'В списке покупок' : 'В список покупок';				
			}
			$scope.alreadyBuyList = products;
			});
		}

		// Удаление товаров из списка покупок, обновление счетчика категорий
		$scope.hide = function(item, category, list) {
			var id = item['productId'];
			setTimeout(function() {
				for(var i = 0, length = category.p.length; i <= length; i++) {
					if(category.p[i]['productId'] === id) {
						category.p.splice(i, 1);
						break;
					}
				}
				$scope.shopping_list_count = localStorage.getItem('ShoppingListCount');
				item.hide = true;

				alreadyBuy.push(id);
				localStorage['alreadyBuy'] = JSON.stringify(alreadyBuy);

				alreadyBuyFunc();

			}, 500);
		}

		// Очистка списка купленных товаров
		$scope.alreadyBuyClear = function() {
			localStorage.removeItem('alreadyBuy');
			$scope.alreadyBuyList = null;
			DB.alert('Список купленных товаров успешно очищен!', 'Выполнено!');
		}
		alreadyBuyFunc();


		// Рекомендованные товары
		User.recommendedList().then(function(list) {
			Product.getByIds(list, false, true, true).then(function(products) {
			for (var i = 0, length = products.length; i < length; i++) {
				products[i]['product_list'] = userProductList[products[i].id] ? true : false;
				products[i]['shopping_list'] = userShoppingList[products[i].id] ? true : false;
				products[i]['slug'] = userShoppingList[products[i].id] ? 'В списке покупок' : 'В список покупок';				
			}
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


// Редактирования профиля пользователя
app.controller('UserProfileEditCtrl', function($scope, User, DB) {
	if (!User.is_auth()) {
		$ionicHistory.nextViewOptions({
   			disableBack: true
		});
		$location.path('/');
		return false;
	}

	$scope.profile = User.profile(true);
	$scope.profileEditData = $scope.profile;
	var profileEditClick = false;

	$scope.doProfileEdit = function() {
		if(!profileEditClick) {
			profileEditClick = true;
	  	User.profileEdit($scope.profileEditData).then(function(response) {
				if(response.status === 200) {
					//console.log('true');
					$scope.profile = $scope.profileEditData;
					DB.alert('Ваш профиль успешно изменен!', 'Выполнено!');
				}
				else {
					DB.alert('Ошибка сохранения профиля: <br>' + response.data.user_message, 'Ошибка!');
				}
				profileEditClick = false;

			});
  	}
  }	

});

// О приложении
app.controller('AboutCtrl', function($scope, DB, Product, Category, $window) {
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

  $scope.windowOpen = function(href) {
  	window.open(href, '_system', 'location=yes');
  }


});

// список статей
app.controller('ArticlesCtrl', function($scope, $ionicHistory, $ionicModal, $location, $window, Article, Category) {
	var limit = 10

	$scope.count_articles = 0
	$scope.real_count_articles = 0
	$scope.articles = [];
	$scope.total_count = 0;
	$scope.hide_loader = false;
	$scope.error = null;
	$scope.distance_procent = '50%';
	$scope.rubrics = [];
	$scope.cat = null,
	$scope.rubric = null;
	$scope.paramR = false;
	$scope.paramC = false;

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

	// Фильтр по рубрике
  $ionicModal.fromTemplateUrl('templates/modal/modal-sorting-rubric.html', {
    scope: $scope
  }).then(function(modalSortingRubric) {
    $scope.modalSortingRubric = modalSortingRubric;
  });

  $scope.close = function() {
    $scope.modalSortingRubric.hide();
  };


  // Фильтр по категории
  $ionicModal.fromTemplateUrl('templates/modal/modal-sorting-category.html', {
    scope: $scope
  }).then(function(modalSortingCategory) {
    $scope.modalSortingCategory = modalSortingCategory;
  });

  $scope.closeC = function() {
    $scope.modalSortingCategory.hide();
  };

	$scope.addParams = function(category, rubric) {
  	$location.search({
  		'category': category,
  		'rubric' : rubric
  	});
  	$window.location.reload();	
	};

  var getParams = $location.search();
  $scope.cat = getParams.category;
  $scope.rubric = getParams.rubric;


	Category.roots().then(function(r) {
		for(var key in r) {
			if(r[key].id == $scope.cat) {
				r[key].active = true;
				$scope.paramC = true;	
			}
			else {
				r[key].active = false;
			}
		}
		$scope.category = r;
	});


  Article.getRubrics().then(function(r) {
  	$scope.rubrics = r;
		for(var key in r) {
			if(r[key].rubric === $scope.rubric) {
				r[key].active = true;
				$scope.paramR = true;	
			}
			else {
				r[key].active = false;
			}
		}
		$scope.rubrics = r;
	});


	$scope.loadMore = function() {
    Article.list($scope.cat, $scope.rubric, limit, $scope.count_articles).then(function(data) {
    	$scope.total_count = data.total_count;
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
				$scope.hide_loader = true;

      	} 
      	else {
					$scope.error = 'проблемы с подключением';
			}

  			$scope.$broadcast('scroll.infiniteScrollComplete');
    	});
  	};

  	$scope.moreCanBeLoaded = function() {
  		if ($scope.total_count >= $scope.count_articles) {
  		//console.log("moreDataCanBeLoaded true", $scope.total_count, $scope.count_articles);
  			return false;
  		}

  		//console.log("moreDataCanBeLoaded false", $scope.total_count, $scope.count_articles);
  		return true;
  	};

});

// вывод статьи
app.controller('ArticleCtrl', function($scope, $stateParams, $location, $ionicModal,  $ionicHistory, Article, User, DB) {

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

	Article.getById($stateParams.id).then(function(data) {
		if ('html' in data) {
			$scope.article = data;

			/*
			var s = document.createElement('script');
      s.src = 'http://api.roscontrol.com/compiled/js/mobile_article.js';
      document.body.appendChild(s);
      */

		} else {
			$scope.error = 'проблемы с подключением';
		}

		$scope.hide_loader = true;
	});


	// Только для авторизованных пользователей
	$scope.modalCommentUserCheck = function() {
	  if (!User.is_auth()) {
			DB.alert('Добавлять комментарии могут только авторизованные пользователи!', 'Внимание!');
			return false;
		}
  	$scope.modalComment.show();
	};

	// Фильтр по рубрике
  $ionicModal.fromTemplateUrl('templates/modal/add-comment.html', {
    scope: $scope
  }).then(function(modalComment) {
    $scope.modalComment = modalComment;
  });

  // Закрыть
  $scope.close = function() {
    $scope.modalComment.hide();
  };

  // Попытка добавить комментарий
  $scope.commentData = {};
  $scope.addComment = function(article) {

  	User.addComment(article, $scope.commentData.text).then(function(response) {
  		if(response.status === 200) {
				$scope.close();
				DB.alert('Ваш комментарий успешно добавлен!' , 'Успех!');
			}
			else {
				if(response.status === 400) {
					$scope.commentErr = 'Ошибка добавления! ' + response.data.user_message;
				}
				else {
					$scope.commentErr = 'Ошибка добавления! Статус: ' + response.status + ' Попробуйте позже!'
				}
			}
  	});
  };



});

