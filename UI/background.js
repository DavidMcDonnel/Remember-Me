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

function audioNotification(){
    var yourSound = new Audio('http://www.html5rocks.com/en/tutorials/audio/quick/test.mp3');
    yourSound.play();
}

function createNotification(title, message){
    var opt = {type: "basic",title: title,message: message,iconUrl: "UI/RMicon.png"}
    chrome.notifications.create("notificationName",opt,function(){});

    //include this line if you want to clear the notification after 5 seconds
    setTimeout(function(){chrome.notifications.clear("notificationName",function(){});},5000);
}