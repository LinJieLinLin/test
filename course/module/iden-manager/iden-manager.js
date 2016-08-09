/**
 * Created by LouGaZen on 2016-06-14.
 * 模块说明：教学中心→认证管理
 */

module.controller('idenCtrl', ['$scope', 'course', 'dialog', function ($scope, course, dialog) {

    //根据机构id获取机构所在列表索引
    function searchOrgByID(arg_targetId, arg_list) {
        var _index = -1;
        if (arg_list) {
            arg_list.forEach(function (element, index) {
                if (element.hasOwnProperty('id') && element.id == arg_targetId) {
                    _index = index;
                }
            });
        }
        return _index;
    }

    //整理某课程提交认证数据，剔除不存在机构的记录及某机构的重复记录（只保留最新一条）
    function trimOrgList(arg_list) {
        var _list = [];
        if (arg_list) {
            arg_list.forEach(function (element) {
                if (element.hasOwnProperty('id') && searchOrgByID(element.id, $scope.curOrgList) != -1) {
                    var _index = searchOrgByID(element.id, _list);
                    if (_index == -1) {
                        _list.push(element);
                    } else if (_index < arg_list.length) {
                        _list.splice(_index, 1, element);
                    }
                }
            })
        }
        return _list;

    }

    //从机构列表（arg_list）获取某个机构（arg_id）详情
    function getOrgDetail(arg_id, arg_list) {
        if (arg_list) {
            for (var i = 0, len = arg_list.length; i < len; i++) {
                if (arg_list[i].id == arg_id) {
                    return arg_list[i];
                }
            }
        }
        return {id: '', name: '', img: '', isSelected: false, isWaitingOrNormal: false}
    }

    //截取所需课程数据
    function convertCourseData(arg_data) {
        var _list = [],
            _orgL = [];
        if (arg_data) {
            arg_data.forEach(function (element) {
                _orgL = [];

                if (element.auth) {
                    element.auth.forEach(function (e) {
                        _orgL.push({
                            id: e.orgId,
                            name: getOrgDetail(e.orgId, $scope.curOrgList).name,
                            img: getOrgDetail(e.orgId, $scope.curOrgList).img,
                            status: e.status,
                            reason: e.reason || ''
                        })
                    })
                }

                _list.push({
                    id: element.id || '',
                    title: element.title || '',
                    startTime: element.start_time || 0,
                    endTime: element.end_time || 0,
                    joinNum: element.joined || 0,
                    price: element.minPrice || 0,
                    img: element.hasOwnProperty('imgs') && element.imgs ? element.imgs[0] : '',
                    // orgList: [].concat(_orgL)
                    orgList: trimOrgList(_orgL)
                })
            })
        }

        return _list;
    }

    //截取所需机构数据
    function convertOrgData(arg_data) {
        var _list = [];
        if (arg_data) {
            arg_data.forEach(function (element) {
                if (element.hasOwnProperty('_id')) {
                    _list.push({
                        id: element._id,
                        name: element.hasOwnProperty('attrs') && element.attrs.hasOwnProperty('org') && element.attrs.org.hasOwnProperty('name') ? element.attrs.org.name : '',
                        img: element.hasOwnProperty('attrs') && element.attrs.hasOwnProperty('basic') && element.attrs.basic.hasOwnProperty('avatar') ? element.attrs.basic.avatar : '',
                        isSelected: false,
                        isWaitingOrNormal: false
                    })
                }
            })
        }
        return _list;
    }

    $scope.courseList = [];
    $scope.curOrgList = [];
    $scope.showLoading = true;
    $scope.onShowCourseId = '';

    var back2Initial = function () {
        course.listOrgs({
            pageCount: 100
        }).then(function (data) {
            $scope.curOrgList = convertOrgData(data.data.orgs || []);

            $scope.pageArgs = {
                ps: 6,
                pn: 1
            }
        }, function (err) {
            console.log('listOrgs error', err);
            dialog.showErrorTip(err, {
                moduleName: '认证管理',
                funcName: 'listOrgs',
                text: '获取机构列表失败'
            });
        });
    };

    $scope.pageFn = function (args, callback) {
        $scope.showLoading = true;
        course.searchCourse({
            token: rcpAid.getToken(),
            isSelf: 1,
            page: args.pn,
            pageCount: args.ps,
            source: '*',
            status: 1  //获取未发布、待审核、通过、不通过、下架状态的课程
        }).then(function (data) {
            // console.log(data);
            $scope.courseList = convertCourseData(data.data.courses || []);
            $scope.showLoading = false;
            callback({pa: {total: data.data.allCount || 0}});
        }, function (err) {
            $scope.showLoading = false;
            console.log('searchCourse error', err);
            dialog.showErrorTip(err, {
                moduleName: '认证管理',
                funcName: 'pageFn',
                text: '获取课程列表失败'
            });
        })
    };

    $scope.orgShowDialog = false;
    $scope.showDialogFn = function (arg_index) {
        $scope.onShowCourseId = $scope.courseList.length < arg_index ? '' : $scope.courseList[arg_index].id;
        if ($scope.onShowCourseId == '') {
            dialog.alert('[showDialogFn] invalid value of onShowCourseId');
            return;
        }
        // console.log($scope.onShowCourseId);
        $scope.curOrgList.forEach(function (element) {
            element.isWaitingOrNormal = $scope.checkOrg(arg_index, element.id);
            // console.log($scope.onShowCourseId, element.id, element.isWaitingOrNormal);
        });
        $scope.orgShowDialog = true;
    };
    $scope.closeDialogFn = function () {
        $scope.onShowCourseId = '';
        $scope.curOrgList.forEach(function (element) {
            element.isWaitingOrNormal = false;
        });
        $scope.orgShowDialog = false;
    };

    $scope.commitApply = function () {
        var _orgIds = '';
        $scope.curOrgList.forEach(function (element) {
            if (element.isSelected) {
                _orgIds += element.id + ','
            }
        });
        _orgIds = _orgIds.length ? _orgIds.substring(0, _orgIds.length - 1) : _orgIds;
        console.log($scope.onShowCourseId, _orgIds);

        if (_orgIds.length === 0) {
            dialog.alert('请选择需要申请认证的机构');
            return;
        }

        if ($scope.onShowCourseId != '') {
            course.applyAuth({
                cid: $scope.onShowCourseId,
                orgIds: _orgIds
            }).then(function (data) {
                console.log(data);
                dialog.alert('提交认证申请成功');
                $scope.orgShowDialog = false;
                back2Initial();
            }, function (err) {
                // dialog.alert('提交失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '认证管理',
                    funcName: 'applyAuth',
                    text: '提交失败'
                });
                console.log('[applyAuth error]',err);
            })
        }
    };

    //检测某课程（arg_index）对某机构（arg_orgId）的申请状态是否为FAIL（用于屏蔽申请中或认证成功状态下的申请）
    $scope.checkOrg = function (arg_index, arg_orgId) {
        var _result = true;
        if (arg_index > $scope.courseList.length) {
            dialog.alert('[checkOrg] invalid value of index');
        } else {
            var _tempList = [].concat($scope.courseList[arg_index].orgList);
            for (var i = 0, il = _tempList.length; i < il; i++) {
                if (_tempList[i].id == arg_orgId && _tempList[i].status != 'FAIL') {
                    // console.log(arg_orgId, _tempList[i].status);
                    _result = false;
                    return _result;
                }
            }
        }
        return _result;
    };

    $scope.getCourseUrl = function (arg_cid) {
        return rcpAid.getUrl('课程详情', {
            cid: arg_cid
        });
    };

    back2Initial();
}]);