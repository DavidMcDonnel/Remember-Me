var app = angular.module('rememberMe', []); //CHANGE

app.controller('MainCtrl', ['$scope', 'articles', 'auth', function($scope, articles, auth){
	$scope.newArticle = false;
	$scope.articles = articles.articles;
	$scope.remind_options = ['1 day', '1 week', '2 weeks'];
	
	$scope.user = {};
	
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

			// set alarms at login
			$scope.checkAlarms();

			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			console.log(tomorrow);
			tomorrow.setHours(0,0,0,0); // set an alarm to midnight to start checking alarms for next day
			var untilTomorrow = tomorrow - (new Date());
			//chrome.alarms.create("newDay", { when: untilTomorrow });      		
    	});
  	};

  	// Check to see if there are any alarms 
  	$scope.checkAlarms = function(){
  		for(var i = 0; i < $scope.articles.length; i++){
  		//$scope.articles.forEach(function(article){
  			var article = $scope.articles[i];
			var date = new Date(article.remind_me.date);
			var time = article.remind_me.time.split(':');
			date.setHours(time[0],time[1],time[2]);

			console.log('reminder date = ' + date);
			console.log('right now ' + new Date());

			var alarm_time = date - (new Date());
			alarm_time += i*100;
			console.log(article._id + " at " + alarm_time);
			//var info = article.name + "," + article.link + "," + article.note
			chrome.alarms.create(article._id, { when: alarm_time });
		}
		//});
  	};

  	// FIXME: for testing only
	/*$scope.create_alarms_test = function(){
		chrome.alarms.create("newDay", { when: 5} );
	};*/

	chrome.alarms.onAlarm.addListener(function(alarm){
		if(alarm.name === "newDay"){
			$scope.checkAlarms();
		}
		else{

			$scope.createNotification(alarm.name);
		}
	});

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
		console.log($scope.remind_on);
		if($scope.name != ''){
			// Calculate new date based on text input of reminder timeframe 
			var addToDate = 0;
			switch($scope.remind_on){
				case $scope.remind_options[0]:
					addToDate = 0;
					break;
				case $scope.remind_options[1]:
					addToDate = 1;
					break;
				case $scope.remind_options[2]:
					addToDate = 7;
					break;
				case $scope.remind_options[3]:
					addToDate = 14;
					break;
			}
			var date = new Date();
			date.setDate(date.getDate() + addToDate);
			console.log('add article reminder date ' + date );

			console.log("user: " + $scope.currentUser);

			articles.create({
				name: $scope.name,
				link: $scope.link,
				user: $scope.currentUser,
				note: $scope.note,
				remind_me: {
					date: date.toDateString(),	// FIXME: add time once we allow user preferences
					time: '12:00:00'
				}
			});
			$scope.name = '';
			$scope.link = '';
			$scope.note = '';
			$scope.remind_on = '';
			$scope.toggleNew();
		}
	};

	$scope.deleteArticle = function(article){
		articles.removeArticle(article);
		//articles.removeArticle({_id:article._id});
	};

	$scope.snoozeReminder = function(article){
		articles.snooze(article);
	};

	$scope.init = function(){
		// Find out if they're logged in and who current user is
		$scope.isLoggedIn = auth.isLoggedIn();
		$scope.currentUser = auth.currentUser();

		articles.getToday();
		
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
	$scope.createNotification = function(id) {
		console.log('create notifciation for ' + id);

		articles.getOne(id).then(function(data) { 
			var link = data.link;

			var opt = {type: "basic",title: data.name, message: data.link,iconUrl: "../../UI/RMicon.png", buttons: [{ title: "Get to it!", 
                  iconUrl: "../../UI/checkbox.png"}], priority: 0}
	    	chrome.notifications.create(id,opt,function(){
	    		console.log('reached here for ' + data.name);
	    	});

			chrome.notifications.onButtonClicked.addListener(function() {
				//console.log("link is now: " + link);
				chrome.tabs.create({ url: link });
			});

		}, function(error){
			console.log('Failed to create notification for id ' + id);
		});

	    //include this line if you want to clear the notification after 5 seconds
    	//setTimeout(function(){chrome.notifications.clear("notificationName",function(){});},5000);
    };

}]);

app.controller('ArticlesCtrl', ['$scope', '$stateParams', 'articles', function($scope, $stateParams, articles){
	$scope.articles = articles.articles[$stateParams.id];

	$scope.addReminder = function(){
		$scope.reminders.push($scope.datetime);
	}
}]);

app.factory('articles', ['$http', function($http){
	var o = {
		articles: []
	};

	o.getAll = function() {
		return $http.get('http://localhost:3000/articles').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.getToday = function(){
		return $http.get('http://localhost:3000/articles/today').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.create = function(article){
		return $http.post('http://localhost:3000/articles', article).success(function(data){
			o.articles.push(data);
		});
	};

	o.removeArticle = function(article){
		return $http.delete('http://localhost:3000/articles/'+article._id).success(function(data){
				o.articles.splice(o.articles.indexOf(article),1);
		});
	};

	o.snooze = function(article){
		return $http.put('http://localhost:3000/articles/' + article._id + '/snooze').success(function(data){
			var new_date = new Date(this.remind_me.date);
			new_date.setDate(new_date.getDate() + 1); // FIX ME - allow user-specified snooze-time
			article.remind_me.date = new_date.toDateString();
		});
	};

	o.getOne = function(id) {
		console.log("id: "+ id);
		return $http.get('http://localhost:3000/articles/' + id).then(function(res) {
			return res.data;
		});
	};

	return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

    auth.saveToken = function (token){
  		$window.localStorage['remember-me-token'] = token;
 	};

	auth.getToken = function (){
  		return $window.localStorage['remember-me-token'];
	};

	auth.isLoggedIn = function(){
  		var token = auth.getToken();

  		if(token){
    		var payload = JSON.parse($window.atob(token.split('.')[1]));
    		return payload.exp > Date.now() / 1000;
  		} else {
    		return false;
  		}
	};

	auth.currentUser = function(){
  		if(auth.isLoggedIn()){
    		var token = auth.getToken();
    		var payload = JSON.parse($window.atob(token.split('.')[1]));
    		return payload.username;
  		}
	};

	auth.register = function(user){
  		return $http.post('http://localhost:3000/register', user).success(function(data){
    		auth.saveToken(data.token);
  		});
	};

	auth.logIn = function(user){
		console.log("calling login in angularApp.js for user " + user.username);
  		return $http.post('http://localhost:3000/login', user).success(function(data){
    		auth.saveToken(data.token);
  		});
	};

	auth.logOut = function(){
  		$window.localStorage.removeItem('remember-me-token');
	};

  return auth;
}]);


// app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
// 	$stateProvider
// 	.state('home', {
// 		url: '/home',
// 		templateUrl: '/home.html',
// 		controller: 'MainCtrl',
// 		resolve: {
// 			articlePromise: [ 'articles', function(articles){
// 				return articles.getAll();
// 			}]
// 		}
// 	})
// 	.state('articles', {
// 		url: '/articles/{id}',
// 		templateUrl: '/articles.html',
// 		controller: 'ArticlesCtrl'
// 	});

// 	$urlRouterProvider.otherwise('home');
// }]);


// /* Enable bootstrap popover -- FIXME move eksewhere */
// $(document).ready(function(){
//     $('[data-toggle="popover"]').popover();   
//     $('[data-toggle="tooltip"]').tooltip();
// });