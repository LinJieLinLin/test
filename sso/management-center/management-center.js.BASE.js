/**
 * Created by LouGaZen on 2016-05-06.
 */

var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute',
    'LocalStorageModule'
]);

module.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/member-approval', {
        controller: 'maCtrl',
        templateUrl: 'management-center/member-approval/member-approval.html'
    }).when('/course-approval', {
        controller: 'caCtrl',
        templateUrl: 'management-center/course-approval/course-approval.html'
    }).when('/member-detail/:account', {
        controller: 'mdCtrl',
        templateUrl: 'management-center/member-detail/member-detail.html'
    }).otherwise({
        redirectTo: '/member-approval'
    })
}]);

module.controller('mcCtrl', ['$scope', function ($scope) {   
    var temUrl = rcpAid.queryString('url');
    var regExp = {
        host: /[a-zA-z]+:\/\/[^\s\/]*/
    };
    if (!temUrl) {
        temUrl = DYCONFIG.sso.login;
    }
    $scope.loginUrl = rcpAid.getUrl('登录', {
        url: temUrl
    });
    $scope.exitUrl = rcpAid.getUrl('退出', {
        url: encodeURIComponent(regExp.host.exec(temUrl))
    });
    
    //首页跳转
    $scope.url = {
        'kx': rcpAid.getUrl('酷校'),
        'akx': rcpAid.getUrl('爱科学')
    };

}]);

//switch-tab effect
// $('.tab li:not(.li-head) a').each(function (index) {
//     $(this).click(function () {
//         $('.tab li:not(.li-head)').removeClass('li-active').eq(index).addClass('li-active');
//     });
// });