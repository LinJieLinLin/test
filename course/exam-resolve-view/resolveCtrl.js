/**
 * Created by zhengdz on 2016/5/19
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

module.controller('resolveCtrl',['$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'dialog', 'examReq', 'service', function ($rootScope,$scope,$timeout,$anchorScroll,$location,dialog,examReq,service) {
    $scope.curToken = rcpAid.getToken();
    $scope.cid = rcpAid.queryString("cid");
    //试卷id
    $scope.aid = rcpAid.queryString("aid");
    //评测id
    $scope.tid = rcpAid.queryString("tid");
    //考试id
    $scope.eid = '';

    //学习页对应的位置
    $scope.target = rcpAid.queryString("target");


    $scope.logined = false;
    $scope.readyloading = true;
    $scope.errorPaper = false;

    //试卷基本信息
    $scope.paperInfo = '';

    //所有题组
    $scope.QuestionGroups = '';

    //当前题组
    // $scope.curQuestionGroup = 0;

    //当前题组的试卷题目列表
    // $scope.curPageList = '';

    //当前题目
    $rootScope.curQuestion = undefined;
    
    //用户答案
    $scope.questionAnswerList = [];

    $scope.rightSectionFloat = false;

    $scope.examTitle = '';
    $scope.examSectionNum = 0;
    $scope.examQueNum = 0;
    $scope.examStartTime = '';
    $scope.examDoTime = '';
    $scope.examScore = 0;
    $scope.examDesc='';

    $scope.maxHeight = $(window).height() - 200;


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
        console.log($scope.questionAnswerList);
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
        var qFlag = $scope.questionAnswerList[data.groupIndex][data.questionIndex].done;
        if(qFlag){
            return 'visited';
        }
    };

    function startExam(){
        var cmds={
            aid:$scope.aid
        };
        return examReq.startAnswer(cmds);
    }

    function startExamInit(){
        startExam().then(function (data) {
            window.location.href = rcpAid.getUrl('做题页',{aid:$scope.aid,cid:$scope.cid,restartanswer:1,target:$scope.target,testDate:new Date().getTime()});
        },function (err) {
            console.error('开始作答错误',err);
            service.dialog.showErrorTip(err, {moduleName: 'resolveCtrl', funcName: 'startExam'});
        });
    }


    $scope.doAgain = function(){
        window.location.href = rcpAid.getUrl('做题页',{aid:$scope.aid,cid:$scope.cid,restartanswer:1,target:$scope.target,testDate:new Date().getTime()});
    };

    function timeChange(target){
        var result = '';
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
            result += Math.floor( (((target % 86400000)%3600000)%60000)/1000 )+'秒';
        }
        return result;
    }

    function getScore(){
        var cmds={
            aid:$scope.aid
            // iid:
        };
        return examReq.publishAns(cmds);
    }

    function getScoreInit(){
        getScore().then(function (data) {

        },function (err) {
            console.error(err);
        })
    }


    function getExam(){
        var cmds={
            aid:$scope.aid,
            tid:$scope.tid,
            ret_test:1,
            ret_items:1,
            ret_score:1,
            ret_answers:1,
            ret_count:1,
            eid:'C_SUBMITED'
        };

        return examReq.getListGroup(cmds);
    }

    function examInit() {
        getExam().then(function(data){
            delRedyStat();

            // $scope.
            if(data.data.title){
                $scope.examTitle = data.data.title;
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
                    $scope.examDoTime = timeChange(data.data.ext.ext.advise_cost);
                }else{
                    console.error("拿练习时间的字段有问题或建议时间为空");
                }
            }else{
                if(data.data.test && data.data.test.cost_time){
                    $scope.examDoTime = timeChange(data.data.test.cost_time);
                }

            }

            try{
                if($scope.tid){
                    var useTime = data.data.exams[$scope.tuids].exam.done_time - data.data.exams[$scope.tuids].exam.time;
                    $scope.examLfTime=timeChange(useTime);
                    console.log(useTime);
                }else{
                    $scope.examLfTime = '--';
                }
            }catch(e){
                console.log(e);
            }

            $scope.QuestionGroups = data.data.iteml || [];
            if($scope.QuestionGroups.length === 0){
                return;
            }

            $scope.selfReview = '';
            if(data.data.exams[$scope.currentUser.uid] && data.data.exams[$scope.currentUser.uid].exam && data.data.exams[$scope.currentUser.uid].exam.id){
                $scope.selfReview = data.data.exams[$scope.currentUser.uid].exam.reviews;

            }else{
                console.log("没有当前用户的exam");
            }


            if(data.data.scores && data.data.scores[$scope.currentUser.uid]){
                if(data.data.scores[$scope.currentUser.uid].score || data.data.scores[$scope.currentUser.uid].score === 0){
                    $scope.userAllScore = (data.data.scores[$scope.currentUser.uid].score).toFixed(1);
                }else{
                    console.log("scores 中没有score字段");
                }
            }

            angular.forEach($scope.QuestionGroups,function (curItem,gindex) {
                $scope.examSectionNum ++;
                $scope.questionAnswerList[gindex] = [];
                angular.forEach(curItem.items,function (inItem,qindex) {
                    if(inItem.c && inItem.c.score){
                        $scope.examScore += inItem.c.score;
                    }else{
                        console.log("没有items.c.score");
                    }
                    inItem.index = $scope.examQueNum;
                    inItem.questionIndex = qindex;
                    inItem.groupIndex = gindex;
                    $scope.examQueNum++;
                    $scope.questionAnswerList[gindex][qindex]={
                        qid:inItem.i,
                        qtype:inItem.t,
                        answer:[]
                    };
                    recordAnswer(data.data,inItem.i,inItem.t,$scope.questionAnswerList[gindex][qindex]);

                    if(inItem.t === 'e_sel'){
                        inItem.result = ansContrast($scope.questionAnswerList[gindex][qindex].answer,inItem.c.answer);
                    }else if(inItem.t === 'e_fill'){
                        inItem.result = fillansContrast($scope.questionAnswerList[gindex][qindex].answer,inItem.c.answer);
                    }else if(inItem.t === 'e_text'){
                        if($scope.questionAnswerList[gindex][qindex].textScore == inItem.c.score){
                            inItem.result = 'correct';
                        }else{
                            inItem.result = 'error';
                        }
                    }else{
                        console.error("没有这个题目类型");
                    }
                    if(inItem.result === 'correct'){
                        inItem.useScore = inItem.c.score;
                    }else{
                        if(inItem.t === 'e_fill'){
                            inItem.useScore = Number(($scope.ansRightNum/inItem.c.answer.length)*inItem.c.score).toFixed(1);
                        }else{
                            inItem.useScore = 0;
                        }
                        if(inItem.t === 'e_text'){
                            if($scope.questionAnswerList[gindex][qindex].textScore){
                                inItem.useScore = $scope.questionAnswerList[gindex][qindex].textScore;
                            }else{
                                inItem.useScore = 0;
                            }

                        }
                    }
                })
            });
            // console.log(angular.element('#ansNumDiv').height());
            // $scope.maxCHeight = $scope.maxHeight - 300;
            ansStatus();
        },function(err){
            console.error(err);
        })
    }



    function recordAnswer(data,qid,qtype,curObject){
        if(data.answers){
            try{
                var curAnsList = data.answers[$scope.currentUser.uid];
                if(curAnsList[qid] && curAnsList[qid].answer && curAnsList[qid].answer.answer){
                    if(qtype === 'e_text'){
                        curObject.answer[0] = curAnsList[qid].answer.answer;
                        curObject.textScore = curAnsList[qid].answer.score;
                        curObject.analyze = curAnsList[qid].answer.analyze;
                    }else if(qtype === 'e_sel'){
                        angular.forEach(curAnsList[qid].answer.answer,function(curItem){
                            curObject.answer[curItem] = true;
                        })
                    }else if(qtype === 'e_fill'){
                        curObject.answer = curAnsList[qid].answer.answer;
                        angular.forEach(curObject.answer,function(everyFill){
                            if(everyFill){
                                console.log(everyFill);
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

    function ansContrast(useAns,standAns){
        if(!isArrayFn(useAns)) return;
        if(!isArrayFn(standAns)){
            console.error("试卷标准答案格式非预期");
            return ;
        }
        if(useAns.length === 0 ){
            return 'noAnswer';
        }
        var flag = true;
        angular.forEach(standAns,function (curItem) {
            if(!useAns[curItem]){
                flag = false;
            }
        });
        angular.forEach(useAns,function(curItem,index){
            if(curItem){
                if(standAns.indexOf(index) === -1){
                    flag = false;
                    return;
                }
            }
        });
        if(!flag) return 'error';
        else return 'correct';
    }

    function fillansContrast(useAns,standAns){
        $scope.ansRightNum = 0;
        if(!isArrayFn(useAns)) return;
        if(useAns.length === 0 ) return 'noAnswer';
        var flag = false;
        angular.forEach(useAns,function(curIntem,index){
            console.log(curIntem);
            if(standAns[index].indexOf(curIntem) === -1){
                flag = true;
            }else{
                $scope.ansRightNum++;
            }
        });
        if(!flag) return 'correct';
        else{
            return 'error';
        }
    }

    function ansStatus(){
        var ansLen = 0;
        angular.forEach($scope.questionAnswerList,function (curItem) {
            angular.forEach(curItem,function (item) {
                if(item.answer.length){
                    ansLen++;
                }
            })
        });
        $scope.aProgress = {
            percent: ansLen +'/'+$scope.examQueNum,
            ansLen: ansLen
        };
    }
    
    $scope.$on('login',function(re,data){
        delRedyStat();
        if(data){
            $scope.logined = true;
            examInit();
        }else{
            service.common.toLogin();
        }
        $scope.logined = false;
    });

}]);
