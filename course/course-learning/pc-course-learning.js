var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'LocalStorageModule'
]);
module.factory("$resource", ['request', function(request) {
    return function(u) {
        return {
            get: function(p, s, e) {
                request({
                    method: 'GET',
                    url: u,
                    params: p
                }).then(s, function(err) {
                    if (typeof e === 'function') {
                        e(err.data);
                    }
                });
            }
        };
    };
}]);

//内容
module.controller('contentCtrl', ['$resource', '$rootScope', '$scope', '$timeout', 'service', 'cvfa', '$interval', function($resource, $rootScope, $scope, $timeout, service, cvfa, $interval) {
    //关闭、刷新页面时提示
    // window.onbeforeunload = function() {
    //     cvfa.setKeyValue($rootScope.currentUser.uid + '_' + $scope.courseId, cvfa.sectionId);
    //     return '关闭提示';
    // };
    // R.stop();
    R.onStart = function() {
        try {
            $timeout(function() {
                $scope.learnStatus = '正在学习';
                $scope.$digest();
            }, 300);
        } catch (e) {}
    };
    R.onStop = function() {
        try {
            $timeout(function() {
                $scope.learnStatus = '暂停学习';
                $scope.$digest();
            }, 300);
        } catch (e) {}
    };
    R.args.iids = { iid: [] };
    if (R.pushDelay) {
        var temInterval = $interval(function() {
            console.log('开始记录学习位置', cvfa.sectionId);
            cvfa.setKeyValue($rootScope.currentUser.uid + '_' + $scope.courseId, cvfa.sectionId);
        }, R.pushDelay);
    }
    $scope.isIe9 = rcpAid.isIE(5, 9);
    $scope.newCtvMark = rcpAid.queryString('new');
    $scope.courseStatus = rcpAid.queryString('type');
    $scope.targetId = rcpAid.queryString('target');
    $scope.courseId = rcpAid.queryString('cid');
    $scope.learnStatus = '正在学习';
    $scope.appraiseData = {};
    //记录课程信息供其它页面拿cid
    $rootScope.courseData = {
        cid: $scope.courseId
    };
    $scope.isNullContent = false;
    $scope.learningLocationData = {};
    $rootScope.learningDialog = {};
    /////////////新内容//////////////////
    //当前章节信息
    $scope.nowSection = {};
    //当前用户信息
    $scope.currentUser = {};
    //判断是否登陆
    $scope.$on('login', function(rs, data) {
        if (!data) {
            service.common.toLogin();
            return;
        }
        $scope.currentUser = $rootScope.currentUser;
        $scope.courseDetail();
    });
    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    $scope.init = function() {
        $scope.link = {
            courseDetail: '',
            teacherSpace: '',
        };
        if (!$scope.courseId) {
            service.dialog.alert('课程信息有误！');
        }
    };
    /**
     * 获取学习进度
     * @return {[type]} [description]
     */
    $scope.getLearnRecord = function() {
        cvfa.getLearnRecord();
    };

    /**
     * [courseDetail 读取课程信息]
     * @return {[type]} [description]
     */
    $scope.courseDetail = function() {
        var searchData = {
            text: { idx: { type: 'items' } },
            appraise: { list: { pageCount: 1 } }
        };
        var data = {
            cid: $scope.courseId,
            cmds: angular.toJson(searchData),
        };
        service.course.getCourseDetail(data).then(function(rs) {
            $scope.courseDetailHub(rs);
        }, function(e) {
            console.log(e);
            service.dialog.showErrorTip(e, { moduleName: 'pc-course-learning', funcName: 'getCourseDetail' });
            $scope.endingLoading();
            // service.dialog.alert('课程信息有误！');
        });
    };
    /**
     * [courseDetailHub 读取课程信息回调]
     * @param  {[type]} rs [description]
     * @return {[type]}    [description]
     */
    $scope.courseDetailHub = function(rs) {
        if (rs.code !== 0) {
            service.dialog.alert((rs.code === 301 ? '请先登录' : !rs.msg ? '获取课程信息失败' : rs.msg));
            $scope.endingLoading();
            return;
        }
        if (rs.data.items.appraise) {
            $scope.appraiseData = rs.data.items.appraise.list;
        }
        $rootScope.courseData = rs.data;
        $scope.link.courseDetail = rcpAid.getUrl('课程详情', { cid: $rootScope.courseData.crs.id });
        $scope.link.teacherSpace = rcpAid.getUrl('教学中心', { cid: $scope.courseData.crs.uid });
        document.title = $rootScope.courseData.crs.title + ' · 学习页';
        $rootScope.readPermissions = $rootScope.courseData.joinMode;
        if ($rootScope.readPermissions === 100 || $rootScope.readPermissions === 50 || $rootScope.readPermissions === 60) {
            $scope.self = true;
        }
        //-2 用户已退出课程 -1 提交完信息审核失败 0 表示没参与 2 没参与课程并且课程需要填写课程参与资料,但用户未填写 5 正在等待用户课程资料审核 9 需要补充完整资料 10 表示已经参与课程 50 编辑管理员 60 课程管理 100 表示为课程的拥有者
        if ($rootScope.readPermissions < 9) {
            $rootScope.readPermissions = false;
        }
        // if ($rootScope.courseData.crs.status === 100 || $rootScope.readPermissions === 10 || 1) {
        //是否显示侧栏
        $scope.readSlideBar = true;
        // }
        if ($rootScope.currentUser.role && ($rootScope.currentUser.role.UCS_ADMIN || $rootScope.currentUser.role.COURSE_VERIFY_ADMIN)) {
            $rootScope.readPermissions = true;
            //管理员身份
            $scope.admin = true;
        }
        if ($rootScope.currentUser.org.orgid) {
            $rootScope.readPermissions = true;
            //管理员身份
            $scope.admin = true;
        }
        if ($scope.admin) {
            $scope.link.courseDetail = '';
        }
        if ($rootScope.readPermissions) {
            $scope.showNewContentView();
        } else {
            $scope.endingLoading();
            service.dialog.alert('您未参与课程，正在跳转到详情页', { mask: true });
            $scope.endingLoading();
            $timeout(function() {
                location.href = $scope.link.courseDetail;
            }, 2500);
            return;
        }
    };
    // 新课程内容 start ********************************
    /**
     * [showNewContentView 课程内容显示]
     * @return {[type]} [description]
     */
    $scope.showNewContentView = function() {
        var showContent = function() {
            try {
                if (!$rootScope.courseData.crs.iids.text.aid) {
                    dialogAlert('课程内容id不能为空');
                    console.error('courseData.linkId == undefined');
                    return;
                }
                newContentView($rootScope.courseData.crs.iids.text.aid);
            } catch (e) {}
        };
        if (!$scope.targetId) {
            $scope.getRecordReady = false;
            cvfa.getLearnRecord([$rootScope.currentUser.uid + '_' + $scope.courseId], function(rs) {
                $scope.getRecordReady = true;
                var temVal = '';
                temVal = rs.data || {};
                temVal = temVal.store || [{}];
                temVal = temVal[0].val || '';
                if (!temVal && angular.isArray(cvfa.idsContent)) {
                    temVal = cvfa.idsContent[0];
                }
                console.log('加载：', temVal);
                $scope.targetId = temVal || '';
                showContent();
            }, function(e) {
                $scope.getRecordReady = true;
                showContent();
                console.log(e);
                service.dialog.showErrorTip(e, { moduleName: 'mobile-course-learning', funcName: 'getLearnRecord' });
                // try {
                //     service.dialog.alert(e.data.data.msg);
                // } catch (err) {
                //     service.dialog.alert('读取记录出错！');
                // }
            });
        } else {
            $scope.getRecordReady = true;
            showContent();
        }
    };

    function qCtLoading() {
        $rootScope.sectionLoadingReady = false;
        $rootScope.contentLoadingReady = undefined;
    }
    /**
     * [newContentView 显示]
     * @return {[type]} [description]
     */
    function newContentView(contentId) {
        qCtLoading();
        if (wcms.load[0] == '/') {
            wcms.load = wcms.load.slice(1);
        }
        wcms.load = DYCONFIG.course.rUrl + wcms.load;
        cvfa.self = $scope.self;
        cvfa.admin = $scope.admin;
        cvfa.courseId = $scope.courseId;
        cvfa.config({
            uid: 1,
            contentId: contentId,
            t: 'T',
            n: 3,
            target: $scope.targetId
        }).init();
        //不知是什么鬼todo
        $scope.$on('cvfaInitReady', function() {
            $scope.endingLoading('newLock');
        });
        $scope.$on('cvfaInitError', function(ev, err, xhr) {
            $scope.endingLoading('newLock');
        });
        /**
         * [内容加载完成]
         * @param  {[type]} )
         * @return {[type]}   [description]
         */
        $scope.$on('makeContentReady', function() {
            $rootScope.contentLoadingReady = true;
        });
        /**
         * 生成目录后回调
         */
        $scope.$on('makeCatReady', function() {
            getSectionLength(cvfa.cat.items);
        });
        /**
         * 获取当前学习章节名
         * @return {[type]}     [description]
         */
        $scope.$on('actionAatId', function(ev, id) {
            var wrap = $(cvfa.viewNode),
                temLen = cvfa.idsContent.length,
                temEnd = false,
                viewHeight = wrap[0].offsetHeight;
            console.log(viewHeight);
            R.args.iids.iid = [];
            if (!$scope.self && !$scope.admin) {
                R.args.iids.aid = $rootScope.courseData.crs.iids.text.aid;
                R.args.aid = R.args.iids.aid;
            }
            angular.forEach(cvfa.cat.items, function(v, i) {
                if (v.id == id) {
                    $scope.curSectionIndex = i + 1;
                    $scope.curSectionName = v.title;
                    $scope.nowSection = v;
                }
            });
            for (var i = 0; i < temLen; i += 1) {
                var target = wrap.children('.cp-section[data-cid="' + cvfa.idsContent[i] + '"]');
                if (target.length && target[0].style.display !== 'none') {
                    var targetTop = target.offset().top;
                    console.log(target.height(), targetTop, viewHeight, cvfa.idsContent[i]);
                    if (-target.height() < targetTop && targetTop < viewHeight && targetTop !== 0) {
                        R.args.iids.iid.push(cvfa.idsContent[i]);
                        temEnd = true;
                    } else if (temEnd) {
                        return;
                    }
                }
            }
            console.log($scope.curSectionIndex, $scope.curSectionName);
        });
        $scope.$on('makeContentError', function(ev, type, err) {
            $rootScope.contentLoadingReady = true;
        });
        $scope.$on('locateContentTarget', function() {
            $rootScope.contentLoadingReady = false;
        });
    }
    // 课程内容显示 end ********************************
    /**
     * [getSectionLength 读取目录长度]
     * @param  {[type]} arr [description]
     * @return {[type]}     [description]
     */
    function getSectionLength(arr) {
        if (arr) {
            $scope.sectionLength = arr.length;
        }
    }
    //全屏切换 start-----------------------
    /**
     * [requestFullScreen 全屏]
     * @param  {[type]} el [description]
     * @return {[type]}    [description]
     */
    function requestFullScreen(el) {
        var a = ['requestFullscreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'];
        var flag;
        for (var i = 0; i < a.length; i++) {
            if (el[a[i]]) {
                el[a[i]]();
                flag = !flag;
                break;
            }
        }
        if (!flag && typeof window.ActiveXObject !== 'undefined') {
            var wscript = new ActiveXObject('WScript.Shell');
            if (wscript !== null) {
                wscript.SendKeys('{F11}');
            }
        }
    }
    /**
     * [cancelFullScreen 取消全屏]
     * @param  {[type]} el [description]
     * @return {[type]}    [description]
     */
    function cancelFullScreen(el) {
        var a = ['exitFullscreen', 'webkitExitFullscreen', 'mozCancelFullScreen', 'msExitFullscreen'];
        var flag;
        for (var i = 0; i < a.length; i++) {
            if (el[a[i]]) {
                el[a[i]]();
                flag = !flag;
                break;
            }
        }
        if (!flag && typeof window.ActiveXObject !== 'undefined') { // Older IE.
            var wscript = new ActiveXObject('WScript.Shell');
            if (wscript !== null) {
                wscript.SendKeys('{F11}');
            }
        }
    }
    /**
     * [fullScreenChange 全屏切换监听]
     * @return {[type]} [description]
     */
    function fullScreenChange() {
        var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        // var fullscreenEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
        // var flag = window.outerHeigth==screen.heigth && window.outerWidth==screen.width;
        $scope.fullScreenLock = fullscreenElement ? true : false;
        try {
            $scope.$digest();
        } catch (e) {}
    }
    document.addEventListener('fullscreenchange', fullScreenChange, false);
    document.addEventListener('mozfullscreenchange', fullScreenChange, false);
    document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
    document.addEventListener('msfullscreenchange', fullScreenChange, false);
    document.onmsfullscreenchange = fullScreenChange;
    $scope.fullScreen = function() {
        if (rcpAid.isIE()) {
            service.dialog.alert('请手动按F11键');
            return;
        }
        if ($scope.fullScreenLock) {
            $scope.cancelScreen();
            return;
        }
        // var ele = document.querySelector('html');
        var ele = document.documentElement;
        // ele.style.backgroundColor = '#dcdcdc';
        requestFullScreen(ele);
        $scope.toggleSection(false);
    };

    $scope.cancelScreen = function() {
        // var ele = document.querySelector('html');
        var ele = document.documentElement;
        cancelFullScreen(ele);
        cancelFullScreen(document);
        cancelFullScreen(window);
        $scope.toggleSection(true);
    };
    //全屏切换 end-----------------------
    //旧的继续学习
    $scope.continueLearning = function(ev) {
        $scope.$broadcast('continueLearning', $(ev.target).html());
    };
    /**
     * [endingLoading 加载结束]
     * @return {[type]} [description]
     */
    $scope.endingLoading = function() {
        $rootScope.sectionLoadingReady = true;
        $rootScope.contentLoadingReady = true;
        $rootScope.serviceLoadingReady = true;
    };
    /**
     * [toggleSection 左侧栏点击操作]
     * @param  {[type]} flag   [true时展开，false或空闭合]
     * @param  {[type]} speed  [动画效果，默认为fast]
     * @return {[type]}        [description]
     */
    $scope.toggleSection = function(flag, speed) {
        $scope.showSectionLock = typeof flag === 'boolean' ? flag : !$scope.showSectionLock;
        var w = $(window).width() * 0.16;
        if (w < 250) {
            w = 250;
        }
        var val = $scope.showSectionLock ? w : 0;
        $('#section-v').stop().animate({ width: val }, speed || 'fast');
        $('#container-v').stop().animate({ left: val + 20 }, speed || 'fast');
        $('#toggle-section-new').stop().animate({ left: val || 0 }, speed || 'fast');
    };
    $scope.init();

    $scope.gotoDetail = function(cid) {
        window.open($scope.link.courseDetail);
    };

    $scope.gotoSpace = function(uid) {
        window.open('./teacher-space.html?uid=' + uid);

    };

    $scope.filterSectionList = [
        { name: '全部', type: 'all', active: true },
        { name: '文件', type: 'file' },
        { name: '图片', type: 'img' },
        { name: '视频', type: 'video' },
        { name: '练习', type: 'exercise' }
    ];

    $scope.curFilterType = $scope.filterSectionList[0];

    $scope.filterSection = function(param) {
        $scope.curFilterType = param;
        angular.forEach($scope.filterSectionList, function(value) {
            value.active = value.type === param.type;
        });
        if (!$scope.loginStatus()) {
            service.dialog.alert('请先登录');
            return;
        }
        if ($scope.isNullCourseList()) {
            return;
        }
        var showNull = true;
        switch (param.type) {
            case 'all':
                angular.forEach($scope.courseDirectory.items, function(item) {
                    showNull = false;
                    item.filterHide = false;
                    item.filterFlag = false;
                    angular.forEach(item.childItems, function(child) {
                        child.filterHide = false;
                        child.filterFlag = false;
                    });
                });
                break;
            default:
                angular.forEach($scope.courseDirectory.items, function(item) {
                    item.filterFlag = false;
                    item.filterHide = true;
                    angular.forEach(item.contentType, function(type) {
                        if (!item.filterFlag) {
                            item.filterHide = type === param.type ? false : true;
                            item.filterFlag = type === param.type;
                            showNull = false;
                        }
                    });
                    angular.forEach(item.childItems, function(child) {
                        child.filterFlag = false;
                        child.filterHide = true;
                        angular.forEach(child.contentType, function(type) {
                            if (!child.filterFlag) {
                                child.filterHide = type === param.type ? false : true;
                                child.filterFlag = type === param.type;
                            }
                            if (!child.filterHide) {
                                item.filterHide = false;
                                showNull = false;
                            }
                        });
                    });
                });
        }
        $scope.curFilterType.showNull = showNull;
    };
    $scope.loginStatus = function() {
        var status = rcpAid.loginStatus();
        if (status) {
            if (($scope.curLoginStatus && $scope.curLoginStatus !== status)) {
                window.location.reload();
            }
            $scope.curLoginStatus = status;
        }
        return status;
    };
}]);

//侧栏服务
module.controller('serviceCtrl', ['$rootScope', '$scope', '$document', '$timeout', '$q', 'service', function($rootScope, $scope, $document, $timeout, $q, service) {
    $scope.isIe9 = rcpAid.isIE(5, 9);
    $scope.$parent.tabsNavList = [
        { class: 'image-c-chat', name: '群聊', msg: '强化巩固知识试试评测便知！' },
        { class: 'image-user-blue', name: '找老师', isIe9: $scope.isIe9, msg: '学习问题老师统统帮你搞定！' },
        { class: 'image-circle', name: '写圈子', msg: '课程圈子探讨学习分享知识！' },
    ];

    $scope.curTabName = $scope.tabsNavList[0].name;

    $scope.showTabLock = false;
    var defw = Math.round($(window).width() * 0.282258258);
    if (defw < 350) {
        defw = 350;
    }
    var minw = 0;
    var curw = minw;
    var sw = minw;
    var sx = 0;
    var mx = 0;
    var difx = 0;

    //new
    /**
     * [closeServiceTab 关闭右侧栏]
     * @param  {[type]} flag [description]
     * @return {[type]}      [description]
     */
    $scope.closeServiceTab = function(flag) {
        $scope.showTabLock = typeof flag === 'boolean' ? flag : !$scope.showTabLock;
        try { $scope.$digest($scope.showTabLock); } catch (e) {}
        $scope.resizeView($scope.showTabLock ? defw : minw, 'animate');
    };
    /**
     * [switchServiceTab 右侧栏]
     * @param  {[type]} type     [description]
     * @return {[type]}          [description]
     */
    $scope.switchServiceTab = function(tabName) {
        var open = false;
        if ($scope.curTabName !== tabName) {
            open = true;
        }
        $scope.curTabName = tabName;
        $scope.uploadImgIe = {
            status: 'wait',
            rate: 0,
            speed: 0,
            file: [],
            img: []
        };
        if (!$scope.showTabLock || open) {
            //显示关闭按钮
            $scope.showTabLock = true;
            // $scope.resizeView(curw > defw ? curw : defw, 'animate');
            var defw = Math.round($(window).width() * 0.282258258);
            if (defw < 350) {
                defw = 350;
            }
            $scope.resizeView(curw > defw ? curw : defw, 'animate');
            angular.forEach($scope.tabsNavList, function(value) {
                value.active = value.name === tabName;
            });
        } else {
            $scope.closeServiceTab();
        }
    };
    /**
     * [resizeView 设置右侧栏弹出宽度]
     * @param  {[type]} w        [description]
     * @param  {[type]} affect   [description]
     * @return {[type]}          [description]
     */
    $scope.resizeView = function(w, affect) {
        var maxw = $document.width() / 2;
        var val = w < minw ? minw : w > maxw ? maxw : w;
        if (val > 350) {
            val = 450;
        }
        console.log('窗口改变', w, affect, minw, val);
        curw = val;
        if (val) {
            $('.study-circle-w').show();
            var temHieght = $('.content-ctrl')[0].clientHeight;
            $('.study-circle .study-circle-r').height(temHieght);
        } else {
            $('.study-circle-w').hide();
        }
        switch (affect) {
            case 'animate':
                $('#service-v .widthmark').stop().animate({ width: val }, 'fast');
                $('.top-active-bar').stop().animate({ marginRight: val }, 'fast');
                $('.study-circle-w').stop().animate({ width: val ? val - 60 : 0 }, 'fast');

                if ($scope.showTabLock) {
                    $document.one('click', closeRightSidebar);
                }
                break;
            default:
                $('#service-v .widthmark').css({ width: val });
                $('.top-active-bar').stop().css({ marginRight: val });
                $('.study-circle-w').css({ width: val ? val - 60 : 0 });
        }
    };

    function closeRightSidebar() {
        $scope.closeServiceTab(false);
    }

    //监听窗口变动
    $(window).on({
        resize: function() {
            var dw = Math.round($(window).width() * 0.282258258);
            if (350 >= dw && curw === 450) {
                console.log('变小');
                $scope.resizeView(350);
            } else if (dw > curw && curw === 350) {
                console.log('变大');
                $scope.resizeView(450);
            }
        }
    });

    function init() {
        $scope.currentUser = $rootScope.currentUser;
        //判断是否登陆
        $scope.$on('login', function(rs, data) {
            if (!data) {
                service.common.toLogin();
                return;
            }
            $scope.currentUser = $rootScope.currentUser;
        });
        //圈子配置
        $scope.studyCircleConfig = {
            courseId: $scope.courseId,
        };
        //展开目录显示
        $scope.$parent.toggleSection(true);
        $scope.stopPropagation = stopPropagation;
        $scope.$parent.stopPropagation = stopPropagation;
    }
    /**
     * [stopPropagation 阻止事件冒泡]
     * @param  {[type]} ev [description]
     * @return {[type]}    [description]
     */
    function stopPropagation(ev) {
        ev.stopPropagation();
    }
    init();
}]);
module.filter('sanitize', ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);
