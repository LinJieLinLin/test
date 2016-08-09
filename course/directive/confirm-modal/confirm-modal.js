/**
 * dialog = {
 *      show: 是否显示弹框
 *      title: 弹框标题；默认'温馨提示'
 *      okCb: 确认回调
 *      cancelCb: 取消回调
 *      okBtn: 确认按钮文字；默认'确定'
 *      cancelBtn: 取消按钮文字；默认'取消'
 *      autoClose: 按确认或取消按钮后是否自动关闭弹框
 * }
 */

module.directive('confirmModal', function () {
    return {
        template:'<div class="cm-dialog" ng-show="dialog.show"><div class="bg"></div><div class="frame-dialog"><div class="dialog-title"><span class="title" ng-bind="dialog.title || \'温馨提示\'"></span> <a class="close" ng-click="dialog.show = false;">×</a></div><div class="info" ng-transclude></div><div class="btn"><button class="ok" ng-click="ok()" ng-bind="dialog.okBtn || \'确定\'"></button> <button class="cancel" ng-click="cancel()" ng-bind="dialog.cancelBtn || \'取消\'"></button></div></div></div>',
        restrict: 'E',
        transclude: true,
        scope: {
            dialog: '='
        },
        controller: ['$scope', function ($scope) {
            $scope.dialog = $scope.dialog || {};
            $scope.dialog.autoClose = angular.isUndefined($scope.dialog.autoClose) ? true : $scope.dialog.autoClose;
            
            $scope.ok = function () {
                $scope.dialog.okCb && $scope.dialog.okCb();
                if ($scope.dialog.autoClose) {
                    $scope.dialog.show = false;
                }
            };
            $scope.cancel = function () {
                $scope.dialog.cancelCb && $scope.dialog.cancelCb();
                if ($scope.dialog.autoClose) {
                    $scope.dialog.show = false;
                }
            };
        }]
    }
});