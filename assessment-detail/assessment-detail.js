
//assessment-detail.js

var module = angular.module('RCP', [
    'ngCookies'
]);
module.controller('assessmentDetailCtrl', ['$scope', '$rootScope', 'service', 'course', 'appraiseService', function ($scope, $rootScope, service, course, appraiseService) {

    var id = rcpAid.queryString('id');
    if (!id) {
        service.dialog.alert('课程信息有误');
        return;
    }

    $scope.targetId = id;
    
    $scope.hideCommentWithoutContent = true;

    $scope.config = {
        autoInit: false,
        targetId: $scope.targetId,
        // 评价列表默认隐藏没有内容的评价
        hideCommentWithoutContent: true,
        sort: -1,
        type: 'normal'
    };
    
    function getCourseDetail () {
        var cmds = {
            appraise: {
                list: {
                    // empty 是否显示评价内容为空的评价, 0 显示, 大于0 不显示
                    empty: $scope.hideCommentWithoutContent ? 1 : 0,
                    sort: $scope.config.sort
                }
            }
        };
        return course.getCourseDetail({cid: $scope.targetId, cmds: angular.toJson(cmds)});
    }

    getCourseDetail().then(function (data) {
        $scope.courseSource = data.data;

        // 课程评价评分
        try {
            // 转换得到的评价数据
            $scope.cmtResult = appraiseService.handleTargetComment($scope.courseSource.items.appraise.list)
        } catch (e) {
            $scope.cmtResult = {};
        }

        if ($scope.courseSource.crs && $scope.courseSource.crs.title) {
            $rootScope.title = $scope.courseSource.crs.title + ' - ' + '课程评价';
        } else {
            $rootScope.title = '课程评价';
        }

    }, function (err) {
        var log = service.dialog.showErrorTip(err, {
            moduleName: '评价详情',
            funcName: 'getCourseDetail',
            text: '加载评价失败'
        });
        console.log(log);
        // logAndAlertErr(err.data.data, 'loadCourse err 加载课程信息失败', '加载评价失败');
        $scope.cmtResult = {};
    });

}]);