var app = angular.module('rememberMe', ['ui.router']);

app.controller('MainCtrl', ['$scope', 'articles', function($scope, articles){
	$scope.test = 'Hello, world!';
	// $scope.articles = [
	// 	{ name: 'article 1', link: 'http://google.com' },
	// 	{ name: 'article 2', link: 'http://yahoo.com' },
	// 	{ name: 'article 3', link: 'http://bing.com' }
	// ];
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
				remind_me: date
			});
			$scope.name = '';
			$scope.link = '';
			$scope.remind_on = '';
		}
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
		return $http.get('/articles').success(function(data){
			angular.copy(data, o.articles);
		});
	};

	o.create = function(article){
		return $http.post('/articles', article).success(function(data){
			o.articles.push(data);
		});
	};

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