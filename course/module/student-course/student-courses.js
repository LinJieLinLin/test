/**
 * 作者：huangxs
 * 创建时间：2016/4/15
 * 依赖模块说明：loader-ui 加载动画；default-img 显示课程封面图片，带默认图；confirm-modal 确认框；pagination 分页组件
 * 业务说明：列出学生参与的课程列表
 */

module.controller('myCourseCtrl', ['$scope', '$rootScope', 'service', 'course', '$timeout', 'appraiseService', function ($scope, $rootScope, service, course, $timeout, appraiseService) {
    //================================ var ==========================
    // 扩展参数
    var cmds = {
        appraise: {
            list: {}
        }
    };

    //课程列表请求参数
    var requestParams = {
        sort: -9,   //排序值，1创建时间，2课程开始时间,3课程结束时间,4参与人数,5最小价格,6最大价格，正数升序，负数降序
        mode: 5,    //选项，1 匹配标签/分类，标题，描述及价格区间 2 匹配标签/分类，标题，描述 3 匹配标题，描述及价格区间 4 匹配标签/分类，及价格区间 5 仅匹配标题，描述 6 仅匹配标签/分类 7 仅匹配价格区间
        type: 10, //10 课程，20 题库
        status: 1,  //管理员审核课程时或用户搜索自己课程时候使用，需要查询的课程状态，100 正常 20 用户可编辑状态，即表示用户未发布课程 200 待审核 500 审核被拒 300 表示课程拥有者自己下架/管理员主动下架 1200下架课程，包括300,500， 1 搜索所有 包括20,200,500,300, 2搜100,200,300,500,20
        retRate: 1,  //获取学习进度
        cmds: angular.toJson(cmds)
    };

    $scope.loading = true;
    $scope.isEmpty = false; //返回课程数据是否为空
    $scope.resourceList = [];   //课程列表

    $scope.showManager = false; //课程管理 取消管理 按钮的开关

    //放弃学习弹框提示
    $scope.outDialog = {
        show: false,
        title: '确定放弃学习吗？'
    };

    //========================= function ======================
    /**
     * 获取开始学习Url
     * @param id    课程id
     * @returns {String|string|*|*|String|string}   url
     */
    function getToStudyUrl(id) {
        return rcpAid.getUrl('学习页', {
            cid: id
        });
    }

    /**
     * 获取学习详情Url
     * @param crs   课程，$scope.resourceList 中的对象
     * @returns {String|string|*|*|String|string}   url
     */
    function getStudyDetailUrl(crs) {
        return rcpAid.getUrl('学习痕迹', {
            uid: $rootScope.currentUser && $rootScope.currentUser.uid || '',
            aid: crs.iids && crs.iids && crs.iids.text && crs.iids.text.aid || ''
        });
    }

    /**
     * 获取课程详情Url
     * @param id    课程id
     * @returns {String|string|*|*|String|string}   url
     */
    function getDetailUrl(id) {
        return rcpAid.getUrl('课程详情', {
            cid: id
        });
    }

    //处理请求返回的数据
    function handleData(data) {
        $scope.resourceList && ($scope.resourceList.length = 0);
        if (!data.data.allCount) {
            $scope.showManager = false;
            $scope.isEmpty = true;
            $scope.emptyType = !!$scope.filterKey;
            $scope.loading = false;
            return false;
        }

        $scope.resourceList = data.data.courses;
        var len = $scope.resourceList.length;
        var tempList = $scope.resourceList;
        var temp;

        // 课程评价信息
        var courseAppraisals = {};
        if (data.data.items && data.data.items.appraise && data.data.items.appraise.list) {
            courseAppraisals = data.data.items.appraise.list;
        }

        for (var i = 0; i < len; i++) {
            temp = tempList[i];
            if (temp.imgs && temp.imgs[0]) {
                temp.imgUrl = temp.imgs[0];
            } else {
                tempList[i].imgUrl = '';
            }

            //时间
            temp.start_time || (temp.start_time = '无');
            temp.end_time || (temp.end_time = '无');

            //该课程对应的课程详情url，400 被禁用的课程，被禁用的课程无法跳转至详情页
            temp.detailUrl = temp.status == 400 ? '' : getDetailUrl(temp.id);
            //开始学习Url
            temp.studyUrl = getToStudyUrl(temp.id);
            //学习详情Url
            temp.studyDetailUrl = getStudyDetailUrl(temp);
            //学习进度
            temp.step = temp.extra && temp.extra.totalItem && (temp.extra.learnedItem / temp.extra.totalItem) * 100 || 0;
            //成绩
            if (temp.extra && temp.extra.totalScore != undefined) {
                temp.totalScore = temp.extra.totalScore || 0;
                temp.totalScore = temp.totalScore.toFixed(1);
            }
            //学分
            if (temp.extra && temp.extra.obtainCredit != undefined) {
                temp.obtainCredit = temp.extra.obtainCredit || 0;
            }

            //认证机构
            if (temp.auth && temp.auth.length) {
                var hadAuth = [];
                angular.forEach(temp.auth, function (v) {
                    // console.log('v', v);
                    if (v.status == 'NORMAL') {
                        var name = data.data.usr && data.data.usr[v.orgId] && data.data.usr[v.orgId].attrs && data.data.usr[v.orgId].attrs.org && data.data.usr[v.orgId].attrs.org.name || '';
                        name && hadAuth.push(name);
                    }
                });
                hadAuth.length && (temp.hadAuth = hadAuth);
            }

            // 评价
            if (courseAppraisals[temp.id]) {
                temp.appraisal = appraiseService.handleItselfCourseCommentData(courseAppraisals[temp.id]);
            }
        }

        $scope.isEmpty = false;
        $scope.loading = false;
        return true;
    }

    //========================== scope function ======================
    /**
     * 在搜索框输入文字时回车
     * @param ev    按键事件
     */
    $scope.onkeydown = function (ev) {
        if (ev.keyCode === 13) {
            $scope.getResList();
        }
    };

    /**
     * 放弃对应课程的学习，弹出确认框
     * @param crs   课程，$scope.resourceList 中的对象
     */
    $scope.outLearning = function (crs) {
        $scope.outDialog.checkbox = false;
        $scope.outDialog.okCb = function () {
            var req = {
                cid: crs.id
            };
            $scope.outDialog.checkbox && (req.mode = 1);
            course.quitCourse(req).then(function (data) {
                !data && console.log('[error]', '放弃学习请求返回空数据', 'crs', crs, 'data', data);
                $scope.getResList($scope.pageargs && $scope.pageargs.pn || 1);
            }, function (err) {
                service.dialog.showErrorTip(err, {
                    moduleName: '我的课程',
                    funcName: '$scope.outLearning',
                    text: '放弃学习失败'
                });
            });
        };
        $scope.outDialog.show = true;
    };

    /**
     * 获取课程列表
     * @param pn    第几页
     */
    $scope.getResList = function (pn) {
        $scope.loading = true;
        $scope.pageargs = {
            pn: pn || 1,  //当前第几页
            ps: 5,  //每页显示的课程数
            pl: 5  //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
        };
    };

    /**
     * 点击我要评论按钮
     * @param course
     * @author pany
     */
    $scope.commentClickHandler = function (course) {
        if (!course || !course.id) {
            console.warn('不存在课程id');
            return;
        }

        // 被评论的课程
        $scope.beEvaluatedCourse = course;
        $scope.appraised = false;

        var appraisal = course.appraisal;
        if (!appraisal || !appraisal.valid) {
            $scope.appraised = false;
            $scope.commentData = {};
            $scope.commentDialogContent = '';
            $scope.commentEdited = false;
            $scope.gradeSelected = -1;
            $scope.showCommentDialog();
        } else {
            $scope.appraised = true;
            $scope.commentData = appraisal;
            $scope.commentDialogContent = appraisal.text;
            $scope.commentEdited = !!appraisal.text;
            $scope.gradeSelected = appraisal.grade;
            $scope.showCommentDialog();
        }

        // loadCommentInfo(course.id);
    };

    /**
     * 显示评论框
     * @author pany
     */
    $scope.showCommentDialog = function () {
        $scope.showDialog = true;
    };

    /**
     * 隐藏评论框
     * @author pany
     */
    $scope.hideCommentDialog = function () {
        $scope.showDialog = false;
    };

    /**
     * 选择评论等级
     * @param index
     * @author pany
     */
    $scope.selectAppraisalGrade = function (index) {
        !$scope.appraised && ($scope.gradeSelected = index);
    };

    /**
     * 发布评论
     * @param id
     * @author pany
     */
    $scope.submitAppraisal = function (id) {
        if (!id) {
            console.warn('不存在课程id');
            return
        }
        if ($scope.gradeSelected < 0) {
            service.dialog.alert('请选择一个评价');
            return
        }
        // if ($scope.commentDialogContent.trim().length <= 0 ) {
        //     service.dialog.alert('评论不能为空');
        //     return
        // }

        if ($scope.appraised && $scope.commentEdited) {
            // service.dialog.alert('不允许再次评论');
            // $scope.hideCommentDialog();
            console.log('不允许再次评论');
            return;
        }

        var comment = $scope.commentData;
        var str = $scope.commentDialogContent.trim();
        var course = $scope.beEvaluatedCourse;

        // 评价等级已经选择过
        if (comment.grade >= 0) {
            if (str) {
                // 更新评论内容
                appraiseService.updateCommentContent({
                    id: comment.id,
                    cid: comment.cid,
                    text: str
                }, function (isOk) {
                    if (isOk) {
                        // 更新评价成功，更新课程的评价文本内容
                        course.appraisal.text = str;
                    }
                });
            } else {
                service.dialog.alert('请填写内容');
                return;
            }
        } else {
            // 第一次发布评价
            appraiseService.publishSimpleComment({
                id: id,
                grade: $scope.gradeSelected,
                text: str,
                type: 'course'
            }, function (isOk, data) {
                if (isOk) {
                    // 发布评价成功，更新课程的评价信息
                    console.log('[student-course] submitAppraisal-publishSimpleComment data', data);
                    course.appraisal = appraiseService.handleItselfCourseCommentData(data);
                    console.log('[student-course] submitAppraisal-publishSimpleComment appraisal', course.appraisal);
                }
            });
        }

        $scope.hideCommentDialog();
    };

    /**
     * 供给 rcp-common.directive.pagination.pagination 调用
     * @param args  即$scope.pageargs
     * @param success   成功回调
     */
    $scope.pagefn = function (args, success) {
        $scope.loading = true;

        requestParams.page = args.pn;  //分页页数
        requestParams.pageCount = args.ps; //分页个数
        requestParams.k = $scope.filterKey;   //搜索关键字

        // console.log('===========requestParams================', requestParams);
        course.getStudentCourse(requestParams).then(function (data) {
            $scope.loading = false;
            handleData(data);
            data.pa = {total: data.data.allCount};
            success(data);
        }, function (err) {
            $scope.emptyType = !!$scope.filterKey;
            $scope.isEmpty = true;
            $scope.loading = false;

            service.dialog.showErrorTip(err, {
                moduleName: '我的课程',
                funcName: '$scope.pagefn',
                text: '获取课程列表失败'
            });
        });
    };

    //===================== init =================================
    //start
    function init() {
        // console.log('student course', $rootScope.currentUser);
        if (rcpAid.isLogin && $rootScope.currentUser && $rootScope.currentUser.uid) {
            $timeout(function () {
                $scope.getResList();
            });
        } else {
            $scope.$on('login', function (rs, data) {
                if (!data) {
                    //弹出登陆框
                    service.common.toLogin();
                    //跳转到登陆页
                    // service.common.toLogin(true);
                    return;
                }
                $scope.getResList();
            });
        }
    }

    init();

    //左侧菜单重复点击时刷新
    $scope.$on('bar-repeat-click', function (ev, tag) {
        if (tag == 's1') {
            $scope.getResList();
        }
    });
}]);