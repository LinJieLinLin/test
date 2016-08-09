var module = angular.module('RCP', []);
/**
 * @param  {[type]} win [处理console.*失效问题]
 * @return {[type]}     [description]
 */
if (!window.console) {
    window.console = {
        log: function() {},
        error: function() {},
        info: function() {},
        warn: function() {}
    };
}
module.controller('logoutCtrl', ['$scope', 'request', function($scope, request) {
    var config = { rUrl: '' };
    $scope.queryString = function(name) {
        var result = window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
        if (!result) {
            return '';
        }
        return decodeURIComponent(decodeURI(result[1]));
    };
    $scope.requestUrl = {
        logout: config.rUrl + '/sso/api/logout',
    };
    $scope.logout = function() {
        var option = {
            method: 'GET',
            url: $scope.requestUrl.logout,
            params: {}
        };
        request(option).then(function(rs) {
            console.log(rs);
            if (rs.data === 'OK') {
                location.href = $scope.queryString('url') || '/sso';
            }
        }, function(e) {
            console.log('logout error');
        });
    };
    $scope.logout();
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
