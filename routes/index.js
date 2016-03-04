var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET all articles */
router.get('/articles', function(req, res, next) {
	Article.find(function(err, articles){
		if (err) { 
			return next(err);
		}

		res.json(articles);
	});
});

/* GET articles with reminder set to today */
router.get('/articles/today', function(req, res, next){
	 var today = new Date().toDateString();

	 Article.find({ 'remind_me.date': today }).exec(function (err, articles) {
		if (err) { 
			return next(err); 
		}

		res.json(articles);
	});
});

/* UPDATE reminder date/time for an article */
router.put('/articles/:article/snooze', function(req, res, next){
	req.article.snooze(function(err, article){
		if (err) {
			return next(err);
		}

		res.json(article);
	});
});

/* GET article by id */
// router.get('/articles/:article', function(req, res){
// 	res.json(req.article);
// });

/* POST new article reminder */
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
