var app = angular.module('rememberMe', []); //CHANGE

app.controller('MainCtrl', ['$scope', 'articles', 'auth', function($scope, articles, auth){
	$scope.newArticle = false;
	$scope.articles = articles.articles;
	$scope.remind_options = ['1 day', '1 week', '2 weeks'];
	$scope.user = {};
	$scope.login = false;

	$scope.showLoginRegister = function(id) {
		if(id == 'register') {
			$scope.login = false;
		}
		else {
			$scope.login = true;
		}
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

      		console.log($scope.isLoggedIn);

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
		console.log($scope.remind_on);
		if($scope.name != ''){

			var time = $scope.time.toString();
			var timeString = time.substring(16, 24);

			console.log('add article reminder date ' + $scope.date + " " + timeString);

			console.log("user: " + $scope.currentUser);

			articles.create({
				name: $scope.name,
				link: $scope.link,
				user: $scope.currentUser,
				note: $scope.note,
				remind_me: {
					date: $scope.date.toDateString(),	// FIXME: add time once we allow user preferences
					time: timeString
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

		console.log("Is logged in on init " + $scope.isLoggedIn);

		articles.getAll();
	
		$scope.link = "";
		$scope.name = "";
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
		console.log("In is logged in!");
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
