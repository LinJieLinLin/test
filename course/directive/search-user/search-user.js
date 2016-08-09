//export.searchUser 搜索到的用户
module.directive('searchUser', ['$timeout', '$window', '$rootScope', function ($timeout, $window, $rootScope) {
    return {
        template:'<div class="search-user"><style type="text/css">.search-user{display:inline-block;position:relative}.search-user>input{width:342px;height:26px;padding:0 25px 0 6px;border:1px solid #dadada}.search-user i.fa-search,.search-user>ul{position:absolute}.search-user i.fa-search{font-size:20px;top:4px;right:5px;color:#9e9e9e;cursor:pointer}.search-user>ul{max-height:250px;width:350px;overflow-y:scroll;overflow-x:hidden;border:1px solid #dadada;background:#fff}.search-user>ul>li{padding-left:6px;height:26px;line-height:26px;text-align:left;white-space:nowrap;word-wrap:normal;cursor:default}.search-user>ul>li:hover{background:#fcf2e4}.search-user>ul .text-blue{color:#02c0b9}</style><input type="text" ng-model="searchText" ng-focus="searchInput(searchText); searchTipsToggle(true);" placeholder="搜索"> <i class="fa fa-search" aria-hidden="true" ng-click="searchInput(searchText);"></i><ul ng-show="searchTipShow && searchList.length && searchText"><li ng-repeat="item in searchList" ng-click="searchSelect(item);" ng-bind-html="item.name | highlight:searchText:\'text-blue\'"></li></ul></div>',
        restrict: 'E',
        replate: true,
        transclude: true,
        scope: {
            export: '='
        },
        controller: ['$scope', 'ssoMethod', function ($scope, ssoMethod) {

            $scope.export = $scope.export || {};

            //当前登录用户的uid
            var curUserId = $rootScope.currentUser && $rootScope.currentUser.uid || '';

            $scope.export.searchUserReset = function () {
                $scope.searchText = '';
                $scope.searchTipShow = false;
                $scope.searchList = [];
                $scope.export.searchUser = null;
            };

            $scope.export.searchUserReset();

            //点击选择用户
            $scope.searchSelect = function (user) {
                $scope.searchText = user.name;
                $scope.export.searchUser = user;
                $scope.searchTipsToggle(false);
            };

            var searchRequest = {
                pn: 0,
                ps: 100,
                selector: 'basic',
                field: 'nick_name'
            };

            //用户数据缓存
            var userListCache = {};

            $scope.searchInput = function (text) {
                if (!text) {
                    $scope.searchTipsToggle(false);
                    $scope.export.searchUser = null;
                    $scope.searchList.length = 0;
                    return;
                }

                $scope.export.searchUser = userListCache[text];

                searchRequest.key = text;
                ssoMethod.searchUser(searchRequest).then(function (data) {
                    if ($scope.searchText != text) {
                        // console.log('cur text is diff with request text:', text, 'cur input text:', $scope.searchText);
                        return;
                    }
                    if (!data || !data.data) {
                        console.log('[error]', '搜索用户返回数据为空', data);
                        return;
                    }
                    $scope.searchList.length = 0;
                    if (data.data.total) {
                        var users = data.data.users || [];
                        var name, uid, d;
                        angular.forEach(users, function (v) {
                            uid = v.id || '';
                            name = v.attrs && v.attrs.basic && v.attrs.basic.nickName || '';
                            if (uid && name && uid !== curUserId) {
                                d = {
                                    uid: uid,
                                    name: name
                                };
                                $scope.searchList.push(d);
                                userListCache[d.name] = d;
                            }
                        });

                        $scope.export.searchUser = userListCache[text];
                    }
                }, function (err) {
                    console.log('[error]', '搜索用户失败，key:', text, 'error:', err);
                });
                $scope.searchTipsToggle(true);
            };

            $scope.searchTipsToggle = function (b) {
                if ($scope.searchTipShow == b) {
                    return;
                }
                $scope.searchTipShow = angular.isDefined(b) ? b : !$scope.searchTipShow;
                if ($scope.searchTipShow) {
                    angular.element($window.document).on('click', $scope.closeTipFn);
                }
            };
        }],
        link: function ($scope, $element) {
            function bindEvent() {
                $element.find('input').on('input', function (e) {
                    $scope.searchText = e.target.value || '';
                    $scope.searchInput($scope.searchText);
                });
            }
            bindEvent();

            $scope.closeTipFn = function (e) {
                var con = $element;
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $timeout(function () {
                        $scope.searchTipShow = false;
                    });
                    angular.element($window.document).off('click', $scope.closeTipFn);
                }
            };
        }
    }
}]);

module.filter('highlight', function () {
    return function (str, pattern, style) {
        if (!pattern) {
            return str;
        }
        return str.replace(new RegExp(pattern, 'g'), '<span class="' + style + '">' + pattern + '</span>');
    }
});