/**
 * Created by FENGSB on 2015/8/27.
 */

module.factory('slides', ['$timeout', '$interval', function($timeout,$interval){
    var factory = {
        /**
         * 创建实例
         * @param  {Object}  item    创建实例的对象
         * @param  {String}  effect  指定效果
         */
        examples: function (item,effect){
            switch(effect){
                case 'fade':
                    this.fade(item);
                    break;
                case 'swiper':
                    this.swiper(item);
                    break;
                default:
                    console.error('error : slides object no '+ effect +' effect');
            }
        },

        /**
         * wiper 效果
         * @param  {Object}  item  创建实例的对象
         * @param  {Object}  item.before: fn, //插件提供的前滑事件（直接调用）
         * @param  {Object}  item.after: fn,  //插件提供的后滑事件（直接调用）
         * @param  {Object}  item.clearTimer: fn,  //插件提供的清除定时器事件（直接调用）
         * @param  {Object}  item.play: fn, //插件提供的自动播放事件（直接调用）
         * @param  {Object}  item.sync: fn, //插件提供的动画同步执行（直接调用）
         * @param  {Object}  item.page: num, //插件提供的页数（直接调用）
         * @param  {Object}  item.list: $scope.schoolList, //ng-repeat 数组
         * @param  {Object}  item.autoPlay: true,
         * @param  {Object}  item.time: 3000,
         * @param  {Object}  item.loop: true, //做无效循环的 ng-repeat 必须复制多两份
         * @param  {Object}  item.boxWidth: 152, //每个BOX的宽度
         * @param  {Object}  item.unit: 7, //每次滑动N个
         * @param  {Object}  item.minUnit: 7, //窗口最少显示N个
         * @param  {Object}  item.scrollNode: '#schoolScrollWrap', //滚动节点ID
         * @param  {Object}  item.swiperStyle: {} //滚动节点的 ng-style
         */
        swiper: function (item){
            var css3 = rcpAid.css3;
            item.changePage = function (type){
                if(item.disabled || item.clickLock){
                    return;
                }
                var w = item.boxWidth * item.unit;
                var x = 0;
                var y = 0;

                item.setMax();

                item.clickLock = !item.clickLock;
                switch(type){
                    case 'before':
                        item.page = item.page <= 0 ? item.list.length -1 : item.page -1;
                        x = item.xVal + w;
                        if(!item.loop && x > 0){
                            x = 0;
                        }
                        if(item.loop && x > 0){
                            x = item.totalWidth * 2 + Math.abs(item.xVal);
                            item.staticSetTransform(-x,0);
                            x = -x + w;
                        }
                        break;
                    case 'after':
                        item.page = (item.page+1) % item.list.length;
                        x = item.xVal - w;
                        if(!item.loop && x < -item.maxX){
                            x = -item.maxX;
                        }
                        if(item.loop && x < -item.maxX){
                            x = item.scrollWidth - (Math.abs(item.xVal) + item.viewWidth);
                            x += item.totalWidth - x;
                            x = Math.abs(item.xVal) - x;
                            item.staticSetTransform(-x,0);
                            x = -x - w;
                        }
                        break;
                }
                $timeout(function (){
                    item.setTransform(x,y);
                    x = y = w = null;
                },20);
            };
            item.before = function (){
                item.changePage('before');
            };
            item.after = function (){
                item.changePage('after');
            };
            item.transitionEnd = function (){
                if(typeof item.sync === 'function'){
                    item.sync();
                }
                if(css3.check()){
                    css3.transitionEnd(angular.element(item.scrollNode).get(0),function (){
                        item.clickLock = !item.clickLock;
                    });
                }else{
                    item.clickLock = !item.clickLock;
                }
            };
            item.staticSetTransform = function (x,y){
                item.swiperStyle.transition = 'transform 0s';
                item.setTransform(x,y,'static');
                $timeout(function (){
                    item.swiperStyle.transition = '';
                },10);
            };
            item.setTransform = function (x,y,type){
                item.xVal = x;
                item.yVal = y;
                item.swiperStyle.transform = 'translate('+ x +'px,'+ y +'px)';
                switch(type){
                    case 'static':
                        break;
                    default:
                        item.transitionEnd();
                }
            };
            item.setMax = function (){
                item.viewWidth = angular.element(item.scrollNode).parent().width();
                item.maxX = item.scrollWidth - item.viewWidth;
            };
            item.setWidth = function (){
                item.totalWidth = item.boxWidth * item.list.length;
                item.scrollWidth = item.totalWidth * ( item.loop ? 3 : 1 );
                item.swiperStyle.width = item.scrollWidth + 'px';
                $timeout(function (){
                    item.setMax();
                },200);
            };
            item.clearTimer = function (){
                if(item.playLock){
                    $interval.cancel(item.timer);
                }
            };
            item.play = function (){
                item.clearTimer();
                if(item.playLock){
                    item.timer = $interval(item.after,item.time);
                }
            };
            item.init = function (){
                item.page = typeof item.page === 'number' ? item.page : 0;
                item.playLock = item.autoPlay || false;
                item.disabled = item.list.length < item.minUnit;
                item.loop = item.loop ? !item.disabled : false;
                item.clickLock = false;
                item.xVal = typeof item.xVal === 'number' ? item.xVal : 0;
                item.yVal = typeof item.yVal === 'number' ? item.yVal : 0;
                item.setWidth();
                item.play();
            };
            item.init();
        },

        /**
         * fade 效果
         * @param  {Object}  item  创建实例的对象
         * @param  {Object}  item.before: fn, //插件提供的前翻事件（直接调用）
         * @param  {Object}  item.after: fn,  //插件提供的后翻事件（直接调用）
         * @param  {Object}  item.clearTimer: fn,  //插件提供的清除定时器事件（直接调用）
         * @param  {Object}  item.play: fn, //插件提供的自动播放事件（直接调用）
         * @param  {Object}  item.sync: fn, //插件提供的动画同步执行（直接调用）
         * @param  {Object}  item.page: num, //插件提供的页数（直接调用）
         * @param  {Object}  item.list: $scope.schoolList, //ng-repeat 数组
         * @param  {Object}  item.autoPlay: true,
         * @param  {Object}  item.time: 3000
         */
        fade: function (item){
            
            item.cutover = function(num){
                item.page = ( typeof num === 'number' ? num : item.page ) % item.list.length;
                angular.forEach(item.list,function (member,index){
                    member.active = item.page === index;
                });

                if(typeof item.sync === 'function'){
                    item.sync();
                }
            };

            item.after = function (){
                item.page+=1;
                item.cutover();
            };

            item.before = function (){
                item.page = (item.page <= 0 ? item.list.length : item.page ) - 1;
                item.cutover();
            };

            item.clearTimer = function (){
                if(item.playLock){
                    $interval.cancel(item.timer);
                }
            };

            item.play = function (){
                item.clearTimer();
                if(item.playLock){
                    item.timer = $interval(item.after,item.time);
                }
            };

            item.init = function (){
                item.page = typeof item.page === 'number' ? item.page : 0;
                item.playLock = item.autoPlay || false;
                item.play();
                item.cutover();
            };
            item.init();
        }
    };
    return factory;
}]);

module.run(['service', 'slides', function (service,slides){
    service.expand('slides',function (){
        return slides;
    });
}]);