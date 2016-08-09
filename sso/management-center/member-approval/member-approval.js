/**
 * Created by LouGaZen on 2016-05-06.
 * 模块说明：管理中心→实名认证
 * 公共组件依赖：pagination, loader-ui, head-selector, date-time-plugin
 */

module.controller('maCtrl', ['$scope', 'dialog', 'ssoMethod', function ($scope, dialog, ssoMethod) {

    if ($scope.currentUser.role == '') {
        dialog.alert('请先登录管理员账号');
        return;
    }

    /**
     * 截取返回数据中所需字段
     * @param arg_data: 返回数据中data字段
     * @returns {Array}
     */
    function convertCertData(arg_data) {
        var resultList = [];
        if (arg_data) {
            for (var i = 0, il = arg_data.length; i < il; i++) {
                var _check = arg_data[i].hasOwnProperty('attrs') && arg_data[i].attrs.hasOwnProperty('certification');
                var obj = {
                    //用户账号，目前只选取账号列表中最后一个
                    accountList: [].concat(arg_data[i].hasOwnProperty('usr') ? arg_data[i].usr : []),
                    name:     _check && arg_data[i].attrs.certification.hasOwnProperty('realName') ? arg_data[i].attrs.certification.realName : '',
                    phoneNum: _check && arg_data[i].attrs.certification.hasOwnProperty('phone')    ? arg_data[i].attrs.certification.phone : '',
                    subTime:  _check && arg_data[i].attrs.certification.hasOwnProperty('time')     ? arg_data[i].attrs.certification.time : '',
                    //状态（1待审核 2失败 3成功）
                    status:   _check && arg_data[i].attrs.certification.hasOwnProperty('status')   ? arg_data[i].attrs.certification.status : ''
                };
                resultList.push(obj);
            }
        }
        return resultList;
    }

    //配置搜索栏下拉框
    $scope.kwSelect = [{
        name: '用户账号',
        value: 1
    }, {
        name: '用户姓名',
        value: 2
    }];
    
    // todo select-ui
    // $scope.statusSelect = [{
    //     name: '全部状态',
    //     value: null
    // },{
    //     name: '待审核',
    //     value: 1
    // },{
    //     name: '不通过',
    //     value: 2
    // },{
    //     name: '认证通过',
    //     value: 3
    // }];

    //表头状态筛选
    $scope.memberStatus = {
        '全部状态': null,
        '待审核': '1',
        '不通过': '2',
        '认证通过': '3'
    };

    $scope.certList = [];//人员列表

    //显示加载圈
    $scope.showLoading = true;
    var back2Initial = function () {
        $scope.searchKw = '';//搜索关键字

        $scope.kwSelectValue = $scope.kwSelect[0];//搜索局域网下拉选择值
        // $scope.statusSelectValue = $scope.statusSelect[0]; todo select-ui

        $scope.currentStatus = '全部状态';
        angular.element("#startTime").val('');
        angular.element("#endTime").val('');
        $scope.pageargs = {
            ps: 20,
            pn: 1
        };
    };

    /**
     * 重置按钮
     */
    $scope.reset = function () {
        back2Initial();
    };

    /**
     * 加载人员列表
     * @param arg_keyword 搜索关键字
     * @param arg_filter 筛选状态
     * @param callback pagefn回调函数
     */
    $scope.loadCertList = function (arg_keyword, arg_filter, callback) {
        var startTime = +moment(angular.element("#startTime").val()).format('x') || '',
            endTime = +moment(angular.element("#endTime").val()).format('x') || '',
            postTime = startTime == '' && endTime == '' ? '' : startTime + ',' + endTime;

        if ((startTime == '' && endTime != '') || (startTime != '' && endTime == '')) {
            dialog.alert("请选择" + (startTime == '' ? "开始" : "结束") + "时间");
            return;
        }

        if (startTime > endTime){
            dialog.alert("请选择正确的时间范围");
            return;
        }

        $scope.showLoading = true;

        ssoMethod.GCertList({
            param: {
                pn: $scope.pageargs.pn,
                ps: $scope.pageargs.ps,
                usr_filter: $scope.kwSelectValue.value == 1 ? arg_keyword : '',
                realname_filter: $scope.kwSelectValue.value == 2? arg_keyword : '',
                status_filter: arg_filter,
                time_filter: postTime,
                sequence: "-certification.time"
            }
        }).then(function (data) {
            $scope.showLoading = false;

            $scope.certList = convertCertData(data.data || []);
            if (angular.isFunction(callback)) {
                callback(data);
            }
        }, function (err) {
            // dialog.alert('获取失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '实名认证',
                funcName: 'loadCertList',
                text: '获取人员列表失败'
            });
            $scope.certList = [];
            $scope.showLoading = false;
        });
    };

    /**
     * 搜索操作
     */
    $scope.searchMember = function () {
        // console.log($scope.currentStatus);
        $scope.pageargs = {
            ps: 20,
            pn: 1
        };
    };

    /**
     * 表头筛选状态
     * @param arg_status (value range -> $scope.memberStatus)
     */
    $scope.changeStatus = function (arg_status) {
        $scope.currentStatus = arg_status;
        $scope.pageargs = {
            ps: 20,
            pn: 1
        };
    };

    /**
     * 搜索框回车事件
     */
    $scope.onKeyDown = function (event) {
        if (event.keyCode === 13) {
            $scope.searchMember();
        }
    };

    $scope.pagefn = function (args, success) {
        $scope.loadCertList($scope.searchKw || '', $scope.memberStatus[$scope.currentStatus], success);
    };

    back2Initial();
}]);