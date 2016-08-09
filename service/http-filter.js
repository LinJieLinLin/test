(function () {
    var httpErrorMsg = {
        301: '您的登录已超时，请重新登录',
        307: '您的登录已超时，请重新登录',
        400: '请求失败：400 Bad request',
        401: '请求失败：401 Logon failed due to server configuration',
        403: '请求失败：403 Execute access forbidden',
        404: '请求失败：404 Not found',
        500: '服务器错误：500 Internal server error',
        502: '服务器错误：502 Bad gateway',
        503: '服务器错误：503 Service Unavailable',
        504: '服务器错误：504 Gateway Time-out',
        505: '服务器错误：505 HTTP Version notsupported'
    };
    function globalConfig (blackList, url) {
        var result = {};
        for (var i in blackList) {
            if (blackList.hasOwnProperty(i)) {
                for (var j in blackList[i]) {
                    if (blackList[i].hasOwnProperty(j)) {
                        var reg = new RegExp(j, 'ig');
                        if (reg.test(url)) {
                            result[i] = blackList[i][j];
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }
    module.factory('httpInterceptor', ['$q', '$log', '$rootScope', 'dialog', 'event', 'loginModal', 'httpConfig', 'progressBar', function($q, $log, $rootScope, dialog, event, loginModal, httpConfig, progressBar) {
        var responseInterceptor = {
            request: function(config) {
                var defaultOption = {          // 请求配置对象
                     loading: true,            // 是否显示 loading bar，当为 Object 时创建一个新的 progressBar 实例
                     requestErrorMsg: true,    // 是否显示请求失败的弹窗，如果是一个函数的话则执行回调。
                     loginError: 0,            // 当请求301的时候的操作，
                                               // 0: 表示无操作，
                                               // 1: 表示显示登陆超时的消息，
                                               // 2: 表示显示登陆框，
                                               // 3: 表示显示消息和登陆框。
                                               // function: 自定义回调
                     timestamp: false           // 是否加上时间戳以及host
                };
                config.option = angular.extend(defaultOption, config.option, globalConfig(httpConfig.blackList, config.url));

                config.uuid = new Date().getTime() + '-' + Math.floor(Math.random() * 10000);


                if (config.option.loading) {
                    if (angular.isObject(config.option.loading)) {
                        var p = progressBar.createInstance(config.option.loading);
                        p.start();
                        p.increase(true);
                        config.option.loading.instance = p;
                    } else {
                        event.emit('loading.start', {url: config.url, uuid: config.uuid});
                    }
                }
                if (config.option.timestamp) {
                    config.params.timestamp = new Date().getTime();
                }
                var windowLocationHost = window.location.host;

                if (windowLocationHost.indexOf('localhost') > -1) {
                    windowLocationHost = 'rcp.dev.gdy.io';
                }

                config.params = config.params || {};
                config.params.host = windowLocationHost;
                return config;
            },
            requestError: function(response) {
                if (response.config.option.loading) {
                    if (angular.isObject(response.config.option.loading) && response.config.option.loading.instance) {
                        response.config.option.loading.instance.end();
                    } else {
                        event.emit('loading.end', {url: response.config.url, uuid: response.config.uuid});
                    }
                }
                if (response.config.option.requestErrorMsg) {
                    if (typeof response.config.option.errorMsg === 'function') {
                        response.config.option.errorMsg.call(response);
                    } else {
                        dialog.alert(httpErrorMsg[response.status] || '请求失败！');
                    }
                }
                return $q.reject(response);
            },
            response: function(response) {
                if (response.config.option.loading) {
                    if (angular.isObject(response.config.option.loading) && response.config.option.loading.instance) {
                        response.config.option.loading.instance.end();
                    } else {
                        event.emit('loading.end', {url: response.config.url, uuid: response.config.uuid});
                    }
                }
                if (response.data && (response.data.code === 301)) {
                    switch (response.config.option.loginError) {
                        case 0:
                            break;
                        case 1:
                            loginModal.show();
                            break;
                        case 2:
                            loginModal.show();
                            break;
                        case 3:
                            dialog.confirm('登陆超时，请重新登陆', {mask: true, confirmTitle: '提示'}, function () {
                                loginModal.show();
                            });
                            break;
                        default:
                            if (typeof response.config.option.loginError === 'function') {
                                response.config.option.loginError.call(response);
                            }
                    }
                }

                return response;
            },
            responseError: function(response) {
                if (response.config.option.loading) {
                    if (angular.isObject(response.config.option.loading) && response.config.option.loading.instance) {
                        response.config.option.loading.instance.end();
                    } else {
                        event.emit('loading.end', {url: response.config.url, uuid: response.config.uuid});
                    }
                }
                if (response.config.option.requestErrorMsg) {
                    dialog.alert(httpErrorMsg[response.status] || '请求失败！请重试。');
                }
                return $q.reject(response);
            }
        };
        return responseInterceptor;
    }]);

    module.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);
})();