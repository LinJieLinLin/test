/**
 * Created by Fox2081 on 2016/6/16.
 */
var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);

module.controller('courseSummary', ['$scope', '$sce', 'service', function ($scope, $sce, service) {

    $scope.cid = rcpAid.queryString('cid');

    //课程描述组件配置
    $scope.introConfig = {
        scope: null,
        less: false,
        content: []
    };

    function getCourseDetail() {
        var cmds = {
            summary: {
                idx: {
                    itemc: "1",
                    type: "T1,T2,image,text"
                }
            }
        };

        service.course.getCourseDetail(
            {
                cid: $scope.cid,
                price: 1,
                pvs: 1,
                cmds: angular.toJson(cmds)
            },
            {
                option: {'loading': false},
                noToken: true
            }
        ).then(function (data) {

            $scope.course = data.data;
            
            if ($scope.course.items.summary && $scope.course.items.summary.idx.items) {
                $scope.introConfig.content = $scope.course.items.summary.idx.items;
                $scope.introConfig.scope.init();
            }
        });
    }

    getCourseDetail();
}]);
