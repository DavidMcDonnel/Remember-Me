var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongoose = require('mongoose');
var passport = require('passport');

var Article = mongoose.model('Article');
var User = mongoose.model('User');

var moment = require('moment');


/* add in 'auth' as a parameter to routes you want to check if they are logged in */

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
	//var user = req.payload.username;
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
	 //var user = req.payload.username;

	 Article.find({ 'remind_me.date': today}).exec(function (err, articles) {
		if (err) {
			return next(err);
		}

		res.json(articles);
	});
});

/* GET articles by user id */
router.get('/user/:username', function(req, res, next){
	 Article.find({ 'username': req.params.username,'toBeSent':true}).exec(function (err, articles) {
		if (err) { 
			return next(err);
		}

		res.json(articles);
	});
});

/* GET user articles by date */
router.get('/user/:username/:date', function(req,res,next){
	Article.find({'username': req.params.username
				,'remind_me.date': req.params.date
				,'toBeSent':true}).exec(function(err,articles){
		if (err){
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

/* UPDATE toBeSent for an article */
router.put('/articles/:article/seen', function(req, res, next){
	req.article.seen(function(err, article){
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
	Article.remove({
		_id: req.article._id
	},function(err,result){
		if (err){
			res.send(err);
		}	
		res.json({message:"Successfully deleted"});
	});
});

/* POST new article reminder */
router.post('/articles', function(req, res, next){
	var article = new Article(req.body);
	
	//article.user = req.payload.username;
	
	article.save(function(err, article){
		if (err) {
			return next(err);
		}

		res.json(article);
	});
});

// Parameter for article
router.param('article', function(req, res, next, id){
	var query = Article.findById(id);

	query.exec(function (err, article) {
		if (err) { return next(err); }
		if(!article) { return next(new Error('can\'t find article')); }

		req.article = article;
		return next();
	});
});

/* GET register a user */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()
    				,id: user._id});
  });
});

/* GET login a user */
router.post('/login', function(req, res, next){
	console.log("in login");
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()
      					,id: user._id});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
