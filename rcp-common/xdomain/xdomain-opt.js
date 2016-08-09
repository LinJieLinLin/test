/**
 * Created by Fox2081 on 2016/6/29.
 */

var list = ['course', 'sso', 'studyCircle', 'fs', 'pes', 'rcp', 'ars', 'appraise','extra'];
var obj = {};
for (var i = 0; i < list.length; i++) {
    if (!DYCONFIG.srvList[list[i]]) {continue;}
    var url = DYCONFIG.srvList[list[i]];
    var arr = url.split('://');
    var url = arr[1] || arr[0];
    url = url.split('/')[0];
    url = window.location.protocol + '//' + url;
    obj[url] = '/proxy.html';
}
xdomain.slaves(obj);