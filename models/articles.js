var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	name: String,
	link: String,
	remind_me: {
		date: String,
		time: {type: String, default: '08:00:00'} 
	} 
});

ArticleSchema.methods.snooze = function(callback){
	var new_date = new Date(this.remind_me.date);
	new_date.setDate(new_date.getDate() + 1); // FIX ME - allow user-specified snooze-time
	this.remind_me.date = new_date.toDateString();
	this.save(callback);
};

mongoose.model('Article', ArticleSchema);