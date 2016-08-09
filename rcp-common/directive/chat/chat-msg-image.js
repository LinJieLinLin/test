(function () {
    angular.module('chat_directive').directive('msgImg', function () {
        return {
            scope: {
                msg: '=msgImg'
            },
            restrict: 'A',
            template:'<a ng-click="showPic()"><img ng-src="{{imgUrl}}"></a><div class="chat-pos-fixed chat-pos-center chat-bg-transparent" ng-show="showBigImg"><div class="chat-dis-table"><div class="chat-dis-tablecell"><div class="chat-big-img"><button ng-click="closePic()" class="chat-close-img">&times;</button><div><i ng-hide="imgLoaded" class="fa fa-spinner fa-spin"></i> <a ng-show="imgLoaded" ng-click="zoomPic()" ng-style="parentStyle"><img class="chat-img" ng-class="{\'chat-img-zoom\': largeImg && !dragMode, \'chat-img-drag\': dragMode}" ng-mousedown="mousedown($event)" ng-src="{{bigImgUrl}}" ng-style="imgStyle"></a></div></div></div></div></div>',
            link: function (scope, element) {
                scope.imgStyle    = {};
                scope.parentStyle = {};
                scope.largeImg    = false;
                if (scope.msg.fileType !== 2) {
                    return;
                }
                var cursorPos = {
                    top : 0,
                    left: 0
                };
                var currentPos = {
                    left:  0,
                    top :  0
                };
                var img = element.find('.chat-big-img img');
                var doc = angular.element(document);
                var originalSize = {
                    width : 0,
                    height: 0
                };
                var windowWidth   = $(window).width();
                var windowHeight  = $(window).height();
                var largeView     = false;
                scope.imgUrl = angular.element(scope.msg.msg).find('img').attr('src');
                scope.showPic = function () {
                    scope.showBigImg = true;
                    scope.bigImgUrl  = scope.imgUrl.split('?s=1')[0];
                    var test= new Image();
                    test.src=scope.bigImgUrl;
                    angular.element(test).on('load', function () {
                        var width           = this.width;
                        var height          = this.height;
                        originalSize.width  = width;
                        originalSize.height = height;
                        if (width > windowWidth*0.8) {
                            scope.largeImg              = true;
                            scope.imgStyle['max-width'] = windowWidth * 0.8;
                        } else {
                            scope.imgStyle['max-width'] = originalSize.width;
                        }
                        if (height > windowHeight*0.8) {
                            scope.largeImg               = true;
                            scope.imgStyle['max-height'] = windowHeight * 0.8;
                        } else {
                            scope.imgStyle['max-height'] = originalSize.height;
                        }
                        scope.imgLoaded = true;
                        scope.$digest();
                    });
                };
                scope.closePic = function () {
                    scope.showBigImg  = false;
                    scope.imgStyle    = {};
                    scope.parentStyle = {};
                    scope.largeImg    = false;
                    scope.dragMode    = false;
                    largeView         = false;
                    scope.bigImgUrl   = undefined;
                    scope.imgLoaded   = false;
                    img.off('load');
                };
                scope.zoomPic = function () {
                    if (scope.largeImg && !largeView) {
                        scope.parentStyle.width  = windowWidth * 0.8;
                        scope.parentStyle.height = windowHeight * 0.8;
                        scope.imgStyle.width     = originalSize.width;
                        scope.imgStyle.height    = originalSize.height;
                        scope.dragMode           = true;
                        largeView                = true;
                        scope.imgStyle['max-height'] = 'none';
                        scope.imgStyle['max-width'] = 'none';

                    }
                };
                scope.mousedown = function (e) {
                    cursorPos.left  = e.clientX;
                    cursorPos.top   = e.clientY;
                    currentPos.left = img.parent().parent().scrollLeft();
                    currentPos.top  = img.parent().parent().scrollTop();
                    doc.on('mousemove', mousemove);
                    doc.on('mouseup', mouseup);
                    e.preventDefault();
                };
                function mousemove (e) {
                    var move = {
                        left: e.clientX - cursorPos.left,
                        top : e.clientY - cursorPos.top
                    };
                    img.parent().parent().scrollTop(currentPos.top - move.top).scrollLeft(currentPos.left - move.left);
                }
                function mouseup () {
                    doc.off('mousemove', mousemove);
                    doc.off('mouseup', mouseup);
                }
            }
        };
    });
})();