var app = angular.module('rememberMe', []); //CHANGE

app.factory('articles', ['$http','$window', function($http,$window){
	var o = {
		articles: [], 
		articlesFuture: []
	};

	o.getAll = function() {
		return $http.get('http://localhost:3000/articles').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.getToday = function(){
		var date = new Date();
		date = dateFormat(date);
		return $http.get('http://localhost:3000/articles/date').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.getUserArticles = function(){
		return $http.get('http://localhost:3000/user/'+$window.localStorage['user_id']).success(function(data){
			angular.copy(data, o.articlesFuture);
		});
	};

	o.getArticlesByDate = function(date){
		return $http.get('http://localhost:3000/user/'+$window.localStorage['user_id']+'/'+date).success(function(data){
			angular.copy(data,o.articles);
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
			var new_date = new Date();
			console.log('now ' + new_date);
			new_date.setDate(new_date.getDate() + 1); // FIX ME - allow user-specified snooze-time
			console.log('new time ' + new_date);
			article.remind_me.date = dateFormat(new_date);
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

    auth.saveToken = function (data){
  		$window.localStorage['remember-me-token'] = data.token;
  		$window.localStorage['user_id'] = data.id;
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
    		auth.saveToken(data);
  		});
	};

	auth.logIn = function(user){
		console.log("calling login in angularApp.js for user " + user.username);
  		return $http.post('http://localhost:3000/login', user).success(function(data){
    		auth.saveToken(data);
  		});
	};

	auth.logOut = function(){
  		$window.localStorage.removeItem('remember-me-token');
  		$window.localStorage.removeItem('user_id');
	};

  return auth;
}]);
