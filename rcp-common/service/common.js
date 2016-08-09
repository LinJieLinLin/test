module.factory('common', ['request', 'loginModal', function(request, loginModal) {
    try {
        var ssoUrl = DYCONFIG.sso.rUrl;
        var rs = {
            //获取用户信息
            uinfo: function(params, filter) {
                var option = {
                    method: 'GET',
                    url: ssoUrl + 'sso/api/uinfo',
                    params: params
                };
                return request(angular.extend(option, filter || {}));
            },
            /**
             * [toLogin 未登陆时的跳转]
             * @param  {[type]} argJump [description]
             * @return {[type]}         [description]
             */
            toLogin: function(argJump) {
                if (argJump) {
                    //跳转到登陆页
                    var url = rcpAid.getNoTokenUrl();
                    url = rcpAid.getUrl('登录', {
                        url: encodeURIComponent(url)
                    });
                    location.href = url;
                } else {
                    //弹出登陆界面
                    loginModal.show();
                }
            },
            /**
             * [checkLogin 新登陆判断]
             * @return {[type]} [description]
             */
            checkLogin: function(argSuCb, argErrCb, argJump) {
                var loginInfo = rcpAid.checkLogin();
                if (loginInfo) {
                    if (loginInfo.urlToken) {
                        var data = {
                            token: loginInfo.urlToken,
                            selector: 'bandc,role,org',
                        };
                        rs.uinfo(data).then(function(rs) {
                            rcpAid.isLogin = 1;
                            UINFO = rs.data;
                            if (typeof argSuCb === 'function') {
                                argSuCb(UINFO);
                            }
                        }, function(e) {
                            rcpAid.isLogin = 0;
                            if (typeof argErrCb === 'function') {
                                argErrCb(e);
                            } else {
                                rs.toLogin(argJump);
                            }
                        });
                        rcpAid.isLogin = 2;
                        return rcpAid.isLogin;
                    } else if (loginInfo.token) {
                        rcpAid.isLogin = 1;
                        if (typeof argSuCb === 'function') {
                            argSuCb(UINFO);
                        }
                    }
                } else {
                    rcpAid.isLogin = 0;
                    if (!argErrCb) {
                        rs.toLogin(argJump);
                    } else {
                        argErrCb('');
                    }
                }
                return rcpAid.isLogin;
            },
        };
        return rs;
    } catch (e) {
        console.log('error!', e);
    }
}]);

module.run(['service', 'common', function(service, common) {
    service.expand('common', function() {
        return common;
    });
}]);
