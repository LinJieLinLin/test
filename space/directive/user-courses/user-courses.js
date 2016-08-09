module.directive('callScroll', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        compile: function($element, $attr) {
            var fn = $parse($attr['callScroll'], /* interceptorFn */ null, /* expensiveChecks */ true);
            return function(scope, element) {
                element.on('scroll', function(event) {
                    var callback = function() {
                        fn(scope, {$event:event});
                    };
                    scope.$apply(callback);
                    // event.stopPropagation();
                    // event.stopImmediatePropagation();
                });
            };
        }
    };
}]);

module.directive('userCourses', function () {
    return {
        template:'<div class="user-courses"><div class="course-list l-scrollbar" call-scroll="scrollTo(\'course\')"><ul ng-show="loaded.course && list.course.length"><li ng-repeat="course in list.course track by $index" ng-class="{\'m-t-16\': $index > 0}"><div class="left"><ng-img c="{\'img\': course.imgUrl, \'default\': \'/rcp-common/imgs/icon/gray-default-img.png\', \'divClass\': \'cover\', \'imgClass\': \'cover-img\'}"></ng-img><div class="progress"><div class="bg"></div><div class="white"><div class="green" ng-style="{\'width\': course.progress + \'%\'}"></div><span class="text">{{course.progress + \'%\'}}</span></div></div></div><div class="right"><p class="title" title="{{course.title}}" ng-bind="course.title"></p><p class="status"><span>课程状态：</span><span ng-class="{\'green\': course.status == 0, \'blue\': course.status != 0}">{{course.status == 0 ? \'已完成\' : \'进行中\'}}</span></p><p class="grades">{{\'分数：\' + (!isNaN(course.grades) ? course.grades + \'分\' : \'暂无\')}}</p></div><a class="detail" ng-href="{{course.detailUrl}}" target="_blank">查看详情</a></li></ul><loader-ui show="loaded.course"></loader-ui><empty-tip ng-show="loaded.course && !list.course.length"></empty-tip></div><div class="teacher-guide"><p class="guide-title"><i class="fa fa-bookmark" aria-hidden="true"></i><span>老师评价</span></p><div class="guide-list l-scrollbar" ng-show="loaded.guide && list.guide.length" call-scroll="scrollTo(\'guide\')"><ul><li ng-repeat="guide in list.guide"><img src="" alt="" ng-src="{{guide.avatar}}"><div class="right-desc"><p class="name">来自“<span ng-bind="guide.name"></span>”的评价</p><p class="desc" title="{{guide.desc}}" ng-bind="guide.desc"></p></div></li></ul></div><loader-ui show="loaded.guide"></loader-ui><empty-tip ng-show="loaded.guide && !list.guide.length"></empty-tip></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        controller: ['$scope', '$timeout', 'service', 'course', function ($scope, $timeout, service, course) {
            $scope.loaded = {
                course: false,
                guide: false
            };

            $scope.request = {
                course: {
                    host: '*',
                    sort: -9,
                    status: 1,
                    page: 1,
                    pageCount: 5
                },
                guide: {}
            };

            $scope.list = {
                course: [],
                guide: []
            };

            var handleCourse = function (courses) {
                if (!courses || !courses.length) {
                    return;
                }
                var list = $scope.list.course;
                var c;
                for (var i = 0, len = courses.length; i < len; i++) {
                    c = courses[i];
                    list.push({
                        detailUrl: rcpAid.getUrl(c.type == 10 ? '课程详情' : '题库详情', {cid: c.id}),
                        imgUrl: c.imgs && c.imgs[0] || '',
                        progress: 45,
                        title: c.title,
                        status: 1,
                        grades: 90
                    });
                }
            };

            var handleGuide = function (data) {

            };

            var load = function (tag, http) {
                if ($scope.request[tag + 'all'] || $scope.request[tag + 'ing']) {
                    return;
                }
                $scope.request[tag + 'ing'] = true;
                http($scope.request[tag]).then(function (data) {
                    $scope.loaded[tag] = true;
                    if (!data) {
                        console.error((tag == 'course' ? '其它课程' : '老师评价') + '请求返回为空', tag, http, data);
                        service.dialog.alert((tag == 'course' ? '其它课程' : '老师评价') + '请求失败');
                        $scope.request[tag + 'ing'] = false;
                        return;
                    }
                    if (!data.data.allCount || !data.data.courses || !data.data.courses.length) {
                        $scope.request[tag + 'all'] = true;
                        return;
                    }
                    tag == 'course' && handleCourse(data.data.courses) || tag == 'guide' && handleGuide(data.data);
                    $scope.request[tag].page++;
                    $scope.request[tag + 'ing'] = false;
                }, function (err) {
                    $scope.loaded[tag] = true;
                    $scope.request[tag + 'ing'] = false;
                    console.error((tag == 'course' ? '其它课程' : '老师评价') + '请求失败', tag, err);
                    if(err.data && err.data.data && err.data.data.code != 301){
                        service.dialog.alert((tag == 'course' ? '其它课程' : '老师评价') + '请求失败');
                    }
                })
            };

            $scope.scrollTo = function (tag) {
                if(tag == 'course' && $('.user-courses .course-list').height() + $('.user-courses .course-list').scrollTop() > $('.user-courses .course-list > ul').height() - 10){
                    load('course', course.getStudentCourse);
                }else if(tag == 'guide' && $('.user-courses .guide-list').height() + $('.user-courses .guide-list').scrollTop() > $('.user-courses .guide-list > ul').height() - 10){

                }
            };

            $timeout(function () {
                load('course', course.getStudentCourse);
            });
        }]
    }
});