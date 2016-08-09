var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute'
]);
module.controller('applySpaceCtrl', ['$scope', '$timeout', '$window', 'service', 'ssoMethod', function ($scope, $timeout, $window, service, ssoMethod) {
    //当前认证步骤
    $scope.step = 0;
    //是否同意协议
    $scope.agree = false;
    //当前用户认证状态  1 审核中， 2 认证失败， 3 认证成功
    $scope.curStatus = -1;
    //认证信息加载完毕
    $scope.verifyLoaded = false;

    //正则判断
    //第二步下表单的正则匹配
    var regExp1 = {
        realName: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,50}$/,
        phone: /^1[34578]\d{9}$/,
        // idCardNo: /(^\d{15}$)|(^\d{17}[0-9Xx]$)/
        idCardNo: /(^[1-9][0-7]\d{4}\d{2}((0[1-9])|(1[012]))((0[1-9])|([12][0-9])|(3[012]))\d{3}$)|(^[1-9][0-7]\d{4}(19|2\d)\d{2}((0[1-9])|(1[012]))((0[1-9])|([12][0-9])|(3[012]))\d{3}[\dXx]$)/
    };
    //第三步下表单的正则匹配，只显示不输入，不需要正则匹配
    var regExp2 = {
        realName: /.*/,
        phone: /.*/,
        idCardNo: /.*/
    };

    $scope.regExp = regExp1;

    function initInput() {
        $('input[name=phone]').on('keypress', function (e) {
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            return (charCode >= 48 && charCode <= 57) || charCode == 8;
        });
        $('input[name=idCardNo]').on('keypress', function (e) {
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            return charCode >= 48 && charCode <= 57 || charCode == 88 || charCode == 120 || charCode == 8;
        });
    }
    initInput();

    //认证信息
    $scope.data = {
        realName: '',   //真名
        phone: '',  //认证手机
        idCardNo: '',  //身份证号码
        idCardFront: '',    //身份证正面url
        idCardBack: '' //身份证背面url
    };

    //认证状态提示信息
    var tips = {
        //未认证
        0: {
            icon: '',
            text: '',
            style: ''
        },
        //认证中
        1: {
            icon: 'fa-info-circle',
            text: '亲，我们在努力审核中...',
            style: 'shallow-blue'
        },
        //认证失败
        2: {
            icon: 'fa-times-circle-o',
            text: '抱歉，认证失败！',
            style: 'shallow-red'
        },
        //认证成功
        3: {
            icon: 'fa-check-circle-o',
            text: '恭喜您，认证成功！',
            style: 'shallow-green'
        }
    };

    //当前认证提示
    $scope.tips = tips[1];

    //是否开启本地缓存
    var isCache = true;

    //跳到指定步骤
    $scope.toStep = function (step) {
        if (step > 0 && !$scope.agree) {
            //未同意协议
            return;
        }
        if ($scope.step > 1 && step < 1) {
            return;
        }
        if ($scope.step > 1 && step < 2) {
            //从第三步跳到第一二步，输入框可输入
            $('.l-input-text input').attr('disabled', false);
        }

        $scope.step = !isNaN(step) ? step : $scope.step;

        if ($scope.step > 1) {
            $scope.regExp = regExp2;
        } else {
            $scope.regExp = regExp1;

        }

        if (isCache && $scope.step < 2) {
            //缓存当前步骤
            var ss = $window.sessionStorage;
            if (ss) {
                ss.setItem(prefix + 'step', $scope.step);
                ss.setItem(prefix + 'agree', $scope.agree ? 1 : 0);
            }
        }
    };

    //缓存字段前缀
    var prefix = 'cer_';

    //临时缓存表单
    $scope.saveData = function (field) {
        var ss = $window.sessionStorage;
        if (isCache && ss) {
            ss.setItem(prefix + field, $scope.data[field] || '');
        }
    };

    //发送的请求数据
    var reqData = {
        attrs: {
            certification: $scope.data
        }
    };

    //提交表单
    $scope.submitData = function () {
        if ($scope.u.$valid && $scope.data.idCardBack && $scope.data.idCardFront) {
            ssoMethod.updateUser(reqData).then(function () {
                isCache && $window.sessionStorage && $window.sessionStorage.clear();
                $window.location.reload();
            }, function () {
                service.dialog.alert('提交失败!');
            });
        }
    };

    function init() {
        //从本地缓存中恢复填写的数据
        var ss = $window.sessionStorage;
        if (isCache && ss) {
            $scope.agree = ss.getItem(prefix + 'agree') == '1';
            if ($scope.agree) {
                $scope.toStep(ss.getItem(prefix + 'step'));
            }
            $scope.data.realName || ($scope.data.realName = ss.getItem(prefix + 'realName') || '');
            $scope.data.phone || ($scope.data.phone = ss.getItem(prefix + 'phone') || '');
            $scope.data.idCardNo || ($scope.data.idCardNo = ss.getItem(prefix + 'idCardNo') || '');

            $scope.data.idCardFront || ($scope.data.idCardFront = ss.getItem(prefix + 'idCardFront') || '');
            $scope.data.idCardBack || ($scope.data.idCardBack = ss.getItem(prefix + 'idCardBack') || '');
        }
    }

    $scope.$on('login', function (rs, data) {
        if (!data) {
            //弹出登陆框
            // service.common.toLogin();
            //跳转到登陆页
            service.common.toLogin(true);
            return;
        }
        // $scope.step = 1;
        // return;

        var attrs = ssoMethod.getUserAttrs();
        console.log('实名认证', attrs.certification);

        var certification = attrs && attrs.certification;
        if (certification || data.certification) {
            var sd = $scope.data;
            sd.realName = certification.realName;
            sd.phone = certification.phone;
            sd.idCardNo = certification.idCardNo;
            sd.idCardFront = certification.idCardFront;
            sd.idCardBack = certification.idCardBack;

            //禁止输入框输入
            $('.l-input-text input').attr('disabled', true);

            //不同审核状态显示不同提示
            $scope.curStatus = certification.status;
            $scope.tips = tips[$scope.curStatus];
            if ($scope.curStatus == 2) {
                $scope.tips.reason = certification.reason;
            }

            $scope.step = 2;
            $scope.regExp = regExp2;
            $scope.agree = true;
            $scope.verifyLoaded = true;
            return;
        }

        function setPhoneAndInit(phone) {
            if (phone && typeof phone == 'string') {
                $scope.data.phone = phone;
                $('input[name=phone]').val($scope.data.phone);
            }
            init();
            $scope.verifyLoaded = true;
        }

        //获取绑定手机号
        ssoMethod.userInfo({
            selector: 'privated'
        }).then(function (phoneData) {
            if (!phoneData) {
                console.error('获取绑定手机号返回数据为空', phoneData);
            }
            console.log('绑定手机号', phoneData);
            if (phoneData.data && phoneData.data.usr && phoneData.data.usr.attrs && phoneData.data.usr.attrs.privated && phoneData.data.usr.attrs.privated.phone) {
                setPhoneAndInit(phoneData.data.usr.attrs.privated.phone);
                return;
            } else if (attrs && attrs.basic && attrs.basic.phone) {
                setPhoneAndInit(attrs.basic.phone);
                return;
            }
            setPhoneAndInit();
        }, function (err) {
            setPhoneAndInit(attrs && attrs.basic && attrs.basic.phone);
            console.error('获取绑定手机号错误', err);
        });
    });

    //上传配置
    $scope.uploadConfig = {
        showEdit: false,
        uploadNum: 0,     //上传图片位置
        upCancel: false,  //是否取消上传
        id: 'idcard',        //上传input ID
        width: 400,
        ratio: [16, 9],
        containerStyle: {width: '480px', height: '310px'},
        mode: 'fixed',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面 inline
        scope: null,        //返回$scope
        cb: function (data) {
        }
    };

    /**
     * 点击上传身份证
     */
    $scope.uploadIdCard = function (tag) {
        if ($scope.step > 1) {
            return;
        }
        $scope.uploadConfig.cb = function (data) {
            if (tag == 0) {
                //正面
                $scope.data.idCardFront = data;
            } else if (tag == 1) {
                //背面
                $scope.data.idCardBack = data;
            }

            //缓存图片
            var ss = $window.sessionStorage;
            if (isCache && ss) {
                ss.setItem(prefix + 'idCardFront', $scope.data.idCardFront);
                ss.setItem(prefix + 'idCardBack', $scope.data.idCardBack);
            }
        };
        $timeout(function () {
            if ($scope.uploadConfig.scope) {
                $scope.uploadConfig.scope.selectImg();
            }
        });
    };
}]);