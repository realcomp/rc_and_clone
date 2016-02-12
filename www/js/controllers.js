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
	$scope.now = new Date();
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
	var urlParametrs = $location.search();
	var productId = 0;

	var setLocation = function() {
		if (productId) {
			$location.path('/app/product/' + productId);
		} else {
			$location.path('/app/main');
		}
	};

	if('productId' in urlParametrs) {
		productId = urlParametrs.productId;
	}

	if (!window.cordova) {
		setLocation();
		return;
	}

		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (imageData.cancelled) {
				setLocation();
				return;
			}

			var code = imageData.text;
			var type = (imageData.format.indexOf('EAN') >= 0) ? 'EAN' : imageData.format;

			if (!code) {
				return false;
			}

			// *** Если передан id продукта, значит добавим штрихкод к нему
			if (productId) {

				Barcode.setBarcode(productId, code, type).then(function (response) {

					if (response.status !== 200) {
						DB.alert(
							'Проверьте соединение с интернетом или повторите попытку позже',
							'Ошибка сканирования!',
							function() {
								setLocation();
							});
						return false;
					}

					var success = response.data.success;

					// Успешное добавление
					if (success == 1) {
						DB.alert(
							'Спасибо, что добавили штрихкод к товару!',
							'Успех!',
							function() {
								setLocation();
							});
						return false;
					}
					// Ошибка добавления добавление
					else {
						DB.alert(
							response.data.error,
							'Ошибка добавления!',
							function() {
								setLocation();
							});
						return false;
					}

				});

			}
			// *** В противном случае осуществляем поиск по штрихкоду
			else {
				Barcode.getProducts(code, type).then(function (response) {

					if (response.status !== 200) {
						DB.alert(
							'Проверьте соединение с интернетом или повторите попытку позже',
							'Ошибка сканирования!',
							function() {
								setLocation();
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

			}

		}, function (error) {
			DB.alert(error, 'Ошибка сканирования!');
		});

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
