/**
 * Created by LouGaZen on 2016-05-20.
 * 模块说明：我要吐槽主体
 */

var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute'
])

    .filter("sanitize", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
    }])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/all-discuss', {
            controller: 'allDiscussCtrl',
            templateUrl: 'discuss-page/all-discuss/all-discuss.html'
        }).when('/my-discuss', {
            controller: 'myDiscussCtrl',
            templateUrl: 'discuss-page/my-discuss/my-discuss.html'
        }).otherwise({
            redirectTo: '/all-discuss'
        })
    }])

    .controller('dpCtrl', ['$scope', 'discussMethod', 'dialog', function ($scope, discussMethod, dialog) {
        $scope.problemList = [];

        function convertData(arg_data){
            var _arr = [];
            arg_data.forEach(function (element) {
                _arr.push({
                    id: element._id || '',
                    title: element.root.content || ''
                })
            });
            return _arr;
        }

        discussMethod.SuggestPage({
            key: 'common'
        }).then(function (data) {
            $scope.problemList = convertData(data.data.common.discuss || []);
            console.log($scope.problemList);
        }, function (err) {
            console.log(err);
            // dialog.alert('获取常见问题错误，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip('', '', '', err);
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽',
                funcName: 'SuggestPage',
                text: '获取常见问题错误'
            });
        });

        $scope.getDiscussUrl = function (arg_id) {
            return rcpAid.getUrl('吐槽帖子详情', {
                did: arg_id
            });
        };
    }]);