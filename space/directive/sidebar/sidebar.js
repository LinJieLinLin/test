module.directive('sidebar', function () {

    return {
        restrict: 'E',
        template:'<div class="sidebar"><ul><li ng-class="sidebar.cur" ng-repeat="sidebar in sidebarList" ng-click="barClick(sidebar)"><a ng-href="{{sidebar.href}}"><div><i ng-class="sidebar.icon"></i></div><span ng-bind="sidebar.name"></span></a></li></ul></div>',
        replace: "true",
        scope: {},
        controller: ['$scope', '$element', '$attrs', '$location', '$rootScope', function ($scope, $element, $attrs, $location, $rootScope) {

            var iconPrefix = 'image-';
            var iconSuffix = '-down';
            var curTag = '';
            var filter = {
                '/paper-detail': 'shijuan'
            };

            switch ($attrs.sidebarType) {
                case "student":
                    iconPrefix = 'image-cat-';
                    $scope.sidebarList = [
                        // {tag: '', cur: "", icon: '', name: '首页', href: '#/home'},
                        {tag: 's1', cur: '', icon: '', name: '我的课程', href: '#/myCourses'},
                        // { tag: 's2', cur: '', icon: '', name: '我的题库', href: '#/myQuestionPool' },
                        {tag: 's3', cur: '', icon: '', name: '我的圈子', href: '#/myCircle'},
                        {tag: 's4', cur: '', icon: '', name: '学习风格', href: '#/myKnowledge'},
                        // {tag: '', cur: "", icon: '', name: '学习计划', href: '#/myPlan'},
                        // {tag: '', cur: "", icon: '', name: '留言板', href: '#/myComment'},
                        // {tag: '', cur: "", icon: '', name: '学习成果', href: '#/myActivityResult'},
                        // {tag: '', cur: "", icon: '', name: '作业', href: '#/hehavior'},
                        // {tag: '', cur: "", icon: '', name: '通知', href: '#/messageBoard'},
                        {tag: 's5', cur: '', icon: '', name: '我的学分', href: '#/myScore'},
                        {tag: 's6', cur: '', icon: '', name: '账号信息', href: '#/myAccont'},
                        {tag: 's7', cur: '', icon: '', name: '教育信息', href: '#/myEducation'}
                        // {tag: '', cur: "", icon: '', name: '我的订单', href: 'my-order.html'}
                    ];
                    break;

                case "teacher":
                    iconPrefix = 'image-bar-t-';
                    $scope.sidebarList = [
                        {tag: 'kecheng', cur: '', icon: '', name: '课程管理', href: '#/coursesManager'},
                        {tag: 'daoxue', cur: '', icon: '', name: '导学中心', href: '#/guideSpace'},
                        {tag: 'xuesheng', cur: '', icon: '', name: '学生管理', href: '#/studentManager'},
                        {tag: 'shijuan', cur: '', icon: '', name: '试卷批改', href: '#/paperManager'},
                        {tag: 'chengji', cur: '', icon: '', name: '成绩管理', href: '#/scoreManager'},
                        {tag: 'tuandui', cur: '', icon: '', name: '团队管理', href: '#/teamManager'},
                        {tag: 'renzheng', cur: '', icon: '', name: '认证管理', href: '#/idenManager'},
                        {tag: 'copyright', cur: '', icon: '', name: '版权转让', href: '#/copyright'}
                    ];
                    break;
            }

            //菜单点击
            $scope.barClick = function (bar) {
                if (bar.tag == curTag) {
                    //点击已选中的菜单，发广播
                    $rootScope.$broadcast('bar-repeat-click', bar.tag);
                }
                curTag = bar.tag;
            };

            function path() {
                return $location.path();
            }

            /* for 侧栏菜单*/
            function doSidebarMenu() {
                var hMath = false;
                var sHref, reg;
                var location = path();

                angular.forEach($scope.sidebarList, function (sidebar) {
                    sidebar.cur = '';
                    sidebar.icon = iconPrefix + sidebar.tag;

                    sHref = sidebar.href;
                    if (!sHref) {
                        return;
                    }
                    sHref = sHref.substr(1);
                    if (sHref == location) {
                        sidebar.cur = "cur";
                        sidebar.icon = iconPrefix + sidebar.tag + iconSuffix;
                        curTag = sidebar.tag;
                        hMath = true;
                    }
                });
                if (!hMath) {
                    var bar = $scope.sidebarList[0];

                    for(var k in filter){
                        if(filter.hasOwnProperty(k)){
                            if(location.indexOf(k) == 0){
                                angular.forEach($scope.sidebarList, function (v) {
                                    if (filter[k] == v.tag) {
                                        bar = v;
                                    }
                                });
                                break;
                            }
                        }
                    }

                    bar.cur = 'cur';
                    bar.icon = iconPrefix + bar.tag + iconSuffix;
                }
            }

            doSidebarMenu();

            $rootScope.$on('$locationChangeSuccess', function () {
                doSidebarMenu();
            });
        }]

    }

});
