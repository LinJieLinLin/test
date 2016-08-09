/**
 * Created by Fox2081 on 2015/11/10.
 */

module.directive('contentEdit', function () {
    return {
        restrict: 'E',
        template:'<div class="edit-w content-n"><div class="loading-layer" id="loading-layer" ng-show="loading"><span class="loading-circle loading-amit-spin"></span></div><div class="ew-h con"><div class="list-ac"><div class="block-grp"><div class="bw"><a href="javascript:;" class="return-b back" ng-click="back()"><p class="ic"><i class="image-con-head-back"></i></p><p>返回</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="overview-b"><p class="ic"><i class="image-con-head-dir"></i></p><p>目录</p></a></div></div><div class="grp" ng-show="config.mark === \'dir\'"><div class="block-grp"><div class="bw"><a href="javascript:;" ng-click="newItem({type:\'T1\',index:curItemIndex.index + 1})"><p class="ic"><i class="image-con-head-t1"></i></p><p>添加章</p></a></div></div><div class="block-grp" ng-click="newItem({type:\'T2\',index:curItemIndex.index + 1})"><div class="bw"><a href="javascript:;"><p class="ic"><i class="image-con-head-t2"></i></p><p>添加节</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="newItem({type:\'image\',index:curItemIndex.index + 1})"><p class="ic"><i class="image-con-head-pic"></i></p><p>插入图片</p><div class="up-i"><div class="li">插入图片</div><div class="li">支持Png、Jpg、Jpeg、Bmp、Gif格式</div></div></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="newItem({type:\'text\',index:curItemIndex.index + 1})"><p class="ic"><i class="image-con-head-content"></i></p><p>添加内容</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="addExam(\'test\')"><p class="ic"><i class="image-con-head-paper"></i></p><p>插入试卷</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="up-panel down-list-h"><p class="ic"><i class="image-con-head-more"></i></p><p>更多</p><div class="down-list"><ul><li ng-click="newItem({type:\'image\',index:curItemIndex.index + 1})" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-pic"></i></div>插入图片<div class="up-i-s"><div class="li">插入图片</div><div class="li">支持Png、Jpg、Jpeg、Bmp、Gif格式</div></div></li><li ng-click="newItem({type:\'text\',index:curItemIndex.index + 1})" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-content"></i></div>添加内容</li><li ng-click="addExam(\'test\')" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-p1"></i></div>插入试卷</li><li ng-click="newItem({type:\'attach\',index:curItemIndex.index + 1})"><div class="img-p"><i class="image-con-s-file"></i></div>添加附件<div class="up-i-s"><div class="li">添加附件</div><div class="li">支持文件的下载或预览；支持的预览文件格式主要有Doc/Docx、Ppt/Pptx、Pdf。</div></div></li><li ng-click="newItem({type:\'link\',index:curItemIndex.index + 1})"><div class="img-p"><i class="image-con-s-link"></i></div>添加链接</li><li ng-click="newItem({type:\'embed\',index:curItemIndex.index + 1})"><div class="img-p"><i class="image-con-s-movie-ext"></i></div>网上视频</li><li ng-click="newItem({type:\'video\',index:curItemIndex.index + 1})"><div class="img-p"><i class="image-con-s-movie-loc"></i></div>本地视频<div class="up-i-s"><div class="li">上传本地视频</div><div class="li">支持wmv、rm、rmvb、mpg、mpeg、mpe、3gp、mov、mp4、m4v、avi、mkv、flv、vob格式的视频文件</div><div class="li">视频大小不能超过2G</div></div></li><li ng-click="newItem({type:\'flash\',index:curItemIndex.index + 1})"><div class="img-p"><i class="image-con-s-flash"></i></div>添加Flash</li></ul></div></a></div></div></div><div class="grp" ng-show="config.mark === \'intro\'"><div class="block-grp" ng-click="newItem({type:\'T1\',index:curItemIndex.index + 1})"><div class="bw"><a href="javascript:;"><p class="ic"><i class="image-con-head-t"></i></p><p>插入标题</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" ng-click="newItem({type:\'image\',index:curItemIndex.index + 1})"><p class="ic"><i class="image-con-head-pic"></i></p><p>插入图片</p><div class="up-i"><div class="li">插入图片</div><div class="li">支持Png、Jpg、Jpeg、Bmp、Gif格式</div></div></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" ng-click="newItem({type:\'text\',index:curItemIndex.index + 1})"><p class="ic"><i class="image-con-head-content"></i></p><p>添加内容</p></a></div></div></div><div class="grp"><div class="seq"></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="save-b" ng-click="saveContent()"><p class="ic"><i class="image-con-head-save"></i></p><p>保存</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="" target="_blank" ng-href="{{previewUrl()}}"><p class="ic"><i class="image-con-head-preview"></i></p><p>预览</p></a></div></div><div class="seq"></div></div><div class="grp"><div class="block_new ck-tool-bar" ng-class="ckToolPosMode"><div id="topEditor-{{config.mark}}" class="top-editor"></div></div></div></div><div class="ew-m con"><div class="ew-list"><a href="javascript:;" class="close-b" title="隐藏"><i class="image-con-dir-close"></i></a><div class="h"><span>课程目录</span></div><div class="l dir"><div class="l-c"><div class="tree-line"></div><ul><li class="option" ng-repeat="item in cat.items track by $index" ng-show="item.type == \'T1\' || item.type == \'T2\'"><div class="icon"><i class="image-con-dir-t1" ng-show="item.type == \'T1\'"></i> <i class="image-con-dir-t2" ng-show="item.type == \'T2\'"></i></div><a ng-show="item.type == \'T1\'" ng-click="gotoGrpItem(item.id)" title="{{item.title}}" class="section-context first">{{item.title}}</a> <a ng-show="item.type == \'T2\'" ng-click="gotoGrpItem(item.id)" title="{{item.title}}" class="section-context second">{{item.title}}</a></li></ul></div></div></div><div class="ew-word" id="{{contentEwId}}"><div class="m w-ck dir"><div class="un-support" ng-show="unSupport"><div>{{unSupport}}</div></div><div ng-repeat="group in content.groups track by $index"><content-group group="group" ctrl="containerCtrl" index="$index" config="config" focus="curItemIndex"></content-group></div></div></div></div><div class="upload-area"><input type="file" id="{{uploadInputId}}"></div></div></div>',
        replace: "true",
        scope: {
            config: "="
        },
        controller: ['$compile', '$interval', '$timeout', '$log', '$scope', '$rootScope', '$resource', '$location', 'courseContent', 'service', function ($compile, $interval, $timeout, $log, $scope, $rootScope, $resource, $location, courseContent, service) {


            var uploadUrl = DYCONFIG.fs.upload;

            if ($scope.config) {
                $scope.config.scope = $scope;
            } else {
                return;
            }


            //分页
            var itemPage = {
                per: 10    //每页数据限制
            };

            $scope.configInfo = {
                'dir': {
                    t: "请输入章名称",
                    name: "课程内容",
                    refTgt: 'getCourseDirNew',
                    previewUrl: function () {
                        return rcpAid.getUrl('学习页', '?cid=' + $rootScope.cid);
                    }
                },
                'intro': {
                    t: "请输入标题名称",
                    name: "课程简介",
                    refTgt: 'getCourseIntroNew',
                    previewUrl: function () {
                        return rcpAid.getUrl('课程详情', '?cid=' + $rootScope.cid);
                    }
                }
            };

            //loading
            $scope.loading = true;

            //内容ID
            $scope.aid = "";

            //上传文件input
            $scope.uploadInputId = 'courseEditUploadFile-' + $scope.config.mark;

            //lazyId
            $scope.contentEwId = 'contentEditEw-' + $scope.config.mark;

            //文件系统请求地址
            $scope.uploadUrl = {
                'upload': uploadUrl,
                'fileDetail': uploadUrl + 'fileDetail',
            };


            $scope.statusList = {
                "EDIT": null,
                "VIEW": null,
                "PREVIEW": null
            };
            $scope.curStatus = "EDIT";

            $scope.curFocusItem = 0;
            $scope.curItemIndex = {
                group: 0,
                index: $scope.curFocusItem
            };

            $scope.itemStatusList = {
                "NORMAL": {
                    name: "正常"
                },
                "NON-UPDATE": {
                    name: "未保存"
                },
                "NON-UPLOAD": {
                    name: "未上传"
                }
            };

            $scope.content = {
                groups: [],
                items: []
            };

            $scope.numOnce = 10;   //每次向下加载数量


            $scope.testContent = '';
            //$scope.testContent = '<p>请在这里输入课程内容</p><p></p><p></p><p></p>';

            //ITEM示例数据
            $scope.egItems = {
                "文档内容": {
                    t: "text",
                    c: {
                        c: "<p>示例内容</p>"
                    }
                },
                "练习试卷": {
                    t: "practise",
                    c: {
                        d: {
                            "bankId": 54748,
                            "name": "课程评测新增试卷",
                            "tag": "",
                            "desc": "",
                            "score": 0,
                            "id": 9263,
                            "p2bId": 10650,
                            "start": 0,
                            "isOwn": true,
                            "uid": 200097
                        }
                    }
                },
                "网络视频": {
                    t: "embed",
                    c: {
                        title: "名称",
                        url: "<iframe>示例视频</iframe>",
                        style: {
                            width: "640",
                            height: "360",
                        }
                    }
                },
                "本地图片": {
                    t: "image",
                    c: {
                        title: "名称",
                        fid: 41897,
                        url: "http://14.23.162.172:19503/C66FD84781CDFAAD1119B86583D3D760.jpg",
                        style: {
                            width: "640",
                            height: "360",
                        }
                    }
                },
                "本地视频": {
                    t: "video",
                    c: {
                        title: "名称",
                        fid: 41897,
                        url: "http://14.23.162.172:19503/C66FD84781CDFAAD1119B86583D3D760.mp4",
                        style: {
                            width: "640",
                            height: "360",
                        }
                    }
                },
                "下载附件": {
                    t: "attach",
                    c: {
                        title: "名称",
                        size: null,
                        type: null,
                        fid: 41897,
                        url: "http://14.23.162.172:19503/C66FD84781CDFAAD1119B86583D3D760.mp4",
                    }
                },
                "链接": {
                    t: "link",
                    c: {
                        title: "名称",
                        url: "http://14.23.162.172:19503/C66FD84781CDFAAD1119B86583D3D760.mp4",
                    }
                }
            };

            $scope.plugins = {
                'text': {
                    status: true,
                    type: "content",
                    data: {
                        id: 312,
                        name: "测试内容",
                        content: $scope.testContent,
                    },
                    scope: null
                },
                'practice': {
                    type: "practice",
                    data: {
                        id: "3322211",
                        name: "测试试卷"
                    },
                    scope: null
                },
                'payArea': {
                    status: true,
                    type: "payArea",
                    data: {
                        id: "3322211",
                        name: "新增付费区域",
                        items: []
                    },
                    scope: null
                },
                'video': {
                    status: true,
                    type: "video",
                    data: {
                        id: "",
                        status: "BLANK",
                        name: "请输入网络视频地址"
                    },
                    scope: null
                },
                'embed': {
                    status: true,
                    type: "embed",
                    data: {
                        id: "",
                        status: "BLANK",
                        name: ""
                    },
                    scope: null
                },
                'T1': {
                    status: true,
                    type: "T1",
                    data: {
                        id: "3322211",
                        name: "新建章"
                    },
                    content: [],
                    childItems: []
                },
                'T2': {
                    status: true,
                    type: "T2",
                    data: {
                        id: "3322211",
                        name: "新建节"
                    },
                    content: [],
                    childItems: []
                },
            };

            $scope.getPlugin = function (arg_type, arg_content) {
                var data = $scope.plugins[arg_type];

                if (!data) {
                    return;
                }

                data.id = Date.parse(new Date());
                if (arg_content) {
                    data.data.content = arg_content;
                }

                return angular.copy(data);
            };


            /**
             * 更改聚焦元素
             * @param group
             * @param index
             */
            $scope.changeCurFocus = function (group, index) {
                //$scope.curFocusItem = index;
                $scope.curItemIndex.group = group;
                $scope.curItemIndex.index = index;
            };


            /**
             * 获取全局元素所处位置index
             * @param group
             * @param index
             */
            $scope.getDeepIndex = function (group, index) {
                var rs = 0;
                for (var i = 0; i < group; i++) {
                    rs = rs + $scope.content.groups[i].ids.length;
                }
                return rs + index;
            };


            //是否立即添加的元素
            var iInsertT = {
                'T1': true,
                'T2': true,
                'link': true,
                'text': true,
                'e_es': true,
                'embed': true,
                'practice': false,
                'video': false,
                'image': false,
                'attach': false,
            };

            /**
             * 新增元素
             * @param newData
             * @param group
             * @param index
             */
            $scope.insertItem = function (newData, group, index) {

                if (!$scope.content.groups.length) {
                    $scope.addGroup();
                }

                var pos = $scope.getDeepIndex(group, index);
                var nId = art.addItem(newData, pos);
                var item = $scope.makePlugin(nId, newData, 'insert');
                $scope.content.groups[group].items.splice(index, 0, item);
                $scope.content.groups[group].ids.splice(index, 0, nId);

                if (!$scope.content.groups[group].dis) {
                    $scope.content.groups[group].dis = true;
                }

                //$scope.content.items.splice(index, 0, $scope.makePlugin(nId, newData));
                $scope.curItemIndex.index = index;
                //$scope.gotoLoc('container-'+nId)
                $scope.gotoLoc('main-content-' + nId)
                $scope.refCat();
                $scope.refItems();

                $timeout(function () {
                    if (item.type === 'e_es') {
                        $scope.containerCtrl('openPaper',item);
                    }
                });

                return nId;
            };

            /**
             * 新增元素
             * @param args
             * @param data
             */
            $scope.newItem = function (args, data) {
                // {
                //     type: <string>,      //类型
                //     level: <integer>,    //层级 1为一级标题，2为2级标题
                //     first: <integer>,    //父级层级的序列号
                //     second: <integer>,   //子级层级的序列号
                //     index: <integer>,    //所在内容组序列号
                // }

                var mark = args.type + '-' + $scope.aid + '-' + new Date().getTime();

                if (args.type == 'T1') {
                    var newData = {
                        t: args.type,
                        c: {
                            title: $scope.configInfo[$scope.config.mark].t,
                        },
                        g: "_"
                    };
                } else if (args.type == 'T2') {
                    var newData = {
                        t: args.type,
                        c: {
                            title: "请输入节名称",
                        },
                        g: "_"
                    };
                } else if (args.type == 'text') {
                    var newData = {
                        t: args.type,
                        c: {
                            c: $scope.testContent,
                        },
                        g: "_"
                    };
                } else if (args.type == 'e_es') {
                    var newData = {
                        t: args.type,
                        c: {
                            aid: data.aid,
                            tid: null,
                            type: "e_paper",
                            desc: "",
                            title: '未命名试卷',
                            d: {
                                "oid": $rootScope.cid,
                                "time": 0,  //建议时长
                            },
                        },
                        g: "_"
                    };
                    
                } else if (args.type == 'link') {
                    var newData = {
                        t: args.type,
                        c: {
                            title: "",
                            url: "",
                            status: "EDIT",
                        },
                        g: "_"
                    };
                } else if (args.type == 'embed') {
                    var newData = {
                        t: args.type,
                        c: {
                            title: "",
                            url: "",
                            status: "EDIT",
                            style: {
                                width: "640",
                                height: "360",
                            }
                        },
                        g: "_"
                    };
                } else if (args.type == 'image') {
                    var newData = {
                        t: args.type,
                        c: {
                            mark: mark,
                            status: 'UPLOAD',
                            title: "本地图片",
                            fid: null,
                            url: "",
                            pubUrl: '',
                            style: {}
                        },
                        g: "_"
                    };

                    $scope.upload(newData, $scope.curItemIndex.group, args.index);
                } else if (args.type == 'video') {
                    var newData = {
                        t: args.type,
                        c: {
                            mark: mark,
                            status: 'UPLOAD',
                            title: "本地视频",
                            fid: null,
                            url: "",
                            style: {
                                width: "640",
                                height: "360",
                            }
                        },
                        g: "_"
                    };

                    $scope.upload(newData, $scope.curItemIndex.group, args.index);
                } else if (args.type == 'attach') {
                    var newData = {
                        t: args.type,
                        c: {
                            mark: mark,
                            status: 'UPLOAD',
                            title: "附件",
                            fid: null,
                            url: "",
                        },
                        g: "_"
                    };

                    $scope.upload(newData, $scope.curItemIndex.group, args.index);
                } else if (args.type == 'flash') {
                    var newData = {
                        t: args.type,
                        c: {
                            mark: mark,
                            status: 'UPLOAD',
                            title: "Flash",
                            fid: null,
                            url: "",
                        },
                        g: "_"
                    };

                    $scope.upload(newData, $scope.curItemIndex.group, args.index);
                } else {
                    return;
                }
                if (iInsertT[args.type]) {
                    $scope.insertItem(newData, $scope.curItemIndex.group, args.index)
                }

            };

            /**
             * 移动元素
             * @param item
             * @param index
             * @param type
             */
            $scope.moveItem = function (item, index, type) {

                if ((type === 'up' && index == 0) || (type === 'down' && index == $scope.content.items.length - 1)) {
                    return
                }

                var target = $scope.content.items[index];
                if (!angular.isUndefined(target.disContent)) {
                    target.disContent = false;
                }
                if (type == 'up') {
                    art.moveItem3(item.id, true);
                    $scope.content.items.splice(index, 1);
                    $scope.content.items.splice(index - 1, 0, target);
                    $scope.refCat();
                }
                if (type == 'down') {
                    art.moveItem3(item.id, false);
                    $scope.content.items.splice(index, 1);
                    $scope.content.items.splice(index + 1, 0, target);
                    $scope.refCat();
                }
                if (type == 'del') {
                    art.removeItem(item.id);
                    $scope.content.items.splice(index, 1);
                    $scope.refCat();
                }

            };

            /**
             * 获取前一个/后一个非空组
             * @param act
             * @param index
             */
            $scope.getNonEmptyGrp = function (act, index) {
                var begin = 0;
                var end = index;
                if (act === 'up') {
                    for (var i = end; i >= begin; i--) {
                        if ($scope.content.groups[i].ids.length > 0) {
                            return $scope.content.groups[i];
                        }
                    }
                } else {
                    begin = index;
                    end = $scope.content.groups.length - 1;
                    for (var i = begin; i <= end; i++) {
                        if ($scope.content.groups[i].ids.length > 0) {
                            return $scope.content.groups[i];
                        }
                    }
                }
                return false;
            };

            /**
             * 移动组元素
             * @param item
             * @param index
             * @param group
             * @param type
             */
            $scope.moveGroupItem = function (type, item, group, index) {

                var targetGrp = $scope.content.groups[group];
                var target = targetGrp.items[index];
                if (!angular.isUndefined(target.disContent)) {
                    target.disContent = false;
                }

                if ((type === 'up' && index == 0 && group == 0) || (type === 'down' && index == targetGrp.items.length - 1 && group == $scope.content.groups.length - 1)) {
                    return;
                }

                if (type === 'up' && index == 0) {
                    var aimGrp = $scope.getNonEmptyGrp(type, group - 1);
                    if (aimGrp) {
                        art.moveItem3(item.id, true);
                        targetGrp.items.splice(index, 1);
                        targetGrp.ids.splice(index, 1);
                        aimGrp.items.splice(aimGrp.items.length - 1, 0, target);
                        aimGrp.ids.splice(aimGrp.ids.length - 1, 0, target.id);
                        $scope.refCat();
                    }
                    return;
                }

                if (type === 'down' && index == targetGrp.ids.length - 1) {
                    var aimGrp = $scope.getNonEmptyGrp(type, group + 1);
                    if (aimGrp) {
                        art.moveItem3(item.id, false);
                        targetGrp.items.splice(index, 1);
                        targetGrp.ids.splice(index, 1);
                        aimGrp.items.splice(1, 0, target);
                        aimGrp.ids.splice(1, 0, target.id);
                        $scope.refCat();
                    }
                    return;
                }

                if (type == 'up') {
                    art.moveItem3(item.id, true);
                    targetGrp.items.splice(index, 1);
                    targetGrp.ids.splice(index, 1);
                    targetGrp.items.splice(index - 1, 0, target);
                    targetGrp.ids.splice(index - 1, 0, target.id);
                    $scope.refCat();
                }
                if (type == 'down') {
                    art.moveItem3(item.id, false);
                    targetGrp.items.splice(index, 1);
                    targetGrp.ids.splice(index, 1);
                    targetGrp.items.splice(index + 1, 0, target);
                    targetGrp.ids.splice(index + 1, 0, target.id);
                    $scope.refCat();
                }
                if (type == 'del') {
                    art.removeItem(item.id);
                    targetGrp.items.splice(index, 1);
                    targetGrp.ids.splice(index, 1);
                    $scope.refCat();
                }

            };


            /**
             * 刷新目录
             */
            $scope.refCat = function () {
                $scope.idsCat = art.findIids({
                    "T": 1,
                    "T1": 1,
                    "T2": 1,
                });
                var arr = [];
                console.log($scope.idsCat)
                for (var i = 0; i < $scope.idsCat.length; i++) {
                    var item = art.findItem($scope.idsCat[i], 1, 1);
                    if (!item || !item.visiable) {
                    } else {
                        arr.push({
                            id: $scope.idsCat[i],
                            title: item.c.title,
                            type: item.t
                        });
                    }
                }
                $scope.cat.items = arr;

                $scope.$emit($scope.configInfo[$scope.config.mark].refTgt, arr);
            };

            /**
             * 刷新全部内容ID
             */
            $scope.refItems = function () {
                $scope.idsContent = art.findIids();
            };

            /**
             * 获取页面ITEM  by ID
             * @param id
             * @returns {*}
             */
            $scope.getItemById = function (id) {
                for (var i = 0; i < $scope.content.groups.length; i++) {
                    for (var j = 0; j < $scope.content.groups[i].items.length; j++) {
                        if ($scope.content.groups[i].items[j].id == id) {
                            return $scope.content.groups[i].items[j];
                        }
                    }
                }


                //for (var i = 0; i < $scope.content.items.length; i++) {
                //    if ($scope.content.items[i].id == id) {
                //        return $scope.content.items[i];
                //    }
                //}
            };

            /**
             * 获取页面ITEM及分组信息  by ID
             * @param id
             * @returns {*}
             */
            $scope.getItemInfoById = function (id) {
                var rs = {
                    id: null,
                    group: 0,
                    index: 0
                };

                for (var i = 0; i < $scope.content.groups.length; i++) {
                    for (var j = 0; j < $scope.content.groups[i].ids.length; j++) {
                        if ($scope.content.groups[i].ids[j] == id) {
                            rs.id = $scope.content.groups[i][j];
                            rs.group = i;
                            rs.index = j;
                            break;
                        }
                    }
                }

                return rs;
            };

            /**
             * 获取页面ITEM  by p2bId
             * @param id
             * @returns {*}
             */
            $scope.getItemByPid = function (id) {
                for (var i = 0; i < $scope.content.groups.length; i++) {
                    for (var j = 0; j < $scope.content.groups[i].items.length; j++) {
                        var item = $scope.content.groups[i].items[j];
                        if (item.type == 'e_es' && item.data.aid == id) {
                            return item;
                        }
                    }
                }
            };

            /**
             * 获取页面ITEM  by  Mark
             * @param mark
             * @returns {*}
             */
            $scope.getItemByMark = function (mark) {
                for (var i = 0; i < $scope.content.groups.length; i++) {
                    for (var j = 0; j < $scope.content.groups[i].items.length; j++) {
                        var item = $scope.content.groups[i].items[j];
                        if (item.data.mark && item.data.mark === mark) {
                            return item;
                        }
                    }
                }
            };

            /**
             * 新增group
             */
            $scope.addGroup = function () {
                $scope.content.groups.push({
                    ids: [],
                    items: []
                });
            };

            /**
             * 初始化目录
             */
            $scope.cat = {
                items: []
            };
            $scope.makeCat = function (tids, arr) {

                art.next(tids).done(function (tart, data) {

                    for (var i = 0; i < tids.length; i++) {
                        var item = art.findItem(tids[i], 1, 1);
                        if (!item || !item.visiable) {

                        } else {
                            arr.push({
                                id: tids[i],
                                title: item.c.title,
                                type: item.t
                            });
                        }
                        if (tart.art.items[tids[i]]) {
                            continue;
                        }
                        if (tart.einfo[tids[i]]) {
                            continue;
                        }
                    }
             
                    $scope.$emit($scope.configInfo[$scope.config.mark].refTgt, arr);

                }).fail(function (err, xhr) {

                });
            };

            /**
             * 构建组件内容
             * @param id
             * @param item
             * @param opt
             * @returns {*}
             */
            $scope.makePlugin = function (id, item, opt) {

                var rs = {
                    id: id,
                    type: item.t,
                    scope: $scope.itemScope,
                    fileDis: opt === 'insert'
                };

                if (item.t == 'T' || item.t == 'T1') {
                    rs.data = {
                        title: item.c.title
                    };
                } else if (item.t == 'T2') {
                    rs.data = {
                        title: item.c.title
                    };
                } else if (item.t == 'text') {
                    rs.data = {
                        content: item.c.c
                    };
                } else if (item.t == 'e_es') {
                    rs.data = {
                        aid: item.c.aid,
                        tid: item.c.tid,
                        type: item.c.type,
                        desc: item.c.desc,
                        title: item.c.title,
                        ext: item.c.ext,
                        data: item.c.d
                    };
                } else if (item.t == 'link') {
                    rs.data = {
                        mark: item.c.mark,
                        title: item.c.title,
                        url: item.c.url,
                        status: item.c.status,
                    };
                } else if (item.t == 'embed') {
                    rs.data = {
                        mark: item.c.mark,
                        title: item.c.title,
                        url: item.c.url,
                        status: item.c.status,
                        style: item.c.style
                    };
                } else if (item.t == 'image') {
                    rs.data = {
                        mark: item.c.mark,
                        url: item.c.url,
                        pubUrl: item.c.pubUrl,
                        title: item.c.title,
                        size: item.c.size,
                        ext: item.c.ext,
                        status: item.c.status,
                        style: item.c.style
                    };
                } else if (item.t == 'video') {
                    rs.data = {
                        mark: item.c.mark,
                        url: item.c.url,
                        title: item.c.title,
                        size: item.c.size,
                        ext: item.c.ext,
                        exec: item.c.exec || 'none',
                        execInfo: item.c.execInfo || undefined,
                        status: item.c.status,
                        style: item.c.style
                    };
                } else if (item.t == 'attach') {
                    rs.data = {
                        mark: item.c.mark,
                        url: item.c.url,
                        title: item.c.title,
                        size: item.c.size,
                        ext: item.c.ext,
                        exec: item.c.exec || 'none',
                        execInfo: item.c.execInfo || undefined,
                        type: item.c.type,
                        status: item.c.status
                    };
                } else if (item.t == 'flash') {
                    rs.data = {
                        mark: item.c.mark,
                        url: item.c.url,
                        title: item.c.title,
                        size: item.c.size,
                        ext: item.c.ext,
                        type: item.c.type,
                        status: item.c.status
                    };
                }

                return rs;
            };


            /**
             * 初始化课程内容
             * @param tids
             * @param arr
             */
            $scope.makeContent = function (tids) {

                $scope.content.groups = [];

                for (var i = 0; i < tids.length; i++) {
                    if (i == 0 || (i + 1) % itemPage.per === 0) {
                        $scope.addGroup();
                    }
                    $scope.content.groups[$scope.content.groups.length - 1].ids.push(tids[i]);
                }
            };


            /**
             * 修改当前目录信息
             */
            $scope.refCatLoc = function (item) {
                for (var i = 0; i < $scope.cat.items.length; i++) {
                    if ($scope.cat.items[i].id === item.id && !angular.isUndefined(item.data.title)) {
                        $scope.cat.items[i].title = item.data.title;
                    }
                }
            };


            /**
             * 格式化ITEM内容data
             * @param item
             */
            $scope.formatItemData = function (item) {
                var rs = item.data;
                if (item.type == 'text') {
                    rs = {
                        c: item.data.content
                    }
                }
                if (item.type == 'practise') {
                    rs = {
                        d: item.data
                    }
                }
                return rs;
            };

            /**
             * 格式化ITEM内容
             * @param item
             * @returns {{t: *, c: *, g: *}}
             */
            $scope.formatItem = function (item) {
                return {
                    t: item.type,
                    c: $scope.formatItemData(item),
                    g: item.g,
                };
            };

            /**
             * 更新组件
             */
            $scope.updateItem = function (data, cb) {
                if (!data) {
                    return;
                }
                var item = art.findItem(data.id);   //获取wcms中的Item
                var tgt = $scope.formatItem(data);
                if (item && tgt && item.c && tgt.c) {
                    item.c = $scope.formatItem(data).c;  //修改Item内容
                } else {
                    console.log('ERROR????????',item,tgt)
                    return;
                }
                art.updateItem(data.id, item);     //更新Item
                if (!art.isUpdated() || art.isUpdated_()) {
                    cb({err: true});
                    window.resm = "testupdate1 check updated error 2...";
                } else {
                    cb({err: false});
                }

            };

            /**
             * 保存试卷
             * @param info
             */
            $scope.savePaper = function (info) {
                var item = $scope.getItemByPid(info.aid);

                console.log(info, item)
                item.data.title = info.title;
                item.data.type = info.type;
                item.data.tid = info.tid;
                item.data.desc = info.desc;
                item.data.ext = info.ext;
                $scope.updateItem(item, function () {});

                //自动保存内容
                $scope.saveContent(true);
            };

            /**
             * 回到内容
             * @param info
             */
            $scope.backToContent = function (info) {
                console.log(info)
                if (info && info.aid) {
                    var item = $scope.getItemByPid(info.aid);
                    $scope.gotoLoc('main-content-' + item.id, 0);
                }
            };

            /**
             * 组件事件处理
             * @type {{emit: $scope.itemScope.emit}}
             */
            $scope.itemScope = {
                emit: function (act, data, cb) {
                    switch (act) {
                        case "T1":
                            $scope.refCatLoc(data);
                            $scope.updateItem(data, cb);
                            break;
                        case "T2":
                            $scope.refCatLoc(data);
                            $scope.updateItem(data, cb);
                            break;
                        case "text":
                            $scope.updateItem(data, cb);
                            break;
                        case "link":
                            $scope.updateItem(data, cb);
                            break;
                        case "embed":
                            $scope.updateItem(data, cb);
                            break;
                        case "image":
                            $scope.updateItem(data, cb);
                            break;
                        default:
                            return;
                    }
                }
            };


            /**
             * 内容控制
             * @param act
             * @param item
             */
            var doneItems = {};
            $scope.containerCtrl = function (act, item) {

                //更新内容
                if (act === 'emit') {
                    switch (item.type) {
                        case "T1":
                            $scope.refCatLoc(item.data);
                            $scope.updateItem(item.data, item.cb);
                            break;
                        case "T2":
                            $scope.refCatLoc(item.data);
                            $scope.updateItem(item.data, item.cb);
                            break;
                        case "text":
                            $scope.updateItem(item.data, item.cb);
                            break;
                        case "link":
                            $scope.updateItem(item.data, item.cb);
                            break;
                        case "embed":
                            $scope.updateItem(item.data, item.cb);
                            break;
                        case "image":
                            $scope.updateItem(item.data, item.cb);
                            break;
                        default:
                    }
                }

                //移动ITEM
                if (act === 'move') {
                    $scope.moveGroupItem(item.type, item.item, item.group, item.index);
                }
                
                //编辑试卷
                if (act === 'openPaper') {
                    $scope.config.openPaper(item);
                }

            };


            /**
             * 加载组内容
             * @param index
             * @param tgtLoc
             */
            $scope.getItems = function (index, tgtLoc) {

                if ($scope.content.groups[index].dis) {
                    return;
                }

                if (angular.isUndefined($scope.content.groups[index])) {
                    return;
                }

                var items = $scope.content.groups[index].ids;

                art.next(items).done(function (tart, data) {
                    var idMap = {};
                    var fileArr = {};
                    var markArr = [];
                    for (var i = 0; i < items.length; i++) {
                        var itemData = art.findItem(items[i], 1, 1);
                        if (itemData.t && itemData.visiable) {
                            var item = $scope.makePlugin(items[i], itemData);
                            idMap[items[i]] = item;
                            if (!angular.isUndefined(item.data) && item.data.mark) {
                                // item.data.status = 'LOADING';
                                fileArr[item.data.mark] = {
                                    id: items[i],
                                    item: item,
                                    mark: item.data.mark
                                };
                                markArr.push(item.data.mark);
                            }
                        }
                    }

                    if (markArr.length) {
                        uploadFile.transMarkUrl(fileArr, fileArr);
                    }

                    angular.forEach(items, function (item) {
                        if (idMap[item]) {
                            $scope.content.groups[index].items.push(idMap[item]);
                        }
                    });

                    $scope.content.groups[index].dis = true;

                    //跳转到对应ITEM
                    if (tgtLoc) {
                        $scope.gotoLoc(tgtLoc);
                    }

                    $scope.$apply();
                }).fail(function (err, xhr) {
                    window.resm = err;
                });
            };

            var art = null;
            $scope.idsCat = [];        //目录ID列表
            $scope.idsContent = [];   //元素ID列表


            /**
             * 上传资源
             */
            var uer = new jswf.Uer($scope.uploadUrl.upload, {
                m: "C",
                token: rcpAid.getToken()
            }, true);

            var uploadFile = {

                picArr: ["png", "jpg", "bmp", "gif", "jpeg", "PNG", "JPG", "BMP", "GIF", "JPEG"],
                //videoArr: ["mp4", "flv", "avi"],
                // videoArr: ["mp4"],
                videoArr: ['wmv', 'rm', 'rmvb', 'mpg', 'mpeg', 'mpe', '3gp', 'mov', 'mp4', 'm4v', 'avi', 'mkv', 'flv', 'vob'],
                docArr: ["doc", "docx", "pdf", "ppt", "pptx"],
                specialArr: ['swf'],

                maxSize: 2147483648,

                //视频文件处理
                fileList: {},


                judgeFileConvert: function (ext) {

                },


                //获取mark拼接url
                transMarkUrl: function (fileArr, markList) {

                    var convertList = [];

                    angular.forEach(fileArr, function (file, fileKey) {

                        if (file.item.data.status !== 'SUCCESS') {
                            file.item.s = 'NON-UPDATE';
                        }
                        if (file.item.data.status === 'UPLOAD') {
                            file.item.data.status = 'LOADFAIL';
                        }

                        if (markList[fileKey]) {

                            var fileInfo = markList[fileKey];

                            var item = file.item;

                            if (item.type === 'image') {
                                item.data.url = courseContent.transImgUrl(fileKey);
                            }
                            if (item.type === 'video') {
                                if (item.data.exec === 'none' || item.data.exec === 'done') {
                                    item.data.url = courseContent.transVideoUrl(fileKey);
                                    item.data.bindHtml = courseContent.bindHtml('video', fileKey, item);
                                } else if (item.data.exec === 'error') {
                                    item.data.url = courseContent.transVideoUrl(fileKey);
                                    item.data.bindHtml = courseContent.bindHtml('video', fileKey, item);
                                } else {
                                    convertList.push({
                                        item: item,
                                        mark: fileKey
                                    });
                                }
                            }
                            if (item.type === 'flash') {
                                item.data.url = courseContent.transFlashUrl(fileKey);
                                item.data.bindHtml = courseContent.bindHtml('flash', fileKey, item);
                            }
                            if (item.type === 'attach') {
                                item.data.url = courseContent.transDownloadUrl(fileKey);
                                if ($.inArray(item.data.ext, uploadFile.specialArr) && item.data.exec !== 'none' && item.data.exec !== 'done' && item.data.exec !== 'error') {
                                    convertList.push({
                                        item: item,
                                        mark: fileKey
                                    });
                                }
                            }

                        } else {
                            file.item.data.status = 'LOADFAIL';
                        }

                        uploadFile.fileCovertListRef(convertList);
                    });
                },


                //列表获取文件转码信息
                fileCovertCheckTime: 10000,
                fileCovertList: [],// { file mark fid }
                fileCovertListRef: function (arr, item, mark) {
                    if (!uploadFile.fileCovertList.length) {
                        if (arr) {
                            angular.forEach(arr, function (value, key) {
                                uploadFile.fileCovertList.push(value);
                            });
                        } else {
                            uploadFile.fileCovertList.push({
                                item: item,
                                mark: mark
                            });
                        }
                        uploadFile.fileConvertPool(uploadFile.fileConvertSuccessHandle);
                    } else {
                        if (arr) {
                            angular.forEach(arr, function (value, key) {
                                uploadFile.fileCovertList.push(value);
                            });
                        } else {
                            uploadFile.fileCovertList.push({
                                item: item,
                                mark: mark
                            });
                        }
                    }
                },
                fileCovertInsert: function (file, mark, fid) {

                    if (!file.ext || !file.ext.id) {
                        return;
                    }

                    var item = $scope.getItemByMark(mark);
                    uploadFile.fileCovertListRef(0, item, mark);
                },
                fileConvertPool: function (cb) {
                    if (uploadFile.fileCovertList.length) {
                        var postIds = [];
                        angular.forEach(uploadFile.fileCovertList, function (value, key) {
                            postIds.push(value.mark);
                        });
                        courseContent.getFileInfo(postIds,{option:{'loading':false}}).then(function (rs) {
                            if (rs.code === 0) {
                                angular.forEach(uploadFile.fileCovertList, function (value, index) {
                                    if (rs.data[value.mark] && (rs.data[value.mark].base.exec === 'done' || rs.data[value.mark].base.exec === 'error')) {
                                        cb(value, rs.data[value.mark]);
                                        uploadFile.fileCovertList.splice(index, 1);
                                    }
                                });
                            }

                            if (uploadFile.fileCovertList.length) {
                                $timeout(function () {
                                    uploadFile.fileConvertPool(cb);
                                }, uploadFile.fileCovertCheckTime);
                            }
                        });
                    }
                },

                /**
                 * 转码成功
                 * @param data
                 * @param fileInfo
                 */
                fileConvertSuccessHandle: function (data, fileInfo) {
                    var item = data.item;
                    var base = fileInfo.base;
                    if (item.type === 'video') {
                        item.data.status = "SUCCESS";
                        item.data.exec = base.exec;
                        item.data.execInfo = base.info;
                        item.data.url = courseContent.transVideoUrl(item.data.mark);
                        item.data.bindHtml = courseContent.bindHtml('video', item.data.mark, item);
                        $scope.updateItem(item, function () {});

                    }
                    if (item.type === 'attach') {
                        item.data.status = "SUCCESS";
                        item.data.exec = base.exec;
                        item.data.execInfo = base.info;
                        $scope.updateItem(item, function () {});
                    }
                },


                //内容中插入图片
                insertPic: function (f, data) {
                    var ext = f.ext;
                    if (ext) {
                        var item = $scope.getItemByMark(f.args.mark);
                        item.data.status = "SUCCESS";
                        item.data.url = courseContent.transImgUrl(f.args.mark);
                        item.data.pubUrl = data.data;
                        $scope.updateItem(item, function () {});
                        $timeout(function () {
                            var img = new Image();
                            img.src = $("#img-show-" + item.id).attr("src");
                            if (angular.isUndefined(item.data.style)) {
                                item.data.style = {};
                            }
                            img.onload = function () {
                                if (img.width > 800) {
                                    item.data.style.width = 800;
                                    item.data.style.height = img.height * 800 / img.width;
                                } else {
                                    item.data.style.width = img.width;
                                    item.data.style.height = img.height;
                                }
                                item.s = 'NON-UPDATE';
                            };
                        });

                    }
                    $scope.$apply();
                },


                //内容直接插入视频文件
                insertVideo: function (f, apply, base) {
                    var ext = f.ext;
                    if (ext) {
                        var item = $scope.getItemByMark(f.args.mark);
                        item.data.status = "SUCCESS";
                        item.data.exec = base.exec;
                        item.data.execInfo = base.info;
                        if (base.exec === 'none' || base.exec === 'done') {
                            item.data.url = courseContent.transVideoUrl(f.args.mark);
                            item.data.bindHtml = courseContent.bindHtml('video', f.args.mark, item);
                        }
                        $scope.updateItem(item, function () {});
                        if (apply) {
                            $scope.$apply();
                        }
                    }
                },

                //内容直接插入Flash
                insertFlash: function (f, apply) {
                    var ext = f.ext;
                    if (ext) {
                        var item = $scope.getItemByMark(f.args.mark);
                        item.data.status = "SUCCESS";
                        item.data.url = courseContent.transFlashUrl(f.args.mark);
                        item.data.bindHtml = courseContent.bindHtml('flash', f.args.mark, item);
                        $scope.updateItem(item, function () {});
                        if (apply) {
                            $scope.$apply();
                        }
                    }
                },

                //内容直接插入附件
                insertFile: function (f, apply, base) {

                    var ext = f.ext;
                    if (ext) {
                        var item = $scope.getItemByMark(f.args.mark);
                        item.data.status = "SUCCESS";
                        item.data.exec = base.exec;
                        item.data.execInfo = base.info;
                        item.data.url = courseContent.transDownloadUrl(f.args.mark);
                        $scope.updateItem(item, function () {});
                        if (apply) {
                            $scope.$apply();
                        }
                    }
                },


                //更新文件上传进度
                uploadRate: function (f, rate, e) {
                    var ext = f.ext;
                    if (ext) {
                        var item = $scope.getItemByMark(f.args.mark);
                        var percent = '100';
                        if (rate != 1) {
                            percent = '' + rate.toFixed(2).substr(0, 4) * 100;
                            if (percent.length > 6) {
                                return;
                            }
                        }
                        item.data.per = percent;
                    }
                    $scope.$apply();
                },

                //显示文件大小
                renderSize: function (value) {
                    if (null == value || value == '') {
                        return "0 Bytes";
                    }
                    var unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
                    var index = 0;
                    var srcsize = parseFloat(value);
                    var size = Math.round(srcsize / Math.pow(1024, (index = Math.floor(Math.log(srcsize) / Math.log(1024)))));
                    return size + unitArr[index];
                },

                //文件上传过滤
                filterFile: function (item, data, group, index) {


                    var t = data.t;

                    //图片数组
                    var imgArr = [];
                    //视频数组
                    var videoArrInsert = [];
                    //特殊文件数组
                    var specialArrInsert = [];
                    //普通文件数组
                    var simpleFileInsert = [];

                    var id = new Date().getTime();


                    for (var i = 0; i < item.files.length; i++) {
                        id++;

                        var file = item.files[i];
                        var itemId = null;

                        if (file.size && file.size > uploadFile.maxSize) {
                            service.dialog.alert('文件不能大于2G');
                            clearFile($scope.uploadInputId);
                            return;
                        }

                        var msg = "";
                        var fileExt = file.name.split(".").pop().toLowerCase();
                        data.c.ext = fileExt;

                        data.c.per = 0;

                        if (t == 'image' && $.inArray(fileExt, uploadFile.picArr) === -1) {
                            service.dialog.alert("只支持png、jpg、bmp、gif、jpeg、PNG、JPG、BMP、GIF、JPEG格式的图片");
                            return [];
                        }

                        if (t == 'video' && $.inArray(fileExt, uploadFile.videoArr) === -1) {
                            service.dialog.alert("只支持wmv、rm、rmvb、mpg、mpeg、mpe、3gp、mov、mp4、m4v、avi、mkv、flv、vob格式的视频");
                            return [];
                        }

                        if (t == 'flash' && $.inArray(fileExt, uploadFile.specialArr) === -1) {
                            service.dialog.alert("只支持swf格式的flash");
                            return [];
                        }
                        file.ext = {
                            opt: t,
                            eid: data.t + id,
                            title: file.name,
                            size: uploadFile.renderSize(file.size),
                            ext: fileExt
                        };
                        file.args = {};

                        data.c.title = file.name;
                        data.c.size = uploadFile.renderSize(file.size);
                        data.c.ext = fileExt;

                        if ($.inArray(fileExt, uploadFile.picArr) != -1 && t == 'image') {
                            file.args.pub = 1;
                            //file.args.picType = 3;
                            itemId = $scope.insertItem(data, group, index);
                        } else if ($.inArray(fileExt, uploadFile.videoArr) != -1 && t == 'video') {
                            itemId = $scope.insertItem(data, group, index);
                        } else if ($.inArray(fileExt, uploadFile.specialArr) != -1 && t == 'flash') {
                            itemId = $scope.insertItem(data, group, index);
                        } else {
                            itemId = $scope.insertItem(data, group, index);
                        }


                        file.ext.id = itemId;
                        file.ext.eid = data.c.mark;
                        file.ext.type = t;
                        file.args.mark = data.c.mark;
                        file.args.owner = $scope.aid;

                    }
                    return item.files;
                }
            };

            var clearFile = function (id) {
                var obj = document.getElementById(id);
                if (!obj) {
                    return;
                }
                if (obj.outerHTML) {
                    obj.outerHTML = obj.outerHTML;
                } else { // FF(包括3.5)
                    obj.value = "";
                }
            };


            $scope.upload = function (item, group, index) {

                var id = $scope.uploadInputId;

                if (typeof(uer) == "undefined") {
                    service.dialog.alert("上传组件加载中，请稍后...");
                    return;
                }
                uer.OnProcess = function (f, rate, speed, e) {
                    uploadFile.uploadRate(f, rate, e);
                };
                uer.OnSuccess = function (f, data, e) {
                    if (typeof(data) == "string")
                        data = JSON.parse(data);

                    if (data.code == 301) {
                        service.dialog.alert("请重新登录。");
                        return;
                    }

                    if (data.code != 0) {
                        service.dialog.alert("上传失败。");
                        return;
                    }

                    var fileExt = f.name.split(".").pop().toLowerCase();
                    //var extra = JSON.parse(f.Args.extra);

                    if ($.inArray(fileExt, uploadFile.picArr) != -1 && f.ext.opt == 'image') {
                        uploadFile.insertPic(f, data);
                    } else if ($.inArray(fileExt, uploadFile.videoArr) != -1 && f.ext.opt == 'video') {
                        uploadFile.insertVideo(f, 1, data.base);
                        if ($.inArray(f.ext.ext, uploadFile.videoArr) && data.base.exec != 'none' && data.base.exec != 'done') {
                            var itemData = $scope.getItemByMark(f.args.mark);
                            itemData.data.exec = data.base.exec;
                            uploadFile.fileCovertInsert(f, f.args.mark, data.base.id);
                        }
                    } else if ($.inArray(fileExt, uploadFile.specialArr) != -1 && f.ext.opt == 'flash') {
                        uploadFile.insertFlash(f, 1);
                    } else {
                        uploadFile.insertFile(f, 1, data.base);
                        if ($.inArray(f.ext.ext, uploadFile.specialArr) && data.base.exec != 'none' && data.base.exec != 'done') {
                            var itemData = $scope.getItemByMark(f.args.mark);
                            itemData.data.exec = data.base.exec;
                            uploadFile.fileCovertInsert(f, f.args.mark, data.base.id);
                        }
                    }
                    uer.ClearLoaded();
                    clearFile($scope.uploadInputId);
                };
                uer.OnErr = function (f, data, e) {
                    if (!$('.jf-tips').length) {
                        jf.confirm('上传失败，请删除后重试。', {mask: true, confirmTitle: '文件上传'}, function () {

                        });
                    }
                    uer.ClearLoaded();
                    clearFile($scope.uploadInputId);
                };
                uer.OnPrepare = function (f, xhr, form) {
                    return f.args;
                };


                uer.AddI($scope.uploadInputId, {}, {});

                uer.OnSelect = function (data, e) {
                    return uploadFile.filterFile(data, item, group, index); //filter the files to upload.
                };

                $("#" + $scope.uploadInputId).click();

            };


            /**
             * 练习
             * @type {boolean}
             */

            $scope.addExam = function (type) {
                service.examReq.createPaper({
                    owner: 'course',
                    type: 'paper',
                    oid: $rootScope.cid
                }).then(function (rs) {
                    if (rs.code === 0) {
                        $scope.newItem({
                            type: 'e_es',
                            index: $scope.curItemIndex.index + 1
                        },{
                            aid: rs.data.id
                        })
                    }
                })
            };


            //--------------------------------------------------------------------


            var initSwitch = false;      //内容是否已经初始化
            var contentSwitch = false;   //内容是否已经加载过

            /**
             * 初始化
             */
            $scope.init = function (aid) {


                if (!(aid && aid !== '0')) {
                    $scope.unSupport = "对不起，当前课程不支持体验版编辑课程内容 :(";
                }

                $scope.aid = aid;

                art = new wcms.Article(aid, "T", 3);
                art.args.uid = 1;
                art.args.source = 'PC';
                art.args.token = rcpAid.getToken();
                art.run().done(function (tart, data) {

                    $scope.loading = false;

                    initSwitch = true;
                    $scope.idsCat = tart.findIids({
                        "T1": 1,
                        "T2": 1,
                    });
                    $scope.idsContent = tart.findIids();
                    console.log(tart, data, $scope.idsCat, $scope.idsContent);


                    //构造目录
                    $scope.makeCat($scope.idsCat, $scope.cat.items);

                    //构造内容
                    $scope.makeContent($scope.idsContent);

                    console.log($scope.content)
                    
                    $scope.$apply();

                    //获取内容
                    //$scope.getItems(0);

                    //$scope.nextItems(tart,ids);
                }).fail(function (err, xhr) {

                    $scope.loading = false;
                    $scope.$apply();

                    window.resm = err;

                    //数据版本不符时重新拉取数据
                    if (err == 'new version') {
                        //service.dialog.alert('本地版本与服务器版本不一致，将重新获取课程内容数据');
                        art.ls_clear();
                        $scope.init();
                    }
                });
            };
            //$scope.init();


            //构造内容
            $scope.getContent = function () {
                if (contentSwitch) {
                    return;
                }
                var interval = $interval(function () {
                    console.log('initSwitch', initSwitch);
                    if (initSwitch) {

                        //获取内容
                        //$scope.getItems(0);
                        //$scope.makeContent($scope.idsContent, $scope.content.items);
                        contentSwitch = true;

                        angular.forEach($scope.content.groups, function (group, index) {
                            setGroupLazy($scope.contentEwId, index, $scope.getItems);
                        });

                        $interval.cancel(interval);
                    }
                }, 500)
            };


            //清除Article冗余内容
            function clearArtRedundancy() {
                var map = {};
                angular.forEach(art.art.idx.iids, function (value, index) {
                    map[value] = {
                        index: index
                    }
                });

                angular.forEach(art.art.items, function (value, key) {
                    if (!map[key]) {
                        console.log('ERROR!!!!!!!!!', art.art.idx.iids, art.art.items, value)
                        delete art.art.items[key];
                    }
                });
                
            }

            /**
             * 保存内容
             */
            var saveFlag = false;
            $scope.saveContent = function (auto) {

                if (saveFlag) {
                    return;
                }

                $timeout(function () {
                    if (saveFlag && angular.isUndefined(auto)) {
                        $scope.loading = true;
                    }
                },500);
                saveFlag = true;

                var editArr = [];

                for (var i = 0; i < $scope.content.groups.length; i++) {
                    var grp = $scope.content.groups[i];
                    for (var j = 0; j < grp.items.length; j++) {
                        if (grp.items[j].s && grp.items[j].s !== 'NORMAL') {
                            if (grp.items[j].s === 'NON-UPDATE') {
                                $scope.updateItem(grp.items[j], function () {});
                            }
                        }
                    }
                }

                clearArtRedundancy();

                //for (var i = 0; i < $scope.content.items.length; i++) {
                //
                //    if ($scope.content.items[i].s && $scope.content.items[i].s !== 'NORMAL') {
                //        if ($scope.content.items[i].s === 'NON-UPDATE') {
                //            $scope.updateItem($scope.content.items[i], function () {
                //            });
                //        }
                //    }
                //}
                //
                // if (editArr.length) {
                //     service.dialog.alert("您还有" + editArr.length + "处未编辑的内容");
                //     saveFlag = false;
                //     $scope.loading = false;
                //     $scope.gotoLoc(editArr[0]);
                //     return;
                // }

                $timeout(function () {
                    art.save().done(function (tart, data) {

                        console.log(art);
                        if (angular.isUndefined(auto)) {
                            service.dialog.alert($scope.configInfo[$scope.config.mark].name + "保存成功");
                        }
                        if (!angular.isUndefined(data)) {
                            if (data.iidm) {
                                var idMap = data.iidm;
                                angular.forEach(idMap, function (newId, oldId) {
                                    //var item = $scope.getItemById(index);
                                    var idInfo = $scope.getItemInfoById(oldId);
                                    $scope.content.groups[idInfo.group].ids[idInfo.index] = newId;
                                    var item = $scope.content.groups[idInfo.group].items[idInfo.index];
                                    if (!angular.isUndefined(item)) {
                                        item.id = newId;
                                    } else {
                                        console.log('ERROR%%%%%%%',idInfo, $scope.content.groups, idMap);
                                    }
                                });
                                $scope.refCat();
                            }
                            console.log(idMap, $scope.content.groups)
                        }

                        if ($scope.content.groups.length && $scope.content.groups[0].items) {
                            $scope.config.changeStatus($scope.content.groups[0].items.length);
                        }

                        $scope.loading = false;
                        saveFlag = false;
                        $scope.$apply();
                    }).fail(function () {
                        $scope.loading = false;
                        saveFlag = false;
                        $scope.$apply();
                        if (angular.isUndefined(auto)) {
                            service.dialog.alert($scope.configInfo[$scope.config.mark].name + "保存失败");
                        }
                    });
                });
            };


            //跳到对应位置
            $scope.gotoGrpItem = function (id) {
                var rs = $scope.getItemInfoById(id);
                if ($scope.content.groups[rs.group].dis) {
                    //$scope.gotoLoc('container-' + id);
                    $scope.gotoLoc('main-content-' + id);
                } else {
                    //$scope.getItems(rs.group,'container-' + id);
                    $scope.getItems(rs.group, 'main-content-' + id);
                }
            };


            //-------------------------------------------------------------------------------
            //页面锚点
            $scope.gotoLoc = function (arg_id, time) {
                $timeout(function () {
                    $('#' + $scope.contentEwId).scrollTo('#' + arg_id, angular.isUndefined(time) ? 200 : time);
                });
            };


            $scope.cid = QueryStringByName("cid");

            //预览
            $scope.previewUrl = function () {
                
                return $scope.configInfo[$scope.config.mark].previewUrl();
            };

            //关闭编辑
            $scope.back = function () {
                $interval.cancel(autoSave);
            };

            //打开编辑框
            $scope.openWindow = function () {
                // autoSaveHandle();
            };

            
            //自动保存
            var autoSave = null;
            function autoSaveHandle() {
                autoSave = $interval(function () {
                    if (initSwitch) {
                        console.log('Content auto save');
                        $scope.saveContent(true);
                    }
                },30000);
            }

            //=======================================================================
            /**
             * 延迟读取
             */
            function setGroupLazy(container, index, cb) {
                $timeout(function () {
                    lazy({
                        node: '#c-list-' + index,
                        container: '#' + container,
                        callback: function (data) {
                            if (data) {
                                cb(index);
                            }
                        }
                    })
                });
            }


            function lazy(args) {

                var lock;
                var timer;
                var win = $(args.container);

                function handler() {
                    var e = $(args.node);
                    if (!e.length || lock) {
                        return;
                    }
                    var win = $(window);
                    var wt = win.scrollTop();
                    var wb = wt + win.height();
                    var et = e.offset().top;
                    var eb = et + e.height();
                    var tf = et >= wt && et <= wb;
                    var bf = et <= wt && eb >= wt;
                    if (tf || bf) {
                        lock = !lock;
                        if (typeof args.callback === 'function') {
                            args.callback((tf || bf));
                            win.unbind('scroll', callback);
                            win.unbind('resize', callback);
                        }
                    }
                }

                function callback() {
                    $timeout.cancel(timer);
                    timer = $timeout(handler, 200);
                }

                callback();
                win.bind('scroll', callback);
                win.bind('resize', callback);
            }

            //======================================


            //监听页面宽度变化

            var widthThreshold = 1200;
            var width = $(window).width();
            $scope.editWidthMode = width < widthThreshold ? 'petty' : 'wide';
            $scope.ckToolPosMode = width < widthThreshold ? 'petty' : 'wide';
            $(window).resize(function () {
                var width = $(this).width();
                $scope.editWidthMode = width < widthThreshold ? 'petty' : 'wide';
                $scope.ckToolPosMode = width < widthThreshold ? 'petty' : 'wide';
                $scope.$apply();
            });

            //左右栏初始化
            $(function () {
                function item(w, v, b, b2, attr) {
                    $(w).each(function (index, item) {
                        $(this).find(b2).addClass('open').attr('title', '展开');
                        eval("$(this).find(v).css({" + attr + ":-$(this).find(v).outerWidth(true)}).hide()");
                        if ($(this).find(b).length > 0 && !$(this).find(b)[0].clickFlag) {
                            $(this).find(b).click(function () {
                                if (!this.toggleFlag) {
                                    $(item).find(b2).removeClass('open').attr('title', '隐藏');
                                    eval("$(item).find(v).show().stop(true,true).animate({" + attr + ":0},'fast')");
                                    eval("$(item).find('.ew-word').stop(true,true).animate({" + attr + ":" + ($(item).find(v).outerWidth(true) + 5) + "},'fast')");
                                } else {
                                    $(item).find(b2).addClass('open').attr('title', '展开');
                                    eval("$(item).find(v).stop(true,true).animate({" + attr + ":-$(item).find(v).outerWidth(true)},'fast',function (){ $(this).hide() })");
                                    eval("$(item).find('.ew-word').stop(true,true).animate({" + attr + ":0},'fast')");
                                }
                                this.toggleFlag = !this.toggleFlag;
                            });
                            $(this).find(b)[0].clickFlag = true;
                        }
                        if ($(this).find(v).find(b2).length > 0 && !$(this).find(v).find(b2)[0].clickFlag) {
                            $(this).find(v).find(b2).click(function () {
                                $(item).find(b).click();
                            });
                            $(this).find(v).find(b2)[0].clickFlag = true;
                        }
                    });
                };
                item('.edit-w', '.ew-list', '.overview-b', '.close-b', 'left');  //编辑栏左边
                item('.edit-w', '.ew-related', '.set-knowledge-b', '.close-b', 'right');  //编辑栏右边
            });

        }]
    };
});