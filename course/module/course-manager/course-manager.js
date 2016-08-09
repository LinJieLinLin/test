/**
 * 作者：huangxs
 * 创建时间：2016/4/13
 * 依赖模块说明：loader-ui 加载动画；default-img 显示课程封面图片，带默认图；tips-tool 气泡提示框，用于审核理由提示；pagination 分页组件；confirm-modal 确认框
 * 业务说明：列出老师下的课程，并进行管理
 */

module.controller('courseManagerCtrl', ['$scope', '$rootScope', 'service', 'course', '$location', '$timeout', '$window', function ($scope, $rootScope, service, course, $location, $timeout, $window) {
    //=================================== var ============================
    //请求参数
    var requestParams = {
        isSelf: 1,  //传0,1,10，表示是否只搜自己发布的课程，默认0 不只搜自己的课程，1表示只搜自己的课程，10 只搜自己参与的课程, 50 我可以编辑的课程, 60 我导学的课程
        status: 1,  //课程状态，100 正常 20 用户可编辑状态，即表示用户未发布课程 200 待审核 500 审核被拒 300 表示课程拥有者自己下架/管理员主动下架 1200下架课程，包括300,500， 1 搜索所有 包括20,200,500,300
        type: 10,   //课程类型
        sort: -10,    //排序方式，1创建时间，2课程开始时间,3课程结束时间,4参与人数,5最小价格,6最大价格,7 审核时间,8提交验证（用户发布）的时间，9 用户参与时间排序，正数升序，负数降序
        mode: 5, //选项，1 匹配标签/分类，标题及价格区间 2 匹配标签/分类，标题 3 匹配标题及价格区间 4 匹配标签/分类，及价格区间 5 仅匹配标题 6 仅匹配标签/分类 7 仅匹配价格区间
        source: '*' //加载android端、ios端、pc端的课程数据
    };

    //课程对应的操作
    var operation = {
        toManage: {
            name: '进入管理',   //操作名称
            onclick: gotoManage, //点击回调
            style: 'btn-manager'    //按钮样式,css类名
        },
        toEdit: {
            name: '编辑课程',
            getUrl: getEditUrl  //点击跳转页面，链接
        },
        toCloseCrs: {
            name: '下架课程',
            onclick: closeCourse
        },
        toPublish: {
            name: '发布课程',
            onclick: goToPublish
        },
        toRePublish: {
            name: '重新发布',
            onclick: goToPublish
        },
        toDelete: {
            name: '删除课程',
            onclick: deleteCourse
        },
        quitTeam: {
            name: '退出助学',
            onclick: quitTeam
        }
    };

    //不同课程状态或权限对应的课程操作、状态图标、审核理由提示。20、100、200、300、500课程状态状态码对应后台返回的状态码
    var showByStatus = {
        //未发布，可编辑
        20: {
            name: '未发布',
            reasonTip: '',
            operations: [operation.toManage, operation.toEdit, operation.toPublish],
            icon: 'image-un-pub'
        },
        //已上架，正常
        100: {
            name: '已上架',
            reasonTip: '上架理由:',
            operations: [operation.toManage, operation.toEdit, operation.toCloseCrs],
            icon: ''
        },
        //待审核
        200: {
            name: '待审核',
            reasonTip: '',
            operations: [operation.toManage, operation.toEdit],
            icon: 'image-un-appro'
        },
        //已下架
        300: {
            name: '已下架',
            reasonTip: '下架理由:',
            operations: [operation.toManage, operation.toEdit, operation.toRePublish],
            icon: 'image-un-used'
        },
        //已禁用   todo 后台未完成
        400: {
            name: '已禁用',
            reasonTip: '禁用理由:',
            operations: [operation.toEdit],
            icon: 'image-un-ban'
        },
        //审核未通过
        500: {
            name: '审核未通过',
            reasonTip: '未通过理由:',
            operations: [operation.toManage, operation.toEdit, operation.toRePublish],
            icon: 'image-un-pass'
        },
        
        
        //课程编辑
        1050: {
            operations: [operation.toEdit, operation.quitTeam]
        },
        //教学管理
        1060: {
            operations: [operation.toManage, operation.quitTeam]
        },
        //课程编辑 且 教学管理
        1110: {
            operations: [operation.toManage, operation.toEdit, operation.quitTeam]
        }
    };

    var emptyTips = ['你还没有创建任何内容哦', '这里没有相关课程哦'];   //空数据提示
    var searchCache = {};   //页面切换时，缓存上一个页面的搜索框内容，切回来时还是现实该内容

    $scope.curTab = 0;  //当前tab，列出对应课程列表。0 我的课程，1 我助教的课程，2 回收箱的课程
    $scope.filterKey = '';  //搜索关键字

    $scope.curEmptyTip = emptyTips[0];  //emptyTips[0] 该老师下没有任何课程，emptyTips[1] 因筛选条件返回空

    $scope.myCourseLoaded = false;
    $scope.myCourseList = [];

    $scope.guideCourseLoaded = false;
    $scope.guideCourseList = [];    //我助教的课程

    $scope.deleteCourseLoaded = false;
    $scope.deleteCourseList = [];

    /**
     * 下架课程确认框
     * @type {{}}
     */
    $scope.closeDialog = {
        title: '确定下架？'
    };

    /**
     * 删除课程确认框
     * @type {{}}
     */
    $scope.deleteDialog = {
        course: ''  //删除的课程名
    };

    /**
     * 退出助学确认框
     * @type {{}}
     */
    $scope.quitDialog = {
        course: ''  //退出的课程名
    };

    //=============================== function =========================
    function init() {
        //加载对应的列表及页码，该列表及页码信息在进入管理时保存。eg：由我助学的课程第2页进入课程管理的，返回之后，还是保留在我助学的课程的第2页
        var dt = $rootScope.courseManager;
        var pn = dt && dt.pn;
        if(dt && dt.tab) {
            $scope.guideCrsArgs = initArgs(pn);
            $timeout(function () {
                $scope.myCrsArgs = initArgs();
            });
            $scope.changeTab(1);
        }else {
            $scope.myCrsArgs = initArgs(pn);  //我的课程列表分页参数
            $timeout(function () {
                $scope.guideCrsArgs = initArgs();   //我助教的课程
            });
        }
    }

    /**
     * 初始化分页组件参数
     * @returns {{pn: number, ps: number, pl: number}}
     */
    function initArgs(pn) {
        return {
            pn: pn || 1,  //当前第几页
            ps: 5,  //每页显示的课程数
            pl: 5  //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
        };
    }

    /**
     * 获取课程或题库详情url
     * @param id    课程id
     * @returns {*|String|string}   url
     */
    function getDetailUrl(id) {
        return rcpAid.getUrl('课程详情', {
            cid: id
        });
    }

    /**
     * 进入管理点击回调，跳转到管理页面
     * @param crs   课程，$scope.myCourseList 或 $scope.guideCourseList 数组中的对象
     */
    function gotoManage(crs) {
        if ($scope.myCrsArgs && $scope.guideCrsArgs) {
            //保存当前页码信息，从课程管理页返回的时候直接加载对应页
            var dt = $rootScope.courseManager || ($rootScope.courseManager = {});
            dt.pn = $scope.curTab == 0 ? $scope.myCrsArgs.pn : $scope.guideCrsArgs.pn;
            dt.tab = $scope.curTab;
        }
        $location.path('studentManager/' + $scope.curTab + '/' + crs.id + '/' + crs.title);
    }

    /**
     * 获取编辑页面url
     * @param cid    课程id
     * @returns {*|String|string}   url
     */
    function getEditUrl(cid) {
        return rcpAid.getUrl('创建课程', {
            id: cid
        });
    }

    /**
     * 发布对应的课程
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function goToPublish(crs) {
        course.releaseCourse({
            cid: crs.id
        }).then(function (data) {
            service.dialog.alert('课程已发布,正在审核中');
            $scope.myCrsArgs = initArgs();
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '课程管理',
                funcName: 'goToPublish',
                text: '发布课程失败'
            });
        });
    }

    /**
     * 点击下架课程回调，弹出下架确认框
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function closeCourse(crs) {
        //确认回调
        $scope.closeDialog.okCb = function () {
            goToCloseCourse(crs);
        };
        $scope.closeDialog.show = true;
    }

    /**
     * 下架对应的课程
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function goToCloseCourse(crs) {
        course.cancelCourse({
            cid: crs.id
        }).then(function (data) {
            service.dialog.alert('课程已下架');
            $scope.myCrsArgs = initArgs();
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '课程管理',
                funcName: 'goToCloseCourse',
                text: '下架课程失败'
            });
        });
    }

    /**
     * 点击退出助学回调，弹出确认框
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function quitTeam(crs) {
        //确认回调
        $scope.quitDialog.okCb = function () {
            goToQuitTeam(crs);
        };
        $scope.quitDialog.course = crs.title;   //弹框显示的课程名
        $scope.quitDialog.show = true;
    }

    /**
     * 退出对应的课程助学
     * @param crs  课程，$scope.myCourseList 数组中对象
     */
    function goToQuitTeam(crs) {
        course.quitTeam({
            cid: crs.id
        }).then(function (data) {
            $scope.guideCrsArgs = initArgs($scope.guideCrsArgs.pn);
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '课程管理',
                funcName: 'goToQuitTeam',
                text: '退出助学失败'
            });
        });
    }

    /**
     * 点击删除课程回调，弹出删除确认框
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function deleteCourse(crs) {
        //确认回调
        $scope.deleteDialog.okCb = function () {
            goToDeleteCourse(crs);
        };
        $scope.deleteDialog.course = crs.title;
        $scope.deleteDialog.show = true;
    }

    /**
     * 下架对应的课程
     * @param crs   课程，$scope.myCourseList 数组中对象
     */
    function goToDeleteCourse(crs) {
        course.deleteCourse({
            cid: crs.id
        }).then(function (data) {
            service.dialog.alert('课程删除成功');
            $scope.myCrsArgs = initArgs();
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '课程管理',
                funcName: 'goToDeleteCourse',
                text: '删除课程失败'
            });
        });
    }

    /**
     * 请求加载课程数据
     * @param request   请求参数
     * @param list  存放处理后的数据数组
     * @param tab 0 我的课程，1 我助教的课程， 2 回收箱的课程
     * @param loadflg   加载标志，显示加载动画
     * @param cb    分页回调，传入总数
     */
    function loadCourseData(request, list, tab, loadflg, cb) {
        $scope[loadflg] = false;
        list.length = 0;
        course.getTeacherCourses(angular.extend({}, requestParams, request)).then(function (data) {
            $scope[loadflg] = true;
            if (!data.data || !data.data.allCount) {
                $scope.curEmptyTip = emptyTips[(request && request.k || $scope.curTab != 0 ? 1 : 0)];
                return;
            }
            handleData(data.data, list, tab);
            data.pa = {total: data.data.allCount};
            cb && cb(data);
        }, function (err) {
            $scope[loadflg] = true;
            $scope.curEmptyTip = emptyTips[(request && request.k || $scope.curTab != 0 ? 1 : 0)];

            service.dialog.showErrorTip(err, {
                moduleName: '课程管理',
                funcName: 'loadCourseData',
                text: '获取课程数据失败'
            });
        });
    }

    /**
     * 处理请求返回的数据
     * @param data  请求返回的data
     * @param list  存放处理结果；数组
     * @param tab   0 我的课程，1 我助教的课程， 2 回收箱的课程
     */
    function handleData(data, list, tab) {
        if (!data || !list) {
            console.log('[error][course-manager => handleData]arg data or list is null');
            return;
        }

        var curUid = $rootScope.currentUser && $rootScope.currentUser.uid;  //当前登录用户uid
        var courses = data.courses || [];
        var tmp, crs, arr, level, bool;
        for (var i = 0, len = courses.length; i < len; i++) {
            tmp = courses[i];
            crs = {};

            crs.id = tmp.id;    //课程id
            crs.title = tmp.title;  //课程标题
            crs.imgUrl = tmp.imgs && tmp.imgs[0] || '';    //课程封面
            crs.detailUrl = getDetailUrl(tmp.id);   //该课程对应的课程详情url
            crs.joined = tmp.joined;    //参与人数

            //时间
            crs.start_time = tmp.start_time || '无';
            crs.end_time = tmp.end_time || '无';

            //该课程状态对应图标
            crs.statusIcon = showByStatus[tmp.status] && showByStatus[tmp.status].icon;

            if (tab == 0) {
                //我的课程，对应的操作由课程状态决定
                crs.operationList = showByStatus[tmp.status] && showByStatus[tmp.status].operations || [];
                if (crs.joined === 0) {
                    //只要该课程没有学生参与，就可以删除课程
                    crs.operationList = [].concat(crs.operationList);
                    crs.operationList.push(operation.toDelete);
                }
            } else if (tab == 1) {
                //我助教的课程，对应的操作由权限决定
                arr = tmp.access && tmp.access[curUid];
                if (!angular.isArray(arr) || !arr.length) {
                    console.error('[coruse-manager => handleData]the course team is null.', 'course:', tmp);
                }
                arr = arr || [];
                bool = {};
                level = 0;
                angular.forEach(arr, function (v) {
                    //50 课程编辑,60 教学管理
                    if (!bool[v] && (v == 50 || v == 60)) {
                        level += v;
                        bool[v] = true;
                    }else if (bool[v]) {
                        console.error('[coruse-manager => handleData]the level is repeat.', 'level:', v);
                    } else {
                        console.error('[coruse-manager => handleData]have no such level.', 'level:', v);
                    }
                });
                crs.operationList = showByStatus[1000 + level] && showByStatus[1000 + level].operations || [];
                if (tmp.status == 400 && (level == 60 || level == 110) && crs.operationList[0] == operation.toManage) {
                    //400 课程已禁用，禁用的课程的教学管理(权限)无法进入管理，去掉进入管理的入口
                    crs.operationList = crs.operationList.slice(1);
                }
            } else if (tab == 2) {
                //回收箱的课程操作，只有恢复、删除
                //todo
            } else {
                console.error('[coruse-manager => handleData]illegality tab.', 'curTab:', $scope.curTab);
            }

            //审核理由提示, 课程状态为 100 已上架、300 已下架、 400 已禁用、500 审核未通过，才有审核理由
            if (tmp.extra && tmp.extra.reason && (tmp.status == 100 || tmp.status == 300 || tmp.status == 400 || tmp.status == 500)) {
                crs.tips = {
                    title_top: '课程状态:',
                    title_bottom: showByStatus[tmp.status].reasonTip,
                    info_top: showByStatus[tmp.status].name,
                    info_bottom: tmp.extra.reason
                };
            }

            list.push(crs);
        }
    }

    //============================= scope function =========================
    /**
     * 改变页面
     * @param tab   0 我的课程，1 我助教的课程，2 回收箱的课程
     */
    $scope.changeTab = function (tab) {
        if ($scope.curTab === tab) {
            return;
        }

        //切换页面前
        if ($scope.curTab == 0) {
            searchCache[0] = $scope.filterKey;  //缓存对应的搜索框数据
        } else if ($scope.curTab == 1) {
            searchCache[1] = $scope.filterKey;
        } else if ($scope.curTab == 2) {
            searchCache[2] = $scope.filterKey;
        }

        $scope.curTab = tab;

        //切换页面后
        if ($scope.curTab == 0) {
            $scope.filterKey = searchCache[0] || '';
            //如果为空，显示对应的空数据提示语
            if (!$scope.myCourseList.length) {
                $scope.curEmptyTip = emptyTips[($scope.filterKey ? 1 : 0)];
            }
        } else if ($scope.curTab == 1) {
            $scope.filterKey = searchCache[1] || '';
            //如果为空，显示对应的空数据提示语
            !$scope.guideCourseList.length && ($scope.curEmptyTip = emptyTips[1]);
        } else if ($scope.curTab == 2) {
            $scope.filterKey = searchCache[2] || '';
            $scope.filterKey = '';
            // 显示删除的课程
            $scope.deleteCrsArgs = initArgs();  //回收箱的课程列表分页参数
        }
    };

    /**
     * 创建课程点击回调
     */
    $scope.createCourse = function () {
        $window.open(rcpAid.getUrl('创建课程', {
            type: 10
        }));
    };

    /**
     * 在搜索框输入文字时回车或点击搜索
     * @param ev    事件对象
     */
    $scope.onkeydown = function (ev) {
        if (ev.keyCode === 13) {
            if ($scope.curTab == 0) {
                $scope.myCrsArgs = initArgs();
            } else if ($scope.curTab == 1) {
                $scope.guideCrsArgs = initArgs();
            } else if ($scope.curTab == 2) {
                $scope.deleteCrsArgs = initArgs();
            } else {
                console.error('[course-manager => $scope.onkeydown]want to search but have no match tab.', 'tab:', $scope.curTab);
            }
        }
    };

    /**
     * 我的课程列表换页回调
     * @param args  即 $scope.myCrsArgs
     * @param cb    分页总数传入回调
     */
    $scope.myCrsPageFn = function (args, cb) {
        loadCourseData({
            page: args.pn,
            pageCount: args.ps,
            k: $scope.filterKey
        }, $scope.myCourseList, 0, 'myCourseLoaded', cb)
    };

    /**
     * 我助教的课程列表换页回调
     * @param args  即 $scope.guideCrsArgs
     * @param cb    分页总数传入回调
     */
    $scope.guideCrsPageFn = function (args, cb) {
        loadCourseData({
            page: args.pn,
            pageCount: args.ps,
            k: $scope.filterKey,
            isSelf: 110
        }, $scope.guideCourseList, 1, 'guideCourseLoaded', cb)
    };

    /**
     * 回收箱的课程列表换页回调
     * @param args  即 $scope.deleteCrsArgs
     * @param cb    分页总数传入回调
     */
    $scope.deleteCrsPageFn = function (args, cb) {
        //todo
        loadCourseData({
            page: args.pn,
            pageCount: args.ps,
            k: $scope.filterKey,
            status: 500
        }, $scope.deleteCourseList, 2, 'deleteCourseLoaded', cb)
    };

    //=============================== init ==================================
    init();
}]);
