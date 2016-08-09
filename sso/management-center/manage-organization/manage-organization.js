/**
 * Created by Fox2081 on 2016/6/21.
 */


//机构管理
module.controller('moCtrl', ['$scope', 'service', function ($scope, service) {


    //分页参数
    $scope.pageArgs = {
        ps: 10,
        pn: 1
    };

    $scope.checkAll = false;

    $scope.listLoading = false;


    //搜素
    $scope.searchKey = '';


    $scope.kwSelect = [{
        name: '用户账号',
        value: 1
    }, {
        name: '机构名称',
        value: 2
    }];
    $scope.kwSelectValue = $scope.kwSelect[0];

    //机构列表
    $scope.orgList = [];

    
    $scope.transTime = function (time) {
        return moment(time).format('YYYY-MM-DD HH:mm');
    };


    /**
     * 重置页码信息（重新获取数据）
     */
    function resetPage() {
        $scope.pageArgs = {
            ps: 15,
            pn: 1
        };
    }

    /**
     * 关键字搜索机构
     */
    $scope.searchByKey = function () {
        resetPage();
    };


    /**
     * 回车事件
     * @param event
     */
    $scope.onKeyDown = function (event) {
        if (event.keyCode === 13) {
            $scope.searchByKey();
        }
    };

    /**
     * 全选
     */
    $scope.checkAllOrg = function () {
        angular.forEach($scope.orgList, function (value, key) {
            value.check = $scope.checkAll;
        });
    };
    
    /**
     * 删除机构
     * @param id
     */
    $scope.orgDel = function (id) {

        var idLength = 0;

        if (angular.isUndefined(id)) {
            var idList = [];
            angular.forEach($scope.orgList, function (value, key) {
                if (value.check) {
                    idList.push(value._id);
                }
            });
            idLength = idList.length;

            if (!idList.length) {
                service.dialog.alert('请先选择机构');
                return;
            } else {
                var id = idList.join(',');
            }
        }


        service.dialog.confirm('删除机构之后不可恢复，确定删除？',{mask: true},function () {

            var postData = {
                kind: 1,
                uids: id
            };

            service.ssoMethod.modifyOrg(postData).then(function (rs) {

                if (rs.code === 0) {
                    service.dialog.alert('机构已删除');

                    if (idLength === $scope.orgList.length) {
                        resetPage();
                    }

                } else {
                    service.dialog.alert('机构删除失败');
                }

                $scope.pageArgs = angular.copy($scope.pageArgs);
            })

        },function () {

        });
    };
    
    /**
     * 重置密码
     * @param id
     */
    $scope.orgResetPw = function (id) {

        if (angular.isUndefined(id)) {
            var idList = [];
            angular.forEach($scope.orgList, function (value, key) {
                if (value.check) {
                    idList.push(value._id);
                }
            });

            if (!idList.length) {
                service.dialog.alert('请先选择机构');
                return;
            } else {
                var id = idList.join(',');
            }
        }


        service.dialog.confirm('重置后，管理员密码变为123456',{mask: true},function () {

            var postData = {
                kind: 2,
                uids: id
            };

            service.ssoMethod.modifyOrg(postData).then(function (rs) {

                if (rs.code === 0) {
                    service.dialog.alert('管理员密码已重置');
                } else {
                    service.dialog.alert('管理员密码重置失败');
                }

                $scope.pageArgs = angular.copy($scope.pageArgs);
            })

        },function () {

        });
    };

    /**
     * 获取列表
     * @param args
     * @param success
     */
    $scope.listFn = function (args, success) {

        $scope.listLoading = true;

        console.log(args)

        var postData = {
            fuzzyName: 1,
            fuzzyAccount: 1,
            page: args.pn,
            pageCount: $scope.pageArgs.ps,
            sort: -1,
        };

        if ($scope.kwSelectValue.value === 1) {
            postData.account = $scope.searchKey;
        } else {
            postData.name = $scope.searchKey;
        }

        service.ssoMethod.getOrgList(postData).then(function (rs) {

            $scope.checkAll = false;

            if (rs.code === 0) {

                console.log(rs.data);
                $scope.orgList = rs.data.orgs;

                angular.forEach($scope.orgList, function (value, key) {
                    value.check = false;
                });

                var tmp = {
                    pa: {
                        total: rs.data.total,
                        pn: $scope.pageArgs.pn,
                        ps: $scope.pageArgs.ps
                    }
                };

                success(tmp);

            } else {
                service.dialog.alert(rs.msg)
            }

            $scope.listLoading = false;

        }, function () {
            $scope.listLoading = false;
        })

    };

}]);
