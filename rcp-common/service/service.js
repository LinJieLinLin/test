/**
 * Created by FENGSB on 2015/8/24.
 */
if (!module) {
    var module = angular.module('RCP', []);
}
module.factory('service', function() {
    var factory = {
        expand: function(attr, fn) {
            this[attr] = fn();
        }
    };
    return factory;
});

module.run(['$timeout', 'service', function($timeout, service) {
    service.expand('mouseenter', function() {
        return function(item, callback, time) {
            $timeout.cancel(item.mLeaveTimer);
            item.mEnterTimer = $timeout(function() {
                item.mouseEnterLock = true;
                if (typeof callback === 'function') {
                    callback();
                }
            }, time || 100);
        };
    });
}]);

module.run(['$timeout', 'service', function($timeout, service) {
    service.expand('mouseleave', function() {
        return function(item, callback, time) {
            $timeout.cancel(item.mEnterTimer);
            item.mLeaveTimer = $timeout(function() {
                item.mouseEnterLock = false;
                if (typeof callback === 'function') {
                    callback();
                }
            }, time || 200);
        };
    });
}]);
