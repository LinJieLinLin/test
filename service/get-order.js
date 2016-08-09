module.factory("orderService", ['request', function(request) {

    var urlRcp = '';

    return {

        /**
         * 获取订单列表/详情
         * @param params
         * @param filter
         * @returns {*}
         */
        getOrderList: function(params, filter) {

            var option = {
                method: 'GET',
                url: urlRcp + '/usr/order/order-list',
                params: params
            };

            return request(angular.extend(option, filter || {}));
        },

        /**
         * 取消订单
         * @param params
         * @param filter
         * @returns {*}
         */
        cancelOrder: function(params, filter) {

            var option = {
                method: 'GET',
                url: urlRcp + '/usr/order/cancel-order',
                params: params
            };

            return request(angular.extend(option, filter || {}));
        },

        /**
         *
         * @param params
         * @param filter
         * @returns {*}
         */
        checkOrder: function(params, filter) {

            var option = {
                method: 'GET',
                url: urlRcp + '/usr/order/check-order',
                params: params
            };

            return request(angular.extend(option, filter || {}));
        }
    };
}]);

module.run(['service', 'orderService', function(service, orderService) {
    service.expand('orderService', function() {
        return orderService;
    });
}]);