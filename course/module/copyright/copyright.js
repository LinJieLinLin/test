/**
 * 作者：huangxs
 * 创建时间：2016/6/8
 * 依赖模块说明：detail-modal 课程详情框或课程转让框；confirm-modal 确认框；loader-ui 加载动画；pagination 分页组件；empty-tip 空数据显示图；
 * 业务说明：列出接收的课程、转让的课程，并可进行转让课程操作
 */

module.controller('copyrightCtr', ['$scope', '$rootScope', '$timeout', 'service', 'course', function ($scope, $rootScope, $timeout, service, course) {
    //===================== var =================================
    //接收课程列表请求参数
    var receiveRequest = {
        mode: 1,    //1 查看接收的课程 -1 查看转让的课程
        sort: -1    //排序，正数升序，负数降序，1 发起转让时间排序 2 确认转让时间排序
    };

    //转让课程列表请求参数
    var transferRequest = {
        mode: -1,   //1 查看接收的课程 -1 查看转让的课程
        sort: -1    //排序，正数升序，负数降序，1 发起转让时间排序 2 确认转让时间排序
    };

    var isCacheCourseList = false;   //是否缓存转让课程操作中的课程下拉列表。如果缓存，第二次打开转让课程框时不再请求可转让的课程列表
    var cacheCourseList = null;

    var isCacheCourse = false;   //是否缓存课程详情的数据。如果缓存，第二次打开详情框时不再请求对应的课程详情信息
    var cacheCourse = {};

    var curUser = $rootScope.currentUser && $rootScope.currentUser.nickName || '';  //当前登录用户昵称

    //===================== scope var =================================
    $scope.curTab = 0;  //当前选中的选项。0 接收的课程，1 转让的课程

    //接收课程列表
    $scope.receiveLoaded = false;
    $scope.receiveList = [];
    $scope.receivePage = initPageArgs();

    //转让课程列表
    $scope.transferLoaded = false;
    $scope.transferList = [];
    $scope.transferPage = initPageArgs();

    //接收课程各个状态对应的文字显示。 0 成功，1 等待，2 失败, 3 取消
    $scope.receiveStatusText = {
        0: '已接收',
        1: '待接收',
        2: '已拒绝',
        3: '已取消'
    };

    //转让课程各个状态对应的文字显示。 0 成功，1 等待，2 失败, 3 取消
    $scope.transferStatusText = {
        0: '已转让',
        1: '转让中',
        2: '转让失败',
        3: '已取消'
    };

    //取消转让操作确认框
    $scope.dialog = {
        show: false,
        course: '', //课程名
        user: '',   //转让对象
        okCb: ''    //确认回调函数
    };

    //详情框或转让操作框参数
    $scope.modalType = 2;   //0 转让课程详情框，1 接收课程详情框，2 转让课程操作框
    $scope.modalShow = false;
    $scope.detailData = {}; //显示的数据

    //================================= function ==============================
    /**
     * 初始化并返回分页参数
     * @returns {{pn: number, ps: number, pl: number}}
     */
    function initPageArgs() {
        return {
            pn: 1,  //当前第几页
            ps: 15,  //每页显示的课程数
            pl: 5
        };
    }

    /**
     * 请求对应的数据
     * @param request   请求参数，receiveRequest对象 或 transferRequest对象
     * @param list  存放数据的数组，$scope.receiveList 或 $scope.transferList
     * @param loadflag  加载标志，‘receiveLoaded’或 ‘transferLoaded’
     * @param args  分页参数，$scope.receivePage 或 $scope.transferPage
     * @param cb    分页组件回调函数
     */
    function requestData(request, list, loadflag, args, cb) {
        $scope[loadflag] = false;
        request.page = args.pn;
        request.pageCount = args.ps;
        course.listTransfer(request).then(function (data) {
            list.length = 0;
            $scope[loadflag] = true;
            if (!data && !data.data) {
                console.log('[error]', '获取接收的课程数据返回空', data);
                return;
            }
            dataHandle(data.data, list);
            data.pa = {total: data.data.allCount};
            cb(data);
        }, function (err) {
            $scope[loadflag] = true;
            service.dialog.showErrorTip(err, {
                moduleName: '版权转让',
                funcName: 'requestData',
                text: '获取' + (request.mode == 1 ? '接收' : '转让') + '的课程失败'
            });
        });
    }

    /**
     * 处理后台返回的数据，并将结果放入list中
     * @param data  后台返回的data
     * @param list    存放数据的数组，$scope.receiveList 或 $scope.transferList
     */
    function dataHandle(data, list) {
        var transfer = data.transfer;
        // console.log('transfer data', transfer, !transfer || !transfer.length);
        if (!transfer || !transfer.length) {
            console.log('transfer list data is null', transfer);
            return;
        }

        //获得用户uid对应的用户昵称
        var getUserName = function (uid) {
            return data.usr && data.usr[uid] && data.usr[uid].attrs && data.usr[uid].attrs.basic && data.usr[uid].attrs.basic.nickName || '';
        };

        //获得处理过的教师团队
        var getTeam = function (team) {
            var arr = [];
            if (angular.isArray(team)) {
                angular.forEach(team, function (v) {
                    if (v.level && v.level.length == 1 && v.level[0] == 100) {
                        return;
                    }
                    v.uid && arr.push({
                        uid: v.uid,
                        name: getUserName(v.uid)
                    });
                });
            }
            return arr;
        };

        //0 成功，1 等待，2 失败, 3 取消
        var statusMap = {
            'AGREED': 0,
            'WAITING': 1,
            'REFUSED': 2,
            'CANCEL': 3
        };

        angular.forEach(transfer, function (v) {
            list.push({
                cid: v.cid,
                name: v.title,
                toUser: getUserName(v.uid),
                time: v.createTime,
                status: statusMap[v.status],
                teamKeep: v.mode != -1,
                team: getTeam(v.team)
            });
        });
    }

    /**
     * 转让对应的课程
     * @param cid   课程id
     * @param aggree    是否同意放弃课程版权
     * @param toUser    转让对象，{uid: 用户id, name: 用户昵称}
     */
    function transfer(cid, aggree, toUser) {
        if (cid && aggree && toUser) {
            course.publishTransfer({
                cid: cid,
                tuid: toUser.uid
            }).then(function (data) {
                $scope.transferPage = initPageArgs();
                $scope.detailData.reset && $scope.detailData.reset();
            }, function (err) {
                if (err && err.data && err.data.data && err.data.data.code == 2){
                    service.dialog.alert('该课程正在转让中');
                }else {
                    service.dialog.showErrorTip(err, {
                        moduleName: '版权转让',
                        funcName: 'transfer',
                        text: '转让课程失败'
                    });
                }
            });
        }
    }

    /**
     * 请求加载课程详情数据
     * @param cid   要加载课程详情的课程id，可为空，空的时候加载可转让的课程列表
     * @param show  加载完后是否显示详情框
     * @param team  显示教师团队的方式。true 显示 $scope.detailData.teachers 中的数据，false 显示后台加载返回的团队信息
     * @param author 版权作者昵称，可为空，为空时显示后台返回的版权作者昵称
     * @param force 是否忽略缓存强制请求加载后台数据
     */
    function loadCourseDetail(cid, show, team, author, force) {
        if (!cid && isCacheCourseList && cacheCourseList && !force) {
            courseDataHandle(cacheCourseList, team, author);
            courseListHandle(cacheCourseList.course);
            show && ($scope.modalShow = true);
            return;
        }
        if (cid && isCacheCourse && cacheCourse[cid] && !force) {
            courseDataHandle(cacheCourse[cid], team, author);
            show && ($scope.modalShow = true);
            return;
        }
        course.loadTransferCourse(cid && {cid: cid} || {}).then(function (data) {
            if (!data && !data.data) {
                console.log('[error]', '获取课程详情数据返回空', 'cid:', cid, 'data:', data);
                return;
            }
            courseDataHandle(data.data, team, author);
            cid && isCacheCourse && (cacheCourse[cid] = data.data);
            if (!cid) {
                courseListHandle(data.data.course);
                isCacheCourseList && (cacheCourseList = data.data);
            }
            show && ($scope.modalShow = true);
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '版权转让',
                funcName: 'transfer',
                text: '请求课程详情失败'
            });
        });
    }

    /**
     * 处理返回的课程详情数据，并将数据绑定到 $scope.detailData 中
     * @param data  后台返回的 data
     * @param team  显示教师团队的方式。true 显示 $scope.detailData.teachers 中的数据，false 显示后台加载返回的团队信息
     * @param author    版权作者昵称，可为空，为空时显示后台返回的版权作者昵称
     */
    function courseDataHandle(data, team, author) {
        if (!data) {
            return;
        }

        var getUserName = function (uid) {
            return data.usr && data.usr[uid] && data.usr[uid].attrs && data.usr[uid].attrs.basic && data.usr[uid].attrs.basic.nickName || '';
        };

        var scope = $scope.detailData;
        var crs = data.crs;
        if (crs) {
            scope.cid = crs._id;    //课程id
            scope.name = crs.title; //课程名称
            scope.credit = crs.credit || 0;   //课程学分
            scope.period = crs.period || 0;  //课程学时
            scope.startTime = crs.start_time || ''; //开课时间
            scope.endTime = crs.end_time || ''; //结束时间
            scope.joined = crs.joined;  //学生人数
            scope.author = author || getUserName(crs.uid);  //版权作者
            scope.cover = crs.imgs && crs.imgs[0] || '/rcp-common/imgs/icon/gray-default-img.png';  //课程封面

            if (crs.access && !team) {
                scope.teachers = [];
                scope.teachersKeep = 0;
                for (var p in crs.access) {
                    if (crs.access.hasOwnProperty(p) && p != crs.uid) {
                        scope.teachers.push(getUserName(p));
                    }
                }
            }

            if (team) {
                for (var i = 0; i < scope.teachers.length; i++) {
                    if(typeof scope.teachers[i] === 'object'){
                        if(scope.teachers[i].uid == crs.uid){
                            scope.teachers.splice(i, 1);
                            i--;
                            continue;
                        }
                        scope.teachers[i] = scope.teachers[i].name;
                    }
                }
            }
        }

        var summary = data.summary;
        if (summary) {
            scope.desc = summary.c || '';
        }
    }

    /**
     * 处理返回的可转让课程列表数据，并放入 $scope.detailData.options 数组中
     * @param list  后台返回的课程列表数据
     */
    function courseListHandle(list) {
        if (!list) {
            return;
        }
        var arr = $scope.detailData.options || ($scope.detailData.options = []);
        arr.length = 0;
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].title && list[i]._id) {
                arr.push({
                    name: list[i].title,
                    cid: list[i]._id
                });
            }
        }
        // $scope.detailData.selectCid = arr[0] && arr[0].cid || '';
        $scope.detailData.selectCrs = arr[0];   //默认选择第一个课程
    }

    //================================= scope function ==============================
    /**
     * 顶部栏点击回调，重复点击会刷新页面
     * @param tag   0 接收的课程，1 转让的课程
     */
    $scope.tabClick = function (tag) {
        tag == 0 && $scope.curTab == tag && ($scope.receivePage = initPageArgs());
        tag == 1 && $scope.curTab == tag && ($scope.transferPage = initPageArgs());
        $scope.curTab = tag;
    };

    /**
     * 同意接受课程
     * @param item  要接受的课程，$scope.receiveList 中的对象
     * @param clear 是否清除原有的老师团队
     */
    $scope.resolve = function (item, clear) {
        //item.status: 1 等待接收的课程状态；其它状态非法
        if (item.status != 1) {
            return;
        }
        // console.log('同意', 'clear', clear ? '清除团队' : '保留团队');
        var request = {
            cid: item && item.cid || ''
        };
        clear && (request.mode = '-1');
        course.agreeTransfer(request).then(function (data) {
            service.dialog.alert('成功接收课程');
            $scope.receivePage = initPageArgs();
            $scope.detailData.reset && $scope.detailData.reset();

            $timeout(function () {
                loadCourseDetail('', false, undefined, undefined, true);
            });
        }, function (err) {
            if (err.data && err.data.data && err.data.data.code == 2) {
                $scope.receivePage = initPageArgs();
                service.dialog.alert('对方已取消转让课程');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '版权转让',
                    funcName: '$scope.resolve',
                    text: '同意接收课程失败'
                });
            }
        });
    };

    /**
     * 拒绝接受课程
     * @param item  要拒绝的课程，$scope.receiveList 中的对象
     */
    $scope.reject = function (item) {
        //item.status: 1 等待接收的课程状态；其它状态非法
        if (item.status != 1) {
            return;
        }
        course.refuseTransfer({cid: item && item.cid || ''}).then(function (data) {
            service.dialog.alert('已拒绝接收课程');
            $scope.receivePage = initPageArgs();
            $scope.detailData.reset && $scope.detailData.reset();
        }, function (err) {
            if (err.data && err.data.data && err.data.data.code == 2) {
                $scope.receivePage = initPageArgs();
                service.dialog.alert('对方已取消转让课程');
            }else {
                service.dialog.showErrorTip(err, {
                    moduleName: '版权转让',
                    funcName: '$scope.reject',
                    text: '拒绝接收课程失败'
                });
            }
        });
    };

    /**
     * 取消转让中课程的转让
     * @param item  要拒绝的课程，$scope.transferList 中的对象
     */
    $scope.cancelTransfer = function (item) {
        //item.status: 1 正在转让的课程状态；其它状态非法
        if (item.status != 1) {
            return;
        }
        var dialog = $scope.dialog;
        dialog.course = item.name;
        dialog.user = item.toUser;
        dialog.okCb = function () {
            course.cancelTransfer({
                cid: item.cid
            }).then(function (data) {
                service.dialog.alert('已取消转让课程');
                $scope.transferPage = initPageArgs();
            }, function (err) {
                if (err.data && err.data.data && err.data.data.code == 2) {
                    //对方已经同意或拒绝课程，再取消转让时刷新列表，此时无法成功取消转让，需要刷新状态
                    $scope.transferPage = initPageArgs();
                    service.dialog.alert('对方已同意或拒绝接收课程');
                    console.log('[error][copyright => $scope.cancelTransfer]取消转让课程失败', err);
                }else {
                    service.dialog.showErrorTip(err, {
                        moduleName: '版权转让',
                        funcName: '$scope.cancelTransfer',
                        text: '取消转让课程失败'
                    });
                }
            });
        };
        dialog.show = true;
    };

    /**
     * 转让课程按钮点击回调，弹出转让课程操作框
     */
    $scope.toTransfer = function () {
        $scope.modalType = 2;
        $scope.detailData.title = '课程转让操作';
        $scope.detailData.okCb = transfer;
        $scope.detailData.changeCb = loadCourseDetail;
        loadCourseDetail('', true);
    };

    /**
     * 点击查看详情回调，弹出对应的详情框
     * @param item  要查看详情的课程，$scope.receiveList 或 $scope.transferList 中的对象
     * @param tag   0 接收的课程，1 转让的课程
     */
    $scope.lookDetail = function (item, tag) {
        if ($scope.modalShow) {
            return;
        }
        var data = $scope.detailData;
        var team = false;
        var author = '';
        data.showKeep = item.status == 0;

        if (item.status != 1 || tag != 0) {
            $scope.modalType = 0;
            data.title = '课程转让详情';
            data.teachers = item.team;
            data.teachersKeep = item.teamKeep;
            team = true;
        } else {
            $scope.modalType = 1;
            data.title = '课程接收操作';
            data.okCb = function (cid, b) {
                $scope.resolve(item, !b);
            };
            data.cancelCb = function () {
                $scope.reject(item);
            };
        }

        if (tag == 0) {
            author = item.toUser;
            data.toUser = curUser;
        } else {
            author = curUser;
            data.toUser = item.toUser;
            item.status == 1 && (team = false);
        }

        loadCourseDetail(item.cid, true, team, author);
    };

    /**
     * 分页组件回调，加载接收的课程列表
     * @param args  分页参数
     * @param cb    分页组件总数回调函数
     */
    $scope.receiveLoadFn = function (args, cb) {
        requestData(receiveRequest, $scope.receiveList, 'receiveLoaded', args, cb);
    };

    /**
     * 分页组件回调，加载转让的课程列表
     * @param args  分页参数
     * @param cb    分页组件总数回调函数
     */
    $scope.transferLoadFn = function (args, cb) {
        requestData(transferRequest, $scope.transferList, 'transferLoaded', args, cb);
    };

    //====================== init =======================
    //左侧菜单重复点击时刷新
    $scope.$on('bar-repeat-click', function (ev, tag) {
        if (tag == 'copyright') {
            $scope.receivePage = initPageArgs();
            $scope.transferPage = initPageArgs();
        }
    });

    //加载可转让课程列表
    $timeout(function () {
        loadCourseDetail('', false);
    });
}]);