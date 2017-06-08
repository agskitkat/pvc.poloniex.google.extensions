$(document).ready(function(){
	console.log("Ready to work !");
	$(".chartTitle").append(" <br><b> You profit <span id='youProfit'></span></b>")
	
	var precentBig = 0.00001;

	var bidsTotal = 0;
	var asksTotal = 0;
	
	var momentBids = 0;
	var momentSell = 0;
	
	var higestAmountBid = 0;
	var higestAmountSell = 0;
	
	var youLastBuy = 0;
	var youLastSell = 0;
	
	var myOrders = [];

	$(".heading.pad h1").html("You profit today");
	
	$("#bidsTotal").bind("DOMSubtreeModified", function(){
		bidsTotalPRE = parseFloat($(this).html());
		if(bidsTotalPRE) {
			bidsTotal = bidsTotalPRE;
		}
	});
	
	$("#asksTotal").bind("DOMSubtreeModified", function(){
		asksTotalPRE = parseFloat($(this).html());
		if(asksTotalPRE) {
			asksTotal = asksTotalPRE;
		}
	});
    
	
	// Spot Light
	function updateColor() {	
		momentBids = 0;
		momentSell = 0;
		
		higestAmountBid = 0;
		higestAmountSell = 0;
		
		myOrders = [];
		youLastSell = 0;
		
		// Список моих ордеров
		$("#myOrdersTable_wrapper #myOrdersTable tbody > tr").each(function(key, val){
			var p = parseFloat($(val).find("td:eq(1)").html());
			var t = $(val).find("td:eq(0) .sellClass").html();
			myOrders.push( { "type":t, "price":p} );
			if(t == "Sell" && youLastSell == 0) {
				youLastSell = p;
			}
		});
		
		console.log(youLastSell);
		
		$("#bidsTableBody tr").each(function(key, val){
			nv = parseFloat($(val).find(".orderTotal").html());
			momentBids += nv;
			if(nv > higestAmountBid) {
				higestAmountBid = nv;
			}
		});
		
		$("#sellOrderBookTable tr").each(function(key, val){
			sv = parseFloat($(val).find(".orderTotal").html());
			if(sv)
				momentSell = momentSell + sv;
			
			if(sv > higestAmountSell) {
				higestAmountSell = sv;
			}
		});
		
		$(".sellOrders .head .name").html("SELL " + momentSell.toFixed(0));
		$(".buyOrders .head .name").html("BUY " + momentBids.toFixed(0));
		
		if(momentSell > momentBids){
			$(".sellOrders .head .name").css("fontWeight", 'bold');
			$(".buyOrders .head .name").css("fontWeight", '400');
		} else {
			$(".buyOrders .head .name").css("fontWeight", 'bold');
			$(".sellOrders .head .name").css("fontWeight", '400');
		}
	
		$("#bidsTableBody tr").each(function(key, val){
			orderTotal = parseFloat($(val).find(".orderTotal").html());
			
			if(orderTotal >  precentBig) {	
				$(this).find("td").css("color", "rgb(11,"+grad(higestAmountBid, orderTotal)+", 11)");
			} else {
				$(this).find("td").css("color", "#6f9397");
			}
		});
		
		$("#sellOrderBookTable tr").each(function(key, val){
			orderTotal = parseFloat($(val).find(".orderTotal").html());
			orderRate = parseFloat($(val).find(".orderRate").html());
			if(youLastSell.toFixed(8) == orderRate.toFixed(8)) {
				$(this).find("td").css("color", "rgb("+grad(higestAmountSell, orderTotal)+", 127, 11)");
			} else {
				if(orderTotal > precentBig) {
					$(this).find("td").css("color", "rgb("+grad(higestAmountSell, orderTotal)+", 11, 11)");
				} else {
					$(this).find("td").css("color", "#6f9397");
				}
			}
		});
	};
	
	function grad(x, y) {
		c = (127 / x) * y + 127;		
		return c.toFixed(0);
	}
	
	
	setInterval(updateColor, 1000);
	
	$(".controls").append('<div class="controlGroup replaceCheckboxes" title="Spot order of coficent all total volume"> <input min="0"  type="number" name="SpotLight" value="'+precentBig+'" id="SpotLight"><label for="SpotLight">SpotLight</label></div>');
	$(".controls").on('change', '#SpotLight', function() {
		precentBig = $("#SpotLight").val();
		updateColor();
	});

	// RING !
	$("#hilights .row:first").append('<div class="ringPrice"><div class="name">Ring</div><div class="info"><input min="0" style="max-width:100%;" type="number" name="LastPriceRing" value="" id="LastPriceRing"></div></div>');
	$("#hilights .lastPrice .info").bind("DOMSubtreeModified", function(){
		// Ring
		val = $("#LastPriceRing").val();
		if(val > 0) {
			nowPrice = parseFloat($(this).html());
			if(nowPrice < val) {
				audio = document.getElementById('xxx-signal');
				audio.play();
				$("#LastPriceRing").val("");
			}
		}
		
		// YOU PROFIT
		objLast = $("#userTradeHistoryTable tbody tr:first");
		var type = $(objLast).find(".type .buyClass").html();
		if(type) {
			// (a — b) / [ (a + b) / 2 ] | * 100 % 
			a = parseFloat($(objLast).find("td:eq(2)").html());
			youLastBuy = a;
			b = parseFloat($(this).html());
			
			if(a < b) {
				c = 100 * a/b - 100;
				$("#youProfit").css("color", "#1d7424");
			} else {
				c = 100-100*b/a;
				$("#youProfit").css("color", "#c02a1d");
			}
			
			$("#youProfit").html(c.toFixed(2) + "%");
		} else {
			$("#youProfit").html(0 + "% WAIT TO BUY !!!");
		}
	});
});


/* 

LIMITER

Variables:
	- CurrentPrice  // текущий ценник
	- SellPrice     // ценник продажи валюты, высшая ступень лестницы. [задаётся в % от CurrentPrice]
	- StopAmount    // количество ступеней лестницы
	- StopStep      // шаг (задаётся абсолютной величиной, или % от SellPrice, на выбор пользователя)
	- UpdateTrigger // процент роста валюты, при котором SellPrice и вся лестница сдвигается вверх
	
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
 
 
 
 
$(".cols .col.sellCol .head .linkContainer").html("<button class='theButton' href='#' id='ShivaTradeInc_autoLimiter'>ALB</button>");
$('.side').append('<div class="box"><div class="head"><div class="name">ShivaTradeInc Log</div> </div><div class="data" id="ShivaTradeInc_log"></div>');
$('.cols .col.sellCol .head').on('click', '#ShivaTradeInc_autoLimiter', function() {
	data = $('.cols .col.sellCol .data form').hide();
	data = $('.cols .col.sellCol .data #ShivaTradeIncViewX').remove();
	data = $('.cols .col.sellCol .data').append("<div style='padding:4px' id='ShivaTradeIncViewX'></div>");
	data = $('.cols .col.sellCol .data #ShivaTradeIncViewX');
	
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
	/* $(data).append("<tr><td>StopTigger:</td><td><input type='text' id='StopTigger' placeholder='StopTigger' value=''><b id='StopTiggerView'></b></td></tr>");
	$(data).on('change', '#StopTigger', function() {
		Price = parseFloat($("#CurrentPrice").val());
		str = $("#StopStep").val();
		StopStep = precentOrValue(str, Price, 0);
		$("#StopTiggerView").html(StopStep);
	}); */
	
	
	// процент роста валюты, при котором SellPrice и вся лестница сдвигается вверх
	$(data).append("<tr><td>UpdateTrigger (N/A):</td><td><input type='text' id='UpdateTrigger' placeholder='UpdateTrigger' value=''><b id='UpdateTriggerView'></b></td></tr>");
	$(data).on('change', '#UpdateTrigger', function() {
		Price = parseFloat($("#CurrentPrice").val());
		str = $("#UpdateTrigger").val();
		UpdateTrigger = parseFloat(precentOrValue(str, Price, Price));
		//$("#UpdateTriggerView").html(UpdateTrigger);
	});
	
	$(data).on('change', 'input', function() {
		
		$("#ShivaTradeInc_log").html("");
		$("#ShivaTradeInc_log").append("<h4>Orders preview:</h4><table class='dataTable no-footer'><tr><th style='padding:4px' class='odd'>Rate</th><th style='padding:4px' class='odd'>Amount</th></tr>");
		
		onlyStopLimit = $("#stop-limit-only-do").is(':checked');
		if(onlyStopLimit) {
			$("#ShivaTradeInc_autoLimiter_SELL").prop('disabled', true);
		} else {
			$("#ShivaTradeInc_autoLimiter_SELL").prop('disabled', false);
		}
		
		sell = limiterSell(false, false);
		
		for(i=0; sell.length > i; i++) {
			if(!sell[i].stopRate) {
				$("#ShivaTradeInc_log .dataTable").append("<tr><td class='odd' style='padding:4px'>"+sell[i].rate + "</td><td style='padding:4px' class='odd'>" + sell[i].amount +"</td></tr>");
			} else {
				$("#ShivaTradeInc_log .dataTable").append("<tr><td class='odd' style='padding:4px'>STOP : "+(sell[i].stopRate) + "<br>LIMIT : "+(sell[i].rate)+"</td><td style='padding:4px' class='odd'>" + sell[i].amount +"</td></tr>");
			}
		}
		// Расчёт лимита
	
		$("#ShivaTradeInc_log").append("</table>");
		console.log(sell);
	});
	
	$(data).append("<button class='theButton' href='#' id='ShivaTradeInc_autoLimiter_SELL'>SELL</button>");
	$(data).append("<button class='theButton' href='#' id='ShivaTradeInc_autoLimiter_SELL_SL'>SELL +SL</button>");
	$(data).append('<div class="controlGroup replaceCheckboxes" title="Only STOP-LIMIT"><input type="checkbox" name="stop-limit-only-do" id="stop-limit-only-do"><label for="stop-limit-only-do">STOP-LIMIT ONLY</label></div>');
	
	
	$(data).on('click', '#ShivaTradeInc_autoLimiter_SELL', function() {
		limiterSell(true, false);
	});
	
	$(data).on('click', '#ShivaTradeInc_autoLimiter_SELL_SL', function() {
		limiterSellSL(true);
	});
	
	$('#secondaryBalance').unbind();
	$('#secondaryBalance').bind('click', function(){
		console.log("Allin !");
		$("#Amount").val($(this).html());
	});
});

// Продажа с лимитами
function limiterSellSL(sellx) {
	limiterSell(sellx, true);
}

// Продажа лесенкой
function limiterSell(sellx, sl) {
	
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
		
		// https://poloniex.com/private.php?currencyPair=USDT_XRP&rate=10&amount=0.56717797&command=sell
		orders[i] = {
			currencyPair: sell.pair, 
			rate: (sell.sellPrice - (sell.stopStep * i)), 
			amount : (sell.amount / sell.stopAmount),
			command : "sell"
		};
		
		// Не выполняется для расчётов
		if(sellx) {
			// По кнопке SELL ордера на продажу
			setTimeout(PrivateAction, 1000*i, orders[i]);
		}
	};
	
	onlyStopLimit = $("#stop-limit-only-do").is(':checked');
	console.log(onlyStopLimit);
	if(onlyStopLimit) {
		for(i=0; sell.stopAmount > i; i++) {
			orders[i] = {
				currencyPair: sell.pair, 
				rate: (sell.sellPrice - (sell.stopStep * (i + 1))),
				stopRate : 	(sell.sellPrice - (sell.stopStep * i)),			
				amount : (sell.amount / sell.stopAmount),
				command : "stopLimitSell"
			};
			
			if(sl) {
				// Лесенка лимитов
				setTimeout(PrivateAction, 1000*i, orders[i]);
			};
		}
	} else {
		// расчитываем лимит
		//https://poloniex.com/private.php?currencyPair=USDT_XRP&rate=0.09&amount=0.0800000&stopRate=0.1&command=stopLimitSell
		orders[orders.length] = {
			currencyPair: sell.pair, 
			rate: (sell.sellPrice - (sell.stopStep * (i + 1))),
			stopRate : 	(sell.sellPrice - (sell.stopStep * i)),			
			amount : sell.amount,
			command : "stopLimitSell"
		};
	}
	
	// По кнопке SELL+SL
	if(sl) {
		// Закрываем лимитом
		setTimeout(PrivateAction, 1000*i, orders[(orders.length-1)]);
	};
	
	return orders;
}

function PrivateAction(order) {
	
	$.ajax({
		url: "https://poloniex.com/private.php",
		data: order,
		success: function(data, textStatus, jqXHR){
			console.log("OrderRaw ["+i+"]:");
			console.log(order);
			console.log("OrderRerquest ["+i+"]: " + data);
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