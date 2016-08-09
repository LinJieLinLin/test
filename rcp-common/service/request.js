module.factory('request', ['$http', '$q', function ($http, $q) {
    // option.option = { // 请求配置对象
    //      loading: false,
    //      errorMsg: true,
    //      loginModal: false,
    //      timestamp: true
    // }
    return function (option) {
        return $http(option).then(function (response) {
            var defer = $q.defer();
            if(angular.isUndefined(response.data.code)){
                defer.reject({
                    type: -1,
                    data: response
                });
            }
            else if (response.data.code !== 0) {
                defer.reject({
                    type: 1,
                    data: response
                });
            } else {
                defer.resolve(response.data);
            }
            return defer.promise;
        }, function (err) {
            throw {
                type: -1,
                data: err
            };
        });
    };
}]);

module.run(['service', 'request', function (service, request) {
    service.expand('request', function () {
        return request;
    });
}]);