/**
 * Created by LouGaZen on 2016-06-14.
 * 模块说明：认证机构icon，hover时显示可显示相关信息
 * 需要参数：config: {name: '', img: '', status: FAIL=>认证失败/WAITING=>申请中/NORMAL=>认证成功, reason: ''}
 */

module.directive('orgIden', function () {
    return {
        template:'<div class="org-main"><div class="org-status"><div class="iden-fail" ng-show="config.status == \'FAIL\'"></div><div class="iden-success" ng-show="config.status == \'NORMAL\'"></div></div><!--[if IE 9]><div class="org-view" ng-attr-title="{{compliantReason}}"><![endif]--><!--[if gt IE 9]><div class="org-view"><![endif]--><!--[if !IE]><!--><div class="org-view"><!--<![endif]--><div class="org-pending" ng-show="config.status == \'WAITING\'"><div style="height:15px"></div><div style="line-height:9px">申请中</div></div><img ng-src="{{config.img || \'\'}}" width="40" height="40"></div><div class="org-reason"><span ng-if="config.status == \'FAIL\'"><span ng-bind="config.reason && config.reason.length ? config.reason : \'暂无理由\'"></span> <span class="color-red">（认证失败）</span> </span><span ng-if="config.status == \'NORMAL\'"><span ng-bind="config.reason && config.reason.length ? config.reason : \'\'"></span> <span class="color-green"><span ng-bind="\'（\'" ng-if="config.reason && config.reason.length"></span>已通过<span ng-bind="config.name || \'\'"></span>验证<span ng-bind="\'）\'" ng-if="config.reason && config.reason.length"></span> </span></span><span class="color-cyan" ng-if="config.status == \'WAITING\'">正在申请<span ng-bind="config.name || \'\'"></span>认证</span></div></div>',
        restrict: 'E',
        replace: true,
        scope: {
            config: '=config'//{name: '', img: '', status: FAIL=>认证失败/WAITING=>申请中/NORMAL=>认证成功, reason: ''}
        },
        controller: ['$scope', function ($scope) {
            $scope.compliantReason = '';
            switch ($scope.config.status) {
                case 'FAIL':
                    $scope.compliantReason = ($scope.config.reason && $scope.config.reason.length ? $scope.config.reason : '暂无理由') + '（认证失败）';
                    break;
                case 'WAITING':
                    $scope.compliantReason = '正在申请' + $scope.config.name + '认证';
                    break;
                case 'NORMAL':
                    $scope.compliantReason = ($scope.config.reason && $scope.config.reason.length ? $scope.config.reason : '') + '（已通过' + $scope.config.name + '验证）';
                    break;
                default:
                    break;
            }
        }]
    }
});