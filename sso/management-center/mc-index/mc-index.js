/**
 * Created by LouGaZen on 2016-06-24.
 */

module.controller('mcIndexCtrl', ['$scope', '$rootScope', '$timeout', 'dialog', function ($scope, $rootScope, $timeout, dialog) {
    console.log($rootScope.currentUser, 'aaaaaa');
    $timeout(function () {
        if ($rootScope.currentUser.role != '') {
            window.location = rcpAid.getUrl('管理中心') + '#/member-approval';
        } else if ($rootScope.currentUser.org != '') {
            window.location = rcpAid.getUrl('管理中心') + '#/course-identify';
        } else {
            dialog.alert('请登陆有效的管理员账号');
        }
    });
}]);