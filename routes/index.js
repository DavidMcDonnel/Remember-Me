var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Article = mongoose.model('Article');

router.get('/',function(req,res,next){
	res.render('index',{title:'Express'});
//UNCOMMENT
//var app = express();
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
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
router.get('/articles/:article',function(req,res){
	res.json(req.article);
});

/* DELETE article by id */
router.delete('/articles/:article', function(req, res){
	// console.dir(res);
	//console.dir(req);
	// var article = new Article(req.body);
	// var collection = req.db.get('articles');
	// console.dir(req.params);
	// var article = res.json(req.article);
	// console.dir(collection);
	// console.dir(article);
	req.db.get('articles').remove({_id:req.params.id.toString()}.exec(function(err,result){
		if (err){
			return next(err);
		}
		//res.json(articles);
	}));
});

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
