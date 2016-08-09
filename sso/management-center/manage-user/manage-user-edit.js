/**
 * Created by Fox2081 on 2016/6/21.
 */


module.controller('mueCtrl', ['$scope', '$routeParams', '$rootScope', '$timeout', 'service', function ($scope, $routeParams, $rootScope, $timeout, service) {

    $scope.type = $routeParams.type;
    $scope.account = $routeParams.id;


    $scope.orgId = $scope.currentUser.org.orgid;

    $scope.typeOpt = {
        'new': {
            title: '创建用户'
        },
        'edit': {
            title: '编辑用户'
        }
    };

    //去掉空格
    function removeSpace(str) {
        return str.replace(/\s/g, "");
    }

    //用户信息
    $scope.userInfo = {
        uid: null,
        type: 10,
        nickName: '',
        account: '',
        pw: '',
        orgid: $scope.orgId,
        tags: []
    };


    $scope.tag = {
        tags: [],
        tagCustom: [],
        newTag: ''
    };

    /**
     * 自定义tag删除
     * @param index
     */
    $scope.tagDel = function (index) {
        $scope.tag.tagCustom.splice(index, 1);
    };

    /**
     * 获取用户信息
     */
    $scope.getUsrInfo = function (account) {
        var postData = {
            account: account,
            orgid: $scope.orgId
        };
        service.ssoMethod.getOrgMember(postData).then(function (rs) {
            if (rs.code === 0) {
                if (rs.data.orgs.length) {
                    $scope.userInfo = formatUser(rs.data.orgs[0]);
                    reselectTags($scope.userInfo);
                }
            }

        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '编辑机构用户',
                funcName: 'getUsrInfo',
                text: '获取机构用户信息失败'
            });
        })
    };


    var cFlag = false;

    /**
     * 创建机构用户
     */
    $scope.createUser = function () {

        if (cFlag) {
            return;
        }

        cFlag = true;


        if (!$scope.userInfo.nickName) {
            service.dialog.alert('用户昵称不能为空');
            cFlag = false;
            return;
        }

        var postData = {};

        postData.nickName = removeSpace($scope.userInfo.nickName);
        postData.Types = $scope.userInfo.type;
        postData.orgid = $scope.userInfo.orgid;

        if ($scope.userInfo.pw) {
            if ($scope.userInfo.pw.length < 6) {
                service.dialog.alert('密码至少6位');
                cFlag = false;
                return;
            }
            postData.pwd = $scope.userInfo.pw;
        }

        var tags = [];
        angular.forEach($scope.tag.tags, function (value, key) {
            if (value.selected) {
                tags.push(value.name);
            }
        });
        angular.forEach($scope.tag.tagCustom, function (value, key) {
            tags.push(value);
        });

        // if (!tags.length) {
        //     service.dialog.alert('请选择或添加用户标签');
        //     cFlag = false;
        //     return;
        // }

        if (tags.length) {
            postData.tags = tags.join(',');
        }

        service.ssoMethod.createOrgMember(postData).then(function (rs) {

            if (rs.code === 0) {
                service.dialog.alert('用户创建成功');
                $timeout(function () {
                    $scope.back();
                    cFlag = false;
                }, 1000)
            }

        }, function (err) {
            cFlag = false;
            service.dialog.showErrorTip(err, {
                moduleName: '创建机构用户',
                funcName: 'createUser',
                text: '创建机构用户失败'
            });
        })
    };


    /**
     * 编辑机构用户
     */
    $scope.editUser = function () {

        if (cFlag) {
            return;
        }

        cFlag = true;

        var postData = {};

        postData.changeuid = $scope.userInfo.uid;
        postData.otype = $scope.userInfo.type;
        postData.orgid = $scope.userInfo.orgid;

        postData.kind = 1;

        var tags = [];
        angular.forEach($scope.tag.tags, function (value, key) {
            if (value.selected) {
                tags.push(value.name);
            }
        });
        angular.forEach($scope.tag.tagCustom, function (value, key) {
            tags.push(value);
        });

        if (tags.length) {
            postData.tag = tags.join(',');
        }

        service.ssoMethod.updateOrgMembers(postData).then(function (rs) {

            if (rs.code === 0) {
                service.dialog.alert('用户信息修改成功');
                $timeout(function () {
                    $scope.back();
                    cFlag = false;
                }, 1000)
            }

        }, function (err) {
            cFlag = false;
            service.dialog.showErrorTip(err, {
                moduleName: '用户信息修改',
                funcName: 'editUser',
                text: '用户信息修改失败'
            });
        })
    };


    /**
     * 回车空格事件
     * @param event
     */
    $scope.onKeyDown = function (event) {
        var str = removeSpace($scope.tag.newTag);
        if ((event.keyCode === 13 || event.keyCode === 32) && str) {

            var flag = false;

            angular.forEach($scope.tag.tags, function (value, key) {
                if (value.name == str) {
                    flag = true;
                    value.selected = true;
                }
            });
            angular.forEach($scope.tag.tagCustom, function (value, key) {
                if (value == str) {
                    flag = true;
                }
            });

            if (flag) {
                service.dialog.alert('您要添加的标签已存在');
                $scope.tag.newTag = '';
                return;
            }


            $scope.tag.tagCustom.push(str);
            $scope.tag.newTag = '';
        }
    };


    /**
     * 确认按钮事件
     */
    $scope.confirm = function () {
        if ($scope.type === 'new') {
            $scope.createUser();
        } else {
            $scope.editUser();
        }
    };

    /**
     * 返回
     */
    $scope.back = function () {
        $('#cancel').click();
    };


    /**
     * 处理TAG
     * @param tags
     */
    function formatTags(tags) {
        angular.forEach(tags, function (tag, key) {
            if (tag) {
                $scope.tag.tags.push({
                    name: tag,
                    selected: false
                })
            }
        });
    }

    /**
     * 处理用户信息
     * @param user
     */
    function formatUser(user) {
        var rs = {};
        rs.uid = user._id;
        rs.type = user.attrs.orgMembers.orgs.type[0] || null;
        rs.nickName = user.attrs.basic.nickName;
        rs.account = $scope.account;
        rs.orgid = $scope.orgId;
        rs.tags = user.attrs.orgMembers.orgs.tags;
        return rs;
    }

    /**
     * 默认选中已选标签
     * @param user
     */
    function reselectTags(user) {
        var tagMap = {};
        angular.forEach(user.tags, function (value, key) {
            tagMap[value] = true;
        });

        angular.forEach($scope.tag.tags, function (value, key) {
            if (tagMap[value.name]) {
                value.selected = true;
            }
        });
    }


    /**
     * 获取用户信息
     */
    $scope.getUserInfo = function () {

        var postData = {
            orgid: $scope.orgId,
            account: $scope.account
        };

        service.ssoMethod.getOrgMember(postData).then(function (rs) {

            if (rs.code === 0) {
                if (rs.data.orgs && rs.data.orgs.length) {
                    formatUser(rs.data.orgs[0]);
                }
            } else {
                service.dialog.alert('找不到用户信息，正在返回');
                $timeout(function () {
                    $scope.back();
                }, 1000)
            }

        }, function () {
            service.dialog.alert('查找用户信息失败，正在返回');
            $timeout(function () {
                $scope.back();
            }, 1000)
        })

    };


    /**
     * 获取TAGS
     * @param orgId
     */
    $scope.getTags = function (orgId) {

        if (angular.isUndefined(orgId)) {
            orgId = $scope.currentUser.org.orgid;
        }

        var postData = {
            orgid: orgId
        };

        service.ssoMethod.getAllTags(postData).then(function (rs) {
            if (rs.code === 0) {
                $scope.tags = rs.data;
                formatTags(rs.data);

                if ($scope.type === 'edit') {
                    $scope.getUsrInfo($scope.account);
                }
            } else {
                service.dialog.alert(rs.msg);
            }
        }, function () {
            service.dialog.alert('标签获取失败');
        });
    };

    /**
     * 初始化
     */
    $scope.init = function () {
        $scope.getTags();
    };


    $scope.init();
}]);
