// Контроллер категорий
app.controller('ProductListCtrl', function($scope, $q, $location, $stateParams, $ionicHistory, $ionicModal,  $ionicScrollDelegate, Category, Product, Company, Rating, User, DB) {
//	$scope = $scope.$new(true);

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

	productVotes = User.getProductVotes();

	if (!productVotes.length) {
		User.productVotes().then(function(){
			productVotes = User.getProductVotes();
		});
	}

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

			if (tabActive == 1) {
				arr = productsCheck;
				thisArr =  $scope.productsCheck;
			}
			else if (tabActive == 2) {
				arr = productsBlack;
				thisArr =  $scope.productsBlack;
			}
			else if (tabActive == 3) {
				arr = productsWait;
				thisArr =  $scope.productsWait;
			}

			if (arr.length < thisLimit) {
				thisLimit = arr.length;
			}

			for (var i = 0; i < thisLimit; i++) {
				thisArr.push(arr[i]);
			}

			arr.splice(0, thisLimit);
			$scope.showLoadMore = arr.length;
		};

		if (first) {
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
/*    setTimeout(function() {
      $scope.showTabs = true;
      $scope.showEmptyText = true;
    }, 0)*/

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
				if (products.length < 1) {
					return;
				}

				$scope.hasProducts = true;
				$scope.productChar = [];
				var arr = [];

				var userShoppingList = User.getShoppingListArray(),
					userProductList = User.getProductListArray();

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
					if ($scope.price.empty) {
						if (product.price >= 1 && !priceMinMake) {
							priceMinMake = true;
							$scope.price.min = product.price;
						}

						if (product.price < $scope.price.min && product.price >= 1) {
							$scope.price.min = product.price;
							$scope.price.value = product.price
						}

						if (products.length - 1 == index) {
							if($scope.price.value == 0)
								$scope.price.value = $scope.price.min;
							$scope.price.empty = false
						}

						if (product.price > $scope.price.max) {
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

							for (var i = 0; i < arr.length; i++) {
								obj[arr[i]] = true;
							}

							var keys = Object.keys(obj);
							var arrButtons = [];
							arrButtons.push(
								{ text: 'Общий рейтинг', order: ['-tested', 'danger_level', '-rating', 'name'], 'active': true },
								{ text: 'Цена', order: ['-price'], 'active': false },
								{ text: 'Алфавит', order: ['name'], 'active': false }
							);

							for (var i = 0; i < keys.length; i++) {
								arrButtons.push({ 'text': keys[i], 'order': ['-value_ch_' + i, '-rating'], 'active': false });
							}

							$scope.arrButtons = arrButtons;


							if (filter) {
								moveProducts(true);
							}
						});
					});

					// Разбить товары по типу на массивы
					if (!product.tested) {
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
				if ($scope.price.value == 0) {
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
				if (!$scope.companies) {
				  $scope.companies = {};	

				  for (var id in companyIds) {
				  	Company.getById(id).then(function(company) {
				  		if (company['checked'] === undefined) {
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

				$scope.showTabs = true;
				$scope.showEmptyText = true;
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
	});

});
