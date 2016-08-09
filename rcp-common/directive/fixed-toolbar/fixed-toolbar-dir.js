/**
 * Created by FENGSB on 2015/8/24.
 */

module.directive("fixedToolbar",function(){
    return {
        template:'<div ng-class="\'fixed-toolbar \'+param.style"><div class="grid tab-top" title="回到顶部" onclick=\'$("html,body").stop().animate({scrollTop:0},"fast")\'><i class="ic"></i></div><div class="grid d-app"><i class="ic"></i><p class="font">App 下载</p><div ng-class="panelAmit ? \'panel panel-amit\' : \'panel\'"><div class="inner"><div class="img"><img ng-src="{{data.qr.src}}" width="122" height="122" rel="download_kuxiao_app_qr_code"></div><p>{{data.qr.name}}</p></div></div></div></div>',
        restrict:"E",
        replace: true,
        transclude: true,
        scope:{
            data:"=data"
        },
        controller:['$scope', '$rootScope', '$timeout', function($scope,$rootScope,$timeout){
            function handler(){
                var elem = $('.tab-top');
                var top = $(window).scrollTop();
                if(top>300){
                    elem.addClass('visible');
                }else{
                    elem.removeClass('visible');
                }
            }
            handler();
            $(window).bind('scroll',handler);
            $(window).bind('resize',handler);

            $scope.param = {};

            $scope.init = function (type){
                switch(type){
                    case 2:
                        $scope.param.style = 'aikexue-fixed-toolber';
                        break;
                }
            };

            $scope.init(rcpAid.getCourseCat());

            $rootScope.$watch('catDomain',function (value){
                if(value){
                    switch(value){
                        case 'aikexue.com':
                            $scope.init(2);
                            break;
                    }
                }
            });

            $timeout(function (){
                $scope.panelAmit = true;
            },300);
        }]
    };
});