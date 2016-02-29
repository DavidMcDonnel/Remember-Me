var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	name: String,
	link: String,
	created: { type: Date, default: Date.now },
	remind_on: Date
});

mongoose.model('Article', ArticleSchema);