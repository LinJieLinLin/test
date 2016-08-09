/********** @ author bingoo ***********/
(function (win,doc){
	var leavingPageFlag;

	function isIE(min,max){
		var navAgent=window.navigator.userAgent.toLowerCase(),flag;
		if(navAgent.indexOf("msie") != -1){
			var IE=navAgent.match(/msie\s([0-9]*)/);
			flag = (arguments.length == 0) ? IE[1] :
				(arguments.length == 1) ? (parseInt(IE[1]) == min) :
					(IE[1] >= min && IE[1] <= max) ? IE[1] : false;
		}
		return flag;
	}

	$(function (){
		if(!isIE()){
			win.addEventListener("beforeunload", function (){
				leavingPageFlag = true;
			}, false);
			win.addEventListener("mousedown", function (){
				leavingPageFlag = false;
			}, false);
		}
	});

	var
		isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
		hasTouch = 'ontouchstart' in window && !isTouchPad,
		touchStart = hasTouch ? 'touchstart' : 'mousedown',
		touchMove = hasTouch ? 'touchmove' : 'mousemove',
		touchEnd = hasTouch ? 'touchend' : 'mouseup',
		touchcancel = 'touchcancel';
	this._Tween={Linear:function(t,b,c,d){return c*t/d+b},Quad:{easeIn:function(t,b,c,d){return c*(t/=d)*t+b},easeOut:function(t,b,c,d){return -c*(t/=d)*(t-2)+b},easeInOut:function(t,b,c,d){if((t/=d/2)<1){return c/2*t*t+b}return -c/2*((--t)*(t-2)-1)+b}},Cubic:{easeIn:function(t,b,c,d){return c*(t/=d)*t*t+b},easeOut:function(t,b,c,d){return c*((t=t/d-1)*t*t+1)+b},easeInOut:function(t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t+b}return c/2*((t-=2)*t*t+2)+b}},Quart:{easeIn:function(t,b,c,d){return c*(t/=d)*t*t*t+b},easeOut:function(t,b,c,d){return -c*((t=t/d-1)*t*t*t-1)+b},easeInOut:function(t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t*t+b}return -c/2*((t-=2)*t*t*t-2)+b}},Quint:{easeIn:function(t,b,c,d){return c*(t/=d)*t*t*t*t+b},easeOut:function(t,b,c,d){return c*((t=t/d-1)*t*t*t*t+1)+b},easeInOut:function(t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t*t*t+b}return c/2*((t-=2)*t*t*t*t+2)+b}},Sine:{easeIn:function(t,b,c,d){return -c*Math.cos(t/d*(Math.PI/2))+c+b},easeOut:function(t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b},easeInOut:function(t,b,c,d){return -c/2*(Math.cos(Math.PI*t/d)-1)+b}},Expo:{easeIn:function(t,b,c,d){return(t==0)?b:c*Math.pow(2,10*(t/d-1))+b},easeOut:function(t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b},easeInOut:function(t,b,c,d){if(t==0){return b}if(t==d){return b+c}if((t/=d/2)<1){return c/2*Math.pow(2,10*(t-1))+b}return c/2*(-Math.pow(2,-10*--t)+2)+b}},Circ:{easeIn:function(t,b,c,d){return -c*(Math.sqrt(1-(t/=d)*t)-1)+b},easeOut:function(t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b},easeInOut:function(t,b,c,d){if((t/=d/2)<1){return -c/2*(Math.sqrt(1-t*t)-1)+b}return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b}},Elastic:{easeIn:function(t,b,c,d,a,p){if(t==0){return b}if((t/=d)==1){return b+c}if(!p){p=d*0.3}if(!a||a<Math.abs(c)){a=c;var s=p/4}else{var s=p/(2*Math.PI)*Math.asin(c/a)}return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b},easeOut:function(t,b,c,d,a,p){if(t==0){return b}if((t/=d)==1){return b+c}if(!p){p=d*0.3}if(!a||a<Math.abs(c)){a=c;var s=p/4}else{var s=p/(2*Math.PI)*Math.asin(c/a)}return(a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b)},easeInOut:function(t,b,c,d,a,p){if(t==0){return b}if((t/=d/2)==2){return b+c}if(!p){p=d*(0.3*1.5)}if(!a||a<Math.abs(c)){a=c;var s=p/4}else{var s=p/(2*Math.PI)*Math.asin(c/a)}if(t<1){return -0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b}return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*0.5+c+b}},Back:{easeIn:function(t,b,c,d,s){if(s==undefined){s=1.70158}return c*(t/=d)*t*((s+1)*t-s)+b},easeOut:function(t,b,c,d,s){if(s==undefined){s=1.70158}return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b},easeInOut:function(t,b,c,d,s){if(s==undefined){s=1.70158}if((t/=d/2)<1){return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b}return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b}},Bounce:{easeIn:function(t,b,c,d){return c-_Tween.Bounce.easeOut(d-t,0,c,d)+b},easeOut:function(t,b,c,d){if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+b}else{if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+0.75)+b}else{if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+0.9375)+b}else{return c*(7.5625*(t-=(2.625/2.75))*t+0.984375)+b}}}},easeInOut:function(t,b,c,d){if(t<d/2){return _Tween.Bounce.easeIn(t*2,0,c,d)*0.5+b}else{return _Tween.Bounce.easeOut(t*2-d,0,c,d)*0.5+c*0.5+b}}}};
	this.jf = this.jf || {
			//注意（IE Edge 模式检测不出来）
			isIE : isIE,
			//浏览器区分 注意（IE Edge 模式检测不出来）
			browseCheck : function (){
				var oBrowse = {}, Sys = {}, ua = navigator.userAgent.toLowerCase(), s;
				(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
					(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
						(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
							(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
								(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
				for(var k in Sys){
					oBrowse['edition'] = k+':'+Sys[k];
					oBrowse['name'] = k;
				}
				return oBrowse;
			},
			//检测操作系统 var OS = detectOS();jf.confirm('PC端：'+ OS.pc + '<br>Mobile端：'+ OS.mobile + "<br>您的操作系统是：" + OS.name);
			detectOS : function () {
				var D = {};
				D.ua = navigator.userAgent;
				D.uaTLC = D.ua.toLowerCase();
				D.platform = navigator.platform;
				D.isLinux = (String(D.platform).indexOf("Linux") > -1);
				D.isWin = D.platform === ("Win32" || "Windows");
				D.isMac = D.platform === ("Mac68K" || "MacPPC" || "Macintosh" || "MacIntel");
				D.isUnix = (D.platform === "X11") && !D.isWin && !D.isMac;
				D.isSymbian = D.platform === ('SymbianOS');
				D.bIsCE = D.uaTLC.match(/windows ce/i);
				D.bIsWM = D.uaTLC.match(/windows mobile/i);
				D.bIsAndroid = D.uaTLC.match(/android/i);
				D.bIsIpad = D.uaTLC.match(/ipad/i);
				D.bIsIphoneOs = D.uaTLC.match(/iphone os/i);
				D.bIsMidp = D.uaTLC.match(/midp/i);
				D.bIsUc7 = D.uaTLC.match(/rv:1.2.3.4/i);
				D.bIsUc = D.uaTLC.match(/ucweb/i);
				D.mobile = (D.bIsIpad || D.bIsIphoneOs || D.bIsMidp || D.bIsUc7 || D.bIsUc || D.bIsAndroid || D.bIsCE || D.bIsWM || D.isSymbian) ? true : false;
				D.pc = D.mobile ? false : true;
				D.name = (D.bIsIpad) ? "iPad" : (D.bIsIphoneOs) ? "iPhone" : (D.bIsMidp) ? "midp" : (D.bIsUc7) ? "Uc7" : (D.bIsUc) ? "Ucweb" : (D.isMac) ? "Mac" : (D.isLinux) ? ((D.bIsAndroid) ? "Android" : "Linux") : (D.isSymbian) ? "SymbianOS" : (D.bIsCE || D.bIsWM) ? "wm" : 'other';
				if (D.isWin) {
					D.isWin2K = D.ua.indexOf("Windows NT 5.0") > -1 || D.ua.indexOf("Windows 2000") > -1;
					D.isWinXP = D.ua.indexOf("Windows NT 5.1") > -1 || D.ua.indexOf("Windows XP") > -1;
					D.isWin2003 = D.ua.indexOf("Windows NT 5.2") > -1 || D.ua.indexOf("Windows 2003") > -1;
					D.isWinVista = D.ua.indexOf("Windows NT 6.0") > -1 || D.ua.indexOf("Windows Vista") > -1;
					D.isWin7 = D.ua.indexOf("Windows NT 6.1") > -1 || D.ua.indexOf("Windows 7") > -1;
					D.isWin8 = D.ua.indexOf("Windows NT 6.2") > -1 || D.ua.indexOf("Windows 8") > -1;
					D.name = (D.isWin2K) ? "Win2000" : (D.isWinXP) ? "WinXP" : (D.isWin2003) ? "Win2003" : (D.isWinVista) ? "WinVista" : (D.isWin7) ? "Win7" : (D.isWin8) ? "Win8" : 'other';
				}
				return D;
			},
			winScaleData : function(){  //@ window scale data
				var D = {},OS = this.detectOS();
				D.sT = document.documentElement.scrollTop || document.body.scrollTop;
				D.sL = document.documentElement.scrollLeft || document.body.scrollLeft;
				D.sH = document.documentElement.scrollHeight||document.body.scrollHeight;
				D.cH = document.documentElement.clientHeight||document.body.clientHeight;
				D.sW = document.documentElement.scrollWidth||document.body.scrollWidth;
				D.cW = document.documentElement.clientWidth||document.body.clientWidth;
				D.minW = (OS.mobile) ? parseInt(jf.getStyle(document.body,'minWidth')) : D.cW;
				D.minH = (OS.mobile) ? Math.ceil(D.cH + (-(D.cW-D.minW))/D.cW*D.cH) : D.cH;
				D.scale = D.cW / D.minW;
				return D;
			},
			css3Check : function () { //检测支持 CSS3
				var div = document.createElement("div"),
					vendors = new String("webkitTransition mozAnimation oAnimation msAnimation animation").split(" ");
				for(var i=0;i<vendors.length;i++){if(vendors[i] in div.style){return true;break;}}
				return false;
			},
			css3CallBack : function (e,type,callback){ //css3运动回调事件
				function handler(){
					callback();
					for(var j=0;j<type.length;j++){
						e.removeEventListener(type[j] , handler, false);
					}
				};
				for(var i=0;i<type.length;i++){
					e.addEventListener(type[i], handler, false);
				}
			},
			css3AnimatedEnd : function (e,callback){ //css3 动画结束时事件
				this.css3CallBack(e,['webkitAnimationEnd','mozAnimationEnd','MSAnimationEnd','oanimationend','animationend'],callback);
			},
			css3TransitionEnd : function (e,callback){ //css3 过度结束时事件
				this.css3CallBack(e,['webkitTransitionEnd','mozTransitionEnd','MSTransitionEnd','otransitionend','transitionend'],callback);
			},
			stopDefault : function (e) { //阻止浏览器的默认行为
				(e && e.preventDefault) ? e.preventDefault() : window.event.returnValue = false;
				return false;
			},
			stopBubble : function (e) { //停止事件冒泡
				(e && e.stopPropagation) ? e.stopPropagation() : window.event.cancelBubble = true;
				return false;
			},
			//DOM元素对位 jf.domElemBit(object,{mode:"Back",effect:"easeInOut",negNum:80},1500);
			domElemBit : function (elem,opts,time){
				clearInterval(elem.domElemBitTimer);
				var iScrollTop = (jf.pageY(elem)-("negNum" in opts ? opts.negNum : 0)),t = 0,d = time,b = document.documentElement.scrollTop || document.body.scrollTop,c = -(b-iScrollTop),startTime = new Date(),nowTime = new Date(),domElemBitTimer = null;
				//document.title=(jf.pageY(elem)+", "+ iScrollTop);
				function doMove(){
					nowTime = new Date();
					t = nowTime - startTime;
					t >= d ? t = d : null;
					document.documentElement.scrollTop = document.body.scrollTop = Math.ceil(_Tween[opts.mode][opts.effect](t,b,c,d));
					if(t >= d){
						clearInterval(elem.domElemBitTimer);
						//alert("DOM对位停止");
					}
				};
				elem.domElemBitTimer = setInterval(doMove,1);
			},
			jsonExtend : function(des, src, override){ //合并json  var json = jsonExtend({},[json1,json2],true);
				if(src instanceof Array){
					for(var i = 0, len = src.length; i < len; i++)
						this.jsonExtend(des, src[i], override);
				}
				for(var i in src){
					if(override || !(i in des))
						des[i] = src[i];
				}
				return des;
			},
			getQueryString : function(name){ //获取链接地址？后边带的参数
				var reg = new RegExp(name + "=([^&]*)");
				var r = window.location.href.match(reg);
				if (r != null)
					return decodeURI(r[1]);
				return null;
			},
			getStyle : function (elem,attr){ //兼容获取样式值
				return elem.currentStyle ? elem.currentStyle[attr] : getComputedStyle(elem, false)[attr];
			},
			/* @ animate 运动框架（缓动类） --------------
			 *  jf.animate(test,{mode:'Back',effect:'easeOut'},{left:500,top:100},'slow',function (){});
			 *  mode : Quad || Cubic || Quart || Quint || Sine || Expo || Circ || Elastic || Back || Bounce
			 *  effect : easeIn(从0开始加速的缓动) || easeOut(减速到0的缓动) || easeInOut(前半段从0开始加速，后半段减速到0的缓动) */
			animate : function(elem,opts,json,time,callback){
				clearInterval(elem.timer);
				var config = {};
				config.startTime = new Date();
				config.nowTime = new Date();
				config.mode = opts.mode; //模式
				config.effect = opts.effect; //效果
				config.t = 0; //当前时间
				config.d = time=='fast' ? 300 : time=='slow' ? 800 : time=='normal' ? 500 : time || 500; //持续时间，分1毫秒帧执行
				config.b = []; //初始值
				config.c = []; //变化值
				config.tagVal = []; //目标值
				config.attr = [];
				for(key in json){
					var iCur = key == 'opacity' ? parseFloat(jf.getStyle(elem,key)) * 100 : parseFloat(jf.getStyle(elem,key));
					config.b.push(iCur);
					config.c.push(-(iCur - json[key]));
					config.tagVal.push(json[key]);
					config.attr.push(key);
				}
				config.offLen = config.attr.length;
				var _setStyle = function (i,end){
						var countVal = end ? config.tagVal[i] : _count(i);
						switch(config.attr[i]){
							case 'opacity':
								elem.style[config.attr[i]] = countVal / 100;
								elem.style.filter = 'alpha(opacity='+ countVal +')';
								break;
							default:
								elem.style[config.attr[i]] = countVal + "px";
						}
					},
					_count = function (i){
						return Math.ceil(_Tween[config.mode][config.effect](config.t,config.b[i],config.c[i],config.d));
					},
					_animate = function (){
						config.nowTime = new Date();
						config.t = config.nowTime - config.startTime;
						config.t >= config.d ? config.t = config.d : null;
						for(var i=0;i<config.offLen;i++){
							_setStyle(i);
						}
						if(config.t >= config.d){
							clearInterval(elem.timer);
							for(var j=0;j<config.offLen;j++){
								_setStyle(j,'end');
							}
							if(config.t == config.d){
								callback && callback.call(elem);
							}
						}
					};
				elem.timer = setInterval(_animate, 1);
			},
			/* @ animate 运动框架 end ------------------------*/
			/* @ cookie 应用 ------------------------------*/
			setCookie : function(name, value, iDay){
				var oDate=new Date();
				oDate.setDate(oDate.getDate()+iDay);
				document.cookie=name+'='+value+';expires='+oDate;
			},
			getCookie : function(name){
				var arr=document.cookie.split('; ');
				for(var i=0;i<arr.length;i++){
					var arr2=arr[i].split('=');
					if(arr2[0]==name)
						return arr2[1];
				}
				return '';
			},
			removeCookie : function(name){
				this.setCookie(name, '', -1);
			},
			/* @ cookie 应用 end -----------------------*/
			/*******************************************
			 *  @ 弹出窗运动 函数
			 ********************************************/
			window : function (){
				(function ($){
					$.fn.window = function (opts,callback){   //opts == {mask:boolean,maskOpts:{css:{},animate{tween:{}},css:{},speed:{}},range:boolean}
						opts = opts || {};
						var o = $(this)['0'];
						o.comein = function (){
							if($(o).is(':visible')){ return; }
							if(opts.mask){
								jf.mask(o,(opts.maskOpts || {}));
								// $(o.oMask).addClass('ie-block-bg');
							}
							jf.drag(o,{range:opts.range});
							o.keydown = function (event){
								if((event || window.event).keyCode == 13){ o.off(callback); }
							};
							//$(document).bind('keydown',o.keydown);
							$(o).show().css({
								zIndex : parseInt($(o.oMask).css('z-index'))+1,
								left:'50%',top:'50%',
								marginTop:-($(o).height()/2),
								marginLeft:-($(o).width()/2)
							});
							jf.css3Animate(o,"scaleIn animated");
							$(o).find('.define').each(function() {
								function winDefine(){ o.off(callback); };
								$(this).unbind('click',winDefine).bind('click',winDefine);
							});
							$(o).find('.close').each(function() {
								function winClose(){ o.off(); };
								$(this).unbind('click',winClose).bind('click',winClose);
							});
						};
						o.off = function (callback){
							// $(document).unbind('keydown',o.keydown);
							jf.css3Animate(o,"scaleOut animated",function (){
								if(o.oMask){
									$(o.oMask).remove();
									delete o.oMask;
								}
								$(o).hide().css({marginTop:'',marginLeft:''});
								callback && callback();
							});
						};
						o.comein();
					};
				})(jQuery);
			}(),
			confirm : function (str,opts,defineCallback,cancelCallback){  //opts == {mask:boolean,maskOpts:{css:{},animate{tween:{}},css:{},speed:{}},confirmTitle:string}
				this.tipsList('confirm',str,opts,defineCallback,cancelCallback);
			},
			alert : function(str,opts){  //opts == {mask:boolean,maskOpts:{css:{},animate{tween:{}},css:{},speed:{}}}
				this.tipsList('alert',str,opts);
			},
			tipsList : function (attr,str,opts,defineCallback,cancelCallback){
				if(leavingPageFlag){
					return;
				}
				var $list = jf.tips.$events[attr];
				var id = $list.guid++;
				$list[id] = {};
				$list[id]["str"] = str;
				$list[id]["opts"] = opts || {};
				$list[id]["defineCallback"] = defineCallback;
				$list[id]["cancelCallback"] = cancelCallback;
				jf.tips.handler(attr,id,defineCallback,cancelCallback);
			},
			tips : this.tips || {
				$events : {  //用来创建唯一堆栈 , guid 用来创建唯一的ID的计数器
					alert : { guid : 0, passFlag : true },
					confirm : { guid : 0, passFlag : true }
				},
				handler : function(attr,guid,defineCallback,cancelCallback){
					var $list = jf.tips.$events[attr];
					jf.tips.forEvent(
						attr,
						$list[guid].str,
						$list[guid].opts,
						function (){
							delete $list[guid];
							$list.passFlag = true;
							var id = guid+1;
							if(id in $list){
								jf.tips.handler(attr,id,$list[id].defineCallback,$list[id].cancelCallback);
							}
						},
						function (){ //调试用的
							// console.log(attr, guid, $list);
						},
						defineCallback,
						cancelCallback
					);
				},
				forEvent : function (attr,str,opts,callback,callwith,defineCallback,cancelCallback){
					if(!jf.tips.$events[attr].passFlag){
						return;
					}
					callwith && callwith();
					jf.tips.$events[attr].passFlag = false;
					var
						o = document.createElement('div'),
						html = '<div class="jf-tips-c">'+str+'</div><div class="jf-tips-ic"></div><div class="jf-tips-ic2"></div><div class="jf-tips-ic3"></div>';
					if(defineCallback){
						html = '<div class="jf-drag">'+
							'<div class="jf-tips-h"><b>'+ (opts.confirmTitle || '') +'</b><a href="javascript:;" class="jf-tips-cancel">×</a></div>'+
							'<div class="jf-tips-c">'+str+'</div>'+
							'<div class="jf-tips-f">';
						
						html += '<a href="'+ (opts.open ? opts.open+'" target="_blank"' : 'javascript:;"') +' class="jf-tips-define">' + (opts.btnTextConfirm || '确定') + '</a>';

						if (!opts.singleBtn) {
							html += '<a href="javascript:;" class="jf-tips-cancel b-cancel">' + (opts.btnTextCancel || '取消') + '</a>';
						}

						html += '</div></div>';
					}
					$(o).addClass(defineCallback ? 'jf-tips' : 'jf-tips-t').html(html);
					$('body').append(o);

					var t = (defineCallback ? '50%' : -($(o).outerHeight(true)+38));
					var mt = -(defineCallback ? $(o).outerHeight(true)/2 : 0);
					$(o).css({left:0});
					$(o).show().css({top:t,marginTop:mt,marginLeft:(-($(o).outerWidth(true)/2)),left:'50%'});

					function comein(){
						opts.mask && jf.mask(o,(opts.maskOpts || {}));

						if(defineCallback){
							jf.drag(o);
							$(o.oMask).addClass('ie-block-bg');
							o.keydown = function (event){
								if((event || window.event).keyCode == 13){
									scaleOut(defineCallback);
								}
							};
							$(document).bind('keydown',o.keydown);
							jf.css3Animate(o,"scaleIn animated");
							$(o).find('.jf-tips-define').each(function() {
								$(this).bind('click',function (){ scaleOut(defineCallback); });
							});
							$(o).find('.jf-tips-cancel').each(function() {
								$(this).bind('click',function (){ scaleOut(cancelCallback); });
							});
						}else{
							jf.animate(o, {mode:'Back', effect:'easeOut'}, {top:-120},'normal',function (){ off(); });
							//jf.animate(o, {mode:'Back', effect:'easeOut'}, {top:-120},'normal');
						}
					};

					function off(){
						jf.tips.offTimer = setTimeout(function (){
							if(o.oMask){
								jf.animate(o.oMask, {mode:'Quint', effect:'easeIn'}, {opacity:0},'normal');
							}
							jf.animate(o, {mode:'Back', effect:'easeIn'}, {top:t},'normal', function (){
								o.oMask && $(o.oMask).remove();
								$(o).empty().remove();
								callback && callback();
							});
						},1500);
					};

					function scaleOut(thisCallback){
						$(document).unbind('keydown',o.keydown);
						jf.css3Animate(o,"scaleOut animated",function (){
							o.oMask && $(o.oMask).remove();
							$(o).empty().remove();
							thisCallback && thisCallback();
							callback && callback();
						});
					};

					comein();
				}
			},
			/* @ bingoo 拖拽 --------------------------*/
			drag : function (e,opts){ // opts == {range:{minX:number,maxX:number,minY:number,maxY:number}}
				opts = opts || {};
				var
					x,y,l,t,
					move = function (event){
						l = event.clientX - x;
						t = event.clientY - y;
						if(opts.range){
							var ws = jf.winScaleData();
							var minX = "minX" in opts ? opts.minX : -parseInt($(e).css('margin-left'));
							var maxX = "maxX" in opts ? opts.maxX : ws.minW - $(e).outerWidth(true);
							var minY = "minY" in opts ? opts.minY : -parseInt($(e).css('margin-top'));
							var maxY = "maxY" in opts ? opts.maxY : ws.cH - $(e).outerHeight(true);
							l = new Number(l)._range(minX,maxX);
							t = new Number(t)._range(minY,maxY);
						}

						$(e).css({left:l, top:t, WebkitUserSelect:'none',UserSelect:'none'});
						document.body.onselectstart = function (){return false};
					},
					end = function (event){
						document.body.onselectstart = function (){return true};
						$(e).css({webkitUserSelect:'',userSelect:''});
						$(document).unbind(touchMove,move);
						$(document).unbind(touchEnd,end);
						hasTouch && $(document).unbind(touchcancel,end);
					},
					start = function (event){
						x = event.clientX - $(e).position().left;
						y = event.clientY - $(e).position().top;
						$(document).bind(touchMove,move);
						$(document).bind(touchEnd,end);
						hasTouch && $(document).bind(touchcancel,end);
						event.stopPropagation();
					};
				$(e).find('.jf-drag').unbind(touchStart,start).bind(touchStart,start);
				$(e).find('img,a,input,select,textarea,button,.stopPropagation').each(function() {
					function stopPropagation(event){ event.stopPropagation(); };
					$(this).unbind(touchStart,stopPropagation).bind(touchStart,stopPropagation);
				});
			},
			css3Animate : function (e,css3Class,callback){
				if(jf.css3Check()){
					$(e).addClass(css3Class);
					jf.css3AnimatedEnd(e,function (){
						$(e).removeClass(css3Class);
						callback && callback.call(e);
					});
				}else{
					callback && callback.call(e);
				}
			},
			/* @ bingoo 拖拽 end --------------------------*/
			mask : function (obj,opts){ //opts == {css:{},animate{tween:{}},css:{},speed:{}}
				obj.oMask = doc.createElement('div');
				obj.parentNode.insertBefore(obj.oMask,obj);
				obj.oMask.className = "jf-mask";
				opts = opts || {};
				opts.animate = opts.animate || {};
				if(opts.css){
					for(var key in opts.css){
						obj.oMask.style[key] = opts.css[key];
					}
				}
				if(opts.animate) {
					this.animate(
						obj.oMask,
						(opts.animate.tween || {mode:'Quint', effect:'easeOut'}),
						(opts.animate.css || {opacity:30}),
						(opts.animate.speed || 'fast')
					);
				}
			},
			/* @ loading --------------------------*/
			loadingIn : function (opts,callback){ //opts = {text:'',innerHTML:'',css:'',maskOpts:''}
				this.laddingDB = this.laddingDB || {};
				var d = this.laddingDB;
				if(d.o) return;
				d.o = doc.createElement('div');
				d.o.className = 'jf-full-screen-loading';
				doc.body.appendChild(d.o);
				opts = opts || {};
				if(opts.text){
					opts.css = {width:'86px',height:'70px',backgroundPosition:'center 10px'};
					opts.innerHTML = '<div style="text-align:center;color:#efefef;padding-top:46px;line-height:14px;font-size:14px;">加载中...</div>';
				}
				this.mask(d.o,(opts.maskOpts || {css:{zIndex:99998}}));
				if(opts.css){ $(d.o).css(opts.css); }
				if(opts.innerHTML){ $(d.o).html(opts.innerHTML); }
				this.css3Animate(d.o,"scaleIn animated",function (){ callback && callback(); });
			},
			loadingOut : function (callback){
				this.laddingDB = this.laddingDB || {};
				var d = this.laddingDB;
				if(!d.o) return;
				var removeNum = 0;
				this.animate(d.o.oMask, {mode:'Quint', effect:'easeIn'}, {opacity:0},318,function (){ $(d.o.oMask).remove(); removeNum++; if(removeNum >=2){ delete d.o; callback && callback(); } });
				this.css3Animate(d.o,"scaleOut animated",function (){ $(d.o).remove(); removeNum++; if(removeNum >=2){ delete d.o; callback && callback(); } });
			}
			/* @ loading end --------------------------*/
		};

	$('head').append(
		'<style>'+
		'.animated{-webkit-animation-duration:.3s;animation-duration:.3s;-webkit-animation-fill-mode:both;animation-fill-mode:both;}'+
		'.animated.infinite {-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;}'+
		'@-webkit-keyframes scaleIn{0%{opacity:0;-webkit-transform:scale(.3);}100%{opacity:1;-webkit-transform:scale(1);}}'+
		'@keyframes scaleIn{0%{opacity:0;transform:scale(.3);}100%{opacity:1;transform:scale(1);}}'+
		'.scaleIn{-webkit-animation-name:scaleIn;animation-name:scaleIn;}'+
		'@-webkit-keyframes scaleOut {0%{opacity:1;-webkit-transform:scale(1);}100%{opacity:0;-webkit-transform:scale(.3);}}'+
		'@keyframes scaleOut {0%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(.3);}}'+
		'.scaleOut{-webkit-animation-name:scaleOut;animation-name:scaleOut;}'+
		'.jf-mask { width:100%;height:100%;left:0;top:0;background:black;opacity:0;filter:alpha(opacity=0);position:fixed;z-index:98888;}'+
		'.ie-block-bg {}'+
		'.jf-tips {left: 50%;top:0;margin:0;min-width:380px;max-width:98%;height:auto;line-height:21px;text-align:center;box-shadow:1px 1px 0 white,-1px -1px 0 white,0 2px 15px rgba(35,35,35,.5);border-radius:3px;background:#fff;border: none;padding: 5px;color:#606060;font-size:14px;font-weight: normal;position:fixed;z-index:99888;}'+
		'.jf-tips-t { position:fixed;z-index:99888;left: 50%;top:0;margin:0;min-width:280px;max-width:98%;height:auto;line-height:21px;text-align: center;box-shadow:1px 1px 0 white,-1px -1px 0 white,0 2px 15px rgba(35,35,35,.5);border-radius:0 0 10px 10px;background:#fff;border:5px solid #eddcbf;border-top:0;color:#606060;font-size:14px;font-weight: normal;display:none;}'+
		'.jf-tips-c {padding:35px 25px;line-height:21px;cursor:default;border:none !important;font-size: 16px}'+
		'.jf-tips .jf-tips-c {}'+
		'.jf-tips-t .jf-tips-c { padding:135px 60px 15px;}'+
		'.jf-tips-f { padding:15px 0;background-color: #fff;border-top:none;box-shadow:0 1px 0 #fff inset;}'+
		'.jf-tips-f a { margin:0 15px;border:none;display:inline-block;color:#fff;line-height:100%;padding:7px 27px;border-radius:3px;background:#66b6ff;}'+
		'.jf-tips-f a:hover { text-decoration: none;background:#4f8fc9;}'+
		'.jf-tips-f a.b-cancel {background:#f39800;}'+
		'.jf-tips-f a.b-cancel:hover {background:#c47c00;}'+
		'.jf-tips-h {text-indent:10px;text-align:left;line-height:35px;height:35px;padding-bottom:3px;background-color: #fff;border:none;box-shadow:0 -1px 0 #fff inset;color:#333;}'+
		'.jf-tips-h .jf-tips-cancel {text-indent:0;position:absolute;right:5px;top:5px;line-height:100%;padding:3px 5px;display:block;border-radius:3px;color:#b1b1b1;font:22px/1 "lucida Grande",Verdana,Arial;}'+
		'.jf-tips-h .jf-tips-cancel:hover {text-decoration: none}'+
		'.jf-drag { cursor: move;}'+
		'.jf-tips-ic{width:32px;height:32px;position:absolute;left:0;bottom:0;background:url(../rcp-common/imgs/icon/icon-msg.png) no-repeat;}'+
		'.jf-tips-ic2,.jf-tips-ic3{width:8px;height:8px;border-radius:50%;position:absolute;left:5px;top:122px;background:#b3bc9a;}'+
		'.jf-tips-ic3{left:auto;right:5px;}'+
		'.jf-full-screen-loading {width:68px;height:68px;margin:-34px 0 0 -34px;left:50%;top:50%;background:#101010 url(img/loading.gif) no-repeat center center;border-radius:8px;position:fixed;z-index:99999;}'+
		'</style>'
	);

})(window,document);

/****************************************
 @ 系统中JS的扩展函数
 *****************************************/

// 清除两边的空格
String.prototype._trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g, '');
};
// 合并多个空白为一个空白
String.prototype._resetBlank = function(){
	var regEx = /\s+/g;
	return this.replace(regEx, ' ');
};
// 保留数字
String.prototype._getNum = function(){
	var regEx = /[^\d]/g;
	return this.replace(regEx, '');
};
// 保留中文
String.prototype._getCN = function(){
	var regEx = /[^\u4e00-\u9fa5\uf900-\ufa2d]/g;
	return this.replace(regEx, '');
};
// 得到字节长度
String.prototype._getLen = function(){
	var regEx = /^[\u4e00-\u9fa5\uf900-\ufa2d]+$/;
	var oMatches = this.match(/[\x00-\xff]/g);
	var len = this.length * 2;
	if(oMatches){
		len -= oMatches.length;
	}
	return len;
};
// 限定字节长度
String.prototype._limitLen = function(len,suffix){
	if(this._getLen() < len){
		return this.toString();
	}
	var string = "";
	for(var i=0;i<this.length;i++){
		string+=this.charAt(i);
		if(string._getLen() >= len){
			break;
		}
	}
	return (string+suffix).toString();
};
// 获取文件全名
String.prototype._getFileName = function(){
	var regEx = /^.*\/([^\/\?]*).*$/;
	return this.replace(regEx, '$1');
};
// 获取文件扩展名
String.prototype._getExtensionName = function(){
	var regEx = /^.*\/[^\/]*(\.[^\.\?]*).*$/;
	return this.replace(regEx, '$1');
};
//限制最小值&&最大值
Number.prototype._range = function(iMin,iMax){
	if(parseFloat(this)>iMax){return iMax;}
	else if(parseFloat(this)<iMin){return iMin;}
	else{return parseFloat(this);}
};
// 数字补零
Number.prototype._lenWithZero = function(oCount) {
	var strText = this.toString();
	while (strText.length < oCount) {
		strText = '0' + strText;
	}
	return strText;
};
// Unicode还原
Number.prototype._chrW = function(){
	return String.fromCharCode(this);
};
//日期格式  (Number).('yyyy-MM-dd　hh:mm:ss:S q')
Number.prototype._dateFormat = function(format) {
	var date = new Date(parseInt(this.toString()));
	var o = {
		"M+" : date.getMonth() + 1, //月
		"d+" : date.getDate(), //日
		"h+" : date.getHours(), //小时
		"m+" : date.getMinutes(), //分
		"s+" : date.getSeconds(), //秒
		"q+" : Math.floor((date.getMonth() + 3) / 3), //季
		"S" : date.getMilliseconds() //毫秒
	};

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
//扩展Date格式化 new Date()._format("yyyy-MM-dd hh:mm:ss:S q");
Date.prototype._format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, //月
		"d+" : this.getDate(), //日
		"h+" : this.getHours(), //小时
		"m+" : this.getMinutes(), //分
		"s+" : this.getSeconds(), //秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), //季
		"S" : this.getMilliseconds() //毫秒
	};

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
// 获得数组中,值的索引
Array.prototype._indexOf = function(val){
	var index;
	for (var i=0;i<this.length;i++){
		if(val == this[i])
			index = i;
	}
	return index;
};

//获取url参数
function QueryStringByName(name){

	var result=window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

	if(result==null || result.length<0){

		return "";

	}

	return decodeURIComponent(result[1]);
}

function GetCookie(sName)
{
	var aCookie = document.cookie.split("; ");
	for (var i=0; i < aCookie.length; i++)
	{
		var aCrumb = aCookie[i].split("=");
		if (sName == aCrumb[0]){
			if (!aCrumb[1]) {
				return QueryStringByName("token");
			}
			return unescape(aCrumb[1] || '');
		}
	}
	return null;
}

function GetToken() {
	try {
		return UINFO.token;
	} catch (e) {
		var token = QueryStringByName("token");
		if (!token) {
			token = GetCookie("token");
		}
		return token;
	}
}
