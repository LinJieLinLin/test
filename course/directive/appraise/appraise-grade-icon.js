/**
 * appraise-grade-icon
 * Created by ph2 on 2016/7/28.
 */

module.directive('appraiseGradeIcon', function () {
    return {
        template:'<span class="appraise-grade-icon" data-ng-class="selected && [\'good\', \'ordinary\', \'bad\'][grade]" data-ng-bind="[\'赞\', \'一般\', \'踩\'][grade]"></span>',
        restrict: 'E',
        replace: true,
        scope: {
            grade: '=',
            selected: '='
        }
    };
});

