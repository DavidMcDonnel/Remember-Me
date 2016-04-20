var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	name: String,
	link: String,
	username: String,
	note: String,
	remind_me: {
		date: String,
		time: String
	}
});

//TODO: get rid of repeat code
function dateFormat(date){
	var month = date.getMonth() < 10 ? "0"+date.getMonth():date.getMonth()
				,day = date.getDate() < 10 ? "0"+date.getDate():date.getDate()
				,year = date.getFullYear();
	return month+day+year;
}

ArticleSchema.methods.snooze = function(callback){
	console.log(this.remind_me.time + ' ' + this.remind_me.date);
	var new_date = new Date(this.remind_me.time*1000);
	console.log('date1 = ' + new_date);
	new_date.setDate(new_date.getDate() + 1); // FIX ME - allow user-specified snooze-time
	console.log('date2 = ' + new_date);
	this.remind_me.date = new_date.toDateString();
	this.save(callback);
};

mongoose.model('Article', ArticleSchema);