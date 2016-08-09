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

module.controller('contentCtr', ['$rootScope', '$scope', '$timeout', 'service', 'cvfa', function($rootScope, $scope, $timeout, service, cvfa) {
    //停用vconsole
    var three = 1;
    $timeout(function() { $('#__vconsole').hide(); }, 1000);
    $('.content-iframe').on('click', function() {
        if (three == 3) {
            $('#__vconsole').show();
        }
        three += 1;
        setTimeout(function() {
            three--;
        }, 500);
    });
    R.args.iids = { iid: [] };
    window.mobileUpgradeStyle = 1;
    var dialogAlert = function(msg) {
        if (msg === '请先登录') {
            service.loginModal.show();
        } else {
            alert(msg);
        }
    };
    //loading 时间
    var loadTime = 200;
    $scope.getRecordReady = false;
    //当前章节信息
    $scope.nowSection = {};
    //当前用户信息
    $scope.currentUser = {};
    //章节ID
    $scope.targetId = rcpAid.queryString("target");
    //课程ID
    $scope.courseId = rcpAid.queryString("cid");
    $scope.isNullContent = false;
    $scope.learningLocationData = {};
    $rootScope.learningDialog = {};
    //加载的loading
    loadingLayer.in();
    //---------------新----------------------
    //判断是否登陆
    $scope.$on('login', function(rs, data) {
        if (!data) {
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
        service.common.checkLogin();
    };
    /**
     * [courseDetail 读取课程信息]
     * @return {[type]} [description]
     */
    $scope.courseDetail = function() {
        var searchData = { text: { idx: { type: 'items' } } };
        var data = {
            cid: $scope.courseId,
            cmds: angular.toJson(searchData),
        };
        service.course.getCourseDetail(data).then(function(rs) {
            $scope.courseDetailHub(rs);
        }, function() {
            $scope.endingLoading();
        });
    };
    /**
     * [courseDetailHub 读取课程信息回调]
     * @param  {[type]} rs [description]
     * @return {[type]}    [description]
     */
    $scope.courseDetailHub = function(rs) {
        if (rs.code !== 0) {
            dialogAlert(rs.msg);
            $scope.endingLoading();
            return;
        }
        $rootScope.courseData = rs.data;
        $rootScope.readPermissions = $rootScope.courseData.joinMode;
        if ($rootScope.readPermissions === 100) {
            $scope.self = true;
        }
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
        if ($rootScope.readPermissions) {
            $scope.showNewContentView();
        } else {
            $scope.endingLoading();
            return;
        }
    };
    /**
     * [toDestination 进入指定章节]
     * @param  {[type]} sid [章节ID]
     * @return {[type]}     [description]
     */
    $scope.toDestination = function(sid) {
        if (!$scope.contentLoadingReady && typeof $scope.contentLoadingReady !== 'undefined') {
            dialogAlert("内容正在加载中，请稍后");
            return;
        }
        //通过本地跳转
        cvfa.locateContentTarget(sid);
    };
    /**
     * [showNewContentView 课程内容显示]
     * @return {[type]} [description]
     */
    $scope.showNewContentView = function() {
        qCtLoading();
        $scope.getRecordReady = false;
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
            cvfa.getLearnRecord([$rootScope.currentUser.uid + '_' + $scope.courseId], function(rs) {
                $scope.endingLoading();
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
                $scope.endingLoading();
                $scope.getRecordReady = true;
                showContent();
                console.log(e);
                try {
                    service.dialog.alert(e.data.data.msg);
                } catch (err) {
                    service.dialog.alert('读取记录出错！');
                }
            });
        } else {
            showContent();
        }
    };

    function qCtLoading() {
        $rootScope.sectionLoadingReady = false;
        $rootScope.contentLoadingReady = undefined;
    }
    /**
     * [showNewContentView 显示]
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
            t: "T",
            n: 3,
            target: $scope.targetId
        }).init();
        $scope.$on("cvfaInitReady", function() {
            $scope.endingLoading('newLock');
        });

        $scope.$on("cvfaInitError", function(ev, err, xhr) {
            $scope.endingLoading('newLock');
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
        /**
         * [内容加载完成]
         * @param  {[type]} )
         * @return {[type]}   [description]
         */
        $scope.$on("makeContentReady", function() {
            $rootScope.contentLoadingReady = true;
            loadingLayer.out();
        });

        $scope.$on("makeContentError", function(ev, type, err) {
            $rootScope.contentLoadingReady = true;
            loadingLayer.out();
        });

        $scope.$on("locateContentTarget", function() {
            $rootScope.contentLoadingReady = false;
            loadingLayer.in();
        });
    }
    // 课程内容显示 end ********************************
    /**
     * [endingLoading 停止load]
     * @return {[type]} [description]
     */
    $scope.endingLoading = function() {
        $rootScope.sectionLoadingReady = true;
        $scope.contentLoadingReady = true;
        $timeout(function() { loadingLayer.out(); }, loadTime);
    };
    $scope.getNowSection = function() {
        try {
            mobilePlug($scope.nowSection, 'section');
        } catch (e) {}
    };
    //离开，回到、更新试卷状态
    $scope.backPage = function(argType) {
        try {
            if (argType) {
                cvfa.pageFocus();
            } else {
                cvfa.pageBlur();
            }
        } catch (e) {}
    };
    //暂停滚动
    $scope.pauseScroll = function(argType) {
        try {
            cvfa.stopScroll = argType;
        } catch (e) {}
    };
    //记录预览页
    $scope.setViewPage = function(argPage) {
        if (!cvfa.nowViewKey) {
            return;
        }
        cvfa.setKeyValue(cvfa.nowViewKey, argPage);
    };
    $scope.init();

    //未知内容
    $scope.$on("freshReady", function(event, fresh) {
        $scope.contentLoadingReady = fresh;
        if (fresh) {
            loadingLayer.out();
        } else {
            loadingLayer.in();
        }
    });
    $scope.continueLearning = function(ev) {
        $scope.$broadcast("continueLearning", $(ev.target).html());
    };
}]);

/**
 * [jumpPage 外部调用进入指定章节]
 * @param  {[type]} sid [description]
 * @return {[type]}     [description]
 */
function jumpPage(sid) {
    angular.element($("div[ng-controller='contentCtr']")[0]).scope().toDestination(sid);
}
/**
 * [getNowSection 获取当前章节]
 * @return {[type]} [description]
 */
function getNowSection() {
    angular.element($("div[ng-controller='contentCtr']")[0]).scope().getNowSection();
}
/**
 * [backPage 0离开学习页，1回到学习页并更新试卷状态]
 * @return {[type]} [description]
 */
function backPage(argType) {
    angular.element($("div[ng-controller='contentCtr']")[0]).scope().backPage(argType);
}
/**
 * [pauseScroll 暂停滚动页面]
 * @param  {[type]} argType [true暂停，false取消暂停]
 * @return {[type]}         [description]
 */
function pauseScroll(argType) {
    angular.element($("div[ng-controller='contentCtr']")[0]).scope().pauseScroll(argType);
}
/**
 * [预览文档记录]
 * @param {[type]} argPage [description]
 */
function setViewPage(argPage) {
    angular.element($("div[ng-controller='contentCtr']")[0]).scope().setViewPage(argPage);
}
