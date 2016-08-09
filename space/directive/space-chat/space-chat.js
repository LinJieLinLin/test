module.directive("spaceChat", function () {
    return {
        template:'<div class="chat-main"><div class="section-header"><div class="target"><i class="fa fa-chevron-left" aria-hidden="true"></i> <img ng-src="{{chatUser.avatar}}" alt=""> <span title="{{chatUser.nickName}}" ng-bind="chatUser.nickName"></span></div><span class="address" ng-show="chatUser.address">{{\'来自\' + chatUser.address}}</span></div><div class="chat-body" ng-hide="showMsgRecord"><div class="chat-body-left chat-center"><div class="chat-history"><ul><div data="{{loadingMsg}}" data-a="{{noMoreMsg}}" ng-hide="loadingMsg || noMoreMsg" class="chat-show-more"><a href="" ng-click="loadMoreMsg()"><span class="fa fa-clock-o"></span>查看更多消息</a></div><div ng-show="loadingMsg" class="chat-show-more"><span class="fa fa-spinner fa-spin"></span>正在载入</div><chat-msg chat-type="chatType" index="{{$index}}" ng-repeat="msg in currentChatMsg" msg="msg" id="msg-{{currentChatMsg.length - $index}}"></chat-msg></ul></div><a ng-show="unreadMsg>0" class="chat-unread-msg" ng-click="showNewMsg()">您有 <span ng-bind="unreadMsg"></span> 条新消息</a><div class="chat-editor"><div class="chat-editor-helper chat-rel"><i class="image-chat-upload-image"></i> <i class="image-chat-upload-file"></i><div class="chat-open-record"><i class="fa fa-clock-o"></i> <a href="" ng-class="{\'chat-btn-opened\': showMsgRecord}" ng-click="openMsgRecord()">消息记录</a></div><input type="file" id="chat-img-upload" accept="image/*"> <input type="file" id="chat-file-upload" accept="*"></div><div class="chat-editor-input"><textarea name="" id="msg-content" cols="30" rows="10" ng-model="msg" ng-keydown="typeMsg($event)"></textarea></div><div class="chat-send"><button class="chat-btn chat-btn-active" ng-click="send()">发送</button></div></div></div></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            chatUser: '='
        },
        controller: ['$scope', function ($scope) {
            
        }]
    }
});