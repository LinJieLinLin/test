module.directive('interestSelect', function () {
    return {
        template:'<div class="interest-select"><style type="text/css">.interest-select .con{display:inline-block;width:85px;height:30px;line-height:30px;text-align:center}.interest-select .add,.interest-select .hobby{font-size:14px}.interest-select .hobby{border:1px solid #02c0b9;color:#02c0b9}.interest-select .add{cursor:pointer;border:1px solid #e5e5e5;color:#e5e5e5}.interest-select .m-l{margin-left:22px}</style><span class="con hobby" ng-repeat="hobby in hobbys track by $index" ng-bind="hobby" ng-class="{\'m-l\': $index > 0}"></span> <span class="con add" ng-class="{\'m-l\': hobbys.length}">+ 添加</span></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            hobbys: '='
        },
        controller: ['$scope', function ($scope) {
            console.log('hobbys ', $scope.hobbys);
        }]
    }
});