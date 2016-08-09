/**
 * Created by Fox2081 on 2016/5/19.
 */
module.directive('paperEdit', function () {
    return {
        restrict: 'E',
        template:'<div class="edit-w content-n paper-editor" id="paper-edit-{{config.aid}}"><div ng-show="!loading"><y-loading show="true"></y-loading></div><div class="loading-layer" id="loading-layer" ng-show="saveLoading"><span class="loading-circle loading-amit-spin"></span></div><div class="ew-h con" ng-show="loading"><div class="list-ac"><div class="grp"><div class="block-grp"><div class="bw"><a href="javascript:;" class="back" ng-click="closeEdit()"><p class="ic"><i class="image-con-head-back"></i></p><p>返回</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="overview-b"><p class="ic"><i class="image-con-head-dir"></i></p><p>目录</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" ng-click="addItem(\'T1\',null,curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-6"></i></p><p>添加题组</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" ng-click="addItem(\'e_sel\',\'single\',curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-1"></i></p><p>单选题</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="addItem(\'e_sel\',\'multi\',curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-2"></i></p><p>多选题</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="addItem(\'e_sel\',\'judge\',curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-5"></i></p><p>判断题</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="addItem(\'e_fill\',null,curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-3"></i></p><p>填空题</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'wide\'"><div class="bw"><a href="javascript:;" ng-click="addItem(\'e_text\',null,curItemIndex.index,curItemIndex.group)"><p class="ic"><i class="image-con-head-q-4"></i></p><p>简答题</p></a></div></div><div class="block-grp" ng-show="editWidthMode === \'petty\'"><div class="bw"><a href="javascript:;" class="up-panel down-list-h"><p class="ic"><i class="image-con-head-more"></i></p><p>更多</p><div class="down-list"><ul><li ng-click="addItem(\'e_sel\',\'multi\',curItemIndex.index,curItemIndex.group)" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-q-2"></i></div>多选题</li><li ng-click="addItem(\'e_sel\',\'judge\',curItemIndex.index,curItemIndex.group)" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-q-5"></i></div>判断题</li><li ng-click="addItem(\'e_fill\',null,curItemIndex.index,curItemIndex.group)" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-q-4"></i></div>填空题</li><li ng-click="addItem(\'e_text\',null,curItemIndex.index,curItemIndex.group)" ng-show="editWidthMode === \'petty\'"><div class="img-p"><i class="image-con-s-q-4"></i></div>简答题</li></ul></div></a></div></div><div class="seq"></div><div class="block-grp"><div class="bw"><a href="javascript:;" class="save-b" ng-click="savePaper()"><p class="ic"><i class="image-con-head-save"></i></p><p>保存</p></a></div></div><div class="block-grp"><div class="bw"><a href="javascript:;" ng-href="{{\'/course/exam.html?aid=\'+config.aid+\'&preview=1\' + (paper.type === \'e_test\' && config.tid ? (\'&tid=\' + config.tid) : \'\')}}" target="_blank"><p class="ic"><i class="image-con-head-preview"></i></p><p>预览</p></a></div></div><div class="seq"></div></div><div class="grp"><div class="block_new ck-tool-bar" ng-class="ckToolPosMode"><div id="topEditor-exam" class="top-editor"></div></div></div></div><div class="ew-m con"><div class="ew-list"><a href="javascript:;" class="close-b" title="隐藏"><i class="image-con-dir-close"></i></a><div class="h"><span>试卷目录</span></div><div class="l dir"><div class="l-c"><div class="tree-line"></div><ul ng-repeat="group in paper.groups track by $index"><li class="option"><div class="icon"><i class="image-con-dir-t1"></i></div><a ng-click="gotoLoc(\'q-t-\' + config.aid + \'-\' + group.title.id)" class="section-context first" title="{{group.title.data.title}}">{{group.title.data.title || \'未命名题组\'}}</a></li><li class="option" ng-repeat="item in group.items track by $index"><div class="icon"><i class="image-con-dir-t2"></i></div><a ng-click="gotoLoc(\'q-\' + config.aid + \'-\' + item.id)" class="section-context second" ng-bind="transTitle(item.data.text)" title="{{transTitle(item.data.text)}}"></a></li></ul></div></div></div><div class="ew-word" id="ew-paper-{{config.aid}}"><div class="m w-ck dir"><div><div class="test-main"><div class="head-info"><div><span class="info"><em class="icon"><i class="image-test-h-1"></i></em> <input class="n name" placeholder="请输入试卷名称" ng-model="paper.title" maxlength="20"> </span><span class="info"><em class="icon"><i class="image-test-h-2"></i></em> <input class="n limit" placeholder="建议时长（分）" type="text" maxlength="3" title="建议时长，单位：分钟" ng-model="paper.advise_cost" ng-show="paper.type !== \'e_test\'"> <input class="n limit" placeholder="考试时长（分）" type="text" maxlength="3" title="考试时长，单位：分钟" ng-model="paper.advise_cost" ng-show="paper.type === \'e_test\'"> </span><span class="info" ng-show="paper.type === \'e_test\' && editWidthMode === \'wide\'"><span class="time">开放时间</span> <input type="text" class="jf-date n time" plug-style="all time" readonly="readonly" id="startTime-{{config.aid}}" ng-model="paper.tInfo.start_time" placeholder="点击选择开始时间"> <span class="time">--</span> <input type="text" class="jf-date n time" plug-style="all time" readonly="readonly" id="endTime-{{config.aid}}" ng-model="paper.tInfo.end_time" placeholder="点击选择结束时间"> </span><span class="info" ng-show=""><label for="pubAns" class="pub-ans" title="勾选后，只有客观题的试卷学生作答后可直接查看分数解析，有主观题的试卷老师批改后会直接公布成绩"><input type="checkbox" id="pubAns" ng-model="paper.answerPub"> <span>是否直接公布答案</span></label></span><div class="r"><span class="mode-btn-grp"><a href="" ng-click="paper.type = \'e_paper\'" ng-class="{\'cur\': paper.type === \'e_paper\'}" title="普通试卷，无做题时间限制">普通试卷</a> <a href="" ng-click="paper.type = \'e_test\'" ng-class="{\'cur\': paper.type === \'e_test\'}" title="有做题时间限制">考试模式</a></span></div></div><p class="h-20" ng-show="editWidthMode === \'petty\'"></p><div class="second-l" ng-show="editWidthMode === \'petty\'"><span class="info" ng-show="paper.type === \'e_test\'"><span class="time">开放时间</span> <input type="text" class="jf-date n time" plug-style="all time" readonly="readonly" id="startTime-{{config.aid}}" ng-model="paper.tInfo.start_time" placeholder="点击选择开始时间"> <span class="time">--</span> <input type="text" class="jf-date n time" plug-style="all time" readonly="readonly" id="endTime-{{config.aid}}" ng-model="paper.tInfo.end_time" placeholder="点击选择结束时间"> </span><span class="info" ng-show=""><label for="pubAns" class="pub-ans" title="勾选后，只有客观题的试卷学生作答后可直接查看分数解析，有主观题的试卷老师批改后会直接公布成绩"><input type="checkbox" id="pubAns" ng-model="paper.answerPub"> <span>是否直接公布答案</span></label></span></div><p class="h-20"></p><div><span class="info desc"><em class="icon"><i class="image-test-h-3"></i></em> <input class="n explain" placeholder="请输入试卷说明" ng-model="paper.desc" maxlength="50"></span><div class="r"><span class="score-total">共 <span>{{paper.total}}</span> 题 ,总分 <span>{{paper.score}}</span> 分</span></div></div></div><div class="q-area"><div class="item" ng-repeat="group in paper.groups track by $index" ng-class="{\'cur\': group.cur}"><div class="item-t1" ng-click="changeCurFocus($index,-1)" id="{{\'q-t-\'+config.aid+\'-\'+group.title.id}}" ng-class="{\'gray-back\':curItemIndex.group == $index && curItemIndex.index == -1}"><div class="tools" ng-show="paper.groups.length > 1" ng-mouseenter="group.cur = true" ng-mouseleave="group.cur = false"><a ng-click="moveGroup($index,\'up\')" ng-show="!$first" title="上移题组"><div class="ic"><i class="image-new-pos-up"></i></div></a><a ng-click="moveGroup($index,\'down\')" ng-show="!$last" title="下移题组"><div class="ic"><i class="image-new-pos-down"></i></div></a><a ng-click="deleteGroup($index)" title="删除题组"><div class="ic"><i class="image-new-pos-del"></i></div></a></div><div class="main-t1"><input type="text" placeholder="请输入题组名称" ng-model="group.title.data.title"></div><div class="r"><span class="score-alert" ng-show="group.scoreAlert">{{group.scoreAlert}}</span> <span>每题 <input type="text" class="score" title="快速设置题组分值" ng-model="group.aveScore" ng-blur="averageScoreBlur(group)" ng-keydown="averageScoreKeyDown($event, group)" maxlength="3"> 分&nbsp;&nbsp;&nbsp; 共{{group.title.score}}分/{{group.items.length}}题</span></div></div><div ng-repeat="item in group.items track by $index" ng-click="changeCurFocus($parent.$index,$index)" id="{{\'q-\'+config.aid+\'-\'+item.id}}" ng-class="{\'gray-back\':curItemIndex.group == $parent.$index && curItemIndex.index == $index}" class="item-n"><div class="item-q"><div class="normal" ng-show="item.mode === \'normal\'"><div class="main-l"><div class="q-index">{{$index + 1}}.</div><div ng-show="item.type === \'e_sel\'"><div class="q-content" ng-bind-html="item.data.text | html"></div><div class="q-item" ng-repeat="option in item.data.optionList track by $index"><div class="o-code" ng-hide="item.data.type === \'judge\'">{{oCode[$index]}}.&nbsp;</div><div class="o-option" ng-bind-html="option.text"></div></div></div><div ng-show="item.type === \'e_fill\'"><div class="q-content" ng-bind-html="item.data.text | html"></div><div class="q-item" ng-repeat="option in item.data.optionList track by $index"><div class="o-code">({{$index + 1}}).&nbsp;</div><div class="o-option" ng-bind-html="option.text"></div></div></div><div ng-show="item.type === \'e_text\'"><div class="q-content text" ng-bind-html="item.data.text | html"></div></div><div class="q-score">分值 <input type="text" title="题目分值" ng-model="item.data.score" ng-change="changeQuestionScore(item)" maxlength="3"> 分 <span class="score-alert" ng-show="item.scoreAlert">{{item.scoreAlert}}</span></div></div><div class="main-r"><a href="" title="编辑题目" ng-click="editQuestion(item)"><i class="image-test-q-1"></i></a> <a href="" title="上移题目" ng-click="($parent.$first && $first) ? null : moveQuestion(item, $parent.$index, $index, \'up\')"><i class="image-test-q-2" ng-class="$parent.$first && $first ? \'image-test-q-2r\' : \'image-test-q-2\'"></i></a> <a href="" title="下移题目" ng-click="($parent.$last && $last) ? null : moveQuestion(item, $parent.$index, $index, \'down\')"><i class="image-test-q-3" ng-class="$parent.$last && $last ? \'image-test-q-3r\' : \'image-test-q-3\'"></i></a> <a href="" title="删除题目" ng-click="deleteQuestion(item,$index,$parent.$index)"><i class="image-test-q-4"></i></a></div></div><div class="edit" ng-if="item.mode === \'edit\'"><table class="mode-edit"><tr><td><span>题目：</span></td><td><div class="qe-content"><div id="editor-paper-{{item.id}}" class="content-editor" args="item" scope="dataEmit" index="$index" tag="\'paper\'" ng-model="item.dataT.text" content-editor editor-scope="item.editorScope" group="\'exam\'" ng-bind-html="item.dataT.content.text | html" contenteditable="true"></div></div><div ng-show="item.type === \'e_sel\'"><div class="qe-item"><div class="p" ng-repeat="option in item.dataT.optionList track by $index"><span ng-show="item.data.type === \'single\'"><input type="radio" title="" name="radio-single-{{item.id}}" class="head" ng-model="item.dataT.radioAnswer" ng-value="$index"> <span class="index">{{oCode[$index]}}</span> <input type="text" title="" class="content" ng-model="option.text" placeholder="请输入选项内容"> <a class="btn"><i class="image-test-q-4" ng-click="optionDel(item, $index)"></i></a> </span><span ng-show="item.data.type === \'multi\'"><input type="checkbox" title="" class="head" ng-model="option.answer"> <span class="index">{{oCode[$index]}}</span> <input type="text" title="" class="content" ng-model="option.text" placeholder="请输入选项内容"> <a class="btn"><i class="image-test-q-4" ng-click="optionDel(item, $index)"></i></a> </span><span ng-show="item.data.type === \'judge\'"><input type="radio" title="" name="radio-judge-{{item.id}}" class="head" ng-model="item.dataT.radioAnswer" ng-value="$index"> <span>{{option.text}}</span></span></div></div><div class="qe-btn-grp" ng-show="item.data.type === \'single\' || item.data.type === \'multi\'"><a href="" class="btn-p-n" ng-click="optionAdd(item)">添加选项</a></div></div><div ng-show="item.type === \'e_fill\'"><div class="qe-item"><div class="p" ng-repeat="option in item.dataT.optionList track by $index"><span><span class="index">{{$index + 1}}</span> <input type="text" title="" class="content" ng-model="option.text" placeholder=\'请在此输入答案，多个答案用"/"隔开\'> <a class="btn"><i class="image-test-q-4" ng-click="optionDel(item, $index)"></i></a></span></div></div><div class="qe-btn-grp"><a href="" class="btn-p-n" ng-click="optionAddFill(item)">添加选项</a></div></div><div ng-show="item.type === \'e_text\'"></div></td></tr><tr ng-show="item.type === \'e_text\'"><td><span>答案：</span></td><td><div class="qe-content"><div id="editor-ans-{{item.id}}" class="content-editor" args="item" scope="dataEmit" index="$index" tag="\'ans\'" ng-model="item.dataT.answer" content-editor editor-scope="item.editorScope" group="\'exam\'" ng-bind-html="item.dataT.content.answer | html" contenteditable="true"></div></div></td></tr><tr><td><span>答案解析：</span></td><td><div class="qe-content"><div id="editor-ana-{{item.id}}" class="content-editor" args="item" scope="dataEmit" index="$index" tag="\'ana\'" ng-model="item.dataT.analyze" content-editor editor-scope="item.editorScope" group="\'exam\'" ng-bind-html="item.dataT.content.analyze | html" contenteditable="true"></div></div></td></tr><tr><td><span>分值：</span></td><td><div class="qe-score"><input type="text" title="分值" ng-model="item.dataT.score" maxlength="3"> 分</div></td></tr><tr><td></td><td><div class="qe-btn-grp"><a href="" class="btn-p-n g green" ng-click="questionEditConfirm(item)">保存</a> <a href="" class="btn-p-n g" ng-click="questionEditCancel(item)">取消</a></div></td></tr></table></div></div></div></div><div class="item-tool" ng-show=""><a href="" class="btn-p-n" ng-click="addItem(\'e_sel\',\'single\')" ng-show="paper.groups.length">单选</a> <a href="" class="btn-p-n" ng-click="addItem(\'e_sel\',\'multi\')" ng-show="paper.groups.length">多选</a> <a href="" class="btn-p-n" ng-click="addItem(\'e_sel\',\'judge\')" ng-show="paper.groups.length">判断</a> <a href="" class="btn-p-n" ng-click="addItem(\'T1\')">添加题组</a> <a href="" class="btn-p-n r build" ng-click="savePaper(\'close\')">生成试卷</a> <a href="" class="btn-p-n r build" ng-click="savePaper()">保存试卷</a></div></div></div></div></div></div></div></div></div>',
        replace: "true",
        scope: {
            config: '='
        },
        controller: ['$timeout', '$scope', '$rootScope', '$element', '$sce', 'service', function ($timeout, $scope, $rootScope, $element, $sce, service) {

            var scoreReg = /^[0-9]\d*$/;
            var countReg = /^[0-9]*[1-9][0-9]*$/;

            // console.log($scope.config)
            if ($scope.config) {
                $scope.config.scope = $scope;
            } else {
                return;
            }


            $scope.loading = false;
            $scope.saveLoading = false;

            $scope.qInfo = {
                type: {
                    'single': {
                        name: '单选题'
                    },
                    'multi': {
                        name: '多选题'
                    },
                    'judge': {
                        name: '判断题'
                    }
                }
            };

            $scope.oCode = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

            /**
             * 重置试卷信息
             */
            function resetPaper() {
                $scope.paper = {
                    groups: [],
                    score: 0,
                    total: 0,
                    advise_cost: null,
                    loaded: false,
                    type: 'e_paper',
                    art: null,
                    tInfo: {

                    }
                };
                $("#startTime-" + $scope.config.aid).val(null);
                $("#endTime-" + $scope.config.aid).val(null);
            }

            // if (!$scope.paper) {
            //     initPaper();
            // }

            //当前ITEM
            $scope.curItemIndex = {
                group: 0,
                index: -1
            };


            var art = null;


            /**
             * 新增group
             */
            $scope.addGroup = function (index, items) {
                if (angular.isUndefined(index)) {
                    $scope.paper.groups.push({
                        title: null,
                        items: []
                    });
                } else {
                    $scope.paper.groups.splice(index, 0, {
                        title: null,
                        items: items
                    });
                }
            };

            /**
             * 新增元素
             * @param type
             * @param extType
             * @param index
             * @param group
             */
            $scope.addItem = function (type, extType, index, group) {

                var newData = {
                    t: type,
                    g: "_"
                };

                if (type == 'T1') {
                    newData.c = {
                        title: ""
                    };
                } else if (type === 'e_sel') {
                    newData.c = {
                        "type": extType,          //"single|multi|judge"
                        "text": "<p>请输入题目内容</p>",
                        "options": [
                            "<p>示例内容A</p>",
                            "<p>示例内容B</p>",
                            "<p>示例内容C</p>",
                            "<p>示例内容D</p>"
                        ],
                        "answer": [0],
                        "score": 0,
                        "analyze": "<p>请输入答案解析</p>"
                    };

                    if (extType === 'single') {
                        newData.c.text = '<p>请输入题目内容</p>';
                    }
                    if (extType === 'multi') {
                        newData.c.text = '<p>请输入题目内容</p>';
                    }
                    if (extType === 'judge') {
                        newData.c.text = '<p>请输入题目内容</p>';
                        newData.c.options = [
                            "<p>正确</p>",
                            "<p>错误</p>",
                        ]
                    }

                } else if (type === 'e_fill') {
                    newData.c = {
                        "text": '<p>请输入答案1：<span class="fill-option">(1)</span>，答案2：<span class="fill-option">(2)</span>（样例）</p>',
                        "answer": [['样例答案1', '样例答案2'], ['样例答案3']],
                        "score": 0,
                        "analyze": "<p>请输入答案解析</p>"
                    };
                } else if (type === 'e_text') {
                    newData.c = {
                        "text": "<p>请输入题目内容</p>",
                        "answer": "<p>请输入参考答案</p>",
                        "score": 0,
                        "analyze": "<p>请输入答案解析</p>"
                    };
                } else {
                    return
                }


                if (angular.isUndefined(index) && angular.isUndefined(group)) {
                    group = $scope.paper.groups.length - 1;
                    index = $scope.paper.groups[$scope.paper.groups.length - 1].items.length;
                }

                var pos = $scope.getDeepIndex(group, index);

                var nId = art.addItem(newData, pos);

                if (type === 'T1') {
                    var groupCur = group + 1;
                    var removeItems = [];
                    if (index > -2) {
                        removeItems = $scope.paper.groups[group].items.splice(index + 1, $scope.paper.groups[group].items.length);
                    }
                    $scope.addGroup(groupCur, removeItems);
                    $scope.paper.groups[groupCur].title = $scope.makePlugin(nId, newData);
                    $scope.gotoLoc('q-t-' + $scope.config.aid + '-' + $scope.paper.groups[groupCur].title.id);
                    $scope.curItemIndex.group = groupCur;
                    $scope.curItemIndex.index = -1;
                } else {
                    var item = $scope.makePlugin(nId, newData);
                    $scope.paper.groups[group].items.splice(index + 1, 0, item);
                    $scope.editQuestion(item, 'new');
                    $scope.gotoLoc('q-' + $scope.config.aid + '-' + item.id);
                    $scope.curItemIndex.group = group;
                    $scope.curItemIndex.index = index + 1;
                }

            };

            /**
             * 获取全局元素所处位置index
             * @param group
             * @param index
             */
            $scope.getDeepIndex = function (group, index) {
                var rs = 0;
                for (var i = 0; i < group; i++) {
                    rs += $scope.paper.groups[i].items.length;
                    if ($scope.paper.groups[i].title) {
                        rs += 1;
                    }
                }
                return rs + index + 2;
            };


            /**
             * 获取ITEM所在位置
             * @param id
             * @returns {*}
             */
            $scope.getGroupIndex = function (id) {
                var rs = null;
                angular.forEach($scope.paper.groups, function (group, groupIndex) {
                    angular.forEach(group.items, function (item, itemIndex) {
                        if (item.id === id) {
                            rs = {
                                group: groupIndex,
                                index: itemIndex
                            }
                        }
                    });
                });
                return rs;
            };


             /**
             * 转换元素
             * @param id
             * @param item
             * @returns {{id: *, type: *, mode: string, data: null}}
             */
            $scope.makePlugin = function (id, item) {

                var rs = {
                    id: id,
                    type: item.t,
                    mode: 'normal',
                    data: null
                };
                if (item.t === 'T1') {
                    rs.data = {
                        title: item.c.title
                    };
                } else if (item.t === 'e_sel') {
                    rs.data = item.c;

                    var answer = {};
                    var radioAnswer = 0;
                    angular.forEach(rs.data.answer, function (value, key) {
                        answer[value] = true;
                        radioAnswer = value;
                    });

                    var option = [];
                    angular.forEach(rs.data.options, function (value, key) {
                        option.push({
                            text: value,
                            answer: !angular.isUndefined(answer[key])
                        });
                    });
                    rs.data.optionList = option;
                    rs.data.radioAnswer = radioAnswer;
                } else if (item.t === 'e_fill') {
                    rs.data = item.c;
                    var option = [];
                    angular.forEach(rs.data.answer, function (value, key) {
                        if (angular.isArray(value)) {
                            option.push({
                                text: value.join('/'),
                                answer: ''
                            });
                        }
                    });
                    rs.data.optionList = option;
                } else if (item.t === 'e_text') {
                    rs.data = item.c;
                }

                return rs;
            };

            //-----------------------------------------------------------------------------------

            /**
             * 编辑题目
             * @param item
             * @param opt
             */
            $scope.editQuestion = function (item, opt) {
                item.dataT = angular.copy(item.data);
                item.dataT.content = {
                    text: item.dataT.text,
                    analyze: item.dataT.analyze
                };

                if (item.type === 'e_sel') {
                    angular.forEach(item.dataT.optionList, function (value, key) {
                        value.text = $scope.transTitle(value.text);
                    });
                } else if (item.type === 'e_fill') {

                } else if (item.type === 'e_text') {
                    item.dataT.content.answer = item.dataT.answer;
                }

                angular.forEach(item.dataT.optionList, function (value, key) {
                    value.text = $scope.transTitle(value.text);
                });

                item.opt = opt;

                if (opt === 'new') {
                    var pos = $scope.getGroupIndex(item.id);
                    if (pos) {
                        if ($scope.paper.groups[pos.group].aveScore) {
                            item.dataT.score = $scope.paper.groups[pos.group].aveScore;
                        }
                    }
                }

                item.mode = 'edit';
            };

            /**
             * 获取题目位置
             * @param group
             * @param index
             * @returns {*}
             */
            $scope.questionDeepIndex = function (group, index) {
                var pos = 0;
                for (var i = 0; i < group; i++) {
                    pos = pos + $scope.paper.groups[i].items.length + 1;
                }
                return pos + index + 1;
            };

            /**
             * 移动题目
             * @param item
             * @param group
             * @param index
             * @param opt
             */
            $scope.moveQuestion = function (item, group, index, opt) {

                console.log(item, group, index, opt);
                var pos = $scope.questionDeepIndex(group, index);
                var target = $scope.paper.groups[group].items[index];
                var length = $scope.paper.groups[group].items.length - 1;
                if (opt === 'up') {
                    art.moveItem2(pos, true);
                    $scope.paper.groups[group].items.splice(index, 1);
                    if (index == 0) {
                        $scope.paper.groups[group - 1].items.push(target);
                    } else {
                        $scope.paper.groups[group].items.splice(index - 1, 0, target);
                    }
                    $scope.gotoLoc('q-' + $scope.config.aid + '-' + target.id);
                } else if (opt === 'down') {
                    art.moveItem2(pos, false);
                    $scope.paper.groups[group].items.splice(index, 1);
                    if (index == length) {
                        $scope.paper.groups[group + 1].items.splice(0, 0, target);
                    } else {
                        $scope.paper.groups[group].items.splice(index + 1, 0, target);
                    }
                    $scope.gotoLoc('q-' + $scope.config.aid + '-' + target.id);
                }
                $scope.calcScore();
            };

            /**
             * 移动题组
             * @param group
             * @param opt
             */
            $scope.moveGroup = function (group, opt) {

                if (opt === 'up') {

                    var idStart = $scope.getDeepIndex(group, -2);
                    var idTarget = $scope.getDeepIndex(group - 1, -2);

                    art.moveItemGrp(idStart, idTarget, $scope.paper.groups[group].items.length + 1, true);

                    var target = $scope.paper.groups.splice(group, 1)[0];
                    target.cur = false;
                    $scope.paper.groups.splice(group - 1, 0, target);
                    $scope.gotoLoc('q-t-' + $scope.config.aid + '-' + target.title.id);
                } else {

                    var idStart = $scope.getDeepIndex(group, -2);
                    var idTarget = $scope.getDeepIndex(group + 2, -2);

                    art.moveItemGrp(idStart, idTarget, $scope.paper.groups[group].items.length + 1, false);

                    var target = $scope.paper.groups.splice(group, 1)[0];
                    target.cur = false;
                    $scope.paper.groups.splice(group + 1, 0, target);
                    $scope.gotoLoc('q-t-' + $scope.config.aid + '-' + target.title.id);
                }

                $scope.calcScore();
            };

            /**
             * 删除题组
             * @param index
             */
            $scope.deleteGroup = function (index) {

                service.dialog.confirm('删除题组后，题组内的所有题目也会一起删除',{mask: true},function () {
                    var group = $scope.paper.groups[index];
                    art.removeItem(group.title.id);
                    angular.forEach(group.items, function (item, key) {
                        art.removeItem(item.id);
                    });
                    $scope.paper.groups.splice(index, 1);

                    $scope.calcScore();
                    $scope.$apply();

                },function () {

                });
            };

            /**
             * 取消编辑题目
             * @param item
             */
            $scope.questionEditCancel = function (item) {
                if (item.opt === 'new') {
                    var pos = $scope.getGroupIndex(item.id);
                    if (pos) {
                        $scope.deleteQuestion(item, pos.index, pos.group);
                    }
                } else {
                    item.dataT = null;
                    item.mode = 'normal';
                }
            };

            /**
             * 确认编辑题目
             * @param item
             */
            $scope.questionEditConfirm = function (item) {

                var itemTgt = $('#q-' + $scope.config.aid + '-' + item.id).find('.item-q');
                
                if (!item.dataT.text) {
                    service.dialog.alert("题目内容不能为空");
                    shake(itemTgt, "red-alert", 3);
                    return;
                }
                
                if (item.type === 'e_sel') {
                    if (!item.dataT.optionList.length) {
                        service.dialog.alert("选择题至少需要一个选项");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }
                    if (!item.dataT.text) {
                        service.dialog.alert("请输入题目内容");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }

                    var optionFlag = 0;
                    angular.forEach(item.dataT.optionList, function (value, key) {
                        if (!value.text) {
                            optionFlag = 1;
                        }
                    });
                    if (optionFlag) {
                        service.dialog.alert("选项内容不能为空");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }
                    item.dataT.options = $scope.selOptionHandle(item.dataT);
                    item.dataT.answer = $scope.selAnswerHandle(item);
                }
                if (item.type === 'e_fill') {
                    var ckId = $('#' + 'q-' + $scope.config.aid + '-' + item.id).find('.content-editor');

                    if (!item.dataT.optionList.length) {
                        service.dialog.alert("选择题至少需要一个填空项");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }

                    if (ckId.find('.fill-option').length !== item.dataT.optionList.length) {
                        service.dialog.alert("题目选项数量不统一");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }

                    var optionFlag = 0;
                    angular.forEach(item.dataT.optionList, function (value, key) {
                        if (!value.text) {
                            optionFlag = 1;
                        }
                    });
                    if (optionFlag) {
                        service.dialog.alert("选项内容不能为空");
                        shake(itemTgt, "red-alert", 3);
                        return;
                    }
                    item.dataT.answer = $scope.selAnswerHandle(item);
                }

                item.data = angular.copy(item.dataT);
                item.mode = 'normal';
                item.data.score = Number(item.data.score);
                $scope.calcScore();
                var pos = $scope.getGroupIndex(item.id);
                if (pos && item.data.score != $scope.paper.groups[pos.group].aveScore) {
                    $scope.clearScore(pos.group);
                }
                $scope.gotoLoc('q-' + $scope.config.aid + '-' + item.id);
            };

            /**
             * 删除题目
             * @param item
             * @param index
             * @param group
             */
            $scope.deleteQuestion = function (item, index, group) {

                service.dialog.confirm('题目删除后不可恢复，确定删除？',{mask: true},function () {
                    art.removeItem(item.id);
                    $scope.paper.groups[group].items.splice(index, 1);
                    $scope.calcScore();
                    $scope.$apply();
                },function () {

                });
            };

            /**
             * 处理题目选项
             * @param data
             * @returns {Array}
             */
            $scope.selOptionHandle = function (data) {
                var options = [];
                angular.forEach(data.optionList, function (value, key) {
                    value.text = $scope.transTitleR(value.text);
                    options.push(value.text);
                });
                return options;
            };

            /**
             * 处理题目答案
             * @returns {Array}
             * @param item
             */
            $scope.selAnswerHandle = function (item) {
                var answer = null;
                if (item.type === 'e_sel') {
                    answer = [];
                    if (item.dataT.type === 'single' || item.dataT.type === 'judge') {
                        answer.push(Number(item.dataT.radioAnswer));
                    } else if (item.dataT.type === 'multi') {
                        angular.forEach(item.dataT.optionList, function (value, key) {
                            if (value.answer) {
                                answer.push(Number(key));
                            }
                        });
                    }
                } else if (item.type === 'e_fill') {
                    answer = [];
                    angular.forEach(item.dataT.optionList, function (value, key) {
                        if (value) {
                            answer.push(value.text.split('/'));
                        }
                    });
                } else if (item.type === 'e_text') {

                }
                return answer;
            };

            /**
             * 题目添加选项
             * @param item
             */
            $scope.optionAdd = function (item) {
                if (item.dataT.optionList.length > 25) {
                    service.dialog.alert('最多支持26个选项')
                    return;
                }
                item.dataT.optionList.push({
                    text: '请输入选项内容',
                    answer: false
                })
            };

            
            /**
             * 题目删除选项
             * @param item
             * @param index
             */
            $scope.optionDel = function (item, index) {
                item.dataT.optionList.splice(index, 1);
            };

            /**
             * 增加填空题选项
             * @param item
             */
            $scope.optionAddFill = function (item) {
                var editor = getCkeditor(item);
                if (editor) {
                    $timeout(function () {
                        var text = '';
                        editor.execCommand('insertFillOption', {
                            index: item.dataT.optionList.length + 1,
                            selectText: function (rs) {
                                text = rs.text;
                            }
                        });
                        item.dataT.optionList.push({
                            text: text,
                            answer: false
                        })
                    });
                }
            };
            //-----------------------------------------------------------------------------------

            /**
             * 获取当前 Ckeditor Instance
             * @param item
             * @returns {*}
             */
            function getCkeditor(item) {
                var ckId = $('#' + 'q-' + $scope.config.aid + '-' + item.id).find('.content-editor')[0].id;
                return CKEDITOR.instances[ckId];
            }

            /**
             * 警告抖动效果
             * @param ele
             * @param cls
             * @param times
             */
            function shake(ele, cls, times) {
                var i = 0, t = false, o = ele.attr("class") + " ", c = "", times = times || 2;
                if (t) return;
                t = setInterval(function () {
                    i++;
                    c = i % 2 ? o + cls : o;
                    ele.attr("class", c);
                    if (i == 2 * times) {
                        clearInterval(t);
                        ele.removeClass(cls);
                    }
                }, 200);
            }

            $scope.dataEmit = function (index) {

            };

            /**
             * 格式化ITEM内容data
             * @param item
             */
            $scope.formatItemData = function (item) {
                var rs = item.data;
                if (item.type == 'T1') {
                    rs = {
                        title: item.data.title
                    }
                }
                if (item.type == 'e_sel') {
                    rs = {
                        "type": item.data.type,
                        "text": item.data.text,
                        "options": item.data.options,
                        "answer": item.data.answer,
                        "score": item.data.score,
                        "analyze": item.data.analyze
                    };
                }
                if (item.type == 'e_fill') {
                    rs = {
                        "type": item.data.type,
                        "text": item.data.text,
                        "answer": item.data.answer,
                        "score": item.data.score,
                        "analyze": item.data.analyze
                    };
                }
                if (item.type == 'e_text') {
                    rs = {
                        "type": item.data.type,
                        "text": item.data.text,
                        "answer": item.data.answer,
                        "score": item.data.score,
                        "analyze": item.data.analyze
                    };
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
                    g: item.g
                };
            };

            /**
             * 去掉html标签元素
             * @param str
             * @returns {*}
             */
            $scope.transTitle = function (str) {
                if (!str) {
                    return "";
                }
                // str = str.replace(/<\/?[^>]*>/g, '');
                // str = str.replace(/<\/?.+?>/g,"");
                str = str.replace(/<[^>]+>/g,"");
                str = str.replace(/&nbsp;/ig, ' ');//去掉&nbsp;
                str = str.replace(/&ldquo;/ig, '"');//去掉&ldquo;
                str = str.replace(/&rdquo;/ig, '"');//去掉&rdquo;
                str = str.replace(/&quot;/ig, '"');//去掉&rdquo;
                str = str.replace(/&bull;/ig, '');//去掉&bull;
                str = str.replace(/&gt;/ig, '>');//去掉&bull;
                str = str.replace(/&lt;/ig, '<');//去掉&bull;
                str = str.replace(/&#39;/ig, "'");//去掉&bull;
                return str
            };

            /**
             * String添加P标签
             * @param str
             * @returns {string}
             */
            $scope.transTitleR = function (str) {
                return '<p>' + str + '</p>';
            };

            /**
             * 更新元素
             * @param data
             * @param cb
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
             * 更改聚焦元素
             * @param group
             * @param index
             */
            $scope.changeCurFocus = function (group, index) {
                //$scope.curFocusItem = index;
                $scope.curItemIndex.group = group;
                $scope.curItemIndex.index = index;
            };

            $scope.editMode = 'paper';
            /**
             * 改变编辑模式
             * @param mode  'paper': 试卷   'exam': 考试
             */
            $scope.changeEditMode = function (mode) {

            };


            /**
             * 初始化试卷
             * @param tids
             */
            $scope.makeContent = function (tids) {
                art.next(tids).done(function (tart, data) {
                    var tFlag = false;
                    angular.forEach(tids, function (value, id) {
                        var itemData = art.findItem(value, 1, 1);
                        if (itemData && itemData.t && itemData.visiable) {
                            var item = $scope.makePlugin(value, itemData, 'normal');

                            if (item.type === 'T1') {
                                $scope.addGroup();
                                tFlag = true;
                                $scope.paper.groups[$scope.paper.groups.length - 1].title = item;
                            } else if ($scope.paper.groups.length) {
                                if (tFlag) {
                                    if (item.type === 'e_sel') {
                                        $scope.paper.groups[$scope.paper.groups.length - 1].items.push(item);
                                    } else if (item.type === 'e_fill') {
                                        $scope.paper.groups[$scope.paper.groups.length - 1].items.push(item);
                                    } else if (item.type === 'e_text') {
                                        $scope.paper.groups[$scope.paper.groups.length - 1].items.push(item);
                                    } else {
                                        art.removeItem(item.id);
                                    }
                                } else {
                                    art.removeItem(item.id);
                                }
                            }
                        }
                    });
                    if (!tids.length) {
                        $scope.addItem('T1', null, -2, -1);
                    }

                    $scope.calcScore();
                    // $scope.$apply();
                    console.log($scope.paper)

                }).fail(function (err, xhr) {
                    window.resm = err;
                });
            };

            /**
             * 整理试卷额外信息
             */
            $scope.getQuestionExt = function () {
                return {
                    qCount: Number($scope.paper.total),
                    score: Number($scope.paper.score),
                    time: Number($scope.paper.advise_cost),
                    startTime: $("#startTime-" + $scope.config.aid).val(),
                    endTime: $("#endTime-" + $scope.config.aid).val()
                };
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
                        delete art.art.items[key];
                    }
                });

            }


            /**
             * 保存试卷
             */
            var saveFlag = false;
            $scope.savePaper = function (opt) {

                if (saveFlag) {
                    return;
                }

                $timeout(function () {
                    if (saveFlag) {
                        $scope.saveLoading = true;
                    }
                },500);
                saveFlag = true;


                var errFlag = {
                    type: null,
                    msg: ''
                };
                
                clearArtRedundancy();

                if (!$scope.paper.title) {
                    service.dialog.alert('试卷名称不能为空');
                    $scope.saveLoading = false;
                    saveFlag = false;
                    return;
                }
                
                if ($scope.paper.advise_cost && !countReg.test($scope.paper.advise_cost)) {
                    service.dialog.alert(($scope.paper.type === 'e_test'? '考试时长' : '建议时长') + '必须为正整数，单位：分钟');
                    $scope.saveLoading = false;
                    saveFlag = false;
                    return;
                }

                angular.forEach($scope.paper.groups, function (group, keyG) {
                    if (!group.title.data.title) {
                        errFlag.type = 'title';
                        errFlag.msg = '题组名称不能为空';
                        errFlag.id = group.title.id;
                        return;
                    }
                    angular.forEach(group.items, function (item, key) {
                        if (item.mode == 'edit') {
                            errFlag.type = 'item';
                            errFlag.msg = '请先保存题目';
                            errFlag.id = item.id;
                        }
                    });
                });

                if (errFlag.type === 'title') {
                    service.dialog.alert(errFlag.msg);
                    $scope.gotoLoc('q-t-' + $scope.config.aid + '-' + errFlag.id);
                    shake($('#q-t-' + $scope.config.aid + '-' + errFlag.id).find('.main-t1'), "red-alert", 3);
                    $scope.saveLoading = false;
                    saveFlag = false;
                    return;
                }
                if (errFlag.type === 'item') {
                    service.dialog.alert(errFlag.msg);
                    $scope.gotoLoc('q-' + $scope.config.aid + '-' + errFlag.id);
                    shake($('#q-' + $scope.config.aid + '-' + errFlag.id).find('.item-q'), "red-alert", 3);
                    $scope.saveLoading = false;
                    saveFlag = false;
                    return;
                }

                if ($scope.paper.type === 'e_test') {
                    if (!$scope.paper.advise_cost) {
                        service.dialog.alert('请输入考试时长');
                        $scope.saveLoading = false;
                        saveFlag = false;
                        return;
                    }
                    var start_time = +moment($("#startTime-" + $scope.config.aid).val()).format('x') || null;
                    var end_time = +moment($("#endTime-" + $scope.config.aid).val()).format('x') || null;


                    if (!start_time) {
                        service.dialog.alert('请输入考试开始时间');
                        $scope.saveLoading = false;
                        saveFlag = false;
                        return;
                    }
                    if (!end_time) {
                        service.dialog.alert('请输入考试结束时间');
                        $scope.saveLoading = false;
                        saveFlag = false;
                        return;
                    }
                    if (start_time >= end_time) {
                        service.dialog.alert('考试开始时间不能大于结束时间');
                        $scope.saveLoading = false;
                        saveFlag = false;
                        return;
                    }
                }


                angular.forEach($scope.paper.groups, function (group, keyG) {
                    $scope.updateItem(group.title, function () {
                    });
                    angular.forEach(group.items, function (item, key) {
                        $scope.updateItem(item, function () {
                        });
                    });
                });

                art.art.title = $scope.paper.title;
                art.art.desc = $scope.transTitleR($scope.paper.desc);


                $timeout(function () {
                    art.save().done(function (tart, data) {
                        service.dialog.alert("试卷已保存");
                        if (!angular.isUndefined(data)) {
                            if (data.iidm) {
                                var idMap = data.iidm;

                                angular.forEach($scope.paper.groups, function (group, keyG) {
                                    if (idMap[group.title.id]) {
                                        group.title.id = idMap[group.title.id];
                                    }
                                    angular.forEach(group.items, function (item, key) {
                                        if (idMap[item.id]) {
                                            item.id = idMap[item.id];
                                        }
                                    });
                                });

                                console.log(idMap, art, $scope.paper);
                            }
                        }


                        if ($scope.paper.type === 'e_test') {
                            $scope.updateTestInfo();
                            saveFlag = false;
                        } else {

                            updateArtExt($scope.config.aid, {
                                advise_cost: Number($scope.paper.advise_cost) * 60 * 1000,
                                es_auto_published: $scope.paper.answerPub ? true : false
                            });

                            var info = {
                                aid: $scope.config.aid,
                                id: $scope.config.id,
                                title: $scope.paper.title,
                                tid: null,
                                desc: $scope.paper.desc,
                                type: $scope.paper.type,
                                ext: $scope.getQuestionExt()
                            };

                            console.log(info)
                            $scope.config.save(info);

                            saveFlag = false;
                        }
                        $scope.saveLoading = false;
                        $scope.$apply();

                    }).fail(function () {
                        $scope.saveLoading = false;
                        saveFlag = false;
                        $scope.$apply();
                        service.dialog.alert("试卷保存失败")
                    });
                });

            };

            /**
             * 退出编辑
             */
            $scope.closeEdit = function () {
                resetPaper();
                $scope.config.back({aid: $scope.config.aid});
            };

            /**
             * 计算题组总分与试卷总分
             */
            $scope.calcScore = function () {
                var total = 0;
                var score = 0;
                angular.forEach($scope.paper.groups, function (group, keyG) {
                    var scoreC = 0;
                    if (group.title) {
                        total += group.items.length;
                        angular.forEach(group.items, function (item, key) {

                            if (scoreReg.test('' + item.data.score) || item.data.score === '') {
                                item.data.score = Number(item.data.score);
                                scoreC += item.data.score;
                                item.scoreAlert = '';
                            } else {
                                item.scoreAlert = '题目分数必须为正整数';
                            }

                        });
                    }
                    group.title.score = scoreC;
                    score += scoreC;
                });
                $scope.paper.total = total;
                $scope.paper.score = score;
            };

            /**
             * 清楚分值
             * @param group
             */
            $scope.clearScore = function (group) {
                if (group) {
                    $scope.paper.groups[group].aveScore = null;
                } else {
                    angular.forEach($scope.paper.groups, function (value, key) {
                        value.aveScore = null;
                    });
                }
            };

            $scope.changeQuestionScore = function (item) {
                var pos = $scope.getGroupIndex(item.id);
                if (pos && item.data.score != $scope.paper.groups[pos.group].aveScore) {
                    $scope.clearScore(pos.group);
                }
                $scope.calcScore();
            };


            var asKeyDown = false;

            /**
             * 设置平均分
             * @param group
             */
            $scope.averageScore = function (group) {

                if (group.aveScoreTmp == group.aveScore) {
                    asKeyDown = false;
                    return;
                }

                if (!group.items.length) {
                    group.aveScoreTmp = group.aveScore;
                    asKeyDown = false;
                    return;
                }

                if (!scoreReg.test(group.aveScore) && group.aveScore !== '') {
                    group.scoreAlert = '分数必须为正整数';
                    asKeyDown = false;
                    return;
                }

                var qEditFlag = false;
                angular.forEach(group.items, function (value, key) {
                    if (value.mode !== 'normal') {
                        qEditFlag = true;
                    }
                });

                if (qEditFlag) {
                    service.dialog.alert('你还有题目未保存，不能快速给分');
                    group.aveScore = group.aveScoreTmp;
                    asKeyDown = false;
                    return;
                }

                group.scoreAlert = '';

                service.dialog.confirm('确定修改题组内所有题目的分值？', {mask: true}, function () {
                    $scope.$apply(function () {
                        var score = Number(group.aveScore);
                        group.aveScoreTmp = score;
                        angular.forEach(group.items, function (item, key) {
                            item.data.score = score;
                        });
                        $scope.calcScore();
                        asKeyDown = false;
                    });
                }, function () {
                    $scope.$apply(function () {
                        group.aveScore = group.aveScoreTmp;
                        asKeyDown = false;
                    });
                });
            };

            $scope.averageScoreBlur = function (group) {
                if (asKeyDown) {
                    return;
                }
                $timeout(function () {
                    asKeyDown = true;
                    $scope.averageScore(group);
                },300);
            };

            $scope.averageScoreKeyDown = function (event, group) {
                if (asKeyDown) {
                    return;
                }
                if (event.keyCode === 13) {
                    asKeyDown = true;
                    event.stopPropagation();
                    $scope.averageScore(group);
                }
            };

            /**
             * 获取考试信息
             * @param tid
             * @param cb
             */
            $scope.getTestInfo = function (tid, cb) {
                service.examReq.loadTest({
                    tid: tid
                }).then(function (rs) {
                    if (rs.code === 0) {
                        $scope.paper.advise_cost = Math.floor(rs.data.cost_time / 60000);
                        $scope.paper.tInfo.start_time = rs.data.start_time ? moment(rs.data.start_time).format('YYYY-MM-DD HH:mm') : null;
                        $scope.paper.tInfo.end_time = rs.data.end_time ? moment(rs.data.end_time).format('YYYY-MM-DD HH:mm') : null;
                        cb();
                    } else {
                        service.dialog.alert('试卷信息读取失败');
                        $scope.config.tid = null;
                        cb();
                    }
                }, function (rs) {
                    service.dialog.alert('试卷信息读取失败');
                    $scope.config.tid = null;
                    cb();
                })
            };

            /**
             * 更新考试信息
             */
            $scope.updateTestInfo = function () {
                var postData = {
                    params: {
                        cid: $scope.config.cid
                    },
                    data: {
                        "title": $scope.paper.title,
                        "desc": $scope.paper.desc,
                        "multi": 300,
                        "cost_time": Number($scope.paper.advise_cost) * 60 * 1000,
                        "start_time": +moment($("#startTime-" + $scope.config.aid).val()).format('x') || undefined,
                        "end_time": +moment($("#endTime-" + $scope.config.aid).val()).format('x') || undefined,
                        "aids": [$scope.config.aid]
                    }
                };
                if ($scope.config.tid) {
                    postData.data.id = $scope.config.tid;
                }
                service.examReq.insertTest(postData).then(function (rs) {
                    if (rs.code === 0) {
                        $scope.config.tid = rs.data.id;
                        $scope.paper.tid = rs.data.id;
                        var info = {
                            aid: $scope.config.aid,
                            id: $scope.config.id,
                            title: $scope.paper.title,
                            tid: $scope.paper.tid,
                            desc: $scope.paper.desc,
                            type: $scope.paper.type,
                            ext: $scope.getQuestionExt()
                    };
                        $scope.config.save(info);
                    }
                });
            };

            /**
             * 初始化
             */
            $scope.init = function () {
                if (!$scope.config.aid) {
                    $scope.loading = true;
                    $scope.closeEdit();
                    return;
                }

                art = new wcms.Article($scope.config.aid, "T", 3);
                art.args.uid = 1;
                art.args.token = rcpAid.getToken();

                resetPaper();

                getArtExt($scope.config.aid);

                $scope.paper.title = art.art.title;
                $scope.paper.desc = $scope.transTitle(art.art.desc);
                $scope.paper.type = $scope.config.type;

                if (!$scope.paper.type || ($scope.paper.type !== 'e_paper' && $scope.paper.type !== 'e_test' && $scope.paper.type !== 'e_exercise')) {
                    $scope.paper.type = 'e_paper';
                }

                art.run().done(function (tart, data) {

                    $scope.idsContent = tart.findIids();


                    if ($scope.config.type === 'e_test' && $scope.config.tid) {
                        $scope.getTestInfo($scope.config.tid, paperInfoHandle);
                    } else {
                        paperInfoHandle();
                    }
                    $scope.$apply();

                }).fail(function (err, xhr) {
                    
                    $scope.loading = false;
                    $scope.$apply();

                    //数据版本不符时重新拉取数据
                    if (err == 'new version') {
                        //service.dialog.alert('本地版本与服务器版本不一致，将重新获取课程内容数据');
                        art.ls_clear();
                        $scope.init();
                    } else {
                        service.dialog.alert('试卷信息读取失败');
                        $scope.closeEdit();
                    }
                });
            };

            /**
             * 处理试卷信息
             */
            function paperInfoHandle() {
                $scope.loading = true;

                //构造内容
                $scope.makeContent($scope.idsContent);
            }


            /**
             * 更新试卷额外信息
             * @param aid
             * @param ext
             */
            function updateArtExt(aid, ext) {
                service.course.updateArticleExt({
                    aid: aid,
                    ext: ext
                }).then(function (rs) {

                });
            }

            /**
             * 获取试卷额外信息
             * @param aid
             */
            function getArtExt(aid) {
                service.course.getArticleExt({
                    aids: aid
                }).then(function (rs) {
                    if (rs.code === 0 && rs.data[aid]) {

                        if (rs.data[aid].total) {
                            service.dialog.confirm('本试卷已有有' + rs.data[aid].total + '名学生作答，修改会影响学生成绩',{mask: true},function () {

                            },function () {
                                $scope.closeEdit();
                            });
                        }

                        if (rs.data[aid].advise_cost) {
                            $scope.paper.advise_cost = Math.floor(rs.data[aid].advise_cost / 60000);
                        }
                        $scope.paper.answerPub = rs.data[aid].es_auto_published ? true : false;
                    }
                });
            }


            //-------------------------------------------------------------------------------
            //页面锚点
            $scope.gotoLoc = function (arg_id) {
                $timeout(function () {
                    $('#ew-paper-' + $scope.config.aid).scrollTo('#' + arg_id, 200);
                });
            };

            /**
             * 预览
             */
            $scope.preview = function () {

            };



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

        }]
    }
});

