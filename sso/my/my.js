var module = angular.module('RCP', [
    'ngCookies'
]);

module.controller('myCtr', ['$scope', '$window', '$timeout', '$interval', '$location', 'service', 'ssoMethod', function ($scope, $window, $timeout, $interval, $location, service, ssoMethod) {
    //============================ var =========================
    var phone = ''; //绑定的手机号码，完整版
    var verifyTime = 59;    //验证码等待时间
    var info = {};  //最开始的数据备份，用以确认哪项数据被修改过了

    $scope.loaded = false;
    $scope.userInfo = {};   //当前登录用户信息
    $scope.curBar = $location.path() == '/info' ? 0 : ($location.path() == '/account-setting' ? 1 : 0); //当前选中的tab
    $scope.phone = '';  //绑定的手机号码,中间若干位省略

    $scope.phoneReg = /^1[34578]\d{9}$/;    //手机号码格式
    $scope.passReg = /^.{6,15}$/;   //密码格式

    //顶部栏配置参数
    $scope.topSide = {
        kuxiaoHost: rcpAid.getUrl('酷校'),
        kuxiaoLogo: '/rcp-common/imgs/icon/kuxiao-logo-home.png',
        aikexueHost: rcpAid.getUrl('爱科学'),
        aikexueLogo: '/rcp-common/imgs/icon/aikexue-logo-home.png'
    };

    //显示的数据
    $scope.info = {
        avatar: '', //头像url
        desc: '',   //签名
        nickName: '',   //昵称
        gender: 2, //用户性别 0 女 1 男  2 保密
        country: '',    //国家
        province: '',   //省份
        city: '',   //城市
        hobby: []  //兴趣爱好
    };

    //绑定手机信息
    $scope.phoneInfo = {
        current: '',    //当前手机号
        fresh: '',   //新手机号
        verification: ''    //输入的验证码
    };

    //修改密码信息
    $scope.passInfo = {
        fresh: '',    //新密码
        verification: ''    //输入的验证码
    };

    //绑定手机验证码
    $scope.verifyPhone = {
        isTime: false,  //是否是倒计时时间
        time: verifyTime    //倒计时
    };

    //修改密码验证码
    $scope.verifyPass = {
        isTime: false,  //是否是倒计时时间
        time: verifyTime    //倒计时
    };

    //头像上传 上传配置
    $scope.uploadConfig = {
        showEdit: false,
        uploadNum: 0,     //上传图片位置
        upCancel: false,  //是否取消上传
        id: 'avatar',        //上传input ID
        width: 200,
        ratio: [1, 1],
        containerStyle: {width: '480px', height: '310px'},
        mode: 'fixed',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面
        scope: null,        //返回$scope
        cb: function (data) {
            if (data) {
                $scope.info.avatar = data;
            }
        }
    };

    //========================= function ===========================
    /**
     * 初始化个人资料到$scope.info,同时复制一份到info
     * @param attrs 后台返回的数据
     */
    function initInfo(attrs) {
        if (!attrs) {
            return;
        }
        var data = attrs.basic;
        if (data) {
            $scope.info.avatar = data.avatar;
            $scope.info.desc = data.desc;
            $scope.info.nickName = data.nickName;
            $scope.info.gender = data.gender;
        } else {
            console.error(attrs, "attrs have no field 'basic'");
        }
        data = attrs.extra;
        if (data) {
            $scope.info.country = data.country;
            $scope.info.province = data.province;
            $scope.info.city = data.city;
            $scope.info.hobby = data.hobby || [];
        } else {
            console.error(attrs, "attrs have no field 'extra'");
        }
        data = attrs.privated;
        if (data) {
            setPhone(data.phone || '');
        } else {
            console.error(attrs, "attrs have no field 'privated'");
        }

        angular.extend(info, $scope.info);
        info.hobby = [];
        angular.forEach($scope.info.hobby, function (v, i) {
            info.hobby[i] = v;
        })
    }

    /**
     * 根据用户改动的资料生成请求数据,没修改的数据不发给后台
     * @returns {*} 发给后台的数据
     */
    function createData() {
        var basic, extra;
        var scopeinfo = $scope.info;

        info.avatar !== scopeinfo.avatar && (basic || (basic = {})) && (basic.avatar = scopeinfo.avatar);
        info.desc !== scopeinfo.desc && (basic || (basic = {})) && (basic.desc = scopeinfo.desc);
        info.nickName !== scopeinfo.nickName && (basic || (basic = {})) && (basic.nickName = scopeinfo.nickName);
        info.gender !== scopeinfo.gender && (basic || (basic = {})) && (basic.gender = scopeinfo.gender);

        info.country !== scopeinfo.country && (extra || (extra = {})) && (extra.country = scopeinfo.country);
        info.province !== scopeinfo.province && (extra || (extra = {})) && (extra.province = scopeinfo.province);
        info.city !== scopeinfo.city && (extra || (extra = {})) && (extra.city = scopeinfo.city);
        angular.equals(info.hobby, scopeinfo.hobby) && (extra || (extra = {})) && (extra.hobby = scopeinfo.hobby);
        extra.hobby && !extra.hobby.length && (extra.hobby = undefined);

        var reqData = {
            attrs: {}
        };
        var hadData = false;
        basic && (hadData = true) && (reqData.attrs.basic = basic);
        extra && (hadData = true) && (reqData.attrs.extra = extra);

        return hadData ? reqData : null;
    }

    /**
     * 设置手机号，中间4位省略
     * @param num   屏蔽
     */
    function setPhone(num) {
        if (!num) {
            $scope.phone = '';
            phone = '';
            return;
        }
        $scope.phone = num.substr(0, 4) + '****' + num.substr(num.length - 3, num.length);
        phone = num;
    }

    //========================== scope function ===================
    /**
     * 选项点击回调，切换页面
     * @param tag   0 个人资料，1 个人设置
     */
    $scope.selectBar = function (tag) {
        $scope.curBar = tag;
        tag == 0 ? $location.path('info') : $location.path('account-setting');
    };

    /**
     * 确认修改，发送修改信息给后台
     */
    $scope.saveInfo = function () {
        $scope.info.nickName = $scope.info.nickName && $scope.info.nickName.replace(/\s/g, '') || '';
        if(!$scope.info.nickName){
            service.dialog.alert('昵称不能为空！');
            return;
        }
        var data = createData();
        console.log('req data ', data);
        if (data) {
            ssoMethod.updateUser(data).then(function (data) {
                if (!data) {
                    console.error('修改信息请求返回数据为空', data);
                    service.dialog.alert('修改失败');
                    return;
                }
                $window.location.reload();
            }, function (err) {
                service.dialog.showErrorTip(err, {
                    moduleName: '个人中心',
                    funcName: '$scope.saveInfo',
                    text: '修改个人信息失败'
                });
            })
        }
    };

    /**
     * 上传头像点击回调，弹出图片选择框
     */
    $scope.uploadAvatar = function () {
        $timeout(function () {
            if ($scope.uploadConfig.scope) {
                $scope.uploadConfig.scope.selectImg();
            }
        });
    };

    /**
     * 点击验证码按钮回调，发送验证码
     * @param tag   0 绑定手机，1 修改密码
     */
    $scope.verify = function (tag) {
        if (tag == 0 && (!$scope.phoneInfo.fresh || $scope.phoneForm.freshPhone.$error.pattern)) {
            $scope.freshPhoneInput = -1;
            return;
        }
        if (tag != 0 && !$scope.phone) {
            //发送修改密码验证码时，当前未绑定手机，不发送
            return;
        }

        var verify = tag == 0 ? $scope.verifyPhone : $scope.verifyPass;
        if (verify.isTime) {
            return;
        }

        var data = {
            mobile: tag == 0 ? $scope.phoneInfo.fresh : phone,
            types: tag == 0 ? ($scope.phone ? 'modifyBind' : 'bind') : 'resetPwd'
        };
        ssoMethod.sendMessage(data).then(function (data) {
            if (!data) {
                console.error('验证码发送请求返回数据为空', data);
                service.dialog.alert('验证码发送失败');
                return;
            }
            verify.isTime = true;
            var stop = $interval(function () {
                verify.time--;
                if (verify.time < 1 || !verify.isTime) {
                    verify.isTime = false;
                    verify.time = verifyTime;
                    $interval.cancel(stop);
                }
            }, 1000);
        }, function (err) {
            var code = err.data.data && err.data.data.code;

            if (code == 2) {
                service.dialog.alert('手机号码错误，验证码发送失败');
            } else if (code == 3) {
                service.dialog.alert('该手机已经绑定');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '个人中心',
                    funcName: '$scope.verify',
                    text: '验证码发送失败'
                });
            }
        });
    };

    /**
     * 绑定手机 确认修改
     */
    $scope.bindPhone = function () {
        if ($scope.phone && (!$scope.phoneInfo.current || $scope.phoneForm.curPhone.$error.pattern)) {
            $scope.curPhoneInput = -1;
            return;
        }
        if (!$scope.phoneInfo.fresh || $scope.phoneForm.freshPhone.$error.pattern) {
            $scope.freshPhoneInput = -1;
            return;
        }
        if (!$scope.phoneInfo.verification) {
            $scope.verifyPhoneInput = -1;
            return;
        }
        if ($scope.phone && phone != $scope.phoneInfo.current) {
            $timeout(function () {
                service.dialog.alert('原手机号码错误');
            }, 500);
            return;
        }
        var fresh = $scope.phoneInfo.fresh;
        if ($scope.phone && fresh == $scope.phoneInfo.current) {
            $timeout(function () {
                service.dialog.alert('新手机号码不能和当前手机号码相同');
            }, 500);
            return;
        }
        ssoMethod.bindPhone({
            pcode: $scope.phoneInfo.verification,
            phone: $scope.phoneInfo.fresh,
            phoneOld: $scope.phone ? $scope.phoneInfo.current : undefined,
            t: $scope.phone ? 'Change' : 'Bind'
        }).then(function (data) {
            if (!data) {
                console.error('绑定手机请求返回数据为空', data);
                service.dialog.alert('绑定失败');
                return;
            }
            service.dialog.alert('绑定成功！');
            setPhone(fresh);
            $scope.cancel(0);
            // $window.location.reload();
        }, function (err) {
            var code = err.data.data && err.data.data.code;

            if (code == 2) {
                service.dialog.alert('手机号码有误,绑定失败');
            } else if (code == 9 || code == 1 || code == 5) {
                service.dialog.alert('验证码错误');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '个人中心',
                    funcName: '$scope.bindPhone',
                    text: '绑定手机失败'
                });
            }
        })
    };

    /**
     * 修改密码 确认修改
     */
    $scope.resetPass = function () {
        if (!$scope.phone) {
            return;
        }
        if (!$scope.passInfo.verification) {
            $scope.verifyPassInput = -1;
            return;
        }
        if (!$scope.passInfo.fresh || $scope.passForm.freshPass.$error.pattern) {
            $scope.freshPassInput = -1;
            return;
        }
        ssoMethod.resetPassword({
            pcode: $scope.passInfo.verification,
            phone: phone,
            pwd: $scope.passInfo.fresh
        }).then(function (data) {
            if (!data) {
                console.error('重置密码请求返回数据为空', data);
                service.dialog.alert('修改失败');
                return;
            }
            service.dialog.alert('修改成功！');
            $scope.cancel(1);
            // $window.location.reload();
        }, function (err) {
            var code = err.data.data && err.data.data.code;
            if (code == 9 || code == 1 || code == 5) {
                service.dialog.alert('验证码错误');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '个人中心',
                    funcName: '$scope.saveInfo',
                    text: '修改个人信息失败'
                });
            }
        });
    };

    /**
     * 显示对应的表单
     * @param tag   0 绑定手机，1 修改密码
     */
    $scope.showForm = function (tag) {
        if (tag == 0) {
            $scope.showPhoneForm = !$scope.showPhoneForm;
            !$scope.showPhoneForm && $scope.cancel(0);
        } else {
            $scope.showPassForm = !$scope.showPassForm;
            !$scope.showPassForm && $scope.cancel(1);
        }
    };

    /**
     * 取消按钮点击回调，清除表单数据
     * @param tag   0 绑定手机，1 修改密码
     */
    $scope.cancel = function (tag) {
        var info = tag == 0 ? $scope.phoneInfo : $scope.passInfo;
        info.current = '';
        info.fresh = '';
        info.verification = '';

        tag == 0 ? ($scope.showPhoneForm = false) : ($scope.showPassForm = false);
        tag == 0 ? ($scope.verifyPhone.isTime = false) : ($scope.verifyPass.isTime = false);

        if (tag == 0) {
            $scope.curPhoneInput = $scope.freshPhoneInput = $scope.verifyPhoneInput = 0;
        } else {
            $scope.verifyPassInput = $scope.freshPassInput = 0;
        }
    };

    //========================= init =============================
    $scope.$on('login', function (rs, data) {
        if (!data) {
            //弹出登陆框
            // service.common.toLogin();
            //跳转到登陆页
            service.common.toLogin(true);
            return;
        }
        $scope.$parent.userInfo = data;
        //左栏用户信息
        $('.loading').removeClass('loading');
    });

    //获取个人资料
    ssoMethod.userInfo({
        selector: 'basic,extra,privated'
    }).then(function (data) {
        if (!data && !data.data && !data.data.usr && !data.data.usr.attrs) {
            console.error('response data have no \'attrs\' field', 'data:', data);
            service.dialog.alert('个人资料获取失败');
            return;
        }
        console.log('个人资料获', data.data.usr.attrs);
        initInfo(data.data.usr.attrs);
        $scope.info.avatar = $scope.info.avatar || '../rcp-common/imgs/face/d-face-1.png';
        $scope.info.desc = $scope.info.desc || '这家伙很懒，什么也没留下';

        $scope.loaded = true;
    }, function (err) {
        service.dialog.showErrorTip(err, {
            moduleName: '个人中心',
            funcName: 'ssoMethod.userInfo',
            text: '获取个人资料失败'
        });
    });
}]);