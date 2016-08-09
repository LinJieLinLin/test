if (!module) {
    var module = angular.module('RCP', []);
}
module.directive('getPassword', function() {
    return {
        template:'<section id="result" ng-keydown="keydown($event)"><div class="get-pass"><loader-ui show="!load.checkCode&&!load.updatePassword" style="padding:50px 0 0"></loader-ui><section ng-show="step==1&&!load.updatePassword"><div class="input" ng-class="{\'b-blue\':focus.account==1,\'b-red\':msg.account&&!focus.account}"><div class="r-icon"><i class="image-sso-phone"></i></div><input type="text" placeholder="请输入您绑定的手机号" id="account" maxlength="11" ng-model="data.account" ng-focus="checkFocus(\'account\')" ng-blur="checkBlur(data,\'account\')" autofocus><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.account&&!focus.account"><div ng-bind="msg.account"></div></div></div><div class="input input-code" ng-class="{\'b-blue\':focus.telCode==1,\'b-red\':msg.telCode&&!focus.telCode}"><div class="r-icon"><i class="image-sso-code"></i></div><input type="text" placeholder="请输入手机验证码" id="telCode" maxlength="10" ng-model="data.telCode" ng-focus="checkFocus(\'telCode\')" ng-blur="checkBlur(data,\'telCode\')" ng-mouseleave="check(data,\'telCode\')" autofocus><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.telCode&&!focus.telCode"><div ng-bind="msg.telCode"></div></div><button class="btn-code" ng-class="{\'send-code\':countTime<60&&countTime>0}" type="button" ng-mouseover="checkAccount()" ng-click="getCode()" ng-bind="codeMsg"></button></div><div class="input" ng-class="{\'b-blue\':focus.pwd==1,\'b-red\':msg.pwd&&!focus.pwd}"><div class="r-icon"><i class="image-sso-pwd"></i></div><input type="password" id="pwd" placeholder="6-20位字母、数字或符号" maxlength="20" ng-model="data.pwd" ng-focus="checkFocus(\'pwd\')" ng-blur="checkBlur(data,\'pwd\')" ng-keydown="passwordChange($event)"><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.pwd&&!focus.pwd"><div ng-bind="msg.pwd"></div></div></div><div class="input" ng-class="{\'b-blue\':focus.rePwd==1,\'b-red\':msg.rePwd&&!focus.rePwd}"><div class="r-icon"><i class="image-sso-pwd"></i></div><input type="password" id="rePwd" placeholder="请再次确认密码" maxlength="{{data.pwd.length||0}}" ng-model="data.rePwd" ng-focus="checkFocus(\'rePwd\')" ng-blur="checkBlur(data,\'rePwd\')"><div class="tip tip-err tip-right" ng-class="c.tip.class" ng-show="msg.rePwd&&!focus.rePwd"><div ng-bind="msg.rePwd"></div></div></div><button class="btn-1" ng-mouseover="check(data,\'rePwd\')" ng-click="updatePassword()" type="button">确认修改</button></section><section ng-show="step==2"><div class="no-tel"><img ng-src="{{imgs.faild}}" alt=""><div><img ng-src="{{imgs.closs}}" alt="">修改密码失败！</div><button class="btn-1 bg-1" ng-click="next()">返回上一步</button></div></section></div></section>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '='
        },
        controller: ['$scope', '$timeout', '$http', '$interval', 'service', function($scope, $timeout, $http, $interval, service) {
            //验证码倒计时
            var initTime = 60;
            $scope.countTime = +sessionStorage.codeCountTime || initTime;
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
            $scope.init = function() {
                $scope.readConfig('sso');
                if (ssoUrl[ssoUrl.length - 1] !== '/') {
                    ssoUrl += '/';
                }
                //记录倒计时
                if ($scope.countTime < initTime && $scope.countTime > 0) {
                    $scope.countCodeTime();
                }
                //初始化数据
                $scope.data = {
                    account: sessionStorage.account || '',
                    telCode: '',
                    pwd: '',
                    rePwd: '',
                };
                //正则
                $scope.regExp = {
                    account: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,50}$/,
                    email: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
                    tel: /^1[3|4|5|7|8][0-9]\d{8}$/,
                    number: /^[0-9]{1,10}$/,
                    id: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/
                };
                //第几步
                $scope.step = 1;
                //聊天用的导学老师
                $scope.guideTeacher = {};
                //请求URL
                $scope.requestUrl = {
                    updatePassword: ssoUrl + 'tlogin/api/resetPwd',
                    checkExist: ssoUrl + 'sso/api/exist',
                    getCode: ssoUrl + 'tlogin/api/sendMessage',
                };
                //错误信息
                $scope.msg = {};
                $scope.focus = {};
                //loading
                $scope.load = {};
                $scope.sendCodeText = '发送验证码';
                $scope.codeMsg = '获取验证码';
                // $scope.getGuideTeacher();
            };
            //请求
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
                //获取手机验证码
                getCode: function(params, filter) {
                    var option = {
                        method: 'POST',
                        url: $scope.requestUrl.getCode,
                        params: params
                    };
                    return service.request(angular.extend(option, filter || {}));
                },
                //修改密码
                updatePassword: function(params, filter) {
                    var option = {
                        method: 'GET',
                        url: $scope.requestUrl.updatePassword,
                        params: params
                    };
                    return service.request(angular.extend(option, filter || {}));
                }
            };
            //发送验证码
            $scope.getCode = function() {
                var msg = $scope.checkFunc.account($scope.data);
                if (msg !== 0) {
                    if (msg === -1) {
                        return;
                    }
                    service.dialog.alert(msg);
                    return;
                }
                if ($scope.countTime === initTime && $scope.codeMsg === '获取验证码') {
                    $scope.countCodeTime();
                }
                var data = {
                    mobile: $scope.data.account,
                    types: 'resetPwd',
                };
                $scope.req.getCode(data).then(function(rs) {
                    console.log(rs);
                    $('#telCode').focus();
                    $scope.checkFocus('telCode');
                }, function(e) {
                    $interval.cancel($scope.intervalTime);
                    $scope.countTime = initTime;
                    $scope.codeMsg = '获取验证码';
                    sessionStorage.codeCountTime = initTime;
                    try {
                        service.dialog.alert(e.data.data.msg || '请重试');
                    } catch (err) {
                        service.dialog.alert('请求失败！');
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
                    sessionStorage.codeCountTime = $scope.countTime;
                    if ($scope.countTime <= 0) {
                        $interval.cancel($scope.intervalTime);
                        $scope.countTime = initTime;
                        $scope.codeMsg = '获取验证码';
                        return;
                    }
                    $scope.codeMsg = '重发验证码(' + $scope.countTime + ')';
                }, 1000);
            };
            //检测用户名是否存在
            $scope.checkAccount = function() {
                var data = {
                    usrs: $scope.data.account
                };
                $scope.req.checkAccount(data, { option: { loading: false } }).then(function(rs) {
                    if (rs.data && rs.data[$scope.data.account] !== 1) {
                        $scope.msg.account = '用户名不存在';
                    }
                }, function(e) {
                    console.log(e);
                });
            };
            //修改密码
            $scope.updatePassword = function() {
                var msg = $scope.check($scope.data);
                if (msg !== 0) {
                    if (msg === -1) {
                        return;
                    }
                    service.dialog.alert(msg);
                    return;
                }
                var data = {
                    pwd: $scope.data.rePwd,
                    pcode: $scope.data.telCode,
                    phone: $scope.data.account,
                    // t: 1,//有1会自动登陆
                };
                $scope.load.updatePassword = true;
                $scope.req.updatePassword(data).then(function(rs) {
                    $scope.load.updatePassword = false;
                    service.dialog.alert('密码重置成功!');
                    $timeout(function() {
                        var temUrl = rcpAid.queryString('url');
                        location.href = rcpAid.getUrl('登录', {
                            url: temUrl
                        });
                    }, 2500);
                }, function(err) {
                    $scope.load.updatePassword = false;
                    if (err.type === 1) {
                        try {
                            if (err.data.data.msg) {
                                $scope.msg.telCode = err.data.data.msg;
                                service.dialog.alert(err.data.data.msg || '请重试');
                                return;
                            }
                        } catch (e) {
                            err.msg = '传入参数有误！';
                            service.dialog.alert(err.msg);
                            return;
                        }
                    }
                });
            };
            //检查参数
            $scope.checkFunc = {
                account: function(argData) {
                    try {
                        argData.account = $('#account').val();
                    } catch (e) {}
                    if (!argData.account) {
                        $scope.msg.account = '请输入您绑定的手机号';
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
                        argData.account = argData.account;
                        msg = '';
                    }
                    // if ($scope.regExp.account.test(argData.account)) {
                    //     msg = '';
                    // }
                    $scope.msg.account = msg;
                    if ($scope.msg.account) {
                        return -1;
                    }
                    if (!$scope.msg.account) {
                        $scope.checkAccount();
                        sessionStorage.account = argData.account;
                        return 0;
                    } else {
                        return -1;
                    }
                },
                telCode: function(argData) {
                    try {
                        argData.telCode = $('#telCode').val();
                    } catch (e) {}
                    if (!argData.telCode) {
                        $scope.msg.telCode = '请输入验证码';
                        return -1;
                    }
                    var msg = '请输入正确的验证码';
                    if ($scope.regExp.number.test(argData.telCode)) {
                        msg = '';
                    }

                    $scope.msg.telCode = msg;
                    if ($scope.msg.telCode) {
                        return -1;
                    }
                    if (!$scope.msg.telCode) {
                        localStorage.telCode = argData.telCode;
                        return 0;
                    } else {
                        return -1;
                    }
                },
                pwd: function(argData) {
                    if (!argData.pwd) {
                        $scope.msg.pwd = '请输入密码';
                        return -1;
                    }
                    if (argData.pwd.length < 6) {
                        $scope.msg.pwd = '密码至少6位';
                        return -1;
                    }
                    $scope.msg.pwd = '';
                    return 0;
                },
                rePwd: function(argData) {
                    if (argData.pwd !== argData.rePwd) {
                        $scope.msg.rePwd = '两次密码不一致！';
                        return -1;
                    }
                    $scope.msg.rePwd = '';
                    return 0;
                },
            };
            //检查全部
            $scope.check = function(argData, argType) {
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
                    if ($scope.msg.account) {
                        return -1;
                    }
                    for (var k in $scope.checkFunc) {
                        var temMsg = $scope.checkFunc[k](argData);
                        if (temMsg) {
                            return temMsg;
                        }
                    }
                    return 0;
                }
            };
            //离开时
            $scope.checkBlur = function(argData, argType) {
                $scope.focus = {};
                if (argType) {
                    $scope.msg[argType] = '';
                }
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
            //密码空格效验
            $scope.passwordChange = function($event) {
                if ($event.keyCode === 32) {
                    var msg = '密码不能包含空格,请重新输入!';
                    $scope.data.pwd = '';
                    service.dialog.alert(msg);
                }
            };
            //选中时
            $scope.checkFocus = function(argType) {
                $scope.focus[argType] = 1;
            };
            //回车检测
            $scope.keydown = function(event) {
                var e = event ? event : (window.event ? window.event : null);
                if (e.keyCode == 13) {
                    $scope.updatePassword();
                }
            };
            $scope.init();
        }]
    };
});
