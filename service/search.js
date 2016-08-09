/**
 * 用于存放搜索相关的请求和方法
 */

module.factory('search', ['request', function (request) {
    var pesUrl = g_conf.pes.rUrl;
    return {
        /**
         * 搜索相关联的课程和tags 详见api https://api.gdy.io/#w_gdy_io_dyf_pes_pesapiSearchRelated
         * @param params
         * @param filter
         * @constructor
         */
        SearchRelated: function (params, filter) {
            var option = {
                method: 'GET',
                url: pesUrl + 'pub/api/SearchRelated',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        }
    }
}]);

module.run(['service', 'search', function (service, search) {
    service.expand('search', function () {
        return search;
    });
}]);
