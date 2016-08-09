/**
 * directive my-appraisal-tip
 * 学习中心-我的课程-我的评价
 * Created by ph2 on 2016/7/27.
 */

/**
 *
 * [myAppraisalTip]
 *
 config: {
        // hover wrap 鼠标hover事件包裹层
        hoverWrapStyle: {},
        hoverWrapClass: {},
        // 可视层
        viewStyle: {},
        viewClass: {}
    }
 */
module.directive('myAppraisalTip', function () {
    return {
        template:'<div class="my-appraisal-tip-space"><span data-ng-transclude></span><div class="detail-view-hover-wrap" data-ng-class="{config.hoverWrapClass: true, \'width-xs\': !text, \'width-lg\': text.length>50}" data-ng-style="config.hoverWrapStyle"><div class="detail-view" data-ng-class="config.viewClass" data-ng-style="config.viewStyle"><p class="title">我的评价：</p><div class="clearfix"><appraise-grade-icon class="f-l" grade="grade" selected="true"></appraise-grade-icon><p class="content" data-ng-bind="text||\'\'"></p></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            // 评价等级
            grade: '=',
            // 评价文本内容
            text: '=',
            config: '='
        }
    }
});