function configInit() {
    var srvEnd = '.dev.gdy.io/';
    var srvList = {
            //课程相关
            course: 'http://course' + srvEnd,
            //单点登陆
            sso: 'http://sso' + srvEnd,
            //学习圈子
            studyCircle: 'http://dms' + srvEnd,
            //文件服务器
            fs: 'http://fs' + srvEnd,
            //首页搜索页数据转发
            pes: 'http://pes' + srvEnd,
            //首页地址
            rcp: location.protocol + '//' + location.host + '/',
            //记录地址
            ars: 'http://ars' + srvEnd,
            //评论相关地址
            appraise: 'http://appraise' + srvEnd,
            //记录信息相关地址
            extra: 'http://extra' + srvEnd,
        },
        noLoginPageList = [
            '/',
            '/index.html',
            '/search.html',
            '/course/course-detail.html',
            '/assessment-detail.html'
        ];
    return {
        noLoginPage: noLoginPageList,
        srvList: srvList,
        domain: {
            'localhost:1238': {
                domainNum: '粤ICP备05139291号-10',
                type: 2,
            },
            'rcp.dyf.kuxiao.cn': {
                domainNum: '粤ICP备05139291号-12',
                type: 1,
            },
            'rcp.dev.gdy.io': {
                domainNum: '粤ICP备05139291号-12',
                type: 1,
            },
            'rcp.chk.gdy.io': {
                domainNum: '粤ICP备05139291号-12',
                type: 1,
            },
            'www.kuxiao.cn': {
                domainNum: '粤ICP备05139291号-12',
                type: 1,
            },
            'rcp.dyfchk2.kuxiao.cn': {
                domainNum: '粤ICP备05139291号-12',
                type: 1,
            },
            'aikexue.dev.gdy.io': {
                domainNum: '粤ICP备05139291号-10',
                type: 2,
            },
            'aikexue.chk.gdy.io': {
                domainNum: '粤ICP备05139291号-10',
                type: 2,
            },
            'rcp.dyf.aikexue.com': {
                domainNum: '粤ICP备05139291号-10',
                type: 2,
            },
            'www.aikexue.com': {
                domainNum: '粤ICP备05139291号-12',
                type: 2,
            },
            'rcp.dyfchk2.aikexue.com': {
                domainNum: '粤ICP备05139291号-12',
                type: 2,
            },
            'gzmooc.dev.gdy.io': {
                domainNum: '粤ICP备05139291号-12',
                type: 3,
            },
            'gzmooc.chk.gdy.io': {
                domainNum: '粤ICP备05139291号-12',
                type: 3,
            },
            'www.gzmooc.cn': {
                domainNum: '粤ICP备05139291号-12',
                type: 3,
            },
            'gzmooc.dyfchk2.kuxiao.cn': {
                domainNum: '粤ICP备05139291号-12',
                type: 3,
            },
        },
        host: {
            kuxiao: 'http://rcp' + srvEnd,
            aikexue: 'http://aikexue' + srvEnd,
            gzmooc: 'http://gzmooc' + srvEnd
        },

        course: {
            rUrl: srvList.course,
        },
        sso: {
            rUrl: srvList.sso,
            my: srvList.sso + 'sso/my.html',
            login: srvList.sso + 'sso/index.html',
            loginDialog: srvList.sso + 'sso/login-dialog.html',
            register: srvList.sso + 'sso/register.html',
            logout: srvList.sso + 'sso/logout.html',
            manage: srvList.sso + 'sso/management-center.html',
        },
        studyCircle: {
            rUrl: srvList.studyCircle
        },
        fs: {
            rUrl: srvList.fs,
            upload: srvList.fs + 'usr/api/uload',
            down: srvList.fs + 'usr/api/dload',
            info: srvList.fs + 'pub/api/info',
            listInfo: srvList.fs + 'pub/api/listInfo',
        },
        pes: {
            rUrl: srvList.pes,
        },
        rcp: {
            rUrl: srvList.rcp,
        },
        ars: {
            rUrl: srvList.ars,
        },
        appraise: {
            rUrl: srvList.appraise,
        },
        extra: {
            rUrl: srvList.extra,
        },
    };
}
var DYCONFIG = configInit();
var g_conf = DYCONFIG;
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
        src: ssoUrl + 'sso/api/uinfo.js?user=1&selector=bandc,role,org'
    });
    importHead(arr);
    //IE9跨域
    var arr = [];
    var browser = navigator.appName;
    var b_version = navigator.appVersion;
    var version = b_version.split(";");
    if (version.length < 2) {
        return;
    }
    var trim_Version = version[1].replace(/[ ]/g, "");
    if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
        arr.push({
            type: 'script',
            src: location.protocol + '//' + location.host + '/rcp-common/xdomain/xdomain.min.js'
        });
        arr.push({
            type: 'script',
            src: location.protocol + '//' + location.host + '/rcp-common/xdomain/xdomain-opt.js'
        });
    }
    importHead(arr);
})(document);
