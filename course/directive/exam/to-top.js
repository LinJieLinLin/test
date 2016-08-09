angular.module('RCP')
    .directive('toTop', function () {
        return {
            restrict: 'E',
            template:'<style>.to-top{position:fixed;bottom:105px;left:50%;margin-left:610px}.top-wrapper{cursor:pointer;width:28px;height:28px;background:url(img/7_01.png) no-repeat center}.top-wrapper:hover{background-image:url(img/7_05.png)}</style><div class="to-top" ng-show="showToTop"><div class="top-wrapper" ng-click="scrollToTop()"></div></div>',
            controller: ['$scope', function ($scope) {
                $(window).scroll(function(){
                    var scrollAmount = $(document).scrollTop();
                    if (scrollAmount > 300) {
                        $scope.showToTop = true;
                    } else {
                        $scope.showToTop = false;
                    }
                    $scope.$apply();
                });
                $scope.scrollToTop = function () {
                    $('body,html').animate({scrollTop: 0}, 'slow');
                };
            }]
        };
    });