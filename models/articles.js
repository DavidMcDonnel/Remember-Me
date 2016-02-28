var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	name: String,
	link: String,
	reminder: String
});

mongoose.model('Article', ArticleSchema);