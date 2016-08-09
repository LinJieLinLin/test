if (!module) {
    var module = angular.module('RCP', []);
}
module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);
module.directive('studyCircle', function() {
    return {
        template:'<div class="study-circle"><div class=""><h3 class="content-section-head">圈子</h3><div class="content-section-body"><div class="no-data" ng-hide="hasData">暂无圈子</div><div ng-show="hasData"><ul class="circle-detail"><li class="inline" ng-repeat="c in circleList track by $index"><div class="user-info"><img ng-src="{{ usrList[c.root.ownerId].attrs.basic.avatar || \'../study-circle/imgs/d-face-1.png\'}}" alt=""><p class="text-hide" ng-bind="usrList[c.root.ownerId].attrs.basic.nickName"></p></div><div class="detail"><a ng-href="{{toDetailCircle}}" ng-click="toDetail(c)" target="_blank" style="color:#a6a6a6"><div ng-bind-html="c.root.content | encodeHtml | emojiUnifiedToCss | html"></div></a><div ng-bind="c.root.createTime| date:\'MM-dd HH:mm\'">00-00 00:00</div><image-slider images="c.root.files.IMG" class="self-image-slider"></image-slider><p class="desc"><span class="last-comment text-hide" ng-show="c.replys.length" ng-bind="usrList[c.replys[0].ownerId].usr[0]+\' 最后回复于 \'+(c.replys[0].createTime| date:\'MM-dd HH:mm\')">最后回复于 00-00 00:00</span> <span class="vote"><button ng-click="sendLike(c.root,$event,$index)"><i class="fa fa-thumbs-o-up" ng-show="c.root.isLiked" style="color:#fe8811"></i> <i class="fa fa-thumbs-o-up" ng-hide="c.root.isLiked"></i> <span ng-bind="c.root.count.likeCount">0</span></button> <a ng-href="{{toDetailCircle}}" ng-click="toDetail(c)" target="_blank"><i class="fa fa-commenting-o"></i> <span ng-bind="c.root.count.replyCount">0</span></a></span></p></div></li></ul><div class="more-comment" ng-hide="c.showTotal"><a ng-href="{{toTotalCircle}}" target="_blank">查看全部圈子 &gt;</a></div><div ng-show="c.showTotal"><pagination class="study-circle-pagination" list="circleList" pageargs="pageargs" pagefn="pagefn"></pagination></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '=',
            circlenum:'='
        },
        controller: ['$scope', '$timeout', '$http', 'service', '$location', function($scope, $timeout, $http, service,$location) {
            try {
                $scope.hasData = false;

                $scope.curToken = rcpAid.getToken();
                
                $scope.init = function() {

                    $scope.pageargs = {
                        pn: 1,  //当前第几页
                        ps: 8,  //每页显示的课程数
                        pl: 5  //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
                    };

                    //圈子的分页回调函数，在初始化时会触发一次
                    $scope.pagefn = function (args,callback) {
                        $scope.getCircleList(callback);
                    };

                    $scope.circle = {
                        content: '',
                        exceed: '',
                        isSecret: 1,
                        nowSection: ''
                    };
                    $scope.circleList = [];
                    $scope.usrList = {};
                    if ($scope.c && $scope.c.rUrl) {
                        if ($scope.c.rUrl[$scope.c.rUrl.length - 1] !== '/') {
                            $scope.c.rUrl += '/';
                        }
                    } else {
                        console.log('无配置文件！');
                    }
                   
                    // $scope.getCircleList();

                    $scope.toTotalCircle = rcpAid.getUrl('全部圈子',{cid:$scope.c.cid,type:$scope.c.type,token:$scope.curToken});

                };
                //获取圈子列表
                $scope.getCircleList = function(callback) {
                    var data = {
                        k: '.',
                        mode: 1,
                        page: $scope.pageargs.pn,
                        pageCount: $scope.pageargs.ps,
                        reviewReplyCount: 1,
                        reviewSort: -1,
                        owners: [{
                            OwnerId: $scope.c.cid,
                            OwnerType: $scope.c.type
                        }],
                        sort: -1
                    };
                    
                    service.studyCircle.getCircleList({}, { data: angular.toJson(data) }).then(function(rs) {
                        $scope.circleList = rs.data.discuss;
                        $scope.usrList = rs.data.usr;
                        if ($scope.circleList && $scope.circleList.length && !$scope.usrList) {
                            alert('返回数据有误');
                        }

                        if(rs.data.allCount){
                            $scope.hasData = true;
                            if($scope.circlenum){
                                $scope.circlenum.num = rs.data.allCount;
                            }
                        }else{
                            $scope.hasData = false;
                        }

                        if (typeof(callback) == 'function') {
                            data.pa = {
                                total: rs.data.allCount,
                                pn: $scope.pageargs.pn,
                                ps: $scope.pageargs.ps
                            };
                            callback(data);
                        }
                    }, function(e) {
                        console.log(e);
                    });
                };
                // func
                $scope.send = function(argType, argData,sindex) {
                    var data = {
                        acl: {
                            ALL: +$scope.circle.isSecret
                        },
                        atUsers: [],
                        category: $scope.c.category || '10',
                        coin: 0,
                        content: $scope.circle.content,
                        desc: '',
                        files: {
                            FILE: [],
                            IMG: [],
                            VIDEO: []
                        },
                        level: 0,
                        // 发起者类型，10 用户，默认为"10"
                        ownerType: '10',
                        pOwnerId: '',
                        pOwnerType: '',
                        pid: '',
                        scopes: [
                            //圈子拥有者的id
                            {
                                OwnerId: $scope.c.cid,
                                // 圈子拥有者的类型, -1 无  10 课程 20 题库 30 用户 40    章 50    节
                                OwnerType: $scope.c.type,
                            }
                        ],
                        // 帖子相关的标签分类数组
                        tags: [],
                        // 标题
                        title: '',
                        // 类型 10 发帖 20 回复 30 点赞
                        type: argType,
                    };
                    switch (argType) {
                        case '10':
                            if (!data.content) {
                                service.dialog.alert('请先输入内容！');
                                return;
                            } else {
                                $scope.load.sendCircle = true;
                                data.needData = true;
                            }
                            break;
                        case '20':
                            if (!argData.replyContent) {
                                service.dialog.alert('请先输入内容！');
                                return;
                            } else {
                                argData.sendReply = true;
                                data.needData = true;
                            }
                            data.content = argData.replyContent;
                            data.pOwnerId = argData.ownerId;
                            data.pOwnerType = $scope.c.pOwnerType || '10';
                            data.pid = argData._id;
                            break;
                        case '30':
                            argData.sendLike = true;
                            data.pOwnerId = argData.ownerId;
                            data.pOwnerType = $scope.c.pOwnerType || '10';
                            data.pid = argData._id;
                            break;
                    }
                    service.studyCircle.sendCircle({ token: rcpAid.getToken() }, { data: angular.toJson(data) }).then(function(rs) {
                        console.log(rs);
                        switch (argType) {
                            case '10':
                                $scope.circle.content = '';
                                $scope.load.sendCircle = false;
                                $scope.circleList.unshift(rs.data.discuss[0]);
                                angular.extend($scope.usrList, rs.data.usr);
                                break;
                            case '20':
                                argData.sendReply = false;
                                // argData.replyContent = '';
                                $scope.getCircleList();
                                break;
                            case '30':
                                argData.sendLike = false;
                                argData.count.likeCount = +argData.count.likeCount + 1;
                                argData.isLiked = true;
                                $scope.circleList[sindex].root.sendLikeCheck = false;
                                service.dialog.alert("点赞成功");
                                break;
                        }
                    }, function(e) {
                        console.log(e);
                        switch (argType) {
                            case '10':
                                $scope.load.sendCircle = false;
                                service.dialog.showErrorTip(e, {moduleName: 'study-circle', funcName: 'sendCircle-10'});
                                break;
                            case '20':
                                argData.sendReply = false;
                                service.dialog.showErrorTip(e, {moduleName: 'study-circle', funcName: 'sendCircle-20'});
                                break;
                            case '30':
                                argData.sendLike = false;
                                if (e.data.data.code === 1003) {
                                    service.dialog.alert('您已点过赞！');
                                }
                                $scope.circleList[sindex].root.sendLikeCheck = false;
                                break;
                        }
                    });
                };

                $scope.cancle = function(argData,index){
                    var cmds={
                        ownerType:10,
                        type:30,
                        parentId:argData._id
                    };
                    service.studyCircle.removeDiscuss(cmds).then(function(){
                        argData.isLiked = false;
                        argData.count.likeCount = +argData.count.likeCount - 1;
                        $scope.circleList[index].root.sendLikeCheck = false;
                        service.dialog.alert("取消点赞成功");
                    },function (err) {
                        service.dialog.showErrorTip(err, {moduleName: 'study-circle', funcName: 'removeDiscuss'});
                        console.error(err);
                        $scope.circleList[index].root.sendLikeCheck = false;
                    })
                };

                //增加阅读数
                $scope.setReadCount = function(argId,$event) {
                    var data = {
                        id: argId
                    };
                    service.studyCircle.setReadCount(data).then(function(rs) {
                        console.log(rs);
                       
                    }, function(e) {
                        console.log(e);
                        service.dialog.showErrorTip(e, {moduleName: 'study-circle', funcName: 'setReadCount'});
                    });
                };
                //进入圈子详情
                $scope.toDetail = function(argData) {
                    // if(!$scope.curToken){
                    //     service.common.toLogin();
                    //     return;
                    // }
                    if (argData.root._id ) {
                        $scope.setReadCount(argData.root._id);
                    }
                    $scope.toDetailCircle = rcpAid.getUrl('圈子详情',{id: argData.root._id , token:rcpAid.getToken()});
                };
                //点赞
                $scope.sendLike = function(argData, argEnent,index) {
                    if(!$scope.curToken){
                        service.common.toLogin();
                        return;
                    }
                    argEnent.stopPropagation();
                    if($scope.circleList[index].root.sendLikeCheck){
                        return;
                    }else{
                        $scope.circleList[index].root.sendLikeCheck = true;
                    }
                    if(argData.isLiked){
                        $scope.cancle(argData,index);
                        return;
                    }
                    if (!argData.sendLike) {
                        $scope.send('30', argData,index);
                    }
                };


                $scope.$watch('c',function (nValue,oValue) {
                    if(nValue == oValue && nValue == null) return;
                    if(!nValue.cid) return;
                    $scope.init();
                }, true);
                // $scope.init();
            } catch (e) {
                console.log(e);
            }

        }]
    };
});
