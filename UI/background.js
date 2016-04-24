var serverUrl = 'http://ec2-54-201-166-96.us-west-2.compute.amazonaws.com:3000';

function dateFormat(date){
  var month = date.getMonth() < 10 ? "0"+date.getMonth():date.getMonth()
        ,day = date.getDate() < 10 ? "0"+date.getDate():date.getDate()
        ,year = date.getFullYear();
  return month+day+year;
}

function beforeTomorrow(article,today){
  console.log("In lessThan");
  console.log("article: "+article+"\ndate2: "+today);
  var articleArray = [article.slice(4),article.slice(0,2),article.slice(2,4)];
  var todayArray = [today.slice(4),today.slice(0,2),today.slice(2,4)];

  for (i=0;i<3;i++){
    if (articleArray[i]==todayArray[i]){
      if (i<2){continue;}else{return true;}
    } else{
      return articleArray[i]<todayArray[i];
    }
  }
}

function snoozeArticle(article){
  var xhr = new XMLHttpRequest();
  xhr.open("PUT", serverUrl+'/articles/' + article._id + '/snooze', true);
  xhr.send();
}

function articleSeen(article){
  var xhr = new XMLHttpRequest();
  xhr.open("PUT",serverUrl+'/articles/'+article._id+'/seen',true);
  xhr.send();
}


// Check to see if there are any alarms 
function checkAlarms(user){
var date = new Date();
  date = dateFormat(date);

  console.log(date);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4 && xhr.status == 200){
      var articles = JSON.parse(xhr.responseText);
      console.log(articles);
      articles.forEach(function(article){
        console.log('article name ' + article.name);
        console.log('unix timestamp:' + article.remind_me.time);

        var articleObj = {};
        articleObj[article._id] = article;
        chrome.storage.local.set( articleObj );
        console.log('time ' + Number(article.remind_me.time));    

        if (beforeTomorrow(article.remind_me.date,date)){
          console.log("Add this to notificaton queue");
          chrome.alarms.create(article._id, { when: Number(article.remind_me.time) });
        }
        // chrome.alarms.create(article._id, { when: Number(article.remind_me.time) });
     });
    }
  }
  xhr.open("GET", serverUrl+"/user/" + user, true);
  xhr.send();
}

function setNewDayAlarm(){
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log(tomorrow);
  tomorrow.setHours(0,0,0,0); // set an alarm to midnight to start checking alarms for next day

  var untilTomorrow = tomorrow - (new Date());
  chrome.alarms.create("newDay", { when: Date.now() + untilTomorrow }); 
}

chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name === "newDay"){
      console.log("new day works!");
      checkAlarms(); 
      setNewDayAlarm();
    }
    else{
      chrome.storage.local.get(alarm.name, function(result){
        createNotification(result[alarm.name]);
      });
    }
 });

function createNotification(article){

  if(!article.hasOwnProperty('note')){
    article.note = "";
  }

  var opt = {
    type: "basic",
    title: article.name, 
    message: article.note, 
    iconUrl: "../../UI/RememberMe.Logo.png", 
    buttons: [{title: 'snooze'}], 
    priority: 0
  };

  chrome.notifications.create(article._id,opt,function(){
    console.log('reached here for ' + article.name);
  });
}

chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.storage.local.get(notificationId, function(result){
    var article = result[notificationId];
    console.log('article ' + article.name);
    chrome.tabs.create({ url: article.link });
    articleSeen(result[notificationId]);
    chrome.notifications.clear(notificationId, function() {});
  });
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  chrome.storage.local.get(notificationId, function(result){
    console.log('snooze clicked');
    snoozeArticle(result[notificationId]); 
    chrome.notifications.clear(notificationId, function() {});
  });
});