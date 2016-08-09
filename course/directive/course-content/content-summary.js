/**
 * Created by Fox2081 on 2016/6/15.
 */

var picList = [];

module.directive('contentSummary', function () {
    return {
        restrict: 'E',
        template:'<div class="intro-ctrl"><div class="intro-loading" ng-show="loading"><loader-ui></loader-ui></div><div class="intro-main" ng-show="!loading" ng-bind-html="intro" ng-class="{less: lessIntro}"></div><div ng-show="longIntro && config.less" class="more-btn"><a href="" class="more-intro-btn" ng-click="lessIntro = false" ng-show="lessIntro"><img src="/rcp-common/imgs/icon/more-btn.png" alt=""></a><a href="" class="more-intro-btn" ng-click="lessIntro = true" ng-show="!lessIntro"><img src="/rcp-common/imgs/icon/less-btn.png" alt=""></a></div><div class="intro-empty ng-cloak" ng-show="emptyIntro">暂无课程介绍</div></div>',
        replace: "true",
        scope: {
            config: '='
        },
        controller: ['$scope', '$sce', '$element', '$timeout', function ($scope, $sce, $element, $timeout) {


            $scope.loading = true;
            
            if ($scope.config) {
                $scope.config.scope = $scope;
            }

            $scope.init = function () {
                if (!$scope.config.content || !$scope.config.content.length) {
                    $scope.loading = false;
                    $scope.emptyIntro = true;
                    return;   
                }

                var html = '';
                
                angular.forEach($scope.config.content, function (item, key) {
                    if (item.t === 'T1') {
                        html += '<div class="title">' + item.c.title + '</div>';
                    }
                    if (item.t === 'image') {

                        var styleStr = '';
                        if (item.c.style && item.c.style.width) {
                            styleStr += ('width: ' +  item.c.style.width + 'px;');
                        }

                        if (item.c.pubUrl) {
                            html += '<div class="img"><img src="' + item.c.pubUrl + '" alt="" onclick="androidPic(this.src)" style="' + styleStr + '"></div>';
                            picList.push(item.c.pubUrl);
                        }
                    }
                    if (item.t === 'text') {
                        html += '<div class="content">' + item.c.c + '</div>';
                    }
                });
                
                $scope.loading = false;

                if (html) {
                    $scope.intro = $sce.trustAsHtml(html);
                    $timeout(function () {
                        if ($scope.config.less) {
                            var height = $($element.find('.intro-main')).height();
                            $scope.lessIntro = height > 345;
                            $scope.longIntro = $scope.lessIntro;
                        }
                    });
                } else {
                    $scope.emptyIntro = true;
                }
            };
        }]
    }
});

function androidPic(src) {
    console.log(picList,src);
    window.byValue.byValue(picList.join(','),src);
}

