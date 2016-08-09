/**
 * Created by Fox2081 on 2016/5/17.
 */

module.directive("filePreview", function () {
    return {
        template:'<div class="list-main" id="list-main"><div class="view-paper" ng-repeat="paper in paperList" id="{{$index}}"><div class="view-full"><a href="" ng-click="fullScreen()"><i class="image-preview-fullscreen"></i></a></div><img class="view-content" ng-src="{{paper.url}}" default="/course/imgs/preview-err.png" width="100%"></div><div class="view-foot"><div class="foot-tool-bar"><div class="tool-page"><a href="" ng-click="prePage()"><i class="image-preview-prev"></i></a> <input type="text" ng-model="pageTgt" ng-blur="goToPage(pageTgt)" ng-keydown="goToPageKeyDown($event, pageTgt)"> <span>/{{totalPage}}</span> <a href="" ng-click="nextPage()"><i class="image-preview-next"></i></a></div><div class="tool-list"><a href="" ng-click="zoomIn()"><i class="image-preview-scale-1"></i></a> <a href="" ng-click="zoomOut()"><i class="image-preview-scale-2"></i></a> <a href="" ng-click="fullScreen()"><i class="image-preview-fullscreen"></i></a></div></div></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            config: '=',
            args: '='
        },
        controller: ['$rootScope', '$scope', '$timeout', 'service', function ($rootScope, $scope, $timeout, service) {


            var config = $scope.config;
            var args = $scope.args;


            var idStr = '';

            if (args.fid) {
                idStr = 'fid=' + args.fid;
            } else if (args.mark) {
                idStr = 'mark=' + args.mark;
            }


            $scope.paperList = [];
            $scope.totalPage = args.count || 1;

            $scope.pageTgt = null;

            for (var i = 0; i < args.count; i++) {
                var url = DYCONFIG.fs.down + '?' + idStr + '&type=' + args.type + '&idx=' + i + '&token=' + rcpAid.getToken();

                $scope.paperList.push({
                    url: url
                });
            }

            $timeout(function () {
                $scope.curPage = window.location.hash.replace('#', '') || 1;
                $('body').scrollTo('#' + ($scope.curPage - 1), 200);
            },500);


            $(window).scroll(function (){

                var timer;

                function handler() {
                    var range = $(document).height()-$(window).height();
                    $scope.$apply(function(){
                        var num = Math.ceil($(window).scrollTop()/$(".view-paper").height());
                        if(num!=0){
                            $scope.curPage = num;
                        }
                    });
                }


                function callback() {
                    $timeout.cancel(timer);
                    timer = $timeout(handler, 200);
                }
                callback();
            });


            var key = $rootScope.currentUser.uid + '_' + args.cid + '_' + args.mark;


            /**
             * 学习痕迹
             * @param argPage
             * @param key
             */
            $scope.setViewPage = function(argPage, key) {
                if (!key) {
                    return;
                }
                var data = [{
                    key: key,
                    val: argPage || 0,
                }];
                service.course.upsertStore({ param: angular.toJson(data) }, {option: {'loading': false}}).then(function(rs) {

                }, function(e) {
                    service.dialog.alert('记录数据失败，请稍候重试！错误代码：' + e.data.data.code + ': ' + e.data.data.dmsg);
                    console.log(e);
                });
            };


            $scope.$watch('curPage',function (n, o) {
                if (n != o) {
                    $scope.pageTgt = $scope.curPage;
                    $scope.setViewPage($scope.curPage, key);
                }
            });

            //全屏
            $scope.fullScreen = function () {
                if (config.full) {
                    $(".view-paper").width($(window).width() - 20);
                    $(".view-content").width($(window).width() - 20);
                } else {
                    $(".view-paper").width(1000);
                    $(".view-content").width(1000);
                }
                config.full = !config.full;
            };


            //放大
            $scope.zoomIn = function () {
                var divWidth = (config.zoom + 0.1) * 1000;
                var imgWidth = (config.zoom + 0.1) * 1000;
                if (divWidth >= $(window).width() - 20) {
                    $(".view-paper").width($(window).width() - 20);
                    $(".view-content").width($(window).width() - 20);
                } else {
                    $(".view-paper").width(divWidth);
                    $(".view-content").width(imgWidth);
                    config.zoom += 0.1;
                }
            };

            //缩小
            $scope.zoomOut = function () {
                var divWidth = (config.zoom - 0.1) * 1000;
                var imgWidth = (config.zoom - 0.1) * 1000;
                if (divWidth <= 1000) {
                    $(".view-paper").width(1000);
                    $(".view-content").width(1000);
                } else {
                    $(".view-paper").width(divWidth);
                    $(".view-content").width(imgWidth);
                    config.zoom -= 0.1;
                }
            };

            //跳页
            $scope.goToPage = function (page) {

                page = Number(page);

                if (page == $scope.curPage) {
                    return;
                }

                if (page > $scope.totalPage) {
                    $scope.curPage = $scope.totalPage;
                } else if (page < 1) {
                    $scope.curPage = 1;
                } else {
                    $scope.curPage = page;
                }
                $timeout(function () {
                    $('body').scrollTo('#' + ($scope.curPage - 1), 200);
                    window.location.hash = $scope.curPage;
                });
            };

            $scope.goToPageKeyDown = function (event, page) {
                if (event.keyCode === 13) {
                    $scope.goToPage(page);
                }
            };

            //下一页
            $scope.nextPage = function () {
                $scope.goToPage($scope.curPage+1);
            };
            //上一页
            $scope.prePage = function () {
                $scope.goToPage($scope.curPage-1);
            };

        }]
    };
});