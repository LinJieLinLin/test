var module = angular.module('RCP', []);

module.controller('demo', ['$scope', '$timeout', function($scope, $timeout) {
    // $scope.url = 'http://desk.fd.zol-img.com.cn/g5/M00/06/09/ChMkJlZXyQaINcC2AAVVnB_zn0UAAFZmQHGdkQABVW0053.jpg';

    $scope.url = 'images/test/test.jpg';
    $scope.style = {
        width: '500px'
    };

    $scope.config = {
        ratioScaling: true,
        position: 'static',
        minw: 100,
        minh: 100,
        mouseup: function (){
            console.log('mouseup');
        }
    };

    $scope.reload = function (){
        $scope.config.init();
    };
}]);
