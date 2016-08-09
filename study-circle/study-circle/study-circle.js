var module = angular.module("RCP", ['ngCookies']);
module.controller('circleDetailCtrl', ['$scope', 'course', function($scope, course) {
    $('body').show();
    $scope.circleConfig = {
        rUrl: DYCONFIG.studyCircle.rUrl,
        category: '10'
    };
    $scope.circleDetailConfig = {
        rUrl: DYCONFIG.studyCircle.rUrl,
        category: '10'
    };

    function getCourseDetail () {
        var cmds = {
            // 后台 pageCount == 0 相当于默认 pageCount
            appraise: {list: {pageCount: 1}}
        };
        return course.getCourseDetail({cid: $scope.circleDetailConfig.cid, cmds: angular.toJson(cmds)});
    }

    // 加载课程信息
    function getCourse(){
        getCourseDetail().then(function (data) {
            $scope.courseSource = data.data;
            console.log('课程信息', $scope.courseSource);
        }, function (err) {
            console.log('加载课程信息失败', err);
        });
    }


    $scope.$watch('circleDetailConfig.cid',function (newValue, oldValue) {
        if (newValue && newValue != oldValue) {
            getCourse();
        }
    })
}]);

