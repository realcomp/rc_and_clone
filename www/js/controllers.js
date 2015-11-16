var app = angular.module('starter.controllers', ['ionic.rating']);

var articleUrlParam = {
  cat: null,
  rubric: null
};

// Контроллер главной
app.controller('MainCtrl', function($scope, $ionicLoading, $rootScope, $interval, $http, Category, DB, Product, User, Url) {
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
	$rootScope.seachActiveRoot = false;
	$rootScope.thisQuery = '';

	User.productList();
	User.shoppingList();
	User.productVotes();

	var load_roots = function() {
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
app.controller('CategoryCtrl', function($scope, $q, $location, $stateParams, $ionicHistory, $ionicModal,  $ionicScrollDelegate, Category, Product, Company, Rating, User, DB) {


	var onlyNumber = !isNaN(parseFloat($stateParams.id)) && isFinite($stateParams.id) && (0 < $stateParams.id);
	if(!onlyNumber) {
		$ionicHistory.nextViewOptions({
   		disableBack: true
		});
		$location.path('/');
		return false;
	}


	//
  var productsCheck = [];
  var productsBlack = [];
  var productsWait = [];
  var deferred = $q.defer();
  var limit = 15;

  $scope.tabActive = 0;
  $scope.productsCheck = [];
  $scope.productsBlack = [];
  $scope.productsWait = [];
  $scope.showLoadMore = 1;
  $scope.showTabs = false
  $scope.showEmptyText = false


	// Переключение табов
  $scope.tabsCategory = function($event, o) {
    var c;

    if (o == 1) {
      c = $scope.classTabCheck;
    }
    else if (o == 2) {
      c = $scope.classTabBlack;
    }
    else if (o == 3) {
      c = $scope.classTabWait;
    }

    if (c == 'product__category-tabs-active' || c == 'product__category-tabs-disabled') {
      return false;
    }

    if ($scope.classTabCheck == 'product__category-tabs-active') {
      $scope.classTabCheck = 'product__category-tabs-deactive';
    }
    else if ($scope.classTabBlack == 'product__category-tabs-active') {
      $scope.classTabBlack = 'product__category-tabs-deactive';
    }
    else if ($scope.classTabWait == 'product__category-tabs-active') {
      $scope.classTabWait = 'product__category-tabs-deactive';
    }

    if (o == 1) {
      $scope.classTabCheck = 'product__category-tabs-active';
    }
    else if (o == 2) {
      $scope.classTabBlack = 'product__category-tabs-active';
    }
    else if (o == 3) {
      $scope.classTabWait = 'product__category-tabs-active';
    }

    $scope.tabActive = o;
		//moveProducts();
		$ionicScrollDelegate.scrollTop();
		return true;
  };

	// Копирование товаров в scope
  var moveProducts = function(first) {

		function f(tabActive) {

			var arr = [];
			var thisArr = [];
			var thisLimit = limit;

      if(tabActive == 1) {
        arr = productsCheck;
        thisArr =  $scope.productsCheck;
      }
      else if(tabActive == 2) {
        arr = productsBlack;
        thisArr =  $scope.productsBlack;
      }
      else if(tabActive == 3) {
        arr = productsWait;
        thisArr =  $scope.productsWait;
      }

      if(arr.length < thisLimit) {
        thisLimit = arr.length;
      }

      for(var i = 0; i < thisLimit; i++) {
        thisArr.push(arr[i]);
      }

      arr.splice(0, thisLimit);
      $scope.showLoadMore = arr.length;

    };

    if(first) {
      f(1);
      f(2);
      f(3);


      if (productsCheck.length) {
        $scope.showLoadMore = productsCheck.length;
      } else if (productsBlack.length) {
        $scope.showLoadMore = productsBlack.length;
      } else {
        $scope.showLoadMore = productsWait.length;
      }
    }
    else {
      f($scope.tabActive);
    }

    $scope.$broadcast('scroll.infiniteScrollComplete');

		// Не показывать табы и текст, пока не загрузятся товары
    setTimeout(function() {
      $scope.showTabs = true;
      $scope.showEmptyText = true;
    }, 0)

  };

	//
  $scope.loadMore = function() {
    if (!$scope.showProducts) {
      deferred.promise.then(function () {
        moveProducts(true);
      });
    } else {
      moveProducts();
    }
  }

	//
  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

	$scope.hasProducts = false; // есть продукты в категории
	$scope.showProducts = false; // показываем в категории продукты
  $scope.title = '';

	// Получение категории
	Category.getById($stateParams.id).then(function(category) {

      $scope.title = category.name;
      User.productVotes();

			// Вернет дочерние категории или товаров
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

					// Основная функция получения товаров
					var productGetCatProduct = function(companyIds, price, rating, filter) {

            // Обнулить массивы
            productsCheck = [];
            productsBlack = [];
            productsWait = [];

            $scope.productsCheck = [];
            $scope.productsBlack = [];
            $scope.productsWait = [];

            $scope.showLoadMore = 1;

						Product.getByCategoryId($stateParams.id, companyIds, price, rating).then(function(products) {
						if(products.length > 0) {
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

							// Генерация своих объектов с товарами
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

								// Филитрация по цене
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
											{ text: 'Общий рейтинг', order: ['-tested', 'danger_level', '-rating', 'name'], 'active': true },
											{ text: 'Цена', order: ['-price'], 'active': false },
											{ text: 'Алфавит', order: ['name'], 'active': false }
										);

								 		for(var i = 0; i < keys.length; i++) {
								 			arrButtons.push({ 'text': keys[i], 'order': ['-value_ch_' + i, '-rating'], 'active': false });
								 		}
								 		$scope.arrButtons = arrButtons;


                    if(filter) {
                      moveProducts(true);
                    }

									});

								});

								// Разбить товары по типу на массивы
		      			if(!product.tested) {
		      				product['vote_boolean'] = productVotes[productFull.id] ? true : false;
		      				product['vote_text'] = productVotes[productFull.id] ? 'Я Зa!' : 'На тест!'
		      				productsWait.push(product);
		      			}
		      			else {
			      			if(product.tested && product.danger_level > 1) {
			      				productsBlack.push(product);
			      			}
		      				productsCheck.push(product);
		      			}
                deferred.resolve();

		    			});

							//
							if($scope.price.value == 0) {
								$scope.price.value == $scope.price.min;
							}


							// Выбирается активный таб
							$scope.tabActive = 0;
							if (productsCheck.length) {
								$scope.classTabCheck = 'product__category-tabs-active';
								$scope.tabActive = 1;
							} else {
								$scope.classTabCheck = 'product__category-tabs-disabled';
							}

							if (productsBlack.length) {
								if (!$scope.tabActive) {
									$scope.classTabBlack = 'product__category-tabs-active';
									$scope.tabActive = 2;
								} else {
									$scope.classTabBlack = 'product__category-tabs-deactive';
								}
							} else {
								$scope.classTabBlack = 'product__category-tabs-disabled';
							}

							if (productsWait.length) {
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
						  $scope.orderProp = ['-tested', 'danger_level', '-rating', 'name'];
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

						});


            $scope.showProducts = true;
					}
					//
					productGetCatProduct();

					// Сбор параметров для фильтрации
					$scope.getFilterParams = function() {
						var ids = [];
						for(var company in $scope.companies) {
							if($scope.companies[company].checked) {
								ids.push($scope.companies[company].id);
							}
						}
						productGetCatProduct(ids, $scope.price.value, $scope.rating.value, true);
					};

					}

			});
	});

});

// Контроллер товаров
app.controller('ProductCtrl', function($scope, $location, $stateParams, $ionicHistory, $ionicModal, $http, $ionicSlideBoxDelegate, Product, Category, Rating, User, DB, Company, Mark) {
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

			// Продукт не найден в локальной базе
			if(product === false) {
				$location.path('/app/product-not-found');
			}

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

	var getReviews = function() {
		// Отзывы
		Product.reviews($stateParams.id).then(function(resp) {
			$scope.reviews = null;
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

			var objReviewsProcent = {
				positive: 0,
				negative: 0
			};

			var reviewsPositive = resp.positive;
			var reviewsNegative = resp.total_count - resp.positive;

			if(resp.total_count >= 1) {
				objReviewsProcent.positive = (reviewsPositive * 100 / resp.total_count).toFixed(0);
				objReviewsProcent.negative = (reviewsNegative * 100 / resp.total_count).toFixed(0);
			}

	    	$scope.objReviewsProcent = objReviewsProcent;

			// Преобразованная дата для каждого отзыва
			angular.forEach(resp.items, function(item) {
		   	var date = item.created_at;
		   	item.created_date = new Date(item.created_at);
		   	$ionicSlideBoxDelegate.update();
		  });

		});
	};

	getReviews();

	// Лайк/Дизлайк для отзывов
	$scope.addVote = function(review, vote) {
  		if (!User.is_auth()) {
    		$scope.login();
    		return;
    	}

	  	if (!review) {
	  		console.error("dont set param review");
	  		return;
	  	}

	  	if (!(vote == 1 || vote == -1)) {
	  		console.error("bad param vote ", vote);
	  		return;
	  	}

		Mark.mark('product_reviews', review.id, vote).then(function(res) {
      if(!review['marksum'])
        review['marksum'] = 0;

			review['marksum'] = review['marksum'] + vote;
      review['umark'] = vote;
		});
	};


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

  $scope.revData = {
    mark: 0,
    markClass: {
      negative: 'no-active',
      positive: 'no-active'
    },
    owning: '0'
  };

  $scope.toggleActive = function(self) {
    for(var item in $scope.revData.markClass) {
      $scope.revData.markClass[item] = 'no-active';
    }

    if(self === 'negative') {
      $scope.revData.mark = 2;
      $scope.revData.markClass.negative = 'active'
    }
    else if(self === 'positive') {
      $scope.revData.mark = 5;
      $scope.revData.markClass.positive = 'active'
    }

  };
  

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
  	$scope.revErr = '';
  	User.productReviews(product.id, $scope.revData).then(function(response) {
  		if(response.status === 200) {
				$scope.closeReview();
				DB.alert('Ваш отзыв успешно добавлен!' , 'Спасибо за отзыв!');
        $scope.revData = {
          mark: 0,
          markClass: {
            negative: 'no-active',
            positive: 'no-active'
          },
          owning: '0'
        };

        getReviews();
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
app.controller('AboutCtrl', function($scope, $cordovaAppVersion, DB, Product, Category, $window) {
	DB.version().then(function(res){
		$scope.dbv = res;
	});

  if(window.cordova) {
    $cordovaAppVersion.getVersionNumber().then(function (version) {
      $scope.appVersion = version;
    });
  }

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


  // Сохраненные параметры
  var thisUrlParams = $location.search();
  if((!thisUrlParams.category || !thisUrlParams.rubric) && (articleUrlParam.cat || articleUrlParam.rubric)) {
    $location.search({
      'category': articleUrlParam.cat,
      'rubric' : articleUrlParam.rubric
    });
    $window.location.reload();
  }


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
  $scope.cat = articleUrlParam.cat = getParams.category;
  $scope.rubric = articleUrlParam.rubric = getParams.rubric;


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
app.controller('ArticleCtrl', function($scope, $stateParams, $location, $ionicModal,  $ionicHistory, $sce, Article, User, DB) {

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

	var promise = Article.getComments($stateParams.id);

	// Список комментариев
	var comments = {};
	promise.then(function(response) {
		comments['length'] = response.data.comments.length;
		comments['list'] = response.data.comments;
	});

	Article.getById($stateParams.id).then(function(data) {
		if ('html' in data) {
			$scope.article = data;
			$scope.article.html = $sce.trustAsHtml(data.html);

			promise.then(function(){
				$scope.comments = comments;
			});

			setTimeout(function() {
				appendTrDom();

        var articleBlock = document.getElementsByClassName('article__single')[0];
        var links = articleBlock.getElementsByTagName('a');

        for(var i = 0; i < links.length; i++) {
          links[i].addEventListener("click", modifyOpen, false);
        }

        function modifyOpen(event) {
        	if (event.preventDefault) {
			    event.preventDefault();
			} else {
				event.returnValue = false;
			}
          var href = event.target.href;
          if (typeof navigator !== "undefined" && navigator.app) {
            navigator.app.loadUrl(event.target.href, {openExternal: true});
          }
          else {
            window.open(event.target.href, "_system");
          }
          return false;
        }

			}, 0)

			/*
			var s = document.createElement('script');
      s.src = 'http://api.roscontrol.com/compiled/js/mobile_article.js';
      document.body.appendChild(s);
      */

		}
		else {
			$scope.error = 'проблемы с подключением';
		}

		$scope.hide_loader = true;
	});


	// Только для авторизованных пользователей
	var parentId = false;
	$scope.modalCommentUserCheck = function(id) {
	  if (!User.is_auth()) {
			DB.alert('Добавлять комментарии могут только авторизованные пользователи!', 'Внимание!');
			return false;
		}

		if(id) {
			parentId = id;
		}
		else {
			parentId = false
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
  	User.addComment(article, $scope.commentData.text, parentId).then(function(response) {
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


// *** Штрихкод
app.controller('BarcodeCtrl', function($scope, $location, $cordovaBarcodeScanner, DB, Barcode) {

	if (window.cordova) {
		$cordovaBarcodeScanner.scan().then(function (imageData) {

			var code = imageData.text;
			var type = (imageData.format.indexOf('EAN') >= 0) ? 'EAN' : imageData.format;

			Barcode.getProducts(code, type).then(function (response) {

				if (response.status !== 200) {
					DB.alert(
						'Проверьте соединение с интернетом или повторите попытку позже',
						'Ошибка сканирования!',
						function() {
							$location.path('/app/main');
						});
					return false;
				}

				var products = response.data.pids;
				if (products.length === 0) {
					$location.path('/app/barcode-not-found/').search({code: code});
				}
				else {
					$location.path('/app/product/' + products[0]['pid']);
				}

			});

		}, function (error) {
			DB.alert(error, 'Ошибка сканирования!');
		});
	}

});


// *** Штрихкод не найден
app.controller('BarcodeNotFoundCtrl', function($scope, $location) {

	$scope.code = $location.search().code;
	if(!$scope.code) $scope.code = ' ';

	$scope.goScanningBarcode = function() {
		$location.path('/app/barcode');
	}


});


// *** Не найденный продукт
app.controller('ProductNotFoundCtrl', function($scope) {

		$scope.title = 'Товар не найден!';
		$scope.notFoundText = 'Извините, данный товар на найден в локальной базе данных, попробуйте обновить приложение.';

});
