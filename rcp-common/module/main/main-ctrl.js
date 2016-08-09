// 配置angular错误捕捉
module.config(['$provide', function($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', function($delegate) {
        return function(exception, cause) {
            $delegate(exception, cause);
            console.error({
                origin: 'AngularJS Error',
                msg: exception.message,
                stack: exception.stack
            });
            document.runErrorCallUpgrade();
        };
    }]);
}]);
module.controller('mainCtrl', ['$scope', '$rootScope', '$http', 'service', '$cookies', '$timeout', function($scope, $rootScope, $http, service, $cookies, $timeout) {
    $('body').show();

    function anonymousLogin() {
        var localStorageUsr = localStorage.getItem('anonymousLoginUsr');
        if (localStorageUsr && localStorageUsr !== 'error') {
            $rootScope.anonymousUser = JSON.parse(localStorageUsr);
            $cookies.stoken = $rootScope.anonymousUser.token;
            return;
        }
        $http({
            method: 'GET',
            url: 'http://' + g_conf.SSO + '/sso/api/anonymousLogin'
        }).then(function(rs) {
            if (rs.data.code !== 0) {
                console.error(rs.data.msg, '匿名登录失败');
                localStorage.setItem('anonymousLoginUsr', 'error');
                return;
            }
            var data = rs.data.data;
            data.usr.token = data.token;
            localStorage.setItem('anonymousLoginToken', data.token);
            delete data.usr.BAttr;
            delete data.usr.attrs;
            localStorage.setItem('anonymousLoginUsr', JSON.stringify(data.usr));
            $rootScope.anonymousUser = data.usr;
            $cookies.stoken = data.usr.token;
        }, function(msg) {
            localStorage.setItem('anonymousLoginUsr', 'error');
            console.error(msg, '匿名登录失败');
        });
    }
    //以下为最新
    //初始化页面记录
    try {
        R = new ars.ARS();
        //额外参数记录对像
        R.args = {};
        //记录频率
        R.delay = 1000;
        //提交频率 
        R.pushDelay = 10000;
        //URL
        R.url = DYCONFIG.ars.rUrl + 'pub/api/record';
        //开始计时
        R.start();
        window.focus();
    } catch (e) {
        R = {};
    }
    /**
     * [loginSuCb 已登陆回调]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    function loginSuCb(rs) {
        //设置token
        R.url += '?token=' + rcpAid.getToken();
        $scope.setUserData(UINFO);
        setNavMenu($rootScope.currentUser);
        console.log('checkLogin by token');
    }
    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    function loginErrCb(e) {
        console.log('未登陆', e);
        rcpAid.isLogin = 0;
        setNavMenu({});
        //修改首页学习中心连接
        if (location.pathname === '/' || location.pathname === '/index.html') {
            $('li.key.nav-side').find('a[href="/space/student-space.html"]').attr('href', rcpAid.getUrl('登录', {
                url: encodeURIComponent(location.protocol + '//' + location.host + rcpAid.getUrl('学习中心'))
            }));
        }
        $timeout(function() {
            $rootScope.$broadcast('login', '');
        }, 0);
        //匿名登陆
        // anonymousLogin();
    }
    /**
     * [setNavMenu 设置用户菜单]
     * @param {[type]} user [description]
     */
    function setNavMenu(user) {
        $scope.itemList = [];
        //增加一个item
        function addNavItem(arr) {
            angular.forEach(arr, function(item) {
                var flag = false;
                angular.forEach($scope.itemList, function(origin) {
                    if (item.name === origin.name) {
                        flag = true;
                    }
                });
                if (!flag) {
                    $scope.itemList.push(item);
                }
            });
        }
        //设置item
        function setNavItem() {
            var getUrl = rcpAid.getUrl;
            var arr = [];
            angular.forEach(arguments, function(attr) {
                switch (attr) {
                    case '学习中心':
                        arr.push({ ic: 'learning-center', name: attr, href: getUrl(attr) });
                        break;
                    case '教学中心':
                        arr.push({ ic: 'teaching-center', name: attr, href: getUrl(attr) });
                        break;
                    case '助学中心':
                        if (typeof isIE !== 'undefined' && !isIE(9, 9)) {
                            arr.push({ ic: 'L2', name: attr, href: getUrl(attr) });
                        }
                        break;
                    case '管理中心':
                        var _hash = '';
                        if ($rootScope.currentUser.role != '') {
                            _hash = '#/member-approval';
                        } else if ($rootScope.currentUser.org != '') {
                            _hash = '#/course-identify';
                        }
                        arr.push({ ic: 'management-center', name: attr, href: getUrl(attr, '?url=' + rcpAid.getNoTokenUrl()) + _hash });
                        break;
                    case '创建课程':
                        arr.push({ ic: 'create-new-course', name: attr, href: getUrl('创建课程', { type: 10 }) });
                        break;
                    case '实名认证':
                        arr.push({ ic: 'attestation-manage', name: attr, href: getUrl('实名认证', { type: 10 }) });
                        break;
                        //case '退出':
                        //    arr.push({ ic: 'exit', name: attr, href: getUrl('退出', { type: 10 }) });
                        //    break;
                }
            });
            return arr;
        }
        if (user.hasOwnProperty('role')) {
            angular.forEach(user.role, function(v, k) {
                switch (k) {
                    case 'default':
                        break;
                    case 'student':
                        // addNavItem(setNavItem('学习中心'));
                        if ($scope.user.schoolId) {
                            addNavItem(setNavItem('学校空间'));
                        }
                        if ($scope.user.classId) {
                            addNavItem(setNavItem('班级空间'));
                        }
                        break;
                    case 'parent':
                        addNavItem(setNavItem('家长空间'));
                        break;
                    case 'teacher':
                        if ($scope.user.schoolId) {
                            addNavItem(setNavItem('学校空间'));
                        }
                        if ($scope.user.classId) {
                            addNavItem(setNavItem('班级空间'));
                        }
                        break;
                    case 'help':
                        addNavItem(setNavItem('助学中心'));
                        break;
                    case 'class':
                        addNavItem(setNavItem('班级空间', '学校空间'));
                        break;
                    case 'school':
                        addNavItem(setNavItem('学校空间'));
                        break;
                    case 'UCS_ADMIN':
                        addNavItem(setNavItem('管理中心'));
                        break;
                    case 'COURSE_VERIFY_ADMIN':
                        addNavItem(setNavItem('管理中心'));
                        break;
                    case 'PAGE_EDIT_ADMIN':
                        addNavItem(setNavItem('管理中心'));
                        break;
                }
            });
        }
        if (user.hasOwnProperty('org') && user.org != '') {
            addNavItem(setNavItem('管理中心'));
        }
        addNavItem(setNavItem('学习中心', '教学中心', '创建课程', '实名认证'));
    }
    /**
     * [setUserData 设置登陆用户数据到rootScope]
     * @param {[type]} argUserData [description]
     */
    $scope.setUserData = function(argUserData) {
        try {
            console.log(argUserData);
            if (!argUserData.uid) {
                return;
            }
            $rootScope.currentUser = {
                //https://api.gdy.io/doc/html/selector
                uid: argUserData.usr.id,
                nickName: argUserData.usr.attrs.basic.nickName,
                avatar: argUserData.usr.attrs.basic.avatar,
                desc: argUserData.usr.attrs.basic.desc,
                role: argUserData.usr.attrs.role || '',
                org: argUserData.usr.attrs.org || '',
            };
            //是否实名认证
            if (argUserData.usr.attrs.pass) {
                $rootScope.currentUser.certification = argUserData.usr.attrs.pass.certification;
            }
            console.log('发广播', $rootScope.currentUser);
            $timeout(function() {
                $rootScope.$broadcast('login', $rootScope.currentUser);
            }, 0);
        } catch (e) {
            console.log(e);
        }
    };

    function init() {
        $rootScope.currentUser = {};
        $('body').show();

        //判断登陆
        service.common.checkLogin(loginSuCb, loginErrCb);
        if (!rcpAid.isLogin) {
            console.log('未登陆');
            //匿名登陆
            // anonymousLogin();
            return;
        }
    }
    init();
}]);
