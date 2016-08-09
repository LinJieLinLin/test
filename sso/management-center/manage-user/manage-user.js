/**
 * Created by Fox2081 on 2016/6/21.
 */


module.controller('muCtrl', ['$scope', '$rootScope', '$timeout', 'service', function ($scope, $rootScope, $timeout, service) {



    //分页参数
    $scope.pageArgs = {
        ps: 10,
        pn: 1
    };

    $scope.orgId = $scope.currentUser.org.orgid;

    $scope.checkAll = false;

    $scope.listLoading = false;



    $scope.orgList = [];

    $scope.userList = [];

    //新增tag
    $scope.tagNew = '';
    
    $scope.tagCheck = {};

    $scope.tagSelCur = '';

    //成员总数
    $scope.total = 0;
    $scope.totalCur = 0;

    //审核状态
    $scope.certStatus = {
        '1': '审核中',
        '2': '已认证',
        '3': '认证失败'
    };
    
    $scope.gender = {
        '0': {
            icon: 'venus'
        },
        '1': {
            icon: 'mars'
        }
    };

    //搜素
    $scope.searchKey = '';


    //状态TAB
    $scope.tabGroup = [
        {
            title: 'all',
            name: '已激活',
            status: '10'
        },
        {
            title: 'disable',
            name: '已禁用',
            status: '-2'
        },
        {
            title: 'expire',
            name: '已过期',
            status: '-3'
        }
    ];
    $scope.tabGroupCur = 0;


    //去掉空格
    function removeSpace(str) {
        return str.replace(/\s/g, "");
    }

    /**
     * 切换Tab
     * @param index
     */
    $scope.switchTab = function (index) {
        $scope.tabGroupCur = index;
        resetPage();
    };


    //关键字搜索
    $scope.kwSelect = [{
        name: '用户账号',
        value: 1
    }, {
        name: '用户名称',
        value: 2
    }];
    $scope.kwSelectValue = $scope.kwSelect[0];


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
     * 刷新当前页数据（重新获取数据）
     */
    function refPage() {
        $scope.pageArgs = angular.copy($scope.pageArgs);
    }

    /**
     * 关键字搜索机构
     */
    $scope.searchByKey = function () {
        resetPage();
    };

    /**
     * 全选
     */
    $scope.checkAllUser = function () {
        angular.forEach($scope.orgList, function (value, key) {
            value.check = $scope.checkAll;
        });
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

    //设置TAG
    $scope.selOrgConfig = {
        
        cur: '',
        userListStr: '',
        selectUser: function (id, user) {
            this.cur = id;
            var tags = [];
            var tagUser = {};
            if (!user) {
                angular.forEach($scope.tags, function (value, key) {
                    value.select = false;
                    tags.push(value);
                });
            } else {
                this.userListStr = user._id;
                angular.forEach(user.attrs.orgMembers.orgs.tags, function (value, key) {
                    tagUser[value] = true;
                });

                angular.forEach($scope.tags, function (value, key) {
                    value.select = !!tagUser[value.name];
                    tags.push(value);
                });
            }
            this.tagSelect = tags;
        },
        tagSelect: [],
        cb: function (rs) {

            if (!rs.length) {
                service.dialog.alert('用户标签不能为空');
                return;
            }
            var postData = {
                kind: 9,
                newtags: rs.join(','),
                uids: this.userListStr
            };

            $scope.editTag(postData, function () {
                service.dialog.alert('用户标签已修改');
                refPage();
            })
        }
    };

    /**
     * 格式化TAG
     * @param data
     */
    function formatTags(data) {
        var tag = {
            total: 0,
            tags: []
        };

        angular.forEach(data, function (value, key) {
            tag.tags.push({
                name: value._id,
                count: value.count,
            });
            tag.total += Number(value.count);
        });

        return tag;
    }

    /**
     * 获取选中用户
     */
    function getUserSelected() {
        var idList = [];
        angular.forEach($scope.orgList, function (value, key) {
            if (value.check) {
                idList.push(value._id);
            }
        });
        return idList.join(',');
    }

    /**
     * 批量激活用户
     */
    $scope.userActive= function () {

        var uid = getUserSelected();
        if (uid) {
            var postData = {
                kind: 3,
                uids: uid
            };
            $scope.editUser(postData, function () {
                service.dialog.alert('用户已激活');
                refPage();
            })
        } else {
            service.dialog.alert('请先选择用户');
        }
    };

    /**
     * 批量禁用用户
     */
    $scope.userForbid= function () {
        var uid = getUserSelected();
        if (uid) {
            var postData = {
                kind: 4,
                uids: uid
            };
            $scope.editUser(postData, function () {
                service.dialog.alert('用户已禁用');
                refPage();
            })
        } else {
            service.dialog.alert('请先选择用户');
        }
    };

    /**
     * 批量删除用户
     */
    $scope.userDelete= function () {

        var uid = getUserSelected();
        if (uid) {
            service.dialog.confirm('删除用户之后不可恢复，确定删除？',{mask: true},function () {
                var postData = {
                    kind: 1,
                    uids: uid
                };
                $scope.editUser(postData, function () {
                    service.dialog.alert('用户已删除');
                    refPage();
                })
            });
        } else {
            service.dialog.alert('请先选择用户');
        }
    };

    /**
     * 批量重置密码
     */
    $scope.userResetPw= function () {
        var uid = getUserSelected();
        if (uid) {
            service.dialog.confirm('重置后，用户密码变为123456',{mask: true},function () {
                var postData = {
                    kind: 2,
                    uids: uid
                };
                $scope.editUser(postData, function () {
                    service.dialog.alert('用户密码已重置');
                    refPage();
                })
            });
        } else {
            service.dialog.alert('请先选择用户');
        }
    };

    /**
     * 批量修改TAG
     */
    $scope.userChangeTag = function () {
        var uid = getUserSelected();
        if (uid) {
            $scope.selOrgConfig.userListStr = uid;
            $scope.selOrgConfig.selectUser('all');
        } else {
            service.dialog.alert('请先选择用户');
        }
    };

    /**
     * 查看身份证图片
     * @param cert
     */
    $scope.viewCard = function (cert) {

        var html = '<div style="height: 224px"><img src="' + cert.idCardFront + '"></div><div style="margin-top: 10px;height: 224px"><img src="' + cert.idCardBack + '"></div>'
        service.dialog.confirm(html,{mask: true, singleBtn:true},function () {});
    };

    //标签过滤状态
    $scope.tagFilterStatus = false;
    /**
     * 过滤标签
     */
    $scope.tagFilter = function () {
        resetPage();
    };

    /**
     * 改变过滤
     */
    $scope.tagFilterChange = function () {
        $scope.tagEditCur = -1;
        $scope.tagFilterStatus = true;
    };

    /**
     * 取消过滤
     */
    $scope.tagFilterCancel = function () {
        $scope.tagCheck = {};
        $scope.tagFilterStatus = false;
        resetPage();
    };
    
    //当前编辑标签
    $scope.tagEditCur = -1;
    //编辑前的旧标签
    $scope.tagEditOld = '';
    /**
     * 点击编辑标签
     * @param event
     * @param $index
     */
    $scope.tagEdit = function (event, $index) {
        event.stopPropagation();
        $scope.tagEditOld = $scope.tags[$index].name;
        $scope.tagEditCur = $index;
    };
    /**
     * 确认编辑标签
     * @param $index
     */
    $scope.tagEditConfirm = function ($index) {
        if (!$scope.tags[$index].name) {
            service.dialog.alert('标签不能为空');
            return;
        }
        var postData = {
            kind: 8,
            oldtags: $scope.tagEditOld,
            newtags: $scope.tags[$index].name
        };
        $scope.editTag(postData, function () {
            $scope.tagEditCur = -1;
            refPage();
        });
    };
    //标签删除
    $scope.tagDelete = function (event, $index) {
        event.stopPropagation();
        service.dialog.confirm('标签之后不可恢复，确定删除？',{mask: true},function () {
            var postData = {
                kind: 1,
                oldtags: $scope.tags[$index].name
            };
            $scope.editTag(postData, function () {
                refPage();
            });
        });
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
            kind: 2,
            orgid: orgId
        };

       service.ssoMethod.getAllTags(postData).then(function (rs) {
           if (rs.code === 0) {
               var tag = formatTags(rs.data.orgs);
               $scope.tags = tag.tags;
           } else {
               service.dialog.alert(rs.msg)
           }
       })
    };

    /**
     * 点击添加标签
     */
    $scope.tagAdd = function () {
        $scope.tagAddShow = true;
        $timeout(function () {
            $('#btn-m-new')[0].focus();
        })
    };

    /**
     * 创建标签
     */
    $scope.tagAddConfirm = function () {

        if (!$scope.tagNew) {
            service.dialog.alert('标签内容不能为空');
            return;
        }

        if ($scope.tagNew == '全部用户') {
            service.dialog.alert('标签名称不能为“全部用户”');
            return;
        }

        var str = removeSpace($scope.tagNew);

        var flag = false;
        angular.forEach($scope.tags, function (value, key) {
            if (value.name == str) {
                flag = true;
            }
        });

        if (flag) {
            service.dialog.alert('您要添加的标签已存在');
            return;
        }

        var postData = {
            orgid: $scope.orgId,
            tags: str
        };

        service.ssoMethod.createOrgTag(postData).then(function (rs) {

            if (rs.code === 0) {
                $scope.getTags();
                service.dialog.alert('标签创建成功');
                $scope.tagAddShow = false;
                $scope.tagNew = '';
            }

        }, function (rs) {
            service.dialog.alert('标签创建失败');
        });
    };
    $scope.tagAddCancel = function () {
        $scope.tagAddShow = false;
        $scope.tagNew = '';
    };
    $scope.tagAddKeyDown = function (event) {
        if (event.keyCode === 13) {
            $scope.tagAddConfirm();
        }
    };

    /**
     * 激活TAG
     */
    $scope.tagActive = function (name) {
        if (!name) {
            $scope.tagSelCur = '';
        } else if (name && $scope.tagSelCur == name) {
            $scope.tagSelCur = '';
        } else {
            $scope.tagSelCur = name;
        }
        resetPage();
    };

    /**
     * 修改用户信息
     * @param postData
     * @param cb
     */
    $scope.editUser = function (postData, cb) {

        postData.orgid = $scope.orgId;

        service.ssoMethod.modifyMembers(postData).then(function (rs) {

            if (typeof cb === 'function') {
                cb();
            }
        }, function () {
            service.dialog.alert('用户信息修改失败');
        })
    };

    /**
     * 修改TAG
     * @param postData
     * @param cb
     */
    $scope.editTag = function (postData, cb) {

        postData.orgid = $scope.orgId;

        service.ssoMethod.modifyTag(postData).then(function (rs) {

            if (typeof cb === 'function') {
                cb();
            }
        }, function () {
            service.dialog.alert('标签操作失败');
        })
    };

    /**
     * 获取列表
     * @param args
     * @param success
     */
    $scope.listFn = function (args, success) {

        $scope.listLoading = true;

        var postData = {
            Types: '10,20',
            fuzzyName: 1,
            fuzzyAccount: 1,
            page: args.pn,
            pageCount: $scope.pageArgs.ps,
            sort: -1,
            orgid: $scope.orgId,
            status: $scope.tabGroup[$scope.tabGroupCur].status
        };

        if ($scope.kwSelectValue.value === 1) {
            postData.account = $scope.searchKey;
        } else {
            postData.name = $scope.searchKey;
        }

        if ($scope.tagSelCur) {
            postData.tags = $scope.tagSelCur;
        }
        // console.log($scope.tagCheck)
        // var tags = [];
        // angular.forEach($scope.tagCheck, function (value, key) {
        //     if (key && value) {
        //         tags.push(key);
        //     }
        // });
        // if (tags) {
        //     postData.tags = tags.join(',');
        // }
        

        service.ssoMethod.getOrgMember(postData).then(function (rs) {

            $scope.checkAll = false;

            if (rs.code === 0) {

                $scope.orgList = rs.data.orgs;
                $scope.totalCur = rs.data.total || 0;
                $scope.total = rs.data.orgtotal || 0;

                angular.forEach($scope.orgList, function (value, key) {
                    value.check = false;
                    if (value.attrs.orgMembers.orgs.type) {
                        value.type = {};
                        angular.forEach(value.attrs.orgMembers.orgs.type, function (type, index) {
                            value.type[type] = true;
                        });
                    }
                });

                var tmp = {
                    pa: {
                        total: rs.data.total,
                        pn: $scope.pageArgs.pn,
                        ps: $scope.pageArgs.ps
                    }
                };
                $scope.getTags();

                success(tmp);

            } else {
                service.dialog.alert(rs.msg)
            }

            $scope.listLoading = false;

        }, function () {
            $scope.listLoading = false;
        })

    };

    /**
     * 初始化
     */
    $scope.init = function () {
        $scope.getTags();
    };

    // $scope.init();
}]);
