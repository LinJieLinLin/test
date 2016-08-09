if (!module) {
    var module = angular.module('RCP', []);
}
module.directive('footerSso', function() {
    return {
        template:'<footer id="footer"><style type="text/css">.footer-view{color:#c9c9c9;padding:50px 0;text-align:center;font-size:14px}.footer-view a{color:#c9c9c9;margin:0 10px}.footer-view div:first-child{margin-bottom:3px}</style><div class="footer-view"><div><a href="http://www.itdayang.com/about.html" target="_blank">关于我们</a> <span>|</span> <a href="http://www.itdayang.com/contact.html" target="_blank">联系我们</a> <span>|</span> <a ng-click="createing()">法律条款</a> <span>|</span> <a ng-click="createing()">帮助中心</a> <span>|</span> <a ng-click="createing()">意见反馈</a> <span>|</span></div><div>©2009-{{year}} 广州市大洋信息技术股份有限公司 {{bSn}}</div></div></footer>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            a: '='
        },
        controller: ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
            $scope.bSn = '粤ICP备05139291号-4';
            $scope.year = new Date().getFullYear();

            $scope.createing = function() {
                try {
                    binApp.alert("<span class='h4'>正在建设中...</span>", {
                        action: "top"
                    });
                } catch (e) {}
            };
        }]
    };
});
/**
 * [fixed-footer 修复底部栏不置底]
 * @return {[type]} [description]
 */
(function() {
    if (window.fixedFooterFlag) {
        return;
    } else {
        window.fixedFooterFlag = true;
    }
    var css = function(e, p) {
            for (k in p) {
                e.style[k] = p[k];
            }
        },
        memoryStatus = 0,
        status = 1;

    function run() {
        var o = document.getElementById("footer1");
        if (o) {
            var s = document.documentElement.scrollHeight - 1 || document.body.scrollHeight - 1,
                h = document.documentElement.clientHeight || document.body.clientHeight;
            status = s <= h ? 1 : 2;
            if (status !== memoryStatus) {
                if (s <= h) {
                    css(o.parentNode, {
                        height: o.offsetHeight + "px"
                    });
                    css(o, {
                        position: "absolute",
                        width: "100%",
                        bottom: 0,
                        left: 0
                    });
                } else {
                    css(o.parentNode, {
                        height: o.offsetHeight + "px"
                    });
                    css(o, {
                        position: "",
                        width: "100%",
                        bottom: 0,
                        left: 0
                    });
                }
            }
            memoryStatus = s <= h ? 1 : 2;
        }
        setTimeout(run);
    }

    run();
}());
