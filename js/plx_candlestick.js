function backingScale() {
    if ('devicePixelRatio' in window && window.devicePixelRatio > 1)
        return window.devicePixelRatio;
    
    return 1;
}


function preview(canvasId, data, gutterWidth) {
    if (data === undefined) { return false; }
    var c = document.getElementById(canvasId);
    var ctx = c.getContext("2d");
    var scaleFactor = window.devicePixelRatio;
    if (scaleFactor > 1) {
        if (c.style.width < 10) {
            c.style.width = c.width;
            c.style.height = c.height;
            c.width = c.width * scaleFactor;
            c.height = c.height * scaleFactor;
            var ctx = c.getContext("2d");
        }
    }
    gutterWidth *= scaleFactor;
    var width = c.width - (gutterWidth * 2);
    var height = c.height;
    var x, vScale, count = 0;
    var top = 0,
        bottom = 10000;
    var close;
    var marginTop = 10 * scaleFactor;
    var marginBottom = 10 * scaleFactor;
    
    // To avoid unnecessary load, skip data points between pixels
    var iStep = Math.max(Math.floor(data.length/width),1);
    
    for (var i = 0; i < data.length; i+=iStep) {
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
        close = data[i].close;
        if (close > top) top = close;
        if (close < bottom) bottom = close;
    }
    vScale = (height - (marginTop + marginBottom)) / (top - bottom);
    shft = Math.floor(bottom * vScale - marginBottom);
    close = data[0].close;
    ctx.beginPath();
    ctx.moveTo(gutterWidth, height - (close * vScale) + shft);
    
    
    for (var i = 1; i < data.length; i+=iStep) {
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
        close = data[i].close;
        x = (i / data.length) * width;
        ctx.lineTo(x + gutterWidth, height - (close * vScale) + shft);
    }
    if (dark) {
        ctx.strokeStyle = "#34595c";
    } else {
        ctx.strokeStyle = "#084044";
    }
    
    ctx.stroke();
}

function candlestick(canvasId, data, left, right, chartType, dark, smaPeriod,
    emaPeriod, ema2Period, showSma, showEma, showEma2, showFib,
    bollingerBand, mobile) {
	
    if (data === undefined) { return false;}
    if (mobile === undefined)mobile = false;
    if (smaPeriod < 1) smaPeriod = 1;
    if (emaPeriod < 1) emaPeriod = 1;
    if (ema2Period < 1) ema2Period = 1;
    var c = document.getElementById(canvasId);
    var ctx = c.getContext("2d");
    var scaleFactor = window.devicePixelRatio;
    // scaleFactor = 1;

    if (scaleFactor > 1) {
        if (c.style.width < 10) {
            c.style.width = c.width;
            c.style.height = c.height;
            c.width = c.width * scaleFactor;
            c.height = c.height * scaleFactor;
            var ctx = c.getContext("2d");
        }
    }
    ctx.clearRect(0, 0, c.width, c.height);

    var alignYaxisRight = true;
    // console.log('candlestick, data = ', data);

    var width = c.width;
    var height = c.height;
    ctx.lineWidth = 1 * scaleFactor;
    var marginLeft = 65 * scaleFactor;
    var marginRight = 0;
    if (alignYaxisRight) {
        marginLeft = 0 * scaleFactor;
        marginRight = 60 * scaleFactor;
        width = width - marginRight;
    } 
    
	var dateMargin = (mobile ? 10 : 12) * scaleFactor;
    var marginBottom = mobile ? 40 : 60;
    var paddingBottom = mobile ? 22 : 40;
    var marginTop = (mobile ? 10 : 30) * scaleFactor;
    
    var indicatorMargin = mobile ? 0.0 : Math.floor((height - marginBottom) * 0.20); // indicatorMargin already has scale applied from height
    
    marginBottom *= scaleFactor;
    paddingBottom *= scaleFactor;
    paddingBottom += indicatorMargin;
    marginBottom += indicatorMargin;
    
    var smooth = 2 / (1 + parseInt(emaPeriod));
    var smooth2 = 2 / (1 + parseInt(ema2Period));
    var macdSmooth = 2 / (1 + 9);
    var ema12Smooth = 2 / (1 + 12);
    var ema26Smooth = 2 / (1 + 26);
    
    var prevEmaEntry = 0;
    var prevMacdEntry = 0;
    var prevEma12Entry = 0;
    var prevEma26Entry = 0;
    
    var macdEntry = 0;
    var ema12Entry = 0;
    var ema26Entry = 0;
    var high, low, open, close, volume;
    var chartHigh, chartLow;
    var top = 0,
        bottom = 10000,
        maxVol = 0;
    var x, y, w, h, vScale, volScale, count = 0;
    var fibLowX, fibHighX;
	
	var alredyMySellsDraw = [];
	var alredyMyBuysDraw = [];
	
    //trace(canvasId + ' w = ' + width + ', h = ' + height + ' ; d=' +dark);
    if (dark) {
        var borderColor = "#1f3232";
        var wickColor = "#274141";
        var textColor = "#6f9397";
        var hLineColor = "#1f3232";
        var vLineColor = "#1f3232";
        var volumeColor = "#172a2c";
        var greenColor = "#117e1a";
        var redColor = "#7b1111";
        var emaColor = "rgb(190,190,30)";
        var ema2Color = "rgb(150,110,70)";
        var smaColor = "rgba(70,120,230,0.7)";
        var fibLineColor = "rgba(197,132,7,0.3)";
    } else {
        var borderColor = "#91abac";
        var wickColor = "#223535";
        var textColor = "#1e2324";
        var hLineColor =  "#e9f0f0";
        var vLineColor = "#e9f0f0";
        var volumeColor = "#b5c8c9";
        var greenColor = "#339349";
        var redColor = "#a42015";
        var emaColor = "rgb(210,200,130)";
        var ema2Color = "rgb(200,150,230)";
        var smaColor = "rgba(30,60,190,0.7)";
        var fibLineColor = "rgba(175,100,100,0.75)";
    }

    if (right > 1) right = 1;
    if (left >= right)left = right - 0.001;
    if (left < 0) left = 0;
    if (right <= left)right = left + 0.001;
    
    numberOfCandles = Math.floor(data.length * (right - left));
    var end = Math.floor(data.length * right);
    var start = end - numberOfCandles;
    var candleWidth = ((width - marginLeft) / numberOfCandles) * (2 / 3);
    var wickWidth = candleWidth / 4;
    var candleSpacing = candleWidth / 2;
    var returnArray = new Array();
    var detectArray = new Array();
    var month = new Array();
    var bBand1 = [];
    var bBand2 = [];
    var sd;
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";
    var size = Math.floor(10 * scaleFactor);
    ctx.font = size + "px Arial";
    ctx.clearRect(0, 0, width, height);
    if (data.length < 2) {
        ctx.fillStyle = textColor;
        ctx.fillText(
            "Chart will be available once a few more trades have been made.",
            width / 2 - 245, height / 2 - 20);
        detectArray[0] = {
            'left': 0,
            'right': width * scaleFactor,
            'high': 0.0,
            'low': 0.0,
            'open': 0.0,
            'close': 0.0,
            'volume': 0.0,
            'quoteVolume': 0.0,
            'weightedAverage': 0.0,
            'date': 'N/A'
        };
        returnArray['detectArray'] = detectArray;
        returnArray['high'] = 0.0;
        returnArray['low'] = 0.0;
        return returnArray;
    }
    for (var i = start; i < end; i++) {
        if (i < 0) continue;
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
        if (data[i].high > top) top = data[i].high;
        if (data[i].low < bottom) bottom = data[i].low;
        if (data[i].volume > maxVol) maxVol = data[i].volume;
    }
    chartHigh = top;
    chartLow = bottom;
    if (top == bottom) {
        top += 0.00000005;
        bottom -= 0.00000005;
        if (bottom < 0) bottom = 0;
    }
    vScale = (height - (marginTop + marginBottom)) / (top - bottom);
    volScale = (height - marginTop) / maxVol;
    volScale = volScale * 0.6;
    shft = Math.floor(bottom * vScale - marginBottom);
    var step = Math.floor(height / (50*scaleFactor));
    var decimals = 4;
    var counter = 1;
    while (bottom.toFixed(counter) == 0 && decimals < 8) {
        decimals++;
        counter++;
    }
    var sticksPerTimestamp = Math.round(32*scaleFactor/candleWidth);
    if (sticksPerTimestamp < 1) sticksPerTimestamp = 1;
    var dateString, timeString;
    var timestampCount = sticksPerTimestamp;

    // Draw vertical lines and dates
    for (var i = start; i < end; i++) {
        if (i < 0) continue;
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
        if (timestampCount == sticksPerTimestamp) {
            timestampCount = 0;
            var date = new Date(data[i].date * 1000);
            dateString = month[date.getUTCMonth()] + " " + date.getUTCDate();
            timeString = " " + ("0" + date.getUTCHours()).slice(-2) + ":" +
                ("0" + date.getUTCMinutes()).slice(-2);
            ctx.fillStyle = vLineColor;
            x = marginLeft + count * (candleWidth + candleSpacing) + (
                candleWidth / 2);
            y = 0;
            w = 1;
            h = height;
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = textColor;

            var dateH =  height - dateMargin;
            var timeH = dateH + 10*scaleFactor;
            x -= 13 * scaleFactor;

            if (alignYaxisRight) {
                if (count > 0) {
                    ctx.fillText(dateString, x, dateH);
                    ctx.fillText(timeString, x, timeH);
                }
            } else {
                // align y axis left
                
                ctx.fillText(dateString, x, dateH);
                
                ctx.fillText(timeString, x, timeH);
            }
                
        }
        timestampCount++;
        count++;
    }
    
    if (alignYaxisRight) { 
        // draw rightmost v line
        ctx.fillStyle = borderColor;
        ctx.moveTo(0, width);
        ctx.fillRect(width, 0, 1, height);
    }

    count = 0;
    var lineBottom = bottom - ((marginBottom - paddingBottom) / vScale);
    if (lineBottom < 0){
	    lineBottom = 0;
	    paddingBottom -= Math.round((bottom - ((marginBottom - paddingBottom) / vScale)) * vScale);
    }
    var lineTop = top + (marginTop / vScale);
	
    // horiz lines and yaxis text
    for (var l = lineBottom; l <= lineTop+((lineTop - lineBottom) / step)/2; l += (lineTop - lineBottom) / step) {
        ctx.fillStyle = hLineColor;
        x = marginLeft;
        y = Math.floor(height - (l * vScale));
        w = width;
        h = 1;
        var horizLineW = width; 
        if (alignYaxisRight) { horizLineW = c.width; }
        ctx.fillRect(x, y + shft, horizLineW, h);
        ctx.fillStyle = textColor;
		
        // move yaxis text into right margin
        var labelPos = 0;
        if (alignYaxisRight) { labelPos = w + 5; }
        var txtYpos = y + shft - 3;
        if ((l+(lineTop - lineBottom)/step)>lineTop+((lineTop - lineBottom) / step)/2)txtYpos+=10*scaleFactor+(2/scaleFactor);
        ctx.fillText(l.toFixed(decimals), labelPos, txtYpos);
        lineRangeTop = l;
    }
    lineRangeBottom = lineBottom;
    
    for (var i = 0; i < start; i++) {
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
        close = data[i].close;

        if (prevEmaEntry == 0) prevEmaEntry = close;
        emaEntry = (close * smooth) + (prevEmaEntry * (1 - smooth));
        prevEmaEntry = emaEntry;
        
        if (prevEma12Entry == 0)prevEma12Entry = close;
        ema12Entry = (close * ema12Smooth) + (prevEma12Entry * (1 - ema12Smooth));
        prevEma12Entry = ema12Entry;
        
         if (prevEma26Entry == 0)prevEma26Entry = close;
        ema26Entry = (close * ema26Smooth) + (prevEma26Entry * (1 - ema26Smooth));
        prevEma26Entry = ema26Entry;
        
        macdClose = prevEma12Entry-prevEma26Entry;
        if (prevMacdEntry == 0)prevMacdEntry = macdClose;
        macdEntry = (macdClose * macdSmooth) + (prevMacdEntry * (1 - macdSmooth));
        prevMacdEntry = macdEntry;
    }
	
	
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - (prevEmaEntry * vScale) + shft);
    for (var i = start; i < end; i++) {
        if (i < 0) continue;
        if (!(data[i] instanceof Object)) {
            delete data[i];
            continue;
        }
		
		//console.log(data[i]);
		
        high = data[i].high;
        low = data[i].low;
        open = data[i].open;
        close = data[i].close;
        volume = data[i].volume;
        ctx.fillStyle = volumeColor;
        x = (count * candleWidth) + (count * candleSpacing) - 1;
        w = candleWidth + (candleSpacing / 2);
        h = Math.floor(volume * volScale);
        y = height - h;
        ctx.fillRect(x + marginLeft, y - paddingBottom, w, h);
        ctx.fillStyle = wickColor;
        x = (count * candleWidth) + (count * candleSpacing) + (candleWidth /
            2) - (wickWidth / 2);
        y = height - (high * vScale);
        h = (high - low) * vScale;
        //x=Math.floor(x);
		
        ctx.fillRect(x + marginLeft, y + shft, wickWidth, h);
		
        if (low == chartLow) fibLowX = x;
        if (high == chartHigh) fibHighX = x;
        if (close > open) {
            y = height - (close * vScale);
            h = (close - open) * vScale;
            ctx.fillStyle = greenColor;
        }
        if (close < open) {
            y = height - (open * vScale);
            h = (open - close) * vScale;
            ctx.fillStyle = redColor;
        }
        if (close == open) {
            y = height - (open * vScale);
            h = 1;
        }
        x = (count * candleWidth) + (count * candleSpacing);
        if (h < 1) h = 1;
        y = Math.floor(y);
        h = Math.floor(h);
        ctx.fillRect(x + marginLeft, y + shft, candleWidth, h);
        if (prevEmaEntry == 0){
	        prevEmaEntry = close;
	        ctx.moveTo(marginLeft, height - (prevEmaEntry * vScale) + shft);
	    }
        emaEntry = (close * smooth) + (prevEmaEntry * (1 - smooth));
        prevEmaEntry = emaEntry;
        ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (emaEntry *
            vScale) + shft);
        var date = new Date(data[i].date * 1000);
        timeString = " " + ("0" + date.getUTCHours()).slice(-2) + ":" + (
            "0" + date.getUTCMinutes()).slice(-2);
        dateString = month[date.getUTCMonth()] + " " + date.getUTCDate() +
            " " + timeString;
        detectArray[count] = {
            'left': (x + marginLeft) / scaleFactor,
            'right': (x + marginLeft + candleWidth + candleSpacing) / scaleFactor,
            'high': high,
            'low': low,
            'open': open,
            'close': close,
            'volume': volume,
            'quoteVolume': data[i].quoteVolume,
            'weightedAverage': data[i].weightedAverage,
            'date': dateString
        };
        count++;
        // because the canvas is 2x as wide as the div that contains it, for hi-res screens, we have to scale down the detect array elements
        // count += scaleFactor / 2;
    }
    // trace('create detectArray (' + detectArray.length + '), ' + detectArray[detectArray.length-1].right);
    // trace('scale is ' + scaleFactor);
    ctx.strokeStyle = emaColor;
    if (showEma) ctx.stroke();
    var iiStart = start - smaPeriod;
    var smaCount = 0;
    var sma = 0;
    if (iiStart < 0) iiStart = 0;
    for (var ii = iiStart; ii < start; ii++) {
        sma += data[ii].close
        smaCount++;
    }
    sma = sma / smaCount;
    bBand1.push(sma - (sd * 2));
    bBand2.push(sma + (sd * 2));
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - (sma * vScale) + shft);
    count = 0;
    for (var i = start; i < end; i++) {
        iiStart = i - smaPeriod;
        smaCount = 0;
        sma = 0;
        if (iiStart < 0) iiStart = 0;
        for (var ii = iiStart; ii <= i; ii++) {
            sma += data[ii].close
            smaCount++;
        }
        sma = sma / smaCount;
        x = (count * candleWidth) + (count * candleSpacing);
        ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (sma *
            vScale) + shft);
        if (bollingerBand) {
            // Standard Deviation
            sd = 0;
            for (var ii = iiStart; ii <= i; ii++) {
                sd += (data[ii].close - sma) * (data[ii].close - sma);
            }
            sd = Math.sqrt(sd / smaCount);
            bBand1.push(sma - (sd * 2));
            bBand2.push(sma + (sd * 2));
        }
        count++;
    }
    ctx.strokeStyle = smaColor;
    if (showSma) ctx.stroke();
    if (bollingerBand) {
        ctx.beginPath();
        ctx.moveTo(marginLeft, height - (bBand1[0] * vScale) + shft);
        count = 0;
        for (var i = 1; i < bBand1.length; i++) {
            x = (count * candleWidth) + (count * candleSpacing);
            ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (bBand1[
                i] * vScale) + shft);
            count++;
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(marginLeft, height - (bBand2[0] * vScale) + shft);
        count = 0;
        for (var i = 1; i < bBand2.length; i++) {
            x = (count * candleWidth) + (count * candleSpacing);
            ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (bBand2[
                i] * vScale) + shft);
            count++;
        }
        ctx.stroke();
    }
    // Ema2
    if (showEma2) {
        prevEmaEntry = 0;
        for (var i = 0; i < start; i++) {
            close = data[i].close;
            if (prevEmaEntry == 0) prevEmaEntry = close;
            emaEntry = (close * smooth2) + (prevEmaEntry * (1 - smooth2));
            prevEmaEntry = emaEntry;
        }
        ctx.beginPath();
        ctx.moveTo(marginLeft, height - (prevEmaEntry * vScale) + shft);
        count = 0;
        for (var i = start; i < end; i++) {
            if (!(data[i] instanceof Object)) {
                delete data[i];
                continue;
            }
            close = data[i].close;
            if (prevEmaEntry == 0){
	            prevEmaEntry = close;
	            ctx.moveTo(marginLeft, height - (prevEmaEntry * vScale) + shft);
	        }
            x = (count * candleWidth) + (count * candleSpacing);
            emaEntry = (close * smooth2) + (prevEmaEntry * (1 - smooth2));
            prevEmaEntry = emaEntry;
            ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (
                emaEntry * vScale) + shft);
            count++;
        }
        ctx.strokeStyle = ema2Color;
        ctx.stroke();
    }
	
	// Draw my sell & buy +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	if ($(".toolPanel ul #sellCheckbox").is(':checked')) {
		if(mySells.length != alredyMySellsDraw.length) {
			for(var i = 0; i < mySells.length; i++) {	
				if($.inArray(mySells[i], alredyMySellsDraw )) {
					var mySell = mySells[i];
					y = height - (mySell * vScale);
					ctx.strokeStyle = redColor;
					ctx.fillStyle = redColor;
					ctx.fillText(mySell.toFixed(decimals), width - 40, y + shft - 2);
					
					ctx.beginPath();
					
					ctx.lineWidth = 1 * scaleFactor;
					ctx.moveTo(marginLeft, y + shft);
					ctx.lineTo(width, y + shft);
				
					ctx.stroke();
					
					//ctx.moveTo(marginLeft, y + shft);
					//ctx.lineTo(width, y + shft);
					
					alredyMySellsDraw.push(mySell);
				}
			}
		}
		
		if(myBuys.length != alredyMyBuysDraw.length) {
			for(var i = 0; i < myBuys.length; i++) {	
				if($.inArray(myBuys[i], alredyMyBuysDraw )) {
					var myBuy = myBuys[i];
					y = height - (myBuy * vScale);
					ctx.strokeStyle = greenColor;
					ctx.fillStyle = greenColor;
					ctx.fillText(myBuy.toFixed(decimals), width - 40, y + shft - 2);
					
					ctx.beginPath();
					
					ctx.lineWidth = 1 * scaleFactor;
					ctx.moveTo(marginLeft, y + shft);
					ctx.lineTo(width, y + shft);
				
					ctx.stroke();
					
					//ctx.moveTo(marginLeft, y + shft);
					//ctx.lineTo(width, y + shft);
					
					alredyMyBuysDraw.push(myBuy);
				}
			}
		}
	}
    
    // MACD
    if (mobile){
	    ctx.beginPath();
	    ctx.moveTo(marginLeft, height - paddingBottom);
	    ctx.lineTo(c.width, height - paddingBottom);
	    ctx.strokeStyle = textColor;
	    ctx.stroke();
    } else {
	    var macdData = [];
	    var macdRange = 0;
	    var startMacd = prevEma12Entry - prevEma26Entry;
	    var startSig = prevMacdEntry;
	    count = 0;
	    
		for (var i = start; i < end; i++){
			close = data[i].close;
			
			if (prevEma12Entry==0)prevEma12Entry = close;
			ema12Entry = (close * ema12Smooth) + (prevEma12Entry * (1 - ema12Smooth));
            prevEma12Entry = ema12Entry;
            
            if (prevEma26Entry==0)prevEma26Entry = close;
            ema26Entry = (close * ema26Smooth) + (prevEma26Entry * (1 - ema26Smooth));
            prevEma26Entry = ema26Entry;
            
            macdClose = ema12Entry - ema26Entry;
            if (prevMacdEntry==0)prevMacdEntry = macdClose;
            macdEntry = (macdClose * macdSmooth) + (prevMacdEntry * (1 - macdSmooth));
            prevMacdEntry = macdEntry;
			
			hist = macdClose-macdEntry;
            macdData[i] = { "macd": macdClose,
	            			"sig": macdEntry,
	            			"hist": hist};
	        
	        detectArray[count].macd = macdClose;
	        detectArray[count].sig = macdEntry;
	        detectArray[count].hist = hist;
	        count++;
	        macdRange = Math.max(macdRange,Math.abs(macdClose),Math.abs(macdEntry));    			
   		}
   		macdRange *= 1.1; // Padding
   		if (macdRange==0)macdRange=1;
   		
		var ivScale = indicatorMargin / (macdRange*2);
		mShft = (paddingBottom - indicatorMargin) + (macdRange*ivScale);
				
	    for (l=(0-macdRange);l<=macdRange;l=l+((macdRange*scaleFactor)/(2*scaleFactor))){
		    ctx.beginPath();
		    ctx.moveTo(marginLeft, height - (l * ivScale) - mShft);
		    ctx.lineTo(c.width, height - (l * ivScale) - mShft);
		    ctx.strokeStyle = hLineColor;
		    if (l==(0-macdRange) | l==(macdRange))ctx.strokeStyle = textColor;
		    ctx.stroke();
		    
		    ctx.fillStyle = textColor;
	        labelPos = width + 5;
	        var txtYpos = height - (l * ivScale) - mShft - 3
	        if (l>0)txtYpos += 10*scaleFactor+(2/scaleFactor);
	        if (l != 0)ctx.fillText(l.toFixed(8), labelPos, txtYpos);
	    }
	    
	    // MACD and Historgram
	    ctx.beginPath();
        ctx.moveTo(marginLeft, height - (startMacd * ivScale) - mShft);
        count = 0;
        for (var i = start; i < end; i++){
	        x = (count * candleWidth) + (count * candleSpacing);
            ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (macdData[i]['macd'] * ivScale) - mShft);
            
            x = (count * candleWidth) + (count * candleSpacing);
            ctx.fillStyle = macdData[i]['hist']>0 ? greenColor : redColor;
            tinyShift = macdData[i]['hist']>0 ? 1 : -1;
            ctx.fillRect(x + marginLeft,height-mShft,candleWidth,0-(macdData[i]['hist'] * ivScale));
            count++;
        }
        ctx.strokeStyle = emaColor;
        ctx.stroke();
        
        // Signal Line
	    ctx.beginPath();
        ctx.moveTo(marginLeft, height - (startSig * ivScale) - mShft);
        count = 0;
        for (var i = start; i < end; i++){
	        x = (count * candleWidth) + (count * candleSpacing);
            ctx.lineTo(x + marginLeft + (candleWidth / 2), height - (macdData[i]['sig'] * ivScale) - mShft);
            count++;
        }
        ctx.strokeStyle = ema2Color;
        ctx.stroke();
    }
    // Fibonacci Retracement
    if (showFib) {
        ctx.fillStyle = fibLineColor;
        var fibPrice;
        x = marginLeft;
        w = width;
        h = 1;
        fibPrice = chartLow;
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("0%", x, y + shft - 1);
        fibPrice = chartLow + ((chartHigh - chartLow) * 0.236);
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("23.6%", x, y + shft - 1);
        fibPrice = chartLow + ((chartHigh - chartLow) * 0.382);
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("38.2%", x, y + shft - 1);
        fibPrice = chartLow + ((chartHigh - chartLow) * 0.5);
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("50%", x, y + shft - 1);
        fibPrice = chartLow + ((chartHigh - chartLow) * 0.618);
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("61.8%", x, y + shft - 1);
        fibPrice = chartHigh;
        y = Math.floor(height - (fibPrice * vScale));
        ctx.fillRect(x, y + shft, w, h);
        ctx.fillText("100%", x, y + shft - 1);
        ctx.beginPath();
        ctx.moveTo(fibLowX + marginLeft, height - chartLow * vScale + shft);
        ctx.lineTo(fibHighX + marginLeft, height - chartHigh * vScale +
            shft);
        ctx.strokeStyle = fibLineColor;
        ctx.stroke();
    }
    returnArray['detectArray'] = detectArray;
    returnArray['high'] = chartHigh;
    returnArray['low'] = chartLow;
    returnArray['rangeTop'] = typeof lineRangeTop == "undefined" ? 0 : lineRangeTop;
    returnArray['rangeBottom'] = typeof lineRangeBottom == "undefined" ? 0 : lineRangeBottom;
    returnArray['decimals'] = decimals;
    returnArray['mainChartHeight'] = (height - paddingBottom)/scaleFactor;
    returnArray['indicatorHeight'] = indicatorMargin/scaleFactor;
    returnArray['macdRange'] = macdRange;
    return returnArray;
}

function depthChart(canvasId, data, dark) {
    var c = document.getElementById(canvasId);
    var ctx = c.getContext("2d");
    var scaleFactor = backingScale();
    
    if (scaleFactor > 1) {
        if (c.style.width < 10) {
            c.style.width = c.width;
            c.style.height = c.height;
            c.width = c.width * scaleFactor;
            c.height = c.height * scaleFactor;
            var ctx = c.getContext("2d");
        }
    }
    var width = c.width;
    var height = c.height;
   // trace('depthChart: ' + width + ', ' + height);
    var marginLeft = 45 * scaleFactor;
    var marginBottom = 10 * scaleFactor;
    var paddingBottom = 10 * scaleFactor;
    var marginTop = 10 * scaleFactor;
    var marginRight = 20 * scaleFactor;

    marginRight = 0;
    marginTop = 0; 
    marginBottom =  2 * scaleFactor;
    paddingBottom = 11 * scaleFactor;

    var high = 0;
    var bids = data.bids;
    var asks = data.asks;
    var totalBidVol = 0;
    var totalAskVol = 0;
    var totalBidVolBase = 0;
    var totalAskVolBase = 0;
    var vScale, hScale;
    var vShift = marginBottom + paddingBottom;
    var h, v;
    var depthDetectArrayBids = new Array();
    var depthDetectArrayAsks = new Array();
    if (dark) {
        var borderColor = "#1f3232";
        var asksStrokeColor = '#b32119'; //red
        var asksAreaColor = 'rgba(179, 33, 25, 0.25)';
        var bidsStrokeColor = '#117e1a';
        var bidsAreaColor = 'rgba(17, 126, 26, 0.25)';
        var lineColor = '#1f3232';
        var textColor = "#6f9397";
    } else {
        var borderColor = "#91abac";
        var asksStrokeColor = '#a42015';
        var asksAreaColor = 'rgba(164, 32, 21, 0.3)';
        var bidsStrokeColor = '#339349';
        var bidsAreaColor = 'rgba(51, 147, 73, 0.3)';
        var lineColor = '#c1d0d0';
        var textColor = "#1e2324";
    }

    // horiz lines
    ctx.lineWidth = 3 * scaleFactor;
    var size = Math.floor((10 * scaleFactor)).toString();
    ctx.font = size + "px Arial";
    if (bids.length < 1) return;
    ctx.clearRect(0, 0, width, height);
    if (!(bids[0] instanceof Array)) return;
    if (!(asks[0] instanceof Array)) return;
    hScale = ((width - marginLeft - marginRight) / 2) / ((asks[0][0] + bids[
        0][0]) / 2);
    for (var i = 0; i < bids.length; i++) {
        if ((i > (bids.length - (bids.length / 10))) && bids.length > 5 &&
            bids[i][1] > totalBidVol / 2) continue;
        totalBidVol += bids[i][1];
    }
    for (var i = 0; i < asks.length; i++) {
        if ((asks[i][0] * hScale) > (width - marginLeft - marginRight))
            continue;
        totalAskVol += asks[i][1];
    }
    if (high < ((totalAskVol + totalBidVol) / 2)) high = ((totalAskVol +
        totalBidVol) / 2);
    if (high > Math.min(totalAskVol,totalBidVol)*2)high = Math.min(totalAskVol,totalBidVol)*2;
    vScale = (height - marginBottom - marginTop) / high;
    var roundLength = Math.pow(10, (Math.floor(high).toString().length - 3));
    if (roundLength < 1) roundLength = 1;

    var firstBid = bids[0][0];
    var lastBid = bids[bids.length-1][0];
    var firstAsk = asks[0][0]
    var lastAsk = asks[asks.length-1][0];
    var range = lastAsk - lastBid;
    // hScale /= 2;

    // trace('high is ' + high + ', range is ' + range);
    // trace('bids from ' + firstBid + ' to ' + lastBid)
    // trace('asks from ' + firstAsk + ' to ' + lastAsk);
   // console.log(bids, asks);

    var count = 1;
    for (var i = 0; i < high; i += (high / 4)) {
        roundedI = Math.floor(i / roundLength) * roundLength;
        h = marginLeft;
        w = width - marginLeft - marginRight;
        h = 0;
        w = width;
        v = height - vShift - (roundedI * vScale);
        ctx.fillStyle = lineColor;
        // bottom line darker
        if (count++ === 1) { ctx.fillStyle = borderColor;}
        // trace('h line ' + count)
        ctx.fillRect(h, v, w, 1);
        ctx.fillStyle = textColor;
        ctx.fillText(roundedI, 0, v - 3);
       // trace(i + ', ' + roundedI);
    }

    // vertical lines
    var priceWidth = (width - marginLeft - marginRight) / hScale;
    var start = ((asks[0][0] + bids[0][0]) / 2) - (((width - marginLeft -
        marginRight) / 2) / hScale);
    // start = bids[bids.length-1][0] / hScale;
    for (var i = 0; i < priceWidth; i += 100*scaleFactor/hScale) {
    // for (var i = lastBid; i <= lastAsk; i += (range / 8)) {
        var decimals = 2;
        var counter = 1;
        while (parseFloat(i.toFixed(counter)) == 0 && decimals < 8) {
            decimals++;
            counter++;
        }
        if (i == 0) decimals = 4;
        var fixed = decimals + 2;
        if (fixed > 8) fixed = 8;
        var roundedI = parseFloat(i.toFixed(decimals)).toFixed(fixed);
        var roundedText = (i + start);
        roundedText = parseFloat(roundedText.toFixed(decimals)).toFixed(
            fixed);
        h = marginLeft + roundedI * hScale;
        // trace(i + ' : ' + roundedText + ' | ' + hScale);
        ctx.fillStyle = lineColor;
        ctx.fillRect(h, marginTop, 1, height - vShift - marginTop);
        ctx.fillStyle = textColor;
        ctx.fillText(roundedText, h - (8 * (decimals + 1)), height -
            marginBottom);
    }

    // bids
    totalBidVol = bids[0][1];
	totalBidVolBase = bids[0][0] * bids[0][1];
	
    // bids fill area
    ctx.beginPath();
    // ctx.moveTo(marginLeft, height - vShift);
    h = bids[0][0] * hScale + marginLeft;
    v = height - (totalBidVol *
        vScale) - vShift;
    ctx.moveTo(h, height - vShift);
    ctx.lineTo(h, v);
    depthDetectArrayBids[0] = {'h': h / scaleFactor,'v': v / scaleFactor,'rate': bids[0][0],'quoteSum': totalBidVol,'baseSum': totalBidVolBase};
    var lastV = v;
    var lastH = h;
    for (var i = 1; i < bids.length; i++) {
        totalBidVol += bids[i][1];
        totalBidVolBase += bids[i][0] * bids[i][1];
        h = bids[i][0] * hScale;
        v = height - (totalBidVol * vScale);
        if (h > (width - marginLeft - marginRight)) continue;
        ctx.lineTo(h + marginLeft, v - vShift);
        lastV = v - vShift;
        lastH = h + marginLeft;
        depthDetectArrayBids[i] = {'h': (h + marginLeft) / scaleFactor,'v': (v - vShift) / scaleFactor,'rate': bids[i][0],'quoteSum': totalBidVol,'baseSum': totalBidVolBase};
    }

    ctx.lineTo(marginLeft, lastV);
    ctx.strokeStyle = bidsStrokeColor;
    ctx.stroke();
    ctx.lineTo(marginLeft, height - vShift);
    ctx.fillStyle = bidsAreaColor;
    ctx.fill();

    // bids line, original
    if (false){
	    totalBidVol = bids[0][1];
	    ctx.beginPath();
	    ctx.moveTo(bids[0][0] * hScale + marginLeft, height - vShift);
	    ctx.lineTo(bids[0][0] * hScale + marginLeft, height - (totalBidVol * vScale) - vShift);
	    for (var i = 1; i < bids.length; i++) {
	        totalBidVol += bids[i][1];
	        h = bids[i][0] * hScale;
	        v = height - (totalBidVol * vScale);
	        if (h > (width - marginLeft - marginRight)) continue;
	        ctx.lineTo(h + marginLeft, v - vShift);
	    }
	    ctx.strokeStyle = bidsStrokeColor;
	    ctx.stroke();
	}

    // asks area
    totalAskVol = asks[0][1];
	totalAskVolBase = asks[0][0] * asks[0][1];

    ctx.beginPath();
    var startX = asks[0][0] * hScale + marginLeft;
    var startY = height - vShift;
    v = height - (totalAskVol *
        vScale) - vShift;
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, v);
    depthDetectArrayAsks[0] = {'h': startX / scaleFactor,'v': v / scaleFactor,'rate': asks[0][0],'quoteSum': totalAskVol,'baseSum': totalAskVolBase};
    var lastH;
    var lastV;
    for (var i = 1; i < asks.length; i++) {
        totalAskVol += asks[i][1];
        totalAskVolBase += asks[i][0] * asks[i][1];
        h = asks[i][0] * hScale;
        v = height - (totalAskVol * vScale);
        if (h < 0) continue;
        var plotX = h + marginLeft;
        var plotY = v - vShift;
        var maxX = width - marginLeft;
       // trace(i + ' : ' + Math.round(h) + ' : ' + maxX);
        lastH = plotX;
        lastV = plotY;
        if (h > maxX) {
            // trace('ask area beyond width: ' +  Math.round(lastH) +  ', ' + Math.round(lastV));
            lastV = plotY;
            ctx.lineTo(width, lastV);
            h = maxX; 
            break;
        }
        ctx.lineTo(plotX, plotY);
        depthDetectArrayAsks[i] = {'h': (h + marginLeft) / scaleFactor,'v': (v - vShift) / scaleFactor,'rate': asks[i][0],'quoteSum': totalAskVol,'baseSum': totalAskVolBase};
        //trace('draw ask ' + Math.round(h + marginLeft) + ', ' + (asks[i][0]));
    }
    // ctx.lineTo(width, lastV);
    // ctx.lineTo(width, startY);
    ctx.lineTo(width, v);
    ctx.strokeStyle = asksStrokeColor;
    ctx.stroke();
    ctx.lineTo(width, startY); 
    ctx.lineTo(startX, startY);
    ctx.fillStyle = asksAreaColor;
    ctx.fill();
    


    /// asks line, original
    if (false){
	    totalAskVol = asks[0][1];
	    ctx.beginPath();
	    ctx.moveTo(asks[0][0] * hScale + marginLeft, height - vShift);
	    ctx.lineTo(asks[0][0] * hScale + marginLeft, height - (totalAskVol * vScale) - vShift);
	    for (var i = 1; i < asks.length; i++) {
	        totalAskVol += asks[i][1];
	        h = asks[i][0] * hScale;
	        v = height - (totalAskVol * vScale);
	        if (h < 0) continue;
	        ctx.lineTo(h + marginLeft, v - vShift);
	    }
	    ctx.strokeStyle = asksStrokeColor;
	    ctx.stroke();
	}
	
    return {'bids':depthDetectArrayBids,'asks':depthDetectArrayAsks};
}

