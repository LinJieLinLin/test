/**
 * Created by FENGSB on 2015/8/27.
 */

module.factory('lazy', ['$timeout', function($timeout){
	var factory = {
        /**
         * 监听事件
         * @param  {Object} node       DOM节点
         * @param  {Object} callback   事件的回调函数
         */
        listener: function (args){
            var lock;
            var timer;
            var win = $(window);
            function handler(){
                var e = $(args.node);
                if(!e.length || lock || e.is(':hidden')){
                    return;
                }
                var wt = win.scrollTop();
                var wb = wt + win.height();
                var et = e.offset().top;
                var eb = et + e.height();
                var tf = et >= wt && et <= wb;
                var bf = et <= wt && eb >= wt;
                if(tf || bf){
                    lock = !lock;
                    if(typeof args.callback === 'function'){
                        args.callback();
                        win.unbind('scroll',callback);
                        win.unbind('resize',callback);
                    }
                }
            }
            function callback(){
                $timeout.cancel(timer);
                timer = $timeout(handler,200);
            }
            callback();
            win.bind('scroll',callback);
            win.bind('resize',callback);
        },
        /**
         * 实例
         * @param  {Object} json       这里的指放监听事件的参数
         */
        request: function (args){
        	var json = args.json;
        	for(var member in json){
        		if (!json.hasOwnProperty(member)) {
        			continue;
				}
                this.listener({
                    node: json[member].node,
                    callback: json[member].callback
                });
        	}
        }
	};
	return factory;
}]);

module.run(['service', 'lazy', function (service,lazy){
    service.expand('lazy',function (){
        return lazy;
    });
}]);