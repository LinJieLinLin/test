(function () {
    angular.module('chat_directive').controller('addFriend', ['$scope', 'chatService', function ($scope, chatService) {
        var searchObj = {
            name: $scope.searchName,
            ps: 9,
            pn: 1
        };
        
        function searchUser () {
            $scope.loading = true;
            return chatService.http.searchUser(searchObj).then(function (data) {
                $scope.searchList = data.data.list;
                $scope.totalPage = Math.ceil(data.data.pa.total/searchObj.ps);
                $scope.currentPageNo = searchObj.pn;
                chatService.trigger('loadSearchResult', data);
                $scope.loading = false;
            });
        }
        function generatePa (num, len) {
            var i = num;
            var arr = [];
            for (; i < num + len; i += 1) {
                arr.push(i);
            }
            return arr;
        }
        function renderPa (value) {
            if (value <= 3) {
                $scope.pa = generatePa(1, $scope.totalPage >= 5 ? 5 : $scope.totalPage);
            } else if (value >= $scope.totalPage - 3) {
                $scope.pa = generatePa($scope.totalPage >= 5 ?$scope.totalPage - 4 : 1, 5);
            } else {
                $scope.pa = generatePa(value - 2, 5);
            }
        }
        chatService
        .on('openFriendNotify', function (open) {
            $scope.showFriendNofity = open;
        });

        $scope.search = function () {
            if ($scope.searchLoading || $scope.loading) {
                return;
            }
            $scope.searched = true;
            $scope.searchLoading = true;
            searchObj.pn = 1;
            searchObj.name = $scope.searchName;
            $scope.currentPageNo = searchObj.pn;
            searchUser().then(function () {
                renderPa($scope.currentPageNo);
                $scope.searchLoading = false;
            }, function (e) {
                $scope.searchLoading = false;
                $scope.loading = false;
                chatService.util.log(e.data.data.msg);
            });
        };

        $scope.keydown = function (event) {
            if (event.which === 13) {
                $scope.search();
            }
        };

        $scope.addFriend = function (user) {
            chatService.trigger('openAddFriendDialog', user);
        };
        $scope.close = function () {
            $scope.$parent.show = 'main';
        };
        $scope.goToSearchPage = function (num) {
            searchObj.pn = num;
            searchUser();
        };
        $scope.$watch('currentPageNo', function (value) {
            if (value) {
                renderPa(value);
            }
        });
    }]);
})();