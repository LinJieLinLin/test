/**
default:为空时使用默认图，为图片地址时使用地址里的图片
src标签应使用ng-src，否则angular捕抓不到图片的error错误
 */
module.directive('img', ['$document', function($document) {
    return {
        restrict: 'E',
        replace: true,
        link: function($scope, $element, $attr) {
            var initImg = 'data:image/png;base64,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',
                defaultImg = $attr.default || initImg;
            /**
             * [stop 停止错误监听]
             * @return {[type]} [description]
             */
            function stop() {
                $element.off('error', errorImg);
            }
            /**
             * [errorImg 设置默认图]
             * @return {[type]} [description]
             */
            function errorImg() {
                console.log('图片 error', $attr.src);
                if (defaultImg) {
                    $element.attr('src', defaultImg);
                    defaultImg = '';
                } else {
                    $element.attr('src', initImg);
                    // stop();
                }
            }
            if (!$attr.src) {
                $element.attr('src', $attr.default);
            }

            function isOnIE() {
                if (!!window.ActiveXObject || "ActiveXObject" in window)
                    return true;
                else
                    return false;
            }
            //IE浏览器加个timeout 0
            if (isOnIE()) {
                setTimeout(function() { $element.on('error', errorImg); }, 0);
            }else{
               $element.on('error', errorImg); 
            }
        }
    };
}]);
/**
 * [ngImg]
 * c{
 * img: 图片
 * title：图片标题
 * auto: true自适应
 * default: 默认图片
 * divStyle: 图片可视区域大小{height:??,width:??...}
 * imgStyle: 要显示的图片大小{height:??,width:??...}
 * divClass: 对应class
 * imgClass: 对应class
 * }
 */
module.directive('ngImg', ['$document', function($document) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: '<div ng-style="divStyle" class="ng-img-div" ng-class="divClass"></div>',
        scope: {
            c: '='
        },
        controller: ['$scope', '$element', '$compile', '$timeout', function($scope, $element, $compile, $timeout) {
            try {
                $scope.init = function() {
                    $scope.img = '';
                    $scope.default = '';
                    $scope.title = '';
                    $scope.auto = false;
                    $scope.alt = '暂无图片';
                    $scope.divStyle = {};
                    $scope.imgStyle = {};
                    if ($scope.c) {
                        angular.forEach($scope.c, function(value, key) {
                            $scope[key] = value;
                        });
                    }
                    $scope.$watch('c', function(v) {
                        if (v) {
                            angular.forEach($scope.c, function(value, key) {
                                $scope[key] = value;
                            });
                        }
                    });

                    function suImg() {
                        try {
                            // console.log($scope.img,$scope.alt);
                            var w = $element.width(),
                                h = $element.height(),
                                imgw = 0,
                                imgh = 0,
                                imgStyle = angular.copy($scope.imgStyle);
                            // console.log('div w,h', w, h);
                            if ($scope.auto) {
                                imgStyle.width = 'auto';
                                imgStyle.height = 'auto';
                            }
                            if ($scope.imgStyle.width || $scope.imgStyle.height) {
                                $scope.auto = true;
                            }
                            if ($scope.auto) {
                                imgStyle.visibility = 'visible';
                                $element.children().css(imgStyle);
                                return;
                            }
                            imgw = $element.children()[0].naturalWidth;
                            imgh = $element.children()[0].naturalHeight;
                            h = h ? h : 1;
                            imgh = imgh ? imgh : 1;
                            // console.log(w / h, imgw / imgh);
                            if (w / h > imgw / imgh) {
                                imgStyle.height = 'auto';
                                imgStyle.width = '100%';
                            } else {
                                imgStyle.height = '100%';
                                imgStyle.width = 'auto';
                            }
                            imgStyle.visibility = 'visible';
                            $element.children().css(imgStyle);
                        } catch (e) {}
                    }
                    $timeout(function() {
                        var temDefault = $scope.default || '',
                            imgClass = $scope.imgClass || '',
                            alt = $scope.alt || '',
                            title = $scope.title || '';
                        var img = '<img ng-src="{{img}}" default="' + temDefault + '" class="ng-img ' + imgClass +
                            '" alt="' + alt + '" title="' + title +
                            '" style="visibility: hidden;" >';
                        $element.append($compile(img)($scope));
                        $element.children().on('load', suImg);
                    }, 0);

                };
                $scope.init();
            } catch (e) { console.log(e); }
        }]
    };
}]);
module.directive("lazyimg", function() {
    return {
        template: '<div class="lazy-img">' +
            '<div class="light"></div>' +
            '<img ng-src="{{url}}" width="{{width}}" height="{{height}}" ng-style="style">' +
            '</div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            src: "=src",
            conf: "=conf"
        },
        controller: ['$scope', '$element', '$attrs', 'lazy', function($scope, $element, $attrs, lazy) {
            if ($scope.conf) {
                angular.forEach(function(value, key) {
                    $scope[key] = value;
                });
            }
            $scope.style = {};
            $scope.url = '/images/icon/blank.gif';
            var visible;
            angular.element($element.find('img')).on({
                load: function() {
                    if (visible) {
                        $scope.visible(this);
                    } else {
                        $scope.listener(this);
                    }
                },
                error: function() {
                    if (visible) {
                        $scope.error();
                    } else {
                        $scope.listener();
                    }
                }
            });
            $scope.listener = function(img) {
                lazy.listener({
                    node: img,
                    callback: function() {
                        visible = true;
                        if ($scope.src) {
                            $scope.url = $scope.src;
                        }
                    }
                });
            };
            $scope.visible = function() {
                $($element).addClass('visible');
            };
            $scope.error = function() {
                $($element).addClass('error');
            };
        }]
    };
});

module.directive("noData", function() {
    return {
        template: '<div ng-show="show && !list.length">' +
            '<img src="/images/other/no-data.png" width="100%" />' +
            '</div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            show: "=show",
            list: "=list"
        },
        controller: function() {
            //
        }
    };
});

module.directive("loaderUi", function() {
    return {
        template: '<div class="loader" ng-hide="show">' +
            '<div class="loader-inner line-scale">' +
            '<div></div>' +
            '<div></div>' +
            '<div></div>' +
            '<div></div>' +
            '<div></div>' +
            '</div>' +
            '</div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            show: "=show"
        },
        controller: function() {
            //
        }
    };
});

module.directive("selectUi", function() {
    return {
        template: '<div ng-click="toggle()" ng-blur="hide()" tabindex="-1">' +
            '<div class="val text-of">' +
            '<span class="f">{{value.name}}</span>' +
            '<i class="x-arrow-dowm">&gt;</i>' +
            '</div>' +
            '<div class="option" ng-show="showLock">' +
            '<ul>' +
            '<li ' +
            'ng-repeat="item in option" ' +
            'ng-class="item.activeLock ? \'li text-of active\' : \'li text-of\'"' +
            'ng-click="setValue(item)" ' +
            'ng-mouseenter="setValue(item,\'mouseenter\')"' +
            '>{{item.name}}</li>' +
            '</ul>' +
            '</div>' +
            '</div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            option: "=option",
            value: "=value"
        },
        controller: ['$scope', function($scope) {

            $scope.setValue = function(item, mouseenter) {
                angular.forEach($scope.option, function(value) {
                    value.activeLock = value.name === item.name;
                    if (!mouseenter) {
                        value.fixLock = value.activeLock;
                        $scope.value = item;
                    }
                });
            };

            $scope.toggle = function() {
                $scope.showLock = !$scope.showLock;

                if ($scope.showLock) {
                    angular.forEach($scope.option, function(value) {
                        value.activeLock = value.fixLock;
                    });
                }
            };

            $scope.hide = function() {
                $scope.showLock = false;
            };
        }]
    };
});
