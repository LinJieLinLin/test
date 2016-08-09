/**
 * Created by FENGSB on 2015/11/16.
 */

//@ 课程内容展示工厂
module.factory('cvfa', ['$rootScope', '$timeout', '$http', '$q', 'service', function($rootScope, $timeout, $http, $q, service) {
    //移动端相关start
    function mobileClickVideo(src, type) {
        var match = /(\.\w*)$|(\.\w*?)\?|(\.\w*?)\#/.exec(src || '') || [];
        var hz = match[1] || match[2] || match[3];
        if (!src) {
            alert('抱歉，视频地址不能播放  src="' + src + '"');
            return;
        }
        if (hz && (/\.swf$/.test(hz) || /\.swf\?/.test(hz)) || /\.swf/.test(src)) {
            alert('您的手机不支持swf文件，请使用网页观看');
            return;
        }
        switch (type) {
            case 'embed':
                mobilePlug({
                    link: src,
                    type: 0
                }, 'link');
                return;
            case 'flash':
                alert('您的手机不支持swf文件，请使用网页观看');
                return;
            default:
                break;
        }
        mobilePlug({
            src: src
        }, 'video');
    }

    function mobileClickImage(src) {
        mobilePlug({
            src: src
        }, 'photo');
    }
    /**
     * 文件预览
     * @param  {[type]} list [description]
     * @return {[type]}      [description]
     */
    function mobileClickPhotoDoc(argData) {
        mobilePlug({
            data: argData
        }, 'photoDoc');
    }

    function mobileClickLink(href) {
        var src = href;
        var match = /(\.\w*)$|(\.\w*?)\?|(\.\w*?)\#/.exec(src || '') || [];
        var hz = match[1] || match[2] || match[3];
        if (hz && (/\.swf$/.test(hz) || /\.swf\?/.test(hz))) {
            alert('您的手机不支持swf文件，请使用网页观看');
            return;
        }
        mobilePlug({
            link: href
        }, 'link');
    }
    /**
     * [mobilePlug 判断android或ios手机并触发相关事件]
     * @param  {[type]} params [description]
     * @param  {[type]} type   [description]
     * @return {[type]}        [description]
     */
    function mobilePlug(params, type) {
        var os = rcpAid.detectOS().name;
        switch (os) {
            case 'iPad':
            case 'iPhone':
                iphoneEvent(params, type);
                break;
            default:
                androidEvent(params, type);
        }
    }
    /**
     * [iphoneEvent ios事件]
     * @param  {[type]} params [description]
     * @param  {[type]} type   [description]
     * @return {[type]}        [description]
     */
    function iphoneEvent(params, type) {
        switch (type) {
            case 'video':
                window.webkit.messageHandlers.notification.postMessage({
                    video: params.src
                });
                break;
            case 'photo':
                window.webkit.messageHandlers.notification.postMessage({
                    photo: params.src
                });
                break;
            case 'photoDoc':
                window.webkit.messageHandlers.notification.postMessage({
                    photoDoc: {
                        url: params.data.url,
                        count: params.data.count,
                        name: params.data.name,
                        nowCount: params.data.nowCount
                    },
                });
                break;
            case 'link':
                window.webkit.messageHandlers.notification.postMessage({
                    link: params.link
                });
                break;
            case 'paper':
                window.webkit.messageHandlers.notification.postMessage({
                    /*
                    pid: 试卷id,
                    title: 试卷标题,
                    eid: 上一次考试id,
                    tid: 考试id,
                    status: 100开始做题，继续做题 ,200正在批改,300已批改未发布,400查看解析,500重做,
                    type: 练习 传1，试卷 2，考试 3,
                    redo: status400时传true代表查看解析时能再做一次,
                    preview: true预览
                     */
                    paper: {
                        pid: params.pid,
                        title: params.title,
                        eid: params.eid,
                        tid: params.tid,
                        status: params.status,
                        type: params.type,
                        redo: params.redo,
                        preview: params.preview,
                    }
                });
                break;
        }
        // alert("研发中，请在网页端使用此功能");
    }
    /**
     * [androidEvent 安卓事件]
     * @param  {[type]} params [description]
     * @param  {[type]} type   [description]
     * @return {[type]}        [description]
     */
    function androidEvent(params, type) {
        var androidFunc = rcpAid.detectOS().isCrosswalk ? NativeJsInterface : window.NativeJsInterface;
        switch (type) {
            case 'video':
                androidFunc.clickVideo(params.src);
                break;
            case 'photo':
                androidFunc.clickOnePhoto(params.src);
                break;
            case 'photoDoc':
                androidFunc.clickPhotoDoc(params.data.url, params.data.count, params.data.name, params.data.nowCount);
                break;
            case 'link':
                androidFunc.clickLink(params.link, matchLinkType(params.link, 'h5') ? 1 : 0);
                break;
            case 'paper':
                androidFunc.clickPaper(params.pid, params.title, params.eid, params.tid, params.status, params.type, params.redo, params.preview);
                break;
        }
    }
    //移动端相关end
    //判断link参数
    function matchLinkType(str, name) {

        var result = str.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

        if (result == null || result.length < 0) {
            return '';
        }

        return decodeURIComponent(result[1]);
    }

    function getPPtImgLen(detail) {
        var len = 0;
        $(detail.Exts).each(function(i, item) {
            if (item.F_key === 'MSG') {
                len = JSON.parse(item.F_value || '{}').imageNum || 0;
                return false;
            }
        });
        return len;
    }

    function getPPTimgurl(fid, len) {
        var list = [];
        for (var i = 0; i < len; i += 1) {
            list.push('/api/usr/dload?fid=' + fid + '&dl=0&ext=.png&pagenum=' + (i + 1) + '&token=' + GetToken());
        }
        return list;
    }
    /**
     * [matchVideoSrcAutoPlay 设置视频自动播放]
     * @param  {[type]} src [description]
     * @return {[type]}     [description]
     */
    function matchVideoSrcAutoPlay(src) {
        var reg = {
            yinyuetai: {
                reg: /http:\/\/www\.yinyuetai\.com/,
                param: '&auto=1'
            },
            56: {
                reg: /http:\/\/player\.56\.com/,
                param: '&auto=1'
            },
            ku6: {
                reg: /http:\/\/player\.ku6\.com/,
                param: '&auto=1'
            },
            sohu: {
                reg: /http:\/\/share\.vrs\.sohu\.com/,
                param: '&autoplay=true'
            },
            tudou: {
                reg: /http:\/\/www\.tudou\.com/,
                param: '&autoPlay=true'
            },
            youku: {
                reg: /http:\/\/player\.youku\.com/,
                param: '&isAutoPlay=true'
            },
            qq: {
                reg: /http:\/\/static\.video\.qq\.com/,
                param: '&auto=1'
            }
        };
        angular.forEach(reg, function(item) {
            if (src.match(item.reg)) {
                src = src + item.param;
            }
        });
        return src;
    }

    function setNodeEvent(html, data, style) {
        var node = $(html);
        var type = data.t;
        node.get(0).contentData = data;
        if (style) {
            var tag = node.find(style.tag).eq(0);
            style.style && tag.css(style.style);
            if (type === 'embed' || type === 'video') {
                node.find('iframe,embed').removeAttr('style').css({
                    height: '100%'
                });
                // tag.css({
                //     width: '100%'
                // });
            }
        }
        switch (type) {
            case 'flash':
            case 'embed':
            case 'video':
                node.find('.up').on({
                    click: function() {
                        node.find('iframe,video').attr('src', '');
                        //重新加载有source标签的video视频
                        if (node.find('iframe,video,source')) {
                            node.find('iframe,video').removeAttr('src');
                        }
                        node.find('.w').hide().prev().show();
                    }
                });
                if (type === 'embed') {
                    node.find('.thumbnail').html('').append(setVideoOpenBtn(node));
                }
                break;
            case 'attach':
                node.find('.do-t-btn.dl').on({
                    click: function(event) {
                        event.preventDefault();
                        if (isPhonePage()) {
                            alert('请在网页端下载');
                        } else {
                            $('#file-downl-iframe').attr('src', data.c.url);
                        }
                    }
                });
                break;
            case 'text':
                if (isPhonePage()) {
                    node.find('a').each(function() {
                        $(this).on({
                            click: function(event) {
                                event.preventDefault();
                                mobileClickLink($(this).attr('href'));
                            }
                        });
                    });
                    node.find('img').each(function() {
                        $(this).on({
                            click: function(event) {
                                event.preventDefault();
                                mobileClickImage($(this).attr('src'));
                            }
                        });
                    });
                }
                break;
            case 'link':
                if (isPhonePage()) {
                    node.find('.link').on({
                        click: function(event) {
                            event.preventDefault();
                            mobileClickLink($(this).attr('href'));
                        }
                    });
                }
                break;
            case 'e_es':
                var k = Math.random().toString(36).substr(2, 15);
                var e = node.get(0);
                e.reloadPaper = function() {
                    paractiseLoadEvent(node, data);
                };
                e.reloadPaper();
                paperNodes[k] = e;
                data.paperNode = k;
                break;
        }
        return node;
    }
    //获取练习
    function paractiseLoadEvent(node, data) {
        if (!data.c.aid) {
            console.log('数据有误!');
            return;
        }
        var paperData = {},
            temType = 1,
            temRedo = true,
            // 不允许再做一次
            // temRedo = false,
            btnName = '',
            nameList = [
                { name: '练习' },
                { name: '试卷' },
                { name: '考试' },
            ],
            mobileData = {
                pid: data.c.aid,
                title: data.c.title || '未命名',
                tid: data.c.tid || '',
                eid: '',
                status: 100,
                type: temType,
                redo: temRedo,
                preview: false,
            };
        switch (data.c.type) {
            case 'e_paper':
                temType = 2;
                break;
            case 'e_test':
                temRedo = false;
                temType = 3;
                break;
            case 'e_exercise':
                temType = 1;
                break;
        }
        mobileData.type = temType;
        mobileData.redo = temRedo;
        if (data.c.tid) {
            paperData = factory.testList[data.c.aid];
        } else {
            paperData = factory.paperList[data.c.aid];
        }
        if (factory.self || factory.admin) {
            btnName = '预览';
            mobileData.preview = true;
        }
        try {
            var doNum = paperData.count || 0;
            var time = 0;
            var text = '';
            var urlData = { cid: factory.courseId, aid: data.c.aid };
            if (paperData.info.ext && paperData.info.ext.advise_cost) {
                time = paperData.info.ext.advise_cost;
            }
            if (btnName) {
                urlData.preview = 1;
            }
            text = doNum + '/' + paperData.info.count + '题';
            if (time && parseInt(time / 1000 / 60) > 0 && !data.c.tid) {
                text += ',建议' + parseInt(time / 1000 / 60) + '分钟';
            }
            text += ',总分' + paperData.info.total + '分';
            node.find('.action .showScore').hide();
            node.find('.redo-t-btn').hide();
            //从未做题
            if (!paperData.exam) {
                node.find('.do-t-btn').html(btnName || '开始做题').unbind('click').bind('click', function() {
                    if (!paperData.info.count) {
                        if (isPhonePage()) {
                            alert('暂无题目！');
                        } else {
                            service.dialog.alert('暂无题目！');
                        }
                        return;
                    }
                    factory.selectPaper = {
                        node: node,
                        data: data,
                    };
                    if (isPhonePage()) {
                        mobilePlug(angular.extend(mobileData, { status: 100, }),
                            'paper'
                        );
                    } else {
                        if (mobileData.tid) {
                            urlData.tid = mobileData.tid;
                        }
                        urlData.target = factory.sectionId;
                        urlData.testDate = (new Date()).getTime();
                        window.open(rcpAid.getUrl('做题页', urlData));
                        // location.href = rcpAid.getUrl('做题页', urlData);
                    }
                });
            } else if (paperData.exam) {
                //已做过题
                if (angular.isArray(paperData.answers)) {
                    doNum = paperData.answers.length;
                }
                //考试超时情况
                if (data.c.tid && paperData.exam.status === 100) {
                    if (paperData.info) {
                        var temDoTime = paperData.info.cost_time / 1000 / 60,
                            temStartTime = paperData.exam.time,
                            temNowTime = moment();
                        try {
                            temNowTime = temNowTime + (SRV_TIME - ONLOAD_TIME);
                        } catch (e) {
                            console.log(e);
                        }
                        if (+moment.max(temNowTime, moment(temStartTime).add(temDoTime, 'm')) === +temNowTime) {
                            paperData.exam.status = 200;
                        }
                    }
                }
                switch (paperData.exam.status) {
                    case 100:
                        node.find('.do-t-btn').html(btnName || '继续做题').unbind('click').bind('click', function() {
                            if (!paperData.info.count) {
                                if (isPhonePage()) {
                                    alert('暂无题目！');
                                } else {
                                    service.dialog.alert('暂无题目！');
                                }
                                return;
                            }
                            factory.selectPaper = {
                                node: node,
                                data: data,
                            };

                            if (isPhonePage()) {
                                mobilePlug(angular.extend(mobileData, {
                                        status: 100,
                                        eid: paperData.exam.id || '',
                                    }),
                                    'paper'
                                );
                            } else {
                                if (mobileData.tid) {
                                    urlData.tid = mobileData.tid;
                                }
                                urlData.target = factory.sectionId;
                                urlData.testDate = (new Date()).getTime();
                                // location.href = rcpAid.getUrl('做题页', urlData);
                                window.open(rcpAid.getUrl('做题页', urlData));
                            }
                        });
                        break;
                    case 200:
                        if (paperData.notc > 0) {
                            node.find('.do-t-btn').html(btnName || '批改中').unbind('click').bind('click', function() {
                                if (!paperData.info.count) {
                                    if (isPhonePage()) {
                                        alert('暂无题目！');
                                    } else {
                                        service.dialog.alert('暂无题目！');
                                    }
                                    return;
                                }
                                factory.selectPaper = {
                                    node: node,
                                    data: data,
                                };
                                console.log(factory);
                                if (isPhonePage()) {
                                    mobilePlug(angular.extend(mobileData, {
                                            status: 200,
                                            eid: paperData.exam.id || '',
                                        }),
                                        'paper'
                                    );
                                } else if (btnName) {
                                    location.href = rcpAid.getUrl('做题页', { aid: data.c.aid });
                                }
                            });
                        } else if (paperData.notp > 0 || (paperData.notc === 0 && paperData.notp === 0)) {
                            node.find('.do-t-btn').html(btnName || '批改中').unbind('click').bind('click', function() {
                                if (!paperData.info.count) {
                                    if (isPhonePage()) {
                                        alert('暂无题目！');
                                    } else {
                                        service.dialog.alert('暂无题目！');
                                    }
                                    return;
                                }
                                factory.selectPaper = {
                                    node: node,
                                    data: data,
                                };
                                if (isPhonePage()) {
                                    mobilePlug(angular.extend(mobileData, {
                                            status: 300,
                                            eid: paperData.exam.id || '',
                                        }),
                                        'paper'
                                    );
                                } else if (btnName) {
                                    location.href = rcpAid.getUrl('做题页', { aid: data.c.aid });
                                }
                            });
                        }
                        break;
                    case 400:
                        var score = paperData.score ? paperData.score.toFixed(1) : 0;
                        if (!btnName) {
                            node.find('.action .showScore').show();
                            node.find('.action .score').html(1 * score + '分');
                        }
                        node.find('.do-t-btn').html(btnName || '查看解析').unbind('click').bind('click', function() {
                            if (!paperData.info.count) {
                                if (isPhonePage()) {
                                    alert('暂无题目！');
                                } else {
                                    service.dialog.alert('暂无题目！');
                                }
                                return;
                            }
                            factory.selectPaper = {
                                node: node,
                                data: data,
                            };
                            if (isPhonePage()) {
                                mobilePlug(angular.extend(mobileData, {
                                        status: 400,
                                        eid: paperData.exam.id || '',
                                    }),
                                    'paper'
                                );
                            } else {
                                if (mobileData.tid) {
                                    urlData.tid = mobileData.tid;
                                }
                                urlData.target = factory.sectionId;
                                // location.href = rcpAid.getUrl('解析页', urlData);
                                window.open(rcpAid.getUrl('解析页', urlData));
                            }
                        });
                        if (!data.c.tid && !isPhonePage() && btnName !== '预览') {
                            node.find('.action').css('width', '275px');
                            node.find('.redo-t-btn').show();
                            node.find('.redo-t-btn').unbind('click').bind('click', function() {
                                factory.selectPaper = {
                                    node: node,
                                    data: data,
                                };
                                node.find('.redo-t-btn').hide();
                                window.open(rcpAid.getUrl('做题页', { aid: data.c.aid, restartanswer: 1, testDate: new Date().getTime() }));
                            });
                        } else {
                            node.find('.action').css('width', '200px');
                        }
                        break;
                    default:
                        node.find('.do-t-btn').html('状态有误！').unbind('click');
                }
            }
            if (data.c.tid) {
                if (paperData.info) {
                    var sTime = moment(paperData.info.start_time).format('YYYY-MM-DD HH:mm'),
                        eTime = moment(paperData.info.end_time).format('YYYY-MM-DD HH:mm'),
                        nowTime = (new Date()).getTime(),
                        doTime = paperData.info.cost_time / 1000 / 60;
                    text += ',限时' + parseInt(doTime) + '分钟<br/><span>起：' + sTime + '</span><br/><span>止：' + eTime + '</span>';
                    if (paperData.info.start_time > nowTime) {
                        node.find('.do-t-btn').html('未开始').unbind('click');
                    } else if (paperData.info.end_time < nowTime) {
                        node.find('.do-t-btn').html('已结束').unbind('click');
                    }
                }
            }
            node.find('.detail.text-of').html(text);
        } catch (e) {
            console.log(e);
            node.find('.ldg').hide();
            node.find('.c').show().html('获取' + nameList[temType - 1].name + '信息失败!');
        }
        //隐藏load
        node.find('.ldg').hide();
        node.find('.c').show();
    }

    function getNode(id) {
        return makeTemp(factory.content.items[id]);
    }
    //构造模板
    function makeTemp(data) {
        var t = data.t;
        var node;
        switch (typeof templet[t]) {
            case 'function':
                if (data.c.status && data.c.status === 'EDIT') {
                    t = 'isedit';
                }
                node = templet[t](data);
                break;
            default:
                t = 'isbuild';
                node = templet[t](data);
        }
        factory.content.cache[data.cvp.id] = data;
        return node;
    }

    function scaleElement(elem, fw, argw) {
        var ew = elem.width();
        var eh = elem.height();
        if (ew <= fw) {
            return;
        }
        var w = argw || fw;
        var h = fw * eh / ew;
        elem.width(w);
        elem.height(h);
    }

    function formatHtml(section) {
        var sw = section.width();

        //format img
        section.find('img').each(function() {
            scaleElement($(this), sw);
        });

        //format video
        section.find(".cp-embed,.cp-video,.cp-flash").each(function() {
            $(this).find(".embed-w,.video-w,.flash-w").each(function() {
                scaleElement($(this), sw);
            });
        });
    }

    function runLazy(section) {
        var wrap = $(factory.viewNode);
        var wrapTag = 'div';
        //lazy img
        section.find('img').each(function(i, img) {
            lazyListener({
                winTag: wrapTag,
                win: wrap,
                node: $(this),
                callback: function() {
                    var imgUrl = $(img).attr('data-src') || $(img).attr('src') || '';
                    var newImg = $('<img src="' + imgUrl + '" style="' + ($(img).attr('style') || '') + '" />');
                    newImg.on({
                        click: function() {
                            if (isPhonePage()) {
                                mobileClickImage($(this).attr('src'));
                            }
                        },
                        load: function() {
                            // $(this).animate({
                            //     opacity: 1
                            // }, 'normal');
                        },
                        error: function() {
                            $(this).attr('src', blankGif).parent().addClass('default-error-img');
                        }
                    });
                    $(img).after(newImg).remove();
                }
            });
        });
        //lazy video
        section.find('.timg').each(function(i, item) {
            lazyListener({
                winTag: wrapTag,
                win: wrap,
                node: $(this),
                callback: function() {
                    var node = $(item).find('.thumbnail');
                    var img = node.attr('data-img');
                    // node.animate({
                    //     opacity: 1
                    // }, 'normal');
                    if (img) {
                        node.css({
                            'backgroundImage': 'url(' + img + ')'
                        });
                    }
                }
            });
        });
    }

    function lazyListener(args) {
        var lock;
        var timer;
        var win = args.win;

        function handler() {
            var e = args.node;
            if (!e.length || lock || e.is(':hidden')) {
                return;
            }
            var wt = win.scrollTop();
            var wb = wt + win.height();
            var et = args.winTag === 'window' ? e.offset().top : e.position().top + wt;
            var eb = et + e.height();
            var tf = et >= wt && et <= wb;
            var bf = et <= wt && eb >= wt;
            if (tf || bf) {
                lock = !lock;
                if (typeof args.callback === 'function') {
                    args.callback();
                    win.unbind('scroll', callback);
                    win.unbind('resize', callback);
                }
            }
        }

        function callback() {
            $timeout.cancel(timer);
            timer = $timeout(handler, 200);
        }
        callback();
        win.bind('scroll', callback);
        win.bind('resize', callback);
    }

    function failCallb(err) {
        window.resm = err;
    }

    function reArgs(args) {
        var arr = [];
        angular.forEach(args, function(item) {
            arr.push(item);
        });
        return arr;
    }

    function runArgFn() {
        var args = reArgs(arguments);
        var fn = args[0];
        var params = args.slice(1, args.length);
        if (typeof fn === 'function') {
            fn.apply(fn, params);
        }
    }
    /**
     * [runCat 开始生成目录]
     * @param  {[type]} tart [description]
     * @return {[type]}      [description]
     */
    function runCat(tart) {
        factory.idsCat = filterRepeatIds(tart.findIids({
            "T1": 1,
            "T2": 1,
        }) || []);
        makeCat(factory.idsCat, factory.cat.items);
    }

    /**
     * [makeCat 生成目录]
     * @param  {[type]} tids [description]
     * @param  {[type]} arr  [description]
     * @return {[type]}      [description]
     */
    function makeCat(tids, arr) {
        factory.art.next(tids).done(function(tart, data) {
            angular.forEach(tids, function(id) {
                var item = factory.art.findItem(id, 1, 1);
                arr.push({
                    id: id,
                    title: item.c.title,
                    type: item.t
                });
            });
            $rootScope.$broadcast("makeCatReady", tart, data);
        }).fail(function(err, xhr) {
            $rootScope.$broadcast("makeCatError", err, xhr);
            failCallb(err, xhr);
        });
    }

    function appendLoading(type) {
        readyLock = false;
        var wrap = $(factory.viewNode);
        var html = '<p class="append-loading" style="padding:30px 0;font-size:14px;color:#999;text-align:center;">正在加载...</p>';
        var t = 0;
        switch (type) {
            case 'top':
                wrap.children('.cp-section').first().before(html);
                wrap.scrollTop(t);
                break;
            case 'bottom':
                wrap.children('.cp-section').last().after(html);
                t = wrap.get(0).scrollHeight - wrap.height();
                wrap.scrollTop(t);
                break;
        }
    }

    function filterRepeatIds(ids) {
        var arr = [];
        angular.forEach(ids, function(val) {
            if (!arr.join(',').match(new RegExp('\s' + val + '\s'))) {
                arr.push(val);
            }
        });
        return arr;
    }

    function runContent(tart, target) {
        var ids = filterRepeatIds(tart.findIids() || []);
        pagelength = Math.ceil(ids.length / factory.params.ps) - 1;
        factory.idsContent = ids;
        factory.locateContentTarget(target || ids[0]);
    }
    //显示第N页
    function showContent(pn) {
        console.log('显示页：', pn);
        var wrap = $(factory.viewNode);
        wrap.children('.cp-section[data-cpn="' + pn + '"]').show();
        wrap.children('.cp-section[data-cpn="' + (pn + 1) + '"]').show();
        onready();
    }
    //构造页面内容
    function pushContent(type, items, tids, pn) {
        var wrap = $(factory.viewNode);
        var children = wrap.children('.cp-section');
        var fragment = $(document.createDocumentFragment());
        //请求的数据
        var dataReq = {
            aids: '',
            t_aids: '',
            t_tids: '',
            ret_score: 1,
            ret_ainfo: 1,
        };
        angular.forEach(tids, function(id) {
            var target = factory.content.items[id];
            switch (target.t) {
                case 'e_es':
                    if (target.c.tid) {
                        factory.testList[target.c.aid] = {};
                        if (dataReq.t_aids === '') {
                            dataReq.t_aids = target.c.aid;
                            dataReq.t_tids = target.c.tid;
                        } else {
                            dataReq.t_aids += ',' + target.c.aid;
                            dataReq.t_tids += ',' + target.c.tid;
                        }
                    } else {
                        factory.paperList[target.c.aid] = {};
                        if (dataReq.aids === '') {
                            dataReq.aids = target.c.aid;
                        } else {
                            dataReq.aids += ',' + target.c.aid;
                        }
                    }
                    break;
                default:
            }
        });
        var loadContent = function() {
            var temLen = tids.length;
            angular.forEach(tids, function(id, l) {
                var node = getNode(id);
                if (l === temLen - 1 && pn === pagelength) {
                    var viewH = wrap.height() || 0;
                    // todo 这里可以增加一个已到最后一页的页面
                    node.append('<div style="height:' + viewH + 'px;width:100%;"></div>');
                }
                fragment.append(node);
            });
            $.each(factory.content.page, function(k) {
                if (parseInt(k) > pn) {
                    type = 'top';
                    children = wrap.children('.cp-section[data-cpn="' + k + '"]');
                    return false;
                }
            });

            if (!children.length) {
                wrap.append(fragment);
            } else {
                if (type === 'top') {
                    children.first().before(fragment);
                } else {
                    children.last().after(fragment);
                }
            }

            wrap.children('.cp-section[data-cpn=' + pn + ']').each(function() {
                formatHtml($(this));
                runLazy($(this));
            });

            onready();
        };
        if (!$.isEmptyObject(factory.paperList) || !$.isEmptyObject(factory.testList)) {
            service.examReq.listExam(dataReq).then(function(rs) {
                var paperIds = dataReq.aids.split(',');
                var testIds = dataReq.t_aids.split(',');
                var testTids = dataReq.t_tids.split(',');
                if (rs.data && rs.data.aids) {
                    angular.forEach(paperIds, function(paperId) {
                        if (paperId) {
                            factory.paperList[paperId] = rs.data.paper[paperId] || {};
                            factory.paperList[paperId].info = rs.data.paper_info[paperId];
                        }
                    });
                    angular.forEach(testIds, function(testId, k) {
                        if (testId) {
                            factory.testList[testId] = {};
                            if (rs.data.tests[testTids[k]]) {
                                factory.testList[testId] = rs.data.tests[testTids[k]][testId] || {};
                            }
                            factory.testList[testId].info = rs.data.test_info[testTids[k]];
                            angular.extend(factory.testList[testId].info, rs.data.paper_info[testId]);
                        }
                    });
                }
                console.log(rs);
                loadContent();
            }, function(e) {
                console.log(e, '获取' + '信息失败');
                service.dialog.showErrorTip(e, { moduleName: 'content-view', funcName: 'listExam' });
            });
        } else {
            loadContent();
        }
    }

    function readyHandel() {
        readyLock = true;
        var wrap = $(factory.viewNode);
        wrap.find('.append-loading').remove();
        locate(function() {
            wrap.css({
                visibility: 'visible'
            });
            footerLock = false;
            locateTarget = null;
            $rootScope.$broadcast("makeContentReady");
        });
    }

    function onready() {
        preloading(readyHandel);
    }

    function checkLoadContentHeight() {
        var wrap = $(factory.viewNode);
        var sh = parseInt(wrap.get(0).scrollHeight);
        var h = parseInt(wrap.outerHeight(true));
        console.log('滚动高度', sh, h);
        return sh > h;
    }

    function preloading(fn) {
        if (checkLoadContentHeight()) {
            runArgFn(fn);
            return;
        }
        scrollContentRequest('bottom');
    }

    function locate(fn) {
        var wrap = $(factory.viewNode);
        var val = 0;
        fillViewScrollHeight();
        if (locateTarget) {
            scrollLock = true;
            wrap.scrollTop(0);
            var target = wrap.children('.cp-section[data-cid="' + locateTarget + '"]');
            var pt = target.position().top;
            var pdt = parseInt(wrap.css('paddingTop'));
            val = Math.ceil(pt - pdt + topIndent);
            console.log('高度', val, wrap[0].scrollHeight, wrap.height());
            // console.log('浏览器高度', window.screen.height);
            wrap.scrollTop(val).css({ width: '100%', height: '100%', maxHeight: window.screen.height, maxWidth: window.screen.width });
            scrollLock = false;
            // console.log('第一次不等即有问题', wrap.scrollTop(), val);
            if (wrap.scrollTop() === val || footerLock) {
                runArgFn(fn);
            } else {
                wrap.css({
                    visibility: 'visible'
                });
                footerLock = false;
                $rootScope.$broadcast("makeContentReady");
            }
        } else {
            runArgFn(fn);
        }

    }

    function fillViewScrollHeight() {
        var flag = footerLock && locateTarget;
        console.log('ContentHeight', footerLock, locateTarget);

        if (!checkLoadContentHeight() || flag) {
            var wrap = $(factory.viewNode);
            var children = wrap.children('.cp-section');
            var sh = wrap.outerHeight(true);
            var nh = 0;
            children.last().css({
                height: ''
            });
            children.each(function(index) {
                var node = $(children).eq(children.length - (index + 1));
                nh += node.outerHeight(true);
                if (node.hasClass('cp-t1') || node.hasClass('cp-t2')) {
                    return false;
                }
            });
            var val = sh - nh + children.last().outerHeight(true);
            var pn = +wrap.children('.cp-section[data-cid="' + locateTarget + '"]').attr("data-cpn");
            if (!pn) {
                pn = children.last().get(0).contentData.cvp.pn;
            }
            console.log('页数', pn, pagelength, val);
            if (pn >= pagelength) {
                console.log('已到最后一页');
            } else {
                console.log('加载页', +pn + 1);
                showContent(+pn + 1);
            }
        }
    }
    /**
     * [scrollContentRequest 滚动触发]
     * @param  {[type]} type [top顶部，bottom底部]
     * @return {[type]}      [description]
     */
    function scrollContentRequest(type) {
        var wrap = $(factory.viewNode);
        var children = wrap.children('.cp-section:visible');
        var pn = 0;
        var time = null;
        var node = null;
        if (!locateTarget) {
            time = 500;
        }
        if (!children.length) {
            return;
        }
        switch (type) {
            case 'top':
                node = children.first().get(0);
                pn = node.contentData.cvp.pn;
                pn -= 1;
                break;
            case 'bottom':
                pn = children.last().get(0).contentData.cvp.pn;
                pn += 1;
                break;
        }
        if (pn >= 0 && pn <= pagelength) {
            if (node) {
                locateTarget = node.contentData.cvp.id;
            }
            appendLoading(type);
            $timeout(function() {
                pageRequest(type, factory.idsContent, pn, false);
            }, time);
        } else {
            console.info(type === 'top' ? '已到最顶部了' : '已到最底部了', pn, pagelength);
            if (type !== 'top') {
                if (pn > 1) {
                    readyHandel();
                } else {
                    wrap.css({
                        visibility: 'visible'
                    });
                    footerLock = false;
                    $rootScope.$broadcast("makeContentReady");
                }
            }
        }
    }
    /**
     * [makeContent 跟据ID生成内容]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    function makeContent(id) {
        //内容ID
        var ids = factory.idsContent,
            //当前ID序号
            seq = $.inArray(id, ids),
            //页数
            pn = 0,
            //加载多一页
            loadNext = false,
            //已加载内容集合
            items = {};

        if (!ids.length) {
            mcFailEvent('info', '(∩_∩)还没有内容~~~');
            return;
        }

        if (!id) {
            mcFailEvent('error', 'ID出错,赶紧找程序猿');
            return;
        }

        if (seq === -1) {
            console.log(id, 'id找不到！');
            seq = 0;
            id = ids[0];
        }
        locateTarget = id;
        factory.sectionId = id;
        readyLock = false;
        pn = Math.floor(seq / factory.params.ps);
        loadNext = seq % factory.params.ps > factory.params.ps / 2 ? true : false;
        items = factory.content.items;
        //读取缓存数据
        if (items[id]) {
            console.log('aa', pn, seq, factory.params.ps, items[id].cvp.pn);
            showContent(items[id].cvp.pn);
            return;
        }
        //读取请求到的数据（首次加载用）
        pageRequest(null, ids, pn, loadNext);
    }

    function setVideoOpenBtn(node) {
        var a = $('<a href="javascript:;" class="open"><i class="fa fa-play-circle-o"></i></a>');
        a.on({
            click: function() {
                if (isPhonePage()) {
                    var cdata = node.get(0).contentData;
                    cdata.c.src = cdata.c.src.replace(/&amp;/g, '&');
                    if (node.find('video').length) {
                        cdata.t = 'video';
                    }
                    mobileClickVideo(cdata.c.src, cdata.t);
                    return;
                }
                var t = $(this).parent().parent();
                var v = t.next();
                var p = v.find('iframe,embed,video');
                t.hide();
                v.show();
                p.attr('src', p.attr('data-src'));
            }
        });
        return a;
    }

    /**
     * [callFileDetail 文件类型构造回调]
     * @param  {[type]} type   [文件类型]
     * @param  {[type]} c      [文件信息]
     * @param  {[type]} item   [item数据包含前两个]
     * @param  {[type]} detail [description]
     * @return {[type]}        [description]
     */
    function callFileDetail(type, c, item, detail) {
        var node = $('div[data-cid="' + item.cvp.id + '"]'),
            count = 0;
        var url, img, thum, opa;
        var a, urlAttach, viewData;

        var ext = c.ext.replace('.', '');
        var nowCount = allCount = 0;
        try {
            nowCount = c.nowCount || 0;
            allCount = c.info[service.courseContent.convertExt.transExecType[ext]].count || 0;
            if (allCount < nowCount) {
                nowCount = 0;
            }
        } catch (e) {}
        /**
         * 预览查看页数状态
         */
        function setViewStatus() {
            console.log('当前显示', nowCount);
            node.find('.c.d-b').removeClass('d-b').show();
            node.find('.detail.text-of').html(nowCount + '/' + allCount + '页');
            if (!allCount) {
                node.find('.detail.text-of').hide();
            } else {
                node.find('.detail.text-of').show();
            }
        }

        function fileDetail() {
            switch (type) {
                case 'attach':
                    node.find('.do-t-btn.dl').html('点击下载');
                    if (c.status === 'N' || c.status === 'SUCCESS') {
                        if (isPhonePage()) {
                            if (c.exec === 'done' && service.courseContent.convertExt.transExecType[ext]) {
                                viewData = service.courseContent.transPhoneViewUrl(c.mark, ext, c.info);
                                viewData.name = c.filename || '未命名';
                                viewData.nowCount = nowCount || 1;
                                if (viewData.url) {
                                    setViewStatus();
                                    a = '<div class="do-t-btn">预览</div>';
                                    node.find('.phone-view').html(a);
                                    var onClick = function() {
                                        factory.nowViewKey = c.key;
                                        factory.temItem = item;
                                        mobileClickPhotoDoc(viewData);
                                        console.log(viewData);
                                    };
                                    node.find('.phone-view').off('click').on('click', onClick);
                                }
                            }
                        } else {
                            if (c.exec === 'done' && service.courseContent.convertExt.transExecType[ext]) {
                                urlAttach = service.courseContent.transPreviewUrl(c.mark, ext, c.info);
                                urlAttach += '&cid=' + queryString('cid') + '#' + (nowCount || 1);
                                if (urlAttach) {
                                    setViewStatus();
                                    a = '<a class="do-t-btn mg-l20" href="' + urlAttach + '" target="_blank" title="">预览</a>';
                                    if (!node.find('.do-t-btn.mg-l20').length) {
                                        node.find('.do-t-btn.dl').after(a);
                                        node.find('.do-t-btn.mg-l20').on({
                                            click: function() {
                                                factory.nowViewKey = c.key;
                                                factory.temItem = item;
                                            }
                                        });
                                    } else {
                                        node.find('.do-t-btn.mg-l20').attr('href', urlAttach);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'video':
                    function temVideo() {
                        if (c.status === 'N' || c.status === 'SUCCESS') {
                            switch (c.exec) {
                                case 'done':
                                    url = [];
                                    img = url[url.length - 1] || '';
                                    thum = node.find('.thumbnail');
                                    opa = thum.css('opacity');
                                    a = setVideoOpenBtn(node);
                                    thum.html(a);
                                    if (opa && opa !== '0') {
                                        thum.css({
                                            backgroundImage: 'url(' + img + ')'
                                        });
                                    } else {
                                        thum.attr('data-img', img);
                                    }
                                    break;
                                case 'error':
                                    node.find('.thumbnail').html('视频转码失败');
                                    break;
                                case 'running':
                                    node.find('.thumbnail').html('视频转码中...');
                                    break;
                                default:
                                    node.find('.thumbnail').html('视频加载失败');
                            }
                        } else {
                            node.find('.thumbnail').html('视频加载失败');
                        }
                    }
                    temVideo();
                    break;
                case 'flash':
                    switch (c.status) {
                        case 'N':
                            node.find('.timg').css({ height: '200px' });
                            node.find('.thumbnail').html('').append(setVideoOpenBtn(node));
                            break;
                        case 'SUCCESS':
                            node.find('.timg').css({ height: '200px' });
                            node.find('.thumbnail').html('').append(setVideoOpenBtn(node));
                            break;
                        case 'UPLOAD':
                            node.find('.thumbnail').html('上传中...');
                            break;
                        case 'FAIL':
                            node.find('.thumbnail').html('上传失败');
                            break;
                        case 'UNKNOWN':
                            node.find('.thumbnail').html('未知');
                            break;
                        default:
                            console.log(c);
                            node.find('.thumbnail').html('加载失败');
                            break;
                    }
            }
        }
        if ($(node).length) {
            fileDetail();
        } else {
            //延时加载
            function wait() {
                console.log('延时加载：', item.cvp.id);
                count += 1;
                node = $('div[data-cid="' + item.cvp.id + '"]');
                if ($(node).length) {
                    clearTimeout(timeO);
                    fileDetail();
                    return;
                } else if (count === 10) {
                    clearTimeout(timeO);
                    return;
                }
                var timeO = setTimeout(function() {
                    wait();
                }, 1000);
            }
            wait();
        }
    }

    /**
     * [setFilesEvent 构造不同文件类型事件]
     * @param {[type]} files [description]
     */
    function setFilesEvent(files) {
        var rev = [];
        var items = {};
        //读取文件预览的第几页的数据
        var temViewFileInfo = [];
        var keys = [];
        angular.forEach(files, function(item) {
            switch (item.t) {
                case 'attach':
                    item.c.url = service.courseContent.transDownloadUrl(item.c.mark);
                    if (item.c.ext) {
                        var temKey = $rootScope.currentUser.uid + '_' + rcpAid.queryString('cid') + '_' + item.c.mark;
                        keys.push(temKey);
                        item.c.key = temKey;
                        temViewFileInfo.push(item);
                    }
                    break;
                case 'video':
                    item.c.url = service.courseContent.transVideoUrl(item.c.mark);
                    $timeout(function() {
                        callFileDetail(item.t, item.c, item, item);
                    }, 200);
                    rev.push(item.c.id);
                    items[item.c.id] = item;
                    break;
                case 'flash':
                    item.c.url = service.courseContent.transFlashUrl(item.c.mark);
                    $timeout(function() {
                        callFileDetail(item.t, item.c, item, item);
                    }, 200);
                    break;
                case 'image':
                    item.c.url = service.courseContent.transImgUrl(item.c.mark);
                    break;
            }
        });
        if (keys.length) {
            var temData = {
                page: 1,
                limit: 10000,
                keys: keys.join(',')
            };
            service.courseContent.listStore(temData).then(function(rs) {
                console.log('预览页数数据', temData, rs);
                angular.forEach(temViewFileInfo, function(item) {
                    if (rs.data.store) {
                        var temLen = rs.data.store.length;
                        for (var i = 0; i < temLen; i++) {
                            if (rs.data.store[i].key === item.c.key) {
                                item.c.nowCount = +rs.data.store[i].val;
                                rs.data.store.splice(i, 1);
                                break;
                            } else {
                                item.c.nowCount = 0;
                            }
                        }
                    } else {
                        item.c.nowCount = 0;
                    }
                    $timeout(function() {
                        callFileDetail(item.t, item.c, item, item);
                    }, 200);
                    rev.push(item.c.id);
                    items[item.c.id] = item;
                });
            }, function(e) {
                console.log(e);
                service.dialog.showErrorTip(e, { moduleName: 'content-view', funcName: 'listStore' });
                // try {
                //     switch (e.data.data.code) {
                //         case 10:
                //             service.dialog.alert('读取预览页数出错！');
                //             break;
                //         default:
                //             service.dialog.alert('读取预览页数出错！');
                //     }
                // } catch (err) {
                //     service.dialog.alert('读取预览页数出错！');
                // }
            });
        }
    }



    function fileErr(of, errmsg) {
        function fn(item) {
            var node = $('div[data-cid="' + item.cvp.id + '"]');
            node.find('.thumbnail').html(errmsg);
        }
        angular.forEach(of, function(item) {
            fn(item);
        });
    }

    function pageHandel(arr, pn, done, fail) {
        if (pn > pagelength) {
            console.error('页数:' + pn + ' 超出内容范围');
            return;
        }
        var ps = factory.params.ps;
        var s = pn * ps;
        var e = s + ps;
        var tids = arr.slice(s, e);
        loadContent(tids, done, fail, pn, ps);
    }

    function loadContent(tids, done, fail, pn, ps) {
        factory.art.next(tids).done(function(tart) {
            var items = factory.content.items;
            angular.forEach(tids, function(id) {
                var item = factory.art.findItem(id, 1, 1);
                item.cvp = {
                    id: id,
                    pn: pn,
                    ps: ps,
                    tids: tids
                };
                items[id] = item;
            });

            runArgFn(done, tart, items, tids, pn);
        }).fail(function(err, xhr) {
            runArgFn(fail, err, xhr);
            failCallb(err, xhr);
        });
    }

    function mcFailEvent(type, errMsg) {
        $rootScope.$broadcast('makeContentError', type, errMsg);
    }

    function theCurrentChapter() {
        var wrap = $(factory.viewNode);
        var children = wrap.children('.cp-section:visible');
        var target;
        children.each(function() {
            var num = $(this).position().top + $(this).height();
            if (num > 0) {
                try {
                    target = $(this).get(0).contentData.cvp.id;
                } catch (e) {
                    console.error($(this).get(0).contentData);
                }
                return false;
            }
        });
        return target;
    }

    function getSid(id) {
        var sid;
        var ids = factory.idsContent;
        var i2t = factory.art.art.idx.i2t;
        if (!id || !ids.length) {
            return sid;
        }
        var arr = ids.slice(0, $.inArray(id, ids) + 1);
        $(arr).each(function(i, val) {
            var target = arr[arr.length - (i + 1)];
            if (i2t[target] === 'T1' || i2t[target] === 'T2') {
                sid = target;
                return false;
            }
        });
        return sid;
    }
    //new
    /**
     * [queryString 获取URL参数]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function queryString(name) {
        var result = window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
        if (!result) {
            return '';
        }
        return decodeURIComponent(result[1]);
    }

    function isPhonePage() {
        return window.location.href.indexOf("mobile-course-learning.html") !== -1;
    }
    var cid = queryString('cid');
    var readyLock = true;
    var locateTarget = null;
    var scrollLock = null;
    var footerLock = null;
    var topIndent = 10;
    var pagelength = 0;
    var blankGif = '/rcp-common/imgs/icon/gray-error-img.png';
    var ebsUrl = "http://" + g_conf.ebs_srv + "/";
    var rcpUrl = g_conf.rcp_srv;
    var paperNodes = {};
    var factory = {
        //当前章节ID
        sectionId: '',
        //是否是创建者
        self: null,
        //是否是管理员
        admin: null,
        //课程id
        courseId: '',
        //文章构造对象
        art: null,
        //目录ids
        idsCat: [],
        //当前查看文档信息
        temItem: '',
        //内容ids
        idsContent: [],
        //初始化目录对象
        cat: {
            items: []
        },
        //停止滚动
        stopScroll: false,
        //初始化内容对象
        content: {
            items: {},
            cache: {},
            page: {}
        },
        //试卷、考试信息
        paperList: {},
        testList: {},
        //设置key val的值
        setKeyValue: function(argKey, argVal, argType) {
            if (!argKey) {
                return;
            }
            if (argType === 'viewDoc' && factory.temItem) {
                console.log('直接更新页数', argVal);
                factory.temItem.c.nowCount = argVal || 0;
                callFileDetail(factory.temItem.t, factory.temItem.c, factory.temItem, factory.temItem);
            }
            var data = [{
                key: argKey,
                val: argVal || 1,
            }];
            service.course.upsertStore({ param: angular.toJson(data) }, { option: { loading: false, loginError: 2 } }).then(function(rs) {
                console.log(data, '记录成功：', rs);
            }, function(e) {
                // service.dialog.alert('记录数据失败，请稍候重试！');
                console.log(e);
            });
        },
        //回到页面
        pageFocus: function() {
            // service.dialog.alert('欢迎回来');
            try {
                R.start();
            } catch (e) {}
            if (factory.sectionId && factory.selectPaper && factory.selectPaper.data) {
                //请求的数据
                var dataReq = {
                    aids: '',
                    t_aids: '',
                    t_tids: '',
                    ret_score: 1,
                    ret_ainfo: 1,
                };
                //读取单张试卷
                var target = factory.selectPaper.data || {};
                switch (target.t) {
                    case 'e_es':
                        if (target.c.tid) {
                            factory.testList[target.c.aid] = {};
                            if (dataReq.t_aids === '') {
                                dataReq.t_aids = target.c.aid;
                                dataReq.t_tids = target.c.tid;
                            } else {
                                dataReq.t_aids += ',' + target.c.aid;
                                dataReq.t_tids += ',' + target.c.tid;
                            }
                        } else {
                            factory.paperList[target.c.aid] = {};
                            if (dataReq.aids === '') {
                                dataReq.aids = target.c.aid;
                            } else {
                                dataReq.aids += ',' + target.c.aid;
                            }
                        }
                        break;
                    default:
                        return;
                }
                var loadContent = function() {
                    paractiseLoadEvent(factory.selectPaper.node, factory.selectPaper.data);
                    factory.selectPaper = {};
                };
                if (!$.isEmptyObject(factory.paperList) || !$.isEmptyObject(factory.testList)) {
                    service.examReq.listExam(dataReq).then(function(rs) {
                        var paperIds = dataReq.aids.split(',');
                        var testIds = dataReq.t_aids.split(',');
                        var testTids = dataReq.t_tids.split(',');
                        if (rs.data && rs.data.aids) {
                            angular.forEach(paperIds, function(paperId) {
                                if (paperId) {
                                    factory.paperList[paperId] = rs.data.paper[paperId] || {};
                                    factory.paperList[paperId].info = rs.data.paper_info[paperId];
                                }
                            });
                            angular.forEach(testIds, function(testId, k) {
                                if (testId) {
                                    factory.testList[testId] = {};
                                    if (rs.data.tests[testTids[k]]) {
                                        factory.testList[testId] = rs.data.tests[testTids[k]][testId] || {};
                                    }
                                    factory.testList[testId].info = rs.data.test_info[testTids[k]];
                                    angular.extend(factory.testList[testId].info, rs.data.paper_info[testId]);
                                }
                            });
                        }
                        console.log(rs);
                        loadContent();
                    }, function(e) {
                        console.log(e, '获取' + '信息失败');
                        service.dialog.showErrorTip(e, { moduleName: 'content-view', funcName: 'listExam' });
                    });
                }
            }
            //更新浏览页数
            if (!isPhonePage() && factory.temItem) {
                console.log('开始更新WEB浏览页数', factory.nowViewKey, factory.temItem.c);
                if (!factory.nowViewKey) {
                    console.log('nowViewKey为空');
                    return;
                }
                var temData = {
                    page: 1,
                    limit: 10000,
                    keys: factory.nowViewKey
                };
                service.courseContent.listStore(temData).then(function(rs) {
                    console.log(rs);
                    try {
                        factory.temItem.c.nowCount = +rs.data.store[0].val;
                        callFileDetail(factory.temItem.t, factory.temItem.c, factory.temItem, factory.temItem);
                    } catch (e) {}
                }, function(e) {
                    console.log(e);
                    service.dialog.showErrorTip(e, { moduleName: 'content-view', funcName: 'listStore' });
                    // try {
                    //     service.dialog.alert(e.data.data.msg);
                    // } catch (err) {
                    //     service.dialog.alert('读取记录出错！');
                    // }
                });
            }
        },
        //离开页面
        pageBlur: function() {
            try {
                R.stop();
            } catch (e) {}
            factory.setKeyValue($rootScope.currentUser.uid + '_' + factory.courseId, factory.sectionId);
            console.log('离开页面-content-view', $rootScope.currentUser.uid + '_' + factory.courseId, factory.sectionId);
        },
        //读取上一次位置
        getLearnRecord: function(argKeys, argSucb, argErrcb) {
            if (!argKeys) {
                argKeys = [];
                argKeys[0] = $rootScope.currentUser.uid + '_' + factory.courseId;
            }
            var temData = {
                page: 1,
                limit: 10000,
                keys: argKeys.join(',')
            };
            service.courseContent.listStore(temData).then(argSucb, argErrcb);
        },
        params: {
            ps: 15
        },
        config: function(params) {
            angular.extend(factory.params, params);
            return this;
        },
        queryString: queryString,
        //跳章节
        locateContentTarget: function(target) {
            $rootScope.$broadcast("locateContentTarget");
            var timer = $timeout(function() {
                $timeout.cancel(timer);
                var wrap = $(factory.viewNode);
                wrap.css({
                    visibility: 'hidden'
                }).children('.cp-section').hide().last().css({
                    height: ''
                });
                wrap.children('.cp-embed,.cp-video').each(function() {
                    $(this).find('.w').find('.up').click();
                });
                var sid = getSid(target);
                if (sid) {
                    $rootScope.$broadcast('actionAatId', sid);
                }
                makeContent(target);
            });
        },
        on: function(evn, fn) {
            switch (evn) {
                case 'scroll':
                    factory.scroll(fn);
                    break;
            }
        },
        scroll: function(fn) {
            var scrollTimer = null;
            var resizeTimer = null;
            var type = null;
            var wrap = $(factory.viewNode);

            function scrollCallback() {
                var id = theCurrentChapter();
                factory.sectionId = id;
                var sid = getSid(id);
                if (sid) {
                    $rootScope.$broadcast('actionAatId', sid);
                } else {
                    $rootScope.$broadcast('actionAatId', sid);
                }
                fn(factory, type, sid, id);
            }

            function scroll() {
                if (!readyLock || scrollLock) {
                    return;
                }
                if (isPhonePage() && factory.stopScroll === true) {
                    return;
                }

                var sh = this.scrollHeight;
                var st = Math.ceil($(this).scrollTop());
                var h = $(this).outerHeight(true);
                var ids = factory.idsContent;

                type = 'normal';

                if (st <= 0 && ids.length) {
                    type = 'top';
                    scrollContentRequest(type);
                } else if (st >= (sh - h - 2) && ids.length) {
                    type = 'bottom';
                    scrollContentRequest(type);
                }

                $timeout.cancel(scrollTimer);
                scrollTimer = $timeout(scrollCallback, 300);
            }

            function resizeHandle() {
                $(factory.viewNode).children('.cp-section').each(function() {
                    formatHtml($(this));
                });
            }

            function resize() {
                $timeout.cancel(resizeTimer);
                resizeTimer = $timeout(resizeHandle, 300);
            }

            wrap.on({
                scroll: scroll,
                resize: resize
            });
        },
        init: function() {
            var params = factory.params;
            if (!params.contentId) {
                $timeout(function() {
                    $rootScope.$broadcast("cvfaInitError", '参数有误');
                }, 200);
                return;
            }
            factory.art = new wcms.Article(params.contentId, params.t, params.n);
            factory.art.args.uid = params.uid;
            factory.art.args.source = 'PC';
            factory.art.run().done(function(tart) {
                runCat(factory.art);
                runContent(factory.art, params.target);
                $rootScope.$broadcast("cvfaInitReady", tart);
            }).fail(function(err, xhr) {
                $rootScope.$broadcast("cvfaInitError", err, xhr);

                //数据版本不符时重新拉取数据
                if (err === 'new version') {
                    console.info('本地版本与服务器版本不一致，将重新获取课程内容数据');
                    factory.art.ls_clear();
                    factory.init();
                } else {
                    failCallb(err, xhr);
                }
            });
        },
        run: function(type, fn) {
            runArgFn(fn);
        }
    };
    $(window).focus(factory.pageFocus).blur(factory.pageBlur);
    if (isPhonePage()) {
        $('body').addClass('mobile-content-view');
    }
    window.loadingLayerStyleText = window.loadingLayerStyleText || [
        '.loading-layer{position:fixed;width:100%;height:100%;top:0;left:0;background:rgba(0,0,0,.3);z-index:999;transition:opacity .1s;}',
        '.loading-circle{position:absolute;left:50%;top:50%;display:block;width:35px;height:35px;margin:-20px 0 0 -20px;}',
        '.loading-circle::before{content:"";position:absolute;left:-5px;top:-5px;display:block;width:100%;height:100%;border:5px solid rgba(0,0,0,.5);border-radius:50%;}',
        '.loading-circle::after{content:"";position:absolute;left:-5px;top:-5px;display:block;width:100%;height:100%;border:5px solid transparent;border-bottom-color:white;border-radius:50%;}',
        '.loading-amit-spin{-webkit-animation:spin .4s linear infinite;-moz-animation:spin .4s linear infinite;-o-animation:spin .4s linear infinite;animation:spin .4s linear infinite;-moz-transition:border .3s;-o-transition:border .3s;transition:border .3s;}',
        '@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}',
        '@-moz-keyframes spin{0%{-moz-transform:rotate(0);transform:rotate(0)}100%{-moz-transform:rotate(360deg);transform:rotate(360deg)}}',
        '@-o-keyframes spin{0%{-o-transform:rotate(0);transform:rotate(0)}100%{-o-transform:rotate(360deg);transform:rotate(360deg)}}',
        '@keyframes spin{0%{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}'
    ].join('');
    //模板构造
    var templet = {
        isbuild: function(data) {
            var html = [
                '<div class="cp-section cp-isbuild" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '此类型（' + data.t + '）内容正在建设中...',
                '</div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        isedit: function(data) {
            var html = [
                '<div class="cp-section cp-isedit" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '"></div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        T1: function(data) {
            var html = [
                '<div class="cp-section cp-t1" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<h1 class="title">' + data.c.title + '</h1>',
                '</div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        T2: function(data) {
            var html = [
                '<div class="cp-section cp-t2" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<h2 class="title">' + data.c.title + '</h2>',
                '</div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        text: function(data) {
            var html = [
                '<div class="cp-section cp-text" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">' + data.c.c + '</div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        flash: function(data) {
            data.c.src = data.c.url;
            var html = [
                '<div class="cp-section cp-flash" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<div class="timg"><div class="thumbnail">加载中...</div></div>',
                '<div class="w">',
                '<p><a href="javascript:;" class="up">收起 <i class="fa fa-arrow-circle-up"></i></a></p>',
                '<p class="title" style="' + (!data.c.title ? 'display:none' : '') + '">' + data.c.title + '</p>',
                '<div class="flash-w">',
                '<embed src="' + data.c.url + '" data-fid="' + data.c.fid + '"  quality="high" width="100%" height="100%" align="middle" allowscriptaccess="never" allowfullscreen="true" type="application/x-shockwave-flash">',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
            return setNodeEvent(html, data, {
                tag: '.flash-w',
                style: angular.extend({
                    width: '640px',
                    height: '360px'
                }, data.c.style || {})
            });
        },
        embed: function(data) {
            var url = data.c.url || '';
            var oldUrl = '';
            var src = url.match(/\ssrc=["|'](.*?)["|']/) || [];
            if (src[1]) {
                url = url.replace(/(\ssrc=["|']).*?(["|'])/, '$1' + matchVideoSrcAutoPlay(src[1]) + '$2');
            }
            data.c.src = (url.match(/\ssrc=["|'](.*?)["|']/) || [])[1] || '';
            var embed = url.match(/<embed/);
            oldUrl = url;
            if (!embed) {
                url = url.replace(/\s(src=["|']?)/, ' data-$1');
            }
            var html = [
                '<div class="cp-section cp-embed" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<div class="timg"><div class="thumbnail">加载中...</div></div>',
                '<div class="w">',
                '<p><a href="javascript:;" class="up">收起 <i class="fa fa-arrow-circle-up"></i></a></p>',
                '<p class="title" style="' + (!data.c.title ? 'display:none' : '') + '">' + data.c.title + '</p>',
                '<div class="embed-w">' + url + '</div>',
                '</div>',
                '</div>'
            ];
            //判断是否是爱科学的实验
            if (url.match("client/play.action\\?id=")) {
                html[1] = '<div class="timg akx-img"><div class="thumbnail">加载中...</div></div>';
                html[3] = '';
            }
            return setNodeEvent(html.join(''), data, {
                tag: '.embed-w',
                style: data.c.style
            });
        },
        video: function(data) {
            data.c.name = data.c.name ? data.c.name : '';
            var html = [
                '<div class="cp-section cp-video" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<div class="timg"><div class="thumbnail">加载中...</div></div>',
                '<div class="w">',
                '<p><a href="javascript:;" class="up">收起 <i class="fa fa-arrow-circle-up"></i></a></p>',
                '<p class="title" style="' + (!data.c.name ? 'display:none' : '') + '">' + data.c.name.replace(/^.*\/|\..*$/g, '') + data.c.ext + '</p>',
                '<div class="video-w">',
                '<video data-src="' + data.c.url + '" data-fid="' + data.c.id + '" style="width:100%;height:100%;" autoplay="autoplay" controls="controls">您的浏览器不支持 video 标签。</video>',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
            data.c.src = data.c.url || '';
            return setNodeEvent(html, data, {
                tag: '.video-w',
                style: data.c.style
            });
        },
        image: function(data) {
            var html = [
                '<div class="cp-section cp-image" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<span class="img-blank"><img src="' + blankGif + '" data-src="' + data.c.url + '" data-fid="' + data.c.id + '" title="' + (data.c.filename || '') + '" /></span>',
                '</div>'
            ].join('');
            try {
                var temWidth = $(factory.viewNode).width() || 1;
                var rate = data.c.style.width / temWidth;
                if (rate > 1) {
                    data.c.style.width = temWidth;
                    data.c.style.height = data.c.style.height / rate;
                }
            } catch (e) {
                console.log(e);
            }
            return setNodeEvent(html, data, {
                tag: 'img',
                style: data.c.style
            });
        },
        link: function(data) {
            var url = data.c.url;
            if (url && url.match(/esp.aikexue.com/)) {
                if (!url.match(/cid=/)) {
                    url += (url.split('?')[1] ? '&' : '?') + 'cid=' + cid;
                }
                if (!url.match(/host=/)) {
                    url += '&host=' + window.location.host;
                }
                if (data.c.url !== url) {
                    data.c.url = url;
                }
            }

            var html = [
                '<div class="cp-section cp-link" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<a class="link" href="' + data.c.url + '" target="_blank" title="' + data.c.url + '">' + data.c.title + '</a>',
                '</div>'
            ].join('');
            return setNodeEvent(html, data);
        },
        attach: function(data) {
            var icon = 'image-c-floder',
                ext = data.c.ext.replace('.', ''),
                allCount = 0,
                countContent = '',
                title = data.c.title || '未命名';
            try {
                allCount = data.c.info[service.courseContent.convertExt.transExecType[ext]].count || 0;
            } catch (e) { console.log(e); }

            var html = [
                '<div class="cp-section cp-practise" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<div class="w">',
                '<i class="' + icon + '"></i>',
                '<div class="c d-b">',
                '<p class="title" title="' + title + '">' + title + '</p>',
                '<p class="detail text-of"></p>',
                '<div class="action phone-view"><a class="do-t-btn dl" href="' + data.c.url + '" data-fid="' + data.c.id + '" title="' + data.c.url + '"></a><div>',
                '</div>',
                '</div>',
                '</div>',
            ];

            if (allCount) {
                countContent = '0/' + allCount + '页';
                html[3] = '<div class="c" style="display: block;">';
                html[5] = '<p class="detail text-of">' + countContent + '</p>';
            }

            return setNodeEvent(html.join(''), data);
        },
        e_es: function(data) {
            var icon = 'image-c-paper',
                title = data.c.title || '未命名';
            if (data.c.tid) {
                icon = 'image-c-exam';
            }
            var html = [
                '<div class="cp-section cp-practise" data-cid="' + data.cvp.id + '" data-cpn="' + data.cvp.pn + '">',
                '<div class="w">',
                '<i class="' + icon + '"></i>',
                '<p class="ldg"></p>',
                '<div class="c">',
                '<p class="title" title="' + title + '">' + title + '</p>',
                '<p class="detail text-of"><span class="status" >0/0题<span></p>',
                '<div class="action"><span class="showScore">成绩<span class="score"></span>，</span><a href="javascript:;" class="do-t-btn"> 开始做题 </a><span class="redo-t-btn">，<a href="javascript:;">再做一次</a><span><div>',
                '</div>',
                '</div>',
                '</div>'
            ].join('');
            return setNodeEvent(html, data);
        }
    };
    /**
     * [runFiles 获取文件信息]
     * @param  {[type]}   items [description]
     * @param  {[type]}   tids  [description]
     * @param  {Function} done  [description]
     * @param  {[type]}   fail  [description]
     * @return {[type]}         [description]
     */
    function runFiles(items, tids, done, fail) {
        var of = {};
        var markArr = [];
        var list = [];
        angular.forEach(tids, function(val) {
            list.push(items[val]);
        });
        angular.forEach(list, function(item) {
            switch (item.t) {
                case 'attach':
                case 'video':
                case 'flash':
                case 'image':
                    markArr.push(item.c.mark);
                    of[item.c.mark] = item;
                    break;
            }
        });
        if (!markArr.length) {
            runArgFn(done);
            return;
        }
        service.courseContent.getFileInfo(markArr).then(function(rs) {
            for (var mark in rs.data) {
                angular.extend(of[mark].c, rs.data[mark].base);
            }
            setFilesEvent(of);
            runArgFn(done, rs);
        }, function(err) {
            runArgFn(done);
            runArgFn(fail, err, (markArr.length ? of : null));
        });
    }
    /**
     * 读取请求到的数据章节
     * @param  {[type]} type     [滚动类型，向上滚'top']
     * @param  {[type]} ids      [内容ID集合]
     * @param  {[type]} pn       [页数]
     * @param  {[type]} loadNext [是否加载下一页]
     * @return {[type]}          [description]
     */
    function pageRequest(type, ids, pn, loadNext) {
        console.log('内容');
        console.log(factory.content);
        if (factory.content.page[pn]) {
            console.log('aa4', pn);
            showContent(pn);
            return;
        }
        var sucb = function(tart, items, tids, argPn) {
                console.log('/* request page content ' + tids + ' */');
                runFiles(items, tids, function() {
                    factory.content.page[argPn] = tids;
                    pushContent(type, items, tids, argPn);
                }, function(err, of) {
                    if (of) {
                        fileErr(of, '获取文件id失败');
                    }
                    console.error(err, ' 获取文件id失败');
                });
            },
            errcb = function(err, xhr) {
                mcFailEvent('error', err);
            };
        pageHandel(ids, pn, sucb, errcb);
        if (loadNext) {
            pageHandel(ids, pn + 1, sucb, errcb);
        }
    }
    return factory;
    //new end  
}]);

//@ 目录列表
module.directive("contentList", function() {
    return {
        template: [
            '<div class="content-list">',
            '<div ng-if="loading" class="loading-mask">加载中...</div>',
            '<div ng-if="errorLock" class="error-mask">加载失败...</div>',
            '<div ng-if="infoLock" class="info-mask">{{infoText}}</div>',
            '<ul ng-hide="errorLock">',
            '<li ng-repeat="item in cat.items track by $index" ng-if="item.type===\'T1\' || item.type===\'T2\'" ng-class="{action: actionId == item.id, t1: item.type === \'T1\', t2: item.type === \'T2\'}" ng-click="triggerContent(item.id)" data-tid="{{item.id}}">',
            '<a title="{{item.title}}">{{item.title}}</a>',
            '</li>',
            '</ul>',
            '</div>'
        ].join(''),
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: ['$rootScope', '$scope', '$element', '$attrs', 'cvfa', function($rootScope, $scope, $element, $attrs, cvfa) {
            function onrequest() {
                $scope.loading = true;
            }

            function onready() {
                $scope.loading = false;
            }

            function onerror() {
                onready();
                $scope.errorLock = true;

                try {
                    $scope.$digest();
                } catch (e) {}
            }

            function oninfo(text) {
                onready();
                $scope.infoLock = true;
                $scope.infoText = text;
            }

            function locatCat(id) {
                var p = $('li[data-tid="' + id + '"]').position();
                var wrap = $($element);
                console.log('aa3', id, p);
                if (p && (p.top < 0 || p.top > wrap.height())) {
                    wrap.stop().animate({
                        scrollTop: wrap.scrollTop() + p.top
                    }, 'normal');
                }
            }
            /**
             * 跳章节
             * @param  {[type]} id [章节ID]
             * @return {[type]}    [description]
             */
            $scope.triggerContent = function(id) {
                cvfa.locateContentTarget(id);
                cvfa.setKeyValue($rootScope.currentUser.uid + '_' + cvfa.courseId, id);
            };

            $scope.$on('actionAatId', function(ev, id) {
                $scope.actionId = id;
                locatCat(id);
            });

            $scope.$on("cvfaInitReady", function() {
                // console.log(cvfa.idsCat);
                // onready();
            });

            $scope.$on("cvfaInitError", function(ev, err, xhr) {
                onerror();
                console.error(err, xhr, '// this is on cvfaInitError console fail msg');
            });

            $scope.$on("makeCatReady", function() {
                $scope.cat = cvfa.cat;
                onready();
                if (!$scope.cat.items.length) {
                    oninfo('(∩_∩)还没有内容~~~');
                }
            });

            $scope.$on("makeCatError", function(ev, err, xhr) {
                onerror();
                console.error(err, xhr, '// this is on makeCatError console fail msg');
            });

            cvfa.run('list', function() {
                onrequest();
            });
        }]
    };
});

//@ 内容视图
module.directive("contentView", function() {
    return {
        template: [
            '<div class="content-view">',
            '<div ng-if="loading" class="loading-mask">加载中...</div>',
            '<div ng-if="errorLock" ng-click="reloadPage()" class="error-mask">加载失败...</div>',
            '<div ng-if="infoLock" class="info-mask">{{infoText}}</div>',
            '<div class="content-iframe" ng-hide="errorLock"></div>',
            '<iframe id="file-downl-iframe" width="0" height="0" frameborder="no" marginwidth="0" marginheight="0" scrolling="no"></iframe>',
            '</div>'
        ].join(''),
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: ['$rootScope', '$scope', '$element', '$attrs', '$compile', 'cvfa', function($rootScope, $scope, $element, $attrs, $compile, cvfa) {

            function onrequest() {
                $scope.loading = true;
            }

            function onready() {
                $scope.loading = false;
            }

            function onerror() {
                onready();
                $scope.errorLock = true;

                try {
                    $scope.$digest();
                } catch (e) {}
            }

            function oninfo(text) {
                onready();
                $scope.infoLock = true;
                $scope.infoText = text;
            }

            /**
             * 重新加载
             * @return {[type]} [description]
             */
            $scope.reloadPage = function() {
                location.reload();
            };

            $scope.$on("cvfaInitReady", function(ev, tart) {
                // console.log(tart);
                // console.log(cvfa.idsContent);
                // onready();
            });

            $scope.$on("cvfaInitError", function(ev, err, xhr) {
                onerror();
                console.error(err, xhr, '// this is on cvfaInitError console fail msg');
            });

            $scope.$on("makeContentReady", function() {
                onready();
            });

            $scope.$on("makeContentError", function(ev, type, err) {
                switch (type) {
                    case 'info':
                        oninfo(err);
                        break;
                    default:
                        onerror();
                }
                console[type](err, '// this is on makeContentError console fail msg');
            });

            $scope.$on("locateContentTarget", function() {
                onrequest();
            });

            cvfa.viewNode = $($element).find('.content-iframe');

            cvfa.on('scroll', function(factory, type, sid, id) {
                console.log('滚动视图', type, sid, id);
            });

            cvfa.run('content', function() {
                onrequest();
            });
        }]
    };
});

//@ 提示窗
module.directive("cvDialog", function() {
    return {
        template: [
            '<div class="win-wrap" id="c-v-dialog" ng-show="cViewDialog.show">',
            '<div class="win-mark"></div>',
            '<div class="win-bd"></div>',
            '<div class="my-wrap jf-drag">',
            '<div class="my-main">',
            '<div class="win-hd">',
            '<span>提示</span>',
            '</div>',
            '<div class="inner">{{cViewDialog.text}}</div>',
            '<div class="full-w">',
            '<a href="javascript:;" class="blue-btn" ng-click="continueLearning($event)" ng-hide="cViewDialog.type">继续学习</a>',
            '<a href="javascript:;" class="blue-btn" ng-click="continueLearning($event)" ng-show="cViewDialog.type == \'做题\'" style="margin:0 10px;">已完成做题</a>',
            '<a href="javascript:;" class="white-btn" ng-click="continueLearning($event)" ng-show="cViewDialog.type == \'做题\'" style="margin:0 10px;">未完成做题</a>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join(''),
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {},
        controller: ['$scope', '$rootScope', 'cvfa', function($scope, $rootScope, cvfa) {
            $scope.cViewDialog = {};
            $scope.continueLearning = function(ev) {
                $scope.cViewDialog.show = false;
                if ($scope.cViewDialog.type === '做题') {
                    $scope.cViewDialog.paperNode.reloadPaper();
                }
            };

            $scope.$on('bcvPractise', function(ev, show, type, origin, target) {
                if (cvfa.self) {
                    return;
                }
                var text = '刚刚离开学习页，已暂停学习！';
                switch (type) {
                    case '做题':
                        text = '您在新开的页面进行做题，请进行如下操作';
                        break;
                }
                $scope.cViewDialog = angular.extend($scope.cViewDialog, {
                    text: text,
                    type: type,
                    origin: origin,
                    show: show,
                    paperNode: target
                });
                try {
                    $scope.$digest();
                } catch (e) {}
            });
        }]
    };
});
