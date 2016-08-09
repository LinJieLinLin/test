
module.filter('percent', function () {
    return function (input, decimals) {
        input  = input || 0;
        decimals = decimals || 0;
        return (input * 100).toFixed(decimals); 
    };
});
module.filter('chineseTime', function () {
    return function (text) {
        if (typeof text !== 'number') {
            return text;
        }
        var d = new Date(text);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        month = month > 9 ? month : '0' + month;
        var day = d.getDate();
        day = day > 9 ? day : '0' + day;
        var hour = d.getHours();
        hour = hour > 9 ? hour : '0' + hour;
        var minute = d.getMinutes();
        minute = minute > 9 ? minute : '0' + minute;

        // return [year, month, day].join('-') + ' ' + [hour, minute].join(':');
        return year + '年' + month + '月' + day + '日 ' + [hour, minute].join(':')
    };
});

module.directive('appraiseList', function () {
   return {
       template:'<div class="appraise-space"><div class="appraise-bd"><div class="appraise-content-head"><div class="title-bar"><span>课程评价</span></div></div><div class="appraise-content-bd" ng-show="firstLoaded && !noAppraiseData"><div class="appraise-general"><div class="reputation"><div><span class="reputation-num" ng-bind="percentNum[\'0\']">0</span> <span class="reputation-sign">%</span></div><span class="reputation-text">赞过</span></div><div class="grade-info"><span class="item">点赞（<span ng-bind="percentNum[\'0\']">0</span>%）</span> <span class="item">一般（<span ng-bind="percentNum[\'1\']">0</span>%）</span> <span class="item">点踩（<span ng-bind="percentNum[\'2\']">0</span>%）</span></div><div class="grade-percent-graph"><span class="percent-bar-group"><span class="percent-bar" ng-style="{\'width\': percentBarStyle[\'0\']}"></span> </span><span class="percent-bar-group"><span class="percent-bar" ng-style="{\'width\': percentBarStyle[\'1\']}"></span> </span><span class="percent-bar-group"><span class="percent-bar" ng-style="{\'width\': percentBarStyle[\'2\']}"></span></span></div></div><div class="appraise-toolbar"><div class="grade-filter"><span ng-click="filtrateGrades(-1)" class="item" ng-class="{selected: gradeShowed==-1}">全部（<span ng-bind="cmtResult.gradesCount">0</span>）</span> <span ng-click="filtrateGrades(0)" class="item" ng-class="{selected: gradeShowed==0}">点赞（<span ng-bind="cmtResult.grades[\'0\']">0</span>）</span> <span ng-click="filtrateGrades(1)" class="item" ng-class="{selected: gradeShowed==1}">一般（<span ng-bind="cmtResult.grades[\'1\']">0</span>）</span> <span ng-click="filtrateGrades(2)" class="item" ng-class="{selected: gradeShowed==2}">点踩（<span ng-bind="cmtResult.grades[\'2\']">0</span>）</span></div><div class="checkbox-filter"><div class="checkbox-ctrl" ng-click="toggleShowNullComment()"><span class="checkbox"><i class="fa fa-square-o fa-lg" ng-hide="showContentCommentOnly" style="margin-left:1px"></i> <i class="fa fa-check-square fa-lg" ng-show="showContentCommentOnly" style="color:#02c0b9"></i> </span><span>只看有内容的评价</span></div></div></div><div class="comment-space"><ul class="cmt-list"><li ng-repeat="c in cmtResult.comments | limitTo:pageCount"><div class="cmt-item clearfix"><div class="head-icon f-l"><img class="pic" ng-src="{{c.avatar}}" alt="{{c.userNickName}}" title="{{c.userDesc}}"><p class="name ellipsis" ng-bind="c.userNickName" title="{{c.userNickName}}">呢称</p></div><div class="cmt-detail"><div class="row"><div class="comment-grade f-l"><div class="grade selected" ng-class="c.gradeIcon"><span class="icon" ng-bind="gradeTexts[c.grade]||\'\'">赞</span></div></div><div class="cmt-content"><p class="cmt-text" ng-bind="c.contentText"></p></div></div><div class="cmt-time" ng-bind="c.contentTime|chineseTime"></div><div class="cmt-reply" ng-show="c.replies.length"><div class="reply-item" ng-repeat="r in c.replies"><div class="name-bd f-l"><span class="name ellipsis" ng-bind="r.userNickName" title="{{r.userNickName}}"></span>:</div><div class="reply-ctt"><p class="reply-text" ng-bind="r.contentText"></p></div></div></div></div></div></li></ul><div class="no-data" ng-show="!cmtResult.comments.length">暂无评价</div></div><div class="mg-t20" ng-show="type==\'normal\'"><pagination class="page-bar" pagefn="pagefn" pageargs="pageargs" list="cmtResult.comments"></pagination></div><div class="mg-t20" ng-if="lookMoreUrl"><div class="show-more"><a ng-href="{{lookMoreUrl}}" target="_blank">查看全部点评&nbsp;&gt;</a></div></div></div><div class="no-data" ng-show="firstLoaded && noAppraiseData">暂无评价</div><div ng-hide="firstLoaded" class="loading-section"><loader-ui></loader-ui></div></div></div>',
       restrict: 'E',
       replace: true,
       transclude: true,
       scope: {
           data: '=?data',
           config: '='
       },
       controller: ['$scope', '$rootScope', '$document', '$element', 'service', 'course', '$timeout', 'appraiseService', '$filter', function ($scope, $rootScope, $document, $element, service, course, $timeout, appraiseService, $filter) {

           /**
            * autoInit == true, 使用传进来的 targetId 自动加载数据
            * autoInit == false, 开始时自身不加载数据，直接使用父组件的传进来的 data
            * limitedNum  只显示 limitedNum (默认 10 条) 条评论
            * type == preview 显示 "查看更多评价" (已在html屏蔽); type == normal 显示分页组件 (默认)
            */
           function init() {
               var config = $scope.config || {};
               $scope.autoInit = !!config.autoInit;
               $scope.targetId = config.targetId || '';
               $scope.limitedNum = parseInt(config.limitedNum) || 10;
               $scope.limitedNum = ($scope.limitedNum > 0) ? $scope.limitedNum : 10;
               $scope.pageCount = $scope.limitedNum;
               $scope.pageNum = 1;
               $scope.showTip = false;
               $scope.firstLoaded = false;
               $scope.pagefn = pagefn;
               $scope.pagefnCalledCount = 0;
               $scope.pagefnCallback = angular.noop;
               $scope.showContentCommentOnly = !!config.hideCommentWithoutContent;
               $scope.sort = config.sort;
               $scope.type = config.type;

               $scope.cmtResult = appraiseService.getBasicTargetComment();

               if ($scope.type != 'preview') {
                   $scope.type = 'normal';
               } else {
                   $scope.lookMoreUrl = rcpAid.getUrl('课程评价', {id: $scope.targetId});
               }
               
               if ($scope.autoInit) {
                   if (!$scope.targetId) {
                       console.error('课程信息有误，无法获取评价');
                       service.dialog.alert('课程信息有误，无法获取评价');
                       return;
                   }
               } else {
                   $scope.$watch('data', function(newValue, oldValue) {
                       if (!newValue) {
                           console.log('评价: 传入的评价数据为空');
                           return;
                       }
                       if (!newValue.valid) {
                           console.error('评价: 传入的评价数据无效', newValue);
                           $scope.cmtResult = appraiseService.getBasicTargetComment();
                       } else {
                           $scope.cmtResult = newValue;
                           $scope.pagefnCallback({pa: {total: newValue.total}});
                           console.log('评价: 传入的评价数据更新', newValue);
                       }
                       recalculate();
                   });
               }
               initPageargs();
           }
           init();

           // ----------------------------------------

           var percentBarFullWidth = 150;
           var requestParams = {
               targetId: $scope.targetId
           };
           var gradeStyles = ['good', 'ordinary', 'bad'];
           $scope.gradeTexts = ['赞', '一般', '踩'];
           $scope.gradeShowed = -1;

           function initPageargs() {
               $scope.pageargs = {
                   // 每页结果数
                   ps: $scope.pageCount,
                   // 当前第几页
                   pn: $scope.pageNum,
                   //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
                   pl: 5
               };
           }

           // 分页组件回调
           function pagefn(pageargs, callback) {
               if (!$scope.autoInit) {
                   // 屏蔽掉 autoInit == false, 由 $scope.pageargs 变化 触发的 第一次回调
                   if ($scope.pagefnCalledCount == 0) {
                       $scope.pagefnCalledCount++;
                       $scope.pagefnCallback = callback;
                       return;
                   }
               }

               requestParams.page = pageargs.pn;  // 分页页数
               requestParams.pageCount = pageargs.ps; // 每页结果数
               requestParams.showContentCommentOnly = $scope.showContentCommentOnly;
               requestParams.sort = $scope.sort;

               loadComment(requestParams, function (data) {
                   callback({pa: {total: data.total}});
               });
           }

           // 加载评价数据（内部使用的）
           function loadComment(params, callback) {
               appraiseService.getTargetComment(params, function (ok, data) {
                   console.log('appraise list', ok, data);
                   if (ok) {
                       $scope.cmtResult = data;
                       recalculate();
                       callback && callback(data);
                   }
               });
           }

           // 重新计算数据
           function recalculate() {
               var result = $scope.cmtResult;
               var percentNum = {},
                   percentBarStyle = {};

               angular.forEach(result.gradesPercent, function (v, k) {
                   percentNum[k] = $filter('percent')(v);
                   percentBarStyle[k] = percentBarFullWidth * v + 'px';
               });
               $scope.percentNum = percentNum;
               $scope.percentBarStyle = percentBarStyle;

               angular.forEach(result.comments, function (v, k) {
                   v.gradeIcon = gradeStyles[v.grade] || '';
               });

               $scope.showTip = false;
               if ($scope.type == 'preview') {
                   if (result.comments.length < $scope.limitedNum) {
                       $scope.showTip = true;
                   }
               } else {
                   var len = Math.ceil($scope.cmtResult.total / $scope.pageargs.ps);
                   if (len == $scope.pageargs.pn) {
                       $scope.showTip = true;
                   } else if (len === 0) {
                       $scope.showTip = true;
                   }
               }

               // 当前筛选的评价分类没有用户选择 不显示提示
               if ($scope.gradeShowed > -1 ) {
                   var t = result.grades[$scope.gradeShowed];
                   if (! (t > 0)) {
                       $scope.showTip = false;
                   }
               }

               // 是否没有人评价过
               $scope.noAppraiseData = !result.gradesCount;
               $scope.firstLoaded = true;

               $scope.$emit("appraiseUpdate", result);
           }

           // 筛选 评价等级
           $scope.filtrateGrades = function (grade) {
               if (grade < 0 || grade > 2) {
                   grade = -1;
               }
               $scope.gradeShowed = grade;
               var score = {type: 'vote'};
               if (grade != -1) {
                   score.min = score.max = grade + 1;
               }

               requestParams.scores = [score];
               $scope.pageargs = {
                   ps: $scope.pageargs.ps,
                   pn: 1,
                   pl: $scope.pageargs.pl
               };
           };

           $scope.reloadList = function (index) {
               if (index == null) {
                   index = 1;
               }
               var pageargs = angular.extend({}, $scope.pageargs);
               pageargs.pn = index;
               $scope.pageargs = pageargs;
               console.log('reloadList............')
           };

           $scope.toggleShowNullComment =function () {
               $scope.showContentCommentOnly = !$scope.showContentCommentOnly;
               $scope.reloadList();
           };
       }]
   }
});
