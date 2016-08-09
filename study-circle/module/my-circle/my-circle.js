module.controller('myCircleCtr', ['$scope', '$rootScope', '$timeout', 'service', 'studyCircle', function ($scope, $rootScope, $timeout, service, studyCircle) {
    //========================== var ==============================
    //获取我的圈子请求参数
    var circleRequest = {
        likeCount: 1,   //1 获取点赞用户个数，0 不获取
        reviewReplyCount: 1,    //是否预览回复数
        myOwnerType: 10,
        ownerId: '',    //被查看对象的id
        ownerType: 10,
        page: 1,
        pageCount: 6
    };
    
    //获取我的回复请求参数
    var replyRequest = {
        myOwnerType: '10',
        ownerId: '',
        ownerType: '10',
        page: 1,
        pageCount: 1,
        type: '20'
    };
    
    //当前登录用户信息
    $scope.user = {
        avatar: $rootScope.currentUser.avatar || '../rcp-common/imgs/face/d-face-2.png',   //用户头像
        uid: $rootScope.currentUser.uid, //用户id
        nickName: $rootScope.currentUser.nickName
    };

    $scope.num = {
        circle: 0,  //我的圈子数量
        reply: 0    //我的回复数
    };

    $scope.loading = {
        circle: true,
        reply: true
    };

    $scope.curTab = 0;  //当前选择的tab。 0 我的圈子，1 我的回复
    
    $scope.circleList = []; //我的圈子列表
    $scope.circlePaginationArgs = getPaginationArgs('circle');

    $scope.replyList = [];  //我的回复列表

    //=========================== function ========================================
    function getScopeDetailUrl(id) {
        return rcpAid.getUrl('圈子详情', {
            id: id
        });
    }

    /**
     * 处理后台返回的圈子数据
     * @param data  后台的data
     */
    function handleCircleData(data) {
        console.log('handleCircleData', data);
        $scope.circleList.length = 0;
        if (!data.discuss) {
            console.error('圈子数据为空', data.discuss);
            return;
        }
        var getLastReply = function (i) {
            var replys = data.discuss[i].replys;
            replys || console.error('帖子回复数据为空', i, replys);
            if (!replys.length) {
                return;
            }
            replys = replys[replys.length - 1];
            replys || console.error('帖子回复为空', i, replys);
            var uid = replys.ownerId;
            data.usr[uid] || console.error('帖子回复者ownerId为空', uid, data.usr);
            return {
                user: data.usr[uid].attrs.basic.nickName,
                time: replys.lastModifyTime
            };
        };
        var getScope = function (i) {
            var scopes = data.discuss[i].scopes;
            scopes || console.error('圈子数据为空', i, scopes);
            if (!scopes.length) {
                return {
                    title: '',
                    ownerId: -1,
                    ownerType: -1
                };
            }
            scopes.length > 1 && console.log('圈子数据大于1', scopes.length);
            scopes = data.scope[scopes[0]];
            scopes || console.error('圈子为空', i, scopes);
            return {
                title: scopes && scopes.title || '',
                ownerId: scopes && scopes.ownerId || -1,
                ownerType: scopes && scopes.ownerType || -1
            };
        };
        var scope, circle, c;
        for (var i = 0, len = data.discuss.length; i < len; i++) {
            scope = data.discuss[i] && data.discuss[i].root || {};
            circle = {};
            c = getScope(i);

            // scope.ownerId != $scope.user.uid && console.error(scope.ownerId, $scope.user.uid, '圈子uid不一致');

            circle.avatar = $scope.user.avatar;
            circle.nickName = $scope.user.nickName;
            circle.detailUrl = getScopeDetailUrl(scope._id);
            circle.content = scope.content;
            circle.createTime = scope.createTime;
            circle.images = scope.files && scope.files.IMG || [];
            circle.lastReply = getLastReply(i);
            circle.course = c.title;
            circle.allScopeUrl = rcpAid.getUrl('全部圈子', {
                cid: c.ownerId,
                type: c.ownerType
            });
            circle.isLiked = scope.isLiked;
            circle.likeCount = scope.count && scope.count.likeCount || 0;
            circle.replyCount = scope.count && scope.count.replyCount || 0;
            circle.id = scope._id;

            // console.log('circle', circle);
            $scope.circleList.push(circle);
        }
    }

    /**
     * 处理后台返回的回复数据
     * @param data  后台的data
     */
    function handleReplyData(data) {
        console.log('handleReplyData', data);
        $scope.replyList.length = 0;
        if (!data.discuss) {
            console.error('回复数据为空');
            return;
        }
        var getScope = function (i) {
            var root = data.discuss[i].rootId;
            root || console.error('获取圈子 rootId数据为空', i, root);
            var scope = data.parent[root];
            scope || console.error('获取圈子 parent.' + root + '为空', i, scope);
            var c = scope.scopes;
            c && c.length == 1 || console.log('圈子为空或过多', i, c);
            c = data.scope[c];
            return {
                id: scope._id,
                title: c && c.title || '',
                content: scope.content,
                type: scope.ownerType
            }
        };
        var tmp, reply, scope;
        for (var i = 0, len = data.discuss.length; i < len; i++) {
            tmp = data.discuss[i].details;
            tmp || console.error('回复详细数据为空', tmp);
            scope = getScope(i);
            reply = {};

            // tmp.ownerId != $scope.user.uid && console.error(tmp.ownerId, $scope.user.uid, '回复uid不一致');

            reply.course = scope.title;
            reply.reply = tmp.content;
            reply.circle = scope.content;
            reply.time = tmp.createTime;
            reply.images = [];  //scope.type == '60' && tmp.files && tmp.files.IMG || [];
            reply.detailUrl = getScopeDetailUrl(scope.id);
            reply.circleId = scope.id;

            // console.log('reply', reply);
            $scope.replyList.push(reply);
        }
    }

    /**
     * 获取分页参数
     * @param tag   circle 对应我的圈子，reply 对应我的回复
     * @returns {{pn: number, ps: number, pl: number}}
     */
    function getPaginationArgs(tag) {
        var arg = {
            pn: 1,  //当前第几页
            ps: 10,  //每页显示的数量
            pl: 5
        };

        if (tag == 'circle') {
            arg.ps = 6;
        }
        return arg;
    }

    //========================== scope function =====================================
    /**
     * 跳转到圈子详情，阅读数加一
     * @param id    圈子id
     */
    $scope.readAdd = function (id) {
        studyCircle.setReadCount({
            id: id
        }).then(function (data) {

        }, function (err) {
            console.log('[error]', '圈子阅读数增加失败', err);
        });
    };

    /**
     * 分页回调，请求我的圈子列表
     * @param args  分页参数
     * @param cb    总数回调
     */
    $scope.circlePaginationCb = function (args, cb) {
        $scope.loading.circle = true;
        circleRequest.ownerId = $scope.user.uid;
        circleRequest.page = args.pn;
        circleRequest.pageCount = args.ps;
        studyCircle.getPersonDiscuss(circleRequest).then(function (data) {
            $scope.loading.circle = false;
            if (!data || !data.data) {
                console.error('我的圈子获取圈子数据为空', err);
                service.dialog.alert('圈子数据获取失败');
                return;
            }
            handleCircleData(data.data);
            $scope.num.circle = data.data.allCount;
            data.pa = {total: data.data.allCount};
            cb(data);
        }, function (err) {
            $scope.loading.circle = false;
            $scope.circleList.length = 0;

            service.dialog.showErrorTip(err, {
                moduleName: '我的圈子',
                funcName: '$scope.circlePaginationCb',
                text: '获取圈子数据失败'
            });
        });
    };

    /**
     * 点赞或取消点赞
     * @param scope 对应的圈子，$scope.circleList 中的对象
     */
    $scope.sendLike = function (scope) {
        if ($scope._sendLiking) {
            //正在处理点赞或取消点赞请求，防止用户连续点击
            console.log('[warn][my-circle => $scope.sendLike]if repeat click');
            return;
        }
        var success = function (data) {
            $scope._sendLiking = false;
            if (!data) {
                console.error((!scope.isLiked ? '点赞' : '取消点赞' ) + '返回数据为空', data);
                service.dialog.alert((!scope.isLiked ? '点赞' : '取消点赞' ) + '失败');
                return;
            }
            scope.isLiked = !scope.isLiked;
            scope.likeCount += (scope.isLiked ? 1 : -1);
        };
        var error = function (err) {
            $scope._sendLiking = false;
            console.error((!scope.isLiked ? '点赞' : '取消点赞' ) + '失败', err);
            if (err.data && err.data.data && err.data.data.code == 1003 && !scope.isLiked) {
                scope.isLiked = !scope.isLiked;
                scope.likeCount += 1;
                service.dialog.alert('您已点过赞!');
                return;
            }
            service.dialog.showErrorTip(err, {
                moduleName: '我的圈子',
                funcName: '$scope.sendLike',
                text: '获取圈子数据失败'
            });
        };
        $scope._sendLiking = true;
        if (!scope.isLiked) {
            //点赞
            studyCircle.sendCircle({}, {
                data: {
                    pOwnerId: $scope.user.uid,
                    pOwnerType: '10',
                    pid: scope.id,
                    ownerType: '10',
                    type: '30'
                }
            }).then(success, error);
        } else {
            //取消点赞
            studyCircle.removeDiscuss({
                parentId: scope.id,
                ownerType: '10',
                type: '30'
            }).then(success, error);
        }
    };

    /**
     * 分页回调，请求我的回复列表
     * @param args  分页参数
     * @param cb    总数回调
     */
    $scope.replyPaginationCb = function (args, cb) {
        $scope.loading.reply = true;
        replyRequest.ownerId = $scope.user.uid;
        replyRequest.page = args.pn;
        replyRequest.pageCount = args.ps;
        studyCircle.getPersonReply(replyRequest).then(function (data) {
            $scope.loading.reply = false;
            if (!data || !data.data) {
                console.error('我的回复 获取回复数据为空', err);
                service.dialog.alert('回复数据获取失败');
                return;
            }
            handleReplyData(data.data);
            $scope.num.reply = data.data.allCount;
            data.pa = {total: data.data.allCount};
            cb(data);
        }, function (err) {
            $scope.loading.reply = false;
            $scope.replyList.length = 0;

            service.dialog.showErrorTip(err, {
                moduleName: '我的圈子',
                funcName: '$scope.replyPaginationCb',
                text: '获取我的回复'
            });
        });
    };

    //=============================== init ======================
    //左侧菜单重复点击时刷新
    $scope.$on('bar-repeat-click', function (ev, tag) {
        if (tag == 's3') {
            $scope.circlePaginationArgs = getPaginationArgs('circle');
            $scope.replyPaginationArgs = getPaginationArgs('reply');
        }
    });

    $timeout(function () {
        $scope.replyPaginationArgs = getPaginationArgs('reply');
    });
}]);