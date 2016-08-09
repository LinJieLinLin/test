module.directive("spaceHead", function () {
    return {
        template:'<div class="space-head"><div class="head-info"><img ng-src="{{avatar}}" alt=""> <span class="title" ng-bind="headline"></span><div class="tips" ng-show="unReadNum > 0"><span class="separate"></span> <i class="image-unread-tips"></i><p class="text">温馨提示：当前您有<span ng-bind="unReadNum"></span>条未处理的消息！</p></div><div class="menu"><a href="/">酷校首页</a> <span class="separate"></span> <a class="logout" href="" ng-click="logout()">退出</a></div></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            headline: '@',
            avatar: '=',
            unReadNum: '='
        },
        controller: ['$scope', function ($scope) {
            $scope.logout = function () {
                var url = location.protocol + '//' + location.host;
                location.href = rcpAid.getUrl('退出', {
                    url: encodeURIComponent(url)
                });
            };
        }]
    }
});