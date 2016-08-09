/**
 * Created by LouGaZen on 2016-05-20.
 * 模块说明：我要吐槽→大家都在说
 */

module.controller('allDiscussCtrl', ['$scope', 'dialog', 'discussMethod', function ($scope, dialog, discussMethod) {

    //截取所需数据
    function convertData(arg_data) {
        var _arr = [];
        if (arg_data) {
            for (var i = 0, il = arg_data.length; i < il; i++) {
                var _check = arg_data[i].hasOwnProperty('root');
                var _checkCount = _check && arg_data[i].root.hasOwnProperty('count');
                _arr.push({
                    id: _check && arg_data[i].root.hasOwnProperty('_id') ? arg_data[i].root._id : '',
                    content: _check && arg_data[i].root.hasOwnProperty('content') ? arg_data[i].root.content : '',
                    imgList: _check && arg_data[i].root.hasOwnProperty('files') && arg_data[i].root.files.hasOwnProperty('IMG') ? [].concat(arg_data[i].root.files.IMG) : '',
                    usrId: _check && arg_data[i].root.hasOwnProperty('ownerId') ? arg_data[i].root.ownerId : '',
                    subTime: _check && arg_data[i].root.hasOwnProperty('createTime') ? arg_data[i].root.createTime : 0,
                    readNum: _checkCount && arg_data[i].root.count.hasOwnProperty('readCount') ? arg_data[i].root.count.readCount : 0,
                    likeNum: _checkCount && arg_data[i].root.count.hasOwnProperty('likeCount') ? arg_data[i].root.count.likeCount : 0,
                    replyNum: _checkCount && arg_data[i].root.count.hasOwnProperty('replyCount') ? arg_data[i].root.count.replyCount : 0
                });
            }
        }
        return _arr;
    }

    $scope.discussList = [];
    $scope.userDataList = {};

    $scope.showLoading = true;

    var back2Initial = function () {
        $scope.searchKw = '';
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };

    //获取所有吐槽帖子
    $scope.loadDiscussList = function (arg_kw, arg_callback) {
        $scope.showLoading = true;
        discussMethod.SearchDiscuss({
            k: arg_kw || '.',
            page: $scope.pageargs.pn,
            pageCount: $scope.pageargs.ps,
            owners: [{
                ownerId: 'KUXIAO_SUGGEST',
                ownerType: '60'
            }],
            reviewReplyCount: 10
        }).then(function (data) {
            // console.log(data);
            $scope.discussList = convertData(data.data.discuss || []);
            $scope.userDataList = data.data.usr || {};

            if (angular.isFunction(arg_callback)) {
                arg_callback({
                    pa: {
                        total: data.data.allCount,
                        ps: $scope.pageargs.ps,
                        pn: $scope.pageargs.pn
                    }
                });
            }

            $scope.showLoading = false;
        }, function (err) {
            // dialog.alert('获取列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽',
                funcName: 'loadDiscussList',
                text: '获取列表失败'
            });
            $scope.showLoading = false;
        });
    };

    $scope.getUserData = function (arg_uid) {
        return $scope.userDataList.hasOwnProperty(arg_uid + '') ? $scope.userDataList[arg_uid + ''] : arg_uid;
    };

    $scope.getDiscussUrl = function (arg_id) {
        return rcpAid.getUrl('吐槽帖子详情', {
            did: arg_id
        });
    };

    $scope.searchDiscuss = function () {
        $scope.pageargs = {
            ps: 10,
            pn: 1
        }
    };

    $scope.onKeyDown = function (event) {
        if (event.keyCode === 13) {
            $scope.searchDiscuss();
        }
    };

    $scope.pagefn = function (args, success) {
        $scope.loadDiscussList($scope.searchKw || '', success)
    };

    back2Initial();
}]);