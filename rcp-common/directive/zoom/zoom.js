module.directive('zoom', function() {
    return {
        restrict: "A",
        scope: {
            style: '=zoom',
            config: '=config'
        },
        controller: ['$scope', '$compile', '$element', '$document', function($scope, $compile, $element, $document) {
            var sx = 0;
            var sy = 0;
            var mx = 0;
            var my = 0;
            var vw;
            var vh;
            var vt;
            var vl;
            var minw;
            var minh;
            var temp;
            var keyShift;
            var mType = null;
            var defaultStyle = angular.copy($scope.style);

            function getDefaultStyle(arg) {
                angular.forEach(arg, function(k) {
                    var val = $element.css(k);
                    if (k === 'position' && val === 'static') {
                        val = '';
                    }
                    defaultStyle[k] = val;
                });
            }

            function defStyle() {
                delete $scope.style.left;
                delete $scope.style.right;
                delete $scope.style.bottom;
                delete $scope.style.top;

                defaultStyle = angular.copy($scope.style);

                $scope.style.width = parseInt(defaultStyle.width);
                $scope.style.height = parseInt(defaultStyle.height);

                $(temp).css(defaultStyle);

                var l = defaultStyle.left === 'auto' ? 0 : parseInt(defaultStyle.left);
                var t = defaultStyle.top === 'auto' ? 0 : parseInt(defaultStyle.top);

                $element.css({
                    width: defaultStyle.width,
                    height: defaultStyle.height,
                    position: 'relative',
                    left: l,
                    top: t,
                    marginTop: -l,
                    marginLeft: -t
                });
            }

            function init() {
                minw = typeof $scope.config.minw === 'number' ? $scope.config.minw : 20;
                minh = typeof $scope.config.minw === 'number' ? $scope.config.minh : 20;
                if (temp) {
                    defStyle();
                } else {
                    getDefaultStyle(['position', 'left', 'top', 'marginTop', 'marginLeft', 'width', 'height']);
                    runTemp(function() {
                        $element.after(temp).appendTo(temp);
                        defStyle();
                        runMousewheel();
                    });
                }
                digest();
            }

            function runTemp(cb) {
                var title = 'shift键按比例改变大小';
                var html = '<div class="zoom-dir" ng-style="style">';
                html += '<div class="xr" ng-mousedown="move($event,\'xr\')"></div>';
                html += '<div class="yb" ng-mousedown="move($event,\'yb\')"></div>';
                html += '<div class="xl" ng-mousedown="move($event,\'xl\')" ng-if="!isStatic()" ></div>';
                html += '<div class="yt" ng-mousedown="move($event,\'yt\')" ng-if="!isStatic()" ></div>';
                html += '<div class="t" ng-mousedown="move($event,\'t\')" title="' + title + '" ng-if="!isStatic()"></div>';
                html += '<div class="r" ng-mousedown="move($event,\'r\')" title="' + title + '" ng-if="!isStatic()"></div>';
                html += '<div class="l" ng-mousedown="move($event,\'l\')" title="' + title + '" ng-if="!isStatic()"></div>';
                html += '<div class="b" ng-mousedown="move($event,\'b\')" title="' + title + '"></div>';
                html += '</div>';
                temp = $compile(html)($scope);
                cb();
            }

            function digest() {
                try {
                    $scope.$digest();
                } catch (e) {}
            }

            function getCurScale() {
                vw = parseInt($element.css('width'));
                vh = parseInt($element.css('height'));
                vt = parseInt($element.css('top'));
                vl = parseInt($element.css('left'));
            }

            function down(ev, type) {
                mType = type;
                sx = ev.clientX;
                sy = ev.clientY;
                getCurScale();
                $document.find('body').bind('selectstart', function() {
                    return false;
                }).css({
                    WebkitUserSelect: 'none',
                    UserSelect: 'none'
                });
                $document.bind('mousemove', move);
                $document.bind('mouseup', up);
                $document.bind('keydown', keydown);
                $document.bind('keyup', keyup);
            }

            function move(ev) {
                mx = ev.clientX;
                my = ev.clientY;
                var dx = mx - sx;
                var dy = my - sy;
                resizeChange('resize', dx, dy);
                return false;
            }

            function up() {
                $document.find('body').unbind('selectstart').css({
                    WebkitUserSelect: '',
                    UserSelect: ''
                });
                $document.unbind('mousemove', move);
                $document.unbind('mouseup', up);
                $document.unbind('keydown', keydown);
                $document.unbind('keyup', keyup);
                mType = null;
                keyShift = null;
                argCallb($scope.config.mouseup);
            }

            function keydown(ev) {
                keyShift = ev.keyCode === 16;
            }

            function keyup() {
                keyShift = null;
            }

            function argCallb(cb) {
                if (typeof cb === 'function') {
                    cb();
                }
            }

            function minnum(val, num, cb) {
                var flag = val <= num;
                if (flag && typeof cb === 'function') {
                    cb();
                }
                return flag;
            }

            function rev(style) {
                minnum(style.width, minw, function() {
                    style.width = minw;
                });
                minnum(style.height, minh, function() {
                    style.height = minh;
                });
                angular.extend($scope.style, style);
                $element.css(angular.extend(style, {
                    marginTop: -style.top,
                    marginLeft: -style.left
                }));
                digest();
            }

            function setStyle(o, a) {
                angular.forEach(a, function(v, t) {
                    if (angular.isNumber(v)) {
                        o[t] = v;
                    }
                });
            }

            function mousewheel() {
                var num = 20;
                var _this = $(temp).get(0);
                if (navigator.userAgent.indexOf("Firefox") > 0) {
                    _this.addEventListener('DOMMouseScroll', function(e) {
                        var val = e.detail > 0 ? num : -num;
                        scaleChange(val);
                        e.preventDefault();
                    }, false);
                } else {
                    _this.onmousewheel = function(e) {
                        e = e || window.event;
                        var val = e.wheelDelta > 0 ? -num : num;
                        scaleChange(val);
                        return false;
                    };
                }
            }

            function runMousewheel() {
                var wheelLock = $scope.config.mousewheelLock;
                if ((!wheelLock && typeof wheelLock !== 'boolean') || (wheelLock && typeof wheelLock === 'boolean')) {
                    mousewheel();
                }
            }

            function modifyScale(action, dx, dy) {
                var w;
                var h;
                var t;
                var l;
                var style = {};

                function minwh() {
                    if (h <= minh) {
                        h = minh;
                        w = h * vw / vh;
                    }
                    if (w <= minw) {
                        w = minw;
                        h = w * vh / vw;
                    }
                }

                function spt(argdy) {
                    if (!minnum(h, minh) && angular.isNumber(vt)) {
                        t = vt + argdy;
                    }
                }

                function spl(argdx) {
                    if (!minnum(w, minw) && angular.isNumber(vl)) {
                        l = vl + argdx;
                    }
                }

                function swh(argdw, argdh) {
                    if (angular.isNumber(argdw)) {
                        w = vw + argdw;
                    }
                    if (angular.isNumber(argdh)) {
                        h = vh + argdh;
                    }
                }

                function shiftSwh(argdx, argdy) {
                    if (-argdx > -argdy) {
                        w = vw - argdx;
                        h = w * vh / vw;
                    } else {
                        h = vh - argdy;
                        w = h * vw / vh;
                    }
                    minwh();
                }

                function wheel(type, dix) {
                    switch (type) {
                        case 'x':
                            w = vw + dix;
                            h = w * vh / vw;
                            break;
                        case 'y':
                            h = vh + dix;
                            w = h * vw / vh;
                            break;
                    }
                    minwh();
                    spt(parseInt((vh - h) / 2));
                    spl(parseInt((vw - w) / 2));
                }

                function resize() {
                    var ratio = $scope.config.ratioScaling;
                    switch (mType) {
                        case 't':
                            if (keyShift || ratio) {
                                shiftSwh(dx, dy);
                                spt(vh - h);
                                spl(vw - w);
                            } else {
                                swh(-dx, -dy);
                                spt(dy);
                                spl(dx);
                            }
                            break;
                        case 'r':
                            if (keyShift || ratio) {
                                shiftSwh(-dx, dy);
                                spt(vh - h);
                            } else {
                                swh(dx, -dy);
                                spt(dy);
                            }
                            break;
                        case 'b':
                            if (keyShift || ratio) {
                                shiftSwh(-dx, -dy);
                            } else {
                                swh(dx, dy);
                            }
                            break;
                        case 'l':
                            if (keyShift || ratio) {
                                shiftSwh(dx, -dy);
                                spl(vw - w);
                            } else {
                                swh(-dx, dy);
                                spl(dx);
                            }
                            break;
                        case 'xl':
                            if (ratio) {
                                wheel('x', -dx);
                            } else {
                                swh(-dx);
                                spl(dx);
                            }
                            break;
                        case 'xr':
                            if (ratio) {
                                wheel('x', dx);
                            } else {
                                swh(dx);
                            }
                            break;
                        case 'yt':
                            if (ratio) {
                                wheel('y', -dy);
                            } else {
                                swh(null, -dy);
                                spt(dy);
                            }
                            break;
                        case 'yb':
                            if (ratio) {
                                wheel('y', dy);
                            } else {
                                swh(null, dy);
                            }
                            break;
                    }
                }

                switch (action) {
                    case 'wheel':
                        wheel('x', dx);
                        break;
                    case 'resize':
                        resize();
                        break;
                }

                if (angular.isNumber(w)) {
                    style.width = w;
                }

                if (angular.isNumber(h)) {
                    style.height = h;
                }

                $scope.isStatic(function(flag) {
                    if (!flag) {
                        setStyle(style, {
                            top: t,
                            left: l
                        });
                    }
                });

                rev(style);
            }

            function scaleChange(dix) {
                getCurScale();
                resizeChange('wheel', dix, dix);
            }

            function resizeChange(action, dx, dy) {
                modifyScale(action, dx, dy);
            }

            $scope.move = function(ev, type) {
                down(ev, type);
            };

            $scope.isStatic = function(cb) {
                var position = $scope.config.position;
                var flag = position === 'static';
                if (typeof cb === 'function') {
                    cb(flag);
                }
                return flag;
            };

            $scope.$watch('config',function(n){
                if(!angular.isUndefined(n)){
                    if (angular.isUndefined(defaultStyle)) {
                        return;
                    }
                    $scope.config.init = init;

                    if (($element.get(0).tagName).toLowerCase() === 'img') {
                        $element.on({
                            load: init
                        });
                    } else {
                        init();
                    }
                }
            });

        }]
    };
});
