console.log("Poloniex include script!");
$.get(chrome.extension.getURL('/js/poloniex_modificator.js'), 
	function(data) {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = data;
		document.getElementsByTagName("head")[0].appendChild(script);
	}
);
