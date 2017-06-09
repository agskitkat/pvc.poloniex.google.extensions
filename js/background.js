console.log("Poloniex include script!");
var browser = navigator.appNamebrowser = navigator.appName;
$(function(){
	console.log("jQuery");
});

console.log(chrome.extension.getURL('/js/poloniex_modificator.js'));
$("body").append('<audio style="display:none;"  id="xxx-signal"><source src="'+chrome.extension.getURL("/mp3/notification.mp3")+'" type="audio/mpeg"></audio>');
$("head").append("<script type='text/javascript' src='"+chrome.extension.getURL('/js/poloniex_modificator.js')+"'></script>");
$("head").append("<script type='text/javascript' src='"+chrome.extension.getURL('/js/plx_candlestick.js')+"'></script>");
