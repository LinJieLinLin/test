/**
 * Created by bingoo on 2015/03/11.
 */
var module = angular.module("RCP", ["QAEditor", "QAEditorService", "ngResource", "ngCookies", "LocalStorageModule", "ngSanitize", "dialog", "httpFilter", "course_service", "RCP.exam.service", "chat_directive"]);

module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

module.controller('resolveCtrl', ['$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'dialogService', 'examPaper', function($rootScope, $scope, $timeout, $anchorScroll, $location, dialogService, examPaper) {

    $scope.aId = QueryStringByName("aid"); //试卷id
    $scope.paperId = QueryStringByName("id"); //试卷id
    $scope.paper = {}; //试卷数据
    $scope.tGroup = []; //题组
    $scope.tList = []; //题目列表

    $scope.readyloading = true; //loading状态
    $scope.readyStyle = {
        height: 0,
        overflow: 'hidden'
    }; //loading状态下的，让主体内容html看不到

    $rootScope.tGroupKie = 0; //当前题组索引
    $rootScope.tQuestionKie = undefined; //当前题目
    $rootScope.tOverview = []; //题组/题目概况

    $rootScope.resolveStatus = true; //解析状态激活
    $scope.resolve = {}; //解析数据
    $scope.tLen = 0; //一共多少道题
    $scope.gain = 0; //得分
    $scope.scoreTable = ['correct', 'error', 'noAnswer', 'nor', 'gain', 'total'];
    $scope.filterType = {
        all: 'all',
        correct: 'correct',
        error: 'error',
        noAnswer: 'noAnswer',
        nor: "nor"
    }; //过滤类型
    $scope.showTypeArr = [ //显示类型列表
        {
            type: 'all',
            class: 'vAll-btn',
            name: '全部'
        }, {
            type: 'correct',
            class: 'correct-btn',
            name: '正确'
        }, {
            type: 'error',
            class: 'error-btn',
            name: '错误'
        }, {
            type: 'noAnswer',
            class: 'not-btn',
            name: '未答'
        }, {
            type: 'nor',
            class: 'nor-btn',
            name: '主观'
        }
    ];
    $scope.curShowType = $scope.showTypeArr[0]; //当前显示类型
    $scope.gNoQuestions = false; //试卷没有题目/题组下没有题

    $scope.correctRemark = "" //试卷点评
    $scope.correctShow = false;

    $scope.qTypeColor = function(val) {
        var color = 'noAnswer';
        switch (val) {
            case 1:
                color = 'correct';
                break;
            case 0:
                color = 'error';
                break;

        }
        return color;
    }

    //对比错对
    $scope.contrast = function(q) {
        var type = parseInt(q.type);
        var aItem;
        var analyze;
        if (typeof q.analyze.answer === 'string') {
            q.analyze.answer = JSON.parse(q.analyze.answer);
        }
        if (type === 10 || type === 20 || type === 30) {
            if (!q.analyze.answer.length) {
                dialogService.alert('系统数据格式出错！', {
                    mask: true
                });
            }
            analyze = q.analyze.answer[0][0].content;
            aItem = q.answer.aItem ? q.answer.aItem[0] : null;
        }
        switch (type) {
            case 10: //单选题
                q.result = $scope.qTypeColor(q.answer.right);
                break;
            case 20: //多选题
                q.result = $scope.qTypeColor(q.answer.right);
                q.errorAnswer = '';
                if (aItem) {
                    aItem = aItem.split("");
                    for (var i = 0; i < aItem.length; i++) {
                        var reg = new RegExp(aItem[i], "ig");
                        var has = reg.test(analyze);
                        if (!has) {
                            q.errorAnswer += aItem[i];
                        }
                    }
                }
                break;
            case 30: //判断题
                q.result = $scope.qTypeColor(q.answer.right);
                break;
            case 35: //填空题
                q.result = $scope.qTypeColor(q.answer.right);
                break;
            case 40: //问答题/主观题
                aItem = q.answer.aItem ? q.answer.aItem[0] : null;
                q.result = aItem ? 'nor' : 'noAnswer';
                break;
                // case 50: //材料题
                //     //
                //     break;
            default:
                dialogService.alert('题型出错！', {});
        }
        return q.result;
    };

    //处理解答/题组概况/题目概况
    $rootScope.processingAnswer = function(arg) {
        if (arg.addGroup) {
            $rootScope.tOverview[arg.g] = $rootScope.tOverview[arg.g] || [];
            for (var i = 0; i < $scope.scoreTable.length; i++) {
                $scope.tGroup[arg.g][$scope.scoreTable[i]] = 0;
            }
            for (var k in $scope.filterType) {
                $scope.paper.qParse[arg.g][$scope.filterType[k]] = [];
            };
            // console.log($scope.paper.qParse[arg.g]);
            return;
        }
        $scope.contrast(arg.d);
        var gKie = arg.d.groupIndex;
        var iKie = arg.d.seqIndex;
        $rootScope.tOverview[gKie][iKie] = {
            index: arg.d.index,
            groupIndex: gKie,
            seqIndex: iKie,
            result: arg.d.result
        }
        $scope.tGroup[gKie].gain += arg.d.answer.score;
        $scope.gain += arg.d.answer.score;
        if (arg.d.type == 40) {
            if (arg.d.result == 'noAnswer') {
                $scope.paper.qParse[gKie][arg.d.result].push(arg.d);
                $scope.tGroup[gKie][arg.d.result] += 1;
            }
            $scope.paper.qParse[gKie]['nor'].push(arg.d);
            $scope.tGroup[gKie]['nor'] += 1;
        } else {
            $scope.paper.qParse[gKie][arg.d.result].push(arg.d);
            $scope.tGroup[gKie][arg.d.result] += 1;
        }
        $scope.tGroup[gKie].total += parseFloat(arg.d.score);
        $scope.paper.qParse[gKie]['all'].push(arg.d);
    };

    //处理索引
    $rootScope.processingIndex = function(processing, callback) {
        processing() && callback();
    };

    //查看更多
    $scope.more = function() {
        if ($scope.pn < $scope.pl) {
            $scope.showPageLoadingIcon = true;
            $timeout(function() {
                $scope.pn++;
                $scope.paging($scope.tList);
            }, 800);
        }
    };

    //滚动到底部加载
    $(window).scroll(function() {
        if (!$scope.showPageLoadingIcon && Math.ceil($(this).scrollTop()) >= (document.body.scrollHeight - ($(this).outerHeight(true) + 0))) {
            $scope.more();
        }
    });

    //分页
    $scope.paging = function(data, pn) {
        if (pn) {
            $scope.pn = pn || 1;
            $scope.ps = 5;
            $scope.pl = Math.ceil(data.length / $scope.ps);
        }
        $scope.pgList = data.slice(0, $scope.ps * $scope.pn);
        $scope.showPageLoadingIcon = false;
    };

    //题目描点定位
    $scope.tLocation = function(d) {
        $rootScope.tQuestionKie = d.index;
        var pn = Math.ceil((d.seqIndex + 1) / $scope.ps);
        $scope.toggleGroup(d.groupIndex, (pn < $scope.pn ? $scope.pn : pn), $scope.showTypeArr[0]);
        $timeout(function() {
            $scope.$broadcast('tQuestionKie', $rootScope.tQuestionKie);
            $('html,body').stop(true, true).animate({
                scrollTop: $('#question-' + d.index).offset().top
            }, 'normal');
        }, 200);
    };

    //切换题组
    $scope.toggleGroup = function(key, pn, type) {
        $rootScope.tGroupKie = key;
        $scope.checkTypePrompt(type || $scope.curShowType);
        $scope.paging($scope.tList, pn || 1);
        if (!pn) {
            $timeout(function() {
                $rootScope.tQuestionKie = undefined;
            }, 200);
        }
        // console.log($scope.tList);
    };

    //下一题组/下一部分
    $scope.nextGroup = function() {
        $rootScope.tGroupKie++;
        $rootScope.tGroupKie %= $scope.tGroup.length;
        $scope.toggleGroup($rootScope.tGroupKie);
    };

    //检测否为显示类型是空的提示
    $scope.checkTypePrompt = function(d) {
        $scope.curShowType = d;
        if (!$scope.qParseNull) {
            $scope.tList = $scope.paper.qParse[$rootScope.tGroupKie][$scope.filterType[d.type]] || [];
            var q = $scope.paper.qParse[$rootScope.tGroupKie].all;
            $scope.gNoQuestions = q && q.length > 0 ? false : true;
            $scope.showNullTypePrompt = $scope.gNoQuestions || d.type == 'all' || $scope.tGroup[$rootScope.tGroupKie][d.type] ? false : true;
        }
        $scope.nullTypePrompt = '本题组没有' + $scope.curShowType.name + '题目';
    };

    //过滤列表
    $scope.filterList = function(d) {
        $scope.toggleGroup($rootScope.tGroupKie, false, d);
    };

    //剩余秒转换时间
    $scope.timeLeft = function(cTime, eTime) {
        var data = {
            day: 0,
            hour: 0,
            min: 0,
            sec: 0
        };
        var iRemain = cTime >= eTime ? 0 : eTime - cTime;
        data.day = parseInt(iRemain / 86400);
        iRemain %= 86400;
        data.hour = parseInt(iRemain / 3600);
        iRemain %= 3600;
        data.min = parseInt(iRemain / 60);
        iRemain %= 60;
        data.sec = parseInt(iRemain);
        return data;
    };

    //用时转换
    $scope.withConversion = function(sec) {
        var duration = $scope.timeLeft(0, parseInt(sec));
        var result = '';
        if (duration.day) {
            result += duration.day + '天';
        }
        if (duration.hour) {
            result += duration.hour + '时';
        }
        if (duration.min) {
            result += duration.min + '分';
        }
        if (duration.sec) {
            result += duration.sec + '秒';
        }
        return result;
    };

    //解析与作答题对应排序处理
    $scope.analyzeSort = function(d) {
        d.myAnalyze = {};
        d.myAnswer = {};
        if (!d.answer || !d.answer.length) {
            return;
        }
        for (var i = 0; i < d.analyze.length; i++) {
            d.myAnalyze[d.analyze[i].id] = d.analyze[i];
        }
        for (var i = 0; i < d.answer.length; i++) {
            d.myAnswer[d.answer[i].qId] = d.answer[i];
        }
    };

    //解析基本信息初始化
    $scope.paperInit = function() {
        $scope.toggleGroup($rootScope.tGroupKie, false, $scope.showTypeArr[0]);

        $scope.submitTime = new Date(parseInt($scope.resolve.submitTime + '000'))._format("yyyy年MM月dd日 hh:mm:ss");
        $scope.duration = $scope.paper.duration ? '限时 ' + $scope.withConversion($scope.paper.duration) : '无限时';
        $scope.whenUsed = $scope.resolve.duration ? $scope.withConversion($scope.resolve.duration) : '空';
        $scope.avgWhenUsed = $scope.resolve.avgDuration ? $scope.withConversion($scope.resolve.avgDuration) : '空';
        $scope.avgScore = Math.round($scope.resolve.avgScore * 100) / 100;
        $scope.percent = $scope.resolve.percent * 100;

        errorReady();
    };

    //获取试卷
    $scope.getPaper = function() {
        examPaper.getStuExamPaper({
                id: $scope.paperId,
                aid: $scope.aId
            },
            function(paper) {
                getChkAnalyze(paper);
            },
            function() {
                errorReady('error');
            }
        );
    };

    //请求解析
    function getChkAnalyze(paper){
        examPaper.getChkAnalyze({
                aId: parseInt($scope.aId)
            },
            function(resolve) {
                //解析数据
                $scope.resolve = resolve.data;
                $scope.correctRemark = resolve.data.remark || "";
                $scope.analyzeSort($scope.resolve);

                //试卷试卷
                $scope.paper = paper.data;
                if ($scope.paper.qGrp) {
                    $scope.tGroup = JSON.parse($scope.paper.qGrp);
                    for (var i = 0; i < $scope.tGroup.length; i++) {
                        if (!$scope.tGroup[i].name) {
                            $scope.tGroup[i].name = '题组' + i;
                        }
                    }
                }

                $rootScope.processingIndex(
                    function() { //数据格式化/解析对比处理
                        var arr = $scope.paper.qParse;
                        var index = 0;
                        if (arr && arr.length) {
                            for (var g = 0; g < arr.length; g++) {
                                $rootScope.processingAnswer({
                                    addGroup: true,
                                    g: g
                                });
                                var qArr = arr[g].questions;
                                if (qArr && qArr.length) {
                                    for (var i = 0; i < qArr.length; i++) {
                                        qArr[i].index = index;
                                        qArr[i].seqIndex = i;
                                        qArr[i].groupIndex = g;
                                        // qArr[i].answer = $scope.resolve.myAnswer[qArr[i].id];
                                        qArr[i].answer = $scope.resolve.answer[index];
                                        qArr[i].analyze = $scope.resolve.myAnalyze[qArr[i].id];
                                        if (qArr[i].answer) {
                                            $rootScope.processingAnswer({
                                                d: qArr[i]
                                            });
                                        }
                                        index++;
                                    }
                                }
                            }
                        }
                        index = $scope.resolve.answer.length;
                        $scope.tLen = index;
                        if (!index) {
                            $scope.qParseNull = index = true; //试卷没有创建题目
                        }
                        return index;
                    },
                    $scope.paperInit //数据格式化后回调页面初始化
                );
            },
            function() {
                errorReady('error');
            }
        );
    }

    function errorReady(type) {
        $scope.readyloading = false;
        $scope.readyStyle = {};
        switch (type) {
            case 'error':
                $scope.errorPaper = true;
                break;
        }
    }

    $scope.gotoLoc = function(argId) {
        $location.hash(argId);
        $anchorScroll();
    };

    $scope.dialog = function(msg) {
        dialogService.alert(msg || '正在建设中。。。');
    };


    //修改评语
    $scope.editRemark = function() {
        if ($scope.correctRemark.length > 100) {
            dialogService.alert("试卷点评不能多于100个字");
            return;
        }

        examPaper.correctRemarkEdit({
            aId: $scope.aId,
            r2: $scope.correctRemark
        }, function(rs) {
            if (rs.code == 0) {
                $scope.correctShow = false;
            } else {
                dialogService.alert(rs.msg);
            }
        });
    };

    function init(){
        if (!$scope.loginReady.flag) {
            errorReady();
            $scope.dialog('请先登录');
        } else {
            $scope.getPaper();
        }
    }

    $rootScope.$watch('loginStatusInit',function (value){
        if(value){
            $scope.loginReady = value;
            if(!$scope.initFlag){
                $scope.initFlag = !$scope.initFlag;
                init();
            }
        }
    });
}]);

$(function() {
    //固定侧栏
    var
        o = '.sidebar',
        ot = 0,
        st = 0,
        memoryStatus = 0,
        status = 1;

    function run() {
        if ($(o).length) {
            var pw = $(o).parent().width();
            ot = $(o).parent().offset().top;
            st = $(window).scrollTop();
            status = st <= ot ? 1 : 2;
            if (status !== memoryStatus) {
                switch (status) {
                    case 2:
                        if($(window).height() - $('#footer').outerHeight(true) > $(o).height()){
                            $(o).parent().css({minHeight: $(o).height()});
                            $(o).css({
                                width: pw,
                                position: 'fixed',
                                top: 0,
                                left: '50%',
                                marginLeft: (600 - pw)
                            });
                        }
                        break;
                    default:
                        $(o).parent().css({minHeight: ''});
                        $(o).css({
                            width: '',
                            position: '',
                            top: '',
                            left: '',
                            marginLeft: ''
                        });
                        break;
                }
            }
            memoryStatus = st <= ot ? 1 : 2;
        }
        setTimeout(run);
    }
    run();
});
