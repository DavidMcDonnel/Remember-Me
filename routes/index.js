var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/articles', function(req, res, next) {
	Article.find(function(err, articles){
		if (err) { 
			return next(err);
		}

		res.json(articles);
	});
});

router.get('/articles/:article', function(req, res){
	res.json(req.article);
});

router.post('/articles', function(req, res, next){
	var article = new Article(req.body);

	article.save(function(err, article){
		if (err) {
			return next(err);
		}

		res.json(article);
	});
});

router.param('article', function(req, res, next, id){
	var query = Article.findById(id);

	query.exec(function (err, article) {
		if (err) { return next(err); }
		if(!article) { return next(new Error('can\'t find article')); }

		req.article = article;
		return next();
	});
});

module.exports = router;
