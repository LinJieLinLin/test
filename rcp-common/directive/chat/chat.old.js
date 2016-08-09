/* globals g_conf, IM, unescape, C4js, jf */

(function () {
    var slice = [].slice;
    var enableLog = false;
    var devlog = function () {
        if (enableLog) {
            console.log.apply(console, arguments);
        }
    };
    /* jshint camelcase:false */
    var conf = g_conf;
    var getToken = (rcpAid && rcpAid.getToken) ? 
        function () {
            return rcpAid.getToken.call(rcpAid);
        } 
        : 
        function () {
             var queryString = function (name) {
                var result=window.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
                if(!result){
                    return '';
                }
                return decodeURIComponent(result[1]);
            };
            var getCookie = function(sName) {
                var aCookie = document.cookie.split('; ');
                for (var i=0; i < aCookie.length; i+=1) {
                    var aCrumb = aCookie[i].split('=');
                    if (sName === aCrumb[0]){
                        if (!aCrumb[1]) {
                            return this.queryString('token');
                        }
                        return unescape(aCrumb[1]);
                    }
                }
                return null;
            };
            var token = queryString('token');
            if (!token) {
                token = getCookie('token');
            }
            if (!token) {
                if (typeof localStorage !== 'undefined') {
                    token = localStorage.getItem('anonymousLoginToken');
                }
            }
            return token;
        };
    var log = function () {
        if (typeof jf !== 'undefined' && jf.alert) {
            var arr = slice.call(arguments);
            jf.alert(arr.join(','));
        } else {
            console.log.apply(console, arguments);
        }
    };
    var saveToken = function (token) {
        if (localStorage) {
            localStorage.setItem('anonymousLoginToken', token);
        }
    };
    var module = angular.module('chat_directive', []);
    module.directive('chat', ['$q', '$timeout', '$sce', '$location', '$anchorScroll', 'chatApi', 'chatService', 'service', function ($q, $timeout, $sce, $location, $anchorScroll, chatApi, chatService, service) {
        var obj = {
            template:'<div><div class="online-chat" ng-class="{\'online-chat-left\': position == \'left\'}" ng-controller="chat" ng-hide="isIE9"><div ng-hide="showChatWindow" class="chat-login" ng-mouseover="active=true" ng-mouseleave="active=false;"><span ng-show="unreadAll() > 0" class="chat-unread">{{unreadAll() > 99 ? \'99+\' : unreadAll()}}</span> <button type="button" class="chat-btn chat-rel" ng-hide="loginStatus==\'pending\' || loginStatus==\'logined\' && !readyToOpenWindow" ng-click="open()"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> <span ng-hide="unreadMsgList.length">{{hasUserLogin ? \'在线聊天\' : \'亲，需要帮助吗？\'}}</span> <span ng-show="unreadMsgList.length" class="chat-msg-tips" title="{{unreadMsgList[0].message}}"><span>{{unreadMsgList[0].sender.name}}：</span><span>{{unreadMsgList[0].message}}</span></span></button> <button type="button" class="chat-btn chat-rel" ng-show="loginStatus==\'pending\'"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> <span ng-show="chatError">初始化失败</span> <span ng-show="!chatError">登陆中</span></button> <button type="button" class="chat-btn chat-rel" ng-show="loginStatus==\'logined\' && !readyToOpenWindow"><span class="chat-login-icon chat-dis-inlineblock" ng-class="{\'image-chat\': !active, \'image-chat-active\': active}"></span> 连接中</button></div><div class="chat-window" ng-show="showChatWindow" drag=".chat-head" position="fixed" limit="true"><div class="chat-main-body chat-abs"><ul class="chat-menu chat-abs"><li><a href=""><span class="chat-avatar"><img ng-src="{{self.img}}" alt=""> </span><span class="chat-online"></span></a></li><li class="chat-rel" title="消息" ng-mouseenter="msgHover=true" ng-mouseleave="msgHover=false" data="{{activeTab}}"><a ng-click="switchTab(\'msg\')" href="" ng-class="{\'chat-active\': msgHover || activeTab==\'msg\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-msg-active\': msgHover || activeTab==\'msg\', \'image-chat-msg\':!msgHover && activeTab!=\'msg\'}"></span>消息</a> <span ng-show="unreadAll() > 0" class="chat-unread">{{unreadAll() > 99 ? \'99+\' : unreadAll()}}</span></li><li title="找老师" ng-mouseenter="serveHover=true" ng-mouseleave="serveHover=false"><a ng-click="switchTab(\'serve\')" href="" ng-class="{\'chat-active\': serveHover || activeTab==\'serve\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-serve-active\': serveHover || activeTab==\'serve\', \'image-chat-serve\':!serveHover && activeTab!=\'serve\'}"></span>找老师</a></li><li title="找客服" ng-mouseenter="guideHover=true" ng-mouseleave="guideHover=false" ng-hide="isHelpTeacher"><a ng-click="switchTab(\'guide\')" href="" ng-class="{\'chat-active\': guideHover || activeTab==\'guide\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-guide-active\': guideHover || activeTab==\'guide\', \'image-chat-guide\':!guideHover && activeTab!=\'guide\'}"></span>找客服</a></li><li title="群组" ng-mouseenter="groupHover=true" ng-mouseleave="groupHover=false"><a ng-click="switchTab(\'group\')" href="" ng-class="{\'chat-active\': groupHover || activeTab==\'group\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-group-active\': groupHover || activeTab==\'group\', \'image-chat-group\':!groupHover && activeTab!=\'group\'}"></span>群组</a></li><li title="好友" ng-mouseenter="friendHover=true" ng-mouseleave="friendHover=false"><a ng-click="switchTab(\'friend\')" href="" ng-class="{\'chat-active\': friendHover || activeTab==\'friend\'}"><span class="chat-menu-icon" ng-class="{\'image-chat-friend-active\': friendHover || activeTab==\'friend\', \'image-chat-friend\':!friendHover && activeTab!=\'friend\'}"></span>好友</a></li><li ng-mouseenter="menuHover=true" ng-mouseleave="menuHover=false"><a ng-click="showAddMenu()" href=""><span class="chat-menu-icon" ng-class="{\'image-chat-menu-active\': menuHover, \'image-chat-menu\':!menuHover}"></span></a><div ng-show="addMenu" class="chat-add-menu chat-abs"><a href="" ng-click="addFriend()">添加好友</a> <a href="" ng-click="addGroup()">创建讨论组</a></div></li></ul><div class="chat-right-content"><div class="chat-head chat-abs"><p>{{tabName}}</p><button class="chat-btn icon-close chat-abs" ng-click="close()"></button></div><div ng-show="show===\'main\'" class="chat-user-list chat-abs" ng-controller="chatContact"><div class="chat-user-search"><input type="text" ng-focus="focusSearchInput()" ng-change="changeSearchInput()" ng-model="searchUser" ng-keydown="enterSearchUser($event)"> <button ng-click="searchUserResult()" class="icon-magnifier chat-btn"></button></div><div ng-if="activeTab==\'friend\' || activeTab==\'group\'" class="chat-content-wrapper chat-scrollbar"><div ng-show="hasUserLogin" class="chat-groups"><div class="chat-friends" ng-repeat="group in groups|orderObjectBy:\'order\'" ng-if="(activeTab==\'friend\' && friendGroupList.indexOf(group.type)!=-1) || (activeTab==\'group\'&&groupGroupList.indexOf(group.type)!=-1)" ng-hide="group.name === \'我的学生\' && !isTeacher"><div class="chat-group-name"><a href="" ng-click="group.expand=!group.expand"><span class="fa" ng-class="{\'fa-angle-down\': group.expand, \'fa-angle-right\':!group.expand}"></span> <span>{{group.name}}</span> <span class="chat-group-count" ng-if="activeTab==\'friend\'">{{onlineCount(group.users)}}/{{group.users.length}}</span> <span class="chat-group-count" ng-if="activeTab==\'group\'">{{group.users.length}}</span></a></div><div ng-show="group.expand"><ul class="chat-group-list"><li ng-class="{\'chat-current\': user.uuid==chatTarget.uuid}" ng-repeat="user in group.users" ng-hide="hideUnrelativeItem(user.name)"><a href="" ng-click="showUserDetail(user)"><span class="chat-avatar"><img ng-src="{{user.img}}" alt="" ng-class="{\'grayscale\': !user.online}"> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> </a><span ng-show="unread[user.uuid] > 0" class="chat-unread">{{unread[user.uuid] > 99 ? \'99+\' : unread[user.uuid]}}</span></li></ul></div></div></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">( ▼-▼ )</p><p style="font-size:16px;margin-bottom:10px">什么也没有</p><p>登录后体验更多</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div ng-if="activeTab==\'msg\'" class="chat-content-wrapper chat-scrollbar"><ul class="chat-group-list chat-msg-list"><li ng-class="{\'chat-current\': (user.uuid==chatTarget.uuid) || (showFriendRequest && user.uuid===\'U-0\')}" ng-repeat="user in recentUser" ng-mouseenter="user.showClose=true" ng-mouseleave="user.showClose=false" ng-hide="hideUnrelativeItem(user.name)"><button ng-click="deleteRecentChat(user, $index)" ng-show="user.showClose" class="chat-delete-window"><span class="icon-close"></span></button> <a href="" ng-click="openChatWindow(user)"><span class="chat-avatar"><img ng-src="{{user.img}}" alt="" ng-class="{\'grayscale\': !user.online}"> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> </a><span ng-show="unread[user.uuid] > 0" class="chat-unread">{{unread[user.uuid] > 99 ? \'99+\' : unread[user.uuid]}}</span></li><p ng-show="!recentUser.length" style="margin:50px 0;text-align:center;color:#ccc">暂无最近联系人。</p></ul></div></div><div ng-show="show===\'main\'" class="chat-content" ng-controller="chatContent"><div ng-show="showMain" class="chat-main chat-center" ng-class="{\'chat-record-open\': showMsgRecord}"><div class="chat-header chat-drag"><span class="chat-target-name" title="{{chatTarget.name}}">{{chatTarget.name}}</span> <a href="" ng-click="addFriend(chatTarget)" class="image-chat-friend-add chat-abs chat-friend-add" ng-show="showAddFriendBtn && hasUserLogin"></a> <a href="" ng-click="showGroupDetail(chatTarget)" class="image-chat-group chat-abs chat-friend-add" ng-show="chatType==\'group\'"></a></div><div class="chat-body chat-abs"><div class="chat-body-left chat-center"><div class="chat-history chat-scrollbar"><ul><div ng-hide="loadingMsg || noMoreMsg" class="chat-show-more"><a href="" ng-click="loadMoreMsg()"><span class="fa fa-clock-o"></span>查看更多消息</a></div><div ng-show="loadingMsg" class="chat-show-more"><span class="fa fa-spinner fa-spin"></span>正在载入</div><chat-msg chat-type="chatType" index="{{$index}}" ng-repeat="msg in currentChatMsg" msg="msg" id="msg-{{currentChatMsg.length - $index}}"></chat-msg></ul></div><a ng-show="unreadMsg>0" class="chat-unread-msg" ng-click="showNewMsg()">您有 <span>{{unreadMsg}}</span> 条新消息</a><div class="chat-editor"><div class="chat-editor-helper chat-rel"><a href="" ng-click="selectUploadFile(2)"><span class="icon-polaroid"></span> </a><a href="" ng-click="selectUploadFile(3)"><span class="icon-sent-files"></span> </a><a href="" ng-class="{\'chat-btn-opened\': showMsgRecord}" ng-click="openMsgRecord()" class="chat-open-record chat-abs"><span class="fa fa-clock-o"></span> 消息记录 </a><input type="file" id="chat-img-upload" style="display:none" accept="image/*"> <input type="file" id="chat-file-upload" style="display:none" accept="*"></div><div class="chat-editor-input"><textarea name="" id="msg-content" cols="30" rows="10" ng-model="msg" ng-keydown="typeMsg($event)"></textarea></div><div class="chat-send"><button class="chat-btn" ng-show="self.name === \'superone\'" ng-click="autoSendMsg(1000)">发送1000条消息</button> <button ng-click="endChat()" class="chat-btn">结束</button> <button class="chat-btn chat-btn-active" ng-click="send()">发送</button></div></div></div></div><div class="chat-msg-record chat-dis-inlineblock" ng-show="showMsgRecord" ng-controller="record"><div class="chat-record-head chat-dis-inlineblock"><span>消息记录</span> <button class="chat-btn" ng-click="$parent.openMsgRecord()">&times;</button></div><div class="chat-record-body chat-scrollbar"><ul class="chat-record-list" ng-class="{\'chat-record-list-pd\': showSearch}"><li ng-repeat="msg in record" ng-hide="loading" ng-class="{\'chat-msg-mine\': msg.sender.id == self.id}" class="pd-x10 mg-y10"><p class="chat-record-day" ng-show="showDay($index)">{{msg.day}}</p><span class="chat-record-name">{{msg.sender.name}}</span> <span class="chat-record-time mg-l10">{{msg.time}}</span><div class="chat-record-content mg-t5" ng-bind-html="msg.msg|html" ng-hide="msg.fileType===2"></div><div class="chat-record-content mg-t5" msg-img="msg" ng-if="msg.fileType===2"></div></li><div ng-show="!record.length && !loading" style="padding:50px 0;text-align:center;color:#ccc"><span class="image-chat-record-empty chat-dis-inlineblock mg-b20"></span><p ng-if="date==today&&recordDate">亲，您今天还没跟 <span>{{chatTarget.name}}</span> 交流哦~</p><p ng-if="date!=today&&recordDate">亲，<span>{{recordDate}}</span>那天您没有和 <span>{{chatTarget.name}}</span> 交流哦~</p><p ng-if="!recordDate">亲，您没有和 <span>{{chatTarget.name}}</span> 交流过哦~</p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></ul></div><div class="chat-record-foot chat-abs"><button ng-class="{\'chat-btn-opened\': showSearch}" ng-click="openSearch()" class="fa fa-search chat-record-search chat-btn"></button><p class="chat-record-search-option chat-abs" ng-show="showSearch">内容：<input type="text" ng-model="searchName" ng-keydown="enterSearchName($event)"> <button class="chat-btn" ng-click="searchRecord()">确定</button></p><span class="chat-record-date mg-l5 pd-l10"><div ng-click="showSelectDate($event)" class="fa fa-calendar chat-btn chat-rel"></div><datetime value="selectedDate" no-input="true" config="dateConfig" startdate="startDate" enddate="endDate"></datetime><span>{{date}}</span> </span><span class="chat-record-pa chat-abs"><button ng-class="{\'chat-disable\': currentPageNo <= 1}" ng-click="jumpToPage(1)" class="chat-btn fa fa-angle-double-left"></button> <button ng-class="{\'chat-disable\': currentPageNo <= 1}" ng-click="jumpToPage(+currentPageNo - 1)" class="chat-btn fa fa-angle-left"></button> <button ng-class="{\'chat-disable\': currentPageNo >= total}" ng-click="jumpToPage(+currentPageNo + 1)" class="chat-btn fa fa-angle-right"></button> <button ng-class="{\'chat-disable\': currentPageNo >= total}" ng-click="jumpToPage(total)" class="chat-btn fa fa-angle-double-right"></button></span></div></div></div><div ng-show="showNoTarget" class="chat-no-target chat-abs chat-center"><span class="image-chat-big chat-dis-inlineblock"></span><p>赶紧找个人聊天吧</p></div><div ng-show="showDetail" class="chat-group-detail chat-abs chat-center"><div class="chat-header chat-drag"><span class="chat-target-name" ng-show="detailUser.gType !==\'CHAT_GRP\'">{{detailUser.type === \'user\' ? \'个人\' : \'群组\'}}资料</span> <span class="chat-target-name" ng-show="detailUser.gType ===\'CHAT_GRP\'">讨论组资料</span></div><div class="chat-body chat-abs chat-scrollbar"><div ng-show="detailUser.type!==\'user\' && !loading"><div ng-show="detailUser.course" class="chat-group-course chat-group-item"><div class="chat-detail-head">当前课程</div><div class="chat-detail-content"><img class="chat-course-img chat-abs" ng-src="{{detailUser.course.imgs.split(\',\')[0] || \'img/icon-65.gif\'}}" alt=""><div class="chat-course-info chat-dis-inlineblock"><p class="chat-course-name"><a ng-href="course-detail.html?id={{detailUser.course.id}}" target="_blank">{{detailUser.course.name}}</a></p><p class="chat-course-user">创建者：<span>{{detailUser.course.userName}}</span></p></div></div></div><div ng-show="detailUser.course" class="chat-group-item chat-group-teacher"><div class="chat-detail-head">老师 <span class="chat-user-count">({{detailUser.teacherOnline || 0}}/{{detailUser.userList.teachers.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(teacher)" class="chat-course-member chat-dis-inlineblock" ng-repeat="teacher in detailUser.userList.teachers.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{teacher.img}}" alt=""></div><span class="chat-member-role chat-teacher-guide" ng-show="teacher.role.indexOf(\'GUIDE\') !== -1">导</span> <span class="chat-member-role chat-teacher-answer" ng-show="teacher.role.indexOf(\'ANSWER\') !== -1">疑</span><p class="chat-member-name" title="{{teacher.name}}">{{teacher.name}}</p></li></ul></div><div ng-show="detailUser.course" class="chat-group-item chat-group-student"><div class="chat-detail-head"><span>学生</span> <span class="chat-user-count">({{detailUser.studentOnline || 0}}/{{detailUser.userList.students.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(student)" class="chat-course-member chat-dis-inlineblock" ng-repeat="student in detailUser.userList.students.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{student.img}}" alt=""></div><p class="chat-member-name" title="{{student.name}}">{{student.name}}</p></li></ul></div><div ng-show="!detailUser.course" class="chat-group-item chat-group-student"><div class="chat-detail-head"><span>讨论组成员</span> <span class="chat-user-count">({{detailUser.studentOnline || 0}}/{{detailUser.userList.member.users.length}})</span></div><ul class="chat-detail-content"><li ng-click="enterChat(student)" class="chat-course-member chat-dis-inlineblock" ng-repeat="student in detailUser.userList.member.users"><div class="chat-avatar"><img class="chat-avatar" ng-src="{{student.img}}" alt=""></div><p class="chat-member-name" title="{{student.name}}">{{student.name}}</p></li></ul></div></div><div class="chat-user-detail chat-center chat-abs" ng-show="detailUser.type==\'user\' && !loading"><div class="chat-avatar"><img ng-src="{{detailUser.img}}" alt=""></div><p class="chat-detail-name">{{detailUser.name}}</p><p><span>{{detailUser.gender || \'男\'}}</span>，<span>{{detailUser.age || 15}}</span>岁</p><p>地区：<span>{{detailUser.addr || \'广东广州\'}}</span></p><p>教育经历：<span>{{detailUser.edu || \'广东工业大学 本科\'}}</span>，专业：<span>{{detailUser.master || \'电子商务\'}}</span></p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div class="chat-foot chat-abs"><button class="chat-btn" ng-click="enterChat(detailUser.origin || detailUser)">发起聊天</button></div></div><div ng-show="showFriendRequest" class="chat-notify-window"><div class="chat-header chat-drag"><span class="chat-target-name">好友通知</span></div><div class="chat-body chat-abs chat-request-list" ng-show="!loadingFriendRequest"><ul class="chat-body-left chat-center chat-scrollbar" ng-hide="!friendRequests.length"><li ng-repeat="request in friendRequests | orderBy: \'-time\'" class="chat-request-item"><p class="chat-black-text mg-b5">{{request.date}}</p><div ng-if="request.r === self.uuid"><div class="chat-dis-inlineblock"><img ng-src="{{request.lImg || \'/img/icon-252.png\'}}" alt="" class="chat-user-avatar"></div><div class="chat-dis-inlineblock"><p class="chat-black-text">{{request.lName || \'name\'}}</p><p ng-if="request.msg">验证信息：<span>{{request.msg}}</span></p><p ng-if="!request.msg">对方请求加您为好友</p><span class="chat-request-btn"><button ng-show="request.status === 1" class="chat-btn" ng-click="handleRequest(request, 4)">同意</button> <button ng-show="request.status === 1" class="chat-btn" ng-click="handleRequest(request, 2)">拒绝</button> <span ng-show="request.status === 4"><button class="chat-btn" ng-click="sendMsg(request)">发消息</button></span> <span ng-show="request.status === 2">已拒绝</span></span></div></div><div ng-if="request.l === self.uuid"><div class="chat-dis-inlineblock"><img ng-src="{{request.rImg || \'/img/icon-252.png\'}}" alt="" class="chat-user-avatar"></div><div class="chat-dis-inlineblock"><p class="chat-black-text">{{request.rName || \'name\'}}</p><p ng-if="request.status === 4">对方已同意您的好友请求</p><p ng-if="request.status === 2">对方已拒绝您的好友请求</p><p ng-if="request.status === 1 || request.status === 3">等待对方的回复</p><span class="chat-request-btn"><span ng-show="request.status === 1">等待中</span> <span ng-show="request.status === 4"><button class="chat-btn" ng-click="sendMsg(request)">发消息</button></span> <span ng-show="request.status === 2">已拒绝</span></span></div></div></li></ul><div ng-show="!friendRequests.length" style="padding:50px 0;text-align:center;color:#ccc">暂未收到好友请求。</div></div><div ng-show="loadingFriendRequest" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div class="chat-pos-fixed chat-pos-center chat-bg-transparent" ng-show="showScreenshot"><div class="chat-dis-table"><div class="chat-dis-tablecell"><div class="chat-screenshot-preview"><div class="chat-screenshot-preview-head">发送截图</div><div class="chat-screenshot-preview-body"><div><img src="{{base64}}" alt="" ng-style="screenshotImgStyle"></div><div><button class="chat-send-btn" ng-click="sendScreenshot()">发送截图</button> <button ng-click="cancelScreenshot()">取消</button></div><div>按Enter键快速发送截图，按ESC键取消发送。</div></div></div></div></div></div></div><div ng-show="show===\'addFriend\'" class="chat-add-friend chat-abs" ng-controller="addFriend"><div class="chat-search-detail chat-abs chat-center"><div ng-show="hasUserLogin" class="chat-search-full chat-scrollbar"><div class="chat-friend-search" ng-class="{\'chat-searching\': searchLoading}"><input type="text" class="chat-search-name" ng-model="searchName" ng-keydown="keydown($event)"> <button class="chat-btn" ng-hide="searchLoading" ng-click="search()"><span class="fa fa-search"></span></button> <button class="chat-btn" ng-show="searchLoading"><span class="fa fa-spinner fa-spin"></span></button></div><ul ng-hide="loading"><li ng-repeat="user in searchList" class="chat-friend-item chat-dis-inlineblock"><div class="chat-dis-inlineblock"><img class="chat-user-avatar" ng-src="{{user.img}}" alt=""></div><div class="chat-dis-inlineblock"><div class="chat-user-name" title="{{user.name}}">{{user.name}}</div><button class="chat-btn-addfriend" ng-click="addFriend(user)">+好友</button></div></li></ul><div ng-show="!searchList.length && !loading" class="chat-no-search"><div class="image-chat-add-icon"></div><p ng-show="!searched">赶紧添加几个好友吧</p><p ng-show="searched">搜索不到与 <span>{{searchName}}</span> 有关的用户</p></div><div ng-show="loading" class="chat-loading chat-abs chat-center"><span class="fa fa-spinner fa-spin"></span> <span>正在载入中...</span></div></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div><div class="chat-search-pa" ng-hide="!searchList.length || !hasUserLogin"><button class="chat-btn" ng-disabled="currentPageNo<=1" ng-click="goToSearchPage(currentPageNo - 1)" ng-class="{\'chat-disable\': currentPageNo <= 1}">上一页</button> <button class="chat-btn" ng-class="{\'chat-active\': currentPageNo === p}" ng-repeat="p in pa" ng-click="goToSearchPage(p)">{{p}}</button> <button class="chat-btn" ng-disabled="currentPageNo>=totalPage" ng-click="goToSearchPage(currentPageNo + 1)" ng-class="{\'chat-disable\': currentPageNo >= totalPage}">下一页</button> <span>总共 <span>{{totalPage}} 页</span></span></div></div></div><div ng-show="show===\'addGroup\'" class="chat-add-group chat-abs" ng-controller="addGroup"><div class="chat-add-main chat-abs" ng-show="hasUserLogin"><div class="chat-left chat-abs"><div class="chat-user-search"><input type="text" ng-model="searchUser"> <button class="icon-magnifier chat-btn"></button></div><div class="chat-scrollbar chat-abs"><div class="chat-friends" ng-repeat="group in groups" ng-if="[\'DEFAULT\', \'T-GRP\', \'S-GRP\'].indexOf(group.type)!=-1"><div class="chat-group-name"><a href="" ng-click="group.collapse=!group.collapse"><span class="fa" ng-class="{\'fa-angle-down\': !group.collapse, \'fa-angle-right\':group.collapse}"></span> <span>{{group.name}}</span></a></div><div ng-hide="group.collapse"><ul class="chat-group-list"><li ng-repeat="user in group.users" ng-hide="hideUnrelativeItem(user.name)" ng-if="showUnselected(user)"><a href="" ng-click="selectUser(user)"><input type="checkbox" ng-model="user.selected"> <span class="chat-avatar"><img ng-src="{{user.img}}" alt=""> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span></a></li></ul></div></div></div></div><div class="chat-center chat-add-selected chat-abs"><button class="fa fa-angle-right chat-btn" ng-click="confirmSelect()"></button></div><div class="chat-right chat-abs"><div>已选联系人：<span>{{selected.length || 0}}</span> 人</div><ul class="chat-scrollbar chat-abs chat-group-list"><li ng-repeat="user in selected" ng-mouseenter="user.showDelete=true" ng-mouseleave="user.showDelete=false"><span class="chat-avatar"><img ng-src="{{user.img}}" alt=""> </span><span class="chat-user-name" title="{{user.name}}">{{user.name}}</span> <button class="chat-btn icon-close chat-abs chat-remove-select" ng-show="user.showDelete" ng-click="removeSelected(user)"></button></li></ul></div></div><div ng-show="hasUserLogin" class="chat-foot chat-abs"><button class="chat-btn" ng-click="addGroup()">确定</button> <button class="chat-btn" ng-click="close()">取消</button></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div ng-show="show===\'serve\'" class="chat-serve chat-abs"><ul ng-show="hasUserLogin && myCourse.length" class="chat-serve-list chat-abs chat-scrollbar"><li ng-repeat="course in myCourse" class="chat-serve-course"><div class="chat-detail-content"><img class="chat-course-img chat-abs" ng-src="{{course.cImg.split(\',\')[0] || \'img/icon-65.gif\'}}" alt=""><div class="chat-course-info chat-dis-inlineblock"><p class="chat-course-name"><a target="_blank" ng-href="course-detail.html?id={{course.cid}}">{{course.cname}}</a></p><p>参与人数：<span>{{course.uCnt || 0}}</span> 人</p><div class="chat-serve-teacher"><span>答疑：</span> <a href="" ng-click="enterChat(teacher)" ng-repeat="teacher in course.teachers" title="{{teacher.name}}" class="chat-avatar"><img ng-class="{grayscale: !teacher.online}" ng-src="{{teacher.img}}" alt=""></a></div><button class="chat-btn" ng-click="findTeacher(course.teachers)"><span class="image-chat-msg-icon chat-dis-inlineblock"></span>找老师</button></div></div></li></ul><div ng-show="hasUserLogin && !myCourse.length" style="margin:40px 0;text-align:center"><img src="img/no-question.png" alt=""><p style="margin-top:20px">暂未参与任何课程。<a href="search-page.html?type=&query=" target="_blank" style="color:#02c0b9;vertical-align:bottom">立即参与课程</a></p></div><div ng-show="!hasUserLogin" class="chat-login-tips chat-abs chat-center"><p style="font-size:16px">o(^▽^)o</p><p style="font-size:16px;margin-bottom:10px">需要先登录哦~</p><p><a href="" ng-click="showLoginWindow()">马上登录</a></p></div></div><div class="chat-confirm-add" drag=".chat-confirm-drag" ng-show="showAddDialog"><div class="chat-header chat-confirm-drag"><span>添加好友</span> <button class="chat-close-window" ng-click="closeAddDialog()"><span class="icon-close"></span></button></div><div class="chat-body"><div class="chat-dis-inlineblock"><img class="chat-user-avatar" ng-src="{{addTarget.img}}" alt=""></div><div class="chat-dis-inlineblock"><p>您将添加以下好友：</p><p><span>{{addTarget.name}}</span></p></div><div class="mg-t10"><p>请输入验证信息：</p><textarea name="" id="" cols="30" rows="10" ng-model="msg" class="chat-confirm-msg"></textarea></div><div class="chat-foot"><button class="chat-btn" ng-click="requestAddFriend()">确定</button> <button class="chat-btn" ng-click="closeAddDialog()">关闭</button></div></div></div></div></div><div data-direction="left" class="chat-resize chat-resize-left"></div><div data-direction="right" class="chat-resize chat-resize-right"></div><div data-direction="top" class="chat-resize chat-resize-top"></div><div data-direction="bottom" class="chat-resize chat-resize-bottom"></div><div data-direction="top left" class="chat-resize-corner chat-resize chat-resize-corner-tl"></div><div data-direction="top right" class="chat-resize-corner chat-resize chat-resize-corner-tr"></div><div data-direction="bottom left" class="chat-resize-corner chat-resize chat-resize-corner-bl"></div><div data-direction="bottom right" class="chat-resize-corner chat-resize chat-resize-corner-br"></div></div></div></div>',
            restrict: 'E',
            scope: {
                position: '@',
                custom: '='
            }
        };
        obj.link = function (scope, element) {
            var websocket;
            var token;
            var uploader;
            var allUsers            = {};
            var scrollCount         = 0;
            var remainingMsg        = false;
            scope.wsConnected       = false;
            scope.uploadFiles       = {};
            scope.uploadStatus      = 'finish';
            scope.uploadType        = 2; // 2: 上传图片， 3:上传文件
            scope.self              = {};
            scope.unread            = {};
            scope.chatTarget        = null;
            scope.currentChatMsg    = [];
            scope.remainingMsgCount = 0;
            scope.recentUser        = [];
            scope.base64            = '';
            scope.showScreenshot    = false;
            scope.showMsgRecord     = true;
            scope.activeTab         = 'msg';
            scope.tabContentToShow  = scope.activeTab;
            scope.groups            = [{
                name: '我的好友',
                users: [],
                type: 'DEFAULT'
            }, {
                name: '学习群组',
                users: [],
                type: 'GROUPS'
            },{
                name: '助学',
                users: [],
                type: 'HELP_SRV'
            }];
            scope.screenshotImgStyle = {
                'max-width': angular.element(window).width() * 0.8,
                'max-height': angular.element(window).height() * 0.8
            };
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
            function initializeGroupInfo () {
                scope.groupInfo = {
                    userList: [{
                        name: '导学老师',
                        users: [],
                        role: 'GUIDE',
                        isTeacher: true
                    }, {
                        name: '答疑老师',
                        users: [],
                        role: 'ANSWER',
                        isTeacher: true
                    }, {
                        name: '学习成员',
                        users: [],
                        role: 'MEMBER',
                        isTeacher: false
                    }],
                    cid: 0,
                    gType: ''
                };
            }
            function parseMsg (msg) {
                var obj;
                var result;
                var text      = msg.c;
                var urlRegexp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/gi;
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
                            var tmpl    = ['<div class="chat-msg-file"><div class="chat-msg-file-icon"><img src="img/icon-92.png" /></div>',
                            '<div class ="chat-msg-file-info"><span class="chat-msg-filename" title="{{name}}">{{name}}</span><span class="chat-msg-filesize">({{size}})</span>',
                            '<p><a href ="{{url}}" download>下载</a></p></div></div>'].join('');
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
                    default: {
                        text = escape(text);
                        text = text.replace(urlRegexp, function (match) {
                            var linkTmpl = '<a target="_blank" class="chat-msg-link" href="{{href}}" title="">{{href}}</a>';
                            return linkTmpl.replace(/{{href}}/gi, match) ;
                        });
                        result = '<div>' + text + '</div>';
                        break;
                    }
                }
                return result;
            }
            function parseTime(text) {
                if (typeof text !== 'number') {
                    return text;
                }
                var d      = new Date(text);
                var year   = d.getFullYear();
                var month  = d.getMonth() + 1;
                var day    = d.getDate();
                var hour   = d.getHours();
                var minute = d.getMinutes();
                month      = month > 9 ? month : '0' + month;
                day        = day > 9 ? day : '0' + day;
                hour       = hour > 9 ? hour : '0' + hour;
                minute     = minute > 9 ? minute : '0' + minute;
                return [year, month, day].join('-') + ' ' + [hour, minute].join(':');
            }
            function registerWS () {
                var defer = $q.defer();
                if (websocket) {
                    if (scope.wsConnected) {
                        defer.resolve();
                    } else {
                        var unwatch = scope.$watch('wsConnected', function (value) {
                            if (value) {
                                defer.resolve();
                                unwatch();
                            }
                        });
                    }
                } else {
                    websocket = IM.NewIm(conf.imAddr, true);
                    websocket.on('connect', function () {
                        $timeout(function () {
                            scope.wsConnected = true;
                            defer.resolve();
                        });
                    });
                    handleWSEvent();
                }
                return defer.promise;
            }
            function handleWSEvent () {    
                websocket.on('li', function () {

                });
                websocket.on('m', function (data) {
                    var id, uuid;
                    if (data.a[0] === 'G') {
                        id = +data.a.split('-')[1];
                        uuid = data.a;
                    } else {
                        id   = +data.s.split('-')[1];
                        uuid = data.s;
                    }
                    if (!scope.chatTarget || scope.chatTarget.id !== id) {
                        scope.unread[id] = typeof scope.unread[id] === 'undefined' ? 1 : scope.unread[id] + 1;
                    }
                    getSender(data.s).then(function (sender) {
                        data.c    = parseMsg(data);
                        data.time = parseTime(data.time);
                        devlog('get sender', sender);
                        getSender(uuid).then(function () {
                            var msg = {
                                isMine  : false,
                                msg     : data.c,
                                time    : data.time,
                                type    : data.a[0],
                                sender  : sender,
                                fileType: data.t
                            };
                            devlog('recieve msg', msg);
                            allUsers[id].msg.push(msg);
                            loadMsg();
                            popUpUser(id);
                            if (scope.showChatWindow) {
                                scrollChatWindowToBottom();
                            }
                        });
                    });
                });
                websocket.on('error', function () {

                });
                websocket.on('close', function () {

                });
            }
            function getUserOrGroupInfo (uuid) {
                function getInfo () {
                    if (uuid && uuid[0] === 'G') {
                        return chatService.getGroup(uuid);
                    } else {
                        return chatService.getUserInfo(uuid);
                    }
                }
                return getInfo().then(function (data) {
                    var u = {
                        type: uuid && uuid[0] === 'G' ? 'group' : 'user',
                        name: data.data.name,
                        img : data.data.img,
                        id  : data.data.id,
                        uuid: data.data.ugid || data.data.uuid
                    };
                    saveUserInGlobal(u);
                    if (data.data.users && data.data.users.length) {
                        angular.forEach(data.data.users, function (user) {
                            var u = {
                                type: 'user',
                                name: user.name,
                                img : user.img,
                                id  : user.id,
                                uuid: user.uuid
                            };
                            saveUserInGlobal(u);
                        });
                    }
                    return data;
                });
            }
            function getSender (uuid) {
                var defer = $q.defer();
                var id = +uuid.split('-')[1];
                if (allUsers[id]) {
                    devlog('get from cache');
                    defer.resolve(allUsers[id]);
                } else {
                    devlog('get from backend');
                    return getUserOrGroupInfo(uuid).then(function (data) {
                        var u = {
                            type: data.data.ugid ? 'group' : 'user',
                            name: data.data.name,
                            img : data.data.img,
                            id  : data.data.id,
                            uuid: data.data.ugid || data.data.uuid
                        };
                        return u;
                    });
                }
                return defer.promise;
            }
            function loginToWS (token) {
                var defer = $q.defer();
                scope.loginStatus = scope.loginStatus || 'pending';
                if (scope.loginStatus === 'logined') {
                    defer.resolve();
                } else {
                    if (token) {
                        websocket.emit('li', {token: token, ctype: '20'});
                        scope.loginStatus = 'logined';    
                        defer.resolve();
                    } else {
                        chatService.anonymousLogin().then(function (data) {
                            saveToken(data.data.token);
                            scope.loginStatus = 'logined';
                            defer.resolve();
                        }, function (err) {
                            defer.reject({msg: 'websocket 登陆失败', err: err});
                        });
                    }
                }
                return defer.promise;
            }
            function clearFileInput (element) {
                element.wrap('<form>').parent('form').trigger('reset');
                element.unwrap();
            }
            function initUploadPlugin () {
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
                return checkUploadScript().then(function () {
                    var picArr = ['png', 'jpg', 'bmp', 'gif', 'jpeg'];
                    var filter = function(item){
                        var flag = true;
                        if (scope.uploadType === 2) {
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
                    uploader = new C4js.Uer(g_conf.uploadSrv, {m: 'C',token:getToken()}, true);
                    uploader.AddI('chat-upload', {pub: 1, picType: 2}, {
                        OnProcess: function(f, rate, speed){
                            var uploadObj             = scope.uploadFiles[f.name];
                            uploadObj.rate            = rate;
                            uploadObj.speed           = speed;
                            uploadObj.status          = 'uploading';
                            devlog('upload progress', uploadObj);
                            try {
                                scope.$digest();
                            } catch (e) {
                                devlog('scope digest error.');
                            }
                        },
                        OnSuccess: function(f,data){
                            var imgUrl = data.data;
                            var obj = {
                                name: f.name,
                                path: '',
                                Sha : '',
                                type: f.type,
                                url : imgUrl,
                                size: f.size
                            };
                            var uploadObj             = scope.uploadFiles[f.name];
                            uploadObj.status          = 'finish';
                            sendMsg(scope.uploadType, JSON.stringify(obj));
                            devlog('upload success');
                            devlog(scope.uploadFiles);
                            try {
                                scope.$digest();
                            } catch (e) {
                                devlog('scope digest error.');
                            }
                        },
                        OnErr: function (f, data, err){
                            scope.uploadFiles[f.name] = scope.uploadFiles[f.name] || {};
                            var uploadObj             = scope.uploadFiles[f.name];
                            uploadObj.status          = 'error';
                            uploadObj.error           = err;
                            devlog('upload err');
                            try {
                                scope.$digest();
                            } catch (e) {
                                devlog('scope digest error.');
                            }
                        },
                        OnAbort: function (f) {
                            scope.uploadFiles[f.name].status = 'abort';
                            devlog('abort');
                            try {
                                scope.$digest();
                            } catch (er) {
                                devlog('scope digest error.');
                            }
                        },
                        OnStart: function (f) {
                            scope.uploadFiles[f.name] = scope.uploadFiles[f.name] || {};
                            scope.uploadFiles[f.name].status = 'uploading';
                            scope.uploadFiles[f.name].id     = f.fid;
                            try {
                                devlog('start');
                                scope.$digest();
                            } catch (e) {
                                devlog('scope digest error.');
                            }
                        },
                        OnLoad: function () {
                            devlog('load');
                        }
                    });
                    uploader.OnSelect = function (item) {
                        var files                    = filter(item);
                        var file                     = files[0];
                        uploader.Args.token          = token;
                        if (file) {
                            scope.uploadFiles[file.name] = scope.uploadFiles[file.name] || {};
                            var uploadObj                = scope.uploadFiles[file.name];
                            uploadObj.status             = 'add';
                            uploadObj.size               = parseSize(file.size);
                            uploadObj.name               = file.name;
                            allUsers[scope.chatTarget.id].msg.push({
                                time    : parseTime(new Date().getTime()),
                                uploadingMsg: true,
                                file: scope.uploadFiles[file.name],
                                isMine: true,
                                sender: scope.self
                            });
                            scope.$digest();
                        }

                        return files;
                    };
                    scope.$watch('uploadFiles', function (value) {
                        if (!value) {
                            return;
                        }
                        var flag  = false;
                        var count = 0;
                        angular.forEach(value, function (file) {
                            if (file.status === 'uploading') {
                                flag  = true;
                                count += 1;
                            }
                        });
                        scope.uploadCount  = count;
                        scope.uploadStatus = flag ? 'uploading' : 'finish';
                    }, true);
                });
            }
            function saveUserInGlobal (user) {
                if (!allUsers[user.id]) {
                    user.msg = [];
                    allUsers[user.id] = user;
                }
                return user;
            }
            function getMyInfoAndGroup () {
                return getUserOrGroupInfo().then(function (data) {
                    scope.self = {
                        id  : data.data.id,
                        name: data.data.name,
                        img : data.data.img,
                        uuid: data.data.uuid,
                        type: 'user'
                    };
                    angular.forEach(scope.groups, function (group) {
                        if (group.type === 'GROUPS') {
                            angular.forEach(data.data.chatGrp, function (g) {
                                var user = {
                                    type: 'group',
                                    name: g.gname,
                                    id  : g.chatGrp.Id,
                                    img : g.img,
                                    uuid: 'G-' + g.chatGrp.Id
                                };
                                group.users.push(saveUserInGlobal(user));
                            });
                        }
                    });
                });
            }
            function getFriendsGroup () {
                return chatService.getUserGroups().then(function (data) {
                    angular.forEach(data.data, function (group) {
                        angular.forEach(scope.groups, function (g) {
                            if (group.gType === g.type) {
                                angular.forEach(group.users, function (user) {
                                    var u = {
                                        type: 'user',
                                        name: user.name,
                                        id  : user.id,
                                        img : user.img,
                                        uuid: user.uuid
                                    };
                                    g.users.push(saveUserInGlobal(u));
                                });
                            }
                        });
                    });
                });
            }
            function getRecentUser () {
                return chatService.getRecentUser().then(function(data){
                    angular.forEach(data.data, function (user) {
                        var u = {
                            name: user.alias,
                            img : user.img,
                            uuid: user.r,
                            type: user.type === 0 ? 'group' : 'user',
                            id  : +user.r.split('-')[1]
                        };
                        scope.recentUser.push(saveUserInGlobal(u));
                    });
                });
            }
            function getOfflineMsg () {
                websocket.emit('ur', {});
            }
            function sendMsg (type, content) {
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
                    r: [scope.chatTarget.uuid],
                    c: content,
                };
                content = parseMsg(msg);
                websocket.sms2(msg);

                allUsers[scope.chatTarget.id].msg.push({
                    time    : parseTime(new Date().getTime()),
                    isMine  : true,
                    msg     : content,
                    sender  : scope.self,
                    senderId: scope.self.uuid,
                    fileType: type
                });
                popUpUser(scope.chatTarget.id);
                loadMsg();
                scrollChatWindowToBottom();
            }
            function loadMsg (scroll) {
                if (!scope.chatTarget) {
                    devlog('聊天对象为空。');
                    return;
                }
                var chatList = allUsers[scope.chatTarget.id].msg;
                if (chatList.length >= (20 * (scrollCount + 1))) {
                    scope.currentChatMsg = chatList.slice(chatList.length - (20 * (scrollCount + 1)));
                    remainingMsg = true;
                } else {
                    if (scrollCount > 0 && !scroll) {
                        scope.currentChatMsg = chatList.slice(chatList.length - scope.currentChatMsg.length);
                    } else {
                        scope.currentChatMsg = chatList;
                        remainingMsg = false;
                    }
                }
                scope.remainingMsgCount = chatList.length - scope.currentChatMsg.length;
            }
            element.find('.chat-history').on('scroll', function () {
                var top = $(this).scrollTop();
                if (top === 0 && remainingMsg) {
                    loadMoreMsg();
                }
            });
            function loadMoreMsg () {
                var id = 'msg-' + scope.currentChatMsg.length;
                $location.hash(id);
                scrollCount = scrollCount + 1;
                loadMsg(true);
                $timeout(function () {
                    $anchorScroll();
                }, 10);
            }
            function loadFirstChatTarget () {
                var i = 0;
                var j = 0;
                var target;
                for (; i < scope.recentUser.length; i += 1) {
                    target                 = scope.recentUser[i];
                    scope.tabContentToShow = 'msg';
                    break;
                }
                if (!target) {
                    for (i = 0; i < scope.groups.length; i += 1) {
                        if (target) {
                            break;
                        }
                        var users       = scope.groups[i].users;
                        var usersLength = users.length;
                        for (j = 0; j < usersLength; j += 1) {
                            target                 = users[j];
                            scope.tabContentToShow = 'userlist';
                            break;
                        }
                    }
                }
                return target;
            }
            function popUp (arr, index) {
                var targetUser = arr.splice(index, 1)[0];
                arr.unshift(targetUser);
            }
            function popUpUser (id) {
                var i    = 0;
                var j    = 0;
                var flag = false;
                var user;
                for (; i < scope.recentUser.length; i += 1) {
                    user = scope.recentUser[i];
                    if (user.id === id) {
                        flag = true;
                        popUp(scope.recentUser, i);
                        devlog('found popup user');
                        break;
                    }
                }
                if (!flag) {
                    devlog('could not find popup user, will shift the user to the list');
                    scope.recentUser.unshift(allUsers[id]);
                }

                for (i = 0; i < scope.groups.length; i += 1) {
                    var group = scope.groups[i];
                    for (j = 0; j < group.users.length; j += 1) {
                        user = group.users[j];
                        if (user.id === id) {
                            popUp(group.users, j);
                            break;
                        }
                    }
                }

                if (scope.groupInfo) {
                    for (i = 0; i < scope.groupInfo.userList.length; i += 1) {
                        var list = scope.groupInfo.userList[i];
                        for (j = 0; j < list.users.length; j += 1) {
                            user = list.users[j];
                            if (user.id === id) {
                                popUp(list.users, j);
                                break;
                            }
                        }
                    }
                }
            }
            function scrollChatWindowToBottom () {
                var chatBody = $('.chat-history');
                $timeout(function () {
                    chatBody.scrollTop(chatBody.find('ul').height());
                }, 10);
            }
            function bindWindowKeydownEvent (e) {
                if (e.which === 13) {
                    scope.sendScreenshot();
                } else if (e.which === 27) {
                    scope.cancelScreenshot();
                }
            }

            function init () {
                return registerWS().then(function () {
                    token = getToken();
                    return loginToWS(token);
                }).then(function () {
                    return initUploadPlugin();
                });
            }

            if (!scope.custom) {
                init().then(function () {
                    devlog('get info and group');
                    return getMyInfoAndGroup();
                }).then(function () {
                    devlog('get friends');
                    return getFriendsGroup();
                }).then(function () {
                    devlog('get recent user');
                    return getRecentUser();
                }).then(function () {
                    scope.readyToOpenWindow = true;
                    devlog('ready to open');
                    devlog(scope.recentUser);
                    devlog(allUsers);
                    scope.open();
                    return getOfflineMsg();
                }, function (err) {
                    devlog('err', err);
                });
            }
            scope.switchTab = function (type) {
                if (type === 'adduser') {
                    scope.activeTab = type;
                    element.find('input').focus();
                } else {
                    scope.activeTab          = type;
                    scope.expandSearchResult = false;
                    scope.tabContentToShow   = type;
                }
            };
            scope.hideUnrelativeItem = function (name) {
                if (scope.activeTab === 'adduser') {
                    return false;
                } else {
                    var regexp = new RegExp(scope.searchUser);
                    return !regexp.test(name);
                }
            };
            scope.checkUnread = function () {
                var i;
                var hasUnreadMsg = false;
                for (i in scope.unread) {
                    if (!scope.unread.hasOwnProperty(i)) {
                        continue;
                    }
                    if (scope.unread[i] > 0) {
                        hasUnreadMsg = true;
                        break;
                    }
                }
                return hasUnreadMsg;
            };
            scope.deleteRecentChat = function (user, index) {
                scope.recentUser.splice(index, 1);
                if (scope.chatTarget.id === user.id) {
                    if (index > scope.recentUser.length - 1) {
                        index = index - 1;
                    }
                    scope.openChatWindow(scope.recentUser[index]);
                }
            };
            scope.open = function () {
                devlog('open');
                if (scope.showChatWindow) {
                    scope.close();
                    return;
                }
                if (scope.readyToOpenWindow) {
                    scope.showChatWindow = true;
                    scope.openChatWindow(loadFirstChatTarget());
                } else {
                    scope.$watch('readyToOpenWindow', function (value) {
                        if (value) {
                            scope.showChatWindow = true;
                            scope.openChatWindow(loadFirstChatTarget());
                        }
                    });
                }
            };
            scope.close = function () {
                scope.showChatWindow = false;
                scope.chatTarget = undefined;
            };
            scope.openMsgRecord = function () {
                scope.showMsgRecord = !scope.showMsgRecord;
            };
            scope.sendScreenshot = function () {
                angular.element(document).off('keydown', bindWindowKeydownEvent);
                if (!scope.base64) {
                    log('暂无截图。');
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
                            } catch (err) {
                                defer.resolve(xhr.responseText);
                            }
                        }
                    };
                    upload.addEventListener('progress', function (event) {
                        if (event.lengthComputable) {
                            var percent = event.loaded/event.total;
                            file.rate = percent;
                            scope.$digest();
                        }
                    });
                    upload.addEventListener('load', function () {

                    });
                    var obj = {
                        m: 'C',
                        pub: '1',
                        picType: 1,
                        fileName: 'screenshot.png',
                        base64: 1,
                        token: getToken()
                    };
                    var arr = [];
                    angular.forEach(obj, function (value, name) {
                        arr.push(name + '=' + value);
                    });
                    var url = conf.uploadSrv + '?' + arr.join('&');
                    xhr.open('post', url);
                    xhr.send(data);
                    return defer.promise;
                };

                allUsers[scope.chatTarget.id].msg.push({
                    time        : parseTime(new Date().getTime()),
                    uploadingMsg: true,
                    file        : file,
                    isMine      : true,
                    sender      : scope.self
                });
                scope.showScreenshot = false;

                uploadScreenshot(scope.base64.split(',')[1]).then(function (data) {
                    var obj = {
                        name: data.ext.url.split('/').pop(),
                        path: '',
                        Sha : '',
                        type: 'image',
                        url : data.data,
                        size: 1
                    };
                    file.status          = 'finish';
                    sendMsg(2, JSON.stringify(obj));
                });
            };
            scope.cancelScreenshot = function () {
                scope.showScreenshot = false;
                scope.base64 = '';
                angular.element(document).off('keydown', bindWindowKeydownEvent);
            };
            scope.send = function () {
                sendMsg(0, scope.msg);
                scope.msg = '';
            };
            scope.loadMoreMsg = loadMoreMsg;
            window.sendMsg = function (num) {
                for(var i = 0; i < num; i+=1) {
                    sendMsg(0, 'automatically sending message No.' + i);
                }
            };
            scope.typeMsg = function (event) {
                if (event.which === 13) {
                    scope.send();
                    event.preventDefault();
                }
            };
            element.find('#msg-content').on('paste', function (event) {
                angular.forEach(event.originalEvent.clipboardData.items, function (item) {
                    if (item.kind === 'file' && /image\/\w+/.test(item.type)) {
                        var file       = item.getAsFile();
                        var fileReader = new FileReader();
                        fileReader.onloadend = function () {
                            scope.base64         = this.result;
                            scope.showScreenshot = true;
                            angular.element(document).on('keydown', bindWindowKeydownEvent);
                            scope.$digest();
                        };
                        fileReader.readAsDataURL(file);
                    }
                });
            });
            scope.selectUploadFile = function (type) {
                scope.uploadType = type;
                $('#chat-upload').click();
            };
            scope.openChatWindow = function (user) {
                if (!user) {
                    return;
                }
                if (user.id === scope.self.id) {
                    log('不能与自己聊天。');
                    return false;
                }
                function getList () {
                    if (user.type === 'group') {
                        initializeGroupInfo();
                        return getUserOrGroupInfo(user.uuid).then(function (data) {
                            angular.forEach(data.data.users, function (user) {
                                angular.forEach(scope.groupInfo.userList, function (group) {
                                    if (user.role === group.role) {
                                        group.users.push(user);
                                    }
                                });
                            });
                        });
                    } else {
                        var defer = $q.defer();
                        defer.resolve();
                        return defer.promise;
                    }
                }
                scope.chatTarget      = user;
                scope.unread[user.id] = 0;
                scope.chatType        = user.type;
                getList().then(function () {
                    loadMsg();
                    scrollCount = 0;
                    scrollChatWindowToBottom();
                });
            };
            scope.uploadCallback = function ($index) {
                allUsers[scope.chatTarget.id].msg.splice($index, 1);
            };
            scope.cancelUpload = function (msg) {
                uploader.Abort(msg.file.id);
            };
            var doc               = angular.element(document);
            var body              = angular.element('body');
            var move              = {top: 0,left: 0};
            var cursorPos         = {left: 0,top: 0};
            var chatWindow        = element.find('.chat-window');
            var chatList          = element.find('.chat-user-detail .chat-msg-list');
            var chatListSize      = {width: 0, height: 0};
            var groupUserList     = element.find('.chat-group-user');
            var groupUserListSize = {width: 0, height: 0};
            var resizeTarget      = element.find('.chat-history');
            var resizeTargetSize  = {width: 0, height: 0};
            var concact           = element.find('.chat-groups');
            var concactSize       = {width: 0, height: 0};
            var resizeType;
            var chatWindowPos;
            scope.resize = function (type, event) {
                var left, top;
                resizeTargetSize.width   = resizeTarget.width();
                resizeTargetSize.height  = resizeTarget.height();
                chatListSize.width       = chatList.width();
                chatListSize.height      = chatList.height();
                groupUserListSize.width  = groupUserList.width();
                groupUserListSize.height = groupUserList.height();
                concactSize.width        = concact.width();
                concactSize.height       = concact.height();
                
                left                     = event.clientX;
                top                      = event.clientY;
                
                cursorPos.left           = left;
                cursorPos.top            = top;
                
                resizeType               = type.split(' ');
                chatWindowPos            = chatWindow.position();

                doc.on('mousemove', mousemove);
                doc.on('mouseup', mouseup);
                body.addClass('no-select');
            };

            function mousemove (event) {
                var left, top, width, height;
                left      = event.clientX;
                top       = event.clientY;
                move.top  = top - cursorPos.top;
                move.left = left - cursorPos.left;

                angular.forEach(resizeType, function (t) {
                    switch (t) {
                        case 'bottom': {
                            height = resizeTargetSize.height + move.top;
                            if (height < 150) {
                                return;
                            }
                            resizeTarget.height(height);
                            chatList.height(chatListSize.height + move.top);
                            groupUserList.height(groupUserListSize.height + move.top);
                            concact.height(concactSize.height + move.top);
                            break;
                        }
                        case 'right': {
                            width = resizeTargetSize.width + move.left;
                            if (width < 350) {
                                return;
                            }
                            resizeTarget.width(width);
                            break;
                        }
                        case 'left': {
                            width = resizeTargetSize.width - move.left;
                            if (width < 350) {
                                return;
                            }
                            resizeTarget.width(width);
                            chatWindow.css({
                                left: chatWindowPos.left + move.left
                            });
                            break;
                        }
                        case 'top': {
                            height = resizeTargetSize.height - move.top;
                            if (height < 150) {
                                return;
                            }
                            resizeTarget.height(height);
                            chatList.height(chatListSize.height - move.top);
                            groupUserList.height(groupUserListSize.height - move.top);
                            concact.height(concactSize.height - move.top);
                            chatWindow.css({
                                top: chatWindowPos.top + move.top
                            });
                            break;
                        }
                    }
                });

            }

            function mouseup () {
                doc.off('mousemove', mousemove);
                doc.off('mouseup', mouseup);
                body.removeClass('no-select');
            }


            service.progress.filter(conf.friendsAddr);

            chatApi.set('init', init);
            chatApi.set('getOfflineMsg', getOfflineMsg);
            chatApi.apply();
        };
        return obj;
    }]);
    module.directive('chatMsg', ['$compile', function ($compile) {
        var obj = {
            template:'<li class="chat-item" ng-class="{\'chat-mine\': msg.isMine, \'chat-others\': !msg.isMine}" ng-if="msg.fileType!==-1"><p class="chat-time"><span ng-show="showDate">{{msg.day}}</span> <span ng-show="showTime">{{msg.time}}</span></p><img class="chat-avatar" ng-src="{{msg.sender.img}}" alt=""> <span ng-show="chatType==\'group\' && !msg.isMine" class="chat-msg-sender">{{msg.sender.name}}</span><div class="chat-msg" ng-bind-html="msg.msg|html" ng-hide="msg.uploadingMsg || msg.fileType===2"></div><div class="chat-msg chat-upload-status" ng-show="msg.uploadingMsg"></div><div class="chat-msg" ng-if="msg.fileType===2" msg-img="msg"></div></li><li ng-if="msg.fileType===-1" class="chat-msg-history-tips"><span>以上是历史消息</span></li>',
            restrict: 'E',
            scope: {
                msg           : '=',
                uploadCallback: '&',
                cancelUpload  : '&',
                reUpload      : '&'
            }
        };
        var tmpl = ['<div class="chat-msg-upload"><p ng-show="msg.file.status==\'uploading\'">正在上传文件...</p>',
        '<p ng-show="msg.file.status==\'abort\'">文件上传已取消</p>',
        '<p><span class="chat-msg-upload-name">{{msg.file.name}}</span><span class="chat-msg-upload-size">({{msg.file.size}})</span></p>',
        '<p ng-show="msg.file.status==\'uploading\'"><span class="chat-msg-progress-outter">',
        '<span class="chat-msg-progress-inner" style="width: {{msg.file.percent}}"></span></span></p>',
        '<p style="text-align:right;"><a ng-show="msg.file.status==\'uploading\'" class="chat-msg-link" ng-click="cancelUpload()">取消上传</a>',
        '</p></div>'].join('');
        var imgTmpl = '<a ng-click="showPic()"><img ng-src="{{imgUrl}}" /></a>';

        obj.link = function (scope, element) {
            var e;
            var cursorPos = {
                top : 0,
                left: 0
            };
            var currentPos = {
                left:  0,
                top :  0
            };
            var img = element.find('.chat-big-img img');
            var doc = angular.element(document);
            var originalSize = {
                width : 0,
                height: 0
            };
            var windowWidth   = $(window).width();
            var windowHeight  = $(window).height();
            var largeView     = false;
            
            scope.imgStyle    = {};
            scope.parentStyle = {};
            scope.largeImg    = false;
            if (scope.msg.uploadingMsg) {
                e             = $compile(tmpl)(scope);
                scope.msg.msg = '<div></div>';
                element.find('.chat-upload-status').html(e);
                scope.$watch('msg.file', function (value) {
                    if (value && value.status === 'finish') {
                        scope.uploadCallback();
                    }
                    scope.msg.file.percent = scope.msg.file.rate * 100 + '%';
                }, true);
            }

            if (scope.msg.fileType === 2) {
                scope.imgUrl = angular.element(scope.msg.msg).find('img').attr('src');
                e            = $compile(imgTmpl)(scope);
                element.find('.chat-msg-img').html(e);
            }
            scope.showPic = function () {
                scope.showBigImg = true;
                scope.bigImgUrl  = scope.imgUrl.split('?s=1')[0];
                img.on('load', function () {
                    var width           = this.width;
                    var height          = this.height;
                    originalSize.width  = width;
                    originalSize.height = height;
                    if (width > windowWidth*0.8) {
                        scope.largeImg              = true;
                        scope.imgStyle['max-width'] = windowWidth * 0.8;
                    }
                    if (height > windowHeight*0.8) {
                        scope.largeImg               = true;
                        scope.imgStyle['max-height'] = windowHeight * 0.8;
                    }
                    scope.imgLoaded = true;
                    scope.$digest();
                });
            };
            scope.closePic = function () {
                scope.showBigImg  = false;
                scope.imgStyle    = {};
                scope.parentStyle = {};
                scope.largeImg    = false;
                scope.dragMode    = false;
                largeView         = false;
                scope.bigImgUrl   = undefined;
                scope.imgLoaded   = false;
                img.off('load');
            };
            scope.zoomPic = function () {
                if (scope.largeImg && !largeView) {
                    scope.parentStyle.width  = windowWidth * 0.8;
                    scope.parentStyle.height = windowHeight * 0.8;
                    scope.imgStyle.width     = originalSize.width;
                    scope.imgStyle.height    = originalSize.height;
                    scope.dragMode           = true;
                    largeView                = true;
                    delete scope.imgStyle['max-height'];
                    delete scope.imgStyle['max-width'];

                }
            };
            scope.mousedown = function (e) {
                cursorPos.left  = e.clientX;
                cursorPos.top   = e.clientY;
                currentPos.left = img.parent().parent().scrollLeft();
                currentPos.top  = img.parent().parent().scrollTop();
                doc.on('mousemove', mousemove);
                doc.on('mouseup', mouseup);
                e.preventDefault();
            };
            function mousemove (e) {
                var move = {
                    left: e.clientX - cursorPos.left,
                    top : e.clientY - cursorPos.top
                };
                img.parent().parent().scrollTop(currentPos.top - move.top).scrollLeft(currentPos.left - move.left);
            }
            function mouseup () {
                doc.off('mousemove', mousemove);
                doc.off('mouseup', mouseup);
            }
        };


        return obj;
    }]);
    module.factory('chatApi', function () {
        var cbList = [];
        var factory = {
            set: function (name, fn) {
                if (this[name]) {   
                    return;
                }
                this[name] = fn;
            },
            ready: function (cb, context) {
                var args = slice.call(arguments, 2);
                cbList.push({cb: cb, context: context || this, args: args});
            },
            apply: function () {
                angular.forEach(cbList, function (cbObj) {
                    if (typeof cbObj.cb === 'function') {
                        cbObj.cb.apply(cbObj.context, cbObj.args);
                    }
                });
            }
        };
        return factory;
    });
})();