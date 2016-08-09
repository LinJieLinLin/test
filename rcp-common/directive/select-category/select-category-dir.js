//新版分类树菜单
module.directive("sortTreeMenu", function() {
    return {
        template: [
            '<ul>',
            '<li ng-repeat="item in list track by $index" ng-class="{ hover : isHover(item) || item.hover }" ng-mouseenter="onmouseenter(item)" ng-mouseleave="onmouseleave(item)">',
            '<div class="text-of" ng-click="option.click(item.name,$event.target)">',
            '<i ng-show="item.child.length">&gt;</i>',
            '<span title="{{item.name}}">{{item.name}}</span>',
            '</div>',
            '</li>',
            '</ul>'
        ].join(''),
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            list: "=",
            option: "="
        },
        controller: ['$scope', '$compile', '$element', '$timeout', function($scope, $compile, $element, $timeout) {
            $scope.isHover = function(item) {
                return $.inArray(item.name, $scope.option.select) !== -1 ? true : false;
            };

            $scope.onmouseenter = function(item) {
                $scope.option.clear();
                item.hover = true;
            };

            $scope.onmouseleave = function(item) {
                item.hover = false;
            };

            $scope.$watch("list", function(data) {
                if (data) {
                    $timeout(function() {
                        angular.forEach(data, function(item, index) {
                            if (item.child && item.child.length) {
                                $scope['child_' + index] = item;
                                $element.find('li').eq(index).append($compile('<sort-tree-menu list="child_' + index + '.child" option="option"></sort-tree-menu>')($scope));
                            }
                        });
                    }, 200);
                }
            });
        }]
    };
});

//新版课程分类选择
module.directive("selectCategory", function() {
    return {
        template:'<div class="main-cat"><div class="search-sort" ng-click="stopPropagation($event)" onmouseenter=\'$(this).find("input:eq(0)").focus()\' ng-mouseover="searchChange(\'focus\',$event)" ng-mouseenter="showSearchLock = true" ng-mouseleave="onmouseleave($event)"><a href="javascript:;" class="new-cat" ng-show="!showSearchLock">添加分类</a> <span class="input-w" ng-show="showSearchLock"><input type="text" id="kw-sc-input" class="input" ng-model="sortKeyWork" ng-focus="searchChange(\'focus\',$event)" ng-change="searchChange(\'change\',$event)" ng-keydown="onkeydown($event)" ng-blur="onblur($event)" placeholder="请输入关键词"> <i class="fa fa-plus-circle add-key-wrok" title="创建关键词" ng-show="!inSort && sortKeyWork" ng-click="addKeyWork(sortKeyWork)"></i><div class="select-sort" ng-show="showSelect"><sort-tree-menu id="tag-sle-v" list="allSortTag" option="selectOption" ng-show="inSort || showSort"></sort-tree-menu></div></span></div><div><a href="javascript:;" class="f-r" ng-click="showMoreKwLock = !showMoreKwLock" ng-show="checkShowMoveLock()"><span ng-show="!showMoreKwLock">展开</span> <span ng-show="showMoreKwLock">收起</span></a><div class="kw-laber" ng-class="{smove: showMoreKwLock}" ng-show="labelList.length || categoryList.length"><div class="kw-laver-wrap"><p ng-repeat="item in labelList track by $index" class="block-w" ng-class="{last: $index == labelList.length-1 && !keyWordList.length}"><span ng-repeat="name in item track by $index" class="grid"><a href="javascript:;" class="key text-of" title="{{name}}"><i class="fa fa-times-circle" title="删除" ng-click="deleteEvent(name,item)"></i> {{name}}</a></span></p><p ng-hide="!categoryList.length"><a href="javascript:;" class="key text-of" ng-repeat="name in categoryList track by $index" title="{{name}}"><i class="fa fa-times-circle" title="删除" ng-click="deleteEvent(name)"></i> {{name}}</a></p></div></div><p class="more" ng-show="checkShowMoveLock() && !showMoreKwLock">...</p></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            tags: '='
        },
        controller: ['$rootScope', '$scope', '$element', '$document', '$timeout', '$http', 'service', function($rootScope, $scope, $element, $document, $timeout, $http, service) {

            var codeTree = {}; //编码树
            var charTree = []; //源码树

            $scope.sortKeyWork = '';
            $scope.inSort = false;
            $scope.kwThumbnail = [];

            $rootScope.categoryList = $rootScope.categoryList || [];
            $rootScope.labelList = $rootScope.labelList || [];

            //整合选中的分类、关键词到一行数组里
            function concatKwHandle() {
                $scope.kwThumbnail.splice(0, $scope.kwThumbnail.length);
                angular.forEach($rootScope.labelList, function(item) {
                    angular.forEach(item, function(value) {
                        $scope.kwThumbnail.push({
                            name: value,
                            item: item
                        });
                    });
                });
                angular.forEach($rootScope.categoryList, function(value) {
                    $scope.kwThumbnail.push({
                        name: value
                    });
                });
            }

            //初始化分类树
            function initTree(list) {
                angular.forEach(list, function(item) {
                    sortEventHandle(
                        'push', {
                            selectArr: item
                        }
                    );
                });
                treeHandleReady();
            }

            //获取字符编码
            function getCharCode(str) {
                var arr = str.split('');
                var code = '';
                angular.forEach(arr, function(value) {
                    code = code + '_' + value.charCodeAt();
                });
                return code.substring(1, code.length);
            }

            //字符编码树
            function charCodeTree(data, type) {
                var flag = true;
                var parent = codeTree;
                $(data).each(function(i, value) {
                    var code = getCharCode(value);
                    if (!parent[code]) {
                        flag = false;
                        if (type === 'isHave') {
                            return false;
                        }
                        if (type === 'create') {
                            parent[code] = {
                                name: value,
                                child: {}
                            };
                        }
                    }
                    parent = parent[code].child;
                });
                return flag;
            }

            //树处理就绪
            function treeHandleReady() {
                charTree.splice(0, charTree.length);
                resolveTreeHandle(codeTree, charTree);
                resolveSortList(getSortStringList(charTree, []));
                // console.info(charTree, 'charTree');
            }

            //解析源码树处理
            function resolveTreeHandle(list, child) {
                var parent = child;
                angular.forEach(list, function(item) {
                    var newChild = {
                        name: item.name,
                        child: []
                    };
                    parent.push(newChild);
                    if (item.child && checkObjectIsHaveMember(item.child)) {
                        resolveTreeHandle(item.child, newChild.child);
                    }
                });
            }

            //解析选中的分类数组列表
            function resolveSortList(result) {
                var list = $rootScope.labelList;
                list.splice(0, list.length);
                angular.forEach(result, function(item) {
                    list.push(item.split(','));
                });
            }

            //解析选中的分类字符串列表
            function getSortStringList(tree, result) {
                getSortStringListAidEvent(tree, undefined, result);
                return result;
            }
            
            //解析选中的分类字符串列表的辅助事件
            function getSortStringListAidEvent(list, params, result) {
                angular.forEach(list, function(item) {
                    var string = params === undefined ? item.name : params + ',' + item.name;
                    if (item.child && item.child.length) {
                        getSortStringListAidEvent(item.child, string, result);
                    }
                    filterDuplicateSortList(result, string);
                });
            }

            //过滤重复的分类字符串（包括 push 分类字符串）
            function filterDuplicateSortList(list, params) {
                var flag;
                $(list).each(function(i, value) {
                    flag = value.match(new RegExp('^' + params, 'i'));
                    if (flag) {
                        return false;
                    }
                });
                if (!flag) {
                    list.push(params);
                }
            }

            //删除树成员
            function deleteTreeMember(list) {
                var tree = codeTree;
                angular.forEach(list, function(value, i) {
                    var code = getCharCode(value);
                    if (i === list.length - 1) {
                        delete deleteTreeMemberAidEvent(tree)[code];
                    } else {
                        tree = deleteTreeMemberAidEvent(tree)[code];
                    }
                });
                treeHandleReady();
            }

            //删除树成员辅助事件
            function deleteTreeMemberAidEvent(tree) {
                if (tree.child && checkObjectIsHaveMember(tree.child)) {
                    tree = tree.child;
                }
                return tree;
            }

            //检测对象是否有成员
            function checkObjectIsHaveMember(obj) {
                var flag;
                for (var member in obj) {
                    if (obj.hasOwnProperty(member)) {
                        flag = true;
                        break;
                    }
                }
                return flag;
            }

            //获取分类下拉菜单被选字符串
            function getSelectString() {
                var select = [];
                var get = function(parent) {
                    if (parent.length) {
                        select.push(parent.eq(0).find('> div > span:eq(0)').html());
                        get(parent.eq(0).find('> ul > li.hover'));
                    }
                };
                get($('#tag-sle-v > li.hover'));
                return select;
            }

            //添加分类处理
            function addSortHandle(arr, ishaveCallback, nohaveCallback) {

                var checkIsHave = 0;
                angular.forEach(arr, function (value, key) {
                    if ($.inArray(value, $rootScope.categoryList) === -1) {
                        $rootScope.categoryList.push(value);
                    } else {
                        checkIsHave++;
                    }
                });

                if (checkIsHave === arr.length) {
                    if (typeof nohaveCallback === 'function') {
                        nohaveCallback();
                    }
                    return;
                }
                if (typeof nohaveCallback === 'function') {
                    ishaveCallback();
                }
            }

            //删除分类处理
            function delSortHandle(name, item) {
                var copy = angular.copy(item);
                var arr = copy.splice(0, $.inArray(name, copy) + 1);
                deleteTreeMember(arr);
            }

            //树事件
            function sortEventHandle(type, option) {
                switch (type) {
                    case 'push':
                        addSortHandle(option.selectArr, option.ishaveCallback, option.nohaveCallback);
                        break;
                    case 'delete':
                        delSortHandle(option.name, option.item);
                        break;
                }
            }

            //所有分类递归
            function sortAllTagRecursive(arr, callback) {
                if ($scope.inSort && !angular.isArray(arr)) {
                    return;
                }
                angular.forEach(arr, function(item) {
                    if ($scope.inSort) {
                        return false;
                    }
                    if (!callback(item)) {
                        if (angular.isArray(item.child) && item.child.length) {
                            sortAllTagRecursive(item.child, callback);
                            selectArrayEvent('push', item.name);
                        }
                    }
                });
            }

            //在所有分类里匹配选中的分类层级
            function matchKeyWork(allSort,work) {
                $scope.inSort = false;
                $scope.showSelect = true;
                selectArrayEvent('clear');

                sortAllTagRecursive(
                    allSort,
                    function(item) {
                        $scope.inSort = item.name === work;
                        if ($scope.inSort) {
                            selectArrayEvent('push', item.name);
                        }
                        return $scope.inSort;
                    }
                );

                switch ($scope.inSort) {
                    case true:
                        selectArrayEvent('splice', work);
                        break;
                    default:
                        selectArrayEvent('clear');
                }
            }

            //在所有分类里匹配选中的分类层级的数组事件
            function selectArrayEvent(type, item) {
                var array = $scope.selectOption.select;
                switch (type) {
                    case 'clear':
                        array.splice(0, array.length);
                        break;
                    case 'push':
                        array.push(item);
                        break;
                    case 'splice':
                        array.splice(0, $.inArray(item, array));
                        break;
                }
            }

            //文档绑定搜索框失去焦点事件
            function docBindClick() {
                $document.unbind('click').bind('click', function() {
                    $scope.blurFn('digest');
                });
            }

            //闪烁DOM元素（分类、关键词已添加过时处理）
            function flickerTarget(target, attr, color) {
                var css = {};
                css[attr] = color || 'orange';
                $(target).css(css);
                setTimeout(function() {
                    css[attr] = '';
                    $(target).css(css);
                }, 200);
            }

            //搜索框内容改变时处理
            $scope.searchChange = function(type,ev) {
                switch (type) {
                    case 'focus':
                        docBindClick();
                        $scope.focusLock = true;
                        $scope.selectSortEvent(ev);
                        break;
                    default:
                        if($scope.showSort){
                            $scope.showSort = false;
                        }
                }
                if ($scope.sortKeyWork) {
                    matchKeyWork($scope.allSortTag, $scope.sortKeyWork);
                } else {
                    if(type !== 'focus'){
                        $scope.selectSortEvent();
                    }
                }
            };

            //搜索框失去焦点后的处理
            $scope.blurFn = function(digest, clearInput) {
                $scope.inSort = false;
                $scope.showSort = false;
                $scope.showSelect = false;
                selectArrayEvent('clear');
                $document.unbind('click');
                if (clearInput) {
                    $scope.sortKeyWork = '';
                }
                if (digest) {
                    $scope.$digest();
                }
            };

            //查看更多窗口
            $scope.showMoreWin = function() {
                $('#kw-laber-win').window({
                    mask: false
                });
            };

            //阻止事件冒泡
            $scope.stopPropagation = function(ev) {
                ev.stopPropagation();
            };

            //添加关键词
            $scope.addKeyWork = function(name) {
                var list = $rootScope.categoryList;
                if (!name) {
                    service.dialog.alert('关键词不能为空');
                    return;
                }
                if ($.inArray(name, list) === -1) {
                    list.push(name);
                    $scope.blurFn(false, 'clearInput');
                    // service.dialog.alert('关键词添加成功');
                } else {
                    service.dialog.alert('关键词已添加过');
                    flickerTarget($('#kw-sc-input'), 'borderColor');
                }
            };

            $scope.checkShowMoveLock = function(){
                var flag = $element.find('.kw-laver-wrap').height() < 90;
                if(flag){
                    $scope.showMoreKwLock = false;
                }
                return !flag;
            };

            //删除关键词
            $scope.deleteKeyWork = function(name) {
                var list = $rootScope.categoryList;
                var index = $.inArray(name, list);
                var flag = index !== -1 ? true : false;
                if (flag) {
                    list.splice(index, 1);
                }
                return flag;
            };

            //分类、关键词删除
            $scope.deleteEvent = function(name, item) {
                if ($scope.deleteKeyWork(name)) {
                    $scope.checkShowMoveLock();
                    return;
                }
                sortEventHandle('delete', {
                    name: name,
                    item: item
                });
                checkShowMoveLock();
            };

            //添加分类事件
            $scope.addEvent = function(name, target) {
                sortEventHandle(
                    'push', {
                        selectArr: getSelectString(),
                        nohaveCallback: function() {
                            service.dialog.alert('所选分类都已添加过');
                            flickerTarget($(target).parent(), 'backgroundColor');
                            $scope.focusLock = true;
                            $timeout(function (){
                                $scope.focusLock = false;
                            },220);
                            // $('#kw-sc-input').find('input:eq(0)').focus();
                        },
                        ishaveCallback: function() {
                            treeHandleReady();
                            // service.dialog.alert('分类添加成功');
                            $scope.blurFn(false, 'clearInput');
                        }
                    }
                );
            };

            $scope.onmouseleave = function (){
                $timeout(function (){
                    if(!$scope.focusLock){
                        $scope.showSearchLock = false;
                    }
                }, 220);
            };

            $scope.onblur = function (){
                $scope.focusLock = false;
                $timeout(function (){
                    if($scope.showSearchLock && !$scope.focusLock){
                        $scope.showSearchLock = false;
                    }
                }, 200);
            };

            //回车事件
            $scope.onkeydown = function(ev) {
                if (ev.keyCode === 13 && $scope.sortKeyWork) {
                    if ($scope.inSort) {
                        $scope.addEvent($scope.sortKeyWork);
                    } else {
                        $scope.addKeyWork($scope.sortKeyWork);
                        $scope.selectSortEvent(ev);
                    }
                }
            };

            //选择分类
            $scope.selectSortEvent = function(ev) {
                $scope.showSort = $scope.sortKeyWork ? false : true;
                $scope.showSelect = $scope.sortKeyWork ? false : true;
                if(ev){
                    ev.stopPropagation();
                }
            };

            //分类下拉菜单组件参数
            $scope.selectOption = {
                select: [],
                click: $scope.addEvent,
                clear: function() {
                    selectArrayEvent('clear');
                }
            };

            //监视回调
            function watchCallback(value, type) {
                if (value) {
                    if (type === 'labelList') {
                        if (!$scope.initTreeLock && value.length) {
                            $scope.initTreeLock = !$scope.initTreeLock;
                            initTree(value);
                        }
                        angular.forEach(value, function(item, index) {
                            if (!item.length) {
                                value.splice(index, 1);
                            }
                        });
                    }
                    concatKwHandle();

                    $scope.categoryList = $rootScope.categoryList;
                    $scope.labelList = $rootScope.labelList;
                }
            }

            $rootScope.$watch('labelList', function(value) {
                watchCallback(value, 'labelList');
            }, true);

            $rootScope.$watch('categoryList', function(value) {
                watchCallback(value);
            }, true);

            //tags字段转换为child
            function transNewTag(data) {
                if (!data) {
                    return;
                }
                angular.forEach(data, function (value, key) {
                    if (value.tags.length) {
                        value.child = transNewTag(value.tags);
                    }
                });
                return data;
            }

            $scope.$watch('tags', function(value) {
                $scope.allSortTag = transNewTag($scope.tags);
            }, true);
        }]
    };
});