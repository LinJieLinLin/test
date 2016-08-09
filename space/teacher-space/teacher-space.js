var module = angular.module('RCP', [
    'LocalStorageModule',
    'ngCookies',
    'ngSanitize',
    'ngRoute'
]);

module.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/coursesManager', {
            controller: 'courseManagerCtrl',
            templateUrl: '../course/module/course-manager/course-manager.html'
        })
        .when('/guideSpace', {
            // controller: 'courseManagerCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/studentManager', {
            // controller: 'courseManagerCtrl',
            templateUrl: '../space/teacher-space/deving.html'
        })
        .when('/scoreManager', {
            controller: 'scoreManagerCtrl',
            templateUrl: '../space/module/score-manager/score-manager.html'
        })
        .when('/paperManager', {
            controller: 'paperManagerCtrl',
            templateUrl: '../course/module/exam-score/exam-score.html'
        })
        .when('/teamManager', {
            controller: 'teamManagerCtr',
            templateUrl: '../course/module/team-manager/team-manager.html'
        })
        .when('/paper-detail/:pid/:cid/:tid',{
            controller: 'pdCtrl',
            templateUrl: '../course/module/paper-detail/paper-detail.html'
        })
        .when('/copyright', {
            controller: 'copyrightCtr',
            templateUrl: '../course/module/copyright/copyright.html'
        })
        .when('/idenManager', {
            // controller: 'idenCtrl',
            // templateUrl: '../course/module/iden-manager/iden-manager.html'
            templateUrl: '../space/teacher-space/deving.html'
        })
        .otherwise({
            redirectTo: '/coursesManager'
        });
}]);

module.controller('teacherSpaceCtrl', ['$scope', 'service', '$timeout', function ($scope, service, $timeout) {
    $scope.user = {
        avatar: '../rcp-common/imgs/face/d-face-1.png',   //用户头像
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