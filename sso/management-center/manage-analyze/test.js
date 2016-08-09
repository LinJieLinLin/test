module.controller('testCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.hi = "hi";
    //上传配置
    $scope.uploadConfig = {
        showEdit: false,
        uploadNum: 0, //上传图片位置
        upCancel: false, //是否取消上传
        id: 'idcard', //上传input ID
        width: 400,
        ratio: [16, 9],
        containerStyle: { width: '480px', height: '310px' },
        mode: 'fixed', //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面 inline
        scope: null, //返回$scope
        cb: function(data) {}
    };
    $scope.uploadIdCard = function() {
        $scope.uploadConfig.cb = function(data) {};
        $timeout(function() {
            if ($scope.uploadConfig.scope) {
                $scope.uploadConfig.scope.selectImg();
            }
        });
    };
}]);
