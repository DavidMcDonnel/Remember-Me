var app = angular.module('rememberMe', ['ui.router']);

app.controller('MainCtrl', ['$scope', 'articles', function($scope, articles){
	$scope.test = 'Hello, world!';
	// $scope.articles = [
	// 	{ name: 'article 1', link: 'http://google.com' },
	// 	{ name: 'article 2', link: 'http://yahoo.com' },
	// 	{ name: 'article 3', link: 'http://bing.com' }
	// ];
	$scope.articles = articles.articles;
	$scope.addArticle = function(){
		if($scope.name != ''){
			articles.create({
				name: $scope.name,
				link: $scope.link,
				reminder: ''
			});
			$scope.name = '';
			$scope.link = '';
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