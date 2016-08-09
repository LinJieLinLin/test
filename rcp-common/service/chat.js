/* globals g_conf, unescape, jf, IM, C4js, Base64 */
angular.module('RCP').factory('chatService', ['$http', '$q', '$rootScope', 'service', function ($http, $q, $rootScope, service) {
    /* jshint camelcase:false */

    function queryString (name) {
        var result=window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
        if(!result){
            return '';
        }
        return decodeURIComponent(result[1]);
    }
    function getCookie (sName) {
        var aCookie = document.cookie.split('; ');
        for (var i=0; i < aCookie.length; i+=1) {
            var aCrumb = aCookie[i].split('=');
            if (sName === aCrumb[0]){
                if (!aCrumb[1]) {
                    return queryString('token');
                }
                return unescape(aCrumb[1]);
            }
        }
        return null;
    }
    function getToken (local) {
        if (local) {
            return localStorage.getItem('anonymousLoginToken');
        }
        var token = rcpAid.getToken();
        return token;
    }
    var addr       = g_conf;
    var slice      = [].slice;
    var allUsers   = {};
    var recordMap  = {};
    var enableLog  = window.location.hostname === 'localhost';
    var eventList  = {};
    var uploadType = 2;
    var groups = {
        'S-GRP': {
            name: '我的学生',
            users: [],
            type: 'S-GRP',
            order: 1
        },
        'C-GRP': {
            name : '学习群组',
            users: [],
            type : 'C-GRP',
            order: 3
        },
        'T-GRP': {
            name: '我的老师',
            users: [],
            type: 'T-GRP',
            order: 4
        },
        'My-GRP': {
            name: '我的讨论组',
            users: [],
            type: 'My-GRP',
            order: 5
        },
        'DEFAULT': {
            name : '我的好友',
            users: [],
            type : 'DEFAULT',
            order: 2
        },
    };
    var groupInfo = {
        userList: {
            teachers: {
                name     : '老师',
                users    : [],
                role     : ['GUIDE', 'ANSWER'],
                isTeacher: true
            },
            students: {
                name     : '学生',
                users    : [],
                role     : ['MEMBER'],
                isTeacher: false
            },
            member: {
                name: '讨论组成员',
                users: [],
                role: ['']
            }
        },
        cid: 0,
        gType: '',
        oid: 0,
        uuid: ''
    };
    var groupsDetailList = {};
    var self             = {};
    var recentUser       = [];
    var uploadFiles      = {};
    var chatTarget       = {};
    var unread           = {};
    var friendRequests   = [];
    var token            = getToken();
    var unreadMsgList    = [];
    var serveList        = [];
    var loginStatus, websocket, wsConnected, uploader, uploadInputId, base64, uploadImgId;

    function changeUploadType (type) {
        uploadType = type;
    }

    function request (option) {
        return $http(option).then(function (response) {
            var defer = $q.defer();
            if (response.data.code !== 0) {
                defer.reject({
                    type: 1,
                    data: response
                });
            } else {
                defer.resolve(response.data);
            }
            return defer.promise;
        }, function (err) {
            throw {
                type: -1,
                data: err
            };
        });
    }
    function anonymousLogin () {
        return request({
            method: 'GET',
            url: 'http://' + addr.SSO + '/sso/api/anonymousLogin'
        });
    }
    function getUserGroups () {
        return request({
            url: addr.friendsAddr + '/usr/get-user-grps',
            params: {
                token: token
            },
            method: 'GET'
        });
    }
    function getUserInfo (id,t) {
        return request({
            url: addr.friendsAddr + '/get-usr-info',
            params: {
                token: token,
                r: id,
                t: t
            },
            method: 'GET',
            headers: {
                'Content-Type': undefined
            },
            option: {
                requestErrorMsg: false
            }
        });
    }
    function getGroup (id, cid) {
        return request({
            url: addr.friendsAddr + '/get-grp-info',
            params: {
                token: token,
                r: id,
                cid: cid
            },
            method: 'GET'
        });
    }
    function getServeList () {
        return request({
            url: addr.friendsAddr + '/usr/get-usr-courgrp',
            params: {
                token: token
            },
            method: 'GET'
        });
    }
    function getRecentUser () {
        return request({
            url: addr.rdisAddrSrv + 'usr/api/listRinfo',
            params: {
                token: token
            },
            method: 'GET',
            option: {
                requestErrorMsg: false
            }
        });
    }
    function getRecordList (option) {
        if (option.sender && option.sender[0] === 'G') {
            option.reciever = option.sender;
            delete option.sender;
        }
        return request({
            url: addr.rdisAddrSrv + 'usr/api/listRecord',
            params: {
                token   : token,
                s       : option.sender,
                r       : option.reciever,
                btime   : option.beginTime,
                etime   : option.endTime,
                pageNo  : option.pageNo,
                pageSize: option.pageSize,
                filter  : option.filter,
                o       : option.order,
                sid     : option.id
            },
            method: 'GET',
            option: {
                requestErrorMsg: false
            }
        }).then(function (data) {
            var defer = $q.defer();
            defer.resolve();
            var list = [];
            return data.data.list.reduce(function (p, item) {
                var d = parseTime(item.time).split(' ');
                item.c = Base64.decode(item.c);
                if (item.t === 11) {
                    try {
                        var text = JSON.parse(item.c);
                        var str1 = ['亲爱的',
                                    text.userName, 
                                    '同学，欢迎加入《',
                                    text.courseName,
                                    '》课程。我们将会为你规划学习路线，提供学习指引。学习过程中的任何困惑，我们都会帮助你解决。快去课程学习页学习吧!'].join('');
                        var str2 = text.userName + '加入本群';
                        if (text.userName === self.name) {
                            item.c = str1;
                        } else {
                            item.c = str2;
                        }
                    } catch (err) {

                    }
                }
                return p.then(function () {
                    return getSender(item.s).then(function (user) {
                        var tmp = {
                            day        : d[0],
                            time       : d[1],
                            t          : item.time,
                            msg        : parseMsg(item),
                            sender     : user,
                            fileType   : item.t,
                            originalMsg: item,
                            isMine     : item.s === self.uuid,
                            msgId      : item.i
                        };
                        recordMap[option.sender] = recordMap[option.sender] || {};
                        recordMap[option.sender][item.i] = tmp;
                        list.push(tmp);
                    });
                });
            }, defer.promise).then(function () {
                return {
                    total   : data.data.total,
                    pageNo  : option.pageNo,
                    pageSize: option.pageSize,
                    msg     : list                
                };
            });

        });
    }
    function searchUser (option) {
        return request({
            url: addr.friendsAddr + '/usr/search-usr',
            params: {
                name : option.name,
                ps   : option.ps,
                pn   : option.pn,
                token: token,
            },
            method: 'GET'
        });
    }
    function requestFriend (option) {
        return request({
            url: addr.friendsAddr + '/usr/req-friend',
            params: {
                uuid : option.uuid,
                msg  : option.msg,
                token: token,
            },
            method: 'GET'
        });
    }
    function handleFriendRequest (option) {
        return request({
            url: addr.friendsAddr + '/usr/del-req-friend',
            params: {
                // opt: 1 未读，2 拒绝，3 忽略，4 接受，5 已读
                opt: option.action,
                oid: option.oid,
                token: token
            },
            method: 'GET'
        });
    }
    function getNotify (type) {
        return request({
            url: addr.friendsAddr + '/usr/list-notify',
            method: 'GET',
            params: {
                token: token,
                t: type
            }
        });
    }
    function createGroup (uids) {
        return request({
            url: addr.friendsAddr + '/usr/add-discuss-grp',
            method: 'GET',
            params: {
                token: token,
                uids: uids
            }
        });
    }
    function getGuideTeacher () {
        return request({
            url: addr.friendsAddr + '/sel-help',
            method: 'GET',
            params: {
                token: token
            }
        });
    }
    function getAnswerTeacher (ids) {
        return request({
            url: addr.friendsAddr + '/usr/sel-answer',
            method: 'GET',
            params: {
                token: token,
                uuids: ids
            }
        });
    }
    function devlog (a, b, c) {
        if (enableLog) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {
                console.log(a, b, c);
            }
        }
    }
    function log (a, b, c) {
        var arr;
        if (typeof jf !== 'undefined' && jf.alert) {
            arr = slice.call(arguments);
            jf.alert(arr.join(','));
        } else {
            devlog.apply(this, arguments);
            arr = slice.call(arguments);
            alert(arr.join(','));
        }
    }
    function saveToken (token) {
        if (localStorage) {
            localStorage.setItem('anonymousLoginToken', token);
        }
        jf.setCookie('token2', token);
    }
    function escape (text) {
        text = text.replace(/&/g, '&gt;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
        text = text.replace(/\'/g, '&#39;');
        text = text.replace(/\'/g, '&quot;');
        text = text.replace(/\n/g, '<br>');
        return text;
    }
    function parseSize (size) {
        if (size > 1024) {
            if (size > (1024 * 1024)) {
                return (size/(1024*1024)).toFixed(2) + ' M';
            } else {
                return Math.floor(size/1024) + ' K';
            }
        } else {
            return size + ' B';
        }
    }
    function parseMsg (msg) {
        var obj;
        var result;
        var text      = msg.c;
        var urlRegexp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/gi;
        var tmpl;
        switch (msg.t) {
            case 2: {
                try {
                    obj    = JSON.parse(text);
                    result = '<a href="javascript:;" onclick="showPic(this)"><img src="' + obj.url + '?s=1" /></a>';
                } catch (err) {
                    text   = escape(text);
                    result = '<div>' + text + '</div>';
                }
                break;
            }
            case 3: {
                try {
                    obj         = JSON.parse(text);
                    tmpl    = ['<div class="chat-msg-file"><div class="chat-msg-file-icon"><img src="/img/icon-92.png" /></div>',
                    '<div class ="chat-msg-file-info"><span class="chat-msg-filename" title="{{name}}">',
                    '{{name}}</span><span class="chat-msg-filesize">({{size}})</span>',
                    '<p><a href ="{{url}}?dl=1" dl="1" target="_blank" download>下载</a></p></div></div>'].join('');
                    tmpl        = tmpl.replace(/{{name}}/gi, obj.name);
                    tmpl        = tmpl.replace(/{{url}}/gi, obj.url);
                    tmpl        = tmpl.replace(/{{size}}/gi, parseSize(obj.size));
                    result      = tmpl;
                } catch (err) {
                    text   = escape(text);
                    result = '<div>' + text + '</div>';
                }
                break;
            }
            case 20: {
                try {
                    obj = JSON.parse(text);
                    tmpl = ['<div class="chat-recommend-course"><p class="chat-course-recommend-head">课程推荐</p>',
                    '<div class="chat-course-cover"><img src="{{img}}" /></div><div class ="chat-course-info">',
                    '<p class="chat-course-name" title="{{name}}">课程名称：{{name}}</p><p class="chat-course-teacher">创建者：{{teacher}}</p>',
                    '<p class="chat-course-action"><a href ="{{url}}" target="_blank">立即参与</a></p></div></div>'].join('');
                    tmpl = tmpl.replace(/{{img}}/gi, obj.imgs.split(',')[0] || '/img/icon-65.gif');
                    tmpl = tmpl.replace(/{{name}}/gi, obj.name);
                    tmpl = tmpl.replace(/{{teacher}}/gi, obj.userName);
                    tmpl = tmpl.replace(/{{url}}/gi, '/course-detail.html?id=' + obj.id);
                    result = tmpl;
                } catch (err) {
                    text=  escape(text);
                    result = '<div>' + text + '</div>';
                }
                break;
            }
            default: {
                text = escape(text);
                var hasLink = urlRegexp.test(text);
                text = text.replace(urlRegexp, function (match) {
                    var linkTmpl = '<a target="_blank" class="chat-msg-link" href="{{href}}" title="">{{href}}</a>';
                    return linkTmpl.replace(/{{href}}/gi, match) ;
                });
                if (hasLink) {
                    result = '<div class="chat-msg-has-link">' + text + '</div>';
                } else {
                    result = '<div class="chat-msg-has-content">' + text + '</div>';
                }
                break;
            }
        }
        return result;
    }
    function parseTime(text, displaySecond, format) {
        var d      = new Date(text);
        var year   = d.getFullYear();
        var month  = d.getMonth() + 1;
        var day    = d.getDate();
        var hour   = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        var result = '';
        month      = month > 9 ? month : '0' + month;
        day        = day > 9 ? day : '0' + day;
        hour       = hour > 9 ? hour : '0' + hour;
        minute     = minute > 9 ? minute : '0' + minute;
        second     = second > 9 ? second : '0' + second;

        if (format) {
            result = format.replace(/yy/g, year);
            result = result.replace(/mm/g, month);
            result = result.replace(/dd/g, day);
            result = result.replace(/hh/g, hour);
            result = result.replace(/MM/g, minute);
            result = result.replace(/ss/g, second);
            return result;
        }

        return [year, month, day].join('-') + ' ' + (displaySecond ? [hour, minute, second].join(':') : [hour, minute].join(':'));
    }
    function handleEvent (name, fn, context, once) {
        if (eventList[name] && eventList[name].length) {
            eventList[name].push({fn: fn, context: context || this, once: once});
        } else {
            eventList[name] = [{fn: fn, context: context || this, once: once}];
        }
        return this;
    }
    function triggerEvent (name) {
        var arg = slice.call(arguments, 1);
        if (eventList[name] && eventList[name].length) {
            angular.forEach(eventList[name], function (item) {
                if (item.once && item.called) {
                    return;
                }
                item.fn.apply(item.context, arg);
                item.called = true;
            });
        }
    }

    function sortUser (arr) {
        arr.sort(function (user) {
            return user.online ? -1 : 1;
        });
    }

    handleEvent('enterChat', function (user) {
        chatTarget = user;
        unread[chatTarget.uuid] = 0;

        if (!allUsers[user.uuid]) {
            user.msg = [];
            allUsers[user.uuid] = user;
        }
        var flag = false;
        var i = 0;
        for (; i < recentUser.length; i+=1) {
            if (recentUser[i].uuid === user.uuid) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            recentUser.unshift(user);
        }
        
        var msgs = allUsers[chatTarget.uuid].msg;
        var ids = [];
        angular.forEach(msgs, function (msg) {
            if (msg.unread) {
                ids.push(msg.msgId);
                msg.unread = false;
            }
        });
        if (ids.length) {
            var uuid;
            if (chatTarget.uuid === 'U-00') {
                uuid = 'U-0';
            } else {
                uuid = chatTarget.uuid;
            }
            websocket.markRead(ids.join(','), uuid);
        }
        for (i = 0; i < unreadMsgList.length; i+= 1) {
            if (unreadMsgList[i].uuid === user.uuid) {
                unreadMsgList.splice(i, 1);
                i -= 1;
            }
        }
    });

    handleEvent('closeChat', function () {
        chatTarget = null;
    });

    handleEvent('hasUnhandleRequest', function () {
        var flag = false;
        for (var i = 0; i < recentUser.length; i+=1) {
            if (recentUser[i].uuid === 'U-0') {
                flag = true;
                break;
            }
        }
        if (!flag) {
            var user = {
                type: 'friendNotify',
                name: '系统通知',
                img : 'images/icon/friend-notify.png',
                id  : 0,
                uuid: 'U-0',
                online: true
            };
            recentUser.unshift(saveUserInGlobal(user));
        }
    });

    function saveUserInGlobal (user) {
        if (!allUsers[user.uuid]) {
            user.msg = [{
                fileType: -1
            }];
            allUsers[user.uuid] = user;
        }
        return user;
    }
    function getUserOrGroupInfo (uuid, cid) {
        function getInfo () {
            if (cid) {
                return getGroup(undefined, cid);
            } else if (uuid && uuid[0] === 'G') {
                return getGroup(uuid);
            } else {
                return getUserInfo(uuid, 'w');
            }
        }
        return getInfo().then(function (data) {
            var type = uuid && uuid[0] === 'G' ? 'group' : 'user';
            var u = {
                type: type,
                name: data.data.name,
                img : data.data.img,
                id  : data.data.id,
                uuid: data.data.ugid || data.data.uuid,
                online: type === 'group' ? true : !!data.data.online,
                isGuest: !!data.data.tour
            };
            saveUserInGlobal(u);
            if (data.data.users && data.data.users.length) {
                angular.forEach(data.data.users, function (user) {
                    var u = {
                        type: 'user',
                        name: user.name,
                        img : user.img,
                        id  : user.id,
                        uuid: user.uuid,
                        online: !!user.online
                    };
                    saveUserInGlobal(u);
                });
            }
            return data;
        });
    }
    function getSender (uuid) {
        var defer = $q.defer();
        if (allUsers[uuid]) {
            defer.resolve(allUsers[uuid]);
        } else {
            devlog('get user from server');
            return getUserOrGroupInfo(uuid).then(function (data) {
                var u = {
                    type: data.data.ugid ? 'group' : 'user',
                    name: data.data.name,
                    img : data.data.img,
                    id  : data.data.id,
                    uuid: data.data.ugid || data.data.uuid,
                    online: true,
                    isGuest: !!data.data.tour
                };
                return u;
            });
        }
        return defer.promise;
    }
    function registerWS () {
        var defer = $q.defer();
        if (websocket) {
            if (wsConnected) {
                defer.resolve();
            } else {
                handleEvent('wsConnected', function () {
                    defer.resolve();
                }, this, true);
            }
        } else {
            websocket = IM.NewIm(addr.imAddr, true);
            websocket.on('connect', function () {
                wsConnected = true;
                loginStatus = 'pending';
                triggerEvent('wsConnected');
                return loginToWS(token).then(function () {
                    defer.resolve();
                });
            });
            handleWSEvent();
        }
        return defer.promise;
    }
    function loginToWS (token) {
        var defer = $q.defer();
        loginStatus = loginStatus || 'pending';
        if (loginStatus === 'logined') {
            defer.resolve();
        } else {
            if (token) {
                websocket.emit('li', {token: token, ctype: '20'});
                loginStatus = 'logined';
                triggerEvent('wsLogined');
                defer.resolve();
            } else {
                anonymousLogin().then(function (data) {
                    saveToken(data.data.token);
                    loginStatus = 'logined';
                    triggerEvent('wsLogined');
                    defer.resolve();
                }, function (err) {
                    defer.reject({msg: 'websocket 登陆失败', err: err});
                });
            }
        }
        return defer.promise;
    }
    function anonymouse () {
        var defer = $q.defer();
        var cancelWatch = $rootScope.$watch('anonymousUser', function (value) {
            if (value) {
                token = value.token || localStorage.getItem('anonymousLoginToken');
                defer.resolve();
                cancelWatch();
            }
        });
        return defer.promise;
    }
    function handleWSEvent () {    
        websocket.on('li', function (data) {
            if (data.code !== 0) {
                triggerEvent('wsLoginError', data);
                devlog(data.err);
            } else {
                triggerEvent('wsLogined');
                websocket.emit('ur', {});
            }
        });
        websocket.on('m', function (data) {
            var id, uuid;
            if (data.a[0] === 'G') {
                id   = +data.a.split('-')[1];
                uuid = data.a;
            } else {
                id   = +data.s.split('-')[1];
                uuid = data.s;
            }

            if (recordMap[uuid] && recordMap[uuid][data.i]) {
                return;
            }

            if (data.t === 11) {
                try {
                    var text = JSON.parse(data.c);
                    var str1 = ['亲爱的',
                                text.userName, 
                                '同学，欢迎加入《',
                                text.courseName,
                                '》课程。我们将会为你规划学习路线，提供学习指引。学习过程中的任何困惑，我们都会帮助你解决。快去课程学习页学习吧!'].join('');
                    var str2 = text.userName + '加入本群';
                    if (text.userName === self.name) {
                        data.c = str1;
                    } else {
                        data.c = str2;
                    }
                    if (text.userName === self.name || ($rootScope.currentUser && $rootScope.currentUser.auth === 1)) {
                        getServe();
                        getMyInfoAndGroup();
                    }
                } catch (err) {

                }
            }

            if (data.t === 10) {
                try {
                    var msg = JSON.parse(data.c);
                    var flag = false;
                    for (var i = 0; i < friendRequests.length; i +=1) {
                        if (friendRequests[i].oid === msg.req.oid) {
                            friendRequests[i].status = msg.req.status;
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        msg.req.date = parseTime(msg.req.time || new Date().getTime()).split(' ')[0];
                        if (msg.req.status === 4) {
                            var user = {
                                type: 'user',
                                name: msg.req.rName,
                                img : msg.req.rImg,
                                id  : +msg.req.r.split('-')[1],
                                uuid: msg.req.r,
                                online: !!msg.req.online
                            };
                            groups['DEFAULT'].users.push(saveUserInGlobal(user));
                        }
                        friendRequests.push(msg.req);
                    }
                } catch (err) {

                }
            }

            if (data.t === 15) {
                triggerEvent('realTimeUser', data);
                websocket.markRead(data.i, data.a);
                return;
            }

            if ((!chatTarget || chatTarget.uuid !== uuid) && data.t !== 15)  {
                unread[uuid] = typeof unread[uuid] === 'undefined' ? 1 : unread[uuid] + 1;
                data.unread = true;
            } else {
                websocket.markRead(data.i, data.a);
                data.unread = false;
            }

            getSender(data.s, data.t).then(function (sender) {
                data.c    = parseMsg(data);
                data.time = parseTime(data.time);
                getSender(uuid).then(function () {
                    if (recordMap[uuid] && recordMap[uuid][data.i]) {
                        return;
                    }
                    var msg = {
                        isMine  : false,
                        msg     : data.c,
                        time    : data.time,
                        type    : data.a[0],
                        sender  : sender,
                        fileType: data.t,
                        uuid    : uuid,
                        msgId   : data.i,
                        unread  : data.unread
                    };
                    switch (msg.fileType) {
                        case 2:
                            msg.message = '[图片]';
                            break;
                        case 3:
                            msg.message = '[附件]';
                            break;
                        case 10:
                            msg.message = '收到新的好友通知';
                            break;
                        default:
                            msg.message = angular.element(msg.msg).text();
                    }
                    allUsers[uuid].msg.push(msg);
                    if (msg.unread) {
                        unreadMsgList.unshift(msg);
                    }
                    popUpUser(uuid);
                    triggerEvent('wsMsg', data, msg);
                });
            });
        });
        websocket.on('error', function (err) {
            triggerEvent('wsError', err);
        });
        websocket.on('close', function (e) {
            triggerEvent('wsClose', e);
        });
    }
    function sendMsg (user, type, content) {
        if (!websocket) {
            log('尚未连接服务器。');
            return false;
        }
        if (!content) {
            log('不能发送空白消息');
            return false;
        }
        var msg = {
            t: type || 0,
            r: [user.uuid],
            c: content,
        };
        content = parseMsg(msg);
        websocket.sms2(msg);

        var obj = {
            time    : parseTime(new Date().getTime()),
            isMine  : true,
            msg     : content,
            sender  : self,
            senderId: self.uuid,
            fileType: type,
            id      : user.id
        };
        allUsers[user.uuid].msg.push(obj);
        popUpUser(user.uuid);
        triggerEvent('wsSendMsg', user, obj);
    }
    function getServe () {
        return getServeList().then(function (data) {
            serveList.splice(0, serveList.length);
            angular.forEach(data.data, function (course) {
                var uuids = {};
                angular.forEach(course.users, function (user) {
                    var u = {
                        name: user.name,
                        id: user.id,
                        img: user.img,
                        online: !!user.online,
                        role: user.role,
                        type: 'user',
                        uuid: user.uuid,
                        msg: []
                    };
                    saveUserInGlobal(u);
                    if (uuids[u.uuid]) {
                        uuids[u.uuid].role = [uuids[u.uuid].role, u.role].join(',');
                    } else {
                        uuids[u.uuid] = u;
                    }
                });
                course.teachers = uuids;
                serveList.push(course);
            });
        });
    }
    function getMyInfoAndGroup () {
        return getUserOrGroupInfo().then(function (data) {
            self.id   = data.data.id;
            self.name = data.data.name;
            self.img  = data.data.img;
            self.uuid = data.data.uuid;
            self.type = 'user';
            triggerEvent('userLogin', self);
            angular.forEach(groups, function (g) {
                g.users.splice(0, g.users.length);
            });
            angular.forEach(data.data.friendGrp, function (group) {
                var users = [];
                angular.forEach(group.users, function (user) {
                    var u = {
                        type: 'user',
                        name: user.name,
                        id: user.id,
                        img: user.img,
                        uuid: user.uuid,
                        online: !!user.online
                    };
                    saveUserInGlobal(u);
                    if (user.type === 'COURSE_GRP') {
                        u.type = 'group';
                        u.online = true;
                        groups['C-GRP'].users.push(u);
                    }
                    if (user.type === 'CHAT_GRP') {
                        u.type = 'group';
                        u.online = true;
                        groups['My-GRP'].users.push(u);
                    }
                    users.push(u);
                });
                if (groups[group.gType]) {
                    groups[group.gType].users = users;
                }
            });
        }).then(function () {
            angular.forEach(groups, function (group) {
                sortUser(group.users);
            });
        });
    }
    function getFriendsGroup () {
        return getUserGroups().then(function (data) {
            angular.forEach(data.data, function (group) {
                angular.forEach(groups, function (g) {
                    if (group.gType === g.type) {
                        angular.forEach(group.users, function (user) {
                            var u = {
                                type: 'user',
                                name: user.name,
                                id  : user.id,
                                img : user.img,
                                uuid: user.uuid,
                                online: !!user.online
                            };
                            g.users.push(saveUserInGlobal(u));
                        });
                    }
                });
            });
        });
    }
    function loadGroupInfo (data) {
        groupInfo.cid = data.data.cid;
        groupInfo.oid = data.data.oid;
        groupInfo.uuid = data.data.ugid;
        groupInfo.gType = data.data.gType;
        groupInfo.course = data.data.course;
        if (groupInfo.gType === 'CHAT_GRP') {
            groupInfo.userList.member.users = data.data.users;
        } else {
            angular.forEach(groupInfo.userList, function (group) {
                group.users.splice(0, group.users.length);
                angular.forEach(data.data.users, function (user) {
                    if (group.role.indexOf(user.role) !== -1) {
                        var obj = {
                            id: user.id,
                            img: user.img,
                            role: [user.role],
                            uuid: user.uuid,
                            type: user.type,
                            name: user.name
                        };
                        var flag = false;
                        angular.forEach(group.users, function (u) {
                            if (user.id === u.id) {
                                u.role.push(user.role);
                                flag = true;
                            }
                        });
                        if (!flag) {
                            group.users.push(obj);
                        }
                    }
                });
            });
        }
    }
    function getGroupDetail (uuid) {
        if (groupsDetailList[uuid]) {
            var defer = $q.defer();
            groupInfo = groupsDetailList[uuid];
            defer.resolve();
            return defer.promise;
        } else {
            return getUserOrGroupInfo(uuid).then(function (data) {
                if (data.data.cid) {
                    return request({
                        url: 'get-course',
                        method: 'GET',
                        params: {
                            id: data.data.cid
                        },
                        option: {
                            loading: false
                        }
                    }).then(function (d) {
                        data.data.course = d.data;
                        loadGroupInfo(data);
                        return data;
                    });
                } else {
                    loadGroupInfo(data);    
                    return data;
                }
            });
        }
    }
    function getRecentUserList () {
        return getRecentUser().then(function(data){
            angular.forEach(data.data, function (user) {
                var u = {
                    name: user.alias,
                    img : user.img,
                    uuid: user.r,
                    type: user.type === 0 ? 'group' : 'user',
                    id  : +user.r.split('-')[1],
                    online: user.type === 0 ? true : !!user.online,
                    isGuest: !!user.tour
                };
                recentUser.push(saveUserInGlobal(u));
            });
            sortUser(recentUser);
        });
    }
    function getFriendRequest () {
        var flag = false;
        friendRequests.splice(0, friendRequests.length);
        return getNotify().then(function (data) {
            angular.forEach(data.data, function (req) {
                req.date = parseTime(req.time || new Date().getTime()).split(' ')[0];
                if (req.status === 1) {
                    flag = true;
                }
                friendRequests.push(req);
            });
        }).then(function () {
            return getNotify('r').then(function (data) {
                angular.forEach(data.data, function (req) {
                    req.date = parseTime(req.time || new Date().getTime()).split(' ')[0];
                    req.mine = true;
                    friendRequests.push(req);
                });
            });
        }).then(function () {
            if (flag) {
                triggerEvent('hasUnhandleRequest');
            }
        });
    }
    function getOfflineMsg () {
        devlog('get offline message');
    }
    function init () {
        return registerWS();
    }
    function clearFileInput (element) {
        element.wrap('<form>').parent('form').trigger('reset');
        element.unwrap();
    }
    function selectUploadFile (type) {
        uploadType = type;
        if (type === 2) {
            angular.element('#' + uploadImgId).click();
        } else {
            angular.element('#' + uploadInputId).click();
        }
    }
    function initUploadPlugin (inputId, type) {
        function checkUploadScript () {
            var defer = $q.defer();
            if (typeof C4js !== 'undefined' && typeof C4js.Uer === 'function') {
                defer.resolve();
            } else {
                $.getScript('common/directive/upload/upload-plugin.js', function () {
                    defer.resolve();
                });
            }
            return defer.promise;
        }
        if (type && type === 'image') {
            uploadImgId = inputId;
        } else {
            uploadInputId = inputId;
        }
        return checkUploadScript().then(function () {
            var picArr = ['png', 'jpg', 'bmp', 'gif', 'jpeg'];
            var filter = function(item){
                var flag = true;
                if (uploadType === 2) {
                    angular.forEach(item.files, function (file) {
                        var fileExt = file.name.split('.').pop().toLowerCase();
                        if (picArr.indexOf(fileExt) === -1) {
                            log('只支持以下格式图片上传：png,jpg,bmp,gif,jpeg。');
                            flag = false;
                            clearFileInput(angular.element('#chat-upload'));
                        }
                    });
                }
                return flag ? item.files : {};
            };
            uploader = new C4js.Uer(addr.uploadSrv, {m: 'C',token:token}, true);
            uploader.AddI(inputId, {pub: 1, picType: 2}, {
                OnProcess: function(f, rate, speed){
                    f.obj = f.obj || {};
                    // var uploadObj             = uploadFiles[f.name];
                    f.obj.rate            = rate;
                    f.obj.speed           = speed;
                    f.obj.status          = 'uploading';
                    devlog('upload progress ' + f.obj.rate);
                    triggerEvent('uploadProgress', f, rate, speed);
                },
                OnSuccess: function(f, data){
                    f.obj = f.obj || {};
                    var imgUrl = data.data;
                    var obj = {
                        name: f.name,
                        path: '',
                        Sha : '',
                        type: f.type,
                        url : imgUrl,
                        size: f.size
                    };
                    // var uploadObj             = uploadFiles[f.name];
                    f.obj.status          = 'finish';
                    sendMsg(chatTarget, uploadType, JSON.stringify(obj));
                    triggerEvent('uploadSuccess', f, data);
                },
                OnErr: function (f, data, err){
                    f.obj = f.obj || {};
                    // var uploadObj             = uploadFiles[f.name];
                    f.obj.status          = 'error';
                    f.obj.error           = err;
                    triggerEvent('uploadError', f, data, err);
                },
                OnAbort: function (f) {
                    f.obj = f.obj || {};
                    f.obj.status = 'abort';
                    triggerEvent('uploadAbort', f);
                },
                OnStart: function (f) {
                    f.obj = f.obj || {};
                    f.obj.status = 'uploading';
                    f.obj.id     = f.fid;
                    triggerEvent('uploadStart', f);
                },
                OnLoad: function (f, e) {
                    triggerEvent('uploadLoad', f, e);
                }
            });
            uploader.OnSelect = function (item) {
                var files                    = filter(item);
                uploader.Args.token          = token;
                angular.forEach(files, function (file) {
                    // uploadFiles[file.name] = uploadFiles[file.name] || {};
                    var uploadObj                = {};
                    uploadObj.status             = 'add';
                    uploadObj.size               = parseSize(file.size);
                    uploadObj.name               = file.name;
                    allUsers[chatTarget.uuid].msg.push({
                        time    : parseTime(new Date().getTime()),
                        uploadingMsg: true,
                        file: uploadObj,
                        isMine: true,
                        sender: self,
                        uuid: chatTarget.uuid
                    });
                    triggerEvent('uploadSelect', file);
                    devlog('select upload file ' + file.name);
                    file.obj = uploadObj;
                });

                return files;
            };
        });
    }
    function bindWindowKeydownEvent (e) {
        if (e.which === 13) {
            sendScreenshot(base64);
            triggerEvent('sendScreenshot');
        } else if (e.which === 27) {
            cancelScreenshot();
            triggerEvent('cancelScreenshot');
        }
    }
    function sendScreenshot (base64) {
        angular.element(document).off('keydown', bindWindowKeydownEvent);
        if (!base64) {
            log('暂无截图。');
            return;
        }
        if (!chatTarget) {
            log('请选择需要发送截图的好友。');
            return;
        }
        var file = {
            status: 'uploading',
            rate  : 0,
            speed : 0,
            name: '截图文件',
            size: 0
        };
        var uploadScreenshot = function (data) {
            var xhr = new XMLHttpRequest();
            var upload = xhr.upload;
            var defer = $q.defer();
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        defer.resolve(data);
                        triggerEvent('screenshotUploadFinish', data);
                    } catch (err) {
                        defer.resolve(xhr.responseText);
                        triggerEvent('screenshotUploadFinish', xhr.responseText);
                    }
                }
            };
            upload.addEventListener('progress', function (event) {
                if (event.lengthComputable) {
                    var percent = event.loaded/event.total;
                    file.rate = percent;
                }
                triggerEvent('screenshotUploadProgress', file, event);
            });
            upload.addEventListener('load', function (event) {
                triggerEvent('screenshotUploadLoad', file, event);
            });
            upload.addEventListener('error', function (event) {
                file.status = 'error';
                triggerEvent('screenshotUploadError', file, event);
            });
            var obj = {
                m: 'C',
                pub: '1',
                picType: 1,
                fileName: 'screenshot.png',
                base64: 1,
                token: token
            };
            var arr = [];
            angular.forEach(obj, function (value, name) {
                arr.push(name + '=' + value);
            });
            var url = addr.uploadSrv + '?' + arr.join('&');
            xhr.open('post', url);
            xhr.send(data);
            return defer.promise;
        };

        allUsers[chatTarget.uuid].msg.push({
            time        : parseTime(new Date().getTime()),
            uploadingMsg: true,
            file        : file,
            isMine      : true,
            sender      : self,
            uuid        : chatTarget.uuid
        });

        triggerEvent('sendScreenshot');

        uploadScreenshot(base64.split(',')[1]).then(function (data) {
            if (data.code === 301) {
                log('登陆超时！请重新登陆。');
                return;
            } else if (data.code !== 0) {
                log('上传截图失败！请重新上传。');
                return;
            }
            var obj = {
                name: data.ext.url.split('/').pop(),
                path: '',
                Sha : '',
                type: 'image',
                url : data.data,
                size: 1
            };
            file.status          = 'finish';
            sendMsg(chatTarget, 2, JSON.stringify(obj));
            triggerEvent('sendScreenshotMsg');
        });
    }
    function cancelScreenshot () {
        base64 = '';
        angular.element(document).off('keydown', bindWindowKeydownEvent);
        triggerEvent('cancelScreenshot');
    }
    function initTextInput (ele) {
        ele.on('paste', function (event) {
            angular.forEach(event.originalEvent.clipboardData.items, function (item) {
                if (item.kind === 'file' && /image\/\w+/.test(item.type)) {
                    var file       = item.getAsFile();
                    var fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        base64 = this.result;
                        triggerEvent('showScreenshot', base64);
                        angular.element(document).on('keydown', bindWindowKeydownEvent);
                        ele.blur();
                    };
                    fileReader.readAsDataURL(file);
                }
            });
        });
    }
    function cancelUpload (id) {
        uploader.Abort(id);        
    }
    function popUp (arr, index) {
        var targetUser = arr.splice(index, 1)[0];
        arr.unshift(targetUser);
    }
    function popUpUser (uuid) {
        var i    = 0;
        var j    = 0;
        var flag = false;
        var user;
        for (; i < recentUser.length; i += 1) {
            user = recentUser[i];
            if (user.uuid === uuid) {
                flag = true;
                popUp(recentUser, i);
                break;
            }
        }
        if (!flag) {
            devlog('could not find popup user, will shift the user to the list');
            recentUser.unshift(allUsers[uuid]);
        }

        for (i in groups) {
            if (groups.hasOwnProperty(i)) {
                var group = groups[i];
                for (j = 0; j < group.users.length; j += 1) {
                    user = group.users[j];
                    if (user.uuid === uuid) {
                        popUp(group.users, j);
                        break;
                    }
                }
            }
        }
    }

    function chatWithUser (uuid) {
        getSender(uuid).then(function (user) {
            var scope = angular.element('.online-chat').scope();
            if (scope) {
                scope.open(user, true);
            } else {
                log('无法找到即时通讯组件。');
            }
        });
    }

    function changeToken (t) {
        token = t;
    }

    return {
        http: {
            anonymousLogin     : anonymousLogin,
            getUserGroups      : getUserGroups,
            getUserInfo        : getUserInfo,
            getGroup           : getGroup,
            getRecentUser      : getRecentUser,
            searchUser         : searchUser,
            requestFriend      : requestFriend,
            handleFriendRequest: handleFriendRequest,
            getNotify          : getNotify,
            createGroup        : createGroup,
            getGuideTeacher    : getGuideTeacher,
            getServeList       : getServeList,
            getAnswerTeacher   : getAnswerTeacher
        },
        util: {
            getToken : getToken,
            log      : log,
            saveToken: saveToken,
            devlog   : devlog,
            parseSize: parseSize,
            parseTime: parseTime,
            parseMsg : parseMsg,
            popUpUser: popUpUser,
            request  : request
        },
        on     : handleEvent,
        trigger: triggerEvent,
        ws: {
            init : init,
            login: loginToWS
        },
        api: {
            getUserOrGroupInfo: getUserOrGroupInfo,
            getSender         : getSender,
            clearFileInput    : clearFileInput,
            selectUploadFile  : selectUploadFile,
            initUploadPlugin  : initUploadPlugin,
            cancelUpload      : cancelUpload,
            sendMsg           : sendMsg,
            getOfflineMsg     : getOfflineMsg,
            getMyInfoAndGroup : getMyInfoAndGroup,
            getFriendsGroup   : getFriendsGroup,
            getRecentUser     : getRecentUserList,
            getGroupDetail    : getGroupDetail,
            getRecordList     : getRecordList,
            initTextInput     : initTextInput,
            sendScreenshot    : sendScreenshot,
            cancelScreenshot  : cancelScreenshot,
            unread            : unread,
            getFriendRequest  : getFriendRequest,
            getAnonymousToken : anonymouse,
            websocket         : websocket,
            getServeList      : getServe,
            changeUploadType  : changeUploadType,
            chatWithUser      : chatWithUser,
            changeToken       : changeToken
        },
        data: {
            self          : self,
            groupInfo     : groupInfo,
            groups        : groups,
            recentUser    : recentUser,
            allUsers      : allUsers,
            friendRequests: friendRequests,
            unreadMsgList : unreadMsgList,
            serveList     : serveList
        }
    };
}]);