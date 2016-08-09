/**
 * Created by LouGaZen on 2016-06-27.
 * 模块说明：教学中心→学生管理（包括设置课程条件）
 */

module

    .controller('stdmCtrl', ['$scope', 'course', 'dialog', '$timeout', '$routeParams', function ($scope, course, dialog, $timeout, $routeParams) {
        //-----------------------------------主体切换-----------------------------------
        $scope.mainShow = true;

        $scope.switchView = function () {
            $scope.mainShow = !$scope.mainShow;
        };
        //---------------------------------主体切换 end---------------------------------

        //-----------------------------------基本定义-----------------------------------
        $scope.courseList = [];
        $scope.stdList = [];
        $scope.usrList = [];
        $scope.roleList = [];
        $scope.roleOrgList = [];
        $scope.currentCourse = {};
        $scope.courseLoading = false;
        $scope.stdLoading = true;
        $scope.hasSetRole = true;
        $scope.hasJoinedStd = false;//是否有学生参与（针对未设置条件的情况下）
        $scope.showFilter = false;
        $scope.clickAll = false;
        $scope.statusParam = 'NORMAL,WAITING,FAIL,INCOMPLETE,QUIT';
        $scope.showReasonDialog = false;
        $scope.currentStd = '';
        $scope.currentOperation = '';
        $scope.reason = '';
        $scope.isSendingReason = false;

        angular.element('.stdm-main').on('click', function (e) {
            if (angular.element('.stdm-tb-filter > button').has(e.target).length || e.target == angular.element('.stdm-tb-filter > button')[0]) {
                $timeout(function () {
                    $scope.showFilter = !$scope.showFilter;
                })
            } else if (angular.element('.stdm-tb-filter > div').has(e.target).length === 0) {
                $timeout(function () {
                    $scope.showFilter = false;
                })
            }
        });

        //整理课程数据
        function convertCourseData(arg_data) {
            var _list = [];
            if (arg_data) {
                arg_data.forEach(function (element) {
                    _list.push({
                        id: element.id || '',
                        title: element.title || '',
                        isActive: false
                    })
                })
            }
            return _list;
        }

        //整理获取条件数据
        function convertGetRoleData(arg_data) {
            var _list = [];
            if (arg_data) {
                arg_data.forEach(function (element, index) {
                    var _rangeList = [];
                    if (element.hasOwnProperty('range') && angular.isArray(element.range) && element.range.length) {
                        element.range.forEach(function (e) {
                            _rangeList.push({
                                name: e
                            })
                        })
                    } else {
                        _rangeList.push({
                            name: ''
                        })
                    }
                    _list.push({
                        index: index,
                        name: element.key || '',
                        rangeList: _rangeList,
                        isShow: true
                    })
                })
            }
            return _list;
        }

        //整理提交条件数据
        function convertPushRoleData(arg_data) {
            var _list = [];
            if (arg_data) {
                arg_data.forEach(function (element) {
                    var _range = [], _value = '';
                    if (element.hasOwnProperty('rangeList') && angular.isArray(element.rangeList)) {
                        if (element.rangeList.length === 1 && (element.rangeList[0].name == '' || element.rangeList[0].name.length == 0)) {
                            _value = 'string'
                        } else {
                            _value = 'array';
                            element.rangeList.forEach(function (e) {
                                _range.push(e.name || '');
                            })
                        }
                    }
                    _list.push({
                        key: element.name,
                        optioned: false,
                        range: _range,
                        value: _value
                    })
                })
            }
            return _list;
        }

        //整理免审机构数据
        function convertRoleOrgData(arg_data) {
            var _list = [];
            if (arg_data) {
                arg_data.forEach(function (element) {
                    _list.push({
                        id: element._id || '',
                        name: element.attrs.org.name,
                        isSelected: false
                    })
                })
            }
            return _list;
        }

        //重置机构数据
        function resetRoleOrg() {
            $scope.roleOrgList.forEach(function (element) {
                element.isSelected = false;
            })
        }

        //设置已选机构
        function setRoleOrg(arg_data) {
            console.log(arg_data);
            if (arg_data) {
                resetRoleOrg();
                arg_data.forEach(function (element) {
                    $scope.roleOrgList.forEach(function (e) {
                        if (e.id == element) {
                            e.isSelected = true;
                        }
                    })
                })
            }
        }

        //整理学生列表数据
        function convertStdData(arg_data) {
            $scope.clickAll = false;
            var _list = [];
            if (arg_data) {
                arg_data.forEach(function (element) {
                    _list.push({
                        uid: element.uid || '',
                        status: element.status || '',
                        roleMsg: element.msg.basic || {},
                        reason: element.attrs.hasOwnProperty('ext') && element.attrs.ext.hasOwnProperty('reason') ? element.attrs.ext.reason : '',
                        isSelected: false
                    })
                })
            }
            return _list;
        }

        //获取条件数据
        function loadRole() {
            course.loadRole({
                cid: $scope.currentCourse.id
            }).then(function (data) {
                console.log('role data', data);
                $scope.roleList = convertGetRoleData(data.data.basic || []);
                setRoleOrg(data.data.exempt.uids || []);
            }, function (err) {
                // dialog.alert('加载申请条件失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '学生管理',
                    funcName: 'loadRole',
                    text: '加载申请条件失败'
                });
                console.log('role data err', role);
            })
        }

        //改变pageArgs触发pageFn获取列表数据
        function loadPage() {
            $scope.pageArgs = {
                ps: 20,
                pn: 1
            }
        }

        //设置当前课程
        $scope.setCurrentCourse = function (arg_index) {
            $scope.courseList.forEach(function (element) {
                element.isActive = false;
            });
            if (arg_index < $scope.courseList.length) {
                $scope.courseList[arg_index].isActive = true;
                $scope.currentCourse = $scope.courseList[arg_index];

                $scope.statusSelector.setSelect && ($scope.statusParam = $scope.statusSelector.options[0].value, $scope.statusSelector.setSelect(0));
                loadPage();
                loadRole();
            }
        };

        //迭代获取所有课程
        function getMyCourse(arg_page) {
            var _pageCount = 100;
            $scope.courseLoading = true;
            course.getTeacherCourses({
                status: 1,  //获取未发布、待审核、通过、不通过、下架状态的课程
                type: 10,
                page: arg_page,
                pageCount: _pageCount,
                source: '*'
            }).then(function (data) {
                // console.log(data);
                $scope.courseList = $scope.courseList.concat(convertCourseData(data.data.courses || []));
                if (data.data.allCount && (arg_page * _pageCount < data.data.allCount)) {
                    getMyCourse(arg_page + 1);
                }

                if (data.data.allCount <= arg_page * _pageCount) {
                    $scope.setCurrentCourse(0);
                }

                $scope.courseLoading = false;
                $scope.stdLoading = false;
            }, function (err) {
                // dialog.alert('获取课程失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '学生管理',
                    funcName: 'getTeacherCourses',
                    text: '获取课程失败'
                });
                console.log(err);

                $scope.courseLoading = false;
                $scope.stdLoading = false;
            })
        }

        //---------------------------------基本定义 end---------------------------------

        //-----------------------------------学生列表-----------------------------------

        course.listOrgs({
            pageCount: 100
        }).then(function (data) {
            $scope.roleOrgList = convertRoleOrgData(data.data.orgs || []);
            // getMyCourse(1);
            $scope.courseList.push({
                id: $routeParams.cid,
                title: $routeParams.cname,
                isActive: true
            });
            $scope.setCurrentCourse(0);
        }, function (err) {
            // dialog.alert('获取机构列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '学生管理',
                funcName: 'listOrgs',
                text: '获取机构列表失败'
            });
            $scope.stdLoading = false;
        });

        //状态筛选方法和配置
        $scope.statusSelectorFn = function (item) {
            $scope.statusParam = item.value;
            $timeout(function () {
                loadPage();
            })
        };

        $scope.statusSelector = {
            options: [
                {name: '全部', value: 'NORMAL,WAITING,FAIL,INCOMPLETE,QUIT'},
                {name: '通过', value: 'NORMAL'},
                {name: '不通过', value: 'FAIL'},
                {name: '待审核', value: 'WAITING'},
                {name: '待补充信息', value: 'INCOMPLETE'},
                {name: '已退学', value: 'QUIT'}
            ],
            changeCb: $scope.statusSelectorFn
        };

        $scope.pageFn = function (args, callback) {
            $scope.stdLoading = true;
            $scope.hasSetRole = true;
            course.listCourseForm({
                cid: $scope.currentCourse.id,
                retRole: 1,
                page: args.pn,
                pageCount: args.ps,
                status: $scope.statusParam,
                sort: -2
            }).then(function (data) {
                if (!data.data.crs.role.hasOwnProperty('basic')) {
                    //没有设置条件情况下，显示默认5个条件
                    $scope.hasSetRole = false;
                    $scope.roleList = [{
                        index: 0,
                        name: '所属机构',
                        rangeList: [{
                            name: ''
                        }],
                        isShow: true
                    }, {
                        index: 1,
                        name: '学院',
                        rangeList: [{
                            name: ''
                        }],
                        isShow: true
                    }, {
                        index: 2,
                        name: '姓名',
                        rangeList: [{
                            name: ''
                        }],
                        isShow: true
                    }, {
                        index: 3,
                        name: '学号',
                        rangeList: [{
                            name: ''
                        }],
                        isShow: true
                    }];
                } else {
                    $scope.roleList = convertGetRoleData(data.data.crs.role.basic || [], true);
                }

                $scope.usrList = data.data.usr || {};
                $scope.stdList = convertStdData(data.data.forms || []);

                if ($scope.statusParam == $scope.statusSelector.options[0].value) {
                    $scope.hasJoinedStd = $scope.stdList.length != 0;
                }
                console.log($scope.hasJoinedStd);

                $scope.stdLoading = false;
                callback({pa: {total: data.data.allCount || 0}});
            }, function (err) {
                console.log(err);
                // dialog.alert('获取学生列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                // dialog.errorTip.tip('获取学生列表失败', err);
                dialog.showErrorTip(err, {
                    moduleName: '学生管理',
                    funcName: 'pageFn',
                    text: '获取学生列表失败'
                });
                $scope.stdLoading = false;
            })
        };

        $scope.getUserInfo = function (arg_uid) {
            if ($scope.usrList.hasOwnProperty(arg_uid)) {
                var _check = $scope.usrList[arg_uid].hasOwnProperty('attrs') &&
                    $scope.usrList[arg_uid].attrs.hasOwnProperty('basic');
                return {
                    name: _check && $scope.usrList[arg_uid].attrs.basic.hasOwnProperty('nickName') ? $scope.usrList[arg_uid].attrs.basic.nickName : arg_uid,
                    phone: _check && $scope.usrList[arg_uid].attrs.basic.hasOwnProperty('phone') ? $scope.usrList[arg_uid].attrs.basic.phone : ''
                };
            }
        };

        $scope.selectAll = function () {
            var flag = false;
            $scope.stdList.forEach(function (element) {
                flag = flag || element.isSelected;
            });

            flag = flag === $scope.clickAll ? !flag : flag;

            $scope.clickAll = flag;

            $scope.stdList.forEach(function (element) {
                if (element.status == 'WAITING') {
                    element.isSelected = flag;
                }
            });
        };

        //点击单个选项↓
        function checkSelect() {
            var flag = false;
            $scope.stdList.forEach(function (element, index) {
                if (!index) {
                    flag = element.isSelected;
                } else {
                    flag = flag && element.isSelected;
                }
            });
            return flag;
        }

        $scope.selectClick = function (arg_obj) {
            arg_obj.isSelected = !arg_obj.isSelected;
            $scope.clickAll = checkSelect();
        };

        function verifyForm(arg_operation, arg_uid, arg_reason) {
            arg_reason = arg_reason || '';
            $scope.isSendingReason = true;
            course.verifyForm({
                cid: $scope.currentCourse.id,
                pass: arg_operation,
                tuid: arg_uid,
                reason: arg_reason
            }).then(function (data) {
                if (data.code === 0) {
                    dialog.alert('操作成功');
                    loadPage();
                    $scope.closeReasonDialog();
                    $scope.isSendingReason = false;
                }
            }, function (err) {
                // dialog.alert('操作失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '学生管理',
                    funcName: 'verifyForm',
                    text: '操作失败'
                });
                $scope.isSendingReason = false;
            })
        }

        $scope.verifyStd = function (arg_type, arg_operation, arg_uid) {
            if (arg_operation != 0 && arg_operation != 1) {
                dialog.alert('[verifyStd] error operation code');
                return;
            }

            switch (arg_type) {
                case 'SINGLE':
                    verifyForm(arg_operation, arg_uid);
                    // console.log(arg_operation, arg_uid);
                    break;
                case 'MULTI':
                    var _uids = '';
                    $scope.stdList.forEach(function (element) {
                        if (element.isSelected) {
                            _uids += element.uid + ','
                        }
                    });
                    if (_uids.length === 0) {
                        dialog.alert('还没有选择学生哦');
                    } else {
                        _uids = _uids.substring(0, _uids.length - 1);
                        verifyForm(arg_operation, _uids);
                        // console.log(arg_operation, _uids);
                    }
                    break;
                default:
                    dialog.alert('[verifyStd] error operation type');
                    break;
            }
        };

        $scope.setReasonDialog = function (arg_uid, arg_type) {
            $scope.currentStd = arg_uid;
            $scope.currentOperation = arg_type;
            $scope.showReasonDialog = true;
        };

        $scope.closeReasonDialog = function () {
            $scope.currentStd = '';
            $scope.currentOperation = '';
            $scope.reason = '';
            $scope.showReasonDialog = false;
        };

        $scope.confirmReason = function () {
            verifyForm($scope.currentOperation, $scope.currentStd, $scope.reason);
        };

        //---------------------------------学生列表 end---------------------------------

        //-----------------------------------设置条件-----------------------------------

        $scope.addRole = function () {
            $scope.roleList.push({index: -1, name: '', rangeList: [{name: '', option: false}]});
        };

        $scope.deleteRole = function (arg_index) {
            if (arg_index < $scope.roleList.length) {
                $scope.roleList.splice(arg_index, 1);
            }
        };

        $scope.addRange = function (arg_index) {
            if (arg_index < $scope.roleList.length) {
                $scope.roleList[arg_index].rangeList.push({name: '', option: false});
            }
        };

        $scope.deleteRange = function (arg_outIndex, arg_inIndex) {
            if (arg_outIndex < $scope.roleList.length && arg_inIndex < $scope.roleList[arg_outIndex].rangeList.length) {
                $scope.roleList[arg_outIndex].rangeList.splice(arg_inIndex, 1);
            }
        };

        //监听roleList变动保证index的值是正确的
        $scope.$watch('roleList', function (newValue, oldValue) {
            angular.forEach(newValue, function (value, key) {
                value.index = key;
            })
        }, true);

        $scope.saveRole = function () {
            var _indexList = '', _orgIdList = '';

            //判断是否有空的条件名称
            $scope.roleList.forEach(function (element, index) {
                if (element.name == '') {
                    _indexList += (index + 1) + ','
                }
            });
            if (_indexList.length) {
                _indexList = _indexList.substring(0, _indexList.length - 1);
                dialog.alert('第' + _indexList + '项条件的名称为空');
                return;
            }

            //判断有无条件（没有添加条件无法保存）
            if ($scope.roleList.length === 0) {
                dialog.alert('请先添加条件');
                return;
            }

            //判断条件里选项为多个的时候是否有空选项
            var _hasNullRange = false;
            $scope.roleList.forEach(function (element) {
                if (!_hasNullRange && element.rangeList.length > 1) {
                    element.rangeList.forEach(function (e) {
                        if (e.name == '') {
                            _hasNullRange = true;
                        }
                    })
                }
            });
            if (_hasNullRange) {
                dialog.alert('有条件中的多选选项为空');
                return;
            }

            $scope.roleOrgList.forEach(function (element) {
                if (element.isSelected) {
                    _orgIdList += element.id + ','
                }
            });

            var _pushObj = {
                    basic: convertPushRoleData($scope.roleList)
                },
                cmds = 'cid=' + $scope.currentCourse.id + '&exemptIds=' + _orgIdList.substring(0, _orgIdList.length - 1) + '&role=' + encodeURIComponent(JSON.stringify(_pushObj));
            course.updateRole({}, {data: cmds}).then(function (data) {
                if (data.code === 0) {
                    dialog.alert('保存认证条件成功');
                    $scope.switchView();
                    loadRole();
                    loadPage();
                }
            }, function (err) {
                // dialog.alert('保存失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '学生管理',
                    funcName: 'saveRole',
                    text: '保存失败'
                });
                console.log(err);
            });
        };
        //---------------------------------设置条件 end---------------------------------
    }]);