/**
 * 作者：huangxs
 * 创建时间：2016/6/14
 * 依赖模块说明：loader-ui 加载动画；empty-tip 空数据显示图；landscape-list 水平排列列表；head-selector 下拉选择框；confirm-modal 确认框；pagination 分页组件
 * 业务说明：列出课程及其下的团队，并可进行管理操作
 */

module.controller('teamManagerCtr', ['$scope', '$rootScope', '$timeout', '$interval', 'service', 'course', 'ssoMethod', '$routeParams', '$location', function ($scope, $rootScope, $timeout, $interval, service, course, ssoMethod, $routeParams, $location) {
    //================================ var =================================
    var curCid = $routeParams.cid;  //当前进入课程管理对应的课程id
    var curCrsName = $routeParams.cname;    //当前进入课程管理对应的课程名称

    if (!curCid) {
        console.error('[team-manager] the current course id is null', curCid);
        return;
    }

    //显示的状态名称
    var statusText = {
        'NORMAL': '正常',
        'WAITING': '邀请中',
        'AGREED': '已同意',
        'REFUSED': '已拒绝',
        'CANCEL': '已取消'
    };

    //显示的权限名称
    var levelText = {
        50: '课程编辑',
        60: '教学管理',
        100: '课程管理员'
    };

    $scope.personLoaded = false;
    $scope.personList = []; //课程下管理员列表

    $scope.personPageArgs = initPageArgs(); //分页参数
    $scope.isAdmin = $routeParams.tag == 0; //当前登录用户是否为课程管理员；true 从我的课程页面进入当前页，false 从我助教的课程进入当前页

    //移除确认框
    $scope.removeDialog = {
        show: false,
        user: ''    //要移除的用户昵称
    };

    //退出确认框
    $scope.quitDialog = {
        show: false,
        course: ''  //要退出的课程名称
    };

    //详情框
    $scope.detailData = {
        show: false,
        title: '详细信息',
        type: 1,    //0 新建账号的管理员信息，1 从平台邀请的管理员信息
        phone: '',
        nickName: '',
        level: {
            50: true,
            60: true
        },
        user: '',
        remark: ''
    };

    //操作框，新建账号、设置权限
    $scope.editData = {
        show: false,
        type: 2,    //0 新建账号，1 设置权限，2 从平台添加账号
        level: {},
        regExp: {
            nickName: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,50}$/,
            phone: /^1[34578]\d{9}$/,
            password: /^.{6,15}$/,
            verification: /^.*$/    //验证码
        },
        //获取验证码
        verify: verify
    };

    //============================== function ============================
    /**
     * 从平台添加管理员到对应的课程下
     * @param cid   课程id
     * @param request   json格式,eg:[{"uid":"u1","level":[50,60],"remark":"这里是备注,可不传"},{"uid":"u2","level":[70],"remark":"这里是备注,可不传"}],uid表示需要添加的用户id,level表示需要为用户配置的权限
     */
    function addAdmin(cid, request) {
        if (!cid) {
            console.error('[team-manager => addAdmin]arg cid is null');
            return;
        }
        course.invateAdmin({}, {
            data: 'cid=' + cid + '&request=' + JSON.stringify(request),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            reloadPersonList();
        }, function (err) {
            if (err.data.data && err.data.data.code === 2) {
                service.dialog.alert('该用户已在团队中');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '团队管理',
                    funcName: 'addAdmin',
                    text: '邀请管理员失败'
                });
            }
        });
    }

    /**
     * 移除对应课程下的管理员
     * @param cid   课程id
     * @param tuids 用户id,多个用逗号隔开,eg:u1,u10,u20
     */
    function removeAdmin(cid, tuids) {
        course.removeAdmin({
            cid: cid,
            tuids: tuids
        }).then(function (data) {
            reloadPersonList();
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '团队管理',
                funcName: 'removeAdmin',
                text: '移除管理员失败'
            });
        });
    }

    /**
     * 在对应的课程下新建管理员账号
     * @param request {
     *      cid: 课程id
     *      code: 注册手机验证码
     *      level: 用户权限，多个用逗号隔开，50 编辑管理员 60 导学老师，eg：50,60
     *      name: 昵称
     *      phone: 手机号码
     *      pwd: 用户密码
     * }
     */
    function addAccount(request) {
        course.addAdmin(request).then(function (data) {
            reloadPersonList();
            $scope.editData.show = false;
            service.dialog.alert('添加成功！');
        }, function (err) {
            var code = err.data.data && err.data.data.code;
            if (code == 2) {
                service.dialog.alert('手机号码有误,绑定失败');
            } else if (code == 9 || code == 1 || code == 5) {
                service.dialog.alert('验证码错误');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '团队管理',
                    funcName: 'addAccount',
                    text: '新建管理员账号失败'
                });
            }
        });
    }

    /**
     * 更改对应课程的某些管理员权限
     * @param cid   课程id
     * @param request   json格式,eg:[{"uid":"u1","level":[50,60],"remark":"这里是备注,可不传"},{"uid":"u2","level":[70],"remark":"这里是备注,可不传"}],uid表示需要添加的用户id,level表示需要为用户配置的权限
     */
    function manageAdmin(cid, request) {
        course.manageAdmin({
            cid: cid,
            request: JSON.stringify(request)
        }).then(function (data) {
            reloadPersonList();
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '团队管理',
                funcName: 'manageAdmin',
                text: '批量设置权限失败'
            });
        });
    }

    /**
     * 初始化分页参数
     * @param pn    第几页
     * @returns {{pn: (*|number), ps: number, pl: number, data: *}}
     */
    function initPageArgs(pn) {
        return {
            pn: pn || 1,  //当前第几页
            ps: 15,  //每页显示的课程数
            pl: 5
        };
    }

    /**
     * 请求加载对应课程的团队信息
     * @param args  分页参数
     * @param cid   课程id
     * @param cb    总数传入回调
     */
    function loadPersonList(args, cid, cb) {
        $scope.personLoaded = false;
        course.listCourseAdmin({
            cid: cid,
            page: args.pn,
            pageCount: args.ps
        }).then(function (data) {
            $scope.personLoaded = true;
            if (!data || !data.data) {
                console.log('[error]', '团队管理，返回数据为空', 'cid:', cid, 'data:', data);
                return;
            }
            personDataHandler(data.data, cid);
            cb && (data.pa = {total: data.data.allCount}, cb(data));
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '团队管理',
                funcName: 'loadPersonList',
                text: '加载团队数据失败'
            });
        });
    }

    /**
     * 重新加载当页
     */
    function reloadPersonList() {
        $scope.personPageArgs = initPageArgs($scope.personPageArgs.pn);
    }

    /**
     * 处理后台返回的管理员数据，并放进 $scope.personList 中
     * @param data  后台放回的data
     * @param cid   对应的课程id
     */
    function personDataHandler(data, cid) {
        if (!data) {
            return;
        }

        var curUid = $rootScope.currentUser && $rootScope.currentUser.uid;  //当前登录用户uid
        var getUserName = function (uid) {
            return data.usr && data.usr[uid] && data.usr[uid].attrs && data.usr[uid].attrs.basic && data.usr[uid].attrs.basic.nickName || '';
        };
        var getUserPhone = function (uid) {
            return data.usr && data.usr[uid] && data.usr[uid].attrs && data.usr[uid].attrs.basic && data.usr[uid].attrs.basic.phone || '';
        };
        var getLevelText = function (level) {
            if (angular.isArray(level)) {
                var arr = [];
                for (var i = 0, len = level.length; i < len; i++) {
                    arr[i] = levelText[level[i]];
                }
                return arr;
            }
        };

        $scope.personList.length = 0;
        var teams = data.team || [];
        angular.forEach(teams, function (v) {
            for (var i = 0, len = v.level.length; i < len; i++) {
                if (v.level[i] == 100) {
                    v.level = [100];
                    break;
                }
            }
            $scope.personList.push({
                name: getUserName(v.uid),   //昵称
                phone: getUserPhone(v.uid), //绑定的手机号
                uid: v.uid, //用户id
                level: v.level, //用户权限，数组；50 编辑管理员 60 教学管理 100 课程管理员
                levelText: getLevelText(v.level),   //权限对应的名称，数组；课程管理员、课程编辑、教学管理
                status: v.status,   //状态，NORMAL,WAITING,AGREED,REFUSED,CANCEL
                statusText: statusText[v.status],   //状态对应显示的名称
                remark: v.remark,   //邀请备注
                isAdmin: v.level.indexOf(100) > -1,  //是否课程管理员
                isSelf: v.uid == curUid //是否是当前登录用户
            });
        });

        if (data.level && data.level.length) {
            $scope.isAdmin = false;
            for (var i = 0, len = data.level.length; i < len; i++) {
                if (data.level[i] == 100) {
                    //100 课程管理员
                    $scope.isAdmin = true;
                    break;
                }
            }
        }
    }

    /**
     * 退出某课程的教师团队
     * @param cid   课程id
     */
    function quit(cid) {
        course.quitTeam({
            cid: cid
        }).then(function (data) {
            $location.path('/courseManager');
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '团队管理',
                funcName: 'quit',
                text: '退出团队失败'
            });
        });
    }

    /**
     * 弹出对应的操作框
     * @param option    操作框参数，显示的数据
     */
    function toShowEditModal(option) {
        var editData = $scope.editData;

        editData.user2Exist = false; //用户是否存在
        editData.verification = editData.password2 = editData.password1 = editData.nickName = editData.phone = editData.remark = '';
        editData._verification = editData._password2 = editData._password1 = editData._nickName = editData._phone = 0;
        editData.isTime = false;    //是否显示倒计时，填写验证码需要
        editData.resolve = editData.reject = function () {
            $scope.editData.show = false;
        };
        editData.searchUserReset && editData.searchUserReset(); //用户搜索组件重置
        editData.level[50] = editData.level[60] = false;

        angular.extend(editData, option);
        editData.show = true;
    }

    /**
     * 新建账号时检测账号是否存在
     * @param phone 要检测的手机号
     */
    function isUserExist(phone) {
        $scope.editData.userExist = false;
        if (phone == $('#edit-data-phone').val()) {
            phone && course.userExist({
                usrs: phone
            }, {option: {loading: false}}).then(function (data) {
                if (phone == $('#edit-data-phone').val() && data && data.code == 0 && data.data && data.data[phone]) {
                    $scope.editData.userExist = true;
                }
            }, function (err) {
                console.log('[error]', '检测账号是否返回错误', 'error', err);
            });
        }
    }

    /**
     * 发送验证码
     * @param phone 发送的手机号
     */
    function verify(phone) {
        var editData = $scope.editData;
        if (!phone || editData.isTime) {
            return;
        }
        editData.time = 60;
        ssoMethod.sendMessage({
            mobile: phone,
            types: 'register'
        }).then(function (data) {
            if (!data) {
                console.log('[error]', '验证码发送请求返回数据为空', 'data', data);
                service.dialog.alert('验证码发送失败');
                return;
            }
            editData.isTime = true;
            var stop = $interval(function () {
                editData.time--;
                if (editData.time < 1 || !editData.isTime) {
                    editData.isTime = false;
                    $interval.cancel(stop);
                }
            }, 1000);
        }, function (err) {
            var code = err.data.data && err.data.data.code;
            if (code == 2) {
                service.dialog.alert('手机号码错误，验证码发送失败');
            } else if (code == 3) {
                service.dialog.alert('该手机已经绑定');
            } else {
                service.dialog.showErrorTip(err, {
                    moduleName: '团队管理',
                    funcName: 'verify',
                    text: '验证码发送失败'
                });
            }
        });
    }

    //============================= scope function =========================
    /**
     * 点击从平台添加管理员按钮回调，弹出邀请框
     */
    $scope.toAddAdmin = function () {
        if ($scope.isAdmin) {
            toShowEditModal({
                type: 2,
                remark: '邀请你参与《' + curCrsName + '》课程。',
                resolve: function () {
                    var uid = $scope.editData.searchUser && $scope.editData.searchUser.uid || '';   //邀请对象uid
                    var level = [];
                    $scope.editData.level[50] && level.push(50);
                    $scope.editData.level[60] && level.push(60);
                    if (curCid && uid && level.length) {
                        addAdmin(curCid, [{
                            uid: uid,
                            level: level,
                            remark: $scope.editData.remark || ''
                        }]);
                        $scope.editData.show = false;
                    }
                }
            });
        } else {
            console.error('[team-manager => $scope.toAddAdmin] have no permission to add admin')
        }
    };

    /**
     * 点击新建账号按钮回调，弹出信息输入框
     */
    $scope.toAddAccount = function () {
        if ($scope.isAdmin) {
            toShowEditModal({
                type: 0,
                resolve: function () {
                    var data = $scope.editData;
                    var level = [];
                    $scope.editData.level[50] && level.push(50);
                    $scope.editData.level[60] && level.push(60);

                    addAccount({
                        cid: data.selectCid,
                        level: level.join(','),
                        name: data.nickName,
                        phone: data.phone,
                        code: data.verification,
                        pwd: data.password1
                    });
                }
            });
        } else {
            console.error('[team-manager => $scope.toAddAccount] have no permission to add account')
        }
    };

    /**
     * 分页组件回调函数
     * @param args  分页参数
     * @param cb    总数传入回调
     */
    $scope.personLoadFn = function (args, cb) {
        if (curCid) {
            loadPersonList(args, curCid, cb);
        } else {
            console.error('[team-manager => $scope.personLoadFn]cur cid is null', 'curCid:', curCid);
        }
    };

    /**
     * 移除管理员
     * @param item  对应的管理员，$scope.personList 中的对象
     */
    $scope.removeAdmin = function (item) {
        if (curCid) {
            $scope.removeDialog.user = item.name;
            $scope.removeDialog.okCb = function () {
                removeAdmin(curCid, item.uid);
            };
            $scope.removeDialog.show = true;
        } else {
            console.error('[team-manager => $scope.removeAdmin] course id is null')
        }
    };

    /**
     * 点击退出按钮回调，弹出确认框，退出当前显示课程的团队
     */
    $scope.quit = function () {
        if (curCid) {
            $scope.quitDialog.course = curCrsName;
            $scope.quitDialog.okCb = function () {
                quit(curCid);
            };
            $scope.quitDialog.show = true;
        } else {
            console.error('[team-manager => $scope.quit] course id is null')
        }
    };

    /**
     * 取消邀请管理员
     * @param item 对应的管理员，$scope.personList 中的对象
     */
    $scope.cancelAdmin = function (item) {
        if (!item || item.status != 'WAITING') {
            console.error('[team-manager => $scope.cancelAdmin] the status must WAITING', 'cur status:', item.status);
            return;
        }
        course.cancelAdmin({
            cid: curCid,
            tuid: item.uid  //目标用户id
        }).then(function (data) {
            reloadPersonList()
        }, function (err) {
            service.dialog.showErrorTip(err, {
                moduleName: '团队管理',
                funcName: '$scope.cancelAdmin',
                text: '取消邀请管理员失败'
            });
        });
    };

    /**
     * 点击权限设置按钮回调，弹出权限设置框
     * @param item  对应的管理员，$scope.personList 中的对象
     */
    $scope.manageAdmin = function (item) {
        if ($scope.isAdmin) {
            toShowEditModal({
                type: 1,
                user: item.name,
                level: item.level && (function () {
                    var level = {};
                    level[50] = level[60] = level[70] = level[100] = false;
                    for (var i = 0, len = item.level.length; i < len; i++) {
                        level[item.level[i]] = true;
                    }
                    return level;
                })(),
                resolve: function () {
                    var level = [];
                    $scope.editData.level[50] && level.push(50);
                    $scope.editData.level[60] && level.push(60);
                    $scope.editData.level[70] && level.push(70);
                    manageAdmin(curCid, [{
                        uid: item.uid,
                        level: level
                    }]);
                    $scope.editData.show = false;
                }
            });
        } else {
            console.error('[team-manager => $scope.manageAdmin] have no permission to manage admin')
        }
    };

    /**
     * 点击查看详情按钮回调，弹出某管理员详情框
     * @param item  对应的管理员，$scope.personList 中的对象
     */
    $scope.lookDetail = function (item) {
        var detail = $scope.detailData;

        detail.type = 1;
        detail.user = item.name;
        detail.status = item.status;
        detail.remark = item.remark || '无';
        detail.level = item.level && (function () {
                var level = detail.level || {};
                level[50] = level[60] = level[100] = false;
                for (var i = 0, len = item.level.length; i < len; i++) {
                    if (item.level[i] == 100) {
                        level[50] = level[60] = level[100] = true;
                        break;
                    }
                    level[item.level[i]] = true;
                }
                return level;
            })();

        if (item.isSelf && item.status == 'WAITING') {
            detail.type = 2;
            detail.resolve = $scope.resolve;
            detail.reject = $scope.reject;
        } else if (item.status == 'NORMAL') {
            detail.type = 0;
            detail.show = true;
            detail.phone = item.phone;
            detail.nickName = item.name;
        }
        detail.show = true;
    };

    //============================= init ================================
    //左侧菜单重复点击时刷新
    $scope.$on('bar-repeat-click', function (ev, tag) {
        if (tag == 'tuandui') {
            loadCourseList();
        }
    });

    //监听手机号输入框的输入
    $('#edit-data-phone').on('input', function (e) {
        // console.log(e.target);
        isUserExist(e && e.target && e.target.value || '');
    });
}]);