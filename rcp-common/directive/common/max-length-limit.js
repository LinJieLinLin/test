/**
 * max-length-limit directive
 * 限制 ng-model 字符串的长度
 * Created by ph2 on 2016/8/1.
 */

module.directive('maxLengthLimit', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var maxLength = Number(attrs.maxLengthLimit);

            ngModelCtrl.$parsers.push(function (text) {
                // console.log('[directive-maxLengthLimit]: source', text, ' len:', text.length);

                if (text.length > maxLength) {
                    var newStr = text.substr(0, maxLength);
                    ngModelCtrl.$setViewValue(newStr);
                    ngModelCtrl.$render();
                    return newStr;
                }
                return text;
            });
        }
    }
});
