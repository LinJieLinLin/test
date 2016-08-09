module.directive("examQuestions", function() {
    return {
        template:'<div ng-class=" (data.result === \'error\' || data.result === \'noAnswer\') && resolvestatus===1 ? \'a-q error\' : resolvestatus && resolvestatus != 4 ? \'a-q\' : \'a-q has-border\'" id="question-{{data.index}}" q-type="{{qType}}"><div class="inw"><span class="k-num">{{data.index+1}}. <span ng-show="qIType === \'e_sel\' && qCType === \'single\'">【单选题】</span> <span ng-show="qIType === \'e_sel\' && qCType === \'multi\'">【多选题】</span> <span ng-show="qIType === \'e_sel\' && qCType === \'judge\'">【判断题】</span> <span ng-show="qIType === \'e_fill\'">【填空题】</span> <span ng-show="qIType === \'e_text\' ">【简答题】</span> <span class="k-num-score" ng-show="!resolvestatus || resolvestatus == 4">( <span ng-bind="data.c.score"></span>分 )</span></span><div id="exam-question" class="question-style" ng-bind-html="data.c.text | sanitize"></div><div class="choose" ng-if="qIType === \'e_sel\'"><ul><li ng-repeat="d in option track by $index" ng-click="select(d,$index)" ng-class="{\'option-hover\':!resolvestatus ,\'option\':true}"><div ng-hide="resolvestatus" class="hover-bg"></div><div class="label"><label class="my-single-input" ng-show="qCType === \'single\'"><label ng-hide="resolvestatus == 4"><label ng-class="{\'single-checked\':isClicked[$index]}"></label><label ng-class="optionClass(data,$index)"></label></label></label><label class="my-judge-input" ng-class="{\'judge-checked-t\': isClicked[$index],\'{{optionClass(data,$index)}}\': resolvestatus && resolvestatus != 4}" ng-show="qCType ===\'judge\'"><label ng-class="{\'judge-checked-r\':isClicked[$index],\'judge-unchecked-r\':!isClicked[$index]}" ng-show="$index === 0"></label><label ng-class="{\'judge-checked-e-up\':isClicked[$index],\'judge-unchecked-e-up\':!isClicked[$index]}" ng-show="$index === 1"></label><label ng-class="{\'judge-checked-e-dw\':isClicked[$index],\'judge-unchecked-e-dw\':!isClicked[$index]}" ng-show="$index === 1"></label></label><label class="my-multi-input" ng-show="qCType === \'multi\'"><label ng-hide="resolvestatus == 4"><label ng-class="{\'multi-checked\':isClicked[$index]}"></label><label ng-class="optionClass(data,$index)"></label></label></label><span class="choice-char" ng-hide="qIType === \'e_text\' || qCType === \'judge\'" ng-bind="toChar($index)+\' .\'"></span><div ng-class="{\'judge-padding\':qCType === \'judge\',\'nojudge-padding\':qCType !== \'judge\'}"><span ng-bind-html="d | sanitize"></span></div></div></li></ul></div><div class="choose" ng-if="!resolvestatus && qIType === \'e_fill\'"><ul><li ng-repeat="d in data.fill track by $index" class="option"><span class="mg-r10 gray-c">( {{$index+1}} )</span> <input id="q-input-{{data.index}}-{{$index}}" class="fill-input" ng-model="data.fill[$index]" ng-focus="setFillAnswer($index)" ng-blur="setFillAnswer($index)" ng-change="setFillAnswer($index)" placeholder="请输入你的答案"></li></ul></div><div class="answer" ng-if="!resolvestatus && qIType === \'e_text\' "><div class="answerIntro">答题区:</div><textarea id="ck-{{data.index}}" ng-model="data.answerContent" ng-blur="blurText($event)" ng-focus="recordTextAns()" ng-change="recordTextAns()"></textarea></div><div class="show-answer" ng-show="seeanddo"><button ng-click="seeanddoTemp = !seeanddoTemp">查看解析</button></div></div><div ng-if="resolvestatus && resolvestatus != 4" ng-class="\'resolve \'"><div class="top-triangle"></div><div class="inw" ng-show="qIType != \'e_text\'"><i ng-class="{\'fa fa-meh-o noanswer\':data.result === \'noAnswer\',\'fa fa-frown-o error\': data.result === \'error\',\'fa fa-smile-o correct\':data.result === \'correct\'}" class="face-image"></i> <span ng-show="data.result === \'noAnswer\'" class="noanswer">未作答</span> <span ng-show="data.result === \'error\'" class="error">回答错误</span> <span ng-show="data.result === \'correct\'" class="correct">回答正确</span> <span ng-show="resolvestatus == 1"><span ng-bind=" \'| \' + data.useScore" class="middle-vertical"></span><span ng-bind="\'/\'+data.c.score+\'分\'" class="middle-vertical"></span></span><p class="self-p" ng-if="qCType == \'single\' || qCType == \'multi\'">正确答案是 <span ng-repeat="ans in data.c.answer track by $index" ng-bind="toChar(ans)" class="correctspan"></span></p><p class="self-p" ng-show="qCType == \'judge\'">正确答案是 <span ng-show="data.c.answer[0] == 0" class="correctjudge0"></span> <span class="usually-inline"><span ng-show="data.c.answer[0] == 1" class="correctjudge1up"></span> <span ng-show="data.c.answer[0] == 1" class="correctjudge1down"></span></span></p><p class="self-p" ng-show="data.result === \'error\' && qIType === \'e_sel\' && qCType!== \'judge\'">您的答案是 <span ng-bind="toNum(answerlist[data.groupIndex][data.questionIndex].answer)" class="errorspan"></span></p><p class="self-p" ng-show="data.result === \'error\' && qIType === \'e_sel\'  && qCType=== \'judge\'">您的答案是 <span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[0]" class="errorjudge0"></span> <span class="usually-inline"><span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[1]" class="errorjudge1up"></span> <span ng-show="answerlist[data.groupIndex][data.questionIndex].answer[1]" class="errorjudge1down"></span></span></p><div ng-if="qIType == \'e_fill\'"><p class="self-p">正确答案是</p><div class="answer-position"><span ng-bind-html="fillAnsArray|sanitize"></span></div><div class="clear"></div><div ng-if="data.result === \'error\'"><p class="self-p">您的答案是</p><span ng-repeat="d in answerlist[data.groupIndex][data.questionIndex].answer track by $index" class="answer-position"><span class="gray-c f-l">( {{$index+1}} ) </span><span class="f-l" ng-bind="d" ng-class="{\'correctspan\':data.c.answer[$index].indexOf(d) !== -1,\'errorspan\':data.c.answer[$index].indexOf(d) === -1}"></span></span></div><div class="clear"></div></div><p class="self-p" style="padding-bottom:20px"><button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="!showResolveTemp">试题解析 <i class="fa fa-angle-down"></i></button> <button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="showResolveTemp">试题解析 <i class="fa fa-angle-up"></i></button></p><div class="resolve-info-div" ng-show="!showResolveTemp"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div><div class="correcting-score-show" ng-show="resolvestatus == 2 || resolvestatus == 3"><span class="f-l">得分：</span><div class="self-score-div"><span ng-bind="data.c.score" ng-show="data.result === \'correct\'" class="middle-vertical"></span> <span ng-show="data.result !== \'correct\'" class="sub-vertical" ng-bind="data.useScore"></span></div><span class="self-score-total">(本题共<span ng-bind="data.c.score"></span>分)</span></div></div><div class="inw" ng-show="qIType == \'e_text\'"><span ng-show="resolvestatus == 1"><span ng-bind="data.useScore" class="middle-vertical"></span><span ng-bind="\'/\'+data.c.score+\'分\'" class="middle-vertical"></span></span><div class="cyan-c mg-b10" style="margin:10px 0"><span ng-hide="resolvestatus ==2 || resolvestatus == 3">您的答案是：</span> <span ng-show="resolvestatus ==2 || resolvestatus == 3">学生的答案是：</span><div class="max" ng-bind-html="answerlist[data.groupIndex][data.questionIndex].answer.toString()|sanitize"></div></div><div class="cyan-c mg-b10"><p class="self-p">正确答案是：</p><div class="max" ng-bind-html="data.c.answer.toString()|sanitize"></div></div><div class="resolve-info-div"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div><label for="add-button-{{data.index}}" class="addText-mask" ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><div ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone"><label class="triangle-label-up" ng-show="textResolveTemp && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><label for="add-button-{{data.index}}" class="triangle-label-down" ng-show="!textResolveTemp && !answerlist[data.groupIndex][data.questionIndex].nodone"></label><button id="add-button-{{data.index}}" class="add-button" ng-click="closeMyText()" ng-show="resolvestatus == 2 && !answerlist[data.groupIndex][data.questionIndex].nodone">补充解析</button></div><div ng-show="textResolveTemp && resolvestatus == 2"><div class="resolve-text" ng-show="!textResolveFinish"><textarea class="my-textarea" ng-model="answerlist[data.groupIndex][data.questionIndex].analyze" placeholder="请输入内容"></textarea><button ng-click="correctPaper(true)">提交</button></div><div class="resolve-text-after" ng-show="textResolveFinish"><div class="my-textareaAfter" ng-bind="answerlist[data.groupIndex][data.questionIndex].analyze"></div><button class="my-textarea-editbtn" ng-click="addResolveText()"><i class="fa fa-pencil-square-o" class="self-i"></i> <span>编辑</span></button></div></div><div class="resolve-info-div1" ng-show="resolvestatus == 3 && answerlist[data.groupIndex][data.questionIndex].analyze"><div>【补充解析】</div><div ng-bind-html="answerlist[data.groupIndex][data.questionIndex].analyze|sanitize" class="add-content-left"></div></div><div class="resolve-info-div2" ng-show="resolvestatus == 1 && answerlist[data.groupIndex][data.questionIndex].analyze"><div>【补充解析】</div><div ng-bind-html="answerlist[data.groupIndex][data.questionIndex].analyze|sanitize" class="add-content-left"></div></div><div class="gain-score" ng-show="resolvestatus == 2 || resolvestatus == 3"><span class="f-l">得分：</span> <input class="gain-input" ng-model="answerlist[data.groupIndex][data.questionIndex].score.score" ng-blur="correctPaperScore()" ng-show="resolvestatus == 2" ng-disabled="answerlist[data.groupIndex][data.questionIndex].nodone"> <input class="gain-input-none" ng-disabled="true" ng-show="resolvestatus == 3" ng-value="answerlist[data.groupIndex][data.questionIndex].score.score"> <span class="gain-span">(本题共<span ng-bind="data.c.score"></span>分)</span> <span id="correctingTip-{{data.index}}" class="gain-tip"><i class="fa fa-check-circle-o"></i>已自动保存</span></div></div></div><div ng-if="seeanddo && seeanddoTemp" ng-class="\'resolve \'"><div class="top-triangle"></div><div class="inw" ng-show="qIType != \'e_text\'"><p class="self-p" ng-show="qCType == \'single\' || qCType == \'multi\'">正确答案是 <span ng-repeat="ans in data.c.answer track by $index" ng-bind="toChar(ans)" class="correctspan"></span></p><p class="self-p" ng-show="qCType == \'judge\'">正确答案是 <span ng-show="data.c.answer[0] == 0" class="correctjudge0"></span> <span class="usually-inline"><span ng-show="data.c.answer[0] == 1" class="correctjudge1up"></span> <span ng-show="data.c.answer[0] == 1" class="correctjudge1down"></span></span></p><div ng-if="qIType == \'e_fill\'"><p>正确答案是</p><div class="answer-position"><span ng-bind-html="fillAnsArray|sanitize"></span></div><div class="clear"></div></div><p class="self-p" style="padding-bottom:20px"><button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="!showResolveTemp">试题解析 <i class="fa fa-angle-down"></i></button> <button class="resolve-show" ng-click="showResolveTemp = !showResolveTemp" ng-show="showResolveTemp">试题解析 <i class="fa fa-angle-up"></i></button></p><div class="resolve-info-div" ng-show="!showResolveTemp"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div></div><div class="inw" ng-show="qIType == \'e_text\'"><p class="self-p">正确答案是</p><div ng-bind-html="data.c.answer.toString() | sanitize" style="padding-bottom:20px"></div><div class="resolve-info-div"><span class="span1">【解析】</span><div class="self-desc" ng-bind-html="data.c.analyze | sanitize"></div></div></div></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            data: "=data"
        },
        controller: ['$scope', '$rootScope', '$element', '$attrs', 'examQuestionsFactory', '$timeout', function($scope, $rootScope, $element, $attrs, examQuestionsFactory, $timeout) {
            $scope.resolveStatus = $rootScope.resolveStatus;
            $scope.$watch('data', function(val) {
                $scope.checkType = false;
                $scope.qType = parseInt($scope.data.type);
                if (val) {
                    if ($scope.qType === 40) {
                        $timeout(function() {
                            $scope.checkType = true;
                            if ($scope.resolveStatus) {
                                //解析
                                examQuestionsFactory.resolve($scope.qType, $scope);
                            } else {
                                //做题
                                examQuestionsFactory.doTitle($scope.qType, $scope, $rootScope, $element, $attrs);
                            }
                        }, 0);
                    } else if ($scope.resolveStatus) {
                        //解析
                        examQuestionsFactory.resolve($scope.qType, $scope);
                    } else {
                        //做题
                        examQuestionsFactory.doTitle($scope.qType, $scope, $rootScope, $element, $attrs);
                    }
                }
            });
        }]
    };
});

module.factory('examQuestionsFactory', ['$timeout', '$interval', '$log', 'dialog', function($timeout, $interval, $log, dialog){//}, QAEditorService, ckService, fileService) {
    var factory = {
        // 解析答案对比事件
        resolveContrastEvent: {
            //单选、判断
            radio: function(q, d) {
                if (!q.analyze.answer.length) {
                    return;
                }
                var analyze = q.analyze.answer[0][0];
                var answerAitem = q.answer.aItem || [];
                var aItem = answerAitem[0];
                var result = '';
                if (aItem === d.code) {
                    result = aItem === analyze.content ? 'correct' : 'error';
                }
                if (analyze.content === d.code) {
                    result = d.code === analyze.content ? 'correct' : 'error';
                }
                return result;
            },
            //多选
            checkbox: function(q, d) {
                if (!q.analyze.answer.length) {
                    return;
                }
                var analyze = q.analyze.answer[0][0];
                var errorAnswer = q.errorAnswer;
                var reg = new RegExp(d.code, "ig");
                var result;
                if (reg.test(analyze.content)) {
                    result = 'correct';
                }
                if (reg.test(errorAnswer)) {
                    result = 'error';
                }
                return result;
            },
            //填空
            judge: function($scope) {
                var matchReg = /___/g;
                var replaceReg = /___/;
                var aItem = $scope.data.answer.aItem || [];
                if (!aItem.length && !aItem[0]) {
                    $scope.data.myDescription = $scope.data.description.replace(matchReg, " <span class='fill-val' style='color:#f17008;text-decoration:underline;'>　<span></span>　</span> ");
                } else {
                    var description = $scope.data.description;
                    angular.forEach(aItem, function(value) {
                        description = description.replace(replaceReg, " <span class='fill-val' style='color:#f17008;text-decoration:underline;'>　" + value + "　</span> ");
                    });
                    $scope.data.myDescription = description;
                }
            }
        },
        // 解析
        resolve: function(qType, $scope) {
            function contrast(type, params) {
                var result;
                switch (type) {
                    case 10:
                    case 30:
                        result = factory.resolveContrastEvent.radio(params.q, params.d);
                        break;
                    case 20:
                        result = factory.resolveContrastEvent.checkbox(params.q, params.d);
                        break;
                    case 35:
                        result = factory.resolveContrastEvent.judge($scope);
                        break;
                    case 40:
                        break;
                }
                return result;
            }

            $scope.optionClass = function(q, d) {
                if (!$scope.resolveStatus) {
                    return '';
                }
                var result = contrast(qType, {
                    q: q,
                    d: d
                });
                return result === 'correct' ? 'green-c' : result === 'error' ? 'red-c' : '';
            };

            function init() {
                switch (qType) {
                    case 10:
                    case 20:
                    case 30:
                        $scope.option = JSON.parse($scope.data.option);
                        break;
                        // 填空
                    case 35:
                        contrast(qType);
                        break;
                }
            }

            init();
        },
        // 题型事件
        doTitleEvent: {
            //选择题
            choice: function(qType, $scope, $rootScope) {
                $scope.option = JSON.parse($scope.data.option);

                function answerFormat(d, a) {
                    var reg = new RegExp(d.code, "ig");
                    var has = reg.test(a);
                    if (!has) {
                        a += d.code;
                    }
                    if (has) {
                        a = a.replace(reg, '');
                    }
                    return a.split('').sort().join("");
                }

                $scope.select = function(d, k, ev) {
                    if ($scope.resolveStatus) {
                        return;
                    }
                    var result = '';
                    switch (qType) {
                        case 20:
                            result = answerFormat(d, $scope.data.aItem[0]);
                            break;
                        default:
                            result = d.code;
                    }
                    $rootScope.processingAnswer({
                        d: $scope.data,
                        a: [result],
                        done: result ? true : false,
                        focus: true
                    });
                    if (ev) {
                        ev.stopPropagation();
                    }
                };

                $scope.checked = function(d, a) {
                    var reg = new RegExp(d.code, "ig");
                    return a ? reg.test(a) : false;
                };
            },
            //填空题
            judge: function(qType, $scope, $rootScope, $element) {
                function replaceInput() {
                    var matchReg = /___/g;
                    var replaceReg = /___/;
                    var match = $scope.data.description.match(matchReg) || [];
                    if (!$scope.data.fill) {
                        $scope.data.myDescription = $scope.data.description.replace(matchReg, " <span class='fill-val' style='text-decoration:underline;'>　<span></span>　</span> ");
                        $scope.data.fill = [];
                        angular.forEach(match, function() {
                            $scope.data.fill.push('');
                        });
                    } else {
                        var description = $scope.data.description;
                        angular.forEach(match, function(value, i) {
                            description = description.replace(replaceReg, " <span class='fill-val' style='text-decoration:underline;'>　<span>" + $scope.data.fill[i] + "</span>　</span> ");
                        });
                        $scope.data.myDescription = description;
                    }
                }

                function isDone() {
                    var flag = false;
                    angular.forEach($scope.data.fill, function(value) {
                        if (value) {
                            flag = true;
                        }
                    });
                    return flag;
                }

                $scope.setJudgeAnswer = function(index) {
                    $rootScope.processingAnswer({
                        d: $scope.data,
                        a: $scope.data.fill,
                        done: isDone(),
                        focus: true
                    });
                    $element.find('.fill-val').eq(index).find('span').html($scope.data.fill[index] ? $scope.data.fill[index] : '');
                };

                replaceInput();
            },
            //问答题
            qa: function(qType, $scope, $rootScope, $element) {
                var focusFlag;

                $scope.focus = function() {
                    focusFlag = true;
                    $rootScope.flagCurEdit($scope.data.index);
                };

                $scope.unfocus = function() {
                    focusFlag = false;
                };

                function qaProcessingAnswer(args) {
                    $rootScope.processingAnswer({
                        ck: $scope.config.editor,
                        d: $scope.data,
                        a: [args.data],
                        done: args.data ? true : false,
                        cptAwPg: args.flag
                    });
                }

                function setQaAnswer() {
                    if ($scope.config.editor.checkDirty && $scope.config.editor.checkDirty()) {
                        var getData = $scope.config.editor.getData();
                        if (!focusFlag) {
                            qaProcessingAnswer({
                                data: getData,
                                flag: false
                            });
                            $scope.data.answerContent = getData;
                        } else {
                            qaProcessingAnswer({
                                data: getData,
                                flag: !focusFlag
                            });
                        }

                        $scope.config.editor.resetDirty();
                    }
                }

                //控制内容更新
                var qaChkContTimer;

                function checkContent() {
                    $timeout.cancel(qaChkContTimer);
                    setQaAnswer();
                    qaChkContTimer = $timeout(checkContent);
                }

                factory.doTitleEvent.ckEdit($scope, $element);
                console.log($scope.config)
                checkContent();
            },
            //ckeditor
            ckEdit: function($scope, $element) {
                //ck对象
                $scope.editor = {};

                //ck配置
                $scope.config = {
                    loadingId: "loading_" + $scope.data.index,
                    showLoading: true,
                    editor: {}
                };

                //预览事件
                var scanFileEvent = function(element) {
                    var fid = element.getAttribute("fid");
                    if (!fid) {
                        $log.error('找不到文件id');
                        return;
                    }
                    if (element.getAttribute('status') === 'SUCCESS') {
                        window.open("./viewPaperDemo.html?fileId=" + fid);
                    }
                };

                //请求文件列表
                var fileList = {};

                //获取文件转码信息
                var getFileDetail = function(fid, element, ftoken, eid) {
                    fileService.GetFileDetail.get({
                        fid: 1,
                        fileIds: fid,
                        ftoken: ftoken,
                        token: rcpAid.getToken()
                    }, function(rs) {
                        var elementStatus = element.getAttribute("status");
                        if (elementStatus === "SUCCESS") {
                            return;
                        }
                        switch (rs.code) {
                            case 0:
                                {
                                    var fileObj = rs.data[0]['Exts'];
                                    var status = fileService.GetValue(fileObj, 'STATUS');
                                    if (status === "SUCCESS") {
                                        element.setAttribute("status", "SUCCESS");
                                        $("#" + eid).find(".uploadText")[0].innerHTML = '单击浏览';
                                        window.clearInterval(fileList[eid]);
                                        delete fileList[eid];
                                        $(element).unbind('click');
                                        $(element).bind('click', function() {
                                            scanFileEvent(this);
                                        });
                                    } else if (status === "FAIL") {
                                        $("#" + eid).find(".uploadText")[0].innerHTML = '文件转码失败';
                                        window.clearInterval(fileList[eid]);
                                        delete fileList[eid];
                                    }
                                    break;
                                }
                        }
                    });
                };

                //检查是否转码成功
                var checkTransCode = function(element, func) {
                    var status = element.getAttribute("status");
                    var eid = element.getAttribute("id");
                    var fid = element.getAttribute("fid");
                    if (status !== "SUCCESS" && !fileList[eid]) {
                        getFileToken(eid, func, element, fid);
                    }
                };

                //获取文件token
                var getFileToken = function(eid, func, element, fid) {
                    fileService.GetFileToken.get({
                        fid: 1,
                        fileIds: fid
                    }, function(rs) {
                        if (rs.code === 0) {
                            func(fid, element, rs.data, eid);
                            fileList[eid] = window.setInterval(func, 30000, fid, element, rs.data, eid);
                        } else {
                            dialog.alert("获取文件信息失败。");
                        }
                    });
                };

                //课程内容事件
                var courseEvent = function(element) {
                    //预览文件
                    $(element).find(".file").each(function(index, item) {
                        $(this).find(".delete").remove();
                        checkTransCode(this, getFileDetail);
                        $(item).unbind('click');
                        $(item).bind('click', function() {
                            scanFileEvent(this);
                        });
                    });
                };

                //绑定html事件
                $timeout(function() {
                    courseEvent($element);
                });
            }
        },
        //做题
        doTitle: function(qType, $scope, $rootScope, $element) {

            $scope.$on('tQuestionKie', function() {
                $scope.tQuestionKie = $rootScope.tQuestionKie;
            });

            function init() {
                switch (qType) {
                    //选择题
                    case 10:
                    case 20:
                    case 30:
                        factory.doTitleEvent.choice(qType, $scope, $rootScope);
                        break;
                        //填空题
                    case 35:
                        factory.doTitleEvent.judge(qType, $scope, $rootScope, $element);
                        break;
                        //问答题
                    case 40:
                        factory.doTitleEvent.qa(qType, $scope, $rootScope, $element);
                        break;
                }
            }

            init();
        }
    };
    return factory;
}]);
