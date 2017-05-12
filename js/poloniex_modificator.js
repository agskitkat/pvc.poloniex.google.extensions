$(document).ready(function(){
	console.log("Ready to work !");
	var precentBig = 0.00001;

	var bidsTotal = 0;
	var asksTotal = 0;
	
	var momentBids = 0;
	var momentSell = 0;

	$("#bidsTotal").bind("DOMSubtreeModified", function(){
		bidsTotalPRE = parseFloat($(this).html());
		if(bidsTotalPRE) {
			bidsTotal = bidsTotalPRE;
		}
	});
	
	$("#asksTotal").bind("DOMSubtreeModified", function(){
		asksTotalPRE = parseFloat($(this).html());
		if(asksTotalPRE) {
			asksTotal = bidsTotalPRE;
		}
	});

	function updateColor() {	
		momentBids = 0;
		momentSell = 0;
	
		$("#bidsTableBody tr").each(function(key, val){
			orderTotal = parseFloat($(val).find(".orderTotal").html());
			if(orderTotal > bidsTotal * precentBig) {
				momentBids += orderTotal;
				$(this).find("td").css("color", "#11AA11");
			} else {
				$(this).find("td").css("color", "#6f9397");
			}
		});
		
		$("#sellOrderBookTable tr").each(function(key, val){
			orderTotal = parseFloat($(val).find(".orderTotal").html());
			if(orderTotal > asksTotal * precentBig) {
				momentSell += orderTotal;
				$(this).find("td").css("color", "#AA1111");
			} else {
				$(this).find("td").css("color", "#6f9397");
			}
		});
		
		$(".sellOrders .head .name").html("SELL " + momentSell.toFixed(0));
		$(".buyOrders .head .name").html("BUY " + momentBids.toFixed(0));
	};
	
	setInterval(updateColor, 1000);

});

/* 

LIMITER

Variables:
	- CurrentPrice  // текущий ценник
	- SellPrice     // ценник продажи валюты, высшая ступень лестницы. [задаётся в % от CurrentPrice]
	- StopAmount    // количество ступеней лестницы
	- StopStep      // шаг (задаётся абсолютной величиной, или % от SellPrice, на выбор пользователя)
	- UpdateTrigger // процент роста валюты, при котором SellPrice и вся лестница сдвигается вверх

	- currentPrice  = 100$
	- SellPrice     = 10$ (10%) 
	- StopAmount    = 4
	- StopStep      = 
	- UpdateTrigger = 
	
	Logic:
		if(CurrentPrice() >= CurrentPrice() + UpdateTrigger * (( CurrentPrice() / 100) + CurrentPrice() ) ) {
			
		}
	
		IF CurrentPrice вырос на UpdateTrigger THEN
		update(SellPrice + SellPrice * UpdateTrigger)

		update(): 	// заново выстроить лестницу на основе введённых переменных и нового курса.

		получается цикл, число повторений = StopAmount
		1. SELL(Depo / StopAmount AT SellPrice)
		2. SELL(Depo / StopAmount AT SellPrice - StopStep)
		3. SELL(Depo/StopAmount AT SellPrice - 2*StopStep)
 */
 
 
 
 
$(".cols .col.sellCol .head .linkContainer").html("<button href='#' id='ShivaTradeInc_autoLimiter'>ALB</button>");
$('.side').append('<div class="box"><div class="head"><div class="name">ShivaTradeInc Log</div> </div><div class="data" id="ShivaTradeInc_log"></div>');
$('.cols .col.sellCol .head').on('click', '#ShivaTradeInc_autoLimiter', function() {
	data = $('.cols .col.sellCol .data');
	
	StartCurrentPrice = $("#hilights .info").html();
	

	$(data).html("<tr><td>Amount:</td><td><input type='text' id='Amount' placeholder='Amount' value=''> <b id='AmountCash'></b></td></tr>");
	
	// текущий ценник
	$(data).append("<tr><td>CurrentPrice:</td><td><input type='text' id='CurrentPrice' placeholder='CurrentPrice (Click to update)' value='"+StartCurrentPrice+"'></td></tr>");
	$(data).on('click', '#CurrentPrice', function() {
		nowPrice = parseFloat($("#hilights .info").html());
		$("#CurrentPrice").val(nowPrice);
	});
	
	// ценник продажи валюты, высшая ступень лестницы. [задаётся в % от CurrentPrice]
	$(data).append("<tr><td>SellPrice % or $:</td><td><input type='text' id='SellPrice'  placeholder='SellPrice %' value=''><b id='SellPriceReal'></b></td></tr>");
	$(data).on('change', '#SellPrice', function() {
		nowPrice = parseFloat($("#CurrentPrice").val());
		str = $("#SellPrice").val();
		SellPrice = precentOrValue(str, nowPrice, 0);
		//$("#SellPriceReal").html(SellPrice);
	});
	// количество ступеней лестницы
	$(data).append("<tr><td>StopAmount:</td><td><input type='text' id='StopAmount' placeholder='StopAmount' value='3'></td></tr>");
	
	// шаг (задаётся абсолютной величиной, или % от SellPrice, на выбор пользователя)
	$(data).append("<tr><td>StopStep % or $:</td><td><input type='text' id='StopStep' placeholder='StopStep %' value=''><b id='StopStepView'></b></td></tr>");
	$(data).on('change', '#StopStep', function() {
		Price = parseFloat($("#CurrentPrice").val());
		str = $("#StopStep").val();
		StopStep = precentOrValue(str, Price, 0);
		//$("#StopStepView").html(StopStep);
	});
	
	// процент роста валюты, при котором SellPrice и вся лестница сдвигается вверх
	$(data).append("<tr><td>UpdateTrigger (N\A):</td><td><input type='text' id='UpdateTrigger' placeholder='UpdateTrigger' value=''><b id='UpdateTriggerView'></b></td></tr>");
	$(data).on('change', '#UpdateTrigger', function() {
		Price = parseFloat($("#CurrentPrice").val());
		str = $("#UpdateTrigger").val();
		UpdateTrigger = parseFloat(precentOrValue(str, Price, Price));
		//$("#UpdateTriggerView").html(UpdateTrigger);
	});
	
	$(data).on('change', 'input', function() {
		$("#ShivaTradeInc_log").html("Log...");
		$("#ShivaTradeInc_log").append("<b>Preview sell orders</b>");
		sell = limiterSell(false);
		for(i=0; sell.length > i; i++) {
			$("#ShivaTradeInc_log").append(sell[i].rate + " - " + sell[i].amount +"<br>");
		}
	});
	
	$(data).append("<button href='#' id='ShivaTradeInc_autoLimiter_SELL'>SELL</button>");
	$(data).on('click', '#ShivaTradeInc_autoLimiter_SELL', function() {
		limiterSell(true);
	});
	$('#secondaryBalance').unbind();
	$('#secondaryBalance').bind('click', function(){
		console.log("Allin !");
		$("#Amount").val($(this).html());
	});
});

function limiterSell(sellx) {
	$("#ShivaTradeInc_log").html("");
	
	Amount = parseFloat($("#Amount").val());
	StopAmount = parseFloat($("#StopAmount").val());
	Price = parseFloat($("#CurrentPrice").val());
	str = $("#UpdateTrigger").val();
	UpdateTrigger = parseFloat(precentOrValue(str, Price, Price));
	str = $("#StopStep").val();
	StopStep = precentOrValue(str, Price, 0);
	str = $("#SellPrice").val();
	SellPrice = precentOrValue(str, Price, 0);
	
	
	
	sell = {
		pair : window.currencyPair,
		amount : Amount,
		sellPrice: SellPrice,
		price : Price,
		stopStep : StopStep,
		stopAmount : StopAmount,
		updateTrigger : UpdateTrigger
	}
	
	orders = [];
	
	for(i=0; sell.stopAmount > i; i++) {
		
		orders[i] = {
			currencyPair: sell.pair, 
			rate: (sell.sellPrice - (sell.stopStep * i)), 
			amount : (sell.amount / sell.stopAmount),
			command : "sell"
		};
		if(sellx) {
			setTimeout(SellAction, 500*i, orders[i]);
		}
	};
	return orders;
}

function SellAction(order) {
	// https://poloniex.com/private.php?currencyPair=USDT_XRP&rate=10&amount=0.56717797&command=sell
	$.ajax({
		url: "https://poloniex.com/private.php",
		data: order,
		success: function(data, textStatus, jqXHR){
			console.log("SellOrderRaw ["+i+"]:");
			console.log(order);
			console.log("SellOrderRerquest ["+i+"]: " + data);
		}
	});
}

function precentOrValue(str, full, add) {
	if(str.indexOf("%") != -1) {
		floatNum = parseFloat(str);
		return floatNum * (full / 100) + add;
	} else {
		return str;
	}
}
 
 