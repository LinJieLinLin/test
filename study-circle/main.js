var module = angular.module("RCP", ['ngCookies']);
module.controller('circleDetailCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $('body').show();
    $scope.circleConfig = {
        rUrl: DYCONFIG.studyCircle.rUrl,
        category: '10',
    };
    $scope.circleDetailConfig = {
        rUrl: DYCONFIG.studyCircle.rUrl,
        category: '10',
    };
}]);
