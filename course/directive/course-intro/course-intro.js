
module.directive('courseIntro', function () {
    return {
        template:'<div><div class="course-intro-space"><div class="course-intro-bd"><div class="course-cover"><a ng-href="{{courseInfo.courseDetailUrl}}" target="_blank"><ng-img c="{img: courseInfo.coverUrl, default: \'/rcp-common/imgs/icon/gray-default-img.png\', divClass: \'cover\'}"></ng-img></a></div><div class="course-title ellipsis"><a ng-href="{{courseInfo.courseDetailUrl}}" target="_blank" ng-bind="courseInfo.title || \'暂无标题\'" title="{{courseInfo.title || \'暂无标题\'}}"></a></div><div class="course-good-grade-num"><p><i class="image-course-good-reputation"></i>&nbsp;&nbsp;<span><span ng-bind="courseInfo.goodGrade||0">0</span>人</span>&nbsp;&nbsp;赞过</p></div><div class="course-info-bd clearfix"><div class="info-h clearfix" ng-if="courseInfo.teachers.length"><div class="item-t">导学团队</div><div class="item-c"><span class="option teacher-info" ng-repeat="t in courseInfo.teachers" ng-show="courseInfo.teachers.length"><ng-img c="{img: t.avatar, divClass: \'img\' }"></ng-img><span ng-bind="t.name" title="{{t.name}}" class="name ellipsis"></span> </span><span class="option" ng-hide="courseInfo.teachers.length">无</span></div></div><div class="info-h clearfix" ng-if="courseInfo.startTime>0"><div class="item-t">开课时间</div><div class="item-c ellipsis" ng-bind="courseInfo.startTime>0?(courseInfo.startTime|time):\'无\'"></div></div><div class="info-h clearfix"><div class="item-t">参与人数</div><div class="item-c ellipsis"><span ng-bind="courseInfo.joined"></span>人</div></div><div class="info-h clearfix" ng-if="courseInfo.suitableStr"><div class="item-t">适合人群</div><div class="item-c"><span ng-bind="courseInfo.suitableStr"></span></div></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            courseData: '='
        },
        controller: ['$scope', 'course', 'appraiseService', function ($scope, course, appraiseService) {

            function getBasicCourseInfo() {
                return {
                    cid: '',
                    title: '',
                    courseDetailUrl: '',
                    coverUrl: '',
                    // coverUrl: '/rcp-common/imgs/icon/gray-default-img.png',
                    goodGrade: 0,
                    teachers: [],
                    startTime: 0,
                    suitable: [],
                    suitableStr: '',
                    joined: 0
                };
            }

            $scope.courseInfo = getBasicCourseInfo();

            $scope.$watch('courseData', function (newValue, oldValue) {
                if (!newValue) {
                    return;
                }
                $scope.courseInfo = converToCourseInfo(newValue);
                console.log('课程信息: 数据传入', newValue, '解析后', $scope.courseInfo);
            });

            // 转换得到课程信息数据
            function converToCourseInfo(data) {
                var crs = data.crs;
                if (!crs || !crs.id) {
                    console.log('课程信息错误', data);
                    return;
                }

                var info = getBasicCourseInfo();
                info.cid = crs.id;
                info.title = crs.title || '';

                info.courseDetailUrl = rcpAid.getUrl('课程详情', {cid: info.cid});

                if (crs.imgs && crs.imgs.length) {
                    info.coverUrl = crs.imgs[0];
                } else {
                    console.log('不存在封面');
                }

                info.startTime = crs.start_time;

                if (crs.suitable && crs.suitable.length) {
                    info.suitable = crs.suitable;
                    info.suitableStr = crs.suitable.join('， ');
                }
                info.joined = crs.joined;

                info.teachers = getCourseTeam(data.crs.team, data.usr);

                try {
                    var appraise = data.items.appraise;
                    var grades = appraiseService.handleGradeData(appraise.list.statistics).grades;
                    // 第一个是点赞 (appraiseService.js 里面的 gradeTypes)
                    info.goodGrade = grades['0'];
                } catch (e) {
                    console.log('解析点赞数据失败');
                }

                return info;
            }

            // 导学团队信息
            function getCourseTeam(teams, users) {
                var teachers = [];

                try {
                    angular.forEach(teams, function (v) {
                        var o = {};
                        var user = users[v.uid];
                        if (!user) {
                            console.log('courser team: usr 用户信息不存在', v);
                            return;
                        }

                        o.id = user.id;

                        if (user.attrs && user.attrs.basic) {
                            o.name = user.attrs.basic.nickName || o.id;
                            o.avatar = user.attrs.basic.avatar;
                        } else {
                            console.log('course team: usr user.attrs.basic error ', user);
                        }

                        o.id && teachers.push(o);
                    });
                } catch (e) {
                    console.log('course team 解析错误', e, data);
                }
                return teachers;
            }
        }]
    }
});
