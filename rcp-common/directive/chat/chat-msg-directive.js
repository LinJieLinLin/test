(function () {
    angular.module('chat_directive').directive('chatMsg', ['$compile', 'chatService', function ($compile, chatService) {
        var obj = {
            template:'<li class="chat-item" ng-class="{\'chat-mine\': msg.isMine, \'chat-others\': !msg.isMine}" ng-if="msg.fileType!==-1"><p class="chat-time"><span ng-show="showDate">{{msg.day}}</span> <span ng-show="showTime">{{msg.time}}</span></p><img class="chat-avatar" ng-src="{{msg.sender.img}}" alt=""> <span ng-show="chatType==\'group\' && !msg.isMine" class="chat-msg-sender">{{msg.sender.name}}</span><div class="chat-msg" ng-bind-html="msg.msg|html" ng-hide="msg.uploadingMsg || msg.fileType===2"></div><div class="chat-msg chat-upload-status" ng-show="msg.uploadingMsg"></div><div class="chat-msg" ng-if="msg.fileType===2" msg-img="msg"></div></li><li ng-if="msg.fileType===-1" class="chat-msg-history-tips"><span>以上是历史消息</span></li>',
            restrict: 'E',
            scope: {
                msg           : '=',
                index         : '@',
                chatType      : '='
            }
        };
        var devlog = chatService.util.devlog;
        var tmpl = ['<div class="chat-msg-upload"><p ng-show="msg.file.status==\'uploading\'">正在上传文件...</p>',
        '<p ng-show="msg.file.status==\'abort\'">文件上传已取消</p>',
        '<p ng-show="msg.file.status==\'error\'">文件上传失败！</p>',
        '<p><span class="chat-msg-upload-name">{{msg.file.name}}</span><span class="chat-msg-upload-size">({{msg.file.size}})</span></p>',
        '<p ng-show="msg.file.status==\'uploading\'"><span class="chat-msg-progress-outter">',
        '<span class="chat-msg-progress-inner" style="width: {{msg.file.percent}}"></span></span></p>',
        '<p style="text-align:right;"><a ng-show="msg.file.status==\'uploading\'" class="chat-msg-link" ng-click="cancelUpload()">取消上传</a>',
        '</p></div>'].join('');

        obj.link = function (scope, element) {
            var e;
            if (scope.msg.uploadingMsg) {
                e             = $compile(tmpl)(scope);
                scope.msg.msg = '<div></div>';
                setTimeout(function () {
                    element.find('.chat-upload-status').html(e);
                }, 10);
                scope.$watch('msg.file', function (value) {
                    if (value && value.status === 'finish') {
                        scope.uploadCallback();
                    }
                    scope.msg.file.percent = scope.msg.file.rate * 100 + '%';
                }, true);
            }

            var nextScope = element.prev().scope();
            scope.showTime = (function () {
                if (+scope.index === 0) {
                    return true;
                } else {
                    return scope.msg.time !== nextScope.msg.time;
                }
            })();

            scope.showDate = (function () {
                if (+scope.index === 0) {
                    return true;
                } else {
                    return scope.msg.day !== nextScope.msg.day;
                }
            })();

            scope.uploadCallback = function () {
                var index = chatService.data.allUsers[scope.msg.uuid].msg.indexOf(scope.msg);
                chatService.data.allUsers[scope.msg.uuid].msg.splice(index, 1);
                chatService.trigger('imgUploadFinish');
            };

            scope.cancelUpload = function () {
                chatService.api.cancelUpload(scope.msg.file.id);
                devlog('cancel upload');
            };
        };
        return obj;
    }]);
})();