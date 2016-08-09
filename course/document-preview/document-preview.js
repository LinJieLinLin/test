/**
 * Created by Fox2081 on 2016/5/17.
 */

'use strict';

var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);

module.controller('viewCtrl', ['$rootScope', '$scope', 'service', function ($rootScope, $scope, service) {



    $scope.cid = rcpAid.queryString('cid');
    $scope.fid = rcpAid.queryString('fid');
    $scope.mark = rcpAid.queryString('mark');
    $scope.type = rcpAid.queryString('type');
    $scope.count = rcpAid.queryString('count');

    //配置
    $scope.config = {
        full: "false",
        zoom: 1
    };
    
    $scope.args = {
        cid: $scope.cid,
        fid: $scope.fid,
        mark: $scope.mark,
        type: $scope.type,
        count: $scope.count,
    };



    $scope.$on('login',function(re,data){
        if(data){
            $scope.logined = true;
            return;
        }
        $scope.logined = false;
    });




}]);