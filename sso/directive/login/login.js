if (!module) {
    var module = angular.module('RCP', []);
}
module.directive('loginSso', function() {
    return {
        template:'<section class="login-sso"><style type="text/css">.login-sso .btn-full,.login-sso i{display:inline-block}body{font-family:"Microsoft YaHei"}.login-sso{background-color:#fff;width:430px;height:258px}.login-sso .f-l{float:left}.login-sso .f-r{float:right}.login-sso .clear{clear:both}.login-sso div{position:relative}.login-sso .b-gray,.login-sso .input{border:1px solid #ccc}.login-sso .b-red{border:1px solid red}.login-sso .b-blue{border:1px solid #57a2d8}.login-sso .b-err,.login-sso .tip.tip-err-1{border:1px solid #ffb2b2}.login-sso .blue-c{color:#0095CE}.login-sso .fs-14{font-size:14px}.login-sso .f-gray{color:#cacaca}.login-sso .f-666{color:#666}.login-sso .input{height:40px;margin-top:10px;margin-bottom:30px;width:auto;box-shadow:none;border-radius:2px}.login-sso .input .l-icon{position:absolute;top:7px;left:12px}.login-sso .main{margin:0 auto;width:auto;padding:0 50px}.login-sso .main input{width:80%;height:30px;line-height:30px;font-size:15px;border:0;padding:0;position:absolute;left:42px;top:5px;box-shadow:none;outline:0}.login-sso .btn{background:#348df1;background:-moz-linear-gradient(left,#1e71ce,#389eed);background:-o-linear-gradient(left,#1e71ce,#389eed);background:linear-gradient(90deg,#1e71ce,#389eed);color:#fff;box-shadow:none;text-decoration:none;border-radius:3px;text-align:center;cursor:pointer}.login-sso .btn:hover{background:-moz-linear-gradient(left,#297bd6,#31a5f2);background:-o-linear-gradient(left,#297bd6,#31a5f2);background:linear-gradient(90deg,#297bd6,#31a5f2)}.login-sso .input-icon .icon-err,.login-sso .input-icon .icon-su{background-image:url(/sso/imgs/common_icon.png);background-repeat:no-repeat}.login-sso .btn-full{width:100%;height:45px;font-size:23px;line-height:45px}.login-sso .list{line-height:40px}.login-sso .tip{left:0;position:absolute;top:100%;height:85%;margin-left:-1px;width:100%;white-space:normal;z-index:10}.login-sso .tip span{position:absolute;top:50%;left:0;-webkit-transform:translate(0,-50%);-moz-transform:translate(0,-50%);-ms-transform:translate(0,-50%);-o-transform:translate(0,-50%);transform:translate(0,-50%)}.login-sso .tip.tip-top{left:0;top:-85%}.login-sso .tip.tip-right{left:103%;top:-1px;height:100%}.login-sso .tip.tip-bottom{left:0;top:100%}.login-sso .tip.tip-left{left:-103%;top:0;height:100%}.login-sso .input-icon,.login-sso .input-icon em{width:18px;height:18px;overflow:hidden;display:block}.login-sso .tip.tip-left span{left:initial;right:0}.login-sso .tip.tip-err,.login-sso .tip.tip-err-1{color:#f33}.login-sso .tip.tip-err-1{background-color:#fff2f2}.login-sso .input-icon{position:absolute;right:7px;top:5px;z-index:20}.login-sso .input-icon .icon-su{background-position:0 -1168px}.login-sso .input-icon .icon-err{background-position:0 -1209px}.login-dialog{width:100%;height:100%}.login-dialog .main{padding:3% 7%}.v-b{vertical-align:baseline}@media screen and (max-width:1240px){.login-sso{width:430px}.login-dialog{width:100%;height:100%}.login-dialog .main{padding:3% 7%}}</style><div class="main"><div><form name="login" ng-keydown="keydown($event)"><label for="account"><div><div class="f-l f-666">登录大洋通行证</div><div class="clear"></div></div><div class="input" ng-class="{\'b-blue\':focus.account==1||(!msg.account&&!focus.account),\'b-red\':msg.account&&!focus.account}"><div class="l-icon"><i class="image-sso-user"></i></div><input type="text" placeholder="请输入用户名/手机号" id="account" value="" maxlength="20" ng-model="lData.account" ng-focus="checkFocus(\'account\')" ng-blur="checkLoginSso(lData,\'account\')" autofocus required><div class="tip tip-err" ng-class="c.tip.class" ng-show="msg.account&&!focus.account"><span ng-bind="msg.account"></span></div></div></label><label for="pwd"><div class="input" ng-class="{\'b-blue\':focus.password==1||(!msg.password&&lData.password.length>5),\'b-red\':msg.password&&!focus.password}"><div class="l-icon"><i class="image-sso-pwd"></i></div><input type="password" placeholder="请输入密码" id="pwd" maxlength="20" ng-model="lData.password" ng-focus="checkFocus(\'password\')" ng-blur="checkLoginSso(lData,\'password\')" required><div class="tip tip-err" ng-class="c.tip.class" ng-show="msg.password&&!focus.password"><span ng-bind="msg.password"></span></div></div></label></form><div><a class="btn btn-full" id="login" ng-mouseover="checkLoginSso(lData,\'\')" ng-click="loginSso()" ng-bind="loginText"></a></div><div class="list"><a class="blue-c v-b f-l" href="javascript:;" id="register" ng-href="{{register()}}" target="_top">免费注册</a> <a class="blue-c f-r" id="find-password" ng-href="{{getPassword}}" target="_top">忘记密码?</a><div class="clean"></div></div></div></div></section>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '='
        },
        controller: ['$scope', '$timeout', '$http', '$element', 'service', function($scope, $timeout, $http, $element, service) {
            var ssoUrl = 'http://localhost:7700/';
            $scope.lData = {};
            $scope.msg = {};
            $scope.focus = {};
            $scope.regExp = {
                account: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,50}$/,
                email: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
                tel: /^1[3|4|5|7|8][0-9]\d{8}$/,
                id: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/
            };

            //读取config
            $scope.readConfig = function(argType) {
                var c = {};
                if ($scope.c) {
                    c = $scope.c;
                } else {
                    try {
                        c = DYCONFIG[argType];
                    } catch (e) {}
                }
                if (c.rUrl && c.rUrl[c.rUrl.length - 1] !== '/') {
                    c.rUrl += '/';
                }
                return c.rUrl;
            };
            //初始化
            $scope.init = function() {
                ssoUrl = $scope.readConfig('sso') || ssoUrl;
                $scope.loginText = '登录';
                var url = getUrl('url') || '';
                $scope.getPassword = DYCONFIG.rcp.rUrl + 'sso/' + 'get-password.html?url=' + url;
                //用户是否存在
                $scope.accountExist = true;
                if (localStorage.account) {
                    $scope.lData.account = localStorage.account;
                }
                $scope.requestUrl = {
                    login: ssoUrl + 'sso/api/login',
                    checkExist: ssoUrl + 'sso/api/exist',
                };
                $scope.req = {
                    //检查用户是否存在
                    checkAccount: function(params, filter) {
                        var option = {
                            method: 'GET',
                            url: $scope.requestUrl.checkExist,
                            params: params
                        };
                        return service.request(angular.extend(option, filter || {}));
                    },
                };
            };

            //回车检测
            $scope.keydown = function(event) {
                e = event ? event : (window.event ? window.event : null);
                if (e.keyCode == 13) {
                    $scope.loginSso();
                }
            };
            //选中时
            $scope.checkFocus = function(argType) {
                $scope.focus[argType] = 1;
            };
            //检测用户名是否存在
            $scope.checkAccount = function() {
                var data = {
                    usrs: $scope.lData.account
                };
                $scope.req.checkAccount(data, { option: { loading: false } }).then(function(rs) {
                    if (rs.data && rs.data[$scope.lData.account] != 1) {
                        $scope.msg.account = '用户不存在';
                        $scope.accountExist = false;
                    } else {
                        $scope.accountExist = true;
                    }
                }, function(e) {
                    console.log(e);
                });
            };
            //检测用户数据
            $scope.checkFunc = {
                account: function(argData) {
                    try {
                        if ($('#account').attr('placeholder') != $('#account').val()) {
                            argData.account = $('#account').val();
                        }
                    } catch (e) {}
                    if (!argData.account) {
                        $scope.msg.account = '请输入用户名/手机号';
                        return -1;
                    }
                    var msg = '请输入正确的用户名/手机号';
                    if ($scope.regExp.email.test(argData.account)) {
                        argData.email = argData.account;
                        msg = '';
                    }
                    if ($scope.regExp.tel.test(argData.account)) {
                        argData.tel = argData.account;
                        msg = '';
                    }
                    if ($scope.regExp.account.test(argData.account)) {
                        msg = '';
                    }
                    $scope.msg.account = msg;
                    if (!$scope.msg.account) {
                        localStorage.account = $scope.lData.account;
                        $scope.checkAccount();
                        return 0;
                    } else {
                        return -1;
                    }
                },
                password: function(argData) {
                    if (!argData.password) {
                        $scope.msg.password = '请输入密码';
                        return -1;
                    }
                    if (argData.password.length < 6) {
                        $scope.msg.password = '密码至少6位';
                        return -1;
                    }
                    $scope.msg.password = '';
                    return 0;
                },
            };
            //检查表单数据
            $scope.checkLoginSso = function(argData, argType) {
                $scope.focus = {};
                if (argType) {
                    $scope.msg[argType] = '';
                }
                var msg = '填写数据有误！';
                if (argType) {
                    try {
                        return $scope.checkFunc[argType](argData);
                    } catch (e) {
                        return 0;
                    }
                } else {
                    for (var k in $scope.checkFunc) {
                        if ($scope.checkFunc[k](argData)) {
                            return $scope.checkFunc[k](argData);
                        }
                    }
                    return 0;
                }
            };
            //获取URL参数
            var getUrl = function(name) {
                var result = location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
                if (!result) {
                    return '';
                }
                return decodeURIComponent(decodeURI(result[1]));
            };
            //注册
            $scope.register = function() {
                var url = getUrl('url');
                return 'register.html?url=' + url;
            };
            //登录
            $scope.loginSso = function() {
                if ($scope.loginText !== '登录') {
                    return;
                }
                //登录
                function loginFn() {
                    //显示提示
                    var msg = $scope.checkLoginSso($scope.lData);
                    if (msg === -1) {
                        return;
                    } else if (msg !== 0) {
                        service.dialog.alert(msg);
                        return;
                    }
                    var data = {
                        usr: $scope.lData.account,
                        pwd: $scope.lData.password
                    };
                    var option = {
                        method: 'GET',
                        url: $scope.requestUrl.login,
                        params: data
                    };
                    $scope.loginText = '正在登录...';
                    service.request(option).then(function(rs) {
                        $scope.loginText = '登录';
                        var url = getUrl('url');
                        var userInfo = rs.data.usr;
                        if (url === '') {
                            top.location.href = DYCONFIG.rcp.rUrl + 'sso/my.html?token=' + rs.data.token;
                            return;
                        }
                        if (url.match('/sso/register.html') || url.match('/sso/get-password.html')) {
                            url = DYCONFIG.rcp.rUrl;
                        }
                        var urlArr = url.split('#');
                        url = urlArr[0];
                        var hash = urlArr[1] ? '#' + urlArr[1] : '';
                        if (url.match('^.*\\?.*$')) {
                            top.location.href = url + '&token=' + rs.data.token + hash;
                        } else {
                            top.location.href = url + '?token=' + rs.data.token + hash;
                        }
                    }, function(e) {
                        $timeout(function() {
                            $scope.loginText = '登录';
                        }, 500);
                        try {
                            console.log(e);
                            service.dialog.alert('密码错误，请重试！');
                        } catch (err) {
                            service.dialog.alert('密码错误，请重试！');
                        }
                    });
                }
                //焦点在用户INPUT时
                if ($scope.focus.account) {
                    var data = {
                        usrs: $scope.lData.account
                    };
                    $scope.req.checkAccount(data, { option: { loading: false } }).then(function(rs) {
                        if (rs.data && rs.data[$scope.lData.account] != 1) {
                            $scope.msg.account = '用户不存在';
                            $scope.accountExist = false;
                            service.dialog.alert($scope.msg.account);
                        } else {
                            $scope.accountExist = true;
                            $('#pwd').focus();
                            loginFn();
                        }
                    }, function(e) {
                        console.log(e);
                    });
                } else {
                    if (!$scope.accountExist) {
                        msg = '用户不存在!';
                        return;
                    } else {
                        loginFn();
                    }
                }
            };
            $scope.init();
        }]
    };
});
