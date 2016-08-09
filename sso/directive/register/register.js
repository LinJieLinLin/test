if (!module) {
    var module = angular.module('RCP', []);
}
module.directive('registerSso', function() {
    return {
        template:'<section class="register-sso" ng-keydown="keydown($event)"><div><form name="register"><label for="account"><div class="input-div" ng-class="{\'b-blue\':focus.account==1||(!msg.account&&rData.account),\'b-red\':msg.account&&!focus.account||(msg.account&&!focus.account)}"><div class="r-icon"><i class="image-sso-phone"></i></div><input type="text" placeholder="请输入手机号" id="account" maxlength="11" ng-model="rData.account" ng-focus="checkFocus(\'account\')" ng-blur="checkRegisterSso(rData,\'account\')" autofocus required><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.account&&!focus.account"><div ng-bind="msg.account"></div></div></div></label><label for="code"><div class="input-div input-code" ng-class="{\'b-blue\':focus.code==1||(!msg.code&&rData.code),\'b-red\':msg.code&&!focus.code||(msg.code&&!focus.code)}"><div class="r-icon"><i class="image-sso-code"></i></div><input type="text" placeholder="手机验证码" id="code" maxlength="20" ng-model="rData.code" ng-focus="checkFocus(\'code\')" ng-blur="checkRegisterSso(rData,\'code\')" ng-mouseleave="checkRegisterSso(data,\'code\')" required><div class="get-code"><button class="btn btn-code" ng-class="{\'send-code\':countTime<60&&countTime>0}" type="button" ng-mouseover="checkAccount()" ng-click="getCode()" ng-bind="codeMsg"></button></div><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.code&&!focus.code"><div ng-bind="msg.code"></div></div></div></label><label for="pwd"><div class="input-div" ng-class="{\'b-blue\':focus.password==1||(!msg.password&&rData.password.length>5),\'b-red\':msg.password&&!focus.password||(msg.password&&!focus.password)}"><div class="r-icon"><i class="image-sso-pwd"></i></div><div><input type="password" placeholder="6-20位字母、数字或符号" id="pwd" maxlength="20" ng-model="rData.password" ng-focus="checkFocus(\'password\')" ng-blur="checkRegisterSso(rData,\'password\')" ng-keydown="passwordChange($event)" required></div><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.password&&!focus.password"><div ng-bind="msg.password"></div></div></div></label><label for="repwd"><div class="input-div" ng-class="{\'b-blue\':focus.rePassword==1||(!msg.rePassword&&rData.rePassword.length>5),\'b-red\':msg.rePassword&&!focus.rePassword||(msg.rePassword&&!focus.rePassword)}"><div class="r-icon"><i class="image-sso-pwd"></i></div><input type="password" placeholder="请再次确认密码" id="repwd" maxlength="{{rData.password.length||0}}" ng-model="rData.rePassword" ng-focus="checkFocus(\'rePassword\')" ng-blur="checkRegisterSso(rData,\'rePassword\')" required><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.rePassword&&!focus.rePassword"><div ng-bind="msg.rePassword"></div></div></div></label></form><div class="agreement"><input type="checkbox" ng-model="rData.agree" id="agree" value="false"><label for="agree">我已阅读并同意</label><a href="agreement.html" target="_blank">《用户注册协议》</a></div><a class="btn btn-reg" id="login" ng-mouseover="checkRegisterSso(rData,\'rePassword\')" ng-click="registerSso()" ng-bind="registerText"></a></div></section>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '='
        },
        controller: ['$scope', '$timeout', '$http', '$rootScope', '$interval', 'service', function($scope, $timeout, $http, $rootScope, $interval, service) {

            var ssoUrl = 'http://localhost:7700/';
            $scope.rData = {};
            $scope.msg = {};
            $scope.focus = {};
            $scope.regExp = {
                account: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,50}$/,
                email: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
                tel: /^1[3|4|5|7|8][0-9]\d{8}$/,
                number: /^[0-9]{1,10}$/,
                id: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/
            };
            var initTime = 60;
            $scope.countTime = +sessionStorage.countTime || initTime;
            $scope.codeMsg = '获取验证码';

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
                if (c) {
                    ssoUrl = c.rUrl;
                }
            };
            //初始化
            $scope.init = function() {
                $scope.currentUser = $rootScope.currentUser;
                //判断是否登陆
                $scope.$on('login', function(rs, data) {
                    if (data.uid) {
                        $timeout(function() {
                            location.href = rcpAid.getUrl('登录', {
                                url: DYCONFIG.rcp.rUrl
                            });
                        }, 0);
                    }
                });
                $scope.readConfig('sso');
                if (ssoUrl[ssoUrl.length - 1] !== '/') {
                    ssoUrl += '/';
                }
                $scope.registerText = '立即注册';
                if (localStorage.rAccount) {
                    $scope.rData.account = localStorage.rAccount;
                }
                if ($scope.countTime < initTime && $scope.countTime > 0) {
                    $scope.countCodeTime();
                }
                $scope.requestUrl = {
                    register: ssoUrl + 'sso/api/create',
                    checkExist: ssoUrl + 'sso/api/exist',
                    getCode: ssoUrl + 'tlogin/api/sendMessage',
                    eg: ssoUrl + 'api'
                };
                $scope.req = {
                    //获取手机验证码
                    getCode: function(params, filter) {
                        var option = {
                            method: 'POST',
                            url: $scope.requestUrl.getCode,
                            params: params
                        };
                        return service.request(angular.extend(option, filter || {}));
                    },
                    //检查用户是否存在
                    checkAccount: function(params, filter) {
                        var option = {
                            method: 'GET',
                            url: $scope.requestUrl.checkExist,
                            params: params
                        };
                        return service.request(angular.extend(option, filter || {}));
                    },
                    //注册
                    registerSso: function(params, filter) {
                        var option = {
                            method: 'POST',
                            url: $scope.requestUrl.register,
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
                    $scope.registerSso();
                }
            };
            //选中时
            $scope.checkFocus = function(argType) {
                $scope.focus[argType] = 1;
            };
            //检测用户名是否存在
            $scope.checkAccount = function() {
                var data = {
                    usrs: $scope.rData.account
                };
                $scope.req.checkAccount(data, { option: { loading: false } }).then(function(rs) {
                    if (rs.data && rs.data[$scope.rData.account] === 1) {
                        $scope.msg.account = '用户名已存在';
                    }
                }, function(e) {
                    console.log(e);
                });
            };
            //检测用户数据
            $scope.checkFunc = {
                account: function(argData) {
                    try {
                        argData.account = $('#account').val();
                    } catch (e) {}
                    if (!argData.account) {
                        $scope.msg.account = '请输入手机号';
                        return -1;
                    }
                    if ($scope.msg.account) {
                        return -1;
                    }
                    var msg = '请输入正确的手机号';
                    // if ($scope.regExp.email.test(argData.account)) {
                    //     argData.email = argData.account;
                    //     msg = '';
                    // }
                    if ($scope.regExp.tel.test(argData.account)) {
                        argData.tel = argData.account;
                        msg = '';
                    }
                    // if ($scope.regExp.account.test(argData.account)) {
                    //     msg = '';
                    // }
                    $scope.msg.account = msg;
                    if (!$scope.msg.account) {
                        localStorage.rAccount = $scope.rData.account;
                        $scope.checkAccount();
                        return 0;
                    } else {
                        return -1;
                    }
                },
                code: function(argData) {
                    try {
                        argData.code = $('#code').val();
                    } catch (e) {}
                    if (!argData.code) {
                        $scope.msg.code = '请输入验证码';
                        return -1;
                    }
                    var msg = '请输入正确的验证码';
                    if ($scope.regExp.number.test(argData.code)) {
                        msg = '';
                    }

                    $scope.msg.code = msg;
                    if ($scope.msg.code) {
                        return -1;
                    }
                    if (!$scope.msg.code) {
                        // localStorage.code = argData.code;
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
                rePassword: function(argData) {
                    if (argData.password !== argData.rePassword) {
                        $scope.msg.rePassword = '两次密码不一致！';
                        return -1;
                    }
                    $scope.msg.rePassword = '';
                    return 0;
                },
                agree: function(argData) {
                    if (!argData.agree) {
                        $scope.msg.agree = '请先同意注册协议';
                        return $scope.msg.agree;
                    }
                    return 0;
                },
            };
            $scope.checkRegisterSso = function(argData, argType) {
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
                        var temMsg = $scope.checkFunc[k](argData);
                        if (temMsg) {
                            return temMsg;
                        }
                    }
                    return 0;
                }
            };
            //获取URL参数
            var getUrl = function(name) {
                var result = window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
                if (!result) {
                    return '';
                }
                return decodeURIComponent(result[1]);
            };
            //发送验证码
            $scope.getCode = function() {
                var msg = $scope.checkFunc.account($scope.rData);
                if (msg !== 0) {
                    if (msg === -1) {
                        return;
                    }
                    service.dialog.alert(msg);
                    return;
                }
                var data = {
                    usrs: $scope.rData.account
                };
                $scope.req.checkAccount(data, { option: { loading: false } }).then(function(rs) {
                    if (rs.data && rs.data[$scope.rData.account] === 1) {
                        $scope.msg.account = '用户名已存在';
                        return;
                    }
                    if ($scope.countTime === initTime && $scope.codeMsg === '获取验证码') {
                        $scope.countCodeTime();
                    }
                    var data = {
                        mobile: $scope.rData.account,
                        types: 'register',
                    };
                    return $scope.req.getCode(data);
                }, function(e) {
                    console.log(e);
                }).then(function(rs) {
                    console.log(rs);
                    $('#code').focus();
                    $scope.checkFocus('code');
                }, function(e) {
                    $interval.cancel($scope.intervalTime);
                    $scope.countTime = initTime;
                    $scope.codeMsg = '获取验证码';
                    sessionStorage.countTime = initTime;
                    try {
                        console.log(e.data);
                        // service.dialog.alert(e.data.data.msg || '请重试');
                    } catch (err) {
                        service.dialog.alert('请重试');
                    }
                });
            };
            //倒计时
            $scope.countCodeTime = function() {
                $interval.cancel($scope.intervalTime);
                $scope.countTime--;
                $scope.codeMsg = '重发验证码(' + $scope.countTime + ')';
                $scope.intervalTime = $interval(function() {
                    $scope.countTime--;
                    sessionStorage.countTime = $scope.countTime;
                    if ($scope.countTime <= 0) {
                        $interval.cancel($scope.intervalTime);
                        $scope.countTime = initTime;
                        $scope.codeMsg = '获取验证码';
                        return;
                    }
                    $scope.codeMsg = '重发验证码(' + $scope.countTime + ')';
                }, 1000);
            };
            //注册
            $scope.registerSso = function() {
                if ($scope.registerText !== '立即注册') {
                    return;
                }
                if ($scope.msg.account) {
                    return;
                }
                var msg = $scope.checkRegisterSso($scope.rData);
                if (msg !== 0) {
                    if (msg === -1) {
                        return;
                    }
                    service.dialog.alert(msg);
                    return;
                }
                if (!angular.isNumber(+$scope.rData.code)) {
                    msg = '验证码不正确';
                    service.dialog.alert(msg);
                    return;
                }
                var data = {
                    usr: [$scope.rData.account],
                    pwd: $scope.rData.password,
                    attrs: {
                        basic: {
                            email: $scope.rData.email || '',
                            phone: $scope.rData.tel || ''
                        }
                    },
                };
                $scope.registerText = '正在注册...';
                $scope.req.registerSso({ login: 1, pcode: $scope.rData.code, }, { data: angular.toJson(data) }).then(function(rs) {
                    if (!rs.data.token) {
                        rs.data.token = rs.msg;
                    }
                    $scope.registerText = '立即注册';
                    localStorage.account = $scope.rData.account;
                    localStorage.rAccount = '';
                    var url = getUrl('url');
                    var regExp = {
                        host: /[a-zA-z]+:\/\/[^\s\/]*/
                    };
                    if (!url) {
                        url = DYCONFIG.sso.my;
                    } else {
                        url = regExp.host.exec(url);
                    }
                    var userInfo = rs.data.usr;
                    // service.dialog.alert('您已成功注册!');
                    $timeout(function() {
                        location.href = url + '?token=' + rs.data.token;
                    }, 0);
                    return;
                }, function(e) {
                    $scope.registerText = '立即注册';
                    switch (e.data.data.code) {
                        case 1:
                            e.data.data.dmsg = '参数错误';
                            break;
                        case 5:
                            e.data.data.dmsg = '验证码不正确';
                            break;
                        case 3:
                            localStorage.rAccount = '';
                            e.data.data.dmsg = '用户已存在';
                            break;
                        default:
                            e.data.data.dmsg = '参数错误';
                            break;
                    }
                    if (e.data.data.code != 5) {
                        $scope.rData.password = '';
                        $scope.rData.rePassword = '';
                    }
                    try {
                        service.dialog.alert(e.data.data.dmsg || '请重试');
                    } catch (err) {
                        service.dialog.alert('请重试');
                    }
                });
            };
            //密码空格效验
            $scope.passwordChange = function($event) {
                if ($event.keyCode === 32) {
                    var msg = '密码不能包含空格,请重新输入!';
                    $scope.rData.password = '';
                    service.dialog.alert(msg);
                }
            };
            $scope.init();
        }]
    };
});
