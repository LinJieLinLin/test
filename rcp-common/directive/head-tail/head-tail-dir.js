/**
 * Created by FENGSB on 2015/8/12.
 */


// 定义包含头部搜索方法的factory
module.factory('headSearch', ['request', function(request) {
    var pesUrl = g_conf.pes.rUrl;
    return {
        // 智能搜索课程 api->https://api.gdy.io/#w_gdy_io_dyf_pes_pesapiSearchIntelligent
        SearchIntelligent: function(arg_params, arg_filter) {
            var option = {
                method: 'GET',
                url: pesUrl + 'pub/api/SearchIntelligent',
                params: arg_params,
                // 禁止显示头部loading条->request.js
                option: {
                    loading: false
                }
            };
            return request(angular.extend(option, arg_filter || {}));
        }
    };
}]);

module.run(['service', 'headSearch', function(service, headSearch) {
    service.expand('headSearch', function() {
        return headSearch;
    });
}]);

//@ 头部
module.directive("headnav", function() {
    return {
        template:'<header><div ng-class="headMaximizeLock ? \'head-maximize\' : \'head-minimize\'"><div ng-class="param.style"><div class="image-head-rainbow decoration-ic"></div><section class="g-m-w header-area"><div class="minimize-logo"><a ng-href="{{param.logo.href||\'/\'}}"><img ng-src="{{param.logo.small}}" alt="{{param.logo.msg}}" title="{{param.logo.msg}}"></a></div><nav class="minimize-nav"><ul><li ng-repeat="item in navList track by $index" ng-class="item.class"><a ng-href="{{item.href || \'\'}}" target="{{item.target || \'_self\'}}">{{item.name}}</a><div ng-if="item.child.length"><ul><li ng-repeat="c in item.child"><a ng-href="{{c.href || \'\'}}" target="{{c.target || \'_self\'}}">{{c.name}}</a></li></ul></div></li></ul></nav><div class="logo"><a ng-href="{{param.logo.href||\'/\'}}"><img ng-src="{{param.logo.large}}" alt="{{param.logo.msg}}" title="{{param.logo.msg}}"></a></div><div class="top-user-menu-bar" ng-class="{clearminw: user.account}"><top-user-menu user="user" item-list="itemList"></top-user-menu></div><div class="h-sc" ng-controller="headSearchCtrl"><div class="head-search-bar"><div class="enter" ng-click="stopPropagation($event)"><input type="text" class="input" ng-model="scText" ng-keydown="onkeydown($event)" ng-change="matchChange(scSelectVal.value,scText)" placeholder="请输入关键词搜索"><div class="match-kw-v" ng-show="matchReadyLock && mcCourseList && mcCourseList.length"><div class="mc-list"><ul><li ng-repeat="item in mcCourseList track by $index" ng-click="intoDetail(item)" ng-if="$index < cMaxLen" ng-class="{hover: $index + lMaxLen == moveKeyIndex}" ng-mouseenter="mouseenter($index, \'资源\')"><div class="text-of pd-r10"><a class="item-name" ng-bind-html="item.name | titleMatchKw:scText"></a></div></li></ul></div></div></div><a ng-click="goToSearch(scSelectVal.value,scText)" class="submit" title="提交"><i class="fa fa-search" aria-hidden="true"></i></a></div><div class="hot-word"><a ng-href="javascript:void(0);" ng-click="goToSort(item.name)" class="mg-r20" ng-repeat="item in scHotWord">{{item.name}}</a></div></div></section><section class="nav-area"><div class="g-m-w"><div class="n-categories" ng-controller="categoriesCtrl" ng-mouseenter="service.mouseenter(hover)" ng-mouseleave="service.mouseleave(hover)"><div class="dt">全部课程</div><div class="dd" id="by-categories" ng-show="categoriesUnfoldLock || hover.mouseEnterLock"><div class="image-giraffe giraffe-icon"></div><div class="dd-inner"><div class="item" ng-repeat="item in categoriesListStyle1 track by $index" ng-mouseenter="service.mouseenter(item)" ng-mouseleave="service.mouseleave(item)" ng-show="$index<5 || hover.mouseEnterLock"><div class="layer"><h3><a ng-href="goToCategory(item.name)" target="_blank" title="{{item.name}}">{{item.name}}</a></h3><div class="hot-word"><a ng-href="goToCategory(item.name,child.name)" target="_blank" class="text-of" ng-repeat="child in item.child track by $index" ng-show="$index<3" title="{{child.name}}">{{child.name}}</a></div><i>&gt;</i></div><div class="sub" ng-show="item.mouseEnterLock"><div class="inner"><dl class="card" ng-repeat="child in item.child track by $index" ng-show="$index<3"><dt><a ng-href="goToCategory(item.name,child.name)" target="_blank" class="f-r">更多&gt;&gt;</a> <a ng-href="goToCategory(item.name,child.name)" target="_blank" title="{{child.name}}">{{child.name}}</a></dt><dd><a ng-href="goToCategory(item.name,child.name,unit.name)" target="_blank" class="text-of" ng-repeat="unit in child.child track by $index" ng-show="$index<15" title="{{unit.name}}">{{unit.name}}</a></dd></dl><div class="more-srot" ng-show="item.child.length>3"><a ng-href="goToCategory(item.name)" target="_blank" class="f-r">更多分类&gt;&gt;</a>. . .</div></div></div></div><div ng-repeat="list in categoriesListStyle2 track by $index"><div class="big-sort"><a ng-href="goToCategory(item.name)" target="_blank" title="{{list.name}}">{{list.name}}</a></div><div class="item" ng-repeat="item in list.child track by $index" ng-mouseenter="service.mouseenter(item)" ng-mouseleave="service.mouseleave(item)"><div class="layer"><h3><a ng-href="goToCategory(list.name,item.name)" target="_blank" title="{{item.name}}">{{item.name}}</a></h3><i>&gt;</i></div><div class="sub" ng-show="item.mouseEnterLock"><div class="inner"><dl class="card" ng-repeat="child in item.child track by $index" ng-show="$index<4"><dt><a ng-href="goToCategory(list.name,item.name,child.name)" target="_blank" class="f-r">更多&gt;&gt;</a> <a ng-href="goToCategory(list.name,item.name,child.name)" target="_blank" title="{{child.name}}">{{child.name}}</a></dt><dd><a ng-href="goToCategory(list.name,item.name,child.name,unit.name)" target="_blank" class="text-of" ng-repeat="unit in child.child track by $index" ng-show="$index<10" title="{{unit.name}}">{{unit.name}}</a></dd></dl><div class="more-srot" ng-show="item.child.length>4"><a ng-href="goToCategory(list.name,item.name)" target="_blank" class="f-r">更多分类&gt;&gt;</a>. . .</div></div></div></div></div></div></div></div><nav class="nav"><a ng-repeat="item in navList track by $index" ng-href="{{item.href || \'\'}}" target="{{item.target || \'_self\'}}" ng-class="item.class">{{item.name}}</a></nav><div class="extra" ng-show=""><a href="javascript:void(0);" class="icf t-icf">名师认证</a> <a href="javascript:void(0);" class="icf e-icf">真实评价</a> <a href="javascript:void(0);" class="icf r-icf">随时退</a></div></div></section></div></div></header>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            itemList: "=itemList",
            user: "=user",
            nav: "="
        },
        controller: ['$rootScope', '$scope', '$element', '$attrs', 'service', function($rootScope, $scope, $element, $attrs, service) {
            $scope.service = service;
            $scope.catType = parseInt(rcpAid.getCourseCat());


            $rootScope.$watch('headMaximizeLock', function(value) {
                if (value) {
                    $scope.headMaximizeLock = value;
                }
            });

            $rootScope.$watch('categoriesUnfoldLock', function(value) {
                if (value) {
                    $scope.categoriesUnfoldLock = value;
                }
            });

            $rootScope.$watch('catDomain', function(value) {
                if (value) {
                    switch (value) {
                        case 'aikexue.com':
                            $scope.init(2);
                            break;
                    }
                }
            });
            //new new nwe  
            //判断是否登陆
            $scope.$on('login', function(rs, data) {
                if (!data) {
                    return;
                }
                var temLen = $scope.navList.length;
                for (var i = 0; i < temLen; i++) {
                    if ($scope.navList[i].name === '学习中心') {
                        $scope.navList[i].href = rcpAid.getUrl('学习中心');
                        break;
                    }
                }
                $scope.loginInit();
            });
            /**
             * [loginInit 需要登陆才执行的操作]
             * @return {[type]} [description]
             */
            $scope.loginInit = function() {
            };
            $scope.init = function() {
                if ($scope.nav === "order") {
                    $scope.navList = [{
                        name: '首页',
                        href: rcpAid.getUrl('首页'),
                        class: 'key'
                    }, {
                        name: '个人空间',
                        href: rcpAid.getUrl('学习中心'),
                        class: 'key',
                        target: '_blank'
                    }];
                    $scope.param = {
                        logo: {
                            small: '/rcp-common/imgs/order/head-icon.png',
                            large: '/rcp-common/imgs/icon/head-icon.png',
                            href: '/my-order.html',
                            msg: '我的酷校'
                        },
                        style: ''
                    };
                    return;
                }
                switch ($scope.catType) {
                    case 1:
                        $scope.navList = [{
                            name: '首页',
                            href: rcpAid.getUrl('首页'),
                            class: 'key'
                        }, {
                            name: '学习中心',
                            href: rcpAid.getUrl('登录', {
                                url: encodeURIComponent(location.protocol + '//' + location.host + rcpAid.getUrl('学习中心'))
                            }),
                            class: 'key',
                            target: '_blank'
                        }, {
                            name: '我要吐槽',
                            href: rcpAid.getUrl('我要吐槽'),
                            class: 'key',
                            target: '_blank'
                        }];
                        $scope.param = {
                            logo: {
                                small: '/rcp-common/imgs/icon/book-logo-2.png',
                                large: '/rcp-common/imgs/icon/book-logo.png',
                                href: DYCONFIG.rcp.rUrl,
                                msg: '酷校LOGO·让学习更Cool'
                            },
                            style: ''
                        };
                        break;
                    case 2:
                        $scope.navList = [{
                            name: '首页',
                            href: rcpAid.getUrl('首页'),
                            class: 'key'
                        }, {
                            name: '学习中心',
                            href: rcpAid.getUrl('登录', {
                                url: encodeURIComponent(location.protocol + '//' + location.host + rcpAid.getUrl('学习中心'))
                            }),
                            class: 'key',
                            target: '_blank'
                        }];
                        $scope.param = {
                            logo: {
                                small: '/rcp-common/imgs/icon/aikexue-logo-2.png',
                                large: '/rcp-common/imgs/icon/aikexue-logo.png',
                                href: DYCONFIG.rcp.rUrl,
                                msg: '爱科学—小伙伴最爱玩的科普社区'
                            },
                            style: 'aikexue-head'
                        };
                        break;
                    case 3:
                        $scope.navList = [{
                            name: '首页',
                            href: rcpAid.getUrl('首页'),
                            class: 'key'
                        }, {
                            name: '学习中心',
                            href: rcpAid.getUrl('登录', {
                                url: encodeURIComponent(location.protocol + '//' + location.host + rcpAid.getUrl('学习中心'))
                            }),
                            class: 'key',
                            target: '_blank'
                        }, {
                            name: '我要吐槽',
                            href: rcpAid.getUrl('我要吐槽'),
                            class: 'key',
                            target: '_blank'
                        }];
                        $scope.param = {
                            logo: {
                                small: '/rcp-common/imgs/icon/gzmooc-logo-2.png',
                                large: '/rcp-common/imgs/icon/gzmooc-logo.png',
                                href: DYCONFIG.rcp.rUrl,
                                msg: '酷校LOGO·让学习更Cool'
                            },
                            style: ''
                        };
                        break;
                    default:
                        $scope.navList = [{
                            name: '首页',
                            href: rcpAid.getUrl('首页'),
                            class: 'key'
                        }, {
                            name: '学习中心',
                            href: rcpAid.getUrl('学习中心'),
                            class: 'key',
                            target: '_blank'
                        }, {
                            name: '我要吐槽',
                            href: rcpAid.getUrl('我要吐槽'),
                            class: 'key',
                            target: '_blank'
                        }];
                        $scope.param = {
                            logo: {
                                small: '/rcp-common/imgs/icon/book-logo-2.png',
                                large: '/rcp-common/imgs/icon/book-logo.png',
                                href: DYCONFIG.rcp.rUrl,
                                msg: '酷校LOGO·让学习更Cool'
                            },
                            style: ''
                        };
                }
            };
            $scope.init();
        }]
    };
});

//@ 用户菜单
module.directive('topUserMenu', function() {
    return {
        template:'<div class="top-user-menu"><div style="font-size:14px;line-height:40px" ng-show="!currentUser.uid"><a ng-href="{{link.login}}" id="login" class="color-cyan pd-l20"><i class="image-login-user-ic"></i>马上登录 </a><span style="color:#ececec;margin:0 8px">| </span><a ng-href="{{link.register}}" class="color-cyan">注册</a></div><div class="menber-link" ng-show="currentUser.uid"><a href="" class="u-info" rel="member_link"><img ng-hide="currentUser.avatar" src="/rcp-common/imgs/face/d-face-1.png" class="face-img" width="30" height="30" rel="user_face" alt="{{currentUser.nickName}}"> <img ng-show="currentUser.avatar" ng-src="{{currentUser.avatar}}" class="face-img" width="30" height="30" rel="user_face" alt="{{currentUser.nickName}}"> <span class="name" rel="user_name" title="{{currentUser.nickName}}" ng-bind="currentUser.nickName"></span> <i class="image-attestation-person" ng-class="{\'attestation\':attestation==\'已认证\'}"></i> <i class="image-arrow"></i></a><div class="u-panel"><div class="tup-box"><div class="tup-operate"><div class="card-sets"><a href="{{link.setting}}" target="_blank" class="key"><i class="image-personal-settings"></i> <span>个人设置</span> <i class="image-line"></i></a></div><div class="card-links"><a ng-repeat="item in itemList" ng-href="{{item.href || \'\'}}" ng-class="item.name == \'...\' ? \'disabled key \'+item.icon : \'key \'+item.icon"><i class="image-{{item.ic}}"></i> <span>{{item.name}}</span></a></div><div class="card-exit"><a href="" class="key" ng-click="logout()"><i class="image-exit"></i> <span>退出</span> <i class="image-line"></i></a></div></div></div></div></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            itemList: "=itemList",
            user: "=user"
        },
        controller: ['$rootScope', '$scope', '$timeout', '$location', 'service', function($rootScope, $scope, $timeout, $location, service) {
            //new new nwe
            //菜单格子布局：补满空位
            $scope.$watch('itemList', function(value) {
                if (!value) {
                    return;
                }
                if ($scope.itemList[0].name == "管理中心") {
                    var tempItem = $scope.itemList[0];
                    $scope.itemList.splice(0, 1);
                    $scope.itemList.splice(2, 0, tempItem);
                }
                //var len = $scope.itemList.length;
                //var rem = len % 3;
                //if (rem) {
                //    var fill = 3 - (len % 3) + len;
                //    for (var i = len; i < fill; i += 1) {
                //        value.push({
                //            name: '...'
                //        });
                //    }
                //}
            }, true);
            $scope.logout = function() {
                var url = rcpAid.getUrl('首页');
                location.href = rcpAid.getUrl('退出', {
                    url: encodeURIComponent(url)
                });
            };
            //接收用户信息广播
            $scope.$on('login', function(rs, data) {
                if (!data.uid) {
                    return;
                }
                $scope.loginInit();
            });
            $scope.loginInit = function() {
                $scope.currentUser = $rootScope.currentUser;
                if ($scope.currentUser.certification) {
                    $scope.attestation = '已认证';
                }
                // console.log($scope.currentUser);
            };
            $scope.init = function() {
                var noTokenUrl = rcpAid.getNoTokenUrl();
                $scope.link = {
                    login: rcpAid.getUrl('登录', {
                        url: encodeURIComponent(noTokenUrl)
                    }),
                    register: rcpAid.getUrl('注册', {
                        url: encodeURIComponent(noTokenUrl)
                    }),
                    applySpaceUrl: rcpAid.getUrl('实名认证'),
                    setting: rcpAid.getUrl('个人设置', {
                        url: encodeURIComponent(noTokenUrl)
                    }),
                };
                $scope.attestation = '未认证';
            };
            $scope.init();
        }]
    };
});

//@ 分类
module.controller('categoriesCtrl', ['$rootScope', '$scope', 'service', function($rootScope, $scope, service) {
    $scope.service = service;
    $scope.hover = {};
    $scope.catType = rcpAid.getCourseCat();

    function setData(type) {
        switch (type) {
            case 2:
                $scope.categoriesListStyle2 = allTagData || []; //aikexue.com
                break;
            default:
                $scope.categoriesListStyle1 = allTagData || []; //default
        }
    }

    $scope.byCategories = function() {
        $scope.byCategoriesLoading = true;

        setData($scope.catType);
    };

    $scope.listenerMember = {
        byCategories: {
            node: '#by-categories',
            callback: $scope.byCategories
        }
    };

    var allTagData;

    $scope.goToCategory = function() {
        var tags = [].slice;
        return rcpAid.getUrl('分类', {
            tags: tags.call(arguments, 0).join(',')
        });
    };
}]);

//@ 搜索栏
module.directive("searchDir", function () {
    return {
        template:'<div class="h-sc"><div class="head-search-bar"><div class="enter" ng-click="stopPropagation($event)"><input type="text" class="input" ng-model="scText" ng-keydown="onkeydown($event)" ng-change="matchChange(scSelectVal.value,scText)" placeholder="请输入关键词搜索"><div class="match-kw-v" ng-show="matchReadyLock && mcCourseList && mcCourseList.length"><div class="mc-list"><ul><li ng-repeat="item in mcCategoryList track by $index" ng-if="$index < lMaxLen" ng-class="{hover: $index == moveKeyIndex}" ng-mouseenter="mouseenter($index,\'类\')" ng-click="matchGoToCategory(item.tag,scText)"><div class="text-of"><a href="javascript:;">{{text}}</a> 在 <a href="javascript:;" class="item-name color-cyan">{{item.tag}}</a> 分类中搜索</div></li></ul><div style="margin:0 10px;border-top:1px solid #dfdfdf" ng-if="mcCourseList.length && mcCategoryList.length"></div><ul><li ng-repeat="item in mcCourseList track by $index" ng-click="intoDetail(item)" ng-if="$index < cMaxLen" ng-class="{hover: $index + lMaxLen == moveKeyIndex}" ng-mouseenter="mouseenter($index,\'资源\')"><div class="text-of"><a href="javascript:;" class="item-name" ng-bind-html="item.name|titleMatchKw:scText"></a></div></li></ul></div></div></div><a ng-click="goToSearch(scSelectVal.value,scText)" class="submit" title="提交"><i class="fa fa-search" aria-hidden="true"></i></a></div><div class="hot-word"><a href="" class="mg-r20" ng-repeat="item in scHotWord" ng-click="goToSort(item.name)">{{item.name}}</a></div></div>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            hot: "="
        },
        controller: 'headSearchCtrl'
    };
});

//@ 搜索
module.controller('headSearchCtrl', ['$rootScope', '$scope', '$document', '$element', 'service', 'headSearch', function($rootScope, $scope, $document, $element, service, headSearch) {

    $scope.scHotWord = [];

    $scope.scSelect = [{
        name: '所有分类',
        value: '',
        fixLock: true
    }, {
        name: '课程',
        value: 10
    }, {
        name: '题库',
        value: 20
    }];

    $scope.scSelectVal = $scope.scSelect[0];

    $scope.onkeydown = function(ev) {
        ev.stopPropagation();
        switch (ev.keyCode) {
            case 13:
                if (!$scope.scText) {
                    $scope.scText = $('.head-search-bar input').eq(0).val();
                }
                var kdi = $scope.KeyDownIndex;
                var ll = $scope.lMaxLen;
                if (typeof kdi === 'number' && kdi >= 0 && kdi < ll && $scope.scTag) {
                    $scope.matchGoToCategory($scope.scTag, $scope.scText);
                } else {
                    if (kdi >= 0 && $scope.matchReadyLock) {
                        location.href = rcpAid.getUrl('课程详情', {
                            cid: $scope.mcCourseList[kdi].id
                        });
                    } else {
                        $scope.goToSearch($scope.scSelectVal.value, $scope.scText);
                    }
                }
                break;
            case 38:
                keyUpEvent();
                break;
            case 40:
                keyDownEvent();
                break;
            default:
                moveLock = false;
                $scope.moveKeyIndex = undefined;
                $scope.KeyDownIndex = undefined;
                $scope.scTag = undefined;
                // endFn();
        }
    };

    var moveLock;

    function clear() {
        $scope.scText = '';
        endFn();
    }

    function keyMove() {
        moveLock = true;
        $scope.KeyDownIndex = $scope.moveKeyIndex;
        getCurKeyItem();
    }

    function keyDownEvent() {
        if (typeof $scope.moveKeyIndex !== 'number') {
            $scope.moveKeyIndex = 0;
        } else {
            $scope.moveKeyIndex = ($scope.moveKeyIndex + 1) % $scope.aMaxLen;
        }
        keyMove();
    }

    function keyUpEvent() {
        if (typeof $scope.moveKeyIndex !== 'number') {
            $scope.moveKeyIndex = $scope.aMaxLen - 1;
        } else {
            $scope.moveKeyIndex = $scope.moveKeyIndex < 0 ? $scope.aMaxLen - 1 : $scope.moveKeyIndex - 1;
        }
        keyMove();
        moveCursor($scope.scText.length);
    }

    function getCurKeyItem() {
        var ki = $scope.KeyDownIndex;
        var ll = $scope.lMaxLen;
        var item;
        $scope.scTag = undefined;
        if (ki < ll) {
            // item = $scope.mcCategoryList[ki];
            $scope.scText = $scope.text;
            // $scope.scTag = item.tag;
        }
        if (ki >= ll) {
            item = $scope.mcCourseList[ki - $scope.lMaxLen];
            if (item) {
                $scope.scText = item.name;
            }
        }
        return item;
    }

    function endFn(digest) {
        $scope.matchReadyLock = false;
        if (digest) {
            $document.unbind('click');
            $scope.$digest();
        }
    }

    function focus() {
        // console.log('focus');
        $document.unbind('click').bind('click', function() {
            endFn('digest');
        });
        $scope.matchReadyLock = true;
    }

    var blurTimer;

    function blur() {
        // console.log('blur');
        if (!$scope.matchReadyLock) {
            return;
        }
        clearTimeout(blurTimer);
        blurTimer = setTimeout(function() {
            endFn('digest');
        }, 300);
    }

    $element.find('input[ng-model="scText"]').unbind('focus').bind('focus', focus);

    $element.find('input[ng-model="scText"]').unbind('blur').bind('blur', blur);

    function moveCursor(count) {
        var input = $element.find('input[ng-model="scText"]').get(0);
        if ('selectionStart' in input) {
            input.selectionStart = count;
            input.selectionEnd = count;
        }
        if ('createTextRange' in input) {
            var a = input.createTextRange(); //创建文本范围对象a
            a.moveStart('character', count); //更改范围起始位置
            a.collapse(true); //将插入点移动到当前范围的开始或结尾。
            a.select(); //将当前选中区置为当前对象，执行
        }
    }

    $scope.mouseenter = function(index, type) {
        switch (type) {
            case '类':
                $scope.moveKeyIndex = index;
                break;
            case '资源':
                $scope.moveKeyIndex = index + $scope.lMaxLen;
                break;
        }
    };

    $scope.goToSearch = function(type, query) {
        clear();
        location.href = rcpAid.getUrl('搜索', {
            type: type,
            query: query ? encodeURIComponent(query) : query
        });
    };

    $scope.goToSort = function(str) {
        clear();
        location.href = rcpAid.getUrl('分类', {
            tags: str
        });
    };

    $scope.stopPropagation = function(ev) {
        ev.stopPropagation();
    };

    $scope.matchChange = function(type, query) {
        if (moveLock) {
            return;
        }
        endFn();
        if (!query) {
            $scope.mcCategoryList = [];
            $scope.mcCourseList = [];

            return;
        }
        $scope.text = query;

        headSearch.SearchIntelligent({
            key: query,
            courseType: type || null,
            limit: 10
        }).then(
            function(data) {
                if ($scope.scText) {
                    $scope.matchReadyLock = true;
                    $scope.mcCourseList = convert2OldCourse(data.data.courses || []);
                    // $scope.mcCategoryList = rs.data.t || [];
                    $scope.mcCategoryList = []; //暂无内容
                    $scope.lMaxLen = $scope.mcCategoryList.length > 3 ? 3 : $scope.mcCategoryList.length;
                    // $scope.cMaxLen = 10 - $scope.lMaxLen;
                    $scope.cMaxLen = $scope.mcCourseList.length - $scope.lMaxLen;
                    $scope.aMaxLen = $scope.lMaxLen + $scope.cMaxLen;
                    if (!$scope.mcCourseList.length && !$scope.mcCategoryList.length) {
                        endFn();
                    }
                }
            },
            function(err) {
                dialog('错误代码：' + err.data.data.code);
            }
        );
    };

    $scope.$watch('scSelectVal.value', function() {
        $scope.matchChange($scope.scSelectVal.value, $scope.scText);
    });

    $scope.matchGoToCategory = function(name, query) {
        if (!$rootScope.allTagCategroy || !$rootScope.allTagCategroy.length) {
            dialog('error', '获取分类数据失败');
            return;
        }
        var str = matchKeyWork($rootScope.allTagCategroy, name).reverse().join(',');
        if (str) {
            clear();
            location.href = rcpAid.getUrl('分类', {
                tags: str,
                query: query
            });
        } else {
            dialog('error', '找不到这个分类，请检查接口数据');
        }
    };

    $scope.categorySelect = [];

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
    function matchKeyWork(allSort, work) {
        $scope.inSort = false;
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

        return $scope.categorySelect;
    }

    //在所有分类里匹配选中的分类层级的数组事件
    function selectArrayEvent(type, item) {
        var array = $scope.categorySelect;
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

    function dialog(type, msg) {
        service.dialog.alert(msg);
        console[type](msg);
    }

    // 将新API返回的课程Obj转成旧接口的课程Obj
    function convert2OldCourse(arg_array) {
        var arr = [];
        if (arg_array.length) {
            for (var i = 0, il = arg_array.length; i < il; i++) {
                arr.push({
                    id: arg_array[i].hasOwnProperty('id') ? arg_array[i].id : '',
                    name: arg_array[i].hasOwnProperty('title') ? arg_array[i].title : '',
                    t: arg_array[i].hasOwnProperty('type') ? arg_array[i].type : ''
                });
            }
        }

        return arr;
    }

    $scope.intoDetail = function(arg_course) {
        if (arg_course.hasOwnProperty('id')) {
            location.href = rcpAid.getUrl('课程详情', {
                cid: arg_course.id
            });
        }
    }
}]);

//@ 尾部
module.directive("tailnav", function() {
    return {
        template:'<footer><section class="footer" id="footer"><div class="g-m-w"><div class="copyright"><p>广州市大洋信息技术股份有限公司 版权所有</p><p>Copyright © 2015 ITDAYANG. All Rights Reserved.</p><p>{{caseNumber}}</p></div><div class="footer-link"><a href="http://www.itdayang.com/about.html" target="_blank">关于我们</a> <span>- </span><a href="http://www.itdayang.com/contact.html" target="_blank">联系我们</a> <span>- </span><a href="javascript:;" ng-click="atBuilding()">法律条款</a> <span>- </span><a href="javascript:;" ng-click="atBuilding()">帮助中心</a> <span>- </span><a href="javascript:;" ng-click="atBuilding()">学校申请加入</a> <span>- </span><a href="javascript:;" ng-click="atBuilding()">机构申请加入</a> <span>- </span><a href="javascript:;" ng-click="atBuilding()">意见反馈</a></div><div class="clear"></div></div></section></footer>',
        restrict: "E",
        replace: true,
        transclude: true,
        scope: {
            data: "=data"
        },
        controller: ['$scope', 'service', function($scope, service) {
            $scope.catType = rcpAid.getCourseCat();
            if (DYCONFIG.domain[location.host]) {
                $scope.caseNumber = DYCONFIG.domain[location.host].domainNum;
            }
            $scope.atBuilding = function() {
                service.dialog.alert('正在建设中...');
            };
        }]
    };
});

module.filter('titleMatchKw', ['$sce', function($sce) {
    return function(text, query) {
        var tmpl = '<b>' + query + '</b>';
        var reg = /([\[\]\(\)\{\}\*\?\+\^\$\.\|\\])/ig;
        var str = query.replace(reg, '\\$1');
        text = text.replace(new RegExp(str, 'ig'), tmpl);
        return $sce.trustAsHtml(text);
    };
}]);
/**
 * [fixed-footer 修复底部栏不置底]
 * @return {[type]} [description]
 */
(function() {
    if (window.fixedFooterFlag) {
        return;
    } else {
        window.fixedFooterFlag = true;
    }
    var css = function(e, p) {
            for (k in p) {
                e.style[k] = p[k];
            }
        },
        memoryStatus = 0,
        status = 1;

    function run() {
        var o = document.getElementById("footer");
        if (o) {
            var s = document.documentElement.scrollHeight - 1 || document.body.scrollHeight - 1,
                h = document.documentElement.clientHeight || document.body.clientHeight;
            status = s <= h ? 1 : 2;
            if (status !== memoryStatus) {
                if (s <= h) {
                    css(o.parentNode, {
                        height: o.offsetHeight + "px"
                    });
                    css(o, {
                        position: "absolute",
                        width: "100%",
                        bottom: 0,
                        left: 0
                    });
                } else {
                    css(o.parentNode, {
                        height: o.offsetHeight + "px"
                    });
                    css(o, {
                        position: "",
                        width: "100%",
                        bottom: 0,
                        left: 0
                    });
                }
            }
            memoryStatus = s <= h ? 1 : 2;
        }
        setTimeout(run);
    }

    run();
}());
