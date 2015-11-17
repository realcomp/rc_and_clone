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


			// *** Был ли добавлен штрихкод в товару
			Product.getBarcodeList($stateParams.id).then(function(response) {
				var count = parseInt(response.data.count);
				product['barcode_status'] = false;
				product['barcode_text'] = 'Добавить штрихкод';
				if(count > 0) {
					product['barcode_status'] = true;
					product['barcode_text'] = 'Штрихкод добавлен';
				}
			});


			// *** Добавление своего штрихкода к текущему продукту
			$scope.addBarcodeProduct = function(status, productId) {

				// Штрихкод не был добавлен
				if (status === false) {

					if (!User.is_auth()) {
						DB.alert('Добавлять штрихкод могут только авторизованные пользователи!', 'Внимание!');
						return false;
					}

					$location.path('/app/barcode').search({productId: productId});

				}

			};


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
