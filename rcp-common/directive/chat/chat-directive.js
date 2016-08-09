/* globals g_conf */

(function () {
    var module = angular.module('chat_directive', []);

    module.filter('orderObjectBy', function() {
      return function(items, field) {
        var filtered = [];
        angular.forEach(items, function(item) {
          filtered.push(item);
        });
        filtered.sort(function (a, b) {
          return (a[field] > b[field] ? 1 : -1);
        });
        return filtered;
      };
    });

    /* jshint camelcase:false */
    var conf = g_conf;

    module.controller('chat', ['$scope', '$q', '$rootScope', '$http', '$cookies', 'chatService', 'service', function ($scope, $q, $rootScope, $http, $cookies, chatService, service) {
        $scope.isIE9 = false;
        if (isIE(9, 9)) {
            $scope.isIE9 = true;
        }
        angular.element('.online-chat').show();
        var devlog           = chatService.util.devlog;
        var log              = chatService.util.log;
        $scope.unread        = chatService.api.unread;
        $scope.chatTarget    = null;
        $scope.self          = chatService.data.self;
        $scope.unreadMsgList = chatService.data.unreadMsgList;
        $scope.myCourse      = chatService.data.serveList;

        $scope.show          = 'main';
        var myFriends = [];
        angular.forEach(chatService.data.groups, function (g) {
            if (g.type === 'DEFAULT') {
                myFriends = g.users;
            }
        });
        function isAdded (id) {
            var flag = false;
            angular.forEach(myFriends, function (f) {
                if (id === f.id) {
                    flag = true;
                }
            });
            return flag;
        }
        $scope.loginStatus = 'pending';    
        $scope.changeUploadType = chatService.api.changeUploadType;
        chatService
        .on('wsConnected', function () {
            $scope.loginStatus = 'pending';
        })
        .on('wsLogined', function () {
            devlog('login to server successfully');
            $scope.loginStatus = 'logined';
        })
        .on('wsLoginError', function () {
            devlog('即时通讯登陆失败，使用匿名登陆。');
        })
        .on('wsMsg', function (data, parsedMsg) {
            var id, uuid;
            if (data.a[0] === 'G') {
                id   = +data.a.split('-')[1];
                uuid = data.a;
            } else {
                id   = +data.s.split('-')[1];
                uuid = data.s;
            }
            if ($scope.chatTarget && $scope.chatTarget.uuid === uuid) {
                $scope.$emit('scrollToBottom');
            }
            devlog('recieve msg from id ' + id, parsedMsg);
            $scope.$emit('loadMsg');
        })
        .on('openChatWindow', function (user) {
            if ($scope.readyToOpenWindow) {
                $scope.showChatWindow = true;
                $scope.openChatWindow(user);
            } else {
                $scope.$watch('readyToOpenWindow', function (value) {
                    if (value) {
                        $scope.showChatWindow = true;
                        $scope.openChatWindow(user);
                    }
                });
            }
        })
        .on('openAddFriendDialog', function (user) {
            if (isAdded(user._id || user.id)) {
                chatService.util.log('该用户已经是您的好友。');
                return false;
            }
            if ((user._id && user._id === $scope.self.id) || (user.id && user.id === $scope.self.id)) {
                chatService.util.log('不能添加自己为好友。');
                return;
            }
            $scope.showAddDialog = true;
            $scope.addTarget = user;
        });

        $scope.unreadAll = function () {
            var count = 0;
            for (var i in chatService.api.unread) {
                if (chatService.api.unread.hasOwnProperty(i)) {
                    count = count + chatService.api.unread[i];
                }
            }
            return count;
        };
        $scope.closeAddDialog = function () {
            $scope.showAddDialog = false;
            $scope.msg = '';
        };
        $scope.requestAddFriend = function () {
            if (!$scope.addTarget) {
                chatService.util.log('请选择需要添加为好友的用户。');
                return;
            }
            chatService.http.requestFriend({
                uuid: $scope.addTarget.uuid,
                msg: $scope.msg
            }).then(function () {
                chatService.util.log('好友申请成功！');
                $scope.showAddDialog = false;
                $scope.msg = '';
            }, function (err) {
                if (err.type === 1) {
                    if (err.data.data.code === 2) {
                        $scope.showAddDialog = false;
                        $scope.msg = '';
                    }
                    chatService.util.log(err.data.data.msg);
                } else {
                    chatService.util.log('请求添加好友失败！');
                    chatService.util.devlog(err);
                }
            });
        };

        var cancelWatch = $rootScope.$watch('loginStatusInit', function (data) {
            if (!data) {
                return;
            }
            cancelWatch();
            function checkUserStatus () {
                if (data.flag) {
                    devlog('already logined, get current user info and group list');
                    chatService.api.changeToken(rcpAid.getToken());
                    return chatService.api.getMyInfoAndGroup();
                } else {
                    devlog('not login, use anonymous login');
                    var defer = $q.defer();
                    $rootScope.$watch('anonymousUser', function (value) {
                        if (!value) {return;}
                        chatService.api.changeToken(value.token);
                        // chatService.api.getMyInfoAndGroup().then(function () {
                        //     defer.resolve();
                        // }, function (e) {
                        //     defer.reject(e);
                        // });
                        devlog('get anonymous user info');
                        chatService.api.getMyInfoAndGroup().then(function () {
                            defer.resolve();
                        }, function () {
                            return chatService.http.anonymousLogin().then(function(rs){
                                if(rs.code !== 0){
                                    console.error(rs.msg, '匿名登录失败');
                                    localStorage.setItem('anonymousLoginUsr', 'error');
                                    return;
                                }
                                var data = rs.data;
                                data.usr.token = data.token;
                                localStorage.setItem('anonymousLoginToken',data.token);
                                delete data.usr.BAttr;
                                delete data.usr.attrs;
                                localStorage.setItem('anonymousLoginUsr', JSON.stringify(data.usr));
                                $rootScope.anonymousUser = data.usr;
                                $cookies.stoken = data.usr.token;
                                chatService.api.changeToken(data.usr.token);
                                chatService.api.getMyInfoAndGroup().then(function () {
                                    defer.resolve();
                                }, function (e) {
                                    defer.reject(e);
                                });
                            },function (msg){
                                localStorage.setItem('anonymousLoginUsr', 'error');
                                defer.reject(msg);
                            });
                        });
                    }, true);
                    return defer.promise;
                }
            }
            $scope.hasUserLogin = data.flag;
            $scope.isTeacher = $scope.hasUserLogin && $rootScope.currentUser.auth === 1;
            $scope.isHelpTeacher = $scope.hasUserLogin && $rootScope.currentUser.roleArr.indexOf('HELP') !== -1;
            if (jf.isIE() && jf.isIE() < 10) {
                $scope.chatError = '浏览器版本过低';
                return;
            }
            checkUserStatus().then(function () {

                devlog('get current user recent chat list');
                return chatService.api.getRecentUser();

            }).then(function () {

                devlog('initialize upload plugin');
                return chatService.api.initUploadPlugin('chat-img-upload', 'image').then(function () {
                    return chatService.api.initUploadPlugin('chat-file-upload', 'file');
                });

            }).then(function () {

                devlog('initialize websocket, and login to server');
                return chatService.ws.init();
            }).then(function () {

                $scope.readyToOpenWindow = true;
                devlog('ready to open chat window');
                return chatService.api.getOfflineMsg();
            }).then(function () {
                return chatService.api.getFriendRequest();
            }).then(function () {
                return chatService.api.getServeList();
            }).then(function () {
                chatService.trigger('loadFriendNotify');
                chatService.api.initTextInput(angular.element('#msg-content'));
            }, function (err) {
                if (err.type === 1) {
                    chatService.util.log(err.data.data.msg);
                } else {
                    chatService.util.log('初始化即时通讯组件失败！网络错误！');
                }
                $scope.chatError = err;
                devlog('err', err);
            });
        }, true);

        $scope.openChatWindow = function (user) {
            if (!user) {
                return;
            }
            if (user.uuid === $scope.self.uuid) {
                log('不能与自己聊天。');
                return false;
            }
            $scope.show      = 'main';
            $scope.activeTab = 'msg';
            $scope.chatTarget = user;
            $scope.chatType   = user.type;
            chatService.trigger('enterChat', $scope.chatTarget);
            chatService.trigger('chatWindow', true);
            chatService.trigger('openRecord');
        };

        $scope.enterChat = function (user) {
            $scope.show = 'main';
            chatService.trigger('switchTab', 'msg');
            chatService.util.popUpUser(user.uuid);
            chatService.trigger('openChatWindow', user);
            $scope.activeTab = 'msg';
        };

        $scope.showLoginWindow = function () {
            if (service.loginModal) {
                service.loginModal.show();
            } else if (typeof loginWinService !== 'undefined') {
                loginWinService.show();
            }
        };

        function getAnswerTeacher (ids) {
            return chatService.http.getAnswerTeacher(ids).then(function (data) {
                var user = {
                    name: data.data.name,
                    img : data.data.img,
                    uuid: data.data.uuid,
                    type: 'user',
                    id  : data.data.id,
                    online: data.data.online
                };
                return user;
            });
        }

        $scope.findTeacher = function (teachers) {
            var flag = false;
            var ids = [];
            for (var i in teachers) {
                if (teachers.hasOwnProperty(i)) {
                    flag = true;
                    ids.push(teachers[i].uuid);
                }
            }
            if (!flag) {
                chatService.util.log('该课程没有答疑老师.');
                return;
            }
            getAnswerTeacher(ids.join(',')).then(function (user) {
                $scope.enterChat(user);
            }, function (err) {
                if (err.type === 1) {
                    chatService.util.log(err.data.data.msg);
                } else {
                    chatService.util.log('请求答疑老师失败！网络错误！');
                }
            });
        };

        $scope.open = function (user, coursePage) {
            // if ($rootScope.currentUser && $rootScope.currentUser.role === 'HELP') {
            //     window.open('/guidance-space.html');
            //     return;
            // }
            if (!user && $scope.showChatWindow) {
                $scope.close();
                return;
            }
            if (location.pathname === '/course-detail.html') {
                var scope = angular.element('.course-intro').scope();
                if (scope.course) {
                    chatService.util.request({
                        url: '/smap',
                        method: 'POST',
                        params: {
                            key: $scope.self.id + '_CUR_COURSE',
                            val: JSON.stringify(scope.course)
                        }
                    }).then(function (data) {
                        console.log(data);
                    });
                }
            }
            if (!coursePage && !$scope.hasUserLogin) {
                $scope.switchTab('guide');
                return;
            }
            chatService.trigger('openChatWindow', user || chatService.data.recentUser[0]);
        };
        $scope.close = function () {
            $scope.showChatWindow = false;
            $scope.chatTarget = undefined;
            chatService.trigger('closeChat');
        };

        $scope.showAddMenu = function () {
            $scope.addMenu = true;
            setTimeout(function () {
                angular.element(document).on('click', handleClick);
            }, 100);
        };

        function handleClick () {
            $scope.addMenu = false;
            $scope.$digest();
            angular.element(document).off('click', handleClick);
        }

        $scope.addFriend = function () {
            chatService.trigger('resetAddGroup');
            $scope.show = 'addFriend';
            $scope.tabName = '添加好友';
            setTimeout(function () {
                angular.element('.chat-search-name').focus();
            }, 10);
        };

        $scope.addGroup = function () {
            $scope.show = 'addGroup';
            $scope.tabName = '创建讨论组';
        };

        $scope.activeTab = 'msg';

        function getGuideTeacher() {
            return chatService.http.getGuideTeacher().then(function (data) {
                var user = {
                    name: data.data.name,
                    img : data.data.img,
                    uuid: data.data.uuid,
                    type: 'user',
                    id  : data.data.id,
                    online: data.data.online
                };
                $scope.guideTeacher = user;
                return $scope.guideTeacher;    
            });
        }
        $scope.tabName = '消息';
        function displayTabName (tab) {
            switch (tab) {
                case 'serve':
                    $scope.tabName = '找老师';
                    break;
                case 'group':
                    $scope.tabName = '群组';
                    break;
                case 'friend':
                    $scope.tabName = '好友';
                    break;
                default: 
                    $scope.tabName = '消息';
            }
        }
        $scope.switchTab = function (tab) {
            displayTabName(tab);
            if (tab === 'guide') {
                getGuideTeacher().then(function (user) {
                    chatService.trigger('switchTab', 'msg');
                    chatService.trigger('openChatWindow', user);
                }, function (err) {
                    if (err.type === 1) {
                        chatService.util.log(err.data.data.msg);
                    } else {
                        chatService.util.log('查找在线客服失败！网络错误！');
                    }
                });
            } else {
                chatService.trigger('switchTab', tab);
                $scope.chatTarget = null;
                chatService.trigger('closeChat');
                $scope.activeTab = tab;
            }
            if (tab === 'serve') {
                $scope.show = 'serve';
            } else {
                $scope.show = 'main';
            }
        };

        if (service.httpConfig) {
            service.httpConfig.filter('loading', [conf.friendsAddr, conf.rdisAddrSrv], false);
        }

    }]);
    module.directive('chat', function () {
        var obj = {
            template:'<div><div class="online-chat" ng-class="{\'online-chat-left\': position == \'left\'}" ng-controller="chat" ng-hide="isIE9"><div ng-hide="showChatWindow" class="chat-login" ng-mouseover="active=true" ng-mouseleave="active=false;"><span ng-show="unreadAll() > 0" class="chat-unread">{{unreadAll() > 99 ? \'99+\' : unreadAll()}}</span> <button type="button" class="chat-btn chat-rel" ng-hide="loginStatus==\'pending\' || loginStatus==\'logined\' && !readyToOpenWindow" ng-click="open()"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> <span ng-hide="unreadMsgList.length">{{hasUserLogin ? \'在线聊天\' : \'亲，需要帮助吗？\'}}</span> <span ng-show="unreadMsgList.length" class="chat-msg-tips" title="{{unreadMsgList[0].message}}"><span>{{unreadMsgList[0].sender.name}}：</span><span>{{unreadMsgList[0].message}}</span></span></button> <button type="button" class="chat-btn chat-rel" ng-show="loginStatus==\'pending\'"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> <span ng-show="chatError">初始化失败</span> <span ng-show="!chatError">登陆中</span></button> <button type="button" class="chat-btn chat-rel" ng-show="loginStatus==\'logined\' && !readyToOpenWindow"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> 连接中</button></div><div class="chat-window" ng-show="showChatWindow" drag=".chat-head" position="fixed" limit="true"><div class="chat-main-body chat-abs"><ul class="chat-menu chat-abs"><li><a href=""><span class="chat-avatar"><img ng-src="{{self.img}}" alt=""> </span><span class="chat-online"></span></a></li><li class="chat-rel" title="消息" ng-mouseenter="msgHover=true" ng-mouseleave="msgHover=false" data="{{activeTab}}"><a ng-click="switchTab(\'msg\')" href="" ng-class="{\'chat-active\': msgHover || activeTab==\'msg\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-msg-active\': msgHover || activeTab==\'msg\', \'image-chat-msg\':!msgHover && activeTab!=\'msg\'}"></span>消息</a> <span ng-show="unreadAll() > 0" class="chat-unread">{{unreadAll() > 99 ? \'99+\' : unreadAll()}}</span></li><li title="找老师" ng-mouseenter="serveHover=true" ng-mouseleave="serveHover=false"><a ng-click="switchTab(\'serve\')" href="" ng-class="{\'chat-active\': serveHover || activeTab==\'serve\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-serve-active\': serveHover || activeTab==\'serve\', \'image-chat-serve\':!serveHover && activeTab!=\'serve\'}"></span>找老师</a></li><li title="找客服" ng-mouseenter="guideHover=true" ng-mouseleave="guideHover=false" ng-hide="isHelpTeacher"><a ng-click="switchTab(\'guide\')" href="" ng-class="{\'chat-active\': guideHover || activeTab==\'guide\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-guide-active\': guideHover || activeTab==\'guide\', \'image-chat-guide\':!guideHover && activeTab!=\'guide\'}"></span>找客服</a></li><li title="群组" ng-mouseenter="groupHover=true" ng-mouseleave="groupHover=false"><a ng-click="switchTab(\'group\')" href="" ng-class="{\'chat-active\': groupHover || activeTab==\'group\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-group-active\': groupHover || activeTab==\'group\', \'image-chat-group\':!groupHover && activeTab!=\'group\'}"></span>群组</a></li><li title="好友" ng-mouseenter="friendHover=true" ng-mouseleave="friendHover=false"><a ng-click="switchTab(\'friend\')" href="" ng-class="{\'chat-active\': friendHover || activeTab==\'friend\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-friend-active\': friendHover || activeTab==\'friend\', \'image-chat-friend\':!friendHover && activeTab!=\'friend\'}"></span>好友</a></li><li ng-mouseenter="menuHover=true" ng-mouseleave="menuHover=false"><a ng-click="showAddMenu()" href=""><span class="chat-menu-icon" ng-class="{\'image-chat-menu-active\': menuHover, \'image-chat-menu\':!menuHover}"></span></a><div ng-show="addMenu" class="chat-add-menu chat-abs"><a href="" ng-click="addFriend()">添加好友</a> <a href="" ng-click="addGroup()">创建讨论组</a></div></li></ul><div class="chat-right-content"><div class="chat-head chat-abs"><p>{{tabName}}</p><button class="chat-btn icon-close chat-abs" ng-click="close()"></button></div><div ng-show="show===\'main\'" class="chat-user-list chat-abs" ng-controller="chatContact"><div class="chat-user-search"><input type="text" ng-focus="focusSearchInput()" ng-change="changeSearchInput()" ng-model="searchUser" ng-keydown="enterSearchUser($event)"> <button ng-click="searchUserResult()" class="icon-magnifier chat-btn"></button></div><div ng-if="activeTab==\'friend\' || activeTab==\'group\'" class="chat-content-wrapper chat-scrollbar"><div ng-show="hasUserLogin" class="chat-groups"><div class="chat-friends" ng-repeat="group in groups|orderObjectBy:\'order\'" ng-if="(activeTab==\'friend\' && friendGroupList.indexOf(group.type)!=-1) || (activeTab==\'group\'&&groupGroupList.indexOf(group.type)!=-1)" ng-hide="group.name === \'我的学生\' && !isTeacher"><div class="chat-group-name"><a href="" ng-click="group.expand=!group.expand"><span class="fa" ng-class="{\'fa-angle-down\': group.expand, \'fa-angle-right\':!group.expand}"></span> <span>{{group.name}}</span> <span class="chat-group-count" ng-if="activeTab==\'friend\'">{{onlineCount(group.users)}}/{{group.users.length}}</span> <span class="chat-group-count" ng-if="activeTab==\'group\'">{{group.users.length}}</span></a></div><div ng-show="group.expand"><ul class="chat-group-list"><li ng-class="{\'chat-current\': user.uuid==chatTarget.uuid}" ng-repeat="user in group.users" ng-hide="hideUnrelativeItem(user.name)"><a href="" ng-click="showUserDetail(user)"><span class="chat-avatar"><img ng-src="{{user.img}}" alt="" ng-class="{\'grayscale\': !user.online}"> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> </a><span ng-show="unread[user.uuid] > 0" class="chat-unread">{{unread[user.uuid] > 99 ? \'99+\' : unread[user.uuid]}}</span></li></ul></div></div></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">( ▼-▼ )</p><p style="font-size:16px;margin-bottom:10px">什么也没有</p><p>登录后体验更多</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div ng-if="activeTab==\'msg\'" class="chat-content-wrapper chat-scrollbar"><ul class="chat-group-list chat-msg-list"><li ng-class="{\'chat-current\': (user.uuid==chatTarget.uuid) || (showFriendRequest && user.uuid===\'U-0\')}" ng-repeat="user in recentUser" ng-mouseenter="user.showClose=true" ng-mouseleave="user.showClose=false" ng-hide="hideUnrelativeItem(user.name)"><button ng-click="deleteRecentChat(user, $index)" ng-show="user.showClose" class="chat-delete-window"><span class="icon-close"></span></button> <a href="" ng-click="openChatWindow(user)"><span class="chat-avatar"><img ng-src="{{user.img}}" alt="" ng-class="{\'grayscale\': !user.online}"> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> </a><span ng-show="unread[user.uuid] > 0" class="chat-unread">{{unread[user.uuid] > 99 ? \'99+\' : unread[user.uuid]}}</span></li><p ng-show="!recentUser.length" style="margin:50px 0;text-align:center;color:#ccc">暂无最近联系人。</p></ul></div></div><div ng-show="show===\'main\'" class="chat-content" ng-controller="chatContent"><div ng-show="showMain" class="chat-main chat-center" ng-class="{\'chat-record-open\': showMsgRecord}"><div class="chat-header chat-drag"><span class="chat-target-name" title="{{chatTarget.name}}">{{chatTarget.name}}</span> <a href="" ng-click="addFriend(chatTarget)" class="image-chat-friend-add chat-abs chat-friend-add" ng-show="showAddFriendBtn && hasUserLogin"></a> <a href="" ng-click="showGroupDetail(chatTarget)" class="image-chat-group chat-abs chat-friend-add" ng-show="chatType==\'group\'"></a></div><div class="chat-body chat-abs"><div class="chat-body-left chat-center"><div class="chat-history chat-scrollbar"><ul><div ng-hide="loadingMsg || noMoreMsg" class="chat-show-more"><a href="" ng-click="loadMoreMsg()"><span class="fa fa-clock-o"></span>查看更多消息</a></div><div ng-show="loadingMsg" class="chat-show-more"><span class="fa fa-spinner fa-spin"></span>正在载入</div><chat-msg chat-type="chatType" index="{{$index}}" ng-repeat="msg in currentChatMsg" msg="msg" id="msg-{{currentChatMsg.length - $index}}"></chat-msg></ul></div><a ng-show="unreadMsg>0" class="chat-unread-msg" ng-click="showNewMsg()">您有 <span>{{unreadMsg}}</span> 条新消息</a><div class="chat-editor"><div class="chat-editor-helper chat-rel"><a href="" ng-click="selectUploadFile(2)"><span class="icon-polaroid"></span> </a><a href="" ng-click="selectUploadFile(3)"><span class="icon-sent-files"></span> </a><a href="" ng-class="{\'chat-btn-opened\': showMsgRecord}" ng-click="openMsgRecord()" class="chat-open-record chat-abs"><span class="fa fa-clock-o"></span> 消息记录 </a><input type="file" id="chat-img-upload" style="display:none" accept="image/*"> <input type="file" id="chat-file-upload" style="display:none" accept="*"></div><div class="chat-editor-input"><textarea name="" id="msg-content" cols="30" rows="10" ng-model="msg" ng-keydown="typeMsg($event)"></textarea></div><div class="chat-send"><button class="chat-btn" ng-show="self.name === \'superone\'" ng-click="autoSendMsg(1000)">发送1000条消息</button> <button ng-click="endChat()" class="chat-btn">结束</button> <button class="chat-btn chat-btn-active" ng-click="send()">发送</button></div></div></div></div><div class="chat-msg-record chat-dis-inlineblock" ng-show="showMsgRecord" ng-controller="record"><div class="chat-record-head chat-dis-inlineblock"><span>消息记录</span> <button class="chat-btn" ng-click="$parent.openMsgRecord()">&times;</button></div><div class="chat-record-body chat-scrollbar"><ul class="chat-record-list" ng-class="{\'chat-record-list-pd\': showSearch}"><li ng-repeat="msg in record" ng-hide="loading" ng-class="{\'chat-msg-mine\': msg.sender.id == self.id}" class="pd-x10 mg-y10"><p class="chat-record-day" ng-show="showDay($index)">{{msg.day}}</p><span class="chat-record-name">{{msg.sender.name}}</span> <span class="chat-record-time mg-l10">{{msg.time}}</span><div class="chat-record-content mg-t5" ng-bind-html="msg.msg|html" ng-hide="msg.fileType===2"></div><div class="chat-record-content mg-t5" msg-img="msg" ng-if="msg.fileType===2"></div></li><div ng-show="!record.length && !loading" style="padding:50px 0;text-align:center;color:#ccc"><span class="image-chat-record-empty chat-dis-inlineblock mg-b20"></span><p ng-if="date==today&&recordDate">亲，您今天还没跟 <span>{{chatTarget.name}}</span> 交流哦~</p><p ng-if="date!=today&&recordDate">亲，<span>{{recordDate}}</span>那天您没有和 <span>{{chatTarget.name}}</span> 交流哦~</p><p ng-if="!recordDate">亲，您没有和 <span>{{chatTarget.name}}</span> 交流过哦~</p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></ul></div><div class="chat-record-foot chat-abs"><button ng-class="{\'chat-btn-opened\': showSearch}" ng-click="openSearch()" class="fa fa-search chat-record-search chat-btn"></button><p class="chat-record-search-option chat-abs" ng-show="showSearch">内容：<input type="text" ng-model="searchName" ng-keydown="enterSearchName($event)"> <button class="chat-btn" ng-click="searchRecord()">确定</button></p><span class="chat-record-date mg-l5 pd-l10"><div ng-click="showSelectDate($event)" class="fa fa-calendar chat-btn chat-rel"></div><datetime value="selectedDate" no-input="true" config="dateConfig" startdate="startDate" enddate="endDate"></datetime><span>{{date}}</span> </span><span class="chat-record-pa chat-abs"><button ng-class="{\'chat-disable\': currentPageNo <= 1}" ng-click="jumpToPage(1)" class="chat-btn fa fa-angle-double-left"></button> <button ng-class="{\'chat-disable\': currentPageNo <= 1}" ng-click="jumpToPage(+currentPageNo - 1)" class="chat-btn fa fa-angle-left"></button> <button ng-class="{\'chat-disable\': currentPageNo >= total}" ng-click="jumpToPage(+currentPageNo + 1)" class="chat-btn fa fa-angle-right"></button> <button ng-class="{\'chat-disable\': currentPageNo >= total}" ng-click="jumpToPage(total)" class="chat-btn fa fa-angle-double-right"></button></span></div></div></div><div ng-show="showNoTarget" class="chat-no-target chat-abs chat-center"><span class="image-chat-big chat-dis-inlineblock"></span><p>赶紧找个人聊天吧</p></div><div ng-show="showDetail" class="chat-group-detail chat-abs chat-center"><div class="chat-header chat-drag"><span class="chat-target-name" ng-show="detailUser.gType !==\'CHAT_GRP\'">{{detailUser.type === \'user\' ? \'个人\' : \'群组\'}}资料</span> <span class="chat-target-name" ng-show="detailUser.gType ===\'CHAT_GRP\'">讨论组资料</span></div><div class="chat-body chat-abs chat-scrollbar"><div ng-show="detailUser.type!==\'user\' && !loading"><div ng-show="detailUser.course" class="chat-group-course chat-group-item"><div class="chat-detail-head">当前课程</div><div class="chat-detail-content"><img class="chat-course-img chat-abs" ng-src="{{detailUser.course.imgs.split(\',\')[0] || \'img/icon-65.gif\'}}" alt=""><div class="chat-course-info chat-dis-inlineblock"><p class="chat-course-name"><a ng-href="course-detail.html?id={{detailUser.course.id}}" target="_blank">{{detailUser.course.name}}</a></p><p class="chat-course-user">创建者：<span>{{detailUser.course.userName}}</span></p></div></div></div><div ng-show="detailUser.course" class="chat-group-item chat-group-teacher"><div class="chat-detail-head">老师 <span class="chat-user-count">({{detailUser.teacherOnline || 0}}/{{detailUser.userList.teachers.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(teacher)" class="chat-course-member chat-dis-inlineblock" ng-repeat="teacher in detailUser.userList.teachers.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{teacher.img}}" alt=""></div><span class="chat-member-role chat-teacher-guide" ng-show="teacher.role.indexOf(\'GUIDE\') !== -1">导</span> <span class="chat-member-role chat-teacher-answer" ng-show="teacher.role.indexOf(\'ANSWER\') !== -1">疑</span><p class="chat-member-name" title="{{teacher.name}}">{{teacher.name}}</p></li></ul></div><div ng-show="detailUser.course" class="chat-group-item chat-group-student"><div class="chat-detail-head"><span>学生</span> <span class="chat-user-count">({{detailUser.studentOnline || 0}}/{{detailUser.userList.students.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(student)" class="chat-course-member chat-dis-inlineblock" ng-repeat="student in detailUser.userList.students.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{student.img}}" alt=""></div><p class="chat-member-name" title="{{student.name}}">{{student.name}}</p></li></ul></div><div ng-show="!detailUser.course" class="chat-group-item chat-group-student"><div class="chat-detail-head"><span>讨论组成员</span> <span class="chat-user-count">({{detailUser.studentOnline || 0}}/{{detailUser.userList.member.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(student)" class="chat-course-member chat-dis-inlineblock" ng-repeat="student in detailUser.userList.member.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{student.img}}" alt=""></div><p class="chat-member-name" title="{{student.name}}">{{student.name}}</p></li></ul></div></div><div class="chat-user-detail chat-center chat-abs" ng-show="detailUser.type==\'user\' && !loading"><div class="chat-avatar"><img ng-src="{{detailUser.img}}" alt=""></div><p class="chat-detail-name">{{detailUser.name}}</p><p><span>{{detailUser.gender || \'男\'}}</span>，<span>{{detailUser.age || 15}}</span>岁</p><p>地区：<span>{{detailUser.addr || \'广东广州\'}}</span></p><p>教育经历：<span>{{detailUser.edu || \'广东工业大学 本科\'}}</span>，专业：<span>{{detailUser.master || \'电子商务\'}}</span></p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div class="chat-foot chat-abs"><button class="chat-btn" ng-click="enterChat(detailUser.origin || detailUser)">发起聊天</button></div></div><div ng-show="showFriendRequest" class="chat-notify-window"><div class="chat-header chat-drag"><span class="chat-target-name">好友通知</span></div><div class="chat-body chat-abs chat-request-list" ng-show="!loadingFriendRequest"><ul class="chat-body-left chat-center chat-scrollbar" ng-hide="!friendRequests.length"><li ng-repeat="request in friendRequests | orderBy: \'-time\'" class="chat-request-item"><p class="chat-black-text mg-b5">{{request.date}}</p><div ng-if="request.r === self.uuid"><div class="chat-dis-inlineblock"><img ng-src="{{request.lImg || \'/img/icon-252.png\'}}" alt="" class="chat-user-avatar"></div><div class="chat-dis-inlineblock"><p class="chat-black-text">{{request.lName || \'name\'}}</p><p ng-if="request.msg">验证信息：<span>{{request.msg}}</span></p><p ng-if="!request.msg">对方请求加您为好友</p><span class="chat-request-btn"><button ng-show="request.status === 1" class="chat-btn" ng-click="handleRequest(request, 4)">同意</button> <button ng-show="request.status === 1" class="chat-btn" ng-click="handleRequest(request, 2)">拒绝</button> <span ng-show="request.status === 4"><button class="chat-btn" ng-click="sendMsg(request)">发消息</button></span> <span ng-show="request.status === 2">已拒绝</span></span></div></div><div ng-if="request.l === self.uuid"><div class="chat-dis-inlineblock"><img ng-src="{{request.rImg || \'/img/icon-252.png\'}}" alt="" class="chat-user-avatar"></div><div class="chat-dis-inlineblock"><p class="chat-black-text">{{request.rName || \'name\'}}</p><p ng-if="request.status === 4">对方已同意您的好友请求</p><p ng-if="request.status === 2">对方已拒绝您的好友请求</p><p ng-if="request.status === 1 || request.status === 3">等待对方的回复</p><span class="chat-request-btn"><span ng-show="request.status === 1">等待中</span> <span ng-show="request.status === 4"><button class="chat-btn" ng-click="sendMsg(request)">发消息</button></span> <span ng-show="request.status === 2">已拒绝</span></span></div></div></li></ul><div ng-show="!friendRequests.length" style="padding:50px 0;text-align:center;color:#ccc">暂未收到好友请求。</div></div><div ng-show="loadingFriendRequest" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div class="chat-pos-fixed chat-pos-center chat-bg-transparent" ng-show="showScreenshot"><div class="chat-dis-table"><div class="chat-dis-tablecell"><div class="chat-screenshot-preview"><div class="chat-screenshot-preview-head">发送截图</div><div class="chat-screenshot-preview-body"><div><img src="{{base64}}" alt="" ng-style="screenshotImgStyle"></div><div><button class="chat-send-btn" ng-click="sendScreenshot()">发送截图</button> <button ng-click="cancelScreenshot()">取消</button></div><div>按Enter键快速发送截图，按ESC键取消发送。</div></div></div></div></div></div></div><div ng-show="show===\'addFriend\'" class="chat-add-friend chat-abs" ng-controller="addFriend"><div class="chat-search-detail chat-abs chat-center"><div ng-show="hasUserLogin" class="chat-search-full chat-scrollbar"><div class="chat-friend-search" ng-class="{\'chat-searching\': searchLoading}"><input type="text" class="chat-search-name" ng-model="searchName" ng-keydown="keydown($event)"> <button class="chat-btn" ng-hide="searchLoading" ng-click="search()"><span class="fa fa-search"></span></button> <button class="chat-btn" ng-show="searchLoading"><span class="fa fa-spinner fa-spin"></span></button></div><ul ng-hide="loading"><li ng-repeat="user in searchList" class="chat-friend-item chat-dis-inlineblock"><div class="chat-dis-inlineblock"><img class="chat-user-avatar" ng-src="{{user.img}}" alt=""></div><div class="chat-dis-inlineblock"><div class="chat-user-name" title="{{user.name}}">{{user.name}}</div><button class="chat-btn-addfriend" ng-click="addFriend(user)">+好友</button></div></li></ul><div ng-show="!searchList.length && !loading" class="chat-no-search"><div class="image-chat-add-icon"></div><p ng-show="!searched">赶紧添加几个好友吧</p><p ng-show="searched">搜索不到与 <span>{{searchName}}</span> 有关的用户</p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div><div class="chat-search-pa" ng-hide="!searchList.length || !hasUserLogin"><button class="chat-btn" ng-disabled="currentPageNo<=1" ng-click="goToSearchPage(currentPageNo - 1)" ng-class="{\'chat-disable\': currentPageNo <= 1}">上一页</button> <button class="chat-btn" ng-class="{\'chat-active\': currentPageNo === p}" ng-repeat="p in pa" ng-click="goToSearchPage(p)">{{p}}</button> <button class="chat-btn" ng-disabled="currentPageNo>=totalPage" ng-click="goToSearchPage(currentPageNo + 1)" ng-class="{\'chat-disable\': currentPageNo >= totalPage}">下一页</button> <span>总共 <span>{{totalPage}} 页</span></span></div></div></div><div ng-show="show===\'addGroup\'" class="chat-add-group chat-abs" ng-controller="addGroup"><div class="chat-add-main chat-abs" ng-show="hasUserLogin"><div class="chat-left chat-abs"><div class="chat-user-search"><input type="text" ng-model="searchUser"> <button class="icon-magnifier chat-btn"></button></div><div class="chat-scrollbar chat-abs"><div class="chat-friends" ng-repeat="group in groups" ng-if="[\'DEFAULT\', \'T-GRP\', \'S-GRP\'].indexOf(group.type)!=-1"><div class="chat-group-name"><a href="" ng-click="group.collapse=!group.collapse"><span class="fa" ng-class="{\'fa-angle-down\': !group.collapse, \'fa-angle-right\':group.collapse}"></span> <span>{{group.name}}</span></a></div><div ng-hide="group.collapse"><ul class="chat-group-list"><li ng-repeat="user in group.users" ng-hide="hideUnrelativeItem(user.name)" ng-if="showUnselected(user)"><a href="" ng-click="selectUser(user)"><input type="checkbox" ng-model="user.selected"> <span class="chat-avatar"><img ng-src="{{user.img}}" alt=""> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span></a></li></ul></div></div></div></div><div class="chat-center chat-add-selected chat-abs"><button class="fa fa-angle-right chat-btn" ng-click="confirmSelect()"></button></div><div class="chat-right chat-abs"><div>已选联系人：<span>{{selected.length || 0}}</span> 人</div><ul class="chat-scrollbar chat-abs chat-group-list"><li ng-repeat="user in selected" ng-mouseenter="user.showDelete=true" ng-mouseleave="user.showDelete=false"><span class="chat-avatar"><img ng-src="{{user.img}}" alt=""> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> <button class="chat-btn icon-close chat-abs chat-remove-select" ng-show="user.showDelete" ng-click="removeSelected(user)"></button></li></ul></div></div><div ng-show="hasUserLogin" class="chat-foot chat-abs"><button class="chat-btn" ng-click="addGroup()">确定</button> <button class="chat-btn" ng-click="close()">取消</button></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div ng-show="show===\'serve\'" class="chat-serve chat-abs"><ul ng-show="hasUserLogin && myCourse.length" class="chat-serve-list chat-abs chat-scrollbar"><li ng-repeat="course in myCourse" class="chat-serve-course"><div class="chat-detail-content"><img class="chat-course-img chat-abs" ng-src="{{course.cImg.split(\',\')[0] || \'img/icon-65.gif\'}}" alt=""><div class="chat-course-info chat-dis-inlineblock"><p class="chat-course-name"><a target="_blank" ng-href="course-detail.html?id={{course.cid}}">{{course.cname}}</a></p><p>参与人数：<span>{{course.uCnt || 0}}</span> 人</p><div class="chat-serve-teacher"><span>答疑：</span> <a href="" ng-click="enterChat(teacher)" ng-repeat="teacher in course.teachers" title="{{teacher.name}}" class="chat-avatar"><img ng-class="{grayscale: !teacher.online}" ng-src="{{teacher.img}}" alt=""></a></div><button class="chat-btn" ng-click="findTeacher(course.teachers)"><span class="image-chat-msg-icon chat-dis-inlineblock"></span>找老师</button></div></div></li></ul><div ng-show="hasUserLogin && !myCourse.length" style="margin:40px 0;text-align:center"><img src="img/no-question.png" alt=""><p style="margin-top:20px">暂未参与任何课程。<a href="search-page.html?type=&query=" target="_blank" style="color:#02c0b9;vertical-align:bottom">立即参与课程</a></p></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div class="chat-confirm-add" drag=".chat-confirm-drag" ng-show="showAddDialog"><div class="chat-header chat-confirm-drag"><span>添加好友</span> <button class="chat-close-window" ng-click="closeAddDialog()"><span class="icon-close"></span></button></div><div class="chat-body"><div class="chat-dis-inlineblock"><img class="chat-user-avatar" ng-src="{{addTarget.img}}" alt=""></div><div class="chat-dis-inlineblock"><p>您将添加以下好友：</p><p><span>{{addTarget.name}}</span></p></div><div class="mg-t10"><p>请输入验证信息：</p><textarea name="" id="" cols="30" rows="10" ng-model="msg" class="chat-confirm-msg"></textarea></div><div class="chat-foot"><button class="chat-btn" ng-click="requestAddFriend()">确定</button> <button class="chat-btn" ng-click="closeAddDialog()">关闭</button></div></div></div></div></div><div data-direction="left" class="chat-resize chat-resize-left"></div><div data-direction="right" class="chat-resize chat-resize-right"></div><div data-direction="top" class="chat-resize chat-resize-top"></div><div data-direction="bottom" class="chat-resize chat-resize-bottom"></div><div data-direction="top left" class="chat-resize-corner chat-resize chat-resize-corner-tl"></div><div data-direction="top right" class="chat-resize-corner chat-resize chat-resize-corner-tr"></div><div data-direction="bottom left" class="chat-resize-corner chat-resize chat-resize-corner-bl"></div><div data-direction="bottom right" class="chat-resize-corner chat-resize chat-resize-corner-br"></div></div></div></div>',
            restrict: 'E',
            scope: {
                position: '@',
                custom: '='
            },
            replace: true
        };

        obj.link = function (scope, element) {
            var doc               = angular.element(document);
            var body              = angular.element('body');
            var move              = {top: 0,left: 0};
            var cursorPos         = {left: 0,top: 0};

            var chatWindow        = element.find('.chat-window');
            var chatWindowSize    = {width: 0, height: 0};
            var windowSize        = {width: 0, height: 0};
            var resizeType;
            var chatWindowPos;
            var tmpL, tmpT;


            angular.element('.chat-resize').on('mousedown', function (event) {
                var type = $(this).data('direction');
                resize(type, event);
            });

            function resize (type, event) {
                var left, top;
                chatWindow.css({top: chatWindow.position().top, bottom: 'auto'});
                chatWindow.css({left: chatWindow.position().left, right: 'auto'});
                chatWindowSize.width  = chatWindow.width();
                chatWindowSize.height = chatWindow.height();
                windowSize.width      = angular.element(window).width();
                windowSize.height     = angular.element(window).height();
                left                  = event.clientX;
                top                   = event.clientY;
                
                cursorPos.left        = left;
                cursorPos.top         = top;
                
                resizeType            = type.split(' ');
                chatWindowPos         = chatWindow.position();

                doc.on('mousemove', mousemove);
                doc.on('mouseup', mouseup);
                body.addClass('no-select');
            }

            function mousemove (event) {
                var left, top, width, height;
                left      = event.clientX;
                top       = event.clientY;
                move.top  = top - cursorPos.top;
                move.left = left - cursorPos.left;

                angular.forEach(resizeType, function (t) {
                    switch (t) {
                        case 'bottom': {
                            height = chatWindowSize.height + move.top;
                            height = height < 400 ? 400 : height;
                            height = chatWindowPos.top + height > windowSize.height ? (windowSize.height - chatWindowPos.top) : height;
                            chatWindow.height(height);
                            break;
                        }
                        case 'right': {
                            width = chatWindowSize.width + move.left;
                            width = width < 660 ? 660 : width;
                            width = chatWindowPos.left + width > windowSize.width ? (windowSize.width - chatWindowPos.left) : width;
                            chatWindow.width(width);
                            break;
                        }
                        case 'left': {
                            if (chatWindowPos.left + move.left <= 0) {
                                move.left = -chatWindowPos.left;
                            }
                            width = chatWindowSize.width - move.left;
                            width = width < 660 ? 660 : width;
                            chatWindow
                            .width(width)
                            .css({ left: chatWindowPos.left + move.left });
                            break;
                        }
                        case 'top': {
                            if (chatWindowPos.top + move.top <= 0) {
                                move.top = -chatWindowPos.top;
                            }
                            height = chatWindowSize.height - move.top;
                            height = height < 400 ? 400 : height;
                            chatWindow
                            .height(height)
                            .css({ top: chatWindowPos.top + move.top });
                            break;
                        }
                    }
                });

            }

            function mouseup () {
                doc.off('mousemove', mousemove);
                doc.off('mouseup', mouseup);
                body.removeClass('no-select');
                tmpL = null;
                tmpT = null;
            }
        };
        return obj;
    });
})();