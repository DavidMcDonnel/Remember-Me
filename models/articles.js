var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	name: String,
	link: String,
	created: { type: Date, default: Date.now },
	remind_me: Date
});

mongoose.model('Article', ArticleSchema);