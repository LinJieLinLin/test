angular.module('RCP')
.factory('event', function () {
    var slice = [].slice;
    return {
        list: {},
        on: function on (name, fn, context, once) {
            if (this.list[name] && this.list[name].length) {
                this.list[name].push({fn: fn, context: context || this, once: once});
            } else {
                this.list[name] = [{fn: fn, context: context || this, once: once}];
            }
            return this;
        },
        emit: function emit (name) {
            var arg = slice.call(arguments, 1);
            var _this = this;
            if (this.list[name] && this.list[name].length) {
                angular.forEach(this.list[name], function (item) {
                    if (item.once && item.called) {
                        return;
                    }
                    item.fn.apply(item.context, arg);
                    item.called = true;
                });
            }
            angular.forEach(this.list, function (item, n) {
                var arr = n.split('.');
                arr.pop();
                if (arr.join('.') === name) {
                    _this.emit(n);
                }
            });
        }
    };
})
.run(['service', 'event', function (service, event) {
    service.expand('event', function () {
        return event;
    });
}]);