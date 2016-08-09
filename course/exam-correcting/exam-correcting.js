/**
 * Created by zdz on 2016/5/4.
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

module.controller('correctingCtrl',['$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'dialog', 'examReq', 'service', function ($rootScope,$scope,$timeout,$anchorScroll,$location,dialog,examReq,service) {
    // $scope.curToken = rcpAid.getToken();
    $scope.cid = rcpAid.queryString('cid');
    //试卷id
    $scope.aid = rcpAid.queryString("aid");
    //评测id
    $scope.tid = rcpAid.queryString("tid");
    //考试id
    $scope.eid = '';
    //批改对象ids
    $scope.tuids = rcpAid.queryString("tuids");
    //批改页为2，查看成绩页为3
    $scope.resolveStatus = rcpAid.queryString("resolvestatus");

    $scope.restartAnswer = false;

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

    //合格人数
    $scope.goodStudent = 0;

    //总人数
    $scope.allStudents = 0;

    //剩余未批改人数
    $scope.leftStudent = 0;

    //该试卷的建议时长或考试时间（时间戳）
    $scope.examMTime = 0;

    //批改参数 userScore:用户分数 leftQuestion:剩余未批改主观题数 subQuestions:所有的主观题数
    $scope.correctingArg={
        userScore:0,
        leftQuestion:0,
        subQuestions:0,
        next:0
    };

    $scope.curStudentPhone = '';
    $scope.curStudentImg = '';
    $scope.curStudentName = '';

    //当前第几个学生，初始为-1
    $scope.curStudentNu = -1;

    //是否只显示主观题
    $scope.hideOther = true;

    $scope.mytestclick = function (flag) {
        $scope.hideOther = flag;
    };

    //右部最大高度
    $scope.maxHeight = $(window).height() - 200;

    //右部滚动监听
    angular.element(document).on('scroll',function () {

        var target = angular.element('.exam-right-section');
        var top = target.offset().top;
        var leftTarget = angular.element('.exam-left-section');
        var leftTop = leftTarget.offset().top;
        if(target.height() > leftTarget.height()){
            if($scope.leftHeight && $scope.leftHeight+leftTarget.height() < target.height()){
                $scope.leftHeight = target.height() - leftTarget.height();
            }
            else if(!$scope.leftHeight){
                $scope.leftHeight = target.height() - leftTarget.height();
            }
        }

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
        $scope.hideOther = false;
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
        // console.log($scope.questionAnswerList);
    };

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


    $scope.nextStudent = function(){
        if($scope.correctingArg.leftQuestion !== 0){
            dialog.alert("当前学生还有题目未批改");
            return;
        }
        if($scope.onlyOne){
            // console.log($scope.questionAnswerList);
            // console.log(rcpAid.getUrl('教学中心',{})+'#/paper-detail/'+$scope.aid+'/'+$scope.cid+'/'+$scope.tid);
            if(!$scope.tid){
                window.location.href = rcpAid.getUrl('教学中心',{})+'#/paper-detail/' + encodeURIComponent(rcpAid.queryString('tag')) + '/' + $scope.cid + '/' + encodeURIComponent(rcpAid.queryString('cname')) + '/' + $scope.aid + '/null';
            }else{
                window.location.href = rcpAid.getUrl('教学中心',{})+'#/paper-detail/' + encodeURIComponent(rcpAid.queryString('tag')) + '/' + $scope.cid + '/' + encodeURIComponent(rcpAid.queryString('cname')) + '/' + $scope.aid + '/' + $scope.tid;
            }

        }else{
            $scope.curStudentNu ++;
            if($scope.curStudentNu < $scope.totalStudent){
                $scope.tuids = $scope.curUserList[$scope.curStudentNu];
                $scope.curStudentImg = $scope.questionData.users[$scope.tuids].attrs.basic.avatar;
                $scope.curStudentName = $scope.questionData.users[$scope.tuids].attrs.basic.nickName;
                $scope.curStudentPhone = $scope.questionData.users[$scope.tuids].attrs.basic.phone;
                if($scope.curStudentNu === $scope.totalStudent-1){
                    $scope.onlyOne = true;
                }
                $scope.selfReview = '';
                if($scope.questionData.exams[$scope.tuids] && $scope.questionData.exams[$scope.tuids].exam && $scope.questionData.exams[$scope.tuids].exam.id){
                    $scope.curEid = $scope.questionData.exams[$scope.tuids].exam.id;
                    $scope.selfReview = $scope.questionData.exams[$scope.tuids].exam.reviews;

                }else{
                    console.error("没有当前用户的eid");
                    $scope.curEid = '';
                }
                if($scope.selfReview){
                    $scope.teacherReview = true;
                }else{
                    $scope.teacherReview = false;
                }
            }else{
                dialog.alert("当前学生为最后一个学生");
                return;
            }
            $scope.correctingArg.userScore = 0;
            $scope.correctingArg.leftQuestion = 0;
            $scope.correctingArg.subQuestions = 0;
            // $scope.correctingArg.inputScore = 0;
            $scope.correctingArg.next = $scope.correctingArg.subQuestions;
            ansResolve();
            ansStatus();
        }

    };

    $scope.reviewSubmit = function(flag){
        // var cmds ={
        //     eid:$scope.curEid,
        //     reviews:$scope.selfReview
        // };
        if(!$scope.selfReview){
            dialog.alert('请输入点评');
            return;
        }
        var cmds = 'eid='+$scope.curEid+'&reviews='+encodeURIComponent($scope.selfReview);
        examReq.updateReview({},{data:cmds}).then(function (data) {
            if(flag){
                dialog.alert('删除点评成功');
            }else{
                dialog.alert('提交点评成功');
            }
            $scope.teacherReview = true;
        },function (err) {
            service.dialog.showErrorTip(err, {moduleName: 'exam-correcting', funcName: 'updateReview'});
            console.error(err);
        })
    };

    //老师再次点评
    $scope.editAgain = function () {
        $scope.teacherReview = false;
    };

    $scope.timeoutCancelD;

    //删除老师点评
    $scope.delText = function () {
        $scope.selfReview = '';
        $scope.reviewSubmit(true);
        if($scope.timeoutCancelD){
            $timeout.cancel($scope.timeoutCancelD);
        }
        $scope.timeoutCancelD = $timeout(function () {
            $scope.teacherReview = false;
        },100)
    };

    $scope.$on("$destory",function (event) {
        conosle.log("doing the $destory");
        $timeout.cancel($scope.timeoutCancelG);
        $timeout.cancel($scope.timeoutCancelQ);
        $timeout.cancel($scope.timeoutCancelD);
    });



    function getScore(){
        var cmds={
            aid:$scope.aid
        };
        return examReq.publishAns(cmds);
    }

    function getScoreInit(){
        getScore().then(function (data) {

        },function (err) {
            console.error(err);
        })
    }

    //答题情况
    function ansResolve(){
        $scope.examSectionNum = 0;
        // $scope.examScore = 0;
        $scope.examQueNum = 0;
        $scope.questionAnswerList = [];
        
        try{
            var useTime = $scope.questionData.exams[$scope.tuids].exam.done_time - $scope.questionData.exams[$scope.tuids].exam.time;
            if(!$scope.tid){
                $scope.examLfTime=timeChange(useTime);
            }else{
                if($scope.examMTime){
                    if($scope.examMTime > useTime){
                        $scope.examLfTime = timeChange(useTime);
                    }else{
                        $scope.examLfTime = timeChange($scope.examMTime);
                    }
                }
            }
        }catch(e){
            console.log(e);
        }

        try{
            if($scope.questionData.exams[$scope.tuids].notc != 0 ){
                $scope.leftStudent --;
            }

            if($scope.leftStudent <0){
                console.error("为批改人数有问题");
            }
        }catch (e){
            console.log(e);
        }

        var hasText = false;
        angular.forEach($scope.QuestionGroups,function (curItem,gindex) {
            $scope.examSectionNum ++;
            $scope.questionAnswerList[gindex] = [];
            curItem.hasText = false;
            angular.forEach(curItem.items,function (inItem,qindex) {
                // if(inItem.c && inItem.c.score){
                //     $scope.examScore += inItem.c.score;
                // }else{
                //     console.log("没有items.c.score");
                // }
                inItem.index = $scope.examQueNum;
                inItem.questionIndex = qindex;
                inItem.groupIndex = gindex;
                $scope.examQueNum++;
                $scope.questionAnswerList[gindex][qindex]={
                    qid:inItem.i,
                    qtype:inItem.t,
                    answer:[],
                    score:{
                        score:null
                    }
                };

                recordAnswer(inItem.i,inItem.t,$scope.questionAnswerList[gindex][qindex],inItem);
                console.log($scope.questionAnswerList);
                // console.log($scope.questionData.answers[$scope.tuids][inItem.i]);
                if(inItem.t === 'e_sel'){
                    inItem.result = ansContrast($scope.questionAnswerList[gindex][qindex].answer,inItem.c.answer);
                }else if(inItem.t === 'e_fill'){
                    inItem.result = fillansContrast($scope.questionAnswerList[gindex][qindex].answer,inItem.c.answer);
                }else if(inItem.t === 'e_text'){
                    curItem.hasText = true;
                    hasText = true;
                    try{
                        if(!$scope.questionData.answers[$scope.tuids][inItem.i]){
                            $scope.correctingArg.leftQuestion ++;
                            inItem.result = 'nor';
                        }else if($scope.questionData.answers[$scope.tuids][inItem.i].status == 300 || $scope.questionData.answers[$scope.tuids][inItem.i].status == 400){

                            if(inItem.c.score === $scope.questionData.answers[$scope.tuids][inItem.i].answer.score){
                                inItem.result = 'correct';
                            }else if(!$scope.questionData.answers[$scope.tuids][inItem.i].answer.score  && $scope.questionData.answers[$scope.tuids][inItem.i].answer.score !== 0){
                                inItem.result = 'nor';
                            }else{
                                inItem.result = 'error';
                            }
                            $scope.correctingArg.leftQuestion ++;
                            $scope.correctingArg.userScore += Number($scope.questionData.answers[$scope.tuids][inItem.i].answer.score);
                            // $scope.correctingArg.inputScore = $scope.questionData.answers[$scope.tuids][inItem.i].answer.score;
                            // $scope.correctingArg.userScore = $scope.correctingArg.userScore.toFixed(1);
                        }else{
                            inItem.result = 'nor';
                        }
                    }catch(err){
                        console.log("没有这个用户的答案或没有这个用户");
                        if($scope.questionAnswerList[gindex][qindex].nodone){
                            $scope.correctingArg.leftQuestion ++;
                            if(inItem.c.score == 0){
                                inItem.result = 'correct';
                            }else{
                                inItem.result = 'error';
                            }

                        }
                    }
                    // $scope.correctingArg.leftQuestion ++;
                    $scope.correctingArg.subQuestions ++;
                    console.log(inItem.result);
                }else{
                    console.error("没有这个题目类型");
                }
                
                if(inItem.result === 'correct'){
                    inItem.useScore = inItem.c.score;
                    if(inItem.t !== 'e_text'){
                        $scope.correctingArg.userScore += Number(inItem.c.score);
                        // $scope.correctingArg.inputScore = inItem.c.score;
                    }
                }else{
                    if(inItem.t === 'e_fill' && inItem.result === 'error'){
                        inItem.useScore = Number((($scope.ansRightNum/inItem.c.answer.length)*inItem.c.score).toFixed(1));
                        $scope.correctingArg.userScore += Number(inItem.useScore);
                    }else{
                        inItem.useScore = 0;
                    }
                }
                $scope.correctingArg.userScore = Number($scope.correctingArg.userScore.toFixed(1));
            });
        });

        $scope.correctingArg.next = $scope.correctingArg.subQuestions;

        if($scope.scoreWatch){
            $scope.scoreWatch();
        }
        var originPassedPeople = $scope.goodStudent;
        var originScore = $scope.correctingArg.userScore;
        $scope.scoreWatch = $scope.$watch('correctingArg.userScore',function (item) {
            if(item == undefined) return;
            if(item == originScore){
                $scope.goodStudent = originPassedPeople;
            }else if(item >= ($scope.examScore * 0.6)){
                if(originScore >= ($scope.examScore * 0.6)){
                    $scope.goodStudent = originPassedPeople;
                }else{
                    $scope.goodStudent = originPassedPeople +1;
                }
            }else{
                if(originScore < ($scope.examScore * 0.6)){
                    $scope.goodStudent = originPassedPeople;
                }else{
                    $scope.goodStudent = originPassedPeople -1;
                }
            }
        });

        if(!hasText && $scope.resolveStatus != 3){
            $scope.hideOther = false;
            dialog.alert("当前没有需要批改的题目");
        }
    }

    /**
     * 记录用户答案
     * @param qid 题目id
     * @param qtype 题目类型
     * @param curObject 保存答案的数组
     * @param item 当前题目
     */
    function recordAnswer(qid,qtype,curObject,item){
        if($scope.questionData.answers){
            try{
                var curAnsList = $scope.questionData.answers[$scope.tuids];
                if((!curAnsList || !curAnsList[qid]) && qtype === 'e_text'){
                    curObject.nodone = true;
                    curObject.score.score = '0';
                    curObject.didscored = false;
                    return;
                }
                item.answerId = curAnsList[qid].id;
                if(curAnsList[qid] && curAnsList[qid].answer ){
                    if(qtype === 'e_text'){
                        curObject.answer[0] = curAnsList[qid].answer.answer;
                        curObject.analyze = curAnsList[qid].answer.analyze;
                        curObject.score.score = curAnsList[qid].answer.score;
                        curObject.didscored = true;

                    }else if(qtype === 'e_sel'){
                        var tempAns = [];
                        angular.forEach(curAnsList[qid].answer.answer,function(curItem){
                            curObject.answer[curItem] = true;
                        })
                    }else if(qtype === 'e_fill'){
                        curObject.answer = curAnsList[qid].answer.answer;
                        // angular.forEach(curObject.answer,function(everyFill){
                        //     if(everyFill){
                        //         console.log(everyFill);
                        //     }
                        // });
                    }else{
                        console.error('没有这个类型的题目');
                        return;
                    }

                }else{
                    return ;
                }
            }catch (err){
                console.log('answers中没有'+qtype+' '+qid);
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

    /**
     * 时间显示格式转换
     * @param target
     * @returns {string}
     */
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

    /**
     * 填空题答案比较
     * @param useAns 用户答案
     * @param standAns 标准答案
     * @returns {*}
     */
    function fillansContrast(useAns,standAns){
        $scope.ansRightNum = 0;
        if(!isArrayFn(useAns)){
            console.error("填空题的答案格式非预期");
            return;
        }
        if(useAns.length === 0 ) return 'noAnswer';
        var flag = false;
        angular.forEach(useAns,function(curIntem,index){
            if(standAns[index].indexOf(curIntem) === -1){
                flag = true;
            }else{
                $scope.ansRightNum ++;
            }
        });
        if(!flag) return 'correct';
        else{
            return 'error';
        }
    }

    //答题情况记录（数量记录）
    function ansStatus(){
        var ansLen = 0;
        angular.forEach($scope.questionAnswerList,function (curItem) {
            angular.forEach(curItem,function (item,i) {
                try{
                    if(item.answer.length){
                        ansLen++;
                    }
                }catch (e){
                    console.error(e);
                }
            })
        });
        $scope.aProgress = {
            percent: ansLen +'/'+$scope.examQueNum,
            ansLen: ansLen
        };
    }

    function getExam(){
        var cmds={
            aid:$scope.aid,
            tid:$scope.tid,
            ret_items:1,
            ret_score:2,
            ret_answers:1,
            ret_notc:0,
            ret_notc_n:1,
            eid:'C_SUBMITED',
            ret_test:1,
            all_u:1,
            tuids:$scope.tuids,
            u_sel:'basic',
            ret_count:2
        };
        if(!$scope.tuids){
            cmds.ret_notc = 1;
        }

        return examReq.getListGroup(cmds);
    }

    function examInit() {
        getExam().then(function(data){
            $scope.questionData = data.data;
            delRedyStat();

            if($scope.questionData.title){
                $scope.examTitle = $scope.questionData.title;
                if($scope.resolveStatus === '2'){
                    $scope.$root.title = "批改:";
                }else{
                    $scope.$root.title = "查看:";
                }
                $scope.$root.title += $scope.questionData.title;
            }


            if(!$scope.tid){
                if($scope.questionData.ext && $scope.questionData.ext.ext && ($scope.questionData.ext.ext.advise_cost || $scope.questionData.ext.ext.advise_cost === 0)){
                    $scope.examDoTime = timeChange($scope.questionData.ext.ext.advise_cost);
                }else{
                    console.error("拿练习时间的字段有问题或建议时间为空");
                }
            }else{
                if($scope.questionData.test && $scope.questionData.test.cost_time){
                    $scope.examDoTime = timeChange($scope.questionData.test.cost_time);
                    $scope.examMTime = $scope.questionData.test.cost_time;
                }
            }

            $scope.QuestionGroups = $scope.questionData.iteml || [];
            if($scope.QuestionGroups.length === 0){
                dialog.alert("当前试卷没有题目");
                return;
            }

            console.log($scope.QuestionGroups);

            try{
                if(!$scope.tuids){
                    $scope.curUserList = [];
                    angular.forEach($scope.questionData.uids,function (curitem) {
                        // if($scope.questionData.answers && $scope.questionData.answers[curitem]){
                        $scope.curUserList.push(curitem);
                        // }
                    })

                }else{
                    $scope.curUserList = $scope.tuids.split(',');
                }

                $scope.curStudentNu = 0;
                $scope.totalStudent = $scope.curUserList.length;
                if($scope.totalStudent === 0){
                    dialog.alert("当前试卷没有人作答过");
                    $scope.onlyOne = true;
                }
                if($scope.totalStudent === 1){
                    $scope.onlyOne = true;
                }
                if($scope.curStudentNu < $scope.totalStudent){
                    $scope.tuids = $scope.curUserList[$scope.curStudentNu];
                    $scope.curStudentImg = $scope.questionData.users[$scope.tuids].attrs.basic.avatar;
                    $scope.curStudentName = $scope.questionData.users[$scope.tuids].attrs.basic.nickName;
                    $scope.curStudentPhone = $scope.questionData.users[$scope.tuids].attrs.basic.phone;

                }
            }catch (err){
                console.error(err);
            }
            

            if($scope.questionData.scores && $scope.questionData.scores[$scope.tuids]){
                if($scope.questionData.scores[$scope.tuids].total && $scope.questionData.scores[$scope.tuids].total != 0){
                    $scope.examScore = $scope.questionData.scores[$scope.tuids].total;
                }else{
                    console.log('当前没有试卷总分');
                }
            }
            $scope.selfReview = '';
            if($scope.questionData.exams[$scope.tuids] && $scope.questionData.exams[$scope.tuids].exam && $scope.questionData.exams[$scope.tuids].exam.id){
                $scope.curEid = $scope.questionData.exams[$scope.tuids].exam.id;
                $scope.selfReview = $scope.questionData.exams[$scope.tuids].exam.reviews;

            }else{
                console.log("没有当前用户的eid");
                $scope.curEid = '';
            }

            if($scope.selfReview){
                $scope.teacherReview = true;
            }else{
                $scope.teacherReview = false;
            }


            if($scope.questionData.count){
                if($scope.questionData.count.count){
                    $scope.allStudents = $scope.questionData.count.count;
                }else{
                    $scope.allStudents = 0;
                }

                if(!$scope.questionData.count.passed){
                    $scope.goodStudent = 0;
                }else{
                    $scope.goodStudent = $scope.questionData.count.passed;
                }
            }else{
                console.error("data.count is null");
            }

            if($scope.questionData.notc_n || $scope.questionData.notc_n === 0){
                $scope.leftStudent = $scope.questionData.notc_n;
            }

            // $scope.maxCHeight = $scope.maxHeight - 500;

            ansResolve();
            ansStatus();
        },function(err){
            console.error(err);
        })
    }

    function init(){
        if($scope.resolveStatus !=2 && $scope.resolveStatus != 3){
            dialog.alert("参数错误,缺少resolveStatus");
            return;
        }
        if($scope.resolveStatus == 3 ) $scope.hideOther = false;
        examInit();
    }

    $scope.$on('login',function(re,data){
        delRedyStat();
        if(data){
            $scope.logined = true;
            init();
        }else{
            $scope.logined = false;
            service.common.toLogin();
        }

    });
}]);
