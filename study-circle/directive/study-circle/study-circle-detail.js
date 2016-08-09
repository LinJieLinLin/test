if (!module) {
    var module = angular.module('RCP', []);
}
module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);
module.directive('studyCircleDetail', ['$timeout', function($timeout) {
    return {
        template:'<div class="study-circle"><div class="content-section"><h3 class="content-section-head-1"><a ng-href="{{goCircleTotal}}" target="_blank">学习圈子</a> <span>&gt; 圈子详情</span></h3><div class="content-section-body"><ul class="circle-detail circle-detail-1"><li class="inline"><div class="user-info"><img class="img-circle" src="{{rootInfo.avatar || \'../study-circle/imgs/d-face-1.png\'}}" alt=""></div><div class="detail-1"><div><p ng-bind="rootInfo.nickName"></p></div><div ng-bind-html="rootInfo.root.content | encodeHtml | emojiUnifiedToCss | html"></div><image-slider images="circleData.root.files.IMG" class="self-image-slider"></image-slider><p class="desc-1"><span class="date" ng-bind="rootInfo.root.createTime| date:\'MM-dd HH:mm\'"></span> <span ng-bind="rootInfo.root.count.readCount+\'阅读\'"></span> <span class="vote"><button ng-click="sendLike(rootInfo.root,true)"><i class="fa fa-thumbs-o-up" ng-show="rootInfo.root.isLiked" style="color:#fe8811"></i> <i class="fa fa-thumbs-o-up" ng-hide="rootInfo.root.isLiked"></i> <span ng-bind="rootInfo.root.count.likeCount">186</span></button> <button><i class="fa fa-share-alt"></i> <span>分享</span></button></span></p><button ng-click="scoreTo(\'reply\',\'relay-circle\',false)">回复</button></div></li></ul></div><div class="reply-body"><div ng-bind="rootInfo.root.count.replyCount+\'个回复\'"></div><div class="reply-list" ng-repeat="r in circleData.replys track by $index"><div class="user-info"><img class="img-circle" ng-src="{{usrList[r.ownerId].attrs.basic.avatar ||\'../study-circle/imgs/d-face-1.png\'}}" alt=""></div><div class="reply-content"><div class="header"><div class="f-l"><span ng-bind="usrList[r.ownerId].attrs.basic.nickName"></span> <span ng-bind="(r.createTime| date:\'MM-dd HH:mm\')">11-18 19:33</span></div><div class="f-r" ng-click="sendLike(r,false,$index)"><button><i class="fa fa-thumbs-o-up" ng-show="r.isLiked" style="color:#fe8811"></i> <i class="fa fa-thumbs-o-up" ng-hide="r.isLiked"></i> <span>赞</span></button> <span ng-bind="\'（\'+r.count.likeCount+\'）\'">（0）</span></div></div><div class="body"><div ng-bind-html="r.content | encodeHtml | emojiUnifiedToCss | html"></div><div class="comment c" ng-click="scoreTo(\'\',\'\',true,r,$index);"><span ng-bind="\'评论（\'+r.count.replyCount+\'）\'">评论（2）</span></div></div><div class="reply-orther"><div class="content" ng-repeat="re in r.comments track by $index"><div class="user-info"><img class="img-circle" ng-src="{{usrList[re.ownerId].attrs.basic.avatar ||\'../study-circle/imgs/d-face-1.png\'}}" alt=""></div><div class="content-d"><div><span ng-bind="usrList[re.ownerId].attrs.basic.nickName">张同学</span> <span class="color-gray-1" ng-bind="re.createTime| date:\'MM-dd HH:mm\'"></span></div><div class="mg-t10"><span>回复<span class="at-teacher" ng-bind="\'@\'+usrList[r.ownerId].attrs.basic.nickName+\'：\'">@李老师</span> <span ng-bind-html="re.content | encodeHtml | emojiUnifiedToCss | html"></span></span></div></div></div><div class="content content-a" ng-show="r.showReply" id="personalReply-{{$index}}"><div class="textarea" ng-init="r.replyContent=\'\'"><editor-with-emoji id="replyDiscussContent" style="border:none" content="r.replyContent" exceed="r.exceed" config="{id:\'reply-circle-\'+$index,limit:150,style:{minHeight:80,overflow:\'auto\',background:\'white\'},placeholder:\'请输入内容\'}"></editor-with-emoji></div><button ng-click="sendReply(r,false)">回复</button></div></div></div><div class="clear"></div></div><div class="reply-content reply-edit" id="reply" ng-init="rootInfo.root.replyContent=\'\'"><loader-ui show="!load.sendCircle" class="load-0"></loader-ui><editor-with-emoji id="inputAnswer" style="border:none" content="rootInfo.root.replyContent" exceed="rootInfo.root.exceed" config="{id:\'relay-circle\',limit:150,style:{minHeight:80,overflow:\'auto\',background:\'white\'},placeholder:\'请输入内容\'}"></editor-with-emoji><div class="a"><a href="javascript:;" class="phiz" ng-click="inputAnswerEmojiPickerShowed=!inputAnswerEmojiPickerShowed;$event.stopPropagation()"><i class="fa fa-smile-o"></i></a></div><div class="b clearfix"><button ng-click="sendReply(rootInfo.root,true)">回复</button></div><div style="position:relative"><editor-emoji-picker showed="inputAnswerEmojiPickerShowed" editor="\'#inputAnswer\'" style="top:-15px;left:11px"></editor-emoji-picker><div class="clear"></div></div><div class="clear"></div></div><pagination list="circleData.replys" style="margin:40px 0 0 0" pageargs="pageargs" pagefn="pagefn" deepwatch="true" class="page-bar jump-hide"></pagination></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '='
        },
        controller: ['$scope', '$timeout', '$http', 'service', '$filter', function($scope, $timeout, $http, service, $filter) {
            $scope.curToken = rcpAid.getToken();
            $scope.replyCount = 0;
            $scope.rootInfo = {};
            $scope.inputAnswerEmojiPickerShowed = false;
           
            try {
                //初始化
                $scope.init = function() {

                    $scope.pageargs = {
                        pn: 1, //当前第几页
                        ps: 8, //每页显示的课程数
                        pl: 5 //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
                    };

                    $scope.pagefn = function(args, callback) {
                        console.log(args);
                        $scope.getCircleDetail(callback);
                    };

                    $scope.id = rcpAid.queryString('id');
                    if ($scope.c && $scope.c.rUrl) {
                        if ($scope.c.rUrl[$scope.c.rUrl.length - 1] !== '/') {
                            $scope.c.rUrl += '/';
                        }
                    } else {
                        console.log('无配置文件！');
                    }
                    $scope.circle = {
                        content: '',
                        exceed: '',
                        isSecret: 1,
                        nowSection: ''
                    };
                    $scope.usrList = {};
                    $scope.circleData = {};
                    //获取回复帖子数
                    $scope.commentCount = 10;
                   
                    $scope.load = {};
                    // $scope.getCircleDetail();
                };
                //获取圈子列表
                $scope.getCircleDetail = function(callback) {
                    var data = {
                        discussId: $scope.id,
                        sort: 1,
                        commentCount: $scope.commentCount,
                        page: $scope.pageargs.pn,
                        pageCount: $scope.pageargs.ps
                    };

                    service.studyCircle.getCircleDetail(data).then(function(rs) {
                        $scope.circleData = rs.data.discuss;
                        $scope.usrList = rs.data.usr;
                        if (!$scope.circleData && !$scope.usrList) {
                            service.dialog.alert('返回数据有误');
                        }

                        if($scope.circleData.root && $scope.circleData.root.ownerId){
                            try{
                                $scope.rootInfo.root = $scope.circleData.root;
                                $scope.rootInfo.avatar = $scope.usrList[$scope.circleData.root.ownerId].attrs.basic.avatar;
                                $scope.rootInfo.nickName = $scope.usrList[$scope.circleData.root.ownerId].attrs.basic.nickName;
                                if($scope.rootInfo.root.count.replyCount === 0){
                                    $scope.pageargs.pn = 1;
                                }
                            }catch(err){
                                console.err(err);
                            }

                        }

                        if($scope.circleData.scopes){
                            try{
                                var curTarget = $scope.circleData.scopes[0];

                                $scope.c.cid = rs.data.scope[curTarget].ownerId;
                                $scope.c.type = rs.data.scope[curTarget].ownerType;
                            }catch (err){
                                console.error(err);
                            }

                        }

                        if (typeof(callback) == 'function') {
                            data.pa = {
                                pn: $scope.pageargs.pn,
                                ps: $scope.pageargs.ps
                            };
                            if(data.pa <= 8){
                                data.pa.total = $scope.circleData.root.count.replyCount;
                            }else{
                                data.pa.total = $scope.circleData.root.count.replyCount+1;
                            }
                            callback(data);
                        }

                        $scope.goCircleTotal = rcpAid.getUrl('全部圈子', {cid:$scope.c.cid, type:$scope.c.type, token:$scope.curToken});

                    }, function(e) {
                        console.log(e);
                        service.dialog.showErrorTip(e, {moduleName: 'study-circle-detail', funcName: 'getCircleDetail'});
                    });
                };
                $scope.send = function(argType, argData, toLast,isRoot,sindex) {
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
                                OwnerType: $scope.c.type
                            }
                        ],
                        // 帖子相关的标签分类数组
                        tags: [],
                        // 标题
                        title: '',
                        // 类型 10 发帖 20 回复 30 点赞
                        type: argType
                    };
                    switch (argType) {
                        case '20':
                            if (argData.exceed > 0) {
                                service.dialog.alert('已超出字数限制!');
                                return;
                            }
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
                    data.content = $filter('emojiColonToUnified')(data.content);
                    service.studyCircle.sendCircle({ token: rcpAid.getToken() }, { data: angular.toJson(data) }).then(function(rs) {
                        switch (argType) {
                            case '20':
                                argData.sendReply = false;
                                argData.replyContent = '';
                                if(toLast){
                                    if((parseInt($scope.rootInfo.root.count.replyCount)+1) / parseInt($scope.pageargs.ps) === 0) $scope.pageargs.pn = $scope.pageargs.pn;
                                    else{
                                        $scope.pageargs.pn = Math.ceil((parseInt($scope.rootInfo.root.count.replyCount)+1) / parseInt($scope.pageargs.ps));
                                    }
                                }
                                $scope.getCircleDetail();
                                break;
                            case '30':
                                argData.sendLike = false;
                                argData.count.likeCount = +argData.count.likeCount + 1;
                                argData.isLiked = true;
                                if(isRoot){
                                    $scope.rootInfo.root.sendLikeCheck = false;
                                }else{
                                    $scope.circleData.replys[sindex].sendLikeCheck = false;
                                }
                                service.dialog.alert("点赞成功");
                                break;
                        }
                    }, function(e) {
                        console.log(e);
                        switch (argType) {
                            case '10':
                                $scope.load.sendCircle = false;
                                break;
                            case '20':
                                argData.sendReply = false;
                                break;
                            case '30':
                                argData.sendLike = false;
                                if (e.data.data.code === 1003) {
                                    service.dialog.alert('您已点过赞！');
                                }
                                if(isRoot){
                                    $scope.rootInfo.root.sendLikeCheck = false;
                                }else{
                                    $scope.circleData.replys[sindex].sendLikeCheck = false;
                                }
                                break;
                        }
                    });
                };

                $scope.cancle = function(argData,isRoot,index){
                    var cmds={
                        ownerType:10,
                        type:30,
                        parentId:argData._id
                    };
                    service.studyCircle.removeDiscuss(cmds).then(function(){
                        argData.isLiked = false;
                        argData.count.likeCount = +argData.count.likeCount - 1;
                        if(isRoot){
                            $scope.rootInfo.root.sendLikeCheck = false;
                        }else{
                            $scope.circleData.replys[index].sendLikeCheck = false;
                        }
                        service.dialog.alert("取消点赞成功");
                    },function (err) {
                        service.dialog.showErrorTip(err, {moduleName: 'study-circle-detail', funcName: 'removeDiscuss'});
                        console.error(err);
                        if(isRoot){
                            $scope.rootInfo.root.sendLikeCheck = false;
                        }else{
                            $scope.circleData.replys[index].sendLikeCheck = false;
                        }
                    })
                };
                //回复
                $scope.sendReply = function(argData,toLast) {
                    if(!$scope.curToken){
                        service.common.toLogin();
                        return;
                    }
                    if (!argData.sendReply) {
                        $scope.send('20', argData,toLast);
                    }
                };
                //点赞
                $scope.sendLike = function(argData,isRoot,index) {
                    if(isRoot){
                        if($scope.rootInfo.root.sendLikeCheck) return;
                        $scope.rootInfo.root.sendLikeCheck = true;
                    }else{
                        if($scope.circleData.replys[index].sendLikeCheck) return;
                        $scope.circleData.replys[index].sendLikeCheck = true;
                    }
                    if(!$scope.curToken){
                        service.common.toLogin();
                        return;
                    }
                    if(argData.isLiked){
                        $scope.cancle(argData,isRoot,index);
                        return;
                    }
                    if (!argData.sendLike) {
                        $scope.send('30', argData,false,isRoot,index);
                    }
                };
                $scope.scoreTo = function(argData1,argData2,flag,arg,index) {
                    if(!flag){
                        $('html,body').stop().animate({ scrollTop: $('#' + argData1).offset().top }, 'normal');
                        $timeout(function(){$('#'+argData2).focus()},0,false);
                    }else{
                        arg.showReply = !arg.showReply;
                        $timeout(function () {
                            $('html,body').stop().animate({ scrollTop: $('#personalReply-' + index).offset().top }, 'normal');
                        },50,false);
                        $timeout(function(){$('#reply-circle-'+index).focus()},200,false);
                    }

                };
                //图片插件 --------------------------------------------------
                // $scope.uploadData = {
                //     max: 9,
                // };
                // $scope.uploader = function() {
                //     var len = $scope.uploadData.max || 6;
                //     if ($scope.uploadData.img.length >= len) {
                //         service.dialog.alert('最多只能添加' + len + '张图片！');
                //         return false;
                //     }
                //     $scope.uploadImgSelect();
                // };
                // /**
                //  * [delImg 删除图片]
                //  * @param  {[type]} argIndex [图片下标]
                //  * @return {[type]}          [description]
                //  */
                // $scope.delImg = function(argIndex) {
                //     if (argIndex < $scope.uploadData.img.length) {
                //         $scope.uploadData.img.splice(argIndex, 1);
                //     }
                // };
                
                $scope.init();

            } catch (e) {
                console.log(e);
            }
        }]
    };
}]);
