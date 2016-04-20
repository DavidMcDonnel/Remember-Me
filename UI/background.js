/*// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Add Text/Image to Remember-Me";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});  
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var sText = info.selectionText;
  
};*/

//createNotification("Haley", "is the best!");
//audioNotification();
// app.controller('notificationCtrl', ['$scope', 'articles', function($scope, articles){

//   $scope.createNotification = function(id) {
//     console.log('create notifciation for ' + id);

//     var article = {};
//     articles.getOne(id).then(function(data){ 
//       article = data;
//       console.log('article = ' + article.name);

//       var link = article.link;
//       console.log('article = data --> ' + article.link);
//       var opt = {type: "basic",title: article.name, message: article.link,iconUrl: "../../UI/RememberMe.Logo.png", buttons: [/*{ title: "Get to it!", 
//                   iconUrl: "../../UI/checkbox.png"},*/ {title: 'snooze'}], priority: 0}
//         chrome.notifications.create(id,opt,function(){
//           console.log('reached here for ' + article.name);
//         });
//       });

//       chrome.notifications.onClicked.addListener(function(notificationId) {
//       if(notificationId === id){
//         chrome.tabs.create({ url: article.link });
//         chrome.notifications.clear(notificationId, function() {});
//       }
//     });

//     chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
//       console.log("clicked for: " + notificationId);
//       if(notificationId === id){
//         console.log('snooze clicked!');
//         articles.snooze(article); 
//         chrome.notifications.clear(notificationId, function() {});
//       }
//     });
//       //include this line if you want to clear the notification after 5 seconds
//       //setTimeout(function(){chrome.notifications.clear("notificationName",function(){});},5000);
//   };

// Check to see if there are any alarms 
function checkAlarms(articles){
  articles.forEach(function(article){
    var date = new Date(article.remind_me.date);
    var time = article.remind_me.time.split(':');
    date.setHours(time[0],time[1],time[2]);

    console.log('reminder date = ' + date);
    console.log('right now ' + new Date());

    var alarm_time = date - (new Date());
    console.log(article._id + " at " + alarm_time);
    //var info = article.name + "," + article.link + "," + article.note
    var articleObj = {};
    articleObj[article._id] = article;
    chrome.storage.local.set( articleObj );
    chrome.alarms.create(article._id, { when: Date.now() + alarm_time });
  });
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
    // if(alarm.name === "newDay"){
    //   $scope.checkAlarms();
    //   $scope.setNewDayAlarm();
    // }
    // else{
    //   //convert alarm.name (aka article id) to an article object 
    //   var article = {};
    //   articles.getOne(alarm.name).then(function(data){ 
    //     createNotification(data);
    //   });
    // }
    console.log('alarm ' + alarm.name);
    chrome.storage.local.get(alarm.name, function(result){
      createNotification(result[alarm.name]);
    });
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
    chrome.notifications.clear(notificationId, function() {});
  });
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  chrome.storage.local.get(notificationId, function(result){
    console.log('snooze clicked');
    //articles.snooze(article); 
    // angular.injector(['$http', 'mainCtrl.articles']).get('o').snooze(article);

    chrome.notifications.clear(notificationId, function() {});
  });
});