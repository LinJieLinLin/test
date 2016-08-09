/* globals g_conf */

module.factory('loginModal', ['dialog', function(dialog) {
    /* jshint camelcase:false */
    var conf = g_conf;
    var ssoLoginUrl = DYCONFIG.sso.loginDialog + '?url=' + encodeURIComponent(rcpAid.getNoTokenUrl());
    var str = [
        '<style>',
        '#login-window input{background-repeat:no-repeat;background-position:4px center;padding:7px 5px 3px 30px;border:1px solid #ccc;outline:none;margin:5px 0 20px;width:250px;display:block;}',
        '#login-window input:focus{border:1px solid #1093be;}',
        '#login-window button{display:block;width:100%;padding:0;line-height:30px;}',
        '#login-window .loading-circle::before{left:-3px;top:-3px;border: 3px solid rgba(0,0,0,.2);}',
        '#login-window .loading-circle::after{left:-3px;top:-3px;border:3px solid transparent;border-bottom-color:rgba(255,255,255,.9);}',
        '#login-window .inner{padding:0}',
        'button.btn-default{color:#fff;background-color:#02c4bd;border-color:#02c4bd;}',
        'button.btn{display:inline-block;padding:6px 6px;margin-bottom:0;font-size:14px;font-weight:400;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1px solid transparent;border-radius:4px;}',
        '.login-dialog{width:450px;height:340px;border:none;position: relative;}',
        '</style>',
        '<div class="win-wrap s-p-win" id="login-window">',
        '<div class="win-bd"></div>',
        '<div class="my-wrap jf-drag">',
        '<div class="my-main">',
        '<div class="win-hd">',
        '<i class="fa fa-times color-cyan f-r close-ic close" ></i><span class="color-cyan">登录</span>',
        '</div>',
        '<div class="inner">',
        '<iframe src="' + ssoLoginUrl + '" class="login-dialog"></iframe>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
    ].join('');
    //注意（IE Edge 模式检测不出来）
    function isIE(min, max) {
        var navAgent = window.navigator.userAgent.toLowerCase(),
            flag;
        if (navAgent.indexOf('msie') != -1) {
            var IE = navAgent.match(/msie\s([0-9]*)/);
            flag = (arguments.length === 0) ? IE[1] :
                (arguments.length == 1) ? (parseInt(IE[1]) == min) :
                (IE[1] >= min && IE[1] <= max) ? IE[1] : false;
        }
        return flag;
    }

    function changeURLPar(token) {
        var hash = window.location.hash;
        var search = window.location.search;
        var result;
        var arr = [];
        if (search) {
            var flag = false;
            search = search.substring(1);
            search.split('&').forEach(function(item) {
                var tmp = item.split('=');
                var name = tmp[0];
                var value = tmp[1];
                if (name === 'token') {
                    flag = true;
                    value = token;
                }
                arr.push(name + '=' + value);
            });
            if (!flag) {
                arr.push('token=' + token);
            }
            result = window.location.pathname + '?' + arr.join('&') + hash;
        } else {
            result = window.location.pathname + '?token=' + token + hash;
        }

        return result;
    }

    return {
        show: function() {
            var oLoginWin = $("#login-window");
            if (oLoginWin.length === 0) {
                $(document.body).append(str);
            }

            var oRegister = $('#register-button');
            var oSubmit = $('#login-button');
            var oName = $('#login-username');
            var oPassw = $('#login-password');
            var submitLock;

            function register() {
                location.href = rcpAid.getUrl('注册', {
                    url: encodeURIComponent(location.href)
                });
            }

            function checkForm() {
                var lock;
                if (!oName.val()) {
                    dialog.alert('用户名不能为空');
                    oName.focus();
                    lock = true;
                } else if (!oPassw.val()) {
                    dialog.alert('密码不能为空');
                    oPassw.focus();
                    lock = true;
                }
                return lock;
            }

            function submitFn() {
                if (checkForm() || submitLock) {
                    return;
                }
                submitLock = !submitLock;
                if (isIE(5, 9) <= 9) {
                    oSubmit.html('<span>登陆中...</span>');
                } else {
                    oSubmit.html('<span class="loading-circle loading-amit-spin" style="width:12px;height:12px;position:static;display:inline-block;margin:0;"></span>');
                }
                setTimeout(function() {
                    $.ajax({
                        url: 'http://' + conf.SSO + "/sso/api/login?time=" + new Date().getTime(),
                        data: {
                            usr: oName.val(),
                            pwd: oPassw.val()
                        },
                        dataType: 'json',
                        success: function(msg) {
                            //0表示用户已存在  1不存在
                            if (msg.code === 0) {
                                window.location.href = changeURLPar(msg.data.token);
                            } else {
                                oPassw.val('').focus();
                                dialog.alert(msg.msg);
                            }
                            oSubmit.html('登录');
                            submitLock = !submitLock;
                        },
                        error: function() {
                            oSubmit.html('登录');
                            submitLock = !submitLock;
                        }
                    });
                }, 200);
            }

            function keydownFn(ev) {
                if (ev.keyCode === 13) {
                    submitFn();
                }
            }

            oRegister.unbind('click').bind('click', register);
            oSubmit.unbind('click').bind('click', submitFn);
            oName.unbind('keydown').bind('keydown', keydownFn);
            oPassw.unbind('keydown').bind('keydown', keydownFn);

            $('#login-window').window({ mask: true });
        }
    };
}]);

module.run(['service', 'loginModal', function(service, loginModal) {
    service.expand('loginModal', function() {
        return loginModal;
    });
}]);
