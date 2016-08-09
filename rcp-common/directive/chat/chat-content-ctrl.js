(function () {
    angular.module('chat_directive').controller('chatContent', ['$scope', '$q', '$timeout', '$anchorScroll', '$location', 'chatService', 'service', function ($scope, $q, $timeout, $anchorScroll, $location, chatService, service) {
        var devlog = chatService.util.devlog;
        var allUsers = chatService.data.allUsers;
        var sendMsg = chatService.api.sendMsg;
        var chatWindow = angular.element('.chat-window');
        var scrollCount         = 0;
        var remainingMsg        = false;
        var chatBody = $('.chat-history');
        $scope.friendRequests = chatService.data.friendRequests;
        chatService
        .on('wsSendMsg', function (user, msg) {
            $scope.$emit('scrollToBottom', true);
            devlog('sending msg to user ' + user.uuid, msg);
        })
        .on('uploadSelect', function () {
            $scope.$emit('loadMsg');    
            try {$scope.$digest();} catch (e) {}
        })
        .on('uploadStart', function () {
            $scope.$emit('loadMsg');    
            try {$scope.$digest();} catch (e) {}
        })
        .on('uploadProgress', function () {
            $scope.$emit('loadMsg');
            try {$scope.$digest();} catch (e) {}
        })
        .on('uploadSuccess', function () {
            devlog('upload success');
            try {$scope.$digest();} catch (e) {}
        })
        .on('uploadAbort', function () {
            $scope.$emit('loadMsg');
            devlog('upload abort');
            try {$scope.$digest();} catch (e) {}

        })
        .on('uploadError', function () {
            $scope.$emit('loadMsg');
            devlog('upload err');
            try {$scope.$digest();} catch (e) {}
        })
        .on('uploadLoad', function () {
            try {$scope.$digest();} catch (e) {}
        })
        .on('openChatWindow', function (user, where, group) {
            if (!user) {
                handleView('showNoTarget');
                return;
            }
            if (user.uuid === 'U-0') {
                handleView('showFriendRequest');
            } else {
                var i;
                handleView('showMain');
                $scope.currentChatMsg = [];
                scrollCount = 0;
                $scope.noMoreMsg = false;            
                $scope.loadMoreMsg(true);
                $scope.unreadMsg = 0;
                var flag = true;
                if (user.type !== 'group') {
                    for (i = 0; i < chatService.data.groups['DEFAULT'].users.length; i += 1) {
                        var u = chatService.data.groups['DEFAULT'].users[i];
                        if (u.id === user.id) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        $scope.showAddFriendBtn = true;
                        $scope.fromGroup = group;
                    } else {
                        $scope.showAddFriendBtn = false;
                    }
                } else {
                    $scope.showAddFriendBtn = false;
                }
            }
        })
        .on('openSearchResult', function (open) {
            $scope.expandSearchResult = open;
        })
        .on('showScreenshot', function (base64) {
            $scope.base64         = base64;
            $scope.showScreenshot = true;
            try {$scope.$digest();} catch (e) {}
        })
        .on('sendScreenshot', function () {
            $scope.showScreenshot = false;
            try {$scope.$digest();} catch (e) {}
        })
        .on('sendScreenshotMsg', function () {
            $scope.$emit('loadMsg');
        })
        .on('cancelScreenshot', function () {
            $scope.showScreenshot = false;
            $scope.base64 = '';
            try {$scope.$digest();} catch (e) {}
        })
        .on('imgUploadFinish', function () {
            $scope.$emit('loadMsg');
        })
        .on('showUserDetail', function (user) {
            handleView('showDetail');
            if (user.type === 'group') {
                $scope.loading = true;
                chatService.api.getGroupDetail(user.uuid).then(function () {
                    $scope.loading = false;
                    $scope.detailUser = chatService.data.groupInfo;
                    $scope.detailUser.origin = user;
                }, function (err) {
                    $scope.loading = false;
                    handleView('showNoTarget');
                    if (err.type === 1) {
                        chatService.util.log(err.data.data.msg);
                    } else {
                        chatService.util.log('请求群组信息失败！');
                    }
                });
            } else {
                $scope.detailUser = user;
                $scope.detailUser.origin = user;
            }
        })
        .on('switchTab', function (tab) {
            handleView('showNoTarget');
        })
        .on('openFriendNotify', function (show) {
            if (show) {
                handleView('showFriendRequest');
            } else {
                handleView('showMain');
            }
        });

        function handleView (type) {
            var arr = ['showMain', 'showNoTarget', 'showDetail', 'showFriendRequest'];
            angular.forEach(arr, function (item) {
                $scope[item] = false;
            });
            $scope[type] = true;
            if (!$scope.showMain) {
                $scope.$parent.chatTarget = null;
            }
        }

        $scope.groupInfo = chatService.data.groupInfo;
        $scope.showMsgRecord = false;
        $scope.showScreenshot = false;
        $scope.uploadFiles = {};
        $scope.uploadType = 2;
        $scope.screenshotImgStyle = {
            'max-width': angular.element(window).width() * 0.8,
            'max-height': angular.element(window).height() * 0.8
        };
        $scope.openMsgRecord = function () {
            $scope.showMsgRecord = !$scope.showMsgRecord;
        };

        $scope.send = function () {
            sendMsg($scope.chatTarget, 0, angular.element('#msg-content').val());
            $scope.$emit('loadMsg');
            $scope.$emit('scrollToBottom', true);
            $scope.msg = '';
        };

        $scope.handleRequest = function (request, action) {
            chatService.http.handleFriendRequest({
                action: action,
                oid: request.oid
            }).then(function () {
                request.status = action;
                if (action === 4) {
                    var flag = false;
                    angular.forEach(chatService.data.groups['DEFAULT'].users, function (u) {
                        if (u === request.l) {
                            flag = true;
                        }
                    });
                    if (!flag) {
                        chatService.data.groups['DEFAULT'].users.push({
                            id: +request.l.split('-')[1],
                            img: request.lImg,
                            msg: [],
                            name: request.lName,
                            type: 'user',
                            uuid: request.l
                        });
                    }
                }
            }, function (err) {
                if (err.type === 1) {
                    chatService.util.log(err.data.data.msg);
                } else {
                    chatService.util.log('处理好友请求失败！');
                    chatService.util.devlog(err);
                }
            });
        };

        $scope.showGroupDetail = function (user) {
            chatService.trigger('showUserDetail', user, 'showMain');
            handleView('showDetail');
        };

        $scope.sendScreenshot = function () {
            chatService.api.sendScreenshot($scope.base64);
        };

        $scope.cancelScreenshot = function () {
            chatService.api.cancelScreenshot();
        };

        $scope.autoSendMsg = function (num) {
            for(var i = 0; i < num; i+=1) {
                sendMsg($scope.chatTarget, 0, 'automatically sending message No.' + i);
                $scope.$emit('loadMsg');
                $scope.$emit('scrollToBottom');
            }
        };

        $scope.typeMsg = function (event) {
            if (event.which === 13) {
                $scope.send();
                event.preventDefault();
            }
        };

        $scope.enterChat = function (user) {
            if (user.uuid === $scope.self.uuid) {
                chatService.util.log('不能与自己聊天。');
                return;
            }
            chatService.trigger('openChatWindow', user);
        };

        $scope.sendMsg = function (req) {
            chatService.api.getSender(req.r === $scope.self.uuid ? req.l : req.r).then(function (user) {
                $scope.enterChat(user);
            });
        };

        $scope.selectUploadFile = function (type) {
            $scope.uploadType = type;
            chatService.api.selectUploadFile(type);
        };

        $scope.cancelUpload = function (msg) {
            chatService.api.cancelUpload(msg.file.id);
            devlog('cancel upload');
        };
        
        $scope.loadMoreMsg = function (auto) {
            $scope.loadingMsg = true;
            var msg = chatService.data.allUsers[$scope.chatTarget.uuid].msg;
            function getRecentMsg() {
                if ((auto && !msg.loaded) || (!auto && !$scope.noMoreMsg && ($scope.currentChatMsg.length === msg.length))) {
                    var id;
                    if (auto && !msg.loaded && msg.length > 1) {
                        id = msg[1].msgId;
                    } else if (!auto) {
                        id = msg[0].msgId;
                    }
                    return chatService.api.getRecordList({
                        sender: $scope.chatTarget.uuid,
                        reciever: $scope.self.uuid,
                        order: '-time',
                        pageNo: 1,
                        pageSize: auto ? 19 : 20,
                        id: id
                    }).then(function (data) {
                        $scope.noMoreMsg = (auto && data.total < 19) || (!auto && data.total <= 20);
                        msg.loaded = true;
                        angular.forEach(data.msg, function (msg) {
                            var m = chatService.data.allUsers[$scope.chatTarget.uuid].msg;
                            var flag = false;
                            if (!id) {
                                for (var i = 0; i < m.length; i += 1) {
                                    if (m[i].msgId === msg.msgId) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            if (!flag) {
                                chatService.data.allUsers[$scope.chatTarget.uuid].msg.unshift(msg);
                            }
                        });
                    });
                } else {
                    var defer = $q.defer();
                    $scope.noMoreMsg = $scope.currentChatMsg.length > (msg.length - 20);
                    defer.resolve();
                    return defer.promise;
                }
            }
            return getRecentMsg().then(function () {
                var id = 'msg-' + ($scope.currentChatMsg.length || 1);
                if (!auto) {
                    scrollCount = scrollCount + 1;
                }
                $scope.$emit('loadMsg');
                $timeout(function () {
                    if (auto) {
                        $scope.$emit('scrollToBottom', true);
                    } else {
                        var element = angular.element('#' + id).get(0);
                        if (!element) {
                            return;
                        }
                        var top = element.offsetTop;
                        chatBody.scrollTop(top);
                    }
                }, 10);
            }, function (err) {
                chatService.util.devlog(err);
                $scope.loadingMsg = false;
                if (err.type === 1) {
                    chatService.util.log(err.data.data.msg);
                } else  {
                    var c, loginModal;
                    if (typeof service.loginModal !== 'undefined') {
                        c = service.dialog;
                        loginModal = service.loginModal;
                    } else {
                        c = jf;
                        loginModal = loginWinService;
                    }
                    c.confirm('用户已掉线，请重新登陆。', undefined, function () {
                        loginModal.show();
                    }, function () {
                        window.location.reload();
                    });
                }
            });
        };

        $scope.$parent.$on('loadMsg', function () {
            if (!$scope.chatTarget) {
                devlog('聊天对象为空。');
                return;
            }
            if (!allUsers[$scope.chatTarget.uuid]) {
                devlog('找不到该用户');
                return;
            }
            $scope.loadingMsg = false;
            var chatList = allUsers[$scope.chatTarget.uuid].msg;
            if (chatList.length > (scrollCount + 1) * 20) {
                $scope.currentChatMsg = chatList.slice(chatList.length - (scrollCount + 1) * 20);
            } else {
                $scope.currentChatMsg = chatList.slice();
            }
            $scope.remainingMsgCount = chatList.length - $scope.currentChatMsg.length;
        });

        $scope.unreadMsg = 0;
        $scope.$parent.$on('scrollToBottom', function (event, force) {
            if (chatBody.find('ul').height() - (chatBody.scrollTop() + chatBody.height()) < 70 || force) {
                setTimeout(function () {
                    chatBody.scrollTop(chatBody.find('ul').height());
                }, 10);
            } else {
                $scope.unreadMsg += 1;
            }
        });

        chatBody.on('scroll', function () {
            if (chatBody.find('ul').height() - (chatBody.scrollTop() + chatBody.height()) < 70) {
                $scope.unreadMsg = 0;
                $scope.$digest();
            }
            if (chatBody.scrollTop() === 0 && !$scope.noMoreMsg) {
                $scope.loadMoreMsg();
            }
        });

        $scope.showNewMsg = function () {
            $scope.unreadMsg = 0;
            chatBody.scrollTop(chatBody.find('ul').height());
        };

        $scope.openMsgRecord = function () {
            $scope.showMsgRecord = !$scope.showMsgRecord;
            chatService.trigger('openRecord');
            chatWindow.width(chatWindow.width() + (335 * ($scope.showMsgRecord ? 1 : -1)));

        };
        $scope.endChat = function () {
            $scope.$parent.open();
        };

        $scope.addFriend = function (user) {
            chatService.trigger('openAddFriendDialog', user);
        };
    }]);
})();