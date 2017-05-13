console.log("Poloniex include script!");
$.get(chrome.extension.getURL('/js/poloniex_modificator.js'), 
	function(data) {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = data;
		
		var script_mp3 = document.createElement("script");
		script_mp3.setAttribute("type", "text/javascript");
		script_mp3.innerHTML = "var mppath = '"+chrome.extension.getURL("/mp3/notification.mp3")+"';";
		
		document.getElementsByTagName("head")[0].appendChild(script_mp3);
		document.getElementsByTagName("head")[0].appendChild(script);
	}	
);
