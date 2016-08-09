if (!module) {
    var module = angular.module('RCP', []);
}

module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);

module.directive("courseIntroRight", function() {
    return {
        template:'<div class="right-course-intro"><div class="right-course-contentDiv"><a ng-href="{{backToCourse}}" target="_blank"><img ng-src="{{info.imgUrl || \'/rcp-common/imgs/icon/gray-default-img.png\'}}" class="right-course-img"></a><h2 class="right-course-title"><a ng-href="{{backToCourse}}" target="_blank" ng-bind="info.title || \'暂无标题\'"></a></h2><table><tbody><tr><td class="table-left">创建者</td><td class="table-right">暂无</td></tr><tr><td class="table-left">导学老师</td><td class="table-right"><p ng-repeat="i in teachers" ng-bind="i.name"></p></td></tr><tr><td class="table-left">课程描述</td><td class="table-right">暂无</td></tr><tr><td class="table-left">课程服务态度</td><td class="table-right">暂无</td></tr><tr><td class="table-left">课程质量</td><td class="table-right">暂无</td></tr></tbody></table></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            info: '='
        },
        controller: ['$scope', 'course', 'dialog', function($scope, course,dialog) {
            var cmds = {
                service:{
                    list:{}
                }
            };

            $scope.init = function() {
                if (!$scope.info || !$scope.info.cid) {
                    console.log("获取课程id失败");
                    return;
                }
                $scope.$watch("info", function(newValue) {
                    if (!newValue.cid) {
                        return;
                    }

                    $scope.backToCourse = rcpAid.getUrl('课程详情',{
                        cid:$scope.info.cid,
                        token:rcpAid.getToken()
                    });

                    $scope.req.getCourseinfo().then(function(data) {
                        $scope.info.imgUrl = data.data.crs.imgs[0];
                        $scope.info.title = data.data.crs.title;

                        if(data.data.items.service) {
                            var teachersID = data.data.items.service.list.service.uids;
                            var teachersInfo = data.data.items.service.list.users;
                            $scope.loadTeacher(teachersID,teachersInfo);
                        }

                    }, function(err) {
                        console.log("获取课程详情失败" + err);
                        service.dialog.showErrorTip(err, {moduleName: 'course-intro-right', funcName: 'getCourseinfo'});
                    })
                }, true);

            };

            $scope.req = {
                getCourseinfo: function() {
                    return course.getCourseDetail({ cid: $scope.info.cid, cmds:angular.toJson(cmds) });
                }
            };


            $scope.loadTeacher = function(teachersID,teachersInfo){
                $scope.teachers = [];
                if (teachersID.length) {
                    angular.forEach(teachersInfo, function (item, i) {
                        console.log(item);
                        $scope.teachers.push({
                            name: item.attrs.basic.nickName
                        });
                    });
                }else{
                    $scope.teachers.push({name:'nothing'})
                }
            };

            $scope.$watch("info", $scope.init, true);
        }]
    };

});
