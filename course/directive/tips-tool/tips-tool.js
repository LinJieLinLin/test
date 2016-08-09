/**
 * mode : 0 表示正常，鼠标移到圆圈才弹出提示。   1 表示第一次显示时弹出提示框。    2 表示对相同内容第一次显示时弹出提示框，需要设置 modeId 字段声明内容
 * data = {
 *      title_top: 第一行内容标题
        info_top: 第一行内容
        title_bottom: 第二行内容标题
        info_bottom: 第二行内容
 * }
 */
module.directive("tipsTool", ['$timeout', function ($timeout) {
    //缓存mode == 2 时的 modeId
    var modeIdCache = {};

    return {
        template:'<div class="tooltip" ng-mouseenter="calPosition();"><div class="triangle"></div><div class="tip"><p class="text"><span ng-bind="data.title_top"></span><span class="content" ng-bind="data.info_top"></span></p><p class="text"><span ng-bind="data.title_bottom"></span><span class="content mutil" ng-bind="data.info_bottom"></span></p></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            mode: '=',
            modeId: '=',
            data: '=',
            conId: '='
        },
        link: function ($scope, $element, $attr) {

            function byteLen(str, letterLen, chineseLen) {
                var len = str.length;
                var ans = 0;
                for (var i = 0; i < len; i++) {
                    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                        ans += chineseLen;
                    } else {
                        ans += letterLen;
                    }
                }
                return ans;
            }

            //最大宽度,不精确数值
            var max_width = 400;
            //字母宽度，不精确数值
            var letterSize = 9;
            //汉字宽度，不精确数值
            var chineseSize = 12;

            function onceShow(tip, modeId) {
                tip.css('display', 'block');
                var cb = function () {
                    handleMode(0, null, tip);
                    modeId && (modeIdCache[modeId] = true) && console.log(modeId);
                    $element.off('mouseleave', cb);
                };
                $element.off('mouseleave');
                $element.on('mouseleave', cb);
            }

            function handleMode(mode, modeId, tip) {
                // console.log(mode, modeId, tip);
                tip = tip || $element.find('.tip, .triangle');
                if (mode == 0) {
                    tip.css('display', '');
                    return;
                } else if (mode == 1) {
                    //1 表示第一次显示时弹出提示框
                    onceShow(tip);
                } else if (mode == 2 && !modeIdCache[modeId]) {
                    //2 表示对相同内容第一次显示时弹出提示框，需要设置 modeId 字段声明内容
                    onceShow(tip, modeId);
                }
            }

            //计算位置
            $scope.calPosition = function () {
                var con = angular.element($scope.conId);
                if (con && con.length) {
                    var rect = con.offset();
                    var conRight = rect.left + con.width();
                    var tip = $element.find('.tip');
                    var tipRight = tip.offset().left + tip.width();
                    if (conRight < tipRight) {
                        var offset = tipRight - conRight;
                        tip.css('left', tip.position().left - offset);
                    }
                }
            };

            $scope.$watch('data', function (newValue, oldValue) {
                var data = newValue;

                //最长字符串长度
                var len1 = byteLen(data.info_top, letterSize, chineseSize);
                var len2 = byteLen(data.info_bottom, letterSize, chineseSize);
                var width = len1 > len2 ? len1 : len2;

                width = width < max_width ? width : max_width;
                $element.find('.mutil').width(width);

                handleMode($scope.mode, $scope.modeId);
                $scope.calPosition();
            });
        }
    }
}]);