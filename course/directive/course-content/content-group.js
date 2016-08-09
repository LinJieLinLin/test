/**
 * Created by Fox2081 on 2016/1/25.
 */
module.directive('contentGroup', function () {
    return {
        restrict: 'E',
        template:'<div id="c-list-{{index}}"><div ng-hide="group.dis" class="group-loading"><div class="loading-body"><div class="loading-img"></div><span>加载中</span></div></div><div ng-show="group.dis"><div ng-repeat="item in group.items track by $index"><div class="main-content" ng-click="changeCurFocus(index,$index)" id="main-content-{{item.id}}" ng-class="{\'gray-back\':curInfo.group == index && curInfo.index == $index,\'edit\':true}"><div class="tools" ng-hide="index == 0 && group.items.length == 1"><a ng-click="moveItem(item,$index,\'up\')"><div class="ic"><i class="image-new-pos-up"></i></div></a><a ng-click="moveItem(item,$index,\'down\')"><div class="ic"><i class="image-new-pos-down"></i></div></a><a ng-click="moveItem(item,$index,\'del\')"><div class="ic"><i class="image-new-pos-del"></i></div></a></div><div class="content-container" id="container-{{item.id}}"><div class="container-show"><div class="plugin-title-first plugin" id="titleFirst={{item.id}}" ng-show="item.type == \'T1\'"><div class="title-c"><p class="first-title"><input ng-model="item.data.title" type="text" onclick="this.select()" maxlength="50" placeholder="请输入章名称" ng-blur="dataEmit($index)" ng-change="changeStatus($index,\'NON-UPDATE\')"></p></div></div><div class="plugin-title-second plugin" id="titleSecond={{item.id}}" ng-show="item.type == \'T2\'"><div class="title-c"><p class="second-title"><input ng-model="item.data.title" type="text" onclick="this.select()" maxlength="50" placeholder="请输入章名称" ng-blur="dataEmit($index)" ng-change="changeStatus($index,\'NON-UPDATE\')"></p></div></div><div class="quote-list plugin" ng-show="item.type != \'T1\' && item.type != \'T2\'"><div ng-show="item.type == \'E\'">付费内容</div><div ng-show="item.type == \'empty\' || item.type == \'loading\'">内容正在努力加载中</div><div class="practice-plugin" id="practise-{{item.id}}" ng-show="item.type == \'practise\'"><div><div class="content"><span>{{item.data.name}}</span> <a class="edit" ng-show="item.data.isOwn" ng-click="openPaper($index,\'edit\')">编辑</a> <a class="edit" ng-show="!item.data.isOwn" ng-click="openPaper($index,\'preview\')">预览</a></div></div></div><div class="plugin-video" id="video-{{item.id}}" ng-show="item.type == \'video\'"><div class="wait-init" ng-show="item.data.status == \'LOADING\'"><span>视频信息读取中</span></div><div class="wait-init" ng-show="item.data.status == \'LOADFAIL\'"><span>视频信息读取失败，请删除后重新上传。</span></div><div class="wait-init upload" ng-show="item.data.status == \'UPLOAD\'"><span>视频文件上传中：{{item.data.per || 0}}%</span><div class="plugin-progress"><div class="upload-progress"><div class="upload-progress-bar success" ng-style="{\'width\':item.data.per * 4 + \'px\'}"></div></div></div></div><div class="wait-init" ng-show="item.data.status == \'TRANS\'"><span>视频转码中</span></div><div class="wait-init" ng-show="item.data.status == \'FAIL\'"><span>视频转码失败，请删除后重新上传。</span></div><div ng-show="item.data.status == \'SUCCESS\'"><div class="file-collapse" ng-if="!item.fileDis"><div class="head"><div class="icon"><i class="image-plugin-i-video"></i></div><div class="title"><a ng-bind="\'本地视频  \' + item.data.title" title="{{item.data.title}}" ng-click="item.fileDis = true"></a></div></div><div class="btn-grp"><span class="exec" ng-show="item.data.exec === \'running\'"><img src="/course/imgs/loading-convert.gif" alt="">转码中</span> <span class="exec" ng-show="item.data.exec === \'error\'">转码失败</span> <a href="" ng-show="item.data.exec === \'done\'" ng-click="item.fileDis = true">播放</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div><div class="file-expand" ng-if="item.fileDis"><p><a href="javascript:;" class="up" ng-click="item.fileDis = false"><span>收起</span> <i class="fa fa-arrow-circle-up"></i></a></p><p class="title" ng-bind="\'视频名称：\' + item.data.title" ng-show="item.data.title"></p><div class="video-convert" ng-show="item.data.exec === \'running\'"><img src="/course/imgs/loading-yellow.gif" alt=""><p>视频转码中。。</p></div><div class="video-convert" ng-show="item.data.exec == \'error\'"><img src="/course/imgs/convert-error.png" alt=""> <span>视频转码失败，请删除后重新上传。</span></div><div ng-bind-html="item.data.bindHtml | html" ng-show="item.data.exec === \'done\'"></div></div></div></div><div class="plugin-content" id="content-{{item.id}}" ng-if="item.type == \'text\'"><div class="content-editor-plh" ng-show="item.data.content == \'\'"><p>请在这里输入课程内容</p></div><div id="editor-course-{{item.id}}" class="content-editor" args="item" scope="dataEmit" index="$index" tag="\'course\'" ng-model="item.data.content" content-editor editor-scope="item.editorScope" ng-bind-html="item.ckContent" group="config.mark" contenteditable="true" ng-click="activeEditor($index)"></div></div><div class="plugin-embed" id="embed-{{item.id}}" ng-show="item.type == \'embed\'"><div class="wait-init" ng-show="item.data.status == \'EDIT\'"><div><span>视频名称：</span> <input type="text" ng-model="item.data.title" placeholder="请输入视频名称"></div><div><span>视频代码：</span><textarea name="" ng-model="item.embedUrl" placeholder="请输入网络视频地址"></textarea><div class="tips">提示：目前只支持video、iframe、embed格式的视频代码，embed视频无法在手机端播放</div></div><div><a class="confirm" ng-click="confirmEmbed($index)">确定</a></div></div><div class="embed-success" ng-show="item.data.status == \'SUCCESS\'"><div class="file-collapse" ng-if="!item.fileDis"><div class="head"><div class="icon"><i class="image-plugin-i-video"></i></div><div class="title"><a ng-bind="\'网络视频  \' + item.data.title" title="{{item.data.title}}" ng-click="item.fileDis = true">网络视频</a></div></div><div class="btn-grp"><a href="" ng-click="editEmbed($index)">修改</a> <a href="" ng-click="item.fileDis = true">播放</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div><div class="file-expand" ng-if="item.fileDis"><p><a href="javascript:;" class="up" ng-click="item.fileDis = false"><span>收起</span> <i class="fa fa-arrow-circle-up"></i> </a><a href="javascript:;" class="edit" ng-click="editEmbed($index)"><span>修改</span> <i class="fa fa-pencil-square-o"></i></a></p><p class="title" ng-bind="\'视频名称：\' + item.data.title" ng-show="item.data.title"></p><div ng-bind-html="item.data.url | html"></div></div></div></div><div class="plugin-link" id="link-{{item.id}}" ng-show="item.type == \'link\'"><div class="wait-init" ng-show="item.data.status == \'EDIT\'"><div><span>链接名称：</span> <input type="text" ng-model="item.data.title" placeholder="请输入链接名称"></div><div><span>链接地址：</span><textarea name="" ng-model="item.url" placeholder="请输入链接地址"></textarea></div><div><a class="confirm" ng-click="confirmLink($index)">确定</a></div></div><div class="link-success" ng-show="item.data.status == \'SUCCESS\'"><div class="file-collapse"><div class="head"><div class="icon"><i class="image-plugin-i-link"></i></div><div class="title"><a target="_blank" href="" title="{{item.data.url}}" ng-href="{{item.data.url}}">{{item.data.title == \'\' ? item.data.url : item.data.title}}</a></div></div><div class="btn-grp"><a href="" ng-click="editLink($index)">编辑</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div></div></div><div class="plugin-image" id="image-{{item.id}}" ng-show="item.type == \'image\'"><div class="wait-init" ng-show="item.data.status == \'LOADING\'"><span>图片信息读取中</span></div><div class="wait-init" ng-show="item.data.status == \'LOADFAIL\'"><span>图片信息读取失败，请删除后重新上传。</span></div><div class="wait-init upload" ng-show="item.data.status == \'UPLOAD\'"><span>图片上传中：{{item.data.per || 0}}%</span><div class="plugin-progress"><div class="upload-progress"><div class="upload-progress-bar success" ng-style="{\'width\':item.data.per * 4 + \'px\'}"></div></div></div></div><div class="image-success" ng-if="item.data.status == \'SUCCESS\'" ng-mouseover="item.editBtn = true" ng-mouseleave="item.editBtn = false"><div class="edit-btn" ng-show=""><a ng-click="item.editMode = true" ng-show="!item.editMode && item.editBtn === true">编辑</a></div><div class="edit-style" ng-show="item.editMode"><div class="title">图片样式：</div><span>宽度：<input type="text" ng-model="item.data.style.width" ng-change="changeStatus($index,\'NON-UPDATE\')" placeholder="默认宽度"></span><span>高度：<input type="text" ng-model="item.data.style.height" ng-change="changeStatus($index,\'NON-UPDATE\')" placeholder="默认高度"></span><a ng-click="item.editMode = false" class="close-btn">收起</a></div><span class="success-main"><img id="img-show-{{item.id}}" ng-src="{{item.data.url}}" zoom="item.data.style" config="item.config" ng-style="item.data.style"></span></div></div><div class="plugin-attach" id="attach-{{item.id}}" ng-show="item.type == \'attach\'"><div class="wait-init" ng-show="item.data.status == \'LOADING\'"><span>文件信息读取中</span></div><div class="wait-init" ng-show="item.data.status == \'LOADFAIL\'"><span>文件息读取失败，请删除后重新上传。</span></div><div class="wait-init upload" ng-show="item.data.status == \'UPLOAD\'"><span>文件上传中：{{item.data.per || 0}}%</span><div class="plugin-progress"><div class="upload-progress"><div class="upload-progress-bar success" ng-style="{\'width\':item.data.per * 4 + \'px\'}"></div></div></div></div><div ng-show="item.data.status == \'SUCCESS\'"><div class="file-collapse"><div class="head"><div class="icon"><i class="image-plugin-i-file"></i></div><div class="title"><a ng-bind="item.data.title + \'(\' + item.data.size + \')\'" title="{{item.data.title}}" ng-href="{{item.data.url}}"></a></div></div><div class="btn-grp"><span ng-show="transExecType[item.data.ext]"><a href="" ng-href="{{\'/course/document-preview.html?mark=\'+item.data.mark+\'&type=\'+transExecType[item.data.ext]+\'&count=\'+item.data.execInfo[transExecType[item.data.ext]].count}}" target="_blank" ng-show="item.data.exec === \'done\'">预览</a> <span class="exec" ng-show="item.data.exec === \'running\'"><img src="/course/imgs/loading-convert.gif" alt="">转码中</span> <span class="exec" ng-show="item.data.exec === \'error\'">转码失败</span> </span><a href="" ng-href="{{item.data.url}}" target="_blank">下载</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div></div></div><div class="plugin-flash" id="flash-{{item.id}}" ng-show="item.type == \'flash\'"><div ng-show="item.data.status == \'LOADING\'"><span>文件信息读取中</span></div><div ng-show="item.data.status == \'LOADFAIL\'"><span>文件信息读取失败，请删除后重新上传。</span></div><div class="wait-init upload" ng-show="item.data.status == \'UPLOAD\'"><span>文件上传中：{{item.data.per || 0}}%</span><div class="plugin-progress"><div class="upload-progress"><div class="upload-progress-bar success" ng-style="{\'width\':item.data.per * 4 + \'px\'}"></div></div></div></div><div ng-show="item.data.status == \'FAIL\'"><span>获取文件信息失败，请删除后重新上传。</span></div><div ng-show="item.data.status == \'SUCCESS\'"><div class="file-collapse" ng-if="!item.fileDis"><div class="head"><div class="icon"><i class="image-plugin-i-flash"></i></div><div class="title"><a ng-bind="item.data.title" title="{{item.data.title}}" ng-click="item.fileDis = true"></a></div></div><div class="btn-grp"><a href="" ng-click="item.fileDis = true">播放</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div><div class="file-expand" ng-if="item.fileDis"><p><a href="javascript:;" class="up" ng-click="item.fileDis = false"><span>收起</span> <i class="fa fa-arrow-circle-up"></i></a></p><p class="title" ng-bind="item.data.title" ng-show="item.data.title"></p><div ng-bind-html="item.data.bindHtml | html"></div></div></div></div><div class="plugin-exam" id="exam-{{item.id}}" ng-show="item.type == \'e_es\'"><div><div class="file-collapse"><div class="head"><div class="icon"><i class="image-plugin-i-paper" ng-show="item.data.type === \'e_paper\'"></i> <i class="image-plugin-i-test" ng-show="item.data.type === \'e_test\'"></i></div><div class="title"><a ng-bind="(item.data.type === \'e_paper\' ? \'试卷：\' : \'考试：\') + (item.data.title || \'未命名试卷\')" title="{{item.data.title}}" ng-href="{{\'/course/exam.html?aid=\'+item.data.aid+\'&preview=1\' + (item.data.type === \'e_test\' && item.data.tid ? (\'&tid=\' + item.data.tid) : \'\')}}" target="_blank"></a> <span class="paper-info" ng-show="item.data.ext">共{{item.data.ext.qCount}}题，<span ng-show="item.data.ext.time >= 1">{{item.data.type === \'e_paper\' ? \'建议\' : \'限时\'}}{{item.data.ext.time}}分钟，</span>总分{{item.data.ext.score}}分</span> <span class="paper-info" ng-show="item.data.type === \'e_test\' && item.data.ext">起：{{item.data.ext.startTime}} &nbsp;&nbsp;&nbsp;止：{{item.data.ext.endTime}}</span></div></div><div class="btn-grp"><a href="" ng-click="openPaper($index)">编辑</a> <a href="" ng-click="moveItem(item,$index,\'del\')">删除</a></div></div></div></div></div></div></div></div></div></div></div>',
        replace: "true",
        scope: {
            group: "=group",
            ctrl: "=ctrl",
            index: "=index",
            curInfo: '=focus',
            config: '='
        },
        controller: ['$timeout', '$scope', '$rootScope', '$element', '$sce', 'service', 'courseContent', function ($timeout, $scope, $rootScope, $element, $sce, service, courseContent) {

            $scope.items = $scope.group.items;

            //正则匹配
            var REG = {
                url: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/,
                tagVideo: /<video(.*)>[^<]*<\/video>/ig,
                tagEmbed: /<embed(.*)>/ig,
                tagFrame: /<iframe(.*)>[^<]*<\/iframe>/ig
            };


            //转码文件type转换
            $scope.transExecType = courseContent.convertExt.transExecType;
            $scope.getPreviewUrl = courseContent.transPreviewUrl;


            //========================初始化========================
            $scope.initItems = function () {

                angular.forEach($scope.items, function (item) {

                    item.ckContent = $sce.trustAsHtml(item.data ? item.data.content : '');
                    item.disContent = false;
                    item.url = '';
                    item.embedUrl = "";
                    item.config = {
                        mousewheelLock: false,
                        position: 'static',
                        ratioScaling: true,
                        minw: 100,
                        minh: 100,
                        mouseup: function () {
                            item.s = 'NON-UPDATE';
                        }
                    };
                });
            };
            $scope.initItems();

            $scope.$watchCollection('items', function (n) {
                $scope.initItems();
            });


            //-------------****-------------公用内容-------------****-------------
            /**
             * name更新时上报数据
             * @param index
             */
            $scope.dataEmit = function (index) {

                $scope.ctrl('emit', {
                    type: $scope.items[index].type, data: $scope.items[index], cb: function (rs) {
                        if (!rs.err) {
                            $scope.items[index].s = "NORMAL";
                        }
                    }
                });

            };


            /**
             * 移动元素
             * @param item
             * @param index
             * @param type
             */
            $scope.moveItem = function (item, index, type) {

                $scope.ctrl('move', {type: type, item: item, group: $scope.index, index: index});

            };


            /**
             * 更改item状态
             */
            $scope.changeStatus = function (index, s) {
                $scope.items[index].s = s;
            };

            /**
             * 更改item内容状态
             */
            $scope.changeStatusData = function (index, s) {
                $scope.items[index].data.status = s;
            };

            /**
             * 关联页面内html
             * @param index
             * @param content
             * @returns {*}
             */
            $scope.deliberatelyTrustDangerousSnippet = function (index, content) {
                if ($scope.items[index].disContent) {
                    return;
                }

                return $sce.trustAsHtml(content);
            };


            /**
             * 更改聚焦元素
             * @param group
             * @param index
             */
            $scope.changeCurFocus = function (group, index) {
                //$scope.curFocusItem = index;
                $scope.curInfo.group = group;
                $scope.curInfo.index = index;
            };
            //-------------****-------------公用内容-------------****-------------


            //=========================练习=========================
            $scope.openPaper = function (index) {
                var item = $scope.items[index];
                $scope.ctrl('openPaper', item);
            };


            //=========================内容=========================

            $scope.activeEditor = function (index) {

                //console.log($scope.items[index].data.content);

            };


            //=========================网络视频=========================
            $scope.confirmEmbed = function (index) {
                if ($scope.items[index].embedUrl == '') {
                    service.dialog.alert("请输入网络视频代码");
                    return;
                }
                if (!$scope.items[index].embedUrl.match(REG.tagFrame) && !$scope.items[index].embedUrl.match(REG.tagEmbed) && !$scope.items[index].embedUrl.match(REG.tagVideo)) {
                    service.dialog.alert("只支持video、iframe、embed格式的视频代码");
                    return;
                }

                var e = $($scope.items[index].embedUrl);
                e.attr('style', 'width: 640px;height :360px;');
                $scope.items[index].data.url = e[0].outerHTML;
                $scope.dataEmit(index);
                $scope.items[index].fileDis = true;
                $scope.items[index].data.status = 'SUCCESS';
            };
            $scope.editEmbed = function (index) {
                $scope.items[index].embedUrl = $scope.items[index].data.url;
                $scope.changeStatusData(index, 'EDIT');
            };


            //=========================链接=========================
            $scope.confirmLink = function (index) {
                if ($scope.items[index].url == '') {
                    service.dialog.alert("请输入链接地址");
                    return;
                }

                var protocol = '';
                if ($scope.items[index].url.indexOf('http://') < 0 && $scope.items[index].url.indexOf('https://') < 0 && $scope.items[index].url.indexOf('ftp://') < 0) {
                    protocol = 'http://';
                }

                $scope.items[index].data.url = protocol + $scope.items[index].url;

                if (!$scope.items[index].data.title) {
                    $scope.items[index].data.title = $scope.items[index].data.url;
                }
                $scope.dataEmit(index);
                $scope.items[index].data.status = 'SUCCESS';
            };
            $scope.editLink = function (index) {
                $scope.items[index].url = $scope.items[index].data.url;

                if ($scope.items[index].title === $scope.items[index].url) {
                    $scope.items[index].title = '';
                }

                $scope.changeStatusData(index, 'EDIT');
            };


            //=========================Flash=========================
            //$scope.$watch('group.items',function(n){
            //    console.log(n,o)
            //    angular.forEach(n,function(item){
            //
            //        //if(item.type == 'image'){
            //        //    item.config = {
            //        //        mousewheelLock:false,
            //        //        position: 'static',
            //        //        ratioScaling: true,
            //        //        minw: 100,
            //        //        minh: 100,
            //        //        mouseup: function (){
            //        //            item.s = 'NON-UPDATE';
            //        //        }
            //        //    };
            //        //}
            //    });
            //});


        }]
    }
});