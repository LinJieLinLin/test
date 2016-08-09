/**********************
@bingoo 日期插件 使用方法
<input type="text" plug-style="all time" />   // 配置 all / expired / real , 需要时间的 再加上 time
<script>
$(obj).date(
	{
		string : new Date()._format('yyyy.MM.dd hh:mm:ss'),
		timestamp : new Date().getTime()
	}
);
</script>
**********************/
(function ($){
	window.binDate = window.binDate || {};
	var
	o = binDate,
	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
	hasTouch = 'ontouchstart' in window && !isTouchPad,
	touchStart = hasTouch ? 'touchstart' : 'click';
	o.init = function (){
		o.dateStr = null;
		o.NDTtimer = null;
		o.nowInput = new Object(); //当前文本对象
		o.oWrap = document.createElement('div'); //插件视图
		o.oWrap.className = "binDate-wrap";
		o.oHead = document.createElement('div'); //头部
		o.oHead.className = "head-box jf-drag";
		o.oTimeWrap = document.createElement('div'); //时间
		o.oTimeWrap.className = "showtime-box jf-drag";
		o.oNowTime = document.createElement('div'); //时间
		o.oNowTime.className = "now-time";
		o.oTimeWrap.appendChild(o.oNowTime);
		o.oHour = document.createElement('select'); //时下拉菜单
		o.oHour.name = 'hMenu';
		o.oHour.className = 'hMenu';
		o.oMinute = document.createElement('select'); //分下拉菜单
		o.oMinute.name = 'mMenu';
		o.oMinute.className = 'mMenu';
		o.oCont = document.createElement('div'); //中部
		o.oCont.className = "cont-box jf-drag";
		o.oFooter = document.createElement('div'); //尾部
		o.oFooter.className = "footer-box jf-drag";
		o.oPrevMonth = document.createElement('a'); //上一月
		o.oPrevMonth.href = "javascript:void(0);";
		o.oPrevMonth.className = "prev-btn";
		o.oPrevMonth.title = "上一月";
		o.oNextMonth = document.createElement('a'); //下一月
		o.oNextMonth.href = "javascript:void(0);";
		o.oNextMonth.className = "next-btn";
		o.oNextMonth.title = "下一月";
		o.oYear = document.createElement('select'); //年下拉菜单
		o.oYear.name = 'yearMenu';
		o.oYear.className = 'yearMenu';
		o.oMonth = document.createElement('select'); //月下拉菜单
		o.oMonth.name = 'monthMenu';
		o.oMonth.className = 'monthMenu';
		o.oClear = document.createElement('div'); //清空按钮
		o.oClear.className = 'clear-btn';
		o.oClear.innerHTML = "清空";
		o.oToday = document.createElement('div'); //今天按钮
		o.oToday.className = 'today-btn';
		o.oToday.innerHTML = "今天";
		o.oDefine = document.createElement('div'); //确认/取消按钮
		o.oDefine.className = 'definite-btn';
		o.oDefine.innerHTML = "取消";
		o.nowDate = new Date(); //现在日期
		o.nowYear = o.nowDate.getFullYear(); //当年
		o.nowMonth = o.nowDate.getMonth()+1; //当月
		o.nowDay = o.nowDate.getDate(); //当日
		document.body.appendChild(o.oWrap);
		o.retTable();
		for(var i=0;i<42;i++){
			var oDay = document.createElement('a');
				oDay.className = 'day';
			o.oCont.appendChild(oDay);
		}
		$(o.oWrap).bind(touchStart,function (event){
			event.stopPropagation();
		});

		o.oYear.onchange = o.reSetDate;
		o.oMonth.onchange = o.reSetDate;

		$(o.oPrevMonth).bind(touchStart,function (){
			var prevM = parseInt(o.oMonth.value)-1;
			prevM < 1 ? prevM +=12 : null;
			prevM == 12 ? o.oYear.value = parseInt(o.oYear.value)-1 : null;
			o.oMonth.value = prevM;
			o.reSetDate();
		});
		$(o.oNextMonth).bind(touchStart,function (){
			var nextM = parseInt(o.oMonth.value)+1;
			nextM > 12 ? nextM -= 12 : null;
			nextM == 1 ? o.oYear.value = parseInt(o.oYear.value)+1 : null;
			o.oMonth.value = nextM;
			o.reSetDate();
		});
		$(o.oClear).bind(touchStart,function (){
			o.nowInput.value = '';
			o.oHour.value = '00';
			o.oMinute.value = '00';
			o.nowInput.Year = undefined;
			o.nowInput.Month = undefined;
			o.nowInput.Day = undefined;
			o.nowInput.Hours = undefined;
			o.nowInput.Minutes = undefined;
			o.dateStr = undefined;
			o.hide();
		});
		$(o.oToday).bind(touchStart,function (){
			o.reResult({aFlag:false,nowFlag:true});
			o.hide();
		});
		$(o.oDefine).bind(touchStart,function (){
			o.reResult({aFlag:false,definiteBtn:true});
			o.hide();
		});

		jf.drag(o.oWrap);

		o.loadFlag = true;
	};
	o.isLeapyear = function(y){ //求闰年
		return (y%4==0 && y%100!=0) || (y%400==0);
	};
	o.getDayLen = function(y,m){
		return (m==1 || m==3 || m==5 || m==7 || m==8 || m==10 || m==12) ? 31 :
			   (m==4 || m==6 || m==9 || m==11) ? 30 :
			   (m==2 && o.isLeapyear(y)) ? 29 : 28;
	};
	o.doWeekDate = function(i){
		switch(i){
			case 1:
				return "日";
				break;
			case 2:
				return "一";
				break;
			case 3:
				return "二";
				break;
			case 4:
				return "三";
				break;
			case 5:
				return "四";
				break;
			case 6:
				return "五";
				break;
			case 7:
				return "六";
				break;
		}
	};
	o.retTable = function(elem){
		o.oHead.appendChild(o.oPrevMonth);
		o.oHead.appendChild(o.oNextMonth);
		/**年下拉菜单*********************/
		for(var i=1901;i<(o.nowYear+100);i++){
			var option = document.createElement('option');
			option.value = i;
			option.innerHTML = i+'年';
			i == o.nowYear ? option.selected = "selected" : null;
			o.oYear.appendChild(option);
		}
		o.oHead.appendChild(o.oYear);
		/**月下拉菜单*********************/
		for(var i=1;i<13;i++){
			var option = document.createElement('option');
			option.value = i;
			option.innerHTML = i+'月';
			i == o.nowMonth ? option.selected = "selected" : null;
			o.oMonth.appendChild(option);
		}
		o.oHead.appendChild(o.oMonth);
		/**周一到周日*********************/
		o.weekBox = document.createElement('div');
		o.weekBox.className = 'week-box';
		for(var i=1;i<8;i++){
			var weekDate = document.createElement('h4');
			weekDate.innerHTML = o.doWeekDate(i);
			o.weekBox.appendChild(weekDate);
		}
		o.oHead.appendChild(o.weekBox);
		o.setShowTime = function(){
			var date=new Date(),s_dateTimeString=date.getHours()._lenWithZero(2)+":"+date.getMinutes()._lenWithZero(2)+":"+(date.getSeconds())._lenWithZero(2);
			o.oNowTime.innerHTML="<p>当前时间</p>"+s_dateTimeString+"";
			o.NDTtimer = setInterval(function (){
				var date=new Date(),s_dateTimeString=date.getHours()._lenWithZero(2)+":"+date.getMinutes()._lenWithZero(2)+":"+(date.getSeconds())._lenWithZero(2);
				o.oNowTime.innerHTML="<p>当前时间</p>"+s_dateTimeString+"";
			},1000);
			/**时下拉菜单*********************/
			for(var i=0;i<24;i++){
				var val = i+1;
				val == 24 ? val = 0 : null;
				val = val._lenWithZero(2);
				var option = document.createElement('option');
				option.value = val;
				option.innerHTML = val;
				val == 0 ? option.selected = "selected" : null;
				o.oHour.appendChild(option);
			}
			var hDiv = document.createElement('div');
			hDiv.style.padding="15px 0";
			hDiv.innerHTML = "时：";
			hDiv.appendChild(o.oHour);
			o.oTimeWrap.appendChild(hDiv);
			o.oHour.onchange = function (){
				o.reResult({aFlag:false,timeFlag:true});
			};
			/**分下拉菜单*********************/
			for(var i=0;i<60;i++){
				var val = i+1;
				val == 60 ? val = 0 : null;
				val = val._lenWithZero(2);
				var option = document.createElement('option');
				option.value = val;
				option.innerHTML = val;
				val == 0 ? option.selected = "selected" : null;
				o.oMinute.appendChild(option);
			}
			var mDiv = document.createElement('div');
			mDiv.innerHTML = "分：";
			mDiv.appendChild(o.oMinute);
			o.oTimeWrap.appendChild(mDiv);
			o.oMinute.onchange = function (){
				o.reResult({aFlag:false,timeFlag:true});
			};
		};
		o.setShowTime();
		o.oWrap.innerHTML = "";
		/**时间*********************/
		o.oWrap.appendChild(o.oTimeWrap);
		/**头部*********************/
		o.oWrap.appendChild(o.oHead);
		/**中部主体*********************/
		o.oWrap.appendChild(o.oCont);
		/**底部*********************/
		o.oFooter.appendChild(o.oClear);
		o.oFooter.appendChild(o.oToday);
		o.oFooter.appendChild(o.oDefine);
		o.oWrap.appendChild(o.oFooter);
	};
	o.isExpired = function(year,month,i){ //是否过期
		return (year < o.nowYear || year == o.nowYear && month < o.nowMonth || year == o.nowYear && month == o.nowMonth && i < o.nowDay-1);
	};
	o.isReal = function(year,month,i){ //是否真实
		return (year < o.nowYear || year == o.nowYear && month < o.nowMonth || year == o.nowYear && month == o.nowMonth && i <= o.nowDay);
	};
	o.reDay = function(year, month, day){
		o.oCont.innerHTML = "";
		year = year ? parseInt(year) : o.nowYear;
		month = month ? parseInt(month) : o.nowMonth;
		day = day ? parseInt(day) : undefined;
		o.oYear.value = year;
		o.oMonth.value = month;
		for(var i=0;i<42;i++){
			var oDay = document.createElement('a');
				oDay.className = 'day';
			o.oCont.appendChild(oDay);
		}
		var oDate = new Date();
		var dayLen = o.getDayLen(year,month);
		oDate.setFullYear(year);
		oDate.setMonth(month-1);
		oDate.setDate(1);
		for(var i=0;i<dayLen;i++)  //获取星期n 对应赋值排序
		{
			var curIndex = o.oCont.children[i+oDate.getDay()];
			curIndex.innerHTML = i+1;
			if(i == o.nowDay-1 && year == o.nowYear && month == o.nowMonth && !day || day && i == day-1 && year == o.nowInput.Year && month == o.nowInput.Month){
				curIndex.className = 'day day-able day-now';
			}else if(o.isExpired(year,month,i) && o.nowInput.expired || !o.isReal(year,month,(i+1)) && o.nowInput.real){
				curIndex.className = 'day';
			}else{
				curIndex.className = 'day day-able';
			}
			//$(curIndex).unbind(touchStart);
			if((o.isReal(year,month,(i+1)) && o.nowInput.real) || (!o.isExpired(year,month,i) && o.nowInput.expired) || o.nowInput.allDate){
				$(curIndex).bind(touchStart,function (){
					o.reResult({aFlag:true},this);
					!o.nowInput.time ? o.hide() : o.oDefine.innerHTML = "确定";
				});
			}
			//console.log((i+1),o.isReal(year,month,(i+1)));
		}
		if(o.nowInput.Hours && o.nowInput.time){
			o.oHour.value = o.nowInput.Hours;
			o.oMinute.value = o.nowInput.Minutes;
		}else{
			o.oHour.value = '00';
			o.oMinute.value = '00';
		}
	};
	o.reResult = function(resOpts,oA){
		if(resOpts.definiteBtn) return;
		var iYear = o.oYear.value;
		var iMonth = parseInt(o.oMonth.value)._lenWithZero(2);
		var iDay = parseInt(o.nowDay)._lenWithZero(2);
		var dateForm = o.nowInput.getAttribute('date-form') ? o.nowInput.getAttribute('date-form') : '-';
		if(resOpts.nowFlag){
			iYear = o.nowYear;
			iMonth = parseInt(o.nowMonth)._lenWithZero(2);
			o.oHour.value = '00';
			o.oMinute.value = '00';
		}
		if(resOpts.aFlag && oA) iDay = parseInt(oA.innerHTML)._lenWithZero(2);
		if(resOpts.timeFlag && o.nowInput.Year){
			iYear = o.nowInput.Year;
			iMonth = parseInt(o.nowInput.Month)._lenWithZero(2);
			iDay = o.nowInput.Day;
		}
		var dateparam = new Date();
		dateparam.setFullYear(iYear,iMonth-1,iDay);
		o.nowInput.Year = iYear;
		o.nowInput.Month = iMonth;
		o.nowInput.Day = iDay;
		o.nowInput.dateFoem = dateForm;
		o.dateStr = iYear +dateForm+ iMonth +dateForm+ iDay;
		if(o.nowInput.time){
			var iHours = o.oHour.value;
			var iMinutes = o.oMinute.value;
			dateparam.setHours(iHours,iMinutes);
			o.nowInput.Hours = iHours;
			o.nowInput.Minutes = iMinutes;
			o.dateStr = iYear +dateForm+ iMonth +dateForm+ iDay +" "+ iHours +":"+ iMinutes;
			if(resOpts.aFlag && oA){
				for(var i=0;i<o.oCont.children.length;i++){
					$(o.oCont.children[i]).removeClass('day-now');
				};
				$(oA).addClass('day-now');
			}
			o.oDefine.innerHTML = "确定"
		}
		o.nowInput.value = o.dateStr;
		o.nowInput.param.string = o.dateStr;
		o.nowInput.param.timestamp = dateparam.getTime();
	};
	o.reSetDate = function(){
		o.reDay(o.oYear.value, o.oMonth.value, o.nowInput.Day);
	};
	o.hide = function(){
		o.nowInput = new Object();
		$(o.oWrap).stop().slideUp('fast').animate({opacity:0},'fast');
		$(document).unbind(touchStart,o.hide);
	};
	o.showTime = function(elem){
		(elem.time) ? $(o.oWrap).addClass('DateTime') : $(o.oWrap).removeClass('DateTime');
		o.oDefine.innerHTML = "取消";
	};
	o.show = function(event){
		o.showTime(this);
		o.oWrap.style.left = $(this).offset().left +'px';
		o.oWrap.style.top = ($(this).offset().top + this.clientHeight) +'px';
		if(this !== o.nowInput){
			$(o.oWrap).hide().stop().animate({opacity:1},'fast').slideDown('fast',function (){
				if(o.nowInput.time)
				o.oTimeWrap.style.height = o.oWrap.clientHeight+"px";
			});
			$(document).bind(touchStart,o.hide);
		}
		o.nowInput = this;
		if(this.param.timestamp){
			var pDate = new Date(this.param.timestamp);
			this.Year = pDate.getFullYear();
			this.Month = pDate.getMonth()+1;
			this.Day = pDate.getDate();
			this.Hours = pDate.getHours()._lenWithZero(2);
			this.Minutes = pDate.getMinutes()._lenWithZero(2);
		}
		o.nowDate = new Date(); //现在日期
		o.nowYear = o.nowDate.getFullYear(), //当年
		o.nowMonth = o.nowDate.getMonth()+1, //当月
		o.nowDay = o.nowDate.getDate(); //当日
		o.reDay(o.nowInput.Year,o.nowInput.Month,o.nowInput.Day);
		event.stopPropagation();
	};

	$.fn.date = function (param){
		!binDate.loadFlag && binDate.init();
		this['0'].param = param || {};
		this['0'].expired = ($(this).attr("plug-style").match("expired")) ? true : false;
		this['0'].real = ($(this).attr("plug-style").match("real")) ? true : false;
		this['0'].time = ($(this).attr("plug-style").match("time")) ? true : false;
		this['0'].allDate = ($(this).attr("plug-style").match("all")) ? true : false;
		$(this).unbind(touchStart,o.show).bind(touchStart,o.show);
	};
})(jQuery);