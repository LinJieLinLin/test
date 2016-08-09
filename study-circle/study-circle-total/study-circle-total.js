var module = angular.module("RCP", ['ngCookies']);

module.controller("totalCircle",['$scope', 'course', function($scope, course){
    $scope.circleConfig = {
        rUrl: DYCONFIG.studyCircle.rUrl,
        category: '10',
        showTotal: true,
        cid: rcpAid.queryString("cid"),
        type: rcpAid.queryString("type")
    };

    function getCourseDetail () { 
        var cmds = {
            // 后台 pageCount == 0 相当于默认 pageCount
            appraise: {list: {pageCount: 1}}
        };
        return course.getCourseDetail({cid: $scope.circleConfig.cid, cmds: angular.toJson(cmds)});
    }

    // 加载课程信息
    getCourseDetail().then(function (data) {
        $scope.courseSource = data.data;
        console.log('课程信息', $scope.courseSource);
    }, function (err) {
        console.log('加载课程信息失败', err);
    });

}]);