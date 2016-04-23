var app = angular.module('rememberMe'); 

app.controller('extensionCtrl', ['$scope', '$window', '$http', 'articles', 'auth', function($scope, $window, $http, articles, auth){
	$scope.newArticle = false;
	$scope.articles = articles.articles;
	$scope.remind_options = ['1 day', '1 week', '2 weeks'];
	
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

	$scope.isLoggedIn = auth.isLoggedIn();
  	$scope.currentUser = auth.currentUser();

  	console.log("Extension is after init: " + $scope.isLoggedIn);


  	$scope.goToWebsite = function(currentUser) {
  		
    	$scope.createTab('http://localhost:3000/');
  		
  	}
  	
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

			// set alarms at login
			checkAlarms($scope.user_id);
	     	setNewDayAlarm();
    	});
  	};

  	$scope.logOut = function() {
  		auth.logOut();
  		
  		$scope.isLoggedIn = auth.isLoggedIn();
      	$scope.currentUser = auth.currentUser();
      	$scope.error = '';
      	$scope.registerSuccess = '';
  		//$scope.loginRegister = true;
  	};

	$scope.toggleNew = function() {
		$scope.newArticle = !$scope.newArticle;
	};

	$scope.addArticle = function(){
		console.log('user = ' + $scope.user_id);
		if($scope.name != ''){
			var date = $scope.date.toString().split(' ');
			date.splice(4,1,$scope.time.toString().split(' ')[4]);
			var date_string = date.join(' ');

			articles.create({
				name: $scope.name,
				link: $scope.link,
				username: $scope.user_id,
				note: $scope.note,
				remind_me: {
					date: dateFormat($scope.date),
					time: Date.parse(date_string)
				}
			});

			$scope.name = '';
			$scope.link = '';
			$scope.note = '';
			$scope.date = '';
			$scope.time = '';
			$scope.toggleNew();

			window.close();
		}
	};

	$scope.deleteArticle = function(article){
		articles.removeArticle(article);
		//articles.removeArticle({_id:article._id});
	};

	$scope.init = function(){
		// Find out if they're logged in and who current user is
		$scope.isLoggedIn = auth.isLoggedIn();
		$scope.currentUser = auth.currentUser();
		if ($scope.isLoggedIn){
			$scope.user_id = $window.localStorage['user_id'];
		}

		$scope.getCurrentTabUrl(function(url, title){
			$scope.link = url;
			$scope.name = title; 
		});

	};

	$scope.replyBtnClick = function(link) {
		console.log("link: " + link);
		chrome.tabs.create({ url: link });
	}


	$scope.getCurrentTabUrl = function(callback){
	  // Query filter to be passed to chrome.tabs.query - see
	  // https://developer.chrome.com/extensions/tabs#method-query
	  var queryInfo = {
	    active: true,
	    currentWindow: true
	  };

	  chrome.tabs.query(queryInfo, function(tabs) {
	    // chrome.tabs.query invokes the callback with a list of tabs that match the
	    // query. When the popup is opened, there is certainly a window and at least
	    // one tab, so we can safely assume that |tabs| is a non-empty array.
	    // A window can only have one active tab at a time, so the array consists of
	    // exactly one tab.
	    var tab = tabs[0];

	    // A tab is a plain object that provides information about the tab.
	    // See https://developer.chrome.com/extensions/tabs#type-Tab
	    var url = tab.url;
	    var title = tab.title;

	    // tab.url is only available if the "activeTab" permission is declared.
	    // If you want to see the URL of other tabs (e.g. after removing active:true
	    // from |queryInfo|), then the "tabs" permission is required to see their
	    // "url" properties.
	    console.assert(typeof url == 'string', 'tab.url should be a string');

	    callback(url, title);
	  });
	};

	$scope.createTab = function(url){
		chrome.tabs.create({'url': url});
	}; 

	$scope.getData = function(data){
		console.log(data);
		return data;
	}

}]);