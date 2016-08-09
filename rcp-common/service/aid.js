(function(win) {
    win.rcpAid = (function() {
        if (win.rcpAid) {
            return win.rcpAid;
        }
        var Aid = function() {};
        var arr = [];
        var slice = arr.slice;
        Aid.fn = Aid.prototype;
        Aid.fn.isLogin = 0;
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
            var index = DYCONFIG.rcp.rUrl;
            switch (attr) {
                case '酷校':
                    url = DYCONFIG.host.kuxiao;
                    break;
                case '酷校高校版':
                    url = DYCONFIG.host.gzmooc;
                    break;
                case '爱科学':
                    url = DYCONFIG.host.aikexue;
                    break;
                case '首页':
                    url = index;
                    break;
                case '登录':
                    url = DYCONFIG.sso.login;
                    break;
                case '退出':
                    url = DYCONFIG.sso.logout;
                    break;
                case '注册':
                    url = DYCONFIG.sso.register;
                    break;
                case '搜索':
                    url = index + 'search.html';
                    break;
                case '分类':
                    url = '/search.html';
                    break;
                case '个人设置':
                    url = DYCONFIG.sso.my;
                    break;
                case '学习中心':
                    url = '/space/student-space.html';
                    break;
                case '教学中心':
                    url = '/space/teacher-space.html';
                    break;
                case '助学中心':
                    url = '/guidance-space.html';
                    break;
                case '老师认证':
                    url = '/sso/apply-space.html';
                    break;
                case '实名认证':
                    url = '/sso/apply-space.html';
                    break;
                case '家长空间':
                    url = '/parentSpace.html';
                    break;
                case '班级空间':
                    url = '/classSpace.html';
                    break;
                case '学校空间':
                    url = '/schoolSpace.html';
                    break;
                case '机构空间':
                    url = '/organizationSpace.html';
                    break;
                case '用户管理':
                    url = '/userManager.html';
                    break;
                case '审核管理':
                    url = '/sso/management-center.html';
                    break;
                case '课程详情':
                    url = '/course/course-detail.html';
                    break;
                case '题库详情':
                    url = '/course/course-detail.html';
                    break;
                case '创建课程':
                    url = '/course/course-edit.html';
                    break;
                case '创建题库':
                    url = '/course/course-edit.html';
                    break;
                case '人员管理':
                    url = '/sso/management-center.html';
                    break;
                case '学习页':
                    url = '/course/pc-course-learning.html';
                    break;
                case '圈子详情':
                    url = '/study-circle/study-circle-detail.html';
                    break;
                case '全部圈子':
                    url = '/study-circle/study-circle-total.html';
                    break;
                case '做题页':
                    url = '/course/exam.html';
                    break;
                case '解析页':
                    url = '/course/exam-resolve-view.html';
                    break;
                case '批改页':
                    url = '/course/exam-correcting.html';
                    break;
                case '管理中心':
                    url = DYCONFIG.sso.manage;
                    break;
                case '我要吐槽':
                    url = '/discuss-page.html';
                    break;
                case '吐槽帖子详情':
                    url = '/discuss-detail.html';
                    break;
                case '课程评价':
                    url = '/assessment-detail.html';
                    break;
                case '学习痕迹':
                    url = '/course/learning-record.html';
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
            var _this = win.rcpAid;
            var url = _this.getPage(attr);
            var type = typeof param;
            switch (type) {
                case 'object':
                    url += '?';
                    _this.each(param, function(value, key) {
                        url += key + '=' + (value || '') + '&';
                    });
                    url = url.substring(0, url.length - 1);
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
        // Aid.fn.redirect = function(newWindow) {
        //     var args = slice.call(arguments, 1);
        //     var url = this.getUrl.apply(this, args);
        //     if (newWindow) {
        //         window.open(url);
        //     } else {
        //         window.location = url;
        //     }
        // };


        /**
         * css3常用函数
         * @return object
         */
        Aid.fn.css3 = (function() {
            var factory = {
                check: function() {
                    var _this = win.rcpAid;
                    var div = document.createElement('div');
                    var vendors = ('webkitTransition mozAnimation oAnimation msAnimation animation').split(' ');
                    var flag = false;
                    _this.each(vendors, function(value) {
                        if (value in div.style) {
                            flag = true;
                        }
                    });
                    return flag;
                },
                callBack: function(e, type, callback) {
                    var _this = win.rcpAid;

                    function handler() {
                        if (typeof callback === 'function') {
                            callback();
                        }
                        _this.each(type, function(value) {
                            e.addEventListener(value, handler, false);
                            e.removeEventListener(value, handler, false);
                        });
                    }
                    _this.each(type, function(value) {
                        e.addEventListener(value, handler, false);
                    });
                },
                animatedEnd: function(e, callback) {
                    this.callBack(e, ['webkitAnimationEnd', 'mozAnimationEnd', 'MSAnimationEnd', 'oanimationend', 'animationend'], callback);
                },
                transitionEnd: function(e, callback) {
                    this.callBack(e, ['webkitTransitionEnd', 'mozTransitionEnd', 'MSTransitionEnd', 'otransitionend', 'transitionend'], callback);
                },
                css3Animate: function(e, css3Class, callback) {
                    if (this.check()) {
                        $(e).addClass(css3Class);
                        this.animatedEnd(e, function() {
                            $(e).removeClass(css3Class);
                            if (typeof callback === 'function') {
                                callback.call(e);
                            }
                        });
                    } else {
                        if (typeof callback === 'function') {
                            callback.call(e);
                        }
                    }
                }
            };
            return factory;
        })();

        /**
         * 遍历array、json
         * @param  {object}    object
         * @param  {Function}  callback  回调函数(value,key)
         */
        Aid.fn.each = function(object, callback) {
            if (typeof object !== 'object') {
                return;
            }
            for (var member in object) {
                if (!object.hasOwnProperty(member)) {
                    continue;
                }
                if (typeof callback === 'function') {
                    callback(object[member], member);
                }
            }
        };
        /**
         * [queryString 获取URL参数]
         * @param  {[type]} name [参数名]
         * @return {[type]}      [值]
         */
        Aid.fn.queryString = function(name) {
            var result = window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
            if (!result) {
                return '';
            }
            return decodeURIComponent(result[1]);
        };
        /**
         * [getToken 获取token]
         * @return {[type]} [description]
         */
        Aid.fn.getToken = function() {
            return this.getCookie('token') || this.queryString('token');
        };
        Aid.fn.getCookie = function(sName) {
            try {
                return UINFO.token;
            } catch (e) {
                var aCookie = document.cookie.split('; ');
                for (var i = 0; i < aCookie.length; i += 1) {
                    var aCrumb = aCookie[i].split('=');
                    if (sName === aCrumb[0]) {
                        return unescape(aCrumb[1] || '');
                    }
                }
            }
        };
        /**
         * [loginStatus 获取登陆状态MOBILE页面用]
         * @return {[type]} [返回登陆用户token或URL中的token，移动端页面登陆用]
         */
        Aid.fn.loginStatus = function() {
            return this.getToken('token');
        };
        /**
         * [checkLogin 检查用户是否登陆]
         * @return {[type]} [未登陆返回false，已登陆返回用户信息]
         */
        Aid.fn.checkLogin = function() {
            try {
                console.log(UINFO);
                if (!UINFO.uid) {
                    var token = this.queryString('token');
                    if (token) {
                        return { urlToken: token };
                    }
                    return 0;
                }
                return UINFO;
            } catch (e) {
                UINFO = {};
                if (this.queryString('token')) {
                    console.log('urlToken');
                    return { urlToken: this.queryString('token') };
                }
                console.log('读取用户信息出错！');
                return 0;
            }
        };
        /**
         * [countTime 秒或纳秒转换]
         * @param  {[type]} sec  [纳秒]
         * @param  {[type]} type [不传参数为纳秒，'s'为秒]
         * @param  {[type]} lang [默认显示中文，传'en'显示英文]
         * @return {[type]}      [description]
         */
        Aid.fn.countTime = function(sec, type, lang) {
            if (type !== 's') {
                sec = sec * 0.000000001;
            }
            if (sec < 1) {
                return 0;
            }
            var unit = {
                d: '天',
                h: '时',
                min: '分',
                s: '秒'
            };
            if (lang === 'en') {
                unit = {
                    d: 'd',
                    h: 'h',
                    min: 'min',
                    s: 's'
                };
            }
            var data = {
                day: 0,
                hour: 0,
                min: 0,
                sec: 0
            };
            var iRemain = sec;
            data.day = parseInt(iRemain / 86400);
            iRemain %= 86400;
            data.hour = parseInt(iRemain / 3600);
            iRemain %= 3600;
            data.min = parseInt(iRemain / 60);
            iRemain %= 60;
            data.sec = parseInt(iRemain);
            var duration = data;
            var result = '';
            if (duration.day) {
                result += duration.day + unit.d;
            }
            if (duration.hour) {
                result += duration.hour + unit.h;
            }
            if (duration.min) {
                result += duration.min + unit.min;
            }
            if (duration.sec) {
                result += duration.sec + unit.s;
            }
            if (result === '') {
                result = '0';
            }
            return result;
        };
        /**
         * [getNoTokenUrl 获取不带TOKEN的当前页面URL]
         * @return {[type]} [description]
         */
        Aid.fn.getNoTokenUrl = function() {
            var url = location.href;
            var reg = /[\?\&]token=([^\&]+)/gi;
            url = url.replace(reg, '');
            return url;
        };
        /**
         * [getCourseCat 获取头部配置]
         * @return {[type]} [1、2、3]
         */
        Aid.fn.getCourseCat = function() {
            try {
                return DYCONFIG.domain[location.host].type;
            } catch (e) {
                return 1;
            }
        };
        /**
         * [isIE IE8、9检测]
         * @param  {[type]}  min [最小IE版本]
         * @param  {[type]}  max [最大IE版本最大支持到9]
         * @return {Boolean}     [注意（IE Edge 模式检测不出来）]
         */
        Aid.fn.isIE = function(min, max) {
            var navAgent = window.navigator.userAgent.toLowerCase(),
                flag;
            if (navAgent.indexOf('msie') != -1) {
                var IE = navAgent.match(/msie\s([0-9]*)/);
                flag = (arguments.length === 0) ? IE[1] :
                    (arguments.length === 1) ? (parseInt(IE[1]) === min) :
                    (IE[1] >= min && IE[1] <= max) ? IE[1] : false;
            }
            return flag;
        };
        /**
         * [detectOS 获取浏览器和系统信息]
         * @return {[type]} [description]
         */
        Aid.fn.detectOS = function() {
            var D = {};
            D.ua = navigator.userAgent;
            D.uaTLC = D.ua.toLowerCase();
            D.platform = navigator.platform;
            D.isCrosswalk = navigator.userAgent.indexOf('Crosswalk') > -1;
            D.isLinux = (String(D.platform).indexOf('Linux') > -1);
            D.isWin = D.platform === ('Win32' || 'Windows');
            D.isMac = D.platform === ('Mac68K' || 'MacPPC' || 'Macintosh' || 'MacIntel');
            D.isUnix = (D.platform === 'X11') && !D.isWin && !D.isMac;
            D.isSymbian = D.platform === ('SymbianOS');
            D.bIsCE = D.uaTLC.match(/windows ce/i);
            D.bIsWM = D.uaTLC.match(/windows mobile/i);
            D.bIsAndroid = D.uaTLC.match(/android/i);
            D.bIsIpad = D.uaTLC.match(/ipad/i);
            D.bIsIphoneOs = D.uaTLC.match(/iphone os/i);
            D.bIsMidp = D.uaTLC.match(/midp/i);
            D.bIsUc7 = D.uaTLC.match(/rv:1.2.3.4/i);
            D.bIsUc = D.uaTLC.match(/ucweb/i);
            D.mobile = (D.bIsIpad || D.bIsIphoneOs || D.bIsMidp || D.bIsUc7 || D.bIsUc || D.bIsAndroid || D.bIsCE || D.bIsWM || D.isSymbian) ? true : false;
            D.pc = D.mobile ? false : true;
            D.name = (D.bIsIpad) ? 'iPad' : (D.bIsIphoneOs) ? 'iPhone' : (D.bIsMidp) ? 'midp' : (D.bIsUc7) ? 'Uc7' : (D.bIsUc) ? 'Ucweb' : (D.isMac) ? 'Mac' : (D.isLinux) ? ((D.bIsAndroid) ? 'Android' : 'Linux') : (D.isSymbian) ? 'SymbianOS' : (D.bIsCE || D.bIsWM) ? 'wm' : 'other';
            if (D.isWin) {
                D.isWin2K = D.ua.indexOf('Windows NT 5.0') > -1 || D.ua.indexOf('Windows 2000') > -1;
                D.isWinXP = D.ua.indexOf('Windows NT 5.1') > -1 || D.ua.indexOf('Windows XP') > -1;
                D.isWin2003 = D.ua.indexOf('Windows NT 5.2') > -1 || D.ua.indexOf('Windows 2003') > -1;
                D.isWinVista = D.ua.indexOf('Windows NT 6.0') > -1 || D.ua.indexOf('Windows Vista') > -1;
                D.isWin7 = D.ua.indexOf('Windows NT 6.1') > -1 || D.ua.indexOf('Windows 7') > -1;
                D.isWin8 = D.ua.indexOf('Windows NT 6.2') > -1 || D.ua.indexOf('Windows 8') > -1;
                D.isWin10 = D.ua.indexOf('Windows NT 10') > -1 || D.ua.indexOf('Windows 10') > -1;
                D.name = (D.isWin2K) ? 'Win2000' : (D.isWinXP) ? 'WinXP' : (D.isWin2003) ? 'Win2003' : (D.isWinVista) ? 'WinVista' : (D.isWin7) ? 'Win7' : (D.isWin8) ? 'Win8' : (D.isWin10) ? 'win10' : 'other';
            }
            return D;
        };
        /**
         * [clearFile 重置当前element(上传图片用)]
         * @param  {[type]} argElement [html element]
         * @return {[type]}            [description]
         */
        Aid.fn.clearFile = function(argId) {
            var e = document.getElementById(argId);
            if (!e) {
                return;
            }
            if (e.outerHTML) {
                e.outerHTML = e.outerHTML;
            } else {
                e.value = "";
            }
        };
        return new Aid();
    })();
})(window);
// 浏览器版本检测，低于IE10的提示浏览器不兼容。
function isIE(min, max) {
    var navAgent = window.navigator.userAgent.toLowerCase(),
        flag;
    if (navAgent.indexOf('msie') != -1) {
        var IE = navAgent.match(/msie\s([0-9]*)/);
        flag = (arguments.length === 0) ? IE[1] :
            (arguments.length === 1) ? (parseInt(IE[1]) === min) :
            (IE[1] >= min && IE[1] <= max) ? IE[1] : false;
    }
    return flag;
}
/**
 * [检测是否低于IE9，监听angular报错]
 * @return {[type]} [description]
 */
(function(win, doc) {
    var oldBrowser = false;
    if (isIE() < 9) {
        oldBrowser = true;
    }
    //备案号
    var caseNum = '';
    if (DYCONFIG.domain[location.host]) {
        caseNum = DYCONFIG.domain[location.host].domainNum;
    }
    if (oldBrowser) {
        var str =
            '<html style="background-color:#e2e2e2;">' +
            '<head>' +
            '<meta charset="utf-8">' +
            '</head>' +
            '<body>' +
            '<div id="browser-not-support" style="background: #e2e1e2;height:100%;position: absolute;top:0;left:0;right:0;z-index:999999;">' +
            '<div style="width: 1000px; text-align:center;margin:auto;position:relative">' +
            '<div style="background: url(/rcp-common/imgs/common/browser_03.jpg);width:756px;height:520px;margin:auto;padding: 40px 0 20px;"></div>' +
            '<div style="text-align:center;padding: 0 200px;margin-top: 20px;">' +
            '<a href="http://rj.baidu.com/soft/detail/14744.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="/rcp-common/imgs/icon/browser_07.png" alt="">' +
            '<p>谷歌浏览器<br><span style="color: #fe3a20">（强烈推荐）</span></p>' +
            '</a>' +
            '<a href="http://rj.baidu.com/soft/detail/11843.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="/rcp-common/imgs/icon/browser_09.png" alt="">' +
            '<p>火狐浏览器</p>' +
            '</a>' +
            '<a href="http://rj.baidu.com/soft/detail/23357.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="/rcp-common/imgs/icon/browser_11.png" alt="">' +
            '<p>Internet Explorer 10+</p>' +
            '</a>' +
            '<div style="clear: both;"></div>' +
            '</div>' +
            '<p style="color:#35383b;font-size:16px;padding: 50px 0 20px;">© 2009-2015 广州市大洋信息技术股份有限公司 ' + caseNum + '</p>' +
            '</div>' +
            '</div>' +
            '</body>' +
            '</html>';
        window.onload = function() {
            document.write(str);
        };
    }
    // [mobileUpgradeStyle angular报错时的提示页]
    var mobileUpgradeStyle = win.mobileUpgradeStyle;
    doc.runErrorCallUpgrade = function() {
        return;
        console.log(doc.loadReady);
        if (!doc.loadReady && !win.notCheckUpgrade) {
            doc.upgradeLock = true;
            doc.querySelector('html').style.display = 'none';
        }
    };
    win.addEventListener('load', function() {
        doc.loadReady = true;
        if (doc.upgradeLock) {
            doc.write([
                '<html style="background:white url(\'/rcp-common/imgs/icon/upgrade-bg.png\') no-repeat center 80px;' + (mobileUpgradeStyle ? 'background-size:150% auto;' : '') + '">',
                '<head>',
                '<meta charset="utf-8">',
                '</head>',
                '<body style="' + (mobileUpgradeStyle ? 'padding:125% 0 80px;' : 'padding:560px 0 80px;') + '">',
                '<div style="' + (mobileUpgradeStyle ? 'font:12px \'Microsoft YaHei\';' : 'font:28px \'Microsoft YaHei\';') + 'color:#666;text-align:center;">啊哦，系统升级中,我们正在紧急处理，稍后再来哦！</div>',
                '</body>',
                '</html>'
            ].join(''));
        }
    }, false);
    /**
     * [description]
     * @param  {[type]} win [处理console.*失效问题]
     * @return {[type]}     [description]
     */
    if (!win.console) {
        win.console = {
            log: function() {},
            error: function() {},
            info: function() {},
            warn: function() {}
        };
    }
})(window, document);
