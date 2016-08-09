module.factory('progressBar', function () {
    var i = 0;
    var body = angular.element('body');
    var defaultOptions = {
      element: body,
      position: 'top',
      color: 'rgb(2, 141, 192)'
    };
    function Progress (option) {
        i = i + 1;
        // 实例计数
        this.instanceCount = i;

        // loading 状态的百分比
        this.count = 0;

        this.option = $.extend(defaultOptions, option);

        // 是否自动计数        
        this.autoIncrease = false;

        // 存储定时器的 handler ，用于清除该计时器
        this.intervalHandler = null;

        // 初始颜色
        this.color = this.option.color;

        // 当前状态，未调用前是 `wait` ，开始 loading 时是 `loading` ，禁止使用时是 `prohibit` 
        this.status = 'wait';

        // 事件的callback
        this.callbacks = {};
    }
    
    Progress.fn = Progress.prototype;
    
    /**
     * 初始化，将HTML append 到页面中。
     * @return     {Object} Progress 实例 
     */
    Progress.fn.init = function () {
        var position = 'fixed';
        var display = 'block';
        var top = 0;
        var bottom = 'auto';
        var highlight = 'rotate(2deg) translate(0,-4px);';
        if (this.option.element !== body) {
          position = 'absolute';
          display = 'none';
        }
        if (this.option.position === 'bottom') {
          top = 'auto';
          bottom = 0;
          highlight = 'rotate(-2deg) translate(0,1px)';
        }
        var str = ['<div class="progress-wrapper"><div class="progress-main"><span class="progress-bar">',
                  '<span class="progress-bar-inner"></span></span><span class="progress-circle"></span><style>',
                  '.progress-wrapper{position:' + position + ';top:' + top +';bottom: '+ bottom +' ;left:0;right:0;',
                  'z-index:999;height:5px;}.progress-bar{width:0;position:relative;transition:all .3s}',
                  '.progress-main{position: absolute;top:' + top+';bottom:'+bottom+';left:0;right:0;}',
                  '.progress-bar,.progress-bar-inner{display:block;height:2px;-moz-transition:all .3s;',
                  '-o-transition:all .3s}.progress-bar-inner{position:absolute;top:1px;right:0;width:100px;',
                  '-webkit-transform:' + highlight+ ';-moz-transform:' + highlight+ ';',
                  '-ms-transform:' + highlight+ ';-o-transform:' + highlight+ ';',
                  'transform:' + highlight+ ';transition:all .3s}.progress-circle{position:absolute;',
                  'top:20px;right:20px;display:' + display +';width:15px;height:15px;border:2px solid transparent;',
                  'border-radius:50%;-webkit-animation:spin .4s linear infinite;-moz-animation:spin .4s linear infinite;',
                  '-o-animation:spin .4s linear infinite;animation:spin .4s linear infinite;-moz-transition:border .3s;',
                  '-o-transition:border .3s;transition:border .3s}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);',
                  'transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}',
                  '@-moz-keyframes spin{0%{-moz-transform:rotate(0);transform:rotate(0)}100%{-moz-transform:rotate(360deg);',
                  'transform:rotate(360deg)}}@-o-keyframes spin{0%{-o-transform:rotate(0);transform:rotate(0)}',
                  '100%{-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0);',
                  '-moz-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);',
                  '-moz-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}',
                  '</style></div></div>'].join('\n');
        this.ele = angular.element(str);
        this.setColor(this.color);
        this.status = 'loading';
        this.option.element.append(this.ele);
        this.trigger('init');

        return this;
    };
    
    /**
     * 开始进入loading效果，进度为0%
     * @return {Object} 返回Progress实例.
     */
    Progress.fn.start = function () {
        if (this.status === 'loading' || this.status === 'prohibit') {
            return;
        }
        this.init();
        this.set(0);
        this.trigger('start');
        return this;
    };

    /**
     * 设置为禁用 loading 效果。
     * @return {Object} 返回Progress实例
     */
    Progress.fn.prohibit = function () {
        this.status = 'prohibit';
        return this;
    };
    
    /**
     * 增加进度。
     * @param  {Boolean} auto 是否自动增加。
     * @return {Object}      返回Progress实例
     */
    Progress.fn.increase = function (auto) {
        var _this = this;
        if (this.status !== 'loading') {
            return;
        }
        if (this.autoIncrease) {
            return;
        }
        if (auto) {
            this.autoIncrease = true;
            this.intervalHandler = setInterval(function () {
                _this.count = _this.count + Math.floor(Math.random()*5);
                if (_this.count > 98) {
                    _this.stop();
                    return;
                }
                _this.set(_this.count);
            }, 400);
        } else {
            this.set(this.count + Math.floor(Math.random()*5));
        }
        this.trigger('increase');
        return this;
    };
    
    /**
     * 设置进度百分比
     * @param {Number} percent 百分比数值
     * @return {Object} 返回Progress实例
     */
    Progress.fn.set = function (percent) {
        if (this.status !== 'loading') {
            return;
        }
        this.count = percent;
        this.ele.find('.progress-bar').width(this.count+'%');
        this.trigger('progress');

        return this;
    };
    
    /**
     * 暂停进度
     * @return {Object} 返回实例
     */
    Progress.fn.stop = function () {
        if (this.intervalHandler) {
            clearInterval(this.intervalHandler);
            this.intervalHandler = null;
            this.autoIncrease = false;
        }
        this.trigger('stop');
        return this;
    };

    /**
     * 结束进度
     * @return {Object} 返回实例
     */
    Progress.fn.end = function () {
        if (this.status !== 'loading') {
            return;
        }
        var _this = this;
        this.stop();
        this.set(100);
        this.autoIncrease = false;
        setTimeout(function () {
            _this.ele.fadeOut({duration: 800, done: function () {
                _this.count = 0;
                _this.status = 'wait';
                _this.ele.remove();
                _this.trigger('end');
            }});
        }, 400);
        return this;
    };
    
    /**
     * 设置颜色。
     * @param {String} color 颜色可以是 hex 也可以是 rgb，如 `#ffffff` 或者 `#fff` 或者 `rgb(255,255,255)`
     * @return {Object} 返回实例
     */
    Progress.fn.setColor = function (color) {
        if (!color) {
            return;
        }
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        function rgbToHex(rgb) {
            var r, g, b;
            var arr = rgb.match(/\((.*)\)/)[1].split(',');
            r = +arr[0];
            g = +arr[1];
            b = +arr[2];
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        
        function hexToRgb(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                 return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? 
                [parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)].join(',')
            : null;
        }
        var rgb;
        var hex;
        if (color[0] === '#') {
            rgb = hexToRgb(color);
            hex = color;
        } else {
            rgb = color.match(/\((.*)\)/)[1];
            hex = rgbToHex(color);
        }
        this.color = hex;
        this.ele.find('.progress-bar').css({background: hex, boxShadow: '0 0 10px 0 rgba(' + rgb + ',0.5)'});
        this.ele.find('.progress-bar-inner').css({background: hex, boxShadow: '0 0 10px rgba(' + rgb + ',0.5)'});
        this.ele.find('.progress-circle').css({borderBottomColor: hex, borderLeftColor:hex});
        this.trigger('setColor');
        return this;
    };

    /**
     * 监听事件
     * @param  {String}   name    事件的名称
     * @param  {Function} fn      事件的回调函数
     * @param  {Object}   context 可选的上下文
     * @return {Object}           返回实例
     */
    Progress.fn.on = function (name, fn, context) {
        if (!this.callbacks[name] || !this.callbacks[name].length) {
            this.callbacks[name] = [{fn: fn, context: context || this}];
        } else {
            this.callbacks[name].push({fn: fn, context: context || this});
        }
        return this;
    };

    /**
     * 触发事件
     * @param  {String} name 事件名称
     * @return {Object}      返回实例
     */
    Progress.fn.trigger = function (name) {
        if (!this.callbacks[name] || !this.callbacks[name].length) {
            return;
        } else {
            this.callbacks[name].forEach(function (obj) {
                obj.fn.call(obj.context);
            });
        }
        return this;
    };
    
    /**
     * Service 返回的对象
     * @type {Object}
     */
    var progress = {
        /**
         * 创建实例。该函数必须执行，对 progressBar 的操作必须在 ngProgressBar 实例中进行。
         * @return {Object} 返回Progress实例
         */
        createInstance: function (option) {
            var instance = new Progress(option);
            this.instances.push(instance);
            return instance;
        },
        /**
         * 实例堆栈
         * @type {Array}
         */
        instances: []
    };
    
    return progress;
});

module.run(['$rootScope', 'service', 'progressBar', function ($rootScope,service,progressBar){
  service.expand('progress',function (){
    var url = {};
    var blackList = [];
    var progress = progressBar.createInstance();
    function isObjEmpty (obj) {
      var flag = true;
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          flag = false;
          break;
        }
      }
      return flag;
    }
    service.event.on('loading.start', function (request) {
      if (isObjEmpty(url)) {
        progress.start();
        progress.increase(true);
      }
      url[request.uuid] = request.url;
    });

    service.event.on('loading.end', function (request) {
      delete url[request.uuid];
      if (isObjEmpty(url)) {
        progress.end();
      }
    });

    return {
        filter: function (urls) {
            if (typeof urls === 'string') {
              blackList.push(urls);
            } else {
              if (typeof urls === 'function') {
                urls = urls();
              }
              angular.forEach(urls, function (u) {
                  if (blackList.indexOf(u) === -1) {
                      blackList.push(u);
                  }
              });
            }
        },
        instance: function () {
            return progress;
        }
    };
  });
}]);