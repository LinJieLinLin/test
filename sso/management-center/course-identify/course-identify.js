/**
 * Created by LouGaZen on 2016-06-16.
 * 模块说明：管理中心→课程认证
 */

module.controller('ciCtrl', ['$scope', '$rootScope', 'course', 'dialog', function ($scope, $rootScope, course, dialog) {
    //默认显示Tab
    $scope.currentTab = 'WAITING';

    $scope.imgConfig = {
        width: 75,
        height: 45
    };

    var orgId = $rootScope.currentUser.org && $rootScope.currentUser.org != '' ? $rootScope.currentUser.org.orgid : '';

    if (orgId == '') {
        dialog.alert('请登录有效的机构管理账号');
        return;
    }

    //截取课程列表所需数据
    function convertCourseData(arg_data) {
        var _list = [];
        if (arg_data) {
            arg_data.forEach(function (element) {
                _list.push({
                    id: element.cid || '',
                    uid: element.uid || '',
                    title: element.title || '',
                    authId: element.authId || '',
                    img: element.hasOwnProperty('imgs') && element.imgs ? element.imgs[0] : '',
                    joined: element.joined || 0,
                    subTime: element.submitTime || 0
                });
            })
        }
        return _list;
    }

    $scope.courseList = [];
    $scope.userList = {};
    $scope.showLoading = false;
    $scope.allCount = 0;

    var loadPage = function () {
        $scope.pageArgs = {
            ps: 10,
            pn: 1
        }
    };

    var back2Initial = function () {
        $scope.searchKw = '';
        $scope.allCount = 0;
        angular.element("#startTime").val('');
        angular.element("#endTime").val('');
        loadPage();
    };
    $scope.reset = function () {
        back2Initial();
    };

    $scope.pageFn = function (args, callback) {
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

        //获取课程认证列表需要传host参数
        var _host = rcpAid.queryString('url');
        _host = _host.substring(_host.indexOf('://') + 3);
        _host = _host.substring(0, _host.indexOf('/'));
        console.log(_host, 'url');

        course.listAuth({
            orgId: orgId,
            page: args.pn,
            pageCount: args.ps,
            status: $scope.currentTab,
            title: $scope.searchKw,
            time: postTime,
            host: _host,
            source: '*'
        }).then(function (data) {
            console.log(data);
            $scope.courseList = convertCourseData(data.data.auth || []);
            $scope.userList = data.data.usr || {};
            $scope.allCount = data.data.allCount || 0;
            $scope.showLoading = false;
            callback({pa: {total: $scope.allCount}});
        }, function (err) {
            // dialog.alert('获取列表错误，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '课程认证',
                funcName: 'pageFn',
                text: '获取列表失败'
            });
            $scope.showLoading = false;
        })
    };

    $scope.authCourse = function (arg_cid, arg_pass) {
        if (arg_pass != 1 && arg_pass != -1) {
            dialog.alert('[authCourse] invalid value of pass');
        } else {
            course.commitAuth({
                cid: arg_cid,
                orgId: orgId,
                pass: arg_pass
            }).then(function (data) {
                if (data.code == 0) {
                    dialog.alert('操作成功');
                    back2Initial();
                }
                console.log(data);
            }, function (err) {
                // dialog.alert('操作失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '',
                    funcName: '',
                    text: ''
                });
                console.log(err);
            });
        }
    };

    $scope.searchCourse = function () {
        loadPage();
    };

    $scope.onKeyDown = function ($event) {
        if ($event.keyCode === 13) {
            $scope.searchCourse();
        }
    };

    $scope.switchTab = function (arg_tab) {
        $scope.currentTab = arg_tab;
        back2Initial();
    };

    $scope.getCourseUrl = function (arg_obj) {
        return rcpAid.getUrl('课程详情', {
            cid: arg_obj.id,
            authId: arg_obj.authId,
            orgId: orgId,
            url: rcpAid.queryString('url'),
            type: 3
        });
    };

    $scope.getUserName = function (arg_uid) {
        var _check = $scope.userList.hasOwnProperty(arg_uid) &&
            $scope.userList[arg_uid].hasOwnProperty('attrs') &&
            $scope.userList[arg_uid].attrs.hasOwnProperty('basic') &&
            $scope.userList[arg_uid].attrs.basic.hasOwnProperty('nickName');

        return _check ? $scope.userList[arg_uid].attrs.basic.nickName : arg_uid;
    };

    back2Initial();
}]);