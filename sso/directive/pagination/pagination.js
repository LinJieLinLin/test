/*
组件传入参数：
list: 返回的数据
pagefn:请求数据函数
pageargs:分页参数
 */

if (!module) {
    var module = angular.module('RCP', []);
}
module.directive("pagination", function() {
    return {
        template: '<div class="page-bar" ng-show="list.length>0">' +
            '<a href="javascript:;" ng-class="current<=0?\'disabled\':\'\'" ng-click="prev()"><em class="emic">&lt;</em><em class="emf">上一页</em></a>' +
            '<a href="javascript:;" ng-repeat="key in keyList" ng-class="key==current ? \'cur\' : \'\'" ng-click="jump(key)">{{key+1}}</a>' +
            '<span ng-show="pLen>pMax && !hideEllipsis">...</span>' +
            '<a href="javascript:;" ng-class="current>=pLen-1?\'disabled\':\'\'" ng-click="next()"><em class="emf">下一页</em><em class="emic">&gt;</em></a>' +
            '<span class="jump-bar">' +
            '<span>共<font class="blue-c">{{pLen}}</font>页</span>' +
            '<span>跳到 <input type="text" style="width:38px;height:19px;text-align:center;" ng-model="goKey"> 页</span>' +
            '<a href="" ng-click="go(goKey)">GO</a>' +
            '</span>' +
            '</div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            list: "=",
            pagefn: "=",
            pageargs: "="
        },
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            $scope.$watch('pageargs', function(newValue, oldValue) {
                if (!newValue) {
                    return;
                }
                $scope.current = parseInt($scope.pageargs.pn) - 1;
                $scope.pageNode = $scope.current;
                $scope.pNum = parseInt($scope.pageargs.ps);
                $scope.pMax = parseInt($scope.pageargs.pl) || 5;
                $scope.pagefn($scope.pageargs, function(data) {
                    $scope.pLen = Math.ceil(parseInt(data.pa.total) / $scope.pNum);
                    $scope.keyListWatch();
                });
            },true);

            $scope.reKeyList = function(s, e, limit) {
                $scope.keyList = [];
                for (var i = s; i < e; i++) {
                    if (i >= limit) {
                        break;
                    }
                    $scope.hideEllipsis = (i + 1 == $scope.pLen) ? true : false;
                    $scope.keyList.push(i);
                }
            };

            $scope.keyListWatch = function() {
                var pLen = $scope.pLen;
                if (pLen > $scope.pMax) {
                    var half = Math.ceil($scope.pMax / 2);
                    var cur = $scope.current;
                    if (cur >= half && cur < (pLen - ($scope.pMax - half))) {
                        $scope.reKeyList((cur - ($scope.pMax - half)), (cur + half), pLen);
                    } else if (cur >= (pLen - ($scope.pMax - half))) {
                        $scope.reKeyList((pLen - $scope.pMax), pLen, pLen);
                    } else if (cur <= half) {
                        $scope.reKeyList(0, pLen, $scope.pMax);
                    }
                } else {
                    $scope.reKeyList(0, pLen, $scope.pMax);
                }
            };

            $scope.jump = function(key) {
                if ($scope.pageNode == key) {
                    return;
                }
                $scope.current = key;
                $scope.pageNode = key;
                $scope.pageargs.pn = key + 1;
                $scope.pagefn($scope.pageargs, function(data) {
                    $scope.pLen = Math.ceil(parseInt(data.pa.total) / $scope.pNum);
                    $scope.keyListWatch();
                });
            };

            $scope.next = function() {
                $scope.current++;
                if ($scope.current >= $scope.pLen) {
                    $scope.current = $scope.pLen - 1;
                }
                $scope.jump($scope.current);
            };

            $scope.prev = function() {
                $scope.current--;
                if ($scope.current <= 0) {
                    $scope.current = 0;
                }
                $scope.jump($scope.current);
            };

            $scope.go = function(key) {
                var regNum = /^-?\d+$/g;
                var msg = '';
                if (key === undefined || key.length <= 0) {
                    msg = '输入不能为空！';
                    try {
                        binApp.alert(msg, {
                            action: 'top'
                        });
                    } catch (err) {
                        alert(msg);
                    }
                } else if (regNum.test(key)) {
                    if (parseInt(key) > $scope.pLen) {
                        key = $scope.pLen;
                        msg = '总共只有' + $scope.pLen + '页，为您转到最后一页！';
                        try {
                            binApp.alert(msg, {
                                action: 'top'
                            });
                        } catch (err) {
                            alert(msg);
                        }
                    } else if (parseInt(key) <= 0) {
                        key = 1;
                        msg = '不能低于第1页,为您转到最前一页！';
                        try {
                            binApp.alert(msg, {
                                action: 'top'
                            });
                        } catch (err) {
                            alert(msg);
                        }
                    }
                    $scope.jump((parseInt(key) - 1));
                    $scope.goKey = undefined;
                } else if (key.match(/\s+/g)) {
                    msg = '输入不能有空格符！';
                    try {
                        binApp.alert(msg, {
                            action: 'top'
                        });
                    } catch (err) {
                        alert(msg);
                    }
                } else {
                    msg = '格式错误，请输入整数！';
                    try {
                        binApp.alert(msg, {
                            action: 'top'
                        });
                    } catch (err) {
                        alert(msg);
                    }
                }
            };
        }]
    };
});
