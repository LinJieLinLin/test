module.directive('defaultImg', function () {
    return {
        template:'<div class="default-img"><img class="hide" default="/rcp-common/imgs/icon/gray-default-img.png" ng-src="{{src}}" ng-style="{{conf.style}}" alt="{{alt}}"></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            alt: "=",
            src: "=src",
            conf: "=conf"
        },
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            var conf = $scope.conf || {};
            var img = $element.find('img');
            if (conf.width) {
                $element.width(conf.width);
                img.width(conf.width);
            }
            if (conf.height) {
                $element.height(conf.height);
                img.height(conf.height);
            }
            $scope.$watch('src', function (newValue, oldValue) {
                if(!newValue){
                    img.addClass('hide');
                }else{
                    img.removeClass('hide');
                }
            });
        }]
    }
});