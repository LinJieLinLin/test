angular.module('RCP')
.factory('httpConfig', function () {
    return {
        // blackList: {
        //      loading: {
        //          url: false
        //      }
        // }
        blackList: {},
        filter: function (type, list, conf) {
            var self = this;
            self.blackList[type] = self.blackList[type] || {};
            if (angular.isString(list)) {
                self.blackList[type][list] = conf;
            } else if (angular.isArray(list)) {
                angular.forEach(list, function (url) {
                    self.blackList[type][url] = conf;
                });
            }
        }
    };
})
.run(['service', 'httpConfig', function (service, httpConfig) {
    service.expand('httpConfig', function () {
        return httpConfig;
    });
}]);