/**
*c={
*msg:提示语，默认显示暂无数据
*boxStyle:主样式
*imgStyle：图片样式
*theme: 无数据的主题(0,1)
*}
* 
 */
if (!module) {
    var module = angular.module('RCP', []);
}
module.directive("emptyTip", function() {
    return {
        template:'<div class="empty-tip" ng-style="boxStyle"><style type="text/css">.empty-tip{text-align:center;padding:30px 0}.empty-tip .msg{padding:10px 0 0;color:#999}.empty-tip .img{width:100%}</style><div ng-show="theme==1"><img src="/rcp-common/imgs/common/no-data.png" class="img" ng-style="imgStyle"></div><div ng-show="!theme"><img src="/rcp-common/imgs/common/icon-cloud.png" ng-style="imgStyle"></div><div ng-show="!theme" class="msg"><span ng-hide="showLogin">{{msg}}</span> <a href="" style="color:#00f" ng-show="showLogin">请先登录</a></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            c: "=",
        },
        controller: ['$scope', 'service', function($scope, service) {
            $scope.msg = '暂无数据';
            if ($scope.c) {
                angular.forEach($scope.c, function(v, k) {
                    $scope[k] = v;
                });
            }
            if ($scope.msg === '请先登录') {
                $scope.showLogin = true;
                $scope.dialog = function(msg) {
                    service.dialog.alert(msg);
                };
            }
        }]
    };
});
