module.directive("headSelector", function () {
    return {
        template:'<div class="head-selector"><style type="text/css">.head-selector{display:inline-block;position:relative;text-align:center;cursor:pointer}.head-selector>span>i.fa{margin-left:7px}.head-selector .hs-options{position:absolute;border:1px solid #f7f7f7;background:#fff;z-index:10}.head-selector .hs-options>li{width:98px;line-height:30px;cursor:pointer}.head-selector .hs-options .hover-bg:hover{background:#fcf8e8}.head-selector .hs-options .active{background:#02c0b9;color:#fff}</style><span ng-click="toggle();">{{content}}<i class="fa fa-caret-down" aria-hidden="true" ng-class="{\'fa-caret-down\': !showOptions, \'fa-caret-up\': showOptions}"></i></span><ul class="hs-options" ng-show="showOptions"><li ng-repeat="option in options" ng-click="setValue(option, $index);" ng-class="{\'active\': curSelectIndex == $index, \'hover-bg\': curSelectIndex != $index}">{{option.name}}</li></ul></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            content: '=',
            config: '='
        },
        controller: ['$scope', '$timeout', function ($scope, $timeout) {
            var config = $scope.config || {};
            $scope.options = config.options || [];
            $scope.autoClose = angular.isUndefined(config.autoClose) ? true : config.autoClose;
            $scope.changeCb = config.changeCb;

            $scope.showOptions = false;
            $scope.curSelectIndex = 0;

            $scope.config && ($scope.config.setSelect = function (index) {
                $scope.curSelectIndex = index;
            });

            $scope.setValue = function (optoin, index) {
                if ($scope.curSelectIndex === index) {
                    return;
                }
                $scope.changeCb && $timeout(function () {
                    $scope.changeCb(optoin)
                });
                $scope.curSelectIndex = index;
                $scope.toggle();
            };

            $scope.toggle = function () {
                $scope.showOptions = !$scope.showOptions;
                if ($scope.showOptions && $scope.autoClose) {
                    $(document).on('click', closeFn);
                } else if ($scope.autoClose) {
                    $(document).off('click', closeFn)
                }
            };

            var closeFn;
            $scope.autoClose && (closeFn = function (e) {
                var con = $('.head-selector');
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $timeout(function () {
                        $scope.showOptions = false;
                    });
                    $(document).off('click', closeFn)
                }
            });
        }],
        link: function ($scope, $element) {
            var ul = $element.find('.hs-options');
            //100 是 ul的宽度
            ul.css('left', ($element.width() - 100) / 2);
            // ul.css('display', 'block');
        }
    }
});