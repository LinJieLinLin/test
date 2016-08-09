var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute',
    // 'ngSanitize',
    // 'LocalStorageModule',
]);
module.controller('registerCtrl', ['$scope', 'request', '$rootScope', function($scope, request, $rootScope) {
    
    //首页跳转
    $scope.url = {
        'kx': rcpAid.getUrl('酷校'),
        'akx': rcpAid.getUrl('爱科学')
    };

    //读取config
    var config = {};
    //初始化请求
    $scope.initUrl = function() {
        $scope.requestUrl = {
            checkLogin: config.rUrl + 'sso/api/uinfo',
            logout: config.rUrl + 'sso/api/logout',
            eg: config.rUrl + 'api'
        };
    };
    $scope.init = function() {
        config = ssoC.readConfig('sso');
        //头部文件的配置
        $scope.headerConfig = {
            rUrl: config.rUrl
        };
        //登陆注册directive的配置
        $scope.loginConfig = {
            rUrl: config.rUrl
        };
        $scope.registerConfig = {
            rUrl: config.rUrl
        };
        $scope.initUrl();
        $scope.checkLogin(UINFO);
    };
    $scope.checkLogin = function(argData) {
        var url = '';
        if (argData.uid) {
            console.log('login!');
            // if (location.pathname === '/sso/' || location.pathname === '/sso/index.html' || location.pathname === '/sso/register.html' || location.pathname === '/context.html') {
            if (location.pathname === '/sso/' || location.pathname === '/sso/index.html' || location.pathname === '/context.html') {
                url = ssoC.queryString('url');
                if (url === '') {
                    window.location.href = 'my.html?token=' + ssoC.getToken();
                    return;
                }
                var urlArr = url.split('#');
                url = urlArr[0];
                var hash = urlArr[1] ? '#' + urlArr[1] : '';
                if (url.match('^.*\\?.*$')) {
                    window.location.href = url + '&token=' + ssoC.getToken() + hash;
                } else {
                    window.location.href = url + '?token=' + ssoC.getToken() + hash;
                }
            }
        } else if (location.pathname === '/sso/my.html') {
            url = location.origin + location.pathname;
            ssoC.redirect(false, '登录', {
                url: encodeURIComponent(url)
            });
            return;
        }
    };
    $scope.logout = function() {
        var option = {
            method: 'GET',
            url: $scope.requestUrl.logout,
            params: {}
        };
        request(option).then(function(rs) {
            if (rs.data === 'OK') {
                ssoC.clearLocalStorage();
                location.href = '/sso';
                UINFO = {};
            }
        }, function(e) {
            console.log('logout error');
        });
    };
    $scope.init();
}]);
module.factory('request', ['$http', '$q', function($http, $q) {
    return function(option) {
        return $http(option).then(function(response) {
            var defer = $q.defer();
            if (angular.isUndefined(response.data.code)) {
                defer.reject({
                    type: -1,
                    data: response
                });
            } else if (response.data.code !== 0) {
                defer.reject({
                    type: 1,
                    data: response
                });
            } else {
                defer.resolve(response.data);
            }
            return defer.promise;
        }, function(err) {
            throw {
                type: -1,
                data: err
            };
        });
    };
}]);
