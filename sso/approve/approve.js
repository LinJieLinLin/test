if (!module) {
    var module = angular.module('RCP', []);
}
module.controller('approveCtrl', ['$scope', 'request', '$rootScope', '$timeout', function($scope, request, $rootScope, $timeout) {
    //读取config
    var config = {};
    //init
    $scope.init = function() {
        //value
        $scope.userList = [];
        $scope.search = {
            name: '',
            status: '',
            selectTime: '',
        };
        $scope.searchTime = { sTime: '', eTime: '' };
        $scope.nowStatus = '全部';
        $scope.selectList = ['全部', '未审核', '不通过', '已通过'];
        $scope.dateConfig = {
            style: 'expired',
            placeholder: '请选择时间',
            targetElement: angular.element('.no'),
            position: 'bottom'
        };
        //请求的LOADING
        $scope.load = {};
        $scope.load.getUserList = false;
        //function
        config = ssoC.readConfig('sso');

        $scope.initUrl();
        $scope.checkLogin(UINFO);
    };
    //判断是否登陆
    // $scope.$on('login', function(rs, data) {
    //     var url = '';
    //     if (!data.login) {
    //         url = location.origin + location.pathname;
    //         ssoC.redirect(false, '登录', {
    //             url: encodeURIComponent(url)
    //         });
    //         return;
    //     }
    //     ssoC.checkAdmin(data);
    //     //要登陆才执行的函数
    //     $scope.initGetUserList();
    // });
    $scope.checkLogin = function(argData) {
        var url = '';
        if (!argData.uid) {
            url = location.origin + location.pathname;
            ssoC.redirect(false, '登录', {
                url: encodeURIComponent(url)
            });
            return;
        }
        ssoC.checkAdmin(argData);
        $scope.initGetUserList();
    };
    //初始化请求
    $scope.initUrl = function() {
        $scope.requestUrl = {
            searchUser: config.rUrl + 'cert/api/list',
        };
    };
    $scope.initGetUserList = function() {
        //分页变动参数
        $scope.pageUserList = {
            change: true,
            pn: 1,
            ps: 10
        };
    };
    $scope.changeSearch = function(argData, argType) {
        if (argType === 'u') {
            $scope.search.name = argData;
            var getTimeStamp = function(argTime, argType) {
                argTime += ' 00:00:00';
                if (!argType) {
                    return new Date(argTime).getTime();
                } else if (argType) {
                    return new Date(new Date(argTime).getTime() + 24 * 60 * 60 * 1000).getTime();
                }
            };
            if ($scope.searchTime.sTime && $scope.searchTime.eTime) {
                var sTime = getTimeStamp($scope.searchTime.sTime);
                var eTime = getTimeStamp($scope.searchTime.eTime, 1);
                if (sTime > eTime) {
                    var msg = '开始时间不能大于结束时间！';
                    try {
                        binApp.alert(msg, {
                            action: 'top'
                        });
                    } catch (err) {
                        alert(msg);
                    }
                    $scope.searchTime.eTime = '';
                    return;
                }
                $scope.search.selectTime = sTime + ',' + eTime;
            }
        } else if (argType === 's') {
            switch (argData) {
                case '全部':
                    $scope.search.status = '';
                    break;
                case '未审核':
                    $scope.search.status = '1';
                    break;
                case '不通过':
                    $scope.search.status = '2';
                    break;
                case '已通过':
                    $scope.search.status = '3';
                    break;
            }
        }
        $scope.pageUserList.change = !$scope.pageUserList.change;
        $scope.pageUserList.pn = 1;
    };
    //获取提交过实名认证信息的用户列表
    $scope.getUserList = function(args, success) {
        var data = {
            usr_filter: $scope.search.name, //搜索值
            status_filter: $scope.search.status,
            time_filter: $scope.search.selectTime, //搜索值对应的字段
            pn: args.pn || 1,
            ps: args.ps || $scope.pageUserList.ps
        };
        var option = {
            method: 'GET',
            url: $scope.requestUrl.searchUser,
            params: { param: JSON.stringify(data) }
        };
        $scope.load.getUserList = true;
        request(option).then(function(rs) {
            console.log(rs);
            $scope.userList = rs.data;
            angular.forEach($scope.userList, function(d, i) {
                if (!d.attrs) {
                    return;
                }
                if (d.attrs.certification.status === '1') {
                    d.status = '未审核';
                } else if (d.attrs.pass.status === 'false' && d.attrs.certification.status === '2') {
                    d.status = '不通过';
                } else if (d.attrs.pass.status === 'true') {
                    d.status = '已通过';
                }
            });
            success(rs);
            $timeout(function() {
                $scope.load.getUserList = false;
            }, 300);
        }, function(e) {
            $scope.load.getUserList = false;
            console.log(e);
        });
    };
    //进入审核页面
    $scope.toApproveDetail = function(argData) {
        ssoC.redirect(false, '审核页面', { usr: argData.usr[0] });
    };

    //重置搜索内容
    $scope.reset = function() {
        $scope.search = {
            name: '',
            status: '',
            selectTime: '',
        };
        $scope.searchTime = { sTime: '', eTime: '' };
        $scope.nowStatus = '全部';
        $scope.pageUserList.change = !$scope.pageUserList.change;
        $scope.pageUserList.pn = 1;
    };
    $scope.init();
}]);
