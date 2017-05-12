// BUY, SELL, GRAY 
var colors = ["#11AA11", "#AA1111", "#6f9397"];


	if(localStorage['colors']) {
		defColors = localStorage['colors'];
	} else {
		defColors = colors;
	};
	
	for(i=0; i < defColors.length; i++) {
		colors[i] = localStorage['colors'][i];
		$(".color_"+i).val(colorSell);
	}




$("#saveColor").click(function() {
	for(i=0; i< colors.length; i++) {
		colors[i] = $(".color_"+i).val();
	}
	localStorage['colors'] = colors;
});