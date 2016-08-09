/**
 * Created by LouGaZen on 2016-05-06.
 * 模块说明：管理中心→课程审核
 * 公共组件依赖：pagination, loader-ui, date-time-plugin, default-img
 */

//ca is the short cut of "course approval"

module.controller('caCtrl', ['$scope', 'dialog', '$routeParams', 'course', function ($scope, dialog, $routeParams, course) {

    $scope.courseList = [];//课程列表
    $scope.userList = {};//用户信息列表
    $scope.allCount = 0;//总课程数目
    //课程状态列表：200->待审核，100->已通过，500->未通过，300->已强制下架
    $scope.courseStatus = {
        UNCHECKED: 200,
        CHECKED_SUCCESS: 100,
        CHECKED_FAIL: 500,
        FORCE_CLOSE: 300,
        FORBIDDEN: 400
    };
    //默认显示Tab
    $scope.currentTab = $scope.courseStatus.UNCHECKED;

    //课程图片default-img(directive)配置
    $scope.imgConfig = {
        width: 75,
        height: 45
    };

    if ($scope.currentUser == null || $scope.currentUser.role == '') {
        dialog.alert('请先登录管理员账号');
        return;
    }

    //显示加载圈
    $scope.showLoading = true;
    //用于初始化相关数据，触发pagefn加载课程列表
    var back2Initial = function () {
        $scope.courseName = '';
        $scope.allCount = 0;
        angular.element("#startTime").val('');
        angular.element("#endTime").val('');
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };
    $scope.reset = function () {
        back2Initial();
    };
    /**
     * 加载课程列表
     * @param arg_keyWord 搜索关键字
     * @param callback pagefn回调函数
     */
    $scope.loadCourseList = function (arg_keyWord, callback) {

        var startTime = +moment(angular.element("#startTime").val()).format('x') || '',
            endTime = +moment(angular.element("#endTime").val()).format('x') || '',
            postTime = startTime == '' && endTime == '' ? '' : startTime + ',' + endTime;

        if ((startTime == '' && endTime != '') || (startTime != '' && endTime == '')) {
            dialog.alert("请选择" + (startTime == '' ? "开始" : "结束") + "时间");
            return;
        }

        if (startTime > endTime) {
            dialog.alert("请选择正确的时间范围");
            return;
        }

        $scope.showLoading = true;

        var _params = {
            k: arg_keyWord || undefined,
            sort: $scope.currentTab == $scope.courseStatus.UNCHECKED ? -1 : -7,//未通过页面按创建时间排序，其他页面按审核时间排序
            // sort: -10,
            status: $scope.currentTab,
            pageCount: $scope.pageargs.ps,
            page: $scope.pageargs.pn,
            time: postTime,
            timeMode: 1,
            token: rcpAid.getToken(),
            source: '*'
        };

        course.searchCourse(_params).then(function (data) {
            $scope.courseList = data.data.courses || [];
            $scope.userList = data.data.usr || {};
            $scope.allCount = data.data.allCount || 0;
            $scope.showLoading = false;
            if (angular.isFunction(callback)) {
                data.pa = {
                    total: data.data.allCount,
                    pn: $scope.pageargs.pn,
                    ps: $scope.pageargs.ps
                };
                callback(data);
            }
        }, function (err) {
            // dialog.alert('获取失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '课程审核',
                funcName: 'loadCourseList',
                text: '获取课程列表失败'
            });
            $scope.courseList = [];
            $scope.allCount = 0;
            $scope.showLoading = false;
        });
    };

    /**
     * 审核课程
     * @param arg_cid 课程id
     * @param arg_pass (value range: 0 -> pass, 1 -> fail, 10 -> force_close)
     * @param arg_reason (selectable when arg_pass === 0 || arg_pass === 1)
     */
    $scope.verifyCourse = function (arg_cid, arg_pass, arg_reason) {
        if (arg_pass != 0 && arg_pass != 1 && arg_pass != 10 && arg_pass != 5) {
            dialog.alert("参数错误");
        }

        var _params = {
            cid: arg_cid,
            pass: arg_pass,
            reason: arg_reason || undefined
        };

        course.verifyCourse(_params).then(function (data) {
            dialog.alert("操作成功");
            // $scope.loadCourseList();
            $scope.reset();
        }, function (err) {
            // dialog.alert('操作失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '课程审核',
                funcName: 'verifyCourse',
                text: '操作失败'
            });
        })
    };

    /**
     * 通过uid获取用户名
     * @param uid 用户id
     * @returns {*} nickName: string (form $scope.userList)
     */
    $scope.getUserName = function (uid) {
        return $scope.userList.hasOwnProperty(uid + '') && $scope.userList[uid].hasOwnProperty('attrs') && $scope.userList[uid].attrs.hasOwnProperty('basic') && $scope.userList[uid].attrs.basic.hasOwnProperty('nickName') ? $scope.userList[uid].attrs.basic.nickName : uid;
    };

    /**
     * 切换列表
     * @param arg_tabNum (value range -> $scope.courseStatus)
     */
    $scope.switchTab = function (arg_tabNum) {
        $scope.currentTab = arg_tabNum;
        back2Initial();
    };

    /**
     * 搜索课程，通过改变pageargs值触发pagefn函数
     */
    $scope.searchCourse = function () {
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };

    //定义pagination中的pagefn
    $scope.pagefn = function (args, success) {
        $scope.loadCourseList($scope.courseName || undefined, success);
    };

    /**
     * 获取课程详情url
     * @param arg_cid 课程id
     * @returns {String|*|String|string}
     */
    $scope.getCourseUrl = function (arg_cid) {
        return rcpAid.getUrl('课程详情', {
            cid: arg_cid,
            url: rcpAid.queryString('url'),
            type: 2
        });
    };

    /**
     * 回车事件
     * @param event
     */
    $scope.onKeyDown = function (event) {
        if (event.keyCode === 13) {
            $scope.searchCourse();
        }
    };

    //初始化
    back2Initial();
}]);