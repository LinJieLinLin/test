/**
 * c{
 *     category:帖子类型，默认为10,
 *     pOwnerType:父帖子拥有者类型，10 用户,默认为10,
 *     courseId:课程id,
 *     nowSection:当前章节信息
 * }
 */
if (!module) {
    var module = angular.module('RCP', []);
}
module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);
module.directive('studyCircleLearn', function() {
    return {
        template:'<div class="study-circle"><style type="text/css">@charset "UTF-8";.study-circle,.study-circle div{position:relative}.c{cursor:pointer}.mg-t30{margin-top:30px}.study-circle{padding-bottom:10px}.study-circle .load-0,.study-circle .load-1{width:100%;padding:20px 0 0;z-index:10;left:0}.study-circle .color-yeallow{color:#fe8811}.study-circle .load-0{position:absolute;top:115px}.study-circle .load-1{position:relative;bottom:10px}.study-circle hr{border:0;background-color:#ececec;height:1px}.study-circle button{font-size:14px;padding:6px 20px;border-radius:10px;border:none;cursor:pointer}.study-circle .study-circle-w{padding:10px 30px 0;border-bottom:1px solid #d7d7d7;width:0;background-color:#fff}.study-circle .study-circle-r{height:auto;top:0;left:0;overflow-y:auto;overflow-x:hidden}.study-circle .title{font-size:18px;color:#414141;height:30px;line-height:30px}.study-circle .content{color:#a0a0a0;margin:20px 0}.study-circle .write{border:1px solid #ececec}.study-circle .write>div:nth-child(1){border:0}.study-circle .write>div:nth-child(1) .stint-chac{border-top:1px solid #ececec;border-left:1px solid #ececec;border-right:1px solid #ececec}.study-circle .write .up-img{padding-bottom:18px;height:45px;width:100%;white-space:nowrap;overflow-x:auto;overflow-y:hidden;border-top:1px solid #ececec;z-index:2;word-wrap:normal}.study-circle .write .up-img div{display:inline-block;position:relative}.study-circle .write .up-img div>i{display:none;position:absolute;top:-12px;right:-10px;color:#e86868}.study-circle .write .up-img div:hover>i{display:inline-block}.study-circle .write .up-img .upload-ing{position:absolute;top:0;left:0;height:100%;background:rgba(107,107,107,.53);width:100%;text-align:center}.study-circle .write .up-img .upload-text{position:absolute;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.study-circle .write .up-img .img{width:50px;height:50px;margin-left:3px}.study-circle .write textarea{height:110px;border:none;width:100%;background:0 0}.study-circle .write i{margin:10px;font-size:20px;color:#a0a0a0}.study-circle .write .dyeditor-w{border:0 solid #ececec}.study-circle .write-reply>div:nth-child(1){padding-bottom:30px}.study-circle .issue{float:right;background:#02c0b9;color:#fff;border-radius:20px;margin-top:4px;margin-right:16px}.study-circle .issue:active{background:#02aca6}.study-circle .view-my{width:100%;height:40px;line-height:40px;margin-left:30px;background-color:#fff;z-index:2}.study-circle .v-a-m{vertical-align:middle}.study-circle .select-0{height:32px;margin:15px 0}.study-circle .select-0 label{line-height:32px;margin-right:15px;font-size:14px;position:relative;z-index:11}.study-circle .select-0 .section,.study-circle .select-0 .section-list{margin-left:-1px;margin-right:-1px;border:1px solid #d7d7d7;cursor:pointer}.study-circle .select-0 .auto-w{left:0;top:0;position:absolute;width:100%}.study-circle .select-0 .auto-right{padding-left:145px}.study-circle .select-0 .section{line-height:26px;margin-top:2px;width:98%;padding-left:2%;height:26px}.study-circle .select-0 .section-list{position:absolute;top:100%;left:0;width:100%;min-height:400px;background-color:#fff;z-index:10}.study-circle .select-0 .section-a:hover,.study-circle .select-0 .section-b:hover,.study-circle .select-0 .section-select{background-color:#02c0b9;color:#fff}.study-circle .select-0 .section-font{color:#02c0b9}.study-circle .select-0 .section-a{font-weight:700;padding-left:5px}.study-circle .select-0 .section-b{padding-left:10px}.study-circle .select-0 .w-0{width:90%}.study-circle .select-0 .w-1{width:10%;text-align:center}.study-circle .select-0 .w-1 i{font-size:24px;margin-top:-6px}.study-circle .user-info-1{float:left;padding-right:20px;display:inline-block;width:50px;text-align:center;color:#0095CE}.study-circle .user-info-1 .img-circle{border-radius:50px}.study-circle .user-info-1 .img{width:50px;height:50px}.study-circle .other-circle{border-top:1px solid #d7d7d7;padding-top:15px;margin:-1px 30px 15px}.study-circle .other-circle .user-name{float:left}.study-circle .other-circle .user-name>div{margin:5px 0}.study-circle .other-circle .user-name>div:last-child{color:#a0a0a0}.study-circle .other-circle .content{line-height:20px}.study-circle .other-circle .content>div{margin-bottom:15px}.study-circle .other-circle .dz{cursor:pointer;float:right}.study-circle .other-circle .dz i{font-size:18px}.study-circle .other-circle .l-reply{background-color:#e5e5e5;margin-top:20px;position:relative;padding:15px;border-radius:4px}.study-circle .other-circle .l-reply .write{position:relative;background-color:#fff}.study-circle .other-circle .l-reply .write button{background-color:#fff;position:absolute;bottom:0;right:0;color:#959595}.study-circle .other-circle .l-reply textarea{height:80px;border:none;width:100%}.study-circle .other-circle .l-reply:before{position:absolute;z-index:-1;content:\'\';background:#e5e5e5;border-radius:4px;top:-6px;left:12px;height:20px;width:20px;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg)}.study-circle .other-circle .l-reply .write-reply-h{height:25px}.study-circle .other-circle .pl>div{margin-top:10px}.study-circle .other-circle .all-r{text-align:center;color:#a0a0a0}.study-circle .other-circle .line{height:1px;border-top:1px solid #d7d7d7;margin:10px 0}.study-circle .to-top{display:none;position:absolute;bottom:25px;right:25px;width:30px;height:30px;background-color:#a3a3a3}.study-circle .to-top i{position:absolute;color:#fff;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);transform:translate(-50%,-50%);font-size:18px;cursor:pointer}@media screen and (max-width:1240px){.study-circle .other-circle{margin-left:15px;margin-right:15px}}</style><div class="study-circle-r" id="study-circle-r"><div class="study-circle-w"><loader-ui show="!load.sendCircle" class="load-0"></loader-ui><div class="title"><span>圈子</span></div><div class="write mg-t20"><editor-with-emoji style="border-color:#d9d9d9" content="circle.content" exceed="circle.exceed" config="{id: \'dynamic-dyeditor\', limit: 150, style:{minHeight:80,overflow:\'auto\',fontSize:\'14px\'}, placeholder: \'欢迎使用圈子，圈子是大家共同学习的社区，您可以在这里提问，写心得笔记，与朋友分享学习乐趣！！\'}"></editor-with-emoji><div style="position:absolute"><editor-emoji-picker showed="replyDiscuss.emojiPickerShowed" editor="\'#dynamic-dyeditor\'" style="top:35px;left:-43px"></editor-emoji-picker></div><div ng-show="uploadData.img.length||uploadData.status==\'uploading\'" class="up-img"><div ng-repeat="img in uploadData.img track by $index"><ng-img c="{img:img}" class="img"></ng-img><i class="fa fa-times" aria-hidden="true" ng-click="delImg($index)"></i></div><div ng-show="uploadData.status==\'uploading\'" class="upload-ing" ng-style="{width:uploadData.img.rate*100+\'%\'}"><div ng-hide="uploadData.img.rate" class="upload-text">处理中...</div><div ng-show="uploadData.img.rate" class="upload-text" ng-bind="+uploadData.img.rate*100+\'%\'"></div></div></div><div><a href="javascript:;" data-ng-click="replyDiscuss.emojiPickerShowed=!replyDiscuss.emojiPickerShowed;$event.stopPropagation();"><i class="fa fa-smile-o"></i></a> <a href="javascript:;" ng-click="uploader()"><i class="fa fa-picture-o"></i> </a><button class="issue" ng-click="sendCircle()">发布</button><upload-img upload="uploadData" select-file="uploadImgSelect" class="swf-up-35"></upload-img></div></div><div class="select-0"><label for="c-check" class="f-l"><input type="checkbox" id="c-check" ng-model="circle.isSecret" ng-true-value="0" ng-false-value="1"> <span class="v-a-m">私密</span></label><div class="clear"></div></div></div><div class="view-my"><label for="c-view" class="f-l"><input type="checkbox" id="c-view" ng-click="getMyCircleList()"> <span class="v-a-m">只看自己的</span></label></div><div class="other-circle" ng-repeat="c in circleList"><div><div class="user-info-1"><ng-img c="{img:usrList[c.root.ownerId].attrs.basic.avatar,divClass:\'img\'}" class="img"></ng-img></div><div class="user-name"><div ng-bind="usrList[c.root.ownerId].attrs.basic.nickName"></div><div ng-bind="c.root.createTime| date:\'yyyy-MM-dd HH:mm:ss\'">2015-11-11 11:11:11</div></div><div class="clear"></div></div><div class="content"><div ng-bind-html="c.root.content | encodeHtml | emojiUnifiedToCss | html"></div><image-slider images="c.root.files.IMG"></image-slider></div><div><div class="f-l c" ng-click="openReply(c,$index);">评论（<span ng-bind="c.root.count.replyCount">0</span>）</div><div class="dz" ng-click="sendLike(c)"><i class="fa fa-thumbs-o-up" ng-class="{\'color-yeallow\':c.root.isLiked}"></i> <span ng-bind="c.root.count.likeCount">0</span></div><div class="clear"></div></div><div class="l-reply" ng-show="c.root.count.replyCount>0||c.root.edit"><div></div><div class="write write-reply" ng-show="c.root.edit"><div class="pd-b30" ng-init="c.root.replyContent=\'\';"><editor-with-emoji style="border:none" content="c.root.replyContent" exceed="c.root.exceed" config="{id: \'reply-\'+$index, limit: 150, style:{minHeight:80,overflow:\'auto\',fontSize:\'14px\'}, placeholder: \'请输入内容！\'}"></editor-with-emoji></div><div style="position:absolute"><editor-emoji-picker showed="replyDiscuss.replyEmojiShow" editor="\'#reply-\'+$index" style="top:35px;left:-43px"></editor-emoji-picker></div><a href="javascript:;" data-ng-click="replyDiscuss.replyEmojiShow=!replyDiscuss.replyEmojiShow;$event.stopPropagation();"><i class="fa fa-smile-o"></i></a> <button type="button" ng-click="sendReply(c)">发布</button></div><div class="pl"><div ng-show="re.ownerId" ng-repeat="re in c.replys track by $index"><span ng-bind="usrList[re.ownerId].attrs.basic.nickName+\'：\'"></span> <span ng-bind-html="re.content | encodeHtml | emojiUnifiedToCss | html"></span></div></div><div class="line" ng-show="c.root.count.replyCount>2"></div><div class="all-r" ng-show="c.root.count.replyCount>2"><a ng-href="{{toDetail(c)}}" target="_blank">查看全部<span ng-bind="c.root.count.replyCount"></span>条回复</a></div></div></div><loader-ui show="!load.getCircleList" class="load-1"></loader-ui></div><div class="to-top" ng-click="toTop()"><i class="fa fa-arrow-up" aria-hidden="true"></i></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            c: '='
        },
        controller: ['$scope', '$timeout', '$http', 'service', '$rootScope', 'cvfa', '$filter', function($scope, $timeout, $http, service, $rootScope, cvfa, $filter) {
            try {
                //初始化
                $scope.category = '10';
                $scope.pOwnerType = '10';
                $scope.courseId = '';
                $scope.nowSection = {};
                $scope.selectSection = {};
                $scope.ownerType = '10';
                var toTop = $('.study-circle .to-top');
                var page = {
                    pn: 1,
                    ps: 8,
                    all: 8,
                    load: true,
                };
                $scope.scrollFunc = function() {
                    var t = $(this);
                    var viewH = t.height(),
                        contentH = t.get(0).scrollHeight,
                        scrollTop = t.scrollTop();
                    if (scrollTop / (contentH - viewH) >= 0.95 && page.load) {
                        console.log('加载第' + page.pn + 1, viewH, contentH, scrollTop, scrollTop / (contentH - viewH));
                        page.load = false;
                        $scope.getCircleList(page.pn + 1);
                    }
                    if (scrollTop > 10) {
                        toTop.show();
                    } else {
                        toTop.hide();
                    }
                };
                $('.study-circle-r').on('scroll', $scope.scrollFunc);
                $scope.init = function() {
                    if ($scope.c) {
                        angular.forEach($scope.c, function(v, k) {
                            $scope[k] = v;
                        });
                    } else {
                        console.log('无配置文件！');
                    }
                    //接收当前章节信息
                    $scope.$on('actionAatId', function(ev, id) {
                        angular.forEach(cvfa.cat.items, function(v, i) {
                            if (v.id == id) {
                                $scope.nowSection = v;
                            }
                        });
                    });
                    $scope.circle = {
                        content: '',
                        exceed: '',
                        isSecret: 1,
                        nowSection: '',
                        viewMy: false,
                    };
                    $scope.usrList = {};
                    $scope.circleList = [];
                    $scope.load = {};
                    $scope.getCircleList();
                    //章节列表
                    $scope.cat = { items: cvfa.cat.items };
                };
                // func
                $scope.send = function(argType, argData) {
                    var ownerId = $scope.courseId;
                    //todo 发圈子有时会变成40
                    // if ($scope.circle.nowSection && $scope.nowSection.id) {
                    //     ownerId = $scope.nowSection.id;
                    //     $scope.ownerType = '40';
                    // }
                    var data = {
                        acl: {
                            ALL: +$scope.circle.isSecret,
                        },
                        atUsers: [],
                        category: $scope.category || '10',
                        coin: 0,
                        content: $scope.circle.content,
                        desc: '',
                        files: {
                            FILE: [],
                            IMG: $scope.uploadData.img,
                            VIDEO: [],
                        },
                        level: 0,
                        // 发起者类型，10 用户，默认为"10"
                        ownerType: '10',
                        pOwnerId: '',
                        pOwnerType: '',
                        pid: '',
                        scopes: [{
                            //圈子拥有者的id，eg：若ownerType为10 课程，则此为课程id，若ownerType为40 章，则此为所对应的章id
                            OwnerId: ownerId,
                            // 圈子拥有者的类型, -1 无  10 课程 20 题库 30 用户 40    章 50    节
                            OwnerType: $scope.ownerType,
                            //圈子id
                            // scopeId: '',
                        }],
                        // 帖子相关的标签分类数组
                        tags: [],
                        // 标题
                        title: '',
                        // 类型 10 发帖 20 回复 30 点赞
                        type: argType,
                    };
                    switch (argType) {
                        case '10':
                            if ($scope.circle.exceed > 0) {
                                service.dialog.alert('已超出字数限制!');
                                return;
                            }
                            if (!data.content || $scope.circle.exceed < 0) {
                                service.dialog.alert('请先输入内容！');
                                return;
                            } else {
                                $scope.load.sendCircle = true;
                                data.needData = true;
                            }
                            break;
                        case '20':
                            if (argData.root.exceed > 0) {
                                service.dialog.alert('已超出字数限制!');
                                return;
                            }
                            if (!argData.root.replyContent || argData.root.exceed < 0) {
                                service.dialog.alert('请先输入内容！');
                                return;
                            } else {
                                argData.root.sendReply = true;
                                data.needData = true;
                            }
                            data.content = argData.root.replyContent;
                            data.pOwnerId = argData.root.ownerId;
                            data.pOwnerType = $scope.pOwnerType || '10';
                            data.pid = argData.root._id;
                            break;
                        case '30':
                            data.pOwnerId = argData.root.ownerId;
                            data.pOwnerType = $scope.pOwnerType || '10';
                            data.pid = argData.root._id;
                            break;
                    }
                    console.log(angular.toJson(data));
                    data.content = $filter('emojiColonToUnified')(data.content);
                    service.studyCircle.sendCircle({ token: rcpAid.getToken() }, { data: angular.toJson(data) }).then(function(rs) {
                        console.log(rs);
                        $scope.uploadData.img = [];
                        switch (argType) {
                            case '10':
                                $scope.circle.content = '';
                                $scope.load.sendCircle = false;
                                $scope.getCircleList();
                                $scope.selectSection = {};
                                $scope.circle.nowSection = false;
                                break;
                            case '20':
                                if (argData.replys.length > 0) {
                                    argData.replys[1] = angular.copy(argData.replys[0]);
                                    argData.replys[0].ownerId = $rootScope.currentUser.uid;
                                    argData.replys[0].content = data.content;
                                } else {
                                    argData.replys[0] = {
                                        ownerId: $rootScope.currentUser.uid,
                                        content: data.content
                                    };
                                }
                                $scope.usrList[$rootScope.currentUser.uid] = {
                                    attrs: {
                                        basic: {
                                            nickName: $rootScope.currentUser.nickName,
                                            avatar: $rootScope.currentUser.avatar,
                                        }
                                    }
                                };
                                argData.root.edit = false;
                                argData.root.sendReply = false;
                                argData.root.count.replyCount++;
                                argData.root.replyContent = '';
                                break;
                            case '30':
                                argData.root.count.likeCount = +argData.root.count.likeCount + 1;
                                argData.root.isLiked = true;
                                break;
                        }
                    }, function(e) {
                        console.log(e);
                        service.dialog.showErrorTip(e, { moduleName: 'study-circle-learn', funcName: 'sendCircle' });
                        // switch (argType) {
                        //     case '10':
                        //         $scope.load.sendCircle = false;
                        //         service.dialog.alert('操作失败，请重试！');
                        //         break;
                        //     case '20':
                        //         argData.root.sendReply = false;
                        //         service.dialog.alert('操作失败，请重试！');
                        //         break;
                        //     case '30':
                        //         if (e.data.data.code === 1003) {
                        //             service.dialog.alert('您已点过赞！');
                        //         }
                        //         break;
                        // }
                    });
                };
                /**
                 * [delDiscuss 删除点赞，回复或帖子]
                 * @param  {[type]} argType [类型 10 20 30]
                 * @param  {[type]} argData [数据]
                 * @return {[type]}         [description]
                 */
                $scope.delDiscuss = function(argType, argData) {
                    var ownerId = $scope.courseId;
                    if ($scope.selectSection) {
                        ownerId = $scope.selectSection.id;
                        $scope.ownerType = '40';
                    }
                    var data = {
                        discussId: '',
                        ownerType: '10',
                        parentId: '',
                        // 20 删除回复 30 取消点赞 ，删除帖子可不传
                        type: argType,
                    };
                    switch (argType) {
                        case '10':
                            break;
                        case '20':
                            break;
                        case '30':
                            data.parentId = argData.root._id;
                            break;
                    }
                    console.log(angular.toJson(data));
                    service.studyCircle.removeDiscuss(data).then(function(rs) {
                        console.log(rs);
                        $scope.uploadData.img = [];
                        switch (argType) {
                            case '10':
                                $scope.circle.content = '';
                                $scope.load.sendCircle = false;
                                $scope.getCircleList();
                                break;
                            case '20':
                                if (argData.replys.length > 1) {
                                    argData.replys[1] = angular.copy(argData.replys[0]);
                                    argData.replys[0].ownerId = $rootScope.currentUser.uid;
                                    argData.replys[0].content = argData.root.replyContent;
                                } else {
                                    argData.replys[0] = {
                                        ownerId: $rootScope.currentUser.uid,
                                        content: argData.root.replyContent
                                    };
                                }
                                $scope.usrList[$rootScope.currentUser.uid] = {
                                    attrs: {
                                        basic: {
                                            nickName: $rootScope.currentUser.nickName,
                                            avatar: $rootScope.currentUser.avatar,
                                        }
                                    }
                                };
                                argData.root.edit = false;
                                argData.root.sendReply = false;
                                argData.root.count.replyCount++;
                                argData.root.replyContent = '';
                                break;
                            case '30':
                                argData.root.count.likeCount = +argData.root.count.likeCount - 1;
                                argData.root.isLiked = false;
                                break;
                        }
                    }, function(e) {
                        console.log(e);
                        service.dialog.showErrorTip(e, { moduleName: 'study-circle-learn', funcName: 'removeDiscuss' });
                        // switch (argType) {
                        //     case '10':
                        //         $scope.load.sendCircle = false;
                        //         service.dialog.alert('操作失败，请重试！');
                        //         break;
                        //     case '20':
                        //         argData.root.sendReply = false;
                        //         service.dialog.alert('操作失败，请重试！');
                        //         break;
                        //     case '30':
                        //         if (e.data.data.code === 1003) {
                        //             service.dialog.alert('您取消过点赞！');
                        //         }
                        //         break;
                        // }
                    });
                };
                //发帖
                $scope.sendCircle = function() {
                    if ($scope.uploadData.status === 'uploading') {
                        service.dialog.alert('请等待图片上传完成！');
                        return;
                    }
                    if (!$scope.load.sendCircle) {
                        $scope.send('10');
                    }
                };
                //回复
                $scope.sendReply = function(argData) {
                    if (!argData.sendReply) {
                        $scope.send('20', argData);
                    }
                };
                //点赞
                $scope.sendLike = function(argData) {
                    if (!argData.root.isLiked) {
                        $scope.send('30', argData);
                    } else {
                        $scope.delDiscuss('30', argData);
                    }
                };
                //获取我的圈子列表
                $scope.getMyCircleList = function() {
                    $scope.circle.viewMy = !$scope.circle.viewMy;
                    $scope.getCircleList();
                };
                //获取圈子列表
                $scope.getCircleList = function(argPage) {
                    if (argPage) {
                        page.pn = argPage;
                    } else {
                        $scope.circleList = [];
                        $scope.usrList = {};
                        page.pn = 1;
                    }
                    if (page.all && Math.ceil(page.all / page.ps) < page.pn) {
                        return;
                    }
                    var data = {
                        isZeroReply: false,
                        k: '.',
                        mode: 1,
                        page: page.pn,
                        pageCount: page.ps,
                        reviewReplyCount: 2,
                        reviewSort: -1,
                        owners: [{
                            OwnerId: $scope.courseId,
                            OwnerType: '10'
                        }],
                        sort: -1,
                    };
                    console.log($scope.circle);
                    if ($scope.circle.viewMy) {
                        data.ownerId = $rootScope.currentUser.uid;
                        data.owner = angular.toJson([{
                            OwnerId: $scope.courseId,
                            OwnerType: '10'
                        }]);
                        $scope.load.getCircleList = true;
                        service.studyCircle.getPersonDiscuss(data, {}).then(function(rs) {
                            $scope.load.getCircleList = false;
                            try {
                                angular.forEach(rs.data.discuss, function(v) {
                                    $scope.circleList.push(v);
                                });
                                angular.extend($scope.usrList, rs.data.usr);
                                // 总
                                page.all = rs.data.allCount;
                                page.load = true;
                            } catch (e) {}
                        }, function(e) {
                            console.log(e);
                            service.dialog.showErrorTip(e, { moduleName: 'study-circle-learn', funcName: 'getPersonDiscuss' });
                            $scope.load.getCircleList = false;
                        });
                    } else {
                        $scope.load.getCircleList = true;
                        service.studyCircle.getCircleList({}, { data: angular.toJson(data) }).then(function(rs) {
                            $scope.load.getCircleList = false;
                            try {
                                angular.forEach(rs.data.discuss, function(v) {
                                    $scope.circleList.push(v);
                                });
                                angular.extend($scope.usrList, rs.data.usr);
                                // 总
                                page.all = rs.data.allCount;
                                page.load = true;
                            } catch (e) {}
                        }, function(e) {
                            console.log(e);
                            service.dialog.showErrorTip(e, { moduleName: 'study-circle-learn', funcName: 'getCircleList' });
                            $scope.load.getCircleList = false;
                        });
                    }
                };

                //进入圈子详情
                $scope.toDetail = function(argData) {
                    return rcpAid.getUrl('圈子详情', { id: argData.root._id, token: rcpAid.getToken() });
                };
                //图片插件 --------------------------------------------------
                $scope.uploadData = {
                    max: 9,
                };
                $scope.uploader = function() {
                    var len = $scope.uploadData.max || 6;
                    if ($scope.uploadData.status === 'uploading') {
                        return;
                    }
                    if ($scope.uploadData.img.length >= len) {
                        service.dialog.alert('最多只能添加' + len + '张图片！');
                        return false;
                    }
                    $scope.uploadImgSelect();
                };
                /**
                 * [delImg 删除图片]
                 * @param  {[type]} argIndex [图片下标]
                 * @return {[type]}          [description]
                 */
                $scope.delImg = function(argIndex) {
                    if (argIndex < $scope.uploadData.img.length) {
                        $scope.uploadData.img.splice(argIndex, 1);
                    }
                };
                /**
                 * [toTop 回到顶部]
                 * @return {[type]} [description]
                 */
                $scope.toTop = function() {
                    $('.study-circle-r').stop().animate({
                        scrollTop: 0
                    }, 'normal');
                };
                /**
                 * [openReply 打开回复]
                 * @param  {[type]} argData [description]
                 * @return {[type]}         [description]
                 */
                $scope.openReply = function(argData, argIndex) {
                    argData.root.edit = !argData.root.edit;
                    if (argData.root.edit) {
                        $timeout(function() {
                            $('#reply-' + argIndex).focus();
                        }, 0);
                    }
                };
                /**
                 * 选择章节
                 * @param  {[type]} argSection [章节数据]
                 * @param  {[type]} argType    [true时返回]
                 * @return {[type]}            [description]
                 */
                $scope.sSection = function(argSection, argType) {
                    console.log(argSection, argType);
                    if (!argSection || argSection === '无' || argType) {
                        $scope.selectSection = false;
                    } else {
                        $scope.selectSection = argSection;
                    }
                };
                $scope.init();
            } catch (e) {
                console.log(e);
            }
        }]
    };
});
