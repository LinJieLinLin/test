/**
 * Created by LouGaZen on 2016-05-23.
 * 模块说明：我要吐槽帖子详情
 */

var module = angular.module('RCP', [
    'ngCookies'
])

    .filter("sanitize", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
    }])

    .directive('slideShow', ['$animate', function ($animate) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.slideShow, function (value) {
                    if (value) {
                        $(element).slideDown();

                        $('html,body').stop().animate({scrollTop: $(element).offset().top}, 'normal');
                    } else {
                        $(element).slideUp();
                    }
                });
            }
        }
    }])

    .controller('discussDetailCtrl', ['$scope', 'dialog', 'discussMethod', '$rootScope', '$timeout', 'service', '$filter', function ($scope, dialog, discussMethod, $rootScope, $timeout, service, $filter) {
        var discussId = rcpAid.queryString('did') || '';

        if (discussId == '') {
            dialog.alert('无效的帖子ID');
            setTimeout("location.href = '/discuss-page.html#all-discuss'", 2000);
            return;
        }

        $scope.hasLogin = $rootScope.currentUser.hasOwnProperty('uid');

        //截取所需帖子数据
        function convertData(arg_data) {
            var flag = arg_data.hasOwnProperty('replys') && arg_data.hasOwnProperty('root'),
                _obj = {};


            if (flag) {
                var _replies = [];
                if (arg_data.replys) {
                    arg_data.replys.forEach(function (element) {
                        var _comments = [];
                        if (element.hasOwnProperty('comments') && element.comments) {
                            element.comments.forEach(function (e) {
                                _comments.push({
                                    //帖子回复中的回复内容
                                    id: e.hasOwnProperty('_id') ? e._id : '',
                                    usrId: e.hasOwnProperty('ownerId') ? e.ownerId : '',
                                    contentTxt: e.hasOwnProperty('content') ? e.content : '',
                                    contentImg: e.hasOwnProperty('files') && e.files.hasOwnProperty('IMG') ? [].concat(e.files.IMG) : [],
                                    subTime: e.hasOwnProperty('createTime') ? e.createTime : '',
                                    pid: e.hasOwnProperty('pOwnerId') ? e.pOwnerId : ''
                                });
                            });
                        }

                        var _rCountCheck = element.hasOwnProperty('count');
                        _replies.push({
                            //帖子回复内容
                            id: element.hasOwnProperty('_id') ? element._id : '',
                            usrId: element.hasOwnProperty('ownerId') ? element.ownerId : '',
                            contentTxt: element.hasOwnProperty('content') ? element.content : '',
                            contentImg: element.hasOwnProperty('files') && element.files.hasOwnProperty('IMG') ? [].concat(element.files.IMG) : [],
                            isLiked: element.hasOwnProperty('isLiked') ? element.isLiked : false,
                            subTime: element.hasOwnProperty('createTime') ? element.createTime : '',
                            likeNum: _rCountCheck && element.count.hasOwnProperty('likeCount') ? element.count.likeCount : 0,
                            replyNum: _rCountCheck && element.count.hasOwnProperty('replyCount') ? element.count.replyCount : 0,
                            replyComment: {                                
                                content: '',
                                uploadData: {
                                    max: 9,
                                    img: []
                                }
                            },
                            showReplyEditor: false,
                            exceed: '',
                            replyTarget: {},
                            comments: _comments
                        });
                    });
                }

                var _check = arg_data.hasOwnProperty('root'),
                    _checkCount = _check && arg_data.root.hasOwnProperty('count');

                if (_check) {
                    //帖子主体内容
                    _obj.id = discussId;
                    _obj.usrId = arg_data.root.hasOwnProperty('ownerId') ? arg_data.root.ownerId : '';
                    _obj.contentTxt = arg_data.root.hasOwnProperty('content') ? arg_data.root.content : '';
                    _obj.contentImg = arg_data.root.hasOwnProperty('files') && arg_data.root.files.hasOwnProperty('IMG') ? [].concat(arg_data.root.files.IMG) : [];
                    _obj.isLiked = arg_data.root.hasOwnProperty('isLiked') ? arg_data.root.isLiked : false;
                    _obj.likeNum = _checkCount && arg_data.root.count.hasOwnProperty('likeCount') ? arg_data.root.count.likeCount : 0;
                    _obj.readNum = _checkCount && arg_data.root.count.hasOwnProperty('readCount') ? arg_data.root.count.readCount : 0;
                    _obj.replyNum = _checkCount && arg_data.root.count.hasOwnProperty('replyCount') ? arg_data.root.count.replyCount : 0;
                    _obj.subTime = arg_data.root.hasOwnProperty('createTime') ? arg_data.root.createTime : '';
                    _obj.replies = _replies;
                }
            }

            return _obj;
        }

        //截取所需常见问题数据
        function convertProblemData(arg_data) {
            var _arr = [];
            if (arg_data) {
                arg_data.forEach(function (element) {
                    _arr.push({
                        id: element._id || '',
                        title: element.root.content || ''
                    })
                });
            }
            return _arr;
        }

        $scope.discussDetail = {};
        $scope.userList = {};
        $scope.problemList = [];
        $scope.replyDiscuss = {            
            content: '',
            uploadData: {
                max: 9,
                img: []
            },
            emojiPickerShowed: false
        };
        $scope.exceed = '';
        $scope.isSending = false;

        $scope.showLoading = true;

        var back2Initial = function (reset) {
            $scope.replyDiscuss = {                
                content: '',
                uploadData: {
                    max: 9,
                    img: []
                },
                emojiPickerShowed: false
            };
            // $scope.discussDetail.replies.forEach(function (element) {
            //     element.showComment = false;
            //     //replyComment = '';
            // });
            if (angular.isUndefined(reset)) {
                $scope.pageargs = {
                    ps: 10,
                    pn: 1
                };
            } else {
                $scope.pageargs = angular.copy($scope.pageargs);
            }
        };

        $scope.sendReply = function (arg_obj, arg_type, arg_content, arg_uploadImg) {
            if (!$scope.hasLogin) {
                dialog.alert('请先登录');
                service.common.toLogin();
                return;
            }

            $scope.isSending = true;

            if (arg_type === 30 && arg_obj.isLiked) {
                //已点赞情况下取消点赞
                discussMethod.RemoveDiscuss({
                    ownerType: '10',
                    parentId: arg_obj.id,
                    type: '30'
                }).then(function (data) {
                    console.log('[dislike success]', data);
                    $scope.isSending = false;
                    dialog.alert('取消点赞成功');
                    back2Initial(true);
                }, function (err) {
                    console.log('[dislike error]', err);
                    $scope.isSending = false;
                    // dialog.alert('取消点赞失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                    dialog.showErrorTip(err, {
                        moduleName: '我要吐槽帖子详情',
                        funcName: 'RemoveDiscuss',
                        text: '取消点赞失败'
                    });
                });
                return;
            }

            arg_uploadImg = arg_uploadImg || [];

            //回复（arg_type === 20）或点赞（arg_type === 30）
            discussMethod.CreateDiscuss({
                category: '10',
                content: arg_type === 30 ? '' : $filter('emojiColonToUnified')(arg_content),
                files: {
                    IMG: arg_uploadImg
                },
                ownerType: '10',
                pid: arg_obj.id,
                pOwnerId: arg_obj.usrId,
                pOwnerType: '10',
                scopes: [{
                    ownerId: 'KUXIAO_SUGGEST',
                    ownerType: '60'
                }],
                type: arg_type + ''
            }).then(function (data) {
                if (data.code === 0) {
                    dialog.alert((arg_type === 30 ? '点赞' : '回复') + '成功');
                    $scope.isSending = false;
                    back2Initial(true);
                }
            }, function (err) {
                $scope.isSending = false;
                if (err.data.data.code === 1003) {
                    dialog.alert('您已点过赞');
                    back2Initial(true);
                } else {
                    // dialog.alert('操作失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                    dialog.showErrorTip(err, {
                        moduleName: '我要吐槽帖子详情',
                        funcName: 'CreateDiscuss',
                        text: '操作失败'
                    });
                }
            });
        };

        $scope.getUserData = function (arg_uid) {
            var _check = $scope.userList.hasOwnProperty(arg_uid)
                && $scope.userList[arg_uid].hasOwnProperty('attrs')
                && $scope.userList[arg_uid].attrs.hasOwnProperty('basic');

            return {
                nickname: _check && $scope.userList[arg_uid].attrs.basic.hasOwnProperty('nickName') ? $scope.userList[arg_uid].attrs.basic.nickName : '',
                avatar: _check && $scope.userList[arg_uid].attrs.basic.hasOwnProperty('avatar') ? $scope.userList[arg_uid].attrs.basic.avatar : ''
            }
        };

        discussMethod.AddDiscussReadCount({
            id: discussId
        }).then(function (data) {
            console.log('[AddDiscussReadCount success]', data);
        }, function (err) {
            console.log('[AddDiscussReadCount error]', err);
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽帖子详情',
                funcName: 'AddDiscussReadCount',
                text: '增加帖子阅读数失败'
            });
        });

        discussMethod.SuggestPage({
            key: 'common'
        }).then(function (data) {
            $scope.problemList = convertProblemData(data.data.common.discuss || []);
            console.log($scope.problemList);
        }, function (err) {
            console.log(err);
            // dialog.alert('获取常见问题失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip('', '', '', err);
            dialog.showErrorTip(err, {
                moduleName: '我要吐槽帖子详情',
                funcName: 'SuggestPage',
                text: '获取常见问题失败'
            });
        });

        $scope.getDiscussUrl = function (arg_id) {
            return rcpAid.getUrl('吐槽帖子详情', {
                did: arg_id
            });
        };

        $scope.pagefn = function (args, success) {
            $scope.showLoading = true;
            discussMethod.GetDiscussCDetail({
                commentCount: 10,
                discussId: discussId,
                sort: 1,
                page: args.pn,
                pageCount: args.ps
            }).then(function (data) {
                $scope.discussDetail = convertData(data.data.discuss);
                $scope.userList = data.data.usr || {};
                // console.log($scope.discussDetail);
                $scope.showLoading = false;
                // console.log($scope.discussDetail.replyNum);
                success({
                    pa: {
                        total: $scope.discussDetail.replyNum,
                        pn: args.pn,
                        ps: args.ps
                    }
                });
            }, function (err) {
                // dialog.alert('获取信息错误，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '我要吐槽帖子详情',
                    funcName: 'pagefn',
                    text: '获取帖子信息错误'
                });
                $scope.showLoading = false;
            });
        };

        $scope.toLogin = function () {
            service.common.toLogin();
        };

        //设置回复中的回复对象
        $scope.setReplyTarget = function (arg_itself, arg_target) {
            arg_itself.showReplyEditor = true;
            arg_itself.replyTarget = arg_target;
            angular.element('#' + arg_itself.id).val('');
            arg_itself.replyComment = {
                content: '',
                uploadData: {
                    max: 9,
                    img: []
                }
            };
            $scope.scoreTo(arg_itself.id, arg_itself.id);
        };

        //图片上传
        $scope.uploader = function (arg_target, callback) {
            arg_target = arg_target || {};
            var len = arg_target.max || 6;
            if (arg_target.img.length >= len) {
                dialog.alert('最多只能添加' + len + '张图片！');
                return false;
            }
            // $scope.uploadImgSelect();
            if (angular.isFunction(callback)) {
                callback();
            }
        };
        $scope.delImg = function (arg_target, arg_index) {
            arg_target = arg_target || {};
            if (arg_index < arg_target.img.length) {
                arg_target.img.splice(arg_index, 1);
            }
        };

        // scoreTo animate effect
        $scope.scoreTo = function (arg_outsideId, arg_insideId) {
            $('html,body').stop().animate({scrollTop: $('#' + arg_outsideId).offset().top}, 'normal');
            $timeout(function () {
                $('#' + arg_insideId).focus()
            }, 0, false);
        };


        back2Initial();
    }]);