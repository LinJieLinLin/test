(function(win) {
    win.ssoC = (function() {
        if (win.ssoC) {
            return win.ssoC;
        }
        var Aid = function() {};
        var arr = [];
        var slice = arr.slice;
        Aid.fn = Aid.prototype;
        Aid.fn.queryString = function(name) {
            var result = window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
            if (!result) {
                return '';
            }
            return decodeURIComponent(decodeURI(result[1]));
        };

        Aid.fn.getToken = function() {
            return UINFO.token || this.queryString('token');
        };

        Aid.fn.getCookie = function(sName) {
            var aCookie = document.cookie.split('; ');
            for (var i = 0; i < aCookie.length; i += 1) {
                var aCrumb = aCookie[i].split('=');
                if (sName === aCrumb[0]) {
                    return unescape(aCrumb[1] || '');
                }
            }
            return null;
        };
        /**
         * 网站页面名称统一管理
         * @param  {String}  attr  是要拿的页面中文名称
         * @return {String}        返回实际页面名称
         */
        Aid.fn.getPage = function(attr) {
            if (typeof attr !== 'string') {
                return '';
            }
            var url = '';
            switch (attr) {
                case '登录':
                    url = '/sso/index.html';
                    break;
                case '退出':
                    url = '/logout';
                    break;
                case '注册':
                    url = '/sso/register.html';
                    break;
                case '个人中心':
                    url = '/sso/my.html';
                    break;
                case '审核页面':
                    url = '/sso/approve-detail.html';
                    break;
                case '审核列表':
                    url = '/sso/approve.html';
                    break;
            }
            return url;
        };
        /**
         * 获取链接，从配置里拿到页面名称把链接串起来
         * @param  {String}          attr   是要拿的页面中文名称
         * @param  {Object||String}  param  {Object}是地址GET的传参 ||  {String} 是用在地址的哈希值
         * @return {String}                 返回实际Url地址
         */
        Aid.fn.getUrl = function(attr, param) {
            var _this = win.ssoC;
            var url = _this.getPage(attr);
            var type = typeof param;
            switch (type) {
                case 'object':
                    url += '?' + $.param(param);
                    break;
                case 'string':
                    url += param;
                    break;
            }
            return url;
        };
        /**
         * 页面跳转函数，当页面需要新打开一个页面或者在当前页面切换到某个url时，可以使用这个函数。
         * @param  {Boolean} newWindow 是否在新窗口中打开。`true`则表示在新窗口中打开，反之亦然
         * @param  后面加上getUrl的两个参数使用
         */
        Aid.fn.redirect = function(newWindow) {
            var args = slice.call(arguments, 1);
            var url = this.getUrl.apply(this, args);
            if (newWindow) {
                window.open(url);
            } else {
                window.location = url;
            }
        };
        //插入js css
        Aid.fn.importHead = function(arr) {
            for (var i = 0; i < arr.length; i += 1) {
                var item = arr[i];
                switch (item.type) {
                    case 'script':
                        document.write('<script type="text/javascript" src="' + item.src + '"><\/script>');
                        break;
                    case 'link':
                        document.write('<link rel="stylesheet" href="' + item.href + '" />');
                        break;
                }
            }
        };
        //读取config
        Aid.fn.readConfig = function(argType) {
            var config = {};
            try {
                config = DYCONFIG[argType];
            } catch (e) {}
            if (config.rUrl && config.rUrl[config.rUrl.length - 1] !== '/') {
                config.rUrl += '/';
            }
            return config;
        };
        //注销时删除localStorage
        Aid.fn.clearLocalStorage = function() {
            localStorage.step = '';
            localStorage.applySpacePage = '';
        };
        Aid.fn.checkAdmin = function(argData) {
            try {
                if (argData.usr.attrs.role.type !== 'UCS_ADMIN') {
                    ssoC.redirect(false, '个人中心');
                }
            } catch (e) {
                ssoC.redirect(false, '个人中心');
            }
        };
        return new Aid();
    })();
})(window);
//全局增加css或JS
(function(doc) {
    function importHead(arr) {
        for (var i = 0; i < arr.length; i += 1) {
            var item = arr[i];
            switch (item.type) {
                case 'script':
                    doc.write('<script type="text/javascript" src="' + item.src + '"><\/script>');
                    break;
                case 'link':
                    doc.write('<link rel="stylesheet" href="' + item.href + '" />');
                    break;
            }
        }
    }
    var arr = [];
    var ssoUrl = DYCONFIG.sso.rUrl;
    arr.push({
        type: 'script',
        src: ssoUrl + 'sso/api/uinfo.js?user=1&selector=bandc'
    });
    importHead(arr);
})(document);
