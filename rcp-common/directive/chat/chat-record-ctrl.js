(function () {
    angular.module('chat_directive').controller('record', ['$scope', 'chatService', 'datetimeService', function ($scope, chatService, datetimeService) {
        var now = new Date();
        var today = (function () {
            var d = chatService.util.parseTime(now.getTime()).split(' ')[0].replace(/-/g, '/');
            return new Date(d).getTime();
        })();
        var recordObj = {
            sender: undefined,
            reciever: undefined,
            pageNo: 1,
            pageSize: 20,
            filter: undefined,
            beginTime: today,
            endTime: today + 86400000
        };
        function getRecord () {
            if (!$scope.chatTarget) {
                return;
            }
            recordObj.sender = $scope.chatTarget.uuid;
            recordObj.reciever = $scope.self.uuid;
            $scope.loading = true;
            return chatService.api.getRecordList(recordObj).then(function (data) {
                $scope.record = data.msg;
                $scope.currentPageNo = recordObj.pageNo;
                $scope.total = Math.ceil(data.total/recordObj.pageSize);
                $scope.loading = false;
                if (!$scope.record.length) {
                    $scope.currentPageNo = 0;
                }
                angular.element('.chat-record-list').scrollTop(0);
            }, function (err) {
                $scope.loading = false;
                if (err.type === 1) {
                    chatService.util.log(err.data.data.msg);
                } else {
                    chatService.util.log('请求消息记录失败！');
                }
            });
        }
        $scope.recordTab = 'all';
        $scope.record = [];
        $scope.currentPageNo = recordObj.pageNo;
        $scope.total = 0;
        $scope.showSearch = false;
        $scope.date = chatService.util.parseTime(today).split(' ')[0];
        $scope.today = $scope.date;
        $scope.$watch('date', function (value) {
            var t = value.replace(/-/g, '/');
            var d = new Date(t);
            if (!isNaN(d.getTime())) {
                $scope.recordDate = (d.getMonth() + 1) + '月' + (d.getDate()) + '日';
            } else {
                $scope.recordDate = null;
            }
        });
        $scope.dateConfig = {

            style:'expired',
            placeholder:'只可选择过去日期',
            noInput: true,
            targetElement: angular.element('.chat-record-date .chat-btn'),
            position: 'top'
        };
        $scope.showSelectDate = function (event) {
            datetimeService.toggle(event);
            console.log('showshowhso');
        };
        $scope.$watch('selectedDate', function (value) {
            if (value) {
                var v = value.replace(/-/g, '/');
                var d = new Date(v).getTime();
                if (!d) {
                    return;
                }
                recordObj.beginTime = d;
                recordObj.endTime = d + 86400000;
                getRecord();
                $scope.date = value;
            }
        });
        datetimeService.onClear = function () {
            recordObj.beginTime = undefined;
            recordObj.endTime = undefined;
            getRecord();
            $scope.date = '所有记录';
        };
        $scope.showDay = function (index) {
            if (index === 0) {
                return true;
            } else if ($scope.record[index - 1]) {
                return $scope.record[index].day !== $scope.record[index - 1].day;
            } else {
                return true;
            }
        };
        $scope.jumpToPage = function (page) {
            if (page <= 0 || page > $scope.total) {
                return ;
            }
            recordObj.pageNo = page;
            getRecord();
        };
        $scope.openSearch = function () {
            $scope.showSearch = !$scope.showSearch;
        };
        $scope.searchRecord = function () {
            recordObj.pageNo = 1;
            recordObj.filter = $scope.searchName;
            getRecord();
        };
        $scope.enterPageNo = function (event) {
            if (event.which === 13) {
                $scope.blurEdit();
                $scope.editPageNo = false;
            }
        };
        $scope.showEditPa = function () {
            $scope.editPageNo = true;
        };
        $scope.blurEdit = function () {
            $scope.currentPageNo = +$scope.currentPageNo;
            if ($scope.currentPageNo.toString() === 'NaN') {
                chatService.util.log('请输入正确的数值。');
                $scope.currentPageNo = 1;
                return;
            }
            if ($scope.currentPageNo < 1 || $scope.currentPageNo > $scope.total) {
                chatService.util.log('输入的页数应该在 1 到 ' + $scope.total + '之间。');
                $scope.currentPageNo = 1;
                return;
            }
            $scope.jumpToPage($scope.currentPageNo);
            $scope.editPageNo = false;
        };
        $scope.enterSearchName = function (event) {
            if (event.which === 13) {
                $scope.searchRecord();
            }
        };
        chatService.on('openRecord', function () {
            if ($scope.$parent.showMsgRecord) {
                recordObj.pageNo = 1;
                $scope.showSearch = false;
                $scope.searchName = undefined;
                recordObj.filter = undefined;
                getRecord();
            }
        });
    }]);
})();