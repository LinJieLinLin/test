var module = angular.module('RCP', [
    'LocalStorageModule',
    'ngCookies',
    'ngSanitize',
    'ngRoute'
]);

module.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/myCourses', {
            controller: 'myCourseCtrl',
            templateUrl: '../course/module/student-course/student-courses.html'
        })
        .when('/myCircle', {
            controller: 'myCircleCtr',
            templateUrl: '../study-circle/module/my-circle/my-circle.html'
        })
        .when('/myActivity/dynamic/message', {
            // controller: 'messageCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myActivity/dynamic/note', {
            // controller: 'noteController',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myActivity/dynamic', {
            // controller: 'discussCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myActivity/dynamic/discuss', {
            // controller: 'discussCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myActivity/dynamic/qna', {
            // controller: 'qnaCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myKnowledge', {
            // controller: 'knowledgeCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myScore', {
            // controller: 'scoreCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myAccont', {
            // controller: 'accontCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/myEducation', {
            // controller: 'educationCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .otherwise({
            redirectTo: '/myCourses'
        });

}]);


module.controller('studentSpaceCtrl', ['$scope', 'service', '$timeout', function ($scope, service, $timeout) {
    $scope.user = {
        avatar: '../rcp-common/imgs/face/d-face-2.png',   //用户头像
        nickName: 'user',   //用户名
        certification: false,  //是否实名认证
        desc: '天生我才必有用~千金散尽还复来'
    };

    //认证Url
    $scope.certificateUrl = rcpAid.getUrl('实名认证');
    //订单Url TODO:
    $scope.orderUrl = rcpAid.getUrl();

    //加载完个人信息后移除
    function removeLoading() {
        $('.loading').removeClass('loading');
        $('.loading-img').removeClass('loading-img');
        $('.loading-text').removeClass('loading-text');
    }

    /**
     * 登陆后初始化个人信息
     */
    $scope.$on('login', function (rs, data) {
        if (!data) {
            //弹出登陆框
            service.common.toLogin();
            //跳转到登陆页
            // service.common.toLogin(true);
            return;
        }
        var user = $scope.user;
        user.avatar = data.avatar || user.avatar;
        user.nickName = data.nickName || user.nickName;
        user.certification = !!data.certification;
        user.desc = data.desc || user.desc;

        removeLoading();
    });
}]);