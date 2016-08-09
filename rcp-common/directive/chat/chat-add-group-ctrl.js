(function() {
    angular.module('chat_directive').controller('addGroup', ['$scope', 'chatService', function ($scope, chatService) {
        var tmp = [];
        $scope.groups = chatService.data.groups;
        $scope.selected = [];
        chatService
        .on('switchTab', function () {
            if ($scope.$parent.showAddGroup) {
                chatService.trigger('resetAddGroup');
            }
        })
        .on('resetAddGroup', function () {
            $scope.selected = [];
            tmp = [];
            angular.forEach($scope.groups, function (g) {
                angular.forEach(g.users, function (user) {
                    user.hide = false;
                    user.selected = false;
                    user.showDelete = false;
                });
            });
        });

        $scope.showUnselected = function (user) {
            var flag = true;
            for (var i = 0; i < tmp.length; i += 1) {
                if (tmp[i].uuid === user.uuid) {
                    flag = false;
                    break;
                }
            }
            return flag;
        };

        $scope.selectUser = function (user) {
            var index = tmp.indexOf(user);    
            if (index === -1) {
                tmp.push(user);
            } else {
                tmp.splice(index, 1);
            }
            $scope.confirmSelect();
        };
        $scope.confirmSelect = function () {
            $scope.selected = tmp.slice();
        };
        $scope.removeSelected = function (user) {
            var index = $scope.selected.indexOf(user);
            user.showDelete = false;
            $scope.selected.splice(index, 1);
            angular.forEach(tmp, function (u, index) {
                if (user.id === u.id) {
                    tmp.splice(index, 1);
                }
            });
        };
        $scope.addGroup = function () {
            var uids = [];
            angular.forEach($scope.selected, function (u) {
                uids.push(u.id);
            });
            if (!uids.length) {
                chatService.util.log('请选择讨论组成员。');
                return;
            }
            chatService.http.createGroup(uids.join(',')).then(function (data) {
                chatService.util.log('创建讨论组成功！');
                var user = {
                    id: data.data.id,
                    name: data.data.name,
                    img: data.data.img,
                    gType: data.data.gType,
                    cid: data.data.cid,
                    oid: data.data.oid,
                    uuid: data.data.ugid,
                    type: 'group',
                    online: true
                };
                chatService.data.groups['My-GRP'].users.push(user);
                chatService.trigger('openChatWindow', user);
                chatService.trigger('resetAddGroup');
            }, function (err) {
                if (err.type === 1) {
                    chatService.util.log('创建讨论组失败！' + err.data.data.msg);
                } else {
                    chatService.util.log('创建讨论组失败！网络错误！');
                }
            });
        };
        $scope.hideUnrelativeItem = function (name) {
            var regexp = new RegExp($scope.searchUser);
            return !regexp.test(name);
        };
        $scope.close = function () {
            $scope.$parent.show = 'main';
        };
    }]);
})();