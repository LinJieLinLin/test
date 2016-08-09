/**
 * Created by Zhongj on 2016/6/20.
 * 模块说明：处理重复请求
 */
module.factory('debounce', ['$timeout', '$q', function($timeout, $q) {
    return function(func, wait, immediate) {
        var timeout;
        var deferred = $q.defer();
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if(!immediate) {
                    deferred.resolve(func.apply(context, args));
                    deferred = $q.defer();
                }
            };
            var callNow = immediate && !timeout;
            if ( timeout ) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);
            if (callNow) {
                deferred.resolve(func.apply(context,args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
}]);

module.run(['service', 'debounce', function (service, debounce) {
    service.expand('debounce', function () {
        return debounce;
    });
}]);