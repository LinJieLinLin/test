/**
 * Created by Fox2081 on 2016/6/21.
 */


module.controller('moeCtrl', ['$scope', '$routeParams', 'service', '$timeout', function ($scope, $routeParams, service, $timeout) {


    console.log($routeParams)

    $scope.type = $routeParams.type;


    $scope.typeOpt = {
        'new': {
            title: '创建机构'
        },
        'edit': {
            title: '编辑机构'
        }
    };


    //机构信息
    $scope.orgInfo = {
        attrs: {
            org: {
                name: '',
                tags: [
                    ''
                ]
            },
        }
    };

    //机构额外信息
    $scope.orgExt = {
        pw: ''
    };

    /**
     * 获取机构信息
     * @param id
     */
    $scope.getOrgInfo = function (id) {


        var postData = {
            orgid: id,
            page: 1,
            pageCount: 1
        };

        service.ssoMethod.getOrgList(postData).then(function (rs) {

            if (rs.code === 0) {

                console.log(rs.data);
                if (rs.data.orgs.length) {
                    $scope.orgInfo = rs.data.orgs[0];
                } else {
                    service.dialog.alert('找不到机构信息');
                }

            } else {
                service.dialog.alert(rs.msg);
            }

        });
    };


    var cFlag = false;


    /**
     * 创建机构
     */
    $scope.createOrg = function () {

        if (cFlag) {
            return;
        }

        cFlag = true;


        if (!$scope.orgInfo.attrs.org.name) {
            service.dialog.alert('请输入机构名称');
            cFlag = false;
            return;
        }
        if (!$scope.orgInfo.attrs.org.tags[0]) {
            service.dialog.alert('请输入机构标签');
            cFlag = false;
            return;
        }

        var postData = {
            name: $scope.orgInfo.attrs.org.name,
            tags: $scope.orgInfo.attrs.org.tags[0]
        };

        service.ssoMethod.createOrg(postData).then(function (rs) {

            if (rs.code === 0) {
                service.dialog.alert('机构创建成功');
                $timeout(function () {
                    $scope.back();
                },1000);

            } else {
                service.dialog.alert('机构创建失败');
                cFlag = false;
            }

        }, function () {
            cFlag = false;
        })
    };

    /**
     * 编辑机构信息
     */
    $scope.editOrg = function () {

        if (cFlag) {
            return;
        }

        cFlag = true;

        if (!$scope.orgInfo._id) {
            service.dialog.alert('请等待机构信息加载完成');
            cFlag = false;
            return;
        }

        if (!$scope.orgInfo.attrs.org.name) {
            service.dialog.alert('请输入机构名称');
            cFlag = false;
            return;
        }

        var postData = {
            kind: 7,
            name: $scope.orgInfo.attrs.org.name,
            uids: $scope.orgInfo._id,
        };

        service.ssoMethod.modifyOrg(postData).then(function (rs) {

            if (rs.code === 0) {
                service.dialog.alert('机构信息已保存');
                $timeout(function () {
                    $scope.back();
                    
                }, 1000);
            } else {
                service.dialog.alert('机构信息修改失败');
                cFlag = false;
            }
        }, function () {
            cFlag = false;

        });
    };

    /**
     * 确认按钮事件
     */
    $scope.confirm = function () {
        if ($scope.type === 'new') {
            $scope.createOrg();
        } else {
            $scope.editOrg();
        }
    };

    //取消编辑
    $scope.back = function () {
        $('#cancel').click();
    };


    if ($scope.type === 'edit') {
        $scope.getOrgInfo($scope.oid);
    }
}]);
