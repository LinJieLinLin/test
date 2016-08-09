/**
 * Created by LouGaZen on 2016-05-20.
 * 模块说明：我要吐槽→我来说一下
 */

module.controller('myDiscussCtrl', ['$scope', '$rootScope', 'dialog', 'discussMethod', 'service', '$filter', function ($scope, $rootScope, dialog, discussMethod, service, $filter) {

    $scope.toLogin = function () {
        service.common.toLogin();
    };


    if (!$rootScope.currentUser.hasOwnProperty('uid')) {
        dialog.alert('请先登录');
        $scope.toLogin();
        $scope.hasLogin = false;
        return;
    }

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

    $scope.hasLogin = true;

    //当前用户信息
    $scope.userInfo = {
        id: $rootScope.currentUser.uid,
        avatar: $rootScope.currentUser.avatar
    };

    $scope.mDiscussList = [];
    $scope.myDiscuss = {
        content: '',
        uploadData: {
            max: 9,
            img: []
        }
    };
    $scope.exceed = '';
    $scope.isUploading = false;
    $scope.isSending = false;

    $scope.showLoading = true;
    // 表情选择框是否显示
    $scope.showEmojiPicker = false;

    var back2Initial = function () {
        $scope.searchKw = '';
        $scope.myDiscuss = {
            content: '',
            uploadData: {
                max: 9,
                img: []
            }
        };
        $scope.pageargs = {
            ps: 10,
            pn: 1
        };
    };

    //获取我的吐槽帖子
    $scope.loadMyDiscussList = function (arg_kw, arg_callback) {
        $scope.showLoading = true;

        discussMethod.GetPersonDiscuss({
            myOwnerType: 10,
            owner: '[{"ownerId": "KUXIAO_SUGGEST", "ownerType": "60"}]',
            ownerId: $scope.userInfo.id,
            ownerType: 10,
            page: $scope.pageargs.pn,
            pageCount: $scope.pageargs.ps
        }).then(function (data) {
            $scope.mDiscussList = convertData(data.data.discuss || []);
            // console.log($scope.mDiscussList);
            $scope.showLoading = false;

            if (angular.isFunction(arg_callback)) {
                arg_callback({
                    pa: {
                        total: data.data.allCount,
                        ps: $scope.pageargs.ps,
                        pn: $scope.pageargs.pn
                    }
                })
            }
        }, function (err) {
            // dialog.alert('获取列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽',
                funcName: 'loadMyDiscussList',
                text: '获取列表失败'
            });
            $scope.showLoading = false;
        });
    };

    $scope.sendDiscuss = function () {
        $scope.isSending = true;

        discussMethod.CreateDiscuss({
            category: '10',
            // content: emotionService.parseEmotion($scope.myDiscuss.content).replace(/(\n)+/g, '<br />'),//将内容中的[**]表情转换成<img />并将'\n'转换成<br />
            content: $filter('emojiColonToUnified')($scope.myDiscuss.content),
            files: {
                IMG: $scope.myDiscuss.uploadData.img
            },
            ownerType: '10',
            scopes: [{
                ownerId: 'KUXIAO_SUGGEST',
                ownerType: '60'
            }],
            type: '10'
        }).then(function (data) {
            if (data.code === 0) {
                dialog.alert('发布成功');
                $scope.isSending = false;
                back2Initial();
            }
        }, function (err) {
            console.log(err, 'fail');
            // dialog.alert('发送吐槽失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽',
                funcName: 'sendDiscuss',
                text: '发送吐槽失败'
            });
            $scope.isSending = false;
        });
    };

    // $scope.searchMyDiscuss = function () {
    //todo api无法进行搜索
    // };

    $scope.getDiscussUrl = function (arg_id) {
        return rcpAid.getUrl('吐槽帖子详情', {
            did: arg_id
        });
    };

    $scope.pagefn = function (args, success) {
        $scope.loadMyDiscussList($scope.searchKw || '', success);
    };


    //图片上传
    $scope.uploader = function (callback) {
        var len = $scope.myDiscuss.uploadData.max || 6;
        if ($scope.myDiscuss.uploadData.img.length >= len) {
            dialog.alert('最多只能添加' + len + '张图片！');
            return false;
        }
        // $scope.uploadImgSelect();
        if (angular.isFunction(callback)) {
            callback();
        }
    };
    $scope.delImg = function (argIndex) {
        if (argIndex < $scope.myDiscuss.uploadData.img.length) {
            $scope.myDiscuss.uploadData.img.splice(argIndex, 1);
        }
    };

    back2Initial();
}]);