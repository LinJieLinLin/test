if (!module) {
    var module = angular.module('RCP', []);
}
module.controller('approveDetailCtrl', ['$scope', 'request', '$rootScope', '$timeout', function($scope, request, $rootScope, $timeout) {
    //读取config
    var config = {};
    //init
    $scope.init = function() {
        //value
        $scope.userList = [];
        $scope.verifyData = {};
        $scope.search = {
            key: ssoC.queryString('usr'),
            field: '',
        };
        //function
        config = ssoC.readConfig('sso');
        $scope.initUrl();
        $scope.getUserList();
    };
    //初始化请求
    $scope.initUrl = function() {
        $scope.requestUrl = {
            searchUser: config.rUrl + 'cert/api/list',
            updateCert: config.rUrl + 'cert/api/update'
        };
    };

    //获取某个实名认证的用户信息
    $scope.getUserList = function() {
        if (!$scope.search.key) {
            ssoC.redirect(false, '个人中心');
            return;
        }
        var data = {
            usr_filter: $scope.search.key, //搜索值
            status_filter: '',
            p: '1',
            pn: 1,
            ps: 10
        };
        var option = {
            method: 'GET',
            url: $scope.requestUrl.searchUser,
            params: { param: JSON.stringify(data) }
        };
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
                if (d.usr[0] === ssoC.queryString('usr')) {
                    $scope.verifyData = d;
                }
            });
        }, function(e) {
            console.log(e);
        });
    };

    //通过/不通过实名认证
    $scope.updateCert = function(argType) {
        if (!$scope.verifyData.id) {
            console.log('用户信息有误');
            return;
        }
        var status = argType ? 'true' : 'false';
        var data = {
            attrs: {
                pass: {
                    status: status
                }
            },
            id: $scope.verifyData.id
        };
        var option = {
            method: 'POST',
            url: $scope.requestUrl.updateCert,
            data: angular.toJson(data),
            params: {}
        };
        request(option).then(function(rs) {
            var msg = '操作成功！';
            try {
                binApp.alert(msg, {
                    action: 'top'
                });
            } catch (err) {
                alert(msg);
            }
            $timeout(function() {
                ssoC.redirect(false, '审核列表');
            }, 1000);
        }, function(e) {
            console.log(e);
        });
    };

    //判断是否登陆
    $scope.$on('login', function(rs, data) {
        var url = '';
        if (!data.login) {
            url = location.origin + location.pathname;
            ssoC.redirect(false, '登录', {
                url: encodeURIComponent(url)
            });
            return;
        }
        ssoC.checkAdmin(data);
        $scope.userInfo = data;
        console.log(data);
    });
    $scope.init();
}]);
