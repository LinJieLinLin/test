/**
 * Created by zhengdz on 2016/4/13
 */

var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);

module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);

module.controller('courseDetail', ['$compile', '$scope', '$rootScope', '$sce', '$q', '$location', 'course', 'dialog', 'lazy', 'service', 'appraiseService', '$timeout', function ($compile,$scope, $rootScope, $sce, $q, $location, course, dialog, lazy,service, appraiseService,$timeout) {
    //每个模块的id，名字信息数组
    var idList;

    var autoScroll = false;

    //课程id
    $scope.cid = rcpAid.queryString('cid');

    //审核时的判断
    $scope.status = rcpAid.queryString('type');

    //机构id
    $scope.orgId = rcpAid.queryString('orgId');

    //机构审核时的辅助id
    $scope.authId = rcpAid.queryString("authId");

    $scope.goCircleCheck = rcpAid.getUrl('审核管理', '?url=' + rcpAid.queryString('url') + '#/course-approval');
    $scope.goOrgCheck = rcpAid.getUrl('管理中心', '?url=' + rcpAid.queryString('url') + '#/course-identify' );
    
    $scope.goStudyPage = rcpAid.getUrl('学习页',{cid:$scope.cid});

    $scope.circleNum = {
        num:0
    };

    $scope.requestShow = false;
    
    //显示加载圈
    // $scope.$parent.loadingCourse = true;

    //加载时隐藏内容
    $scope.readyStyle = {
        height: 0,
        overflow: 'hidden'
    };

    //每个模块的加载条是否显示<--intro:课程介绍，teacher：老师团队，content：课程内容，exam:题库内容，qna:答疑,comment:评价
    $scope.loading = {
        intro: true,
        teacher: true,
        content: true,
        exam: true,
        qna: true,
        comment: true
    };

    //100 正常 20 用户可编辑状态，即表示用户未发布课程 200 待审核 500 审核被拒 300 表示课程拥有者自己下架 400 被管理员禁用
    var courseStatue = {
        NORMAL:100,
        USEREDITED:20,
        UNCHECKED:200,
        OFFSELLBYOTHER:300,
        DISABLED:400,
        CHECKINGREJECT:500
    };

     //参与课程的方式，-2 用户已退出课程 -1 提交完信息审核失败 0 表示没参与 2 没参与课程并且课程需要填写课程参与资料,但用户未填写 5 正在等待用户课程资料审核 9 需要补充完整资料 10 表示已经参与课程 50 编辑管理员 60 课程管理 100 表示为课程的拥有者
    var courseJoinMode = {
        SUBMITFAIL:-1,
        NOJOIN:0,
        NEEDSUBMIT:2,
        WAITING:5,
        ADDSUBMIT:9,
        JOINED:10,
        EDITMANAGER:50,
        COURSEMANAGER:60,
        COURSEUSER:100
    };


    // 评价的参数设置
    $scope.appraiseConfig = {
        autoInit: false,
        targetId: $scope.cid,
        // 评价列表默认隐藏没有内容的评价
        hideCommentWithoutContent: true,
        sort: -1,
        type: 'preview',
        limitedNum: 8
    };

    if (!$scope.cid) {
        dialog.alert('课程 ID 为空。');
        return;
    }
    // 去掉加载圈
    angular.element('body').removeClass('loading');

    if (typeof isIE !== 'undefined') {
        $scope.isIE = isIE(9,9);
    }

//-------------------------------------------------------选项卡、滚动条部分-START----------------------------------------------------
    //滚动到相应的模块
    function scrollToSection(url) {
        var target, top;
        angular.forEach(idList, function (value) {
            if (value.id.substring(1) === url.substring(1)) {
                target = value.id;
            }
        });
        if (target) {
            top = angular.element(target).offset().top - 50;
            angular.element('html, body').animate({scrollTop: top});
        }
    }

    /**
     * 选项卡点击事件
     * @param tab
     */
    $scope.scrollToTab = function (tab) {console.log("this is scrollToTab  "+tab.callback);
        if (tab.callback) {
            tab.callback();
        } else {
            $scope.activeNav = tab.name;
            autoScroll = true;
            scrollToSection(tab.url);
            setTimeout(function () {
                autoScroll = false;
            }, 500);
        }
    };


    //设置navList数组--->选项卡的模块(nav == navigation)
    function nav () {
        $scope.navList='';
        switch ($scope.course.crs.type) {
            case '10':
                $scope.navList = [{name: '课程介绍', url: '/intro'}, {name: '课程内容', url: '/content'}];
                $scope.activeNav = '课程介绍';
                break;
            case '20':
                $scope.navList = [{name: '题库介绍', url: '/intro'}, {name: '试卷', url: '/exam'}];
                $scope.activeNav = '题库介绍';
                break;
            default:
                console.error("$scope.course.crs.type 只能为10或20")
        }
        $scope.navList = $scope.navList.concat([{name: '评价', url: '/comment'}, {name: '学习圈子', url: '/circle',showNum:true}]);
    }

    $scope.$watch('circleNum.num',function(value){
        if(!$scope.navList) return;
        angular.forEach($scope.navList,function(item){
            if(item.name === '学习圈子'){
                if(value > 999){
                    item.num = "999+";
                }else{
                    item.num = value;
                }
            }
        })
    });

    /**
     * 检查navlist中的模块的url与当前url中相对应的模块，有则滚到相应部分
     */
    function checkUrlHash () {
        var url = $location.url();
        var tab;
        angular.forEach($scope.navList, function (item) {
            if (item.url === url) {
                tab = item;
            }
        });
        if (!tab) {return;}
        setTimeout(function () {
            $scope.scrollToTab(tab);
        }, 500);
    }

    /**
     *选项卡浮动
     */
    function floatNav() {
        if($scope.status === '2' || $scope.status === '3'){
            var checkWrapper = angular.element('.statusTwo');
            angular.element(document).on('scroll', function () {
                var top       = checkWrapper.offset().top;
                var scrollTop = $(document).scrollTop();
                if (scrollTop >= top + 10) {
                    $scope.floatCNav = true;
                } else {
                    $scope.floatCNav = false;
                }
                try {
                    $scope.$digest();
                } catch (e) {
                    console.log(e);
                }
                if (autoScroll) {return;}

            });
        }else{
            var handler;
            var wrapper = angular.element('.course-detail');
            angular.element(document).on('scroll', function () {
                var top       = wrapper.offset().top;
                var scrollTop = $(document).scrollTop();
                if (scrollTop >= top + 20) {
                    $scope.floatNav = true;
                } else {
                    $scope.floatNav = false;
                }
                try {
                    $scope.$digest();
                } catch (e) {
                    console.log(e);
                }
                if (autoScroll) {return;}
                clearTimeout(handler);
                handler = setTimeout(function () {
                    highLightTab();
                }, 200);
            });
        }

    }


    /**
     * 滚动时选项卡的高亮
     */
    function highLightTab () {
        var flag;
        var scrollTop = $(document).scrollTop();
        angular.forEach(idList, function (item) {
            var htmlObj = angular.element(item.id);
            if (item.name === '老师') {return;}
            if (htmlObj.length && !htmlObj.is(':hidden') && scrollTop >= (htmlObj.offset().top - 50)) {
                flag = true;
                $scope.activeNav = item.name;
            }
        });
        if (!flag) {
            $scope.activeNav = idList[Object.keys(idList)[0]].name;
            console.log($scope.activeNav);
        }
        try {
            $scope.$digest();
        } catch (e) {
            console.log(e);
        }
    }

    $scope.toTop = function () {
        angular.element('html, body').stop().animate({scrollTop: 0}, 'slow');
    };

//------------------------------------------------------选项卡、滚动条部分-END-----------------------------------------------

    //根据课程性质设置按钮名称（如：免费学习）
    function displayStatus () {
        switch ($scope.course.crs.status) {
            case courseStatue.NORMAL: {
                if($scope.status === '2'){
                    $scope.statusText = "审核已通过";
                    return;
                }

                if($scope.course.ended){
                    if(!$scope.isPurchase){
                        $scope.statusText = "课程已结束";
                    }else{
                        $scope.statusText = "开始学习";
                    }
                    return;
                }
                else if ($scope.isPurchase  || !$scope.course.started) {
                    if ($scope.type === '课程') {
                        $scope.statusText = $scope.course.started ? '开始学习' : '暂未开课';
                    } else {
                        $scope.statusText = $scope.course.started ? '开始做题' : '暂未开始';
                    }
                } else if ($scope.course.price > 0) {
                    if($scope.course.started){
                        $scope.statusText = '立即购买';
                    }else{
                        $scope.statusText = '暂未开课';
                    }
                } else {
                    if ($scope.type === '课程') {
                        $scope.statusText = '免费学习';
                    } else {
                        $scope.statusText = '开始做题';
                    }
                }

                if($scope.course.joinMode == courseJoinMode.NEEDSUBMIT || $scope.course.joinMode == courseJoinMode.ADDSUBMIT){
                    $scope.statusText = '申请学习';
                }
                else if($scope.course.joinMode == courseJoinMode.WAITING){
                    $scope.statusText = '申请中';
                }
                else if($scope.course.joinMode == courseJoinMode.SUBMITFAIL){
                    $scope.statusText = '申请学习';
                }
                break;
            }
            case courseStatue.OFFSELLBYOTHER: {
                $scope.statusText = '已下架';
                break;
            }
            case courseStatue.DISABLED: {
                $scope.statusText = '已禁用';
                break;
            }
            case courseStatue.USEREDITED: {
                $scope.statusText = '未发布';
                break;
            }
            case courseStatue.UNCHECKED: {
                $scope.statusText = '待审核';
                break;
            }
            case courseStatue.CHECKINGREJECT: {
                $scope.statusText = '审核不通过';
                break;
            }
            default:
                console.error("$scope.course.crs.status 非期待状态")
        }

        if($scope.status === '3'){
            if($scope.orgStatus == 'WAITING'){
                $scope.statusText = '待认证';
            }
            else if($scope.orgStatus == 'FAIL'){
                $scope.statusText = '认证失败';
            }
            else if($scope.orgStatus == 'NORMAL'){
                $scope.statusText = '认证已通过';
            }
        }

    }

//------------------------------------------------选项卡的加载模块-START----------------------------------------------------------------------

    function loadTeacher () {
        // var teachersID = '';
        // var teachersInfo = '';
        //课程老师的信息
        // if($scope.course.items.service) {
        //     teachersID =$scope.course.items.service.list.service.uids;
        //     teachersInfo = $scope.course.items.service.list.users;
        // }else{
        //     console.log("this is no $scope.course.items.service");
        // }
        $scope.teachers = [];
        $scope.loading.teacher = false;
        if($scope.course.crs.team && $scope.course.usr){
            angular.forEach($scope.course.crs.team,function(tidItem){
                if($scope.course.usr[tidItem.uid]){
                    $scope.teachers.push({
                        name: $scope.course.usr[tidItem.uid].attrs.basic.nickName,
                        id: tidItem.uid,
                        avatar:$scope.course.usr[tidItem.uid].attrs.basic.avatar,
                        desc:$scope.course.usr[tidItem.uid].attrs.basic.desc
                    });
                }else{
                    console.error('没有id为'+tidItem.uid+'的用户信息');
                }
            })
        }
    }


    //课程概述--------没有用了，课程简介的显示由directive(content-summary)
    function makeIntro (data) {
        var head = {
            'b':'<div class="intro-title">',
            'e':'</div>'
        };
        var rs = '';
        angular.forEach(data,function(item){
            rs += head.b + (item.name || '') + head.e + item.content;
        });
        return rs;
    }

    function loadIntro () {
        var courseIntros=[];

        //获取课程简介
        if($scope.course.items.summary){
            courseIntros = $scope.course.items.summary.idx.items;
        }else{
            console.log("This is no $scope.course.items.summary")
        }

        $scope.readyStyle = {};
        $scope.loading.intro= false;
        if(courseIntros.length){
            var tempIntro='';
            angular.forEach(courseIntros,function(curitem){
                if(curitem.t === "T1"){
                    tempIntro += '<div class="intro-title">';
                    tempIntro += curitem.c.title;
                    tempIntro += "</div>";
                }else if(curitem.t === "image"){

                }
            });
            $scope.intro = $sce.trustAsHtml(tempIntro||'<p class="no-data">暂无'+$scope.type+'介绍</p>');
        }else{
            $scope.intro = $sce.trustAsHtml('<p class="no-data">暂无'+$scope.type+'介绍</p>');
        }
    }

    //课程内容块的三个小部分的显示：section：章节，exercise：测评,qna:答疑
    $scope.loadContent = {
        section: false,
        exercise: false,
        qna: false
    };

    function loadContent () {
        var courseContents = [];
        //获取课程内容
        if($scope.course.items.text){
            courseContents = $scope.course.items.text.idx.items;
        }else{
            console.log("this is no $scope.course.items.text");
        }

        $scope.loading.content = false;
        if(courseContents.length) {
            $scope.section = courseContents;
            var sectionCount = 0;
            angular.forEach(courseContents, function (curItem) {
                if (curItem.t === 'T1') {
                    sectionCount += 1;
                }
            });
            $scope.course.info.sectionCount = sectionCount;
        }else{
            console.log("没有课程内容");
        }


    }

    function loadCircle(){
        console.log("This is loadCircle   ");
    }

    function loadExam(){
        var paperInfo='';
        //获得试卷数据
        if($scope.course.items.paper.list){
            paperInfo = $scope.course.items.paper.list;
        }else{
            console.log("this is no $scope.course.items.paper.list");
        }

        $scope.loading.exam = false;
        $scope.paperList= paperInfo;
    }


    function loadComment(){
        $scope.loading.comment = false;
    }

    // 初始化评价组件
    function initAppraiseComponent() {
        $scope.navList[2].showNum = true;
        // $scope.lookMoreAppraiseUrl = rcpAid.getUrl('课程评价', {id: $scope.cid});

        $scope.$on('appraiseUpdate', function (e, data) {
            console.log('appraiseUpdate', e, data);
            $scope.appraiseData = data;
            $scope.navList[2].num = data.gradesCount > 999 ? '999+' : data.gradesCount;
            $scope.navList[2].showNum = true;
            $scope.goodGradeNum = data.grades['0'];
        });
    }

    // 加载评价数据
    function loadCommentData() {
        var requestParams = {
            targetId: $scope.cid,
            page: 1,
            pageCount: 8
        };
        appraiseService.getTargetComment(requestParams, function (ok, data) {
            console.log('course-detail-loadcomment', ok, data);
            if (ok) {
                $scope.cmtResult = data;
                $scope.loading.comment = false;
            }
        });
    }
//------------------------------------------------选项卡的加载模块-END---------------------------------------------------------------------------

    //点击课程内容相应的章节进行跳转
    $scope.enterLearning = function (i) {
        // if($scope.currentUser.role && $scope.currentUser.role.COURSE_VERIFY_ADMIN)
        // if( $scope.course.crs.status !== courseStatue.NORMAL && $scope.currentUser && $scope.currentUser.uid !== $scope.course.user &&  )

        var cmds = {
            cid:$scope.cid,
            target:i.i,
            token:rcpAid.getToken()
        };

        if (!$scope.logined) {
            service.common.toLogin();
        }
        else if ($scope.status === '2') {
            if($scope.currentUser.role && $scope.currentUser.role.COURSE_VERIFY_ADMIN){
                // window.location.href = rcpAid.getUrl('学习页',cmds);
            }
        } else if ($scope.status === '3') {
            if($scope.currentUser.org && $scope.currentUser.org.orgid){
                // window.location.href = rcpAid.getUrl('学习页',cmds);
            }
        }
        else if ($scope.course.joinMode == courseJoinMode.COURSEUSER || $scope.course.joinMode == courseJoinMode.COURSEMANAGER || $scope.course.joinMode == courseJoinMode.EDITMANAGER) {
            window.location.href = rcpAid.getUrl('学习页',cmds);
        }
        else if($scope.course.joinMode == courseJoinMode.SUBMITFAIL || $scope.course.joinMode == courseJoinMode.NEEDSUBMIT || $scope.course.joinMode == courseJoinMode.WAITING || $scope.course.joinMode == courseJoinMode.ADDSUBMIT ){
            
        }
        else if($scope.course.crs.status !== courseStatue.NORMAL){

        }
        else if ($scope.isPurchase) {
            if($scope.course.started ){
                window.location.href = rcpAid.getUrl('学习页',cmds);
            }else if(!$scope.course.started){
                dialog.alert('该课程暂未开始');
            }
        }
        else {
            if(!$scope.course.started){
                dialog.alert('该课程尚未开课');
            }else if($scope.course.ended){
                dialog.alert('该课程已经结束');
            } else if ($scope.course.price > 0) {
                dialog.alert('请先购买' + $scope.type);
            } else {
                joinFreeCourse($scope.cid).then(function () {
                    window.location.href = rcpAid.getUrl('学习页',cmds);
                }, function (error) {
                    service.dialog.showErrorTip(error, {moduleName: 'course-detail', funcName: 'joinFreeCourse'});
                });
            }
        }
    };

    //给相应的模块添加回调函数--->懒加载滚动到相应的模块才加载
    function loadData() {
        lazy.request({
            json: {
                intro: {
                    node    : idList.intro.id,
                    callback: loadIntro
                },
                teacher: {
                    node    : idList.teacher.id,
                    callback: loadTeacher
                },
                section: {
                    node    : idList.content.id,
                    callback: loadContent
                },
                circle:{
                    node :idList.circle.id,
                    callback:loadCircle
                },
                // exam: {
                //     node    : idList.exam.id,
                //     callback: loadExam
                // },
                comment: {
                    node    : idList.comment.id,
                    callback: loadComment
                }
                // qna: {
                //     node    : idList.qna.id,
                //     callback: loadQna
                // }
            }
        });
    }

    /**
     * 跳到试卷模块
     */
    function goToPaperSection () {
        var target;
        angular.forEach($scope.navList, function (item) {
            if (item.name === '试卷') {
                target = item;
            }
        });
        setTimeout(function () {
            $scope.scrollToTab(target);
        }, 100);
    }

    function joinFreeCourse (id) {
        return course.joinFreeCourse({cid: id});
    }

    //点击课程按钮的事件
    $scope.buyCourse = function () {
        if (!$scope.logined) {
            service.common.toLogin();
            return;
        }
        if($scope.status === '2' && $scope.currentUser.role && $scope.currentUser.role.COURSE_VERIFY_ADMIN){
            window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
        }
        else if($scope.status === '3'&& $scope.currentUser.org && $scope.currentUser.org.orgid){
            window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
        }
        else if($scope.course.joinMode == courseJoinMode.COURSEUSER || $scope.course.joinMode == courseJoinMode.COURSEMANAGER || $scope.course.joinMode == courseJoinMode.EDITMANAGER){
            window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
        }
        else if ($scope.isPurchase || !$scope.course.started) {
            if ($scope.course.started) {
                if ($scope.type === '课程') {
                    window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
                } else {
                    goToPaperSection();
                }
            } else {
                dialog.alert('该' + $scope.type + '尚未开课。');
                return;
            }
        }
        else if($scope.course.ended){
            dialog.alert("改课程已经结束");
        }
        else if($scope.course.joinMode == courseJoinMode.NEEDSUBMIT || $scope.course.joinMode == courseJoinMode.SUBMITFAIL ||$scope.course.joinMode == courseJoinMode.WAITING ||$scope.course.joinMode == courseJoinMode.ADDSUBMIT){
            if($scope.course.joinMode == courseJoinMode.NEEDSUBMIT || $scope.course.joinMode == courseJoinMode.SUBMITFAIL ||$scope.course.joinMode == courseJoinMode.ADDSUBMIT){
                if(!$scope.requestShow){
                    $scope.requestShow = true;
                    $timeout(function () {
                        var targetTable = angular.element('#table-insert-position');
                        console.log(targetTable.height());
                        if(targetTable.height()>360){
                            targetTable.addClass('request-table');
                            $scope.requestHeight = 360+126;
                        }else{
                            $scope.requestHeight = targetTable.height()+126;
                        }
                    });

                }
            }
        }
        else if ($scope.course.price > 0) {
            window.location.href = rcpAid.getUrl('确认订单',{cid:$scope.cid,type:course});
        } else {
            joinFreeCourse($scope.cid).then(function () {
                dialog.alert('成功参与该' + $scope.type);
                $scope.isPurchase              = true;
                //$scope.course.hasUserPurchased = true;
                if ($scope.course.started) {
                    if ($scope.type === '课程') {
                        window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
                    } else {
                        goToPaperSection();
                    }
                } else {
                    $scope.statusText = '暂未开课';
                }
            }, function (error) {
                service.dialog.showErrorTip(error, {moduleName: 'course-detail', funcName: 'joinFreeCourse'});
            });
        }
    };


    function getCourseDetail () {
        if ($scope.status && (+$scope.status == 1 || +$scope.status == 2)) {
            $scope.notPublished = true;
        }
        var cmds = {
            service:{
                list:{}
            },
            summary: {
                idx: {
                    itemc:"1",
                    type: "T1,T2,image,text"
                }
            },
            text: {
                idx: {
                    type: "T1,T2"
                }
            },
            paper:{
                list:{}
            },
            test:{
                list:{}
            },
            appraise: {
                list: {
                    // empty 是否显示评价内容为空的评价, 0 显示, 大于0 不显示
                    empty: $scope.appraiseConfig.hideCommentWithoutContent ? 1 : 0,
                    sort: $scope.appraiseConfig.sort
                }
            }
        };
        return course.getCourseDetail({cid: $scope.cid,price:1,pvs:1,cmds:angular.toJson(cmds),time:new Date().getTime()});
    }

    function courseDetaiInit(){
        getCourseDetail().then(function (data) {
            // $scope.$parent.loadingCourse = false;
            console.log($scope.currentUser);
            $scope.course                = data.data;

            if(!$scope.course.crs){
                console.error("this is no data.data.crs");
                return;
            }
            $scope.c={
                courseReasonInput:''
            };
            if( $scope.status === '2') {
                console.log($scope.currentUser);
                if($scope.course.crs.status === courseStatue.USEREDITED){
                    return;
                }
                if(($scope.currentUser.role && !$scope.currentUser.role.COURSE_VERIFY_ADMIN) || !$scope.currentUser.role){
                    $scope.loadCourseError = true;
                    dialog.alert("您没有权限查看此页面");
                    return;
                }
                if($scope.course.crs.extra && $scope.course.crs.extra.reason){
                    $scope.courseReason = $scope.course.crs.extra.reason;
                    $scope.c.courseReasonInput = '';
                }else{
                    $scope.courseReason = '';
                    $scope.c.courseReasonInput='';
                }
            }else if($scope.status === '3'){
                try{
                    angular.forEach($scope.course.crs.auth,function(oItem){
                        if(oItem.authId === $scope.authId){
                            $scope.courseReason = oItem.reason;
                            $scope.orgStatus = oItem.status;
                            console.log( $scope.orgStatus +'   '+oItem.orgId);
                        }
                    })
                }catch (e){
                    console.log("$scope.course.crs.auth 字段错误");
                }
                if(!$scope.courseReason){
                    $scope.courseReason = '';
                }
                $scope.c.courseReasonInput = '';
                console.log($scope.orgStatus);
            }

            //改为由css中的maxlength控制
            // $scope.$watch('c.courseReasonInput',function(value){
            //    if(value && value.length>50){
            //        $scope.c.courseReasonInput = value.substr(0, 50);
            //    }
            // });

            if ($scope.course.items.summary && $scope.course.items.summary.idx.items) {
                $scope.introConfig.content = $scope.course.items.summary.idx.items;
                $scope.introConfig.scope.init();
            }

            $scope.orgList = [];

            try{
                if($scope.course.crs.auth){
                    angular.forEach($scope.course.crs.auth,function(item,index){
                        if(item.status === "NORMAL"){
                            if($scope.course.usr[item.orgId]){
                                var orgNameTemp = $scope.course.usr[item.orgId].attrs.org.name;
                                if($scope.orgList.indexOf(orgNameTemp) === -1){
                                    $scope.orgList.push(orgNameTemp);
                                }
                            }
                        }
                    })
                }else{
                    console.log("$scope.course.crs.auth字段为空");
                }
            }catch (e){
                console.error(e);
            }

            //该课程是否开课
            $scope.course.started = moment().isAfter(moment($scope.course.crs.start_time));

            //该课程是否已经结束
            try{
                if($scope.course.crs.end_time){
                    $scope.course.ended = moment().isAfter(moment($scope.course.crs.end_time));
                    console.log("该课程已经结束",$scope.course.ended);
                }else{
                    $scope.course.ended = false;
                }
            }catch (e){
                console.error(e);
            }


            $scope.isPurchase = $scope.course.joinMode == courseJoinMode.JOINED;

            $scope.course.info = {};

            if($scope.course.crs.type){
                $scope.type =  $scope.course.crs.type === "10" ? '课程' : '题库';
            }else{
                console.error("没有$scope.course.crs.type");
            }

            // $scope.typeE                 = $scope.type === '课程' ? 'course' : 'questionPool';

            $rootScope.title             = $scope.course.crs.title + ' - ' + $scope.type + '详情';
            $scope.course.user          = $scope.course.crs.uid;


            //---------------------------------------课程申请条件----------------------------------------------------------------
            if($scope.course.crs && $scope.course.crs.role && $scope.course.crs.role.basic){
                $scope.requestStand = $scope.course.crs.role.basic;
                $scope.requestParam = [];
                $scope.requestSParam = {};
                $scope.requestTable = '<table>';
                angular.forEach($scope.course.crs.role.basic,function (Item,index) {
                    $scope.requestTable += '<tr>';
                    if(!Item.desc){
                        Item.desc='请填写相关信息';
                    }
                    $scope.requestParam[index] = {
                        name:Item.key,
                        toName:'input'+index,
                        type:Item.value
                    };
                    if(Item.value == 'string'){
                        $scope.requestTable += '<td class="self-table-td">'+'<span class="self-span-left">*</span><span class="self-span-right">'+Item.key+'</span></td>'+'<td class="self-table-td-input"><input maxlength="100" class="self-input" id="input-'+index +'" placeholder="'+Item.desc+'" ng-model="input'+index+'">'+'</td>'+'</tr>';
                    }else if(Item.value == 'array'){
                        $scope['selfInput'+index] = false;
                        $scope.requestTable += '<td class="self-table-td">'+'<span class="self-span-left">*</span><span class="self-span-right">'+Item.key+'</span></td>'+'<td class="self-table-td-input"><div style="position: relative;"><input readonly="readonly" class="self-input1" ng-model="input'+index+'" id="selfinput-'+index+'" ng-blur="selfInputClose('+index+')"  ng-click="selfInputShow('+index+')">';
                        $scope.requestTable += '<button id="selfbutton-'+index+'" ng-blur="selfInputClose('+index+')"  ng-click="selfInputShow('+index+')" class="self-input1-button"><label ng-hide="selfInput'+index+'"  class="label-up"></label><label  ng-show="selfInput'+index+'"  class="label-down"></label></button>';
                        $scope.requestTable += '<div id="selfdiv'+index+'" style="z-index: 100;position: absolute; width: 278px; border: solid #b5b5b5; border-width: 0 1px 1px 1px; background-color: white" ng-mouseenter="enterDiv('+index+')"  ng-mouseleave="leftDiv('+index+')" ng-show="selfInput'+index+'" >';
                        $scope.requestTable += '<ol>';
                        angular.forEach(Item.range,function(arrayItem,aidex){
                            if(aidex == 0){
                                $scope['input'+index] = arrayItem;
                                $scope.requestParam[index]['originValue'] = arrayItem;
                            }
                            $scope.requestTable += '<li class="text-of self-input1-li" ng-click="selfInputChoose('+index+',$event)" title="'+arrayItem+'">'+arrayItem+'</li>'
                        });
                        $scope.requestTable += '</ol></div></div></td>';
                    }

                });
                $scope.requestTable += '</table>';

                var targetTableHtml = $compile($scope.requestTable)($scope);
                var targetTable = angular.element('#table-insert-position');
                targetTable.append(targetTableHtml);
                if(targetTable.height()>360){
                    targetTable.addClass('request-table');
                    $scope.requestHeight = 360+126;
                }else{
                    $scope.requestHeight = targetTable.height()+126;
                }
            }else{
                console.log("$scope.course.crs && $scope.course.crs.role && $scope.course.crs.role.basic出错");
            }

            //---------------------------------显示申请失败的提交数据----------------------------------------------------------------
            if($scope.course.joinMode == courseJoinMode.SUBMITFAIL){
                try{
                    angular.forEach($scope.course.form.msg.basic,function (msgItem,index) {
                        angular.forEach($scope.requestParam,function (findItem) {
                            if(findItem.name == index){
                                $scope[findItem.toName] = msgItem;
                            }
                        })
                    })
                }catch (e){
                    console.log("获得申请失败的提交数据失败");
                }
            }

            //-----------------------------学习圈子参数的设置---------------------------------------------------------------------------------
            $scope.circleConfig = {
                rUrl: DYCONFIG.studyCircle.rUrl,
                category: '10'
            };

            $scope.circleConfig.cid = $scope.cid;
            $scope.circleConfig.type = $scope.course.crs.type;


            // 课程评价评分
            try {
                // 转换得到的评价数据
                $scope.cmtResult = appraiseService.handleTargetComment($scope.course.items.appraise.list)
            } catch (e) {
                $scope.cmtResult = {};
            }

            idList = {
                intro: {
                    name: $scope.type + '介绍',
                    id  : '#intro'
                },
                teacher: {
                    name: '老师',
                    id  : '#teacher'
                },
                content: {
                    id  : '#content',
                    name: '课程内容'
                },
                comment: {
                    id  : '#comment',
                    name: '评价'
                },
                circle: {
                    id  : '#circle',
                    name: '学习圈子'
                },
                // exam: {
                //     id  : '#exam',
                //     name: '试卷'
                // }
                // qna: {
                //     id  : '#qna',
                //     name: '答疑'
                // },

            };
            nav();

            initAppraiseComponent();

            floatNav();
            loadData();
            displayStatus();
            checkUrlHash();
            //-----------------------------------课程详情页图片显示（已被ng-img替代）----------------------------------------------
            // if ($scope.course.crs.imgs) {
            //     try{
            //         var img = new Image();
            //         img.onerror = function(){
            //             console.error("图片加载失败");
            //             $scope.cover = {
            //                 'background-image':'url(/rcp-common/imgs/icon/gray-default-img.png)'
            //             };
            //         };
            //         img.onload = function () {
            //             $scope.cover = {
            //                 'background-image': 'url(' + ($scope.course.crs.imgs.toString() || '').split(',')[0] + ')',
            //                 'background-size': 'cover'
            //             };
            //         };
            //         if($scope.course.crs.imgs.length && $scope.course.crs.imgs[0]){
            //             img.src = $scope.course.crs.imgs[0];
            //
            //         }else{
            //             $scope.cover = {
            //                 'background-image':'url(/rcp-common/imgs/icon/gray-default-img.png)'
            //             };
            //         }
            //     }catch(err) {
            //         console.error("crs.imgs 不是数组");
            //         $scope.cover = {
            //             'background-image':'url(/rcp-common/imgs/icon/gray-default-img.png)'
            //         };
            //     }
            //
            // }else{
            //     console.error("没有crs.imgs这个字段");
            //     $scope.cover = {
            //         'background-image':'url(/rcp-common/imgs/icon/gray-default-img.png)'
            //     };
            // }
        }, function (error) {
            // $scope.$parent.loadingCourse = false;
            $scope.loadCourseError = true;
            service.dialog.showErrorTip(error, {moduleName: 'course-detail', funcName: 'getCourseDetail'});
        });
    }

    //课程按钮不可点击的判断
    $scope.disabledAction = function () {
        if($scope.course.joinMode == courseJoinMode.COURSEUSER || $scope.status === '2' || $scope.status === '3'|| ($scope.course.ended && $scope.isPurchase)){
            return false;
        }
        if(!$scope.course.started || $scope.course.ended || $scope.course.crs.status !== courseStatue.NORMAL){
            return true;
        }
    };

    //-------------------------------------申请条件的下拉列表 START------------------------------------------
    //selfInput指的是下拉列表
    $scope.selfInputShow = function(e){
        if($scope['selfInput'+e]){
            $scope['selfInput'+e] = false;
        }else{
            $scope['selfInput'+e] =  true;
        }
    };

    $scope.selfInputClose = function(i,e){
        $scope['selfInput'+i] = false;
    };


    $scope.selfInputChoose = function(i,e){
        $scope['input'+i] = e.target.title;
        $scope.selfInputClose(i);
    };

    //进入下拉列表的事件
    $scope.enterDiv = function (i) {
        $("#selfinput-"+i).off("blur");
        $("#selfbutton-"+i).off("blur");
    };

    //离开下拉列表的事件
    $scope.leftDiv = function(i) {
        $("#selfinput-" + i).on("blur", function () {
            $timeout(function(){
                $scope['selfInput' + i] = false;
            });
        });
        $("#selfbutton-" + i).on("blur", function () {
            $timeout(function(){
                $scope['selfInput' + i] = false;
            });
        });
    };

    //-------------------------------------申请条件的下拉列表 END------------------------------------------


    //课程描述组件配置
    $scope.introConfig = {
        scope: null,
        less: true,
        content: []
    };

    /**
     * 课程审核
     * @param type 课程审核的状态
     */
    $scope.approveCourse = function (type) {
        if ($scope.course.crs.status !== courseStatue.UNCHECKED && $scope.course.crs.status !== courseStatue.DISABLED && (type === 1 || type === 0)) {
            dialog.alert('课程不是待审核状态');
            return;
        }
        if(type === 10 && $scope.course.crs.status !== courseStatue.NORMAL && $scope.course.crs.status !== courseStatue.OFFSELLBYOTHER){
            dialog.alert('该课程不能下架或禁用');
            return;
        }
        course.verifyCourse({
            reason: $scope.c.courseReasonInput,
            cid   : $scope.cid,
            pass:type
        }).then(function () {
            window.location.href =$scope.goCircleCheck;

        }, function (err) {
            service.dialog.showErrorTip(err, {moduleName: 'course-detail', funcName: 'verifyCourse'});
        });
    };

    /**
     * 机构审核
     * @param type 审核的状态
     */
    $scope.approveOrg = function(type){
        course.commitAuth({
            cid:$scope.cid,
            orgId:$scope.orgId,
            pass:type,
            reason:$scope.c.courseReasonInput
        }).then(function(){
            window.location.href = $scope.goOrgCheck;
        },function(err){
            service.dialog.showErrorTip(err, {moduleName: 'course-detail', funcName: 'commitAuth'});
        })
    };

    //申请条件确认按钮事件
    $scope.requestOk = function () {
        var flag = true;
        $scope.submitAnswer = {};
        angular.forEach($scope.requestParam,function(curItem,index){
            $scope.submitAnswer[curItem.name] = $scope[curItem.toName];
            if(!$scope.requestStand[index].optioned && !$scope[curItem.toName]){
                flag = false;
            }
        });
        var cmds={
            cid:$scope.cid,
            msg:{}
        };
        cmds.msg.basic = $scope.submitAnswer;
        console.log(cmds);
        if(flag){
            course.upsertForm({},{data:angular.toJson(cmds)}).then(function(){
                $scope.course.joinMode = courseJoinMode.WAITING;
                $scope.statusText = '申请中';
                $scope.requestCancle();
            },function(error){
                service.dialog.showErrorTip(error, {moduleName: 'course-detail', funcName: 'upsertForm'});
            })
        }else{
            dialog.alert('请填写完所有内容');
        }

    };

    //申请条件取消按钮事件
    $scope.requestCancle = function(){
        angular.forEach($scope.requestParam,function (curItem,i) {
            $scope['input'+i] = '';
            if(curItem.type === 'array'){
                $scope['input'+i] = curItem.originValue;
            }
        });
        $scope.requestShow = false;

    }

    $scope.$on('login',function(rs,data){
        if(!data){
            if($scope.status == 2 || $scope.status == 3){
                service.common.toLogin();
                return;
            }else{
                courseDetaiInit();
            }
        }else{
            $scope.logined = true;
            courseDetaiInit();
            console.log("登录了用户信息为： "+data);
        }
    });

}]);
