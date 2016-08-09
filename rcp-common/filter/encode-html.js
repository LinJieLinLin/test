/**
 * Created by ph2 on 2016/7/20.
 * 转义 html 实体
 */

angular.module('RCP').filter('encodeHtml', function () {
    console.log('encodeHtml...');

    // ps: 对 & 的转义要在其他字符转义之前
    var replace = [
        '&', '&amp;',
        '\'', '&#39;',
        '"', '&quot;',
        ' ', '&nbsp;',
        '<', '&lt;',
        '>', '&gt;',
        '¥', '&yen;'
    ];
    var regExp = [];
    for (var i = 0, il = replace.length; i < il; i += 2) {
        regExp[i] = new RegExp(replace[i], 'g');
    }
    var encodeHtmlEntity = function (str) {
        for (var i = 0, il = replace.length; i < il; i += 2) {
            str = str.replace(regExp[i], replace[i+1])
        }
        return str;
    };

    return function (text) {
        return text ? encodeHtmlEntity(text) : '';
    };
});
