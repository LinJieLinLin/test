/**
 * Created by Fox2081 on 2016/6/23.
 */
module.directive('selectOrg', function () {
    return {
        template:'<div class="select-org"><div class="org-list"><label class="org-g" for="name-{{$index}}" ng-repeat="tag in list track by $index"><input type="checkbox" id="name-{{$index}}" ng-model="tag.select"> <span class="o-name" title="">{{tag.name}}</span></label></div><div class="org-btn"><a href="" class="confirm" ng-click="confirm()">确定</a> <a href="" class="cancel" ng-click="cancel()">取消</a></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            config: '=',
            list: '='
        },
        controller: ['$scope', function ($scope) {

            $scope.cancel = function () {
                $scope.config.cur = '';
            };

            $scope.confirm = function () {
                var selected = [];
                angular.forEach($scope.list, function (value, key) {
                    if (value.select) {
                        selected.push(value.name);
                    }
                });
                $scope.config.cb(selected);
                $scope.cancel();
            };
        }]
    }
});