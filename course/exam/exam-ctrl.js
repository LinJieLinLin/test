/**
 * Created by zhengdz on 2016/5/4
 */

var module = angular.module("RCP",[
    "ngCookies",
    "LocalStorageModule",
    "ngSanitize"
]);

module.filter("sanitize",['$sce',function ($sce){
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

module.controller('examCtrl',['$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'dialog', 'examReq', 'service', '$interval', function ($rootScope,$scope,$timeout,$anchorScroll,$location,dialog,examReq,service,$interval) {
    $scope.curToken = rcpAid.getToken();

    $scope.cid = rcpAid.queryString("cid");

    //学习页具体的章节id
    $scope.target = rcpAid.queryString("target");

    //试卷id
    $scope.aid = rcpAid.queryString("aid");

    //评测id
    $scope.tid = rcpAid.queryString("tid");

    //考试id
    $scope.eid = '';

    //预览
    $scope.preview = rcpAid.queryString("preview");

    $scope.testDate = rcpAid.queryString("testDate");

    
    if($scope.preview === '1'){
        $scope.resolvestatus = 4;
    }else{
        $scope.resolvestatus = false;
    }

    //边做边看
    $scope.seeanddo = true;

    $scope.restartAnswer = rcpAid.queryString("restartanswer");
    
    $scope.logined = false;
    $scope.readyloading = true;
    $scope.errorPaper = false;

    $scope.maxHeight = $(window).height() - 200;

    //试卷基本信息
    $scope.paperInfo = '';
    
    //所有题组
    $scope.QuestionGroups = '';

    $scope.hasDonePaper = false;

    //当前题组
    // $scope.curQuestionGroup = 0;
    
    //当前题组的试卷题目列表
    // $scope.curPageList = '';
    
    //当前题目
    $rootScope.curQuestion = undefined;

    $scope.questionAnswerList = [];

    $scope.rightSectionFloat = false;

    $scope.examTitle = '';
    $scope.examSectionNum = 0;
    $scope.examQueNum = 0;
    $scope.examStartTime = '';
    $scope.examDoTime = '';
    $scope.examScore = 0;
    $scope.examDesc = '';


    //右部滚动监听
    angular.element(document).on('scroll',function () {
        var target = angular.element('.exam-right-section');
        var top = target.offset().top;
        var leftTarget = angular.element('.exam-left-section');
        var leftTop = leftTarget.offset().top;
        if($(document).scrollTop() >= top && $(document).scrollTop() >= leftTop){
            $scope.rightSectionFloat = true;
        }else{
            $scope.rightSectionFloat = false;
        }
        try{
            $scope.$digest();
        }catch(e){
            console.log(e);
        }
    });

    var changeNum = 0;

    //每隔10秒自动提交答案
    var stopInterval = $interval(function(){
        if($scope.preview === '1') return;
        if(changeNum){
            submitAnswer().then(function (data) {
                console.log(data);
            },function (err) {
                console.error(err);
            });
            changeNum = 0;
        }
    },10*1000);

    //计时
    function timeRunning(flag){
        if(!flag){
            if($scope.stopTime){
                $interval.cancel($scope.stopTime);
            }
            $scope.stopTime = $interval(function () {
                $scope.countdown -= 1000;
                $scope.examLfTime = timeChange($scope.countdown,true);

                if($scope.countdown <= 0){
                    $interval.cancel($scope.stopTime);
                    if($scope.eid && $scope.tid){
                        paperJudge(true);
                    }else{
                        dialog.alert("没有eid，无法提交");
                    }
                }
            },1000)
        }else{
            if($scope.stopTimeC){
                $interval.cancel($scope.stopTimeC);
            }
            $scope.stopTimeC = $interval(function () {
                $scope.countdown += 1000;
                $scope.examLfTime = timeChange($scope.countdown,true);
            },1000)
        }

    }

    

    //隐藏样式
    $scope.readyStyle = {
        height:0,
        overflow:'hidden'
    };

    //去掉加载动画，显示样式
    function delRedyStat(){
        $scope.readyloading = false;
        $scope.readyStyle = {};
    }

    //提交做题的答案
    function submitAnswer() {
        var answer={};
        console.log($scope.questionAnswerList);
        angular.forEach($scope.questionAnswerList,function (curItem) {
            angular.forEach(curItem,function (inItem) {
                if(inItem.hasdone){
                    $scope.hasDonePaper = true;
                }
                var temp = {};
                if(inItem.qtype === 'e_text' && inItem.hasdone){
                    if(inItem.answer && inItem.answer[0]){
                        // temp.answer = encodeURIComponent(inItem.answer[0]);
                        temp.answer = inItem.answer[0];
                    }else{
                        temp.answer = null;
                    }
                    answer[inItem.qid] = temp;
                }else if(inItem.qtype === 'e_fill' && inItem.hasdone){
                    var fillnodone = false;
                    var tempans = [];
                    angular.forEach(inItem.answer,function(ansItem){
                        if(!ansItem){
                            tempans.push('');
                        }else{
                            var ansItem = ansItem.replace(/\s+/g,"");
                            // tempans.push(encodeURIComponent(ansItem));
                            tempans.push(ansItem);
                            fillnodone = true;
                        }
                    });
                    if(fillnodone){
                        temp.answer = tempans;
                    }else{
                        temp.answer = null;
                    }

                    answer[inItem.qid] = temp;
                }else if(inItem.qtype === 'e_sel' && inItem.hasdone){
                    var tempans = [];
                    for(var i=0;i<inItem.answer.length;i++){
                        if(inItem.answer[i]){
                            tempans.push(i);
                        }
                    }
                    temp.answer = tempans;
                    if(tempans.length === 0){
                        temp.answer = null;
                    }
                    answer[inItem.qid] = temp;
                }
            })
        });
        var cmds = 'aid='+$scope.aid+'&eid='+$scope.eid+'&answers='+encodeURIComponent(JSON.stringify(answer));
        return examReq.answerPaper({},{data:cmds});
    }

    /**
     * 监听答题情况，改变完成的百分比
     */
    function watchAns(){
        $scope.$watch('questionAnswerList',function () {
            var ansLen = 0;
            angular.forEach($scope.questionAnswerList,function (curItem) {
                angular.forEach(curItem,function (item) {
                    if(item.done){
                        ansLen++;
                    }
                })
            });
            $scope.aProgress = {
                percent: ansLen +'/'+$scope.examQueNum,
                ansLen: ansLen
            };

            if(ansLen !== 0){
                changeNum = ansLen;
            }

        },true);
    }

    
    //改变当前题组
    $scope.changeGroup = function(key,pn){
        $scope.curQuestionGroup = key;
        $scope.curPageList = $scope.QuestionGroups[key].items;
    };

    $scope.timeoutCancelG;
    $scope.timeoutCancelQ;

    /**
     * 点击题组名字滚动到相应的题组起始处
     * @param gindex
     */
    $scope.toLocationGroup = function(gindex){
        if($scope.timeoutCancelG){
            $timeout.cancel($scope.timeoutCancelG);
        }
        $scope.timeoutCancelG = $timeout(function () {
            $('html,body').stop(true,true).animate({
                scrollTop:$('#groupTitle-'+gindex).offset().top
            },'normal');
        },200);
    };

    /**
     * 点击题目序号滚动到相应的题目
     * @param data
     */
    $scope.toLocationQuestion = function (data) {
        if($scope.timeoutCancelQ){
            $timeout.cancel($scope.timeoutCancelQ);
        }
        $scope.timeoutCancelQ = $timeout(function() {
            // $rootScope.flagCurEdit($rootScope.tQuestionKie);
            $('html,body').stop(true, true).animate({
                scrollTop: $('#question-' + data.index).offset().top
            }, 'normal');
        }, 200);
    };

    $scope.$on("$destory",function (event) {
        conosle.log("doing the $destory");
        $timeout.cancel($scope.timeoutCancelG);
        $timeout.cancel($scope.timeoutCancelQ);
    });

    /**
     * 答题改变相应的样式
     * @param data
     * @returns {string}
     */
    $scope.totalOvClass = function (data) {
        if($scope.resolvestatus) return;
        try{
            var qFlag = $scope.questionAnswerList[data.groupIndex][data.questionIndex].done;
            if(qFlag){
                return 'visited';
            }
        }catch (e){
            console.error(e);
        }

    };

    function CloseWebPage(){
        try{
            if (navigator.userAgent.indexOf("MSIE") > 0) {
                if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
                    window.opener = null;
                    window.close();
                } else {
                    window.open('', '_top');
                    window.top.close();
                }
            }
            else if (navigator.userAgent.indexOf("Firefox") > 0) {
                window.open('about:blank', '_self', '');
                window.opener = null;
                window.close();
            } else {
                window.opener = null;
                window.open('', '_self', '');
                window.close();
            }
            $scope.closeByHandShow = true;
        }catch (e){
            console.error(e);
            $scope.closeByHandShow = true;
        }

    }

    //试卷提交时的判断
    function paperJudge(flag) {
        if($scope.eid){
            $interval.cancel(stopInterval);
            if($scope.hasDonePaper || changeNum ){
                submitAnswer().then(function (data) {
                    examReq.doneAnswer({eid:$scope.eid}).then(function (data) {
                        dialog.alert("提交试卷成功");
                        if(flag){
                            dialog.confirm("考试已结束，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                        }else{
                            CloseWebPage();
                        }
                    },function (err) {
                        console.error("提交试卷失败",err);
                        service.dialog.showErrorTip(err, {moduleName: 'exam-ctrl', funcName: 'doneAnswer'});
                    })
                },function (err) {
                    service.dialog.showErrorTip(err, {moduleName: 'exam-ctrl', funcName: 'submitAnswer'});
                    console.error("提交答案错误",err);
                });
            }else{
                examReq.doneAnswer({eid:$scope.eid}).then(function (data) {
                    dialog.alert("提交成功");
                    if(flag){
                        dialog.confirm("考试已结束，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                    }else{
                        CloseWebPage();
                    }
                },function (err) {
                    console.error("提交试卷错误",err);
                    service.dialog.showErrorTip(err, {moduleName: 'exam-ctrl', funcName: 'doneAnswer'});
                })
            }
            changeNum = 0;

        }else{
            dialog.alert("没有eid，无法提交");
        }
    }


    $scope.submitPaper = function(){
        if($scope.preview === '1') return;
        if(!$scope.examQueNum) return;
        if($scope.aProgress.ansLen !== $scope.examQueNum){
            dialog.confirm('还有' + ($scope.examQueNum - $scope.aProgress.ansLen) + '道题未做，是否提交？',{mask:true},paperJudge,function () {

            })
        }else{
            paperJudge();
        }

    };

    /**
     *
     * @param target 需要转换的时间，单位毫秒
     * @param flag  转换的格式选择
     * @returns {string}
     */
    function timeChange(target,flag){
        var result = '';
        if(flag){
            if(Math.floor(target / 86400000)>0){
                result = Math.floor(target / 86400000)+':';
            }
            if(Math.floor( (target % 86400000)/3600000 )>0){
                result += Math.floor( (target % 86400000)/3600000 )+':';
            }
            if(Math.floor( ((target % 86400000)%3600000)/60000 )>0){
                if(Math.floor( ((target % 86400000)%3600000)/60000 )<10) result += '0';
                result += Math.floor( ((target % 86400000)%3600000)/60000 )+':';
            }
            if(Math.floor( (((target % 86400000)%3600000)%60000)/1000 )>0){
                if( Math.floor( (((target % 86400000)%3600000)%60000)/1000 )<10) result += '0';
                result += Math.floor( (((target % 86400000)%3600000)%60000)/1000 );
            }else{
                result += '00';
            }
        }else{
            if(Math.floor(target / 86400000)>0){
                result = Math.floor(target / 86400000)+'天';
            }
            if(Math.floor( (target % 86400000)/3600000 )>0){
                result += Math.floor( (target % 86400000)/3600000 )+'小时';
            }
            if(Math.floor( ((target % 86400000)%3600000)/60000 )>0){
                result += Math.floor( ((target % 86400000)%3600000)/60000 )+'分钟';
            }
            if(Math.floor( (((target % 86400000)%3600000)%60000)/1000 )>0){
                result += Math.floor( (((target % 86400000)%3600000)%60000)/1000 ) +'秒';
            }
        }

        return result;
    }

    //当前试卷没有题目，跳回学习页
    $scope.toStudy = function(){
        // window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid,target:$scope.target});
        CloseWebPage();
        $scope.noQuestionShow = false;
    };
    

    function startExam(){
        var cmds={
            aid:$scope.aid
        };
        // if($scope.restartAnswer && $scope.eid){
        //     cmds.eid = $scope.eid;
        // }
        if($scope.tid){
            cmds.tid = $scope.tid;
            $scope.seeanddo = false;
        }
        return examReq.startAnswer(cmds);
    }

    function startExamInit(AgainFlag){
        startExam().then(function (data) {
            if(data.data.exam && data.data.exam.id){
                $scope.eid = data.data.exam.id;
            }

            if($scope.tid){
                if(data.data.countdown || data.data.countdown ===0){
                    $scope.countdown = data.data.countdown;
                    if($scope.countdown < 0){
                        $scope.examLfTime = '无'
                    }else if($scope.countdown == 0){
                        dialog.confirm("考试已结束，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                    }else {
                        $scope.examLfTime = timeChange($scope.countdown,true);
                        timeRunning();
                    }
                }
            }else{
                // var curTime = new Date();
                // $scope.countdown = curTime.getTime() - data.data.exam.time;
                $scope.countdown = 0;
                $scope.examLfTime = timeChange($scope.countdown,true);
                timeRunning(true);
            }

            if(AgainFlag){
                examInit();
            }

        },function (err) {
            if(err.data.data.code == -50){
                dialog.confirm("非作答状态，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
            }else{
                console.error('开始作答错误',err);
                service.dialog.showErrorTip(err, {moduleName: 'exam-ctrl', funcName: 'startExam'});
            }
        });
    }


    function getExam(){
        var cmds={
            aid:$scope.aid,
            tid:$scope.tid,
            ret_items:1,
            ret_score:1,
            ret_answers:1,
            ret_test:1,
            eid:'C_ALL',
            ret_ext:1
        };
        return examReq.getListGroup(cmds);
    }

    function examInit() {
        getExam().then(function(data){
            delRedyStat();
            $scope.QuestionGroups = data.data.iteml || [];

            if(data.data.title){
                $scope.examTitle = data.data.title;

                if($scope.preview === '1'){
                    $scope.$root.title = "预览:";
                }else{
                    $scope.$root.title = "做题:";
                }
                $scope.$root.title += data.data.title;

            }

            if(data.data.desc){
                var str = data.data.desc.replace(/<[^>]+>/g,"");
                if(!str){
                    $scope.examDesc = "";
                }else{
                    $scope.examDesc = data.data.desc;
                }
            }

            if(!$scope.tid){
                if(data.data.ext && data.data.ext.ext && (data.data.ext.ext.advise_cost || data.data.ext.ext.advise_cost === 0)){
                    $scope.examDoTime = timeChange(data.data.ext.ext.advise_cost,false);
                }else{
                    console.error("拿考试时间的字段有问题或建议时间为空");
                }
            }else{
                if(data.data.test && data.data.test.cost_time){
                    $scope.examDoTime = timeChange(data.data.test.cost_time,false);
                }else{
                    console.error("拿练习时间的字段有问题或建议时间为空");
                }

            }

            if($scope.QuestionGroups.length === 0){
                // dialog.confirm('试卷题目为空，暂不能进行作答',{confirmTitle:'',mask:true,maskOpts:{css:{background:'black'}}},function(){
                //     window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid});
                // });
                // return;
                if($scope.preview !== '1'){
                    $scope.noQuestionShow = true;
                }
                return;
            }

            // 解决浏览器回退(非正常手段进入），重复做题的问题
            if($scope.testDate){
                if(window.localStorage){
                    var testDateTemp = window.localStorage.getItem('testDate');
                    if(testDateTemp != $scope.testDate){
                        window.localStorage.setItem('testDate',$scope.testDate);
                    }else{
                        try{
                            if(data.data.exams[$scope.currentUser.uid].exam.status !== 100){
                                // window.location.href = rcpAid.getUrl('学习页',{cid:$scope.cid,target:$scope.target});
                                CloseWebPage();
                            }
                        }catch (e){
                            console.log(e);
                        }

                    }
                }
            }

            $scope.outIng = false;
            //为了解决后台晚30秒关闭考试（自动关闭考试的情况）
            try{
                var userSTime = data.data.exams[$scope.currentUser.uid].exam.time;
                var userATime = data.data.test.cost_time;
                var curTime = new Date().getTime();
                // if(userSTime +userATime >= curTime ){
                //     dialog.confirm("考试已结束，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                //     $scope.outIng = true;
                // }else
                if(data.data.exams[$scope.currentUser.uid].exam.status != 100 && $scope.preview !== '1'){
                    dialog.confirm("非作答状态，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                    $scope.outIng = true;
                }

            }catch (err){
                console.log(err);
            }

            //判断是否应该重新开始考试
            if(!$scope.outIng && $scope.preview !== '1'){
                if(data.data.test && $scope.restartAnswer !== '1'){
                    if(data.data.test.status === 300){
                        dialog.confirm("考试已结束，请关闭页面",{mask:true,singleBtn:true},CloseWebPage,CloseWebPage);
                    }else if($scope.preview !== '1'){
                        startExamInit();
                    }
                }else if($scope.preview !== '1'){
                    startExamInit();
                }else{
                    console.log('没有执行startExamInit()');
                }
            }


            if(!$scope.currentUser.uid){
                service.common.toLogin();
                return;
            }

            if(data.data.ext && data.data.ext.total){
                $scope.examScore = data.data.ext.total;
            }else{
                console.log("没有试卷分数in data.ext");
            }


            angular.forEach($scope.QuestionGroups,function (curItem,gindex) {
                $scope.examSectionNum ++;
                $scope.questionAnswerList[gindex] = [];
                curItem.groupScore = 0;
                angular.forEach(curItem.items,function (inItem,qindex) {
                    inItem.index = $scope.examQueNum;
                    inItem.questionIndex = qindex;
                    inItem.groupIndex = gindex;
                    $scope.examQueNum++;
                    curItem.groupScore += Number(inItem.c.score);
                    $scope.questionAnswerList[gindex][qindex]={
                        qid:inItem.i,
                        qtype:inItem.t,
                        done:false,
                        hasdone:false,
                        answer:[]
                    };
                    if(!$scope.outIng && $scope.preview !== '1'){
                        recordAnswer(data.data,inItem.i,inItem.t,$scope.questionAnswerList[gindex][qindex]);
                    }
                })
            });
            console.log($scope.questionAnswerList);
            // var flowHeightTemp = angular.element('.exam-right-section').height();
            // console.log(flowHeightTemp);
            // console.log(angular.element('.exam-group-item').height());
            // if(flowHeightTemp < $scope.maxHeight-165){
            //     $scope.maxCHeight = flowHeightTemp;
            // }else{
            //     $scope.maxCHeight = $scope.maxCHeight - 165;
            // }

            //中间块的最大高度
            $scope.maxCHeight = $scope.maxHeight - 200;

            watchAns();
        },function(err){
            console.error(err);
        });

    }
    
    function recordAnswer(data,qid,qtype,curObject){
        if(data.answers){
            try{
                var curAnsList = data.answers[$scope.currentUser.uid];
                console.log(curAnsList[qid].answer.answer);
                if(curAnsList[qid] && curAnsList[qid].answer && curAnsList[qid].answer.answer){
                    if(qtype === 'e_text'){
                        if(curAnsList[qid].answer.answer){
                            curObject.done = true;
                        }
                        curObject.hasdone = true;
                        curObject.answer[0] = curAnsList[qid].answer.answer;
                        $scope.hasDonePaper = true;
                    }else if(qtype === 'e_sel'){
                        curObject.hasdone = true;
                        $scope.hasDonePaper = true;
                        var tempAns = [];
                        angular.forEach(curAnsList[qid].answer.answer,function(curItem){
                            curObject.answer[curItem] = true;
                            curObject.done = true;
                        })
                    }else if(qtype === 'e_fill'){
                        curObject.hasdone = true;
                        $scope.hasDonePaper = true;
                        curObject.answer = curAnsList[qid].answer.answer;
                        angular.forEach(curObject.answer,function(everyFill){
                            if(everyFill){
                                curObject.done = true;
                                // console.log(everyFill);
                            }
                        });
                    }else{
                        console.error('没有这个类型的题目');
                        return;
                    }

                }else{
                    return ;
                }
            }catch (err){
                console.log('answers中没有'+$scope.currentUser.uid);
                return ;
            }
        }else{
            console.log("当前用户没有提交过答案");
            return;
        }
    }

    function isArrayFn(o){
        return  Object.prototype.toString.call(o) === '[object Array]';
    }
    
    // function init(){
    //     if(!$scope.curToken){
    //         service.common.toLogin();
    //        
    //     }else{
    //         // startExamInit();
    //        
    //     }
    // }

    // init();

    $scope.$on('login',function(re,data){
        delRedyStat();
        if(data){
            $scope.logined = true;
            if($scope.restartAnswer === '1'){
                if($scope.testDate){
                    if(window.localStorage){
                        var testDateTemp = window.localStorage.getItem('testDate');
                        if(testDateTemp != $scope.testDate){
                            window.localStorage.setItem('testDate',$scope.testDate);
                            startExamInit(true);
                        }else{
                            examInit();
                        }
                    }else{
                        dialog.alert("不支持window.localStorage");
                    }
                }else{
                    dialog.alert("缺少testDate参数");
                }
            }else{
                examInit();
            }
        }else{
            $scope.logined = false;
            service.common.toLogin();
        }

    });
}]);
