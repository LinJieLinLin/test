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
        '.login-dialog{width:450px;height:310px;border:none;position: relative;}',
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
    var pathnameList = DYCONFIG.noLoginPage || [];
    var pathname = location.pathname;
    return {
        show: function() {
            var oLoginWin = $("#login-window");
            if (oLoginWin.length === 0) {
                $(document.body).append(str);
                if ($.inArray(pathname, pathnameList) === -1) {
                    $('.fa.fa-times.color-cyan').unbind('click').bind('click', function() {
                        location.href = location.protocol + '//' + location.host + '/';
                    });
                }
            }
            var submitLock;
            $('#login-window').window({ mask: true });
        }
    };
}]);

module.run(['service', 'loginModal', function(service, loginModal) {
    service.expand('loginModal', function() {
        return loginModal;
    });
}]);
