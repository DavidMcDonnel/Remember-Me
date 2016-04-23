var app = angular.module('rememberMe');

app.controller('webCtrl', ['$scope', '$window', 'articles', 'auth', function($scope, $window, articles, auth){
	$scope.articles = articles.articles;
	$scope.articlesFuture = articles.articlesFuture;
	
	$scope.user = {};

	$scope.login = true;

	$scope.showLoginRegister = function(id) {
		if(id == 'register') {
			$scope.login = false;
		}
		else {
			$scope.login = true;
		}
	}

	$scope.dateFormat = function(date){
  		var month = date.getMonth() < 10 ? "0"+date.getMonth():date.getMonth()
        ,day = date.getDate() < 10 ? "0"+date.getDate():date.getDate()
        ,year = date.getFullYear();
  		return month+day+year;
	}

	$scope.isLoggedIn = auth.isLoggedIn();
  	$scope.currentUser = auth.currentUser();

  	console.log("Web app loggedin after init: " + $scope.isLoggedIn);
  	
	$scope.register = function(){
		$scope.user = {
			username: $scope.userRegister,
			password: $scope.passwordRegister
		};
    	auth.register($scope.user).error(function(error){
      		$scope.error = error;
    	}).then(function(){
    		$scope.registerSuccess = "You've successfully registered!";
    	});
  	};

  	$scope.logIn = function(){
  		$scope.user = {
			username: $scope.userLogin,
			password: $scope.passwordLogin
		};
	
    	auth.logIn($scope.user).error(function(error){
      		$scope.error = error;
    	}).then(function(){
      		$scope.registerSuccess = '';
      		$scope.isLoggedIn = auth.isLoggedIn();
      		$scope.currentUser = auth.currentUser();
      		$scope.user_id = $window.localStorage['user_id'];
      		//$scope.loginRegister = false;

		
    	});
  	};


  	// FIXME: for testing only
	/*$scope.create_alarms_test = function(){
		chrome.alarms.create("newDay", { when: 5} );
	};*/


  	$scope.logOut = function() {
  		auth.logOut();
  		
  		$scope.isLoggedIn = auth.isLoggedIn();
      	$scope.currentUser = auth.currentUser();
      	$scope.error = '';
      	$scope.registerSuccess = '';
  		//$scope.loginRegister = true;
  	};

	$scope.deleteArticle = function(article){
		articles.removeArticle(article);
		//articles.removeArticle({_id:article._id});
	};

	$scope.init = function(){
		// Find out if they're logged in and who current user is
		$scope.isLoggedIn = auth.isLoggedIn();
		$scope.currentUser = auth.currentUser();

		console.log("Web app loggedin init: " + $scope.isLoggedIn);

		var today = new Date();
		articles.getArticlesByDate($scope.dateFormat(today));
		articles.getUserArticles();

		
		$scope.link = ''
		$scope.name = ''; 
		
	};

	$scope.replyBtnClick = function(link) {
		console.log("link: " + link);
		chrome.tabs.create({ url: link });
	}

	$scope.getData = function(data){
		console.log(data);
		return data;
	}
	

}]);