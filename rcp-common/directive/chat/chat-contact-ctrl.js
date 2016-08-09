(function () {
    angular.module('chat_directive').controller('chatContact', ['$scope', 'chatService', function ($scope, chatService) {
        $scope.activeTab         = 'msg';
        $scope.recentUser = chatService.data.recentUser;
        $scope.groups = chatService.data.groups;
        $scope.openSearchResult = 'false';
        $scope.friendGroupList = ['T-GRP', 'S-GRP', 'DEFAULT'];
        $scope.groupGroupList = ['C-GRP', 'My-GRP'];

        chatService.on('switchTab', function (tab) {
            $scope.activeTab = tab;
        }).on('openChatWindow', function (user) {
            if (!user) {
                return;
            }
            if (user.uuid === 'U-1') {
                $scope.showFriendRequest = true;
            } else {
                $scope.showFriendRequest = false;
            }
            $scope.activeTab = 'msg';
        });

        $scope.deleteRecentChat = function (user, index) {
            $scope.recentUser.splice(index, 1);
            if ($scope.chatTarget && $scope.chatTarget.uuid === user.uuid) {
                if (index > $scope.recentUser.length - 1) {
                    index = index - 1;
                }
                $scope.openChatWindow($scope.recentUser[index]);
            }
        };
        $scope.hideUnrelativeItem = function (name) {
            var regexp = new RegExp($scope.searchUser);
            return !regexp.test(name);
        };
        $scope.showUserDetail = function (user) {
            chatService.trigger('showUserDetail', user, 'showNoTarget');
        };
        $scope.openChatWindow = function (user) {
            chatService.trigger('openChatWindow', user, 'showNoTarget');
        };

        $scope.onlineCount = function (arr) {
            var num = 0;
            angular.forEach(arr, function (user) {
                if (user.online) {
                    num += 1;
                }
            });
            return num;
        };
    }]);
})();