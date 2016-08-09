/**
 * Created by limh on 2016-07-07.
 */

module.controller('mrCtrl', ['$scope', '$rootScope', 'service', 'dialog', function ($scope, $rootScope, service, dialog) {

    $scope.reportList = [];//举报列表
    $scope.userList = {};//用户信息列表
    $scope.allCount = 0;//总举报数目
    $scope._params = {};
    //所有举报类型===课程:course,帖子:discuss,用户:user,群组:group,回复:reply,学习圈:scope,评价:comment
    $scope.reportType = {
        COURSE: 'course',
        DISCUSS: 'discuss',
        USER: 'user',
        GROUP:'group',
        REPLY:'reply',
        SCOPE:'scope',
        COMMENT:'comment'
    };

    if($scope.currentUser == null || $scope.currentUser.role == ''){
        dialog.alert('请先登录管理员账号');
        return;
    }

    $scope.showLoading = true;

    //用于初始化相关数据，触发pagefn加载举报信息列表
    var back2Initial = function () {
        $scope.currentStatus = '全部';
        $scope.currentSite = '全部';
        $scope.allCount = 0;
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };

    //默认显示Tab
    $scope.currentTab = $scope.reportType.DISCUSS;
    back2Initial();

    $scope.reset = function(){
        back2Initial();
    };
    //切换列表
    $scope.switchTab = function (rep_tabType) {
        back2Initial();
        $scope.currentTab = rep_tabType;
    };
    //举报状态
    $scope.reportStatus = {
        '全部' : '3',
        '已处理': '2',
        '已忽略': '1',
        '未处理': '0'
    };
    //举报帖子所在版块
    $scope.discussSite = {
        '我要吐槽(酷校)': '0',
        '我要吐槽(爱科学)': '1',
        '学习圈': '2',
        '全部' : ''
    };
    //改变举报状态
    $scope.changeStatus = function (report_status) {
        $scope.currentStatus = report_status;
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };
    //改变举报帖子所在版块
    $scope.changeSite = function (report_site) {
        $scope.currentSite = report_site;
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };
    //定义pagination中的pagefn
    $scope.pagefn = function (args,success) {
        $scope.loadReportList($scope.reportStatus[$scope.currentStatus],$scope.discussSite[$scope.currentSite],success);
    };

    /**
     * 加载举报信息
     * @param reportStatus
     * @param discussSite
     * @param callback
     */
    $scope.loadReportList = function(reportStatus,discussSite,callback){
        $scope.showLoading = true;
        $scope._params = {
            sort: -1,           //1:升序,-1:降序
            site:discussSite || undefined,
            type: $scope.currentTab,    //切换举报类型
            status:reportStatus, //切换举报处理状态
            limit:$scope.pageargs.ps,   //每页条数
            page :$scope.pageargs.pn,   //页数
            token: rcpAid.getToken()
        };
        //保存当前type类型
        var currentType = $scope.currentTab;
        service.ssoMethod.getReportList($scope._params).then(function(data){
            //解决网速慢时会发生的问题
            if($scope._params.type !== currentType){
                return;
            };
            console.log(data);
            $scope.reportList = data.data.data || [];
            $scope.userList = data.data.info.user || {};
            $scope.allCount = data.data.total[$scope._params.type] || 0;
            $scope.chat = data.data.info.userChat || data.data.info.groupChat || {};
            $scope.group = data.data.info.group || {};

            $scope.discuss = data.data.info.discuss || {};
            $scope.course = data.data.info.course || {};
            $scope.scope = data.data.info.scope || {};

            $scope.showLoading = false;
            if (typeof(callback) == 'function') {
                data.pa = {
                    total: data.data.total[$scope._params.type],
                    pn: $scope.pageargs.pn,
                    ps: $scope.pageargs.ps
                };
                callback(data);
            }
        },function(err){
            dialog.showErrorTip(err, {
                moduleName: '举报管理',
                funcName: 'loadReportList',
                text: '加载举报信息失败'
            });
            $scope.reportList = [];
            $scope.allCount = 0;
            $scope.showLoading = false;
        });

    };
    /**
     * 处理举报信息
     * @param rep_id  该条举报的id
     * @param rep_status  举报信息的状态
     */
    $scope.handleReport = function(rep_id,rep_status){
        var _params = {
            id: rep_id,
            status: rep_status
        };
        service.ssoMethod.handleInfo(_params).then(function(){
                dialog.alert('操作成功!');
                back2Initial();
            },function(err){
                dialog.showErrorTip(err, {
                    moduleName: '举报管理',
                    funcName: 'handleReport',
                    text: '举报处理失败'
                });
            }
        );
    };

    /**
     *打开弹出层并获取该条report信息
     * @param report 当前这条report
     */
    $scope.loadDialog = function(report){
        var oMask = $('.report-mask');
        var oReportDialog = $('.r-dialog-body');
        oMask.addClass('mask-status');
        oReportDialog.removeClass('fadeOut').addClass('fadeIn');

        //获取当前report信息
        $scope.currentReport = {
            status:report.status,
            data  :report.ext.data,
            _id   :report._id,
            uid   :report.uid,
            tid   :report.tid,
            ctime :report.ctime,
            type  :report.type
        };

        if($scope.currentReport.status !== 0){
            $('.r-dialog-footer input').css("background","#ccc");
        }else{
            $('.r-dialog-footer input').css("background","#66b6ff");
        }
        //通过report.ext.data找到个人和群组的聊天内容、头像并添加到数组中
        $scope.items = [];
        if($scope.currentReport.data){
            $scope.currentReport.data.forEach(function(data){
                if(data){
                    var userAvatar = $scope.chat[data].s || '';
                    var chatContent = $scope.chat[data].c || '';    //举报的内容
                    var item = {};
                    var contentType = $scope.chat[data].t;
                    // contentType类型
                    // 0:text
                    // 2:img
                    // 3:file  暂时不做处理
                    // 110:json
                    //判断所举报对象是否为图片
                    if(contentType === 2){
                        //if(!chatContent){
                        //    return;
                        //};
                        var chatContentImg = JSON.parse(chatContent).url;
                        item ={
                            userImg :$scope.userList[userAvatar].attrs.basic.avatar || '',
                            content :chatContentImg,
                            chatType : 1    //用来判断内容类型
                        };
                    }else if(contentType === 0){
                        item ={
                            userImg : $scope.userList[userAvatar].attrs.basic.avatar || '',
                            content : chatContent,
                            chatType : 0
                        };
                    }else{
                        return;
                    }
                }
                $scope.items.push(item);
            });
        };

    };
    /**
     * 关闭弹出层及处理个人和群组举报信息
     * @param rep_id  举报id
     * @param rep_status  举报信息的状态
     */
    $scope.closeReportDialog = function(rep_id,rep_status){
        $('.report-mask').removeClass('mask-status');
        $('.r-dialog-body').removeClass('fadeIn').addClass('fadeOut');

        if(rep_status && rep_status != 0 && rep_status != 1 && rep_status != 2 && rep_status != 3) {
            dialog.alert("参数错误");
        };
        //判断rep_status是否存在
        if(rep_id == "" || rep_id == undefined || rep_id == null){
            return;
        }else{
            $scope.handleReport(rep_id,rep_status);
        }
    };
    //通过tid获取被举报对象和discuss内容(text,img)
    $scope.getDiscuss = function(tid){
        var discussContent = {};
        var ownerId = $scope.discuss.hasOwnProperty(tid+'') &&
                      $scope.discuss[tid].hasOwnProperty('ownerId') ?
                      $scope.discuss[tid].ownerId : tid;
        var userBasic = $scope.userList.hasOwnProperty(ownerId+'') &&
                        $scope.userList[ownerId].hasOwnProperty('attrs') &&
                        $scope.userList[ownerId].attrs.hasOwnProperty('basic') ?
                        $scope.userList[ownerId].attrs.basic : '';
        discussContent = {
            discussId  :ownerId,
            discussName:userBasic.nickName,
            userImg    :userBasic.avatar,
            discussText:$scope.discuss.hasOwnProperty(tid+'') &&
                        $scope.discuss[tid].hasOwnProperty('content') ?
                        $scope.discuss[tid].content : tid,
            discussImg :$scope.discuss.hasOwnProperty(tid+'') &&
                        $scope.discuss[tid].hasOwnProperty('files') &&
                        $scope.discuss[tid].files.hasOwnProperty('IMG') ?
                        $scope.discuss[tid].files.IMG : ''
        };
        return discussContent;
    };
    //通过ext.scopes[0]获取被举报课程_id title
    $scope.getDiscussCourse = function(ext){
        var discussCourse = {};
        var scope =  $scope.userList.hasOwnProperty(ext+'') &&
                     $scope.userList[ext].hasOwnProperty('ext') &&
                     $scope.userList[ext].ext.hasOwnProperty('scopes') ?
                     $scope.userList[ext].ext.scopes[0] : ext;
        var ownerId = $scope.scope.hasOwnProperty(scope+'') &&
                      $scope.scope[scope].hasOwnProperty('ownerId') ?
                      $scope.scope[scope].ownerId : '';
        discussCourse = {
            _id  :$scope.course.hasOwnProperty(ownerId+'') &&
                  $scope.course[ownerId].hasOwnProperty('_id') ?
                  $scope.course[ownerId]._id : '',
            title:$scope.course.hasOwnProperty(ownerId+'') &&
                  $scope.course[ownerId].hasOwnProperty('title') ?
                  $scope.course[ownerId].title : ''
        };
        return discussCourse;
    };

    /**
     * 获取版块名称及对应链接
     * @param scopes
     * @returns {{}}
     */
    $scope.getDiscussUrl = function(scopes,rep_id){
        var panel = {};
        var hostKx = DYCONFIG.host.kuxiao;
        var hostAkx = DYCONFIG.host.aikexue;
        var hostKuxiao = hostKx.charAt(hostKx.length - 1) === '/' ? hostKx.substring(0,hostKx.length - 1) : hostKx;
        var hostAikexue = hostAkx.charAt(hostAkx.length - 1) === '/' ? hostAkx.substring(0,hostAkx.length - 1) : hostAkx;
        if(!scopes){
            return false;
        }
        switch(scopes){
            case 'S0' : //酷校
                panel = {
                    panelName : '我要吐槽(酷校)',
                    panelUrl : hostKuxiao + rcpAid.getUrl('我要吐槽'),
                    discussUrl : hostKuxiao + rcpAid.getUrl('吐槽帖子详情', {
                        did: rep_id   //根据帖子id查找对应帖子
                    })
                };
                break;
            case 'SA' : //  爱科学
                panel = {
                    panelName : '我要吐槽(爱科学)',
                    panelUrl : hostAikexue + rcpAid.getUrl('我要吐槽'),
                    discussUrl : hostAikexue + rcpAid.getUrl('吐槽帖子详情', {
                        did: rep_id   //根据帖子id查找对应帖子
                    })
                };
                break;
            default :   //  学习圈
                panel = {
                    panelName : '学习圈：《'+$scope.getDiscussCourse(scopes).title+'》',
                    panelUrl : hostKuxiao + rcpAid.getUrl('全部圈子', {
                        cid: $scope.getDiscussCourse(scopes)._id
                    }),
                    discussUrl : hostKuxiao + rcpAid.getUrl('圈子详情', {
                        id: rep_id   //根据帖子id查找对应帖子
                    })
                };
                break;
        }
        return panel;
    };
    //通过uid,tid获取举报人和被举报人
    $scope.getUserName = function (uid) {
        return $scope.userList.hasOwnProperty(uid+'') &&
               $scope.userList[uid].hasOwnProperty('attrs') &&
               $scope.userList[uid].attrs.hasOwnProperty('basic') &&
               $scope.userList[uid].attrs.basic.hasOwnProperty('nickName') ?
               $scope.userList[uid].attrs.basic.nickName : uid;
    };
    //通过tid获取群组名
    $scope.getGroupName = function (tid) {
        return $scope.group.hasOwnProperty(tid+'') &&
               $scope.group[tid].hasOwnProperty('name') ?
               $scope.group[tid].name : tid;
    };
}]);