var app = angular.module('rememberMe', ['ui.router']);

app.controller('MainCtrl', ['$scope', 'articles', function($scope, articles){
	$scope.articles = articles.articles;
	$scope.remind_options = ['1 day', '1 week', '2 weeks']; 

	$scope.addArticle = function(){
		$scope.remind_on = $scope.remind_options[1]; // FIX ME; hook up to dropdown
		if($scope.name != ''){
			// Calculate new date based on text input of reminder timeframe 
			var addToDate = 0;
			switch($scope.remind_on){
				case $scope.remind_options[0]:
					addToDate = 1;
					break;
				case $scope.remind_options[1]:
					addToDate = 7;
					break;
				case $scope.remind_options[2]:
					addToDate = 14;
					break;
			}
			var date = new Date();
			date.setDate(date.getDate() + addToDate);

			articles.create({
				name: $scope.name,
				link: $scope.link,
				remind_me: {
					date: date.toDateString()	// FIXME: add time once we allow user preferences
				}
			});
			$scope.name = '';
			$scope.link = '';
			$scope.remind_on = '';
		}
	};

	$scope.snoozeReminder = function(article){
		articles.snooze(article);
	}
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
		return $http.get('/articles').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.getToday = function(){
		return $http.get('/articles/today').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.create = function(article){
		return $http.post('/articles', article).success(function(data){
			o.articles.push(data);
		});
	};

	o.snooze = function(article){
		return $http.put('/articles/' + article._id + '/snooze').success(function(data){
			var new_date = new Date(this.remind_me.date);
			new_date.setDate(new_date.getDate() + 1); // FIX ME - allow user-specified snooze-time
			article.remind_me.date = new_date.toDateString();
		});
	}

	return o;
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl',
		resolve: {
			articlePromise: [ 'articles', function(articles){
				return articles.getAll();
			}]
		}
	})
	.state('articles', {
		url: '/articles/{id}',
		templateUrl: '/articles.html',
		controller: 'ArticlesCtrl'
	});

	$urlRouterProvider.otherwise('home');
}]);