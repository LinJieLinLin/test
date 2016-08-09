module.directive("examQuestions",function () {
    return{
        template:'<div ng-class=" (data.result === \'error\' || data.result === \'noAnswer\') && resolvestatus===1 ? \'a-q error\' : resolvestatus && resolvestatus != 4 ? \'a-q\' : \'a-q has-border\'" id="question-{{data.index}}" q-type="{{qType}}"><div class="inw"><span class="k-num">{{data.index+1}}. <span ng-show="qIType === \'e_sel\' && qCType === \'single\'">【单选题】</span> <span ng-show="qIType === \'e_sel\' && qCType === \'multi\'">【多选题】</span> <span ng-show="qIType === \'e_sel\' && qCType === \'judge\'">【判断题】</span> <span ng-show="qIType === \'e_fill\'">【填空题】</span> <span ng-show="qIType === \'e_text\' ">【简答题】</span> <span class="k-num-score" ng-show="!resolvestatus || resolvestatus == 4">( <span ng-bind="data.c.score"></span>分 )</span></span><div id="exam-question" class="question-style" ng-bind-html="data.c.text | sanitize"></div><div class="choose" ng-if="qIType === \'e_sel\'"><ul><li ng-repeat="d in option track by $index" ng-click="select(d,$index)" ng-class="{\'option-hover\':!resolvestatus ,\'option\':true}"><div ng-hide="resolvestatus" class="hover-bg"></div><div class="label"><label class="my-single-input" ng-show="qCType === \'single\'"><label ng-hide="resolvestatus == 4"><label ng-class="{\'single-checked\':isClicked[$index]}"></label><label ng-class="optionClass(data,$index)"></label></label></label><label class="my-judge-input" ng-class="{\'judge-checked-t\': isClicked[$index],\'{{optionClass(data,$index)}}\': resolvestatus && resolvestatus != 4}" ng-show="qCType ===\'judge\'"><label ng-class="{\'judge-checked-r\':isClicked[$index],\'judge-unchecked-r\':!isClicked[$index]}" ng-show="$index === 0"></label><label ng-class="{\'judge-checked-e-up\':isClicked[$index],\'judge-unchecked-e-up\':!isClicked[$index]}" ng-show="$index === 1"></label><label ng-class="{\'judge-checked-e-dw\':isClicked[$index],\'judge-unchecked-e-dw\':!isClicked[$index]}" ng-show="$index === 1"></label></label><label class="my-multi-input" ng-show="qCType === \'multi\'"><label ng-hide="resolvestatus == 4"><label ng-class="{\'multi-checked\':isClicked[$index]}"></label><label ng-class="optionClass(data,$index)"></label></label></label><span class="choice-char" ng-hide="qIType === \'e_text\' || qCType === \'judge\'" ng-bind="toChar($index)+\' .\'"></span><div ng-class="{\'judge-padding\':qCType === \'judge\',\'nojudge-padding\':qCType !== \'judge\'}"><span ng-bind-html="d | sanitize"></span></div></div></li></ul></div><div class="choose" ng-if="!resolvestatus && qIType === \'e_fill\'"><ul><li ng-repeat="d in data.fill track by $index" class="option"><span class="mg-r10 gray-c">( {{$index+1}} )</span> <input id="q-input-{{data.index}}-{{$index}}" class="fill-input" ng-model="data.fill[$index]" ng-focus="setFillAnswer($index)" ng-blur="setFillAnswer($index)" ng-change="setFillAnswer($index)" placeholder="请输入你的答案"></li></ul></div><div class="answer" ng-if="!resolvestatus && qIType === \'e_text\' "><div class="answerIntro">答题区:</div><textarea id="ck-{{data.index}}" ng-model="data.answerContent" ng-blur="blurText($event)" ng-focus="recordTextAns()" ng-change="recordTextAns()"></textarea></div><div class="show-answer" ng-show="seeanddo"><button ng-click="seeanddoTemp = !seeanddoTemp">查看解析</button></div></div><div ng-if="resolvestatus && resolvestatus != 4" ng-class="\'resolve \'"><div class="top-triangle"></div><div class="inw" ng-show="qIType != \'e_text\'"><i ng-class="{\'fa fa-meh-o noanswer\':data.result === \'noAnswer\',\'fa fa-frown-o error\': data.result === \'error\',\'fa fa-smile-o correct\':data.result === \'correct\'}" class="face-image"></i> <span ng-show="data.result === \'noAnswer\'" class="noanswer">未作答</span> <span ng-show="data.result === \'error\'" class="error">回答错误</span> <span ng-show="data.result === \'correct\'" class="correct">回答正确</span> <span ng-show="resolvestatus == 1"><span ng-bind=" \'| \' + data.useScore" class="middle-vertical"></span><span ng-bind="\'/\'+data.c.score+\'分\'" class="middle-vertical"></span></span><p class="self-p" ng-if="qCType == \'single\' || qCType == \'multi\'">正确答案是 <span ng-repeat="ans in data.c.answer track by $index" ng-bind="toChar(ans)" class="correctspan"></span></p><p class="self-p" ng-show="qCType == \'judge\'">正确答案是 <span ng-show="data.c.answer[0] == 0" class="correctjudge0"></span> <span class="usually-inline"><span ng-show="data.c.answer[0] == 1" class="correctjudge1up"></span> <span ng-show="data.c.answer[0] == 1" class="correctjudge1down"></span></span></p><p class="self-p" ng-show="data.result === \'error\' && qIType === \'e_sel\' && qCType!== \'judge\'">您的答案是 <span ng-bind="toNum(answerlist[data.groupIndex][data.questionIndex].answer)" class="errorspan"></span></p><p class="self-p" ng-show="data.result === \'error\' && qIType === \'e_sel\'  && qCType=== \'judge\'">您的答案是 <span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[0]" class="errorjudge0"></span> <span class="usually-inline"><span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[1]" class="errorjudge1up"></span> <span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[1]" class="errorjudge1down"></span></span></p><div ng-if="qIType == \'e_fill\'"><p class="self-p">正确答案是</p><div class="answer-position"><span ng-bind-html="fillAnsArray|sanitize"></span></div><div class="clear"></div><div ng-if="data.result === \'error\'"><p class="self-p">您的答案是</p><span ng-repeat="d in answerlist[data.groupIndex][data.questionIndex].answer track by $index" class="answer-position"><span class="gray-c f-l">( {{$index+1}} ) </span><span class="f-l" ng-bind="d" ng-class="{\'correctspan\':data.c.answer[$index].indexOf(d) !== -1,\'errorspan\':data.c.answer[$index].indexOf(d) === -1}"></span></span></div><div class="clear"></div></div><p class="self-p" style="padding-bottom:20px"><button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="!showResolveTemp">试题解析 <i class="fa fa-angle-down"></i></button> <button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="showResolveTemp">试题解析 <i class="fa fa-angle-up"></i></button></p><div class="resolve-info-div" ng-show="!showResolveTemp"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div><div class="correcting-score-show" ng-show="resolvestatus == 2 || resolvestatus == 3"><span class="f-l">得分：</span><div class="self-score-div"><span ng-bind="data.c.score" ng-show="data.result === \'correct\'" class="middle-vertical"></span> <span ng-show="data.result !== \'correct\'" class="sub-vertical" ng-bind="data.useScore"></span></div><span class="self-score-total">(本题共<span ng-bind="data.c.score"></span>分)</span></div></div><div class="inw" ng-show="qIType == \'e_text\'"><span ng-show="resolvestatus == 1"><span ng-bind="data.useScore" class="middle-vertical"></span><span ng-bind="\'/\'+data.c.score+\'分\'" class="middle-vertical"></span></span><div class="cyan-c mg-b10" style="margin:10px 0"><span ng-hide="resolvestatus ==2 || resolvestatus == 3">您的答案是：</span> <span ng-show="resolvestatus ==2 || resolvestatus == 3">学生的答案是：</span><div class="max" ng-bind-html="answerlist[data.groupIndex][data.questionIndex].answer.toString()|sanitize"></div></div><div class="cyan-c mg-b10"><p class="self-p">正确答案是：</p><div class="max" ng-bind-html="data.c.answer.toString()|sanitize"></div></div><div class="resolve-info-div"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div><label for="add-button-{{data.index}}" class="addText-mask" ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><div ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone"><label class="triangle-label-up" ng-show="textResolveTemp && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><label for="add-button-{{data.index}}" class="triangle-label-down" ng-show="!textResolveTemp && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><button id="add-button-{{data.index}}" class="add-button" ng-click="closeMyText()" ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone">补充解析</button></div><div ng-show="textResolveTemp && resolvestatus == 2"><div class="resolve-text" ng-show="!textResolveFinish"><textarea class="my-textarea" ng-model="answerlist[data.groupIndex][data.questionIndex].analyze" placeholder="请输入内容"></textarea><button ng-click="correctPaper(true)">提交</button></div><div class="resolve-text-after" ng-show="textResolveFinish"><div class="my-textareaAfter" ng-bind="answerlist[data.groupIndex][data.questionIndex].analyze"></div><button class="my-textarea-editbtn" ng-click="addResolveText()"><i class="fa fa-pencil-square-o" class="self-i"></i> <span>编辑</span></button></div></div><div class="resolve-info-div1" ng-show="resolvestatus == 3 && answerlist[data.groupIndex][data.questionIndex].analyze"><div>【补充解析】</div><div ng-bind-html="answerlist[data.groupIndex][data.questionIndex].analyze|sanitize" class="add-content-left"></div></div><div class="resolve-info-div2" ng-show="resolvestatus == 1 && answerlist[data.groupIndex][data.questionIndex].analyze"><div>【补充解析】</div><div ng-bind-html="answerlist[data.groupIndex][data.questionIndex].analyze|sanitize" class="add-content-left"></div></div><div class="gain-score" ng-show="resolvestatus == 2 || resolvestatus == 3"><span class="f-l">得分：</span> <input class="gain-input" ng-model="answerlist[data.groupIndex][data.questionIndex].score.score" ng-blur="correctPaperScore()" ng-show="resolvestatus == 2" ng-disabled="answerlist[data.groupIndex][data.questionIndex].nodone"> <input class="gain-input-none" ng-disabled="true" ng-show="resolvestatus == 3" ng-value="answerlist[data.groupIndex][data.questionIndex].score.score"> <span class="gain-span">(本题共<span ng-bind="data.c.score"></span>分)</span> <span id="correctingTip-{{data.index}}" class="gain-tip"><i class="fa fa-check-circle-o"></i>已自动保存</span></div></div></div><div ng-if="seeanddo && seeanddoTemp" ng-class="\'resolve \'"><div class="top-triangle"></div><div class="inw" ng-show="qIType != \'e_text\'"><p class="self-p" ng-show="qCType == \'single\' || qCType == \'multi\'">正确答案是 <span ng-repeat="ans in data.c.answer track by $index" ng-bind="toChar(ans)" class="correctspan"></span></p><p class="self-p" ng-show="qCType == \'judge\'">正确答案是 <span ng-show="data.c.answer[0] == 0" class="correctjudge0"></span> <span class="usually-inline"><span ng-show="data.c.answer[0] == 1" class="correctjudge1up"></span> <span ng-show="data.c.answer[0] == 1" class="correctjudge1down"></span></span></p><div ng-if="qIType == \'e_fill\'"><p>正确答案是</p><div class="answer-position"><span ng-bind-html="fillAnsArray|sanitize"></span></div><div class="clear"></div></div><p class="self-p" style="padding-bottom:20px"><button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="!showResolveTemp">试题解析 <i class="fa fa-angle-down"></i></button> <button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="showResolveTemp">试题解析 <i class="fa fa-angle-up"></i></button></p><div class="resolve-info-div" ng-show="!showResolveTemp"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div></div><div class="inw" ng-show="qIType == \'e_text\'"><p class="self-p">正确答案是</p><div ng-bind-html="data.c.answer.toString() | sanitize" style="padding-bottom:20px"></div><div class="resolve-info-div"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div></div></div></div>',
        restrict:"E",
        replace:true,
        transclude:true,
        scope:{
            data:"=data",      //题目信息
            answerlist :"=",  //用户答案
            // curquestion :"=",
            resolvestatus :"=",//1:解析 , 2:批改， 3：查看成绩, 4:预览
            seeanddo:"=",       //边看边做
            correctingarg:"="  //批改参数
        },
        controller:['$scope', '$rootScope', '$element', '$attrs', 'examQuestionsFactory', '$timeout', function ($scope,$rootScope,$element,$attrs,examQuestionsFactory,$timeout) {
            $scope.qIType = '';
            $scope.qCType = '';
            $scope.inputWatch='';
            $scope.onlyFlagTemp = false;
            $scope.textResolveTemp = false;
            $scope.isClicked = [];

            try{
                if($scope.answerslist.length === 0){
                    return;
                }
            }catch (e){
                console.log(e);
            }

            $scope.toChar=function (index) {
                return String.fromCharCode(65+index);
            };

            $scope.toNum=function(oj){
                var tempAns = '';
                angular.forEach(oj,function(curItem,index){
                    if(curItem) tempAns += String.fromCharCode(65+index);
                });
                return tempAns;
            };


            $scope.$watch('data',function (value,oldvalue) {

                if($scope.data){
                    $scope.qIType = $scope.data.t;
                    $scope.qCType = $scope.data.c.type;
                }

                if($scope.resolvestatus && $scope.resolvestatus != 4){
                    // if($scope.resolvestatus == 4) return;
                    examQuestionsFactory.resolve($scope.qIType,$scope.qCType,$scope);
                }else{
                    examQuestionsFactory.doTitle($scope.qIType,$scope.qCType,$scope,$rootScope,$element);
                }

                //直接将填空答案拼成字符串显示
                $scope.fillAnsArray = '';
                if(($scope.resolvestatus || $scope.seeanddo) && $scope.qIType == 'e_fill'){
                    angular.forEach($scope.data.c.answer,function(fillItem,gid){
                        $scope.fillAnsArray+='( '+(gid+1)+' )'+'<span style="color: #2bc866;">';
                        angular.forEach(fillItem,function(targetFill,i){
                            if(i !== fillItem.length-1){
                                $scope.fillAnsArray+=targetFill +'/';
                            }else{
                                $scope.fillAnsArray+=targetFill +'&nbsp';
                            }
                        });
                        $scope.fillAnsArray+='</span>  ';
                    })
                }

            },true);


        }]
    }
});

module.factory('examQuestionsFactory',['$timeout', '$interval', '$log', 'dialog', 'examReq', function ($timeout,$interval,$log,dialog,examReq) {
    var factory={
        resolveContrastEvent:{
            single:function(q,d,$scope){
                if(q.c && q.c.answer && q.c.answer !== null){
                    if(!q.c.answer.length){
                        console.log("没有标准答案");
                        return'';
                    }
                    if(d === q.c.answer[0]) return 'correct';
                    if($scope.answerlist[q.groupIndex][q.questionIndex].answer[d]) return 'error';
                    return '';
                }
            },

            multi:function (q,d,$scope) {
                if(q.c && q.c.answer && q.c.answer !== null){
                    if(!q.c.answer.length){
                        console.log("没有标准答案");
                        return'';
                    }

                    if(q.c.answer.indexOf(d) !== -1 && !$scope.answerlist[q.groupIndex][q.questionIndex].answer[d]) return 'correct';
                    if(q.c.answer.indexOf(d) !== -1 && q.result === 'error' && $scope.answerlist[q.groupIndex][q.questionIndex].answer[d]) return 'middle';
                    if(q.c.answer.indexOf(d) !== -1 ) return 'correct';
                    if(q.c.answer.indexOf(d) === -1 && $scope.answerlist[q.groupIndex][q.questionIndex].answer[d]) return 'error';
                    //if(q.c.answer.indexOf(d) !== -1 && !$scope.answerlist[q.groupIndex][q.questionIndex].answer[d]) return 'error';
                    return '';

                }
            },
            
            fill:function (q,$scope) {
                var matchReg = /__/g;
                var replaceReg = /__/;
                if(!$scope.answerlist) return;
                try{
                    var aItem = $scope.data.c.text.match(matchReg) || [];
                    if (!aItem.length && !aItem[0]) {
                        $scope.data.mytext = $scope.data.c.text.replace(matchReg, " <span class='fill-val' style='color:#f17008;text-decoration:underline;'>　<span></span>　</span> ");
                    } else {
                        var description = $scope.data.c.text;
                        angular.forEach(aItem, function(value,i) {
                            description = description.replace(replaceReg, " <span class='fill-val' style='text-decoration:underline;' >　<span>" + '('+(i+1)+')' + "</span>　</span> ");
                        });
                        $scope.data.mytext = description;

                    }
                }catch(err){
                    console.error(err);
                }

            }
        },
        
        resolve:function(qIType,qCType,$scope){

            function contrast(type,params){
                var result;

                switch (type){
                    case 'e_sel':
                        switch (qCType){
                            case 'judge':
                            case 'single':
                                result = factory.resolveContrastEvent.single(params.q,params.d,$scope);
                                break;
                            case 'multi':
                                result = factory.resolveContrastEvent.multi(params.q,params.d,$scope);
                                break;
                        }
                        break;
                    case 'e_fill':
                        result = factory.resolveContrastEvent.fill(params.q,$scope);
                        break;
                }
                return result;
            }
            
            $scope.optionClass = function(q, d) {
                try{
                    if($scope.answerlist.length === 0){
                        return;
                    }
                }catch (e){
                    console.error(e);
                }

                if (!$scope.resolvestatus) {
                    return '';
                }

                var result = contrast(qIType, {
                    q: q,
                    d: d
                });

                if(qIType === 'e_sel'){
                    switch(qCType){
                        case 'single':
                            if(result === 'correct') return 'my-single-input-right';
                            if(result === 'error') return 'my-single-input-wrong';
                            break;
                        case 'judge':
                            if(result === 'correct') return 'my-judge-input-right';
                            if(result === 'error') return 'my-judge-input-wrong';
                            break;
                        case 'multi':
                            if(result === 'correct') return 'my-multi-input-right';
                            if(result === 'error') return 'my-multi-input-wrong';
                            if(result === 'middle') return 'my-multi-input-middle';
                            break;

                    }
                }
                // return result === 'correct' ? {color:'green'} : result === 'error' ? {color:'red'} : '';
            };

            function textWatch(){
                if($scope.resolvestatus == 1) return;
                if($scope.inputWatch){
                    $scope.inputWatch();
                }
                
                $scope.inputWatch = $scope.$watch('answerlist[data.groupIndex][data.questionIndex].score.score',function(value,oldvalue){
                    //console.log(value +'++++++++++'+$scope.onlyFlagTemp+'+++++++++++'+oldvalue+"-----------------"+$scope.data.result);

                    // if(value === oldvalue && value != 0) return;
                    // value = value.score;
                    // oldvalue = oldvalue.score;
                    var fflag = false;
                    var isChar = false;
                    if($scope.correctingarg.next){
                        try{
                            if($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score || $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score==0) $scope.onlyFlagTemp = true;

                        }catch (e){
                            console.log(e);
                        }
                        if($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].didscored){
                            oldvalue = value;
                        }else{
                            oldvalue = 0;
                        }
                        $scope.correctingarg.next--;
                    }
                    // console.log(value +'------------------'+oldvalue);
                    if(value === undefined) value = -1;
                    if(oldvalue === undefined ) oldvalue = 0;

                    if(isNaN(value)){
                        // if(Number(oldvalue) <0 ) oldvalue = 0;
                        $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number(oldvalue);
                        isChar = true;
                        // return;
                    }
                    if(isNaN(oldvalue)){
                        $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = 0;
                        isChar = true;
                        // return;
                    }

                    if(Number(value)>$scope.data.c.score){
                        // if(Number(oldvalue) <0 ) oldvalue = 0;
                        $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number(Number(oldvalue).toFixed(1));
                        fflag = true;
                        // dialog.alert("给分不能超过本题总分");
                        // return;
                    }

                    if(Number(oldvalue) > $scope.data.c.score){
                        if(Number(value) <0 ) value = 0;
                        $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number(Number(value).toFixed(1));
                        fflag = true;
                        // return;
                    }

                    if((!value && value !== 0) || value == -1){
                        $scope.data.result = 'nor';
                    }
                    else if(value == $scope.data.c.score){
                        $scope.data.result = 'correct';
                    }
                    else{
                        $scope.data.result = 'error';
                    }

                    //value需要比较空字符串（''）所以不能用完全匹配===
                    if( value != -1 && (value || value == 0) && $scope.onlyFlagTemp){
                        $scope.correctingarg.leftQuestion --;
                        $scope.onlyFlagTemp = false;
                    }

                    if((!value || value == -1) && value !== 0  && !$scope.onlyFlagTemp){
                        $scope.onlyFlagTemp = true;
                        $scope.correctingarg.leftQuestion ++;
                    }
                    if(!fflag && value != -1 ){
                        //当输入框非数字时，这轮不操作总分，等自动变成数字再操作
                        if(isChar) return;
                        // if(oldvalue == -1) oldvalue = 0;
                        $scope.correctingarg.userScore  = Number(($scope.correctingarg.userScore  - Number(Number(oldvalue).toFixed(1))).toFixed(1));
                        $scope.correctingarg.userScore  = Number(($scope.correctingarg.userScore  + Number(Number(value).toFixed(1))).toFixed(1));

                        if((value+'').indexOf('.') !== -1){
                            if(parseInt(Number(value)) < Number(value)){
                                $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number(Number($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score).toFixed(1));
                            }else if((value+'').indexOf('.00') !== -1){
                                $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number(Number($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score).toFixed(1));
                            }
                        }else{
                            //字符0是true
                            if(value && Number(value) == Number(oldvalue) ){
                                $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score = Number($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score);

                            }
                        }

                    }

                },true);
            }

            function correctPaperSubmit(flag){
                if( $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score === '' || $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score === undefined){
                    if(flag){
                        dialog.alert("请输入分数");
                    }
                    return;
                }
                var cmds = 'asid='+$scope.data.answerId+'&score='+$scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].score.score;
                if($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].analyze){
                    // cmds.analyze =  $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].analyze;
                    cmds+= '&analyze='+ $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].analyze;
                }
                examReq.correctPaper({},{data:cmds}).then(function(data){
                    $scope.textResolveFinish = true;
                    $('#correctingTip-'+$scope.data.index).fadeIn(1000,function () {
                        $('#correctingTip-'+$scope.data.index).fadeOut(1000);
                    })

                },function (err) {
                    console.error(err);
                    service.dialog.showErrorTip(err, {moduleName: 'questions-dir', funcName: 'correctPaper'});
                })
            }

            $scope.correctPaper =function (flag){
                correctPaperSubmit(true);
            };

            $scope.correctPaperScore = function(){
                correctPaperSubmit(false);
            };

            $scope.closeMyText = function () {
                $scope.textResolveTemp = !$scope.textResolveTemp;
            };
            
            $scope.addResolveText = function(){
                $scope.textResolveFinish = false;
            };
            
            
            function init(){
                switch (qIType){
                    case 'e_sel':
                        if($scope.data.c && $scope.data.c.options){
                            $scope.option = $scope.data.c.options;
                        }
                        break;
                    case 'e_fill':
                        contrast(qIType,{q:$scope.data});
                        break;
                    case 'e_text':
                        if($scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].analyze) $scope.textResolveFinish = true;
                        textWatch();
                        break;
                    default:
                        console.error("不存在当前类型");
                }
            }
            init();
        },
        
        doTitleEvent:{
            choice:function (qIType,qCType,$scope,$rootScope) {
                var multiAnswerNum = 0;
                $scope.isClicked = $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].answer;
                $scope.option = [];

                angular.forEach($scope.data.c.options,function (curItem,index) {
                    $scope.option.push(curItem.slice(3,curItem.length-4));
                    // $scope.isClicked[index] = false;
                    if(!$scope.isClicked[index]){
                        $scope.isClicked[index] = false;
                    }else{
                        // $scope.isClicked[index] = false;
                        multiAnswerNum++;
                    }
                });

                function answerFormat(targetIndex) {
                   for(var i = 0;i<$scope.isClicked.length;i++) {
                       if(targetIndex === i){
                           $scope.isClicked[i] = true;
                       }
                       else{
                           $scope.isClicked[i] = false;
                       }
                   }
                    $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].done=true;
                }
                
                $scope.select = function (info,index,ev) {
                    if($scope.resolvestatus){
                        return;
                    }
                    var result = false;
                    if(qCType !== 'multi'){
                        answerFormat(index)
                    }else{
                        $scope.isClicked[index] = !$scope.isClicked[index];

                        if(!$scope.isClicked[index]){
                            multiAnswerNum--;
                        }else{
                            multiAnswerNum++;
                        }

                        if(multiAnswerNum == 0){
                            $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].done=false;
                        }else{
                            $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].done=true;
                        }
                    }

                    if(ev){
                        ev.stopPropagation();
                    }
                    $scope.answerlist[$scope.data.groupIndex][$scope.data.questionIndex].hasdone=true;
                    // $rootScope.curQuestion = $scope.data.index;
                    // console.log($rootScope.curQuestion);
                };

            },

            fill:function (qIType,$scope,$rootScope){
                var tempGIndex = $scope.data.groupIndex;
                var tempQIndex = $scope.data.questionIndex;

                function replaceInput(){
                    // console.log($scope.data.fill);
                    if(!$scope.data.fill){
                        $scope.data.fill = [];
                        if($scope.data.c.answer){
                            angular.forEach($scope.data.c.answer, function(curItem,index) {
                                if($scope.answerlist[tempGIndex][tempQIndex].answer[index]){
                                    $scope.data.fill.push($scope.answerlist[tempGIndex][tempQIndex].answer[index]);
                                    $scope.answerlist[tempGIndex][tempQIndex].hasdone=true;
                                }else{
                                    $scope.data.fill.push('');
                                }
                            });
                        }else{
                            console.log("没有答案对应的字段");
                        }
                    }else{
                       angular.forEach($scope.data.c.answer,function(curItem,index){
                           angular.element('#q-input-'+$scope.data.index+'-'+index).on('input',function(e){
                               // $scope.answerlist[tempGIndex][tempQIndex].answer[index] = e.target.value;
                               // $scope.data.fill[index] = e.target.value;
                               if(e.target.value.replace(/^\s*|[\x00-\x1f]|\s*$/g, '') == ''){
                                   $scope.data.fill[index] = null;
                               }else{
                                   $scope.data.fill[index] = e.target.value;
                               }
                               $scope.setFillAnswer();
                           })
                       })
                    }

                }
                
                $scope.setFillAnswer = function () {
                    var fFlag = false;
                    for(var i=0;i<$scope.data.fill.length;i++){
                        $scope.answerlist[tempGIndex][tempQIndex].answer[i] = $scope.data.fill[i];
                        if($scope.data.fill[i] && $scope.data.fill[i] != ''){
                            fFlag = true;
                        }
                    }
                    if(fFlag){
                        $scope.answerlist[tempGIndex][tempQIndex].done = true;
                    }else{
                        $scope.answerlist[tempGIndex][tempQIndex].done = false;
                    }
                    $scope.answerlist[tempGIndex][tempQIndex].hasdone=true;
                    // $rootScope.curQuestion = $scope.data.index;
                    //$element.find('.fill-val').eq(targetIndex).find('span').html($scope.data.fill[targetIndex] ? $scope.data.fill[targetIndex] : '');
                };
                replaceInput();


            },

            text:function (qIType,$scope,$rootScope,$element) {
                var tempGIndex = $scope.data.groupIndex;
                var tempQIndex = $scope.data.questionIndex;
                // console.log("this is text"+" "+$scope.data.answerContent);

                $scope.recordTextAns = function(){
                    if($scope.answerlist[tempGIndex][tempQIndex].answer[0] && $scope.data.answerContent === undefined ){
                        $scope.answerlist[tempGIndex][tempQIndex].hasdone=true;
                        $scope.data.answerContent = $scope.answerlist[tempGIndex][tempQIndex].answer[0]+'';
                    }
                    $scope.answerlist[tempGIndex][tempQIndex].answer[0] = $scope.data.answerContent;
                    if($scope.data.answerContent ){
                        if( $scope.data.answerContent.replace(/^\s*|[\x00-\x1f]|\s*$/g, '') == ''){
                            $timeout(function(){
                                $scope.data.answerContent = null;
                            });
                        }else{
                            $scope.answerlist[tempGIndex][tempQIndex].done = true;
                            $scope.answerlist[tempGIndex][tempQIndex].hasdone=true;
                        }
                    }else{
                        $scope.answerlist[tempGIndex][tempQIndex].done = false;
                    }
                };


                $scope.blurText = function($event){
                    if($scope.data.answerContent){
                        if( $scope.data.answerContent.replace(/^\s*|[\x00-\x1f]|\s*$/g, '') == ''){
                            $timeout(function(){
                                $scope.data.answerContent = '';
                                $event.value = '';
                            });
                        }
                    }
                };

                angular.element('#ck-'+$scope.data.index).on('input',function(e){
                    $scope.data.answerContent = e.target.value;
                });

                $scope.recordTextAns();

            }
        },

        doTitle:function (qIType,qCType,$scope,$rootScope,$element) {
            // $scope.curQuestion = $scope.curquestion;
            function init() {
                switch(qIType){
                    case 'e_sel':
                        factory.doTitleEvent.choice(qIType,qCType,$scope,$rootScope);
                        break;
                    case 'e_fill':
                        factory.doTitleEvent.fill(qIType,$scope,$rootScope);
                        break;
                    case 'e_text':
                        factory.doTitleEvent.text(qIType,$scope,$rootScope,$element);
                        break;
                }
            }
            init();
        }
    };
    return factory;
}]);
