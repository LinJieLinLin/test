/**
 * edited by guyl on 2016/2/16.
 */
module.directive('sidebar',function(){

    return {

        restrict: 'E',
        template:'<div class="sidebar"><ul><li ng-class="sidebar.cur" ng-repeat="sidebar in sidebarList"><i ng-class="sidebar.icon"></i> <a ng-href="{{sidebar.href}}" ng-click="SetCur(sidebar)">{{sidebar.name}}</a></li></ul></div>',
        replace:"true",
        scope:{
        },
        controller:['$scope', '$element', '$attrs', '$location', '$rootScope', '$timeout', function($scope,$element,$attrs,$location,$rootScope,$timeout){

            switch ($attrs.sidebarType){

                case "student":
                    $scope.sidebarList = [
                        // {"cur":"","icon":"cat-0","name":"首页","href":"#/home"},
                        {"cur":"","icon":"cat-2","name":"我的课程","href":"#/myCourses"},
                        {"cur":"","icon":"cat-3","name":"我的题库","href":"#/myQuestionPool"},
                        {"cur":"","icon":"cat-7","name":"我的圈子", "href": "#/myActivity/dynamic"},
                        {"cur":"","icon":"cat-5","name":"学习风格", "href": "#/myKnowledge"},
                        // {"cur":"","icon":"cat-1","name":"学习计划", "href": "#/myPlan"},
                        // {"cur":"","icon":"cat-4","name":"留言板", "href": "#/myComment"},
                        // {"cur":"","icon":"cat-6","name":"学习成果","href":"#/myActivityResult"},
                        // {"cur":"","icon":"cat-16","name":"作业", "href": "#/hehavior"},
                        // {"cur":"","icon":"cat-8","name":"通知", "href": "#/messageBoard"},
                        {"cur":"","icon":"cat-11","name":"我的学分", "href": "#/myScore"},
                        {"cur":"","icon":"cat-11","name":"账号信息", "href": "#/myAccont"},
                        {"cur":"","icon":"cat-11","name":"教育信息", "href": "#/myEdu"},
                        // {"cur":"","icon":"cat-17","name":"我的订单", "href": "my-order.html"}
                    ];
                    break;
                case "teacher":
                    $scope.sidebarList = [
                        {"cur":"cur","icon":"cat-7","name":"课程管理"},
                        {"cur":"","icon":"cat-13","name":"权限管理"},
                        {"cur":"","icon":"cat-4","name":"学生管理"},
                        {"cur":"","icon":"cat-8","name":"成绩管理"},
                        {"cur":"","icon":"cat-9","name":"试卷批改"},
                        {"cur":"","icon":"cat-6","name":"账号信息"}
                    ];
                    break;

            }

            $scope.SetCur = function(sidebar){

                angular.forEach($scope.sidebarList,function(sidebar){
                    sidebar.cur = "";
                });

                sidebar.cur = "cur";

                //判断是否原地刷新
                var hashTmp = window.location.hash;
                $timeout(function(){
                    if(hashTmp == window.location.hash){
                        $scope.$emit('refListSidebar',window.location.hash);
                    }
                })

            };

            /* for 侧栏菜单*/
            function doSidebarMenu() {

                var sLocation = decodeURI(window.location);

                angular.forEach($scope.sidebarList,function(sidebar){
                    var sHref = sidebar.href;
                    if(!sHref){
                        return;
                    }
                    sHref = sHref.substr(2);
                    var reg = new RegExp('#\/' + sHref, '');
                    if (sLocation.match(reg)) {
                        sidebar.cur="cur";
                    }else{
                        sidebar.cur="";
                    }

                });
                if(sLocation.substr(-2)=="#/"){
                    $scope.sidebarList[0].cur = "cur";
                }

            }

            doSidebarMenu();

            $rootScope.$on('$locationChangeSuccess', function(){
                doSidebarMenu();
            });
        }]

    }

});