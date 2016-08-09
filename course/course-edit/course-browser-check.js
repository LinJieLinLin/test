/**
 * Created by Fox2081 on 2015/12/8.
 */
(function (win, doc) {
    //浏览器区分 注意（IE Edge 模式检测不出来）
    var browser = browseCheck();
    var browserName = browser.edition ? browser.edition.split(':')[0] : '';
    var version = browser.edition ?  browser.edition.split(':')[1] : '0.0';
    var isOldBrowser = false;
    if (browserName === 'ie' && +version.split('.')[0] < 10 ) {
        isOldBrowser = true;
    }


    //备案号
    var caseNum = '';
    var domainArr = g_conf.domain || [];
    for(var i = 0; i < domainArr.length; i++){
        if (domainArr[i].domain === location.host) {
            caseNum = domainArr[i].domainNum;
        }
    }

    if (isOldBrowser) {
        var str = '<div id="browser-not-support" style="background: #e2e1e2;height:100%;position: absolute;top:0;left:0;right:0;z-index:999999;">' +
            '<div style="width: 1000px; text-align:center;margin:auto;position:relative">' +
            '<div style="background: url(img/creatingCourse/browser_low.jpg);width:756px;height:520px;margin:auto;padding: 40px 0 20px;"></div>' +
            '<div style="text-align:center;padding: 0 200px;margin-top: 20px;">' +
            '<a href="http://rj.baidu.com/soft/detail/14744.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="img/browser_07.png" alt="">' +
            '<p>谷歌浏览器<br><span style="color: #fe3a20">（强烈推荐）</span></p>' +
            '</a>' +
            '<a href="http://rj.baidu.com/soft/detail/11843.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="img/browser_09.png" alt="">' +
            '<p>火狐浏览器</p>' +
            '</a>' +
            '<a href="http://rj.baidu.com/soft/detail/23357.html" style="display: block; float: left;width: 200px;color:#233344;text-decoration: none;" target="_blank">' +
            '<img src="img/browser_11.png" alt="">' +
            '<p>Internet Explorer 10+</p>' +
            '</a>' +
            '<div style="clear: both;"></div>' +
            '</div>' +
            '<p style="color:#35383b;font-size:16px;padding: 50px 0 20px;">© 2009-2015 广州市大洋信息技术股份有限公司 ' + caseNum + '</p>' +
            '</div>' +
            '</div>';
        doc.querySelector('html').style.display = 'none';
        win.onload = function () {
            doc.querySelector('body').innerHTML = str;
            doc.querySelector('html').style.display = '';
        };
    }
})(window, document);