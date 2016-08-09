/**
 * Created by Fox2081 on 2016/6/28.
 */
/**
 * config:
 * maxWidth:有值时设置头部的宽度
 * hideBanner:默认不传，true时隐藏Banner
 * pageInfo:[]banner显示的信息
 */
module.directive('headTailSso', function() {
    return {
        template:'<div><div class="head-nav-sso"><div class="sso-w" ng-class="config.extClass"><div class="head-nav-left"><div ng-repeat="sys in childSys track by $index"><a ng-href="{{sys.url}}"><i ng-class="sys.cM"></i> <span ng-bind="sys.name"></span> <span ng-if="!$last" class="seq">|</span></a></div></div><div ng-hide="isIndex"><div class="head-nav-right" ng-show="!userData.nickName"><span class="f">已有账号，</span> <a ng-href="{{loginUrl}}">马上登录</a></div><div class="head-nav-right" ng-show="userData.nickName"><span class="f">你好，</span> <span class="f" ng-bind="userData.nickName + \'，\'"></span> <a ng-click="logout();">马上退出</a></div></div></div></div><div ng-hide="hideBanner" class="head-nav-item"><div class="sso-w" ng-class="config.extClass"><div class="pos-l"><span ng-repeat="info in pageInfo track by $index" ng-bind="info"></span></div><div class="pos-r"><div ng-repeat="sys in childSys track by $index"><a href="" ng-href="{{sys.url}}"><i ng-class="sys.c"></i><div><span ng-bind="sys.name"></span> <span ng-bind="sys.desc"></span></div></a><span ng-hide="$last" class="seq"></span></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            config: '=',
            userData: '='
        },
        controller: ['$scope', 'service', function($scope, service) {
            var temUrl = rcpAid.queryString('url');
            var regExp = {
                host: /[a-zA-z]+:\/\/[^\s\/]*/
            };

            function init() {
                if ($scope.config) {
                    angular.forEach($scope.config, function(v, k) {
                        $scope[k] = v;
                    });
                }
                if (!temUrl) {
                    temUrl = DYCONFIG.sso.login;
                } else {
                    temUrl = regExp.host.exec(temUrl);
                }
                $scope.loginUrl = rcpAid.getUrl('登录', {
                    url: temUrl
                });
                
                $scope.isIndex = location.pathname === '/sso/index.html' || location.pathname === '/sso/';
                
                //子平台连接
                $scope.childSys = [{
                    name: '酷校首页',
                    desc: 'kuxiao.cn',
                    url: rcpAid.getUrl('酷校'),
                    c:'image-sso-logo-kx',
                    cM:'image-sso-h-kx',
                },{
                    name: '酷校·高校版',
                    desc: 'gzmooc.cn',
                    url: rcpAid.getUrl('酷校高校版'),
                    c:'image-sso-logo-kx',
                    cM:'image-sso-h-kx',
                }, {
                    name: '爱科学首页',
                    desc: 'aikexue.com',
                    url: rcpAid.getUrl('爱科学'),
                    c:'image-sso-logo-akx',
                    cM:'image-sso-h-akx',
                }];
            }
            /**
             * 退出
             * @return {[type]} [description]
             */
            $scope.logout = function() {
                location.href = rcpAid.getUrl('退出', {
                    url: encodeURIComponent(temUrl)
                });
            };
            init();
        }]
    };
});
