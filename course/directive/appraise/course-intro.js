
module.directive('courseIntro', function () {
    return {
        template:'<div><div class="course-intro-space"><div class="course-intro-bd"><div class="course-cover"><a ng-href="{{courseInfo.courseDetailUrl}}" target="_blank"><ng-img c="{img: courseInfo.coverUrl, default: \'/rcp-common/imgs/icon/gray-default-img.png\', divClass: \'cover\'}"></ng-img></a></div><div class="course-title ellipsis"><a ng-href="{{courseInfo.courseDetailUrl}}" target="_blank" ng-bind="courseInfo.title || \'暂无标题\'"></a></div><div class="course-good-grade-num"><p><i class="image-course-good-reputation"></i>&nbsp;&nbsp;<span><span ng-bind="courseInfo.goodGrade||0">0</span>人</span>&nbsp;&nbsp;赞过</p></div><div class="course-info-bd"><div class="info-h"><div class="item-t">导学团队</div><div class="item-c"><span class="option teacher-info" ng-repeat="t in courseInfo.teachers"><ng-img c="{img: t.avatar, divClass: \'img\' }"></ng-img><span ng-bind="t.name" title="{{t.name}}" class="name ellipsis"></span></span></div></div><div class="info-h"><div class="item-t">特色服务</div><div class="item-c"><span class="option">无</span></div></div><div class="info-h"><div class="item-t">开课时间</div><div class="item-c ellipsis" ng-bind="courseInfo.startTime | time"></div></div><div class="info-h"><div class="item-t">参与人数</div><div class="item-c ellipsis"><span ng-bind="courseInfo.joined"></span>人</div></div><div class="info-h"><div class="item-t">适合人群</div><div class="item-c"><span ng-bind="courseInfo.suitableStr"></span></div></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            info: '='
        },
        controller: ['$scope', '$rootScope', '$document', '$element', 'service', 'course', '$timeout', 'appraiseService', function ($scope, $rootScope, $document, $element, service, course, $timeout, appraiseService) {

            function getBasicCourse() {
                return {
                    cid: '',
                    title: '',
                    coverUrl: '',
                    goodGrade: 0
                };
            }

            $scope.courseInfo = getBasicCourse();
            $scope.$watch('info', function (newValue, oldValue) {
                if (!newValue) {
                    console.log('传入课程信息为空');
                    return;
                }
                $scope.courseInfo = newValue;
                console.log('传入课程信息更新', newValue);
            });
        }]
    }
});
