/**
 * 新的
 * Created by ph2 on 2016/4/12.
 */

(function (win, angular) {
    'use strict';

    searchCtrl.$inject = ['$scope', '$sce', 'course', 'service', 'search', 'dialog'];
    var searchConfig = {
        // 课程状态
        courseStatusCode: {
            // 正常
            normal: 100,
            // 用户可编辑状态，即表示用户未发布课程
            unPublished: 20,
            // 待审核
            underAudit: 200,
            // 表示课程拥有者自己下架
            unShelveByItself: 300,
            // 被管理员主动下架
            unShelveByItAdmin: 400,
            // 审核被拒
            auditRejected: 500
        },
        // 类型
        courseTypeCode: {
            // 课程
            curriculum: '10',
            // 题库
            question: '20'
        },
        eduTypes: ['职业教育', '基础教育', '高等教育'],
        sortTypeCode: {
            // 创建时间
            createTime: 1,
            // 课程开始时间
            startTime: 2,
            // 课程结束时间
            endTime: 3,
            // 参与人数
            joinedNum: 4,
            // 最小价格
            minPrice: 5,
            // 最大价格
            maxPrice: 6,
            // 审核时间
            auditTime: 7
        },
        sortOrder: {
            // 正数升序
            asc: 1,
            // 负数降序
            desc: -1

        }
    };

    var util = {
        /**
         * 把后台返回的课程列表数据转换为ng前端需要的数据
         * @param coursesList
         * @returns {Array}
         */
        getSearchResult: function (coursesList, users, chapterList) {
            // todo
            var resourceList = [],
                baseResource = {
                    id: '',
                    // 未发布
                    unPublished: true,
                    imgs: [],
                    title: '未命名课程',
                    isCurriculum: false,
                    isQuestion: false,
                    isActivity: false,
                    // 课程 章节数
                    chapterNum: 0,
                    totalPrice: 0,
                    creatorName: '',
                    // 开课时间
                    startTime: 0,
                    joinedNum: 0
                },
                resource;

            if (!coursesList || 0 == coursesList.length) {
                return resourceList;
            }

            angular.forEach(coursesList, function (value, key) {
                resource = angular.extend({}, baseResource);

                resource.id = value.id;
                resource.unPublished = value.status == searchConfig.courseStatusCode.unPublished;
                angular.isArray(value.imgs) && value.imgs.length > 0 && (resource.imgs = value.imgs);
                value.title && (resource.title = value.title);
                resource.highLightText = '<span>' + resource.title + '</span>';

                // 课程类型
                switch (value.type) {
                    case searchConfig.courseTypeCode.curriculum:
                        resource.isCurriculum = true;
                        // 章节数
                        resource.chapterNum = value.iids.hasOwnProperty('text') ? chapterList[value.iids.text.aid].T1 : 0;
                        break;
                    case searchConfig.courseTypeCode.question:
                        resource.isQuestion = true;
                        break;
                }

                //价格
                resource.totalPrice = value.minPrice || 0;

                resource.uid = value.uid || '';
                // 创建者昵称
                var user = users[value.uid];
                if (user && user.attrs && user.attrs.basic) {
                    resource.creatorName = user.attrs.basic.nickName || '';
                    // console.log('creatorName', resource.creatorName);
                }

                resource.startTime = value.start_time || 0;
                resource.joinedNum = value.joined || 0;

                resourceList.push(resource);
            });
            return resourceList;
        },

        /**
         * 获取返回的分类标签数据，剔除已选择的一类
         * @author LouGaZen
         * @param arg_data 返回数据中的data.refs字段
         * @param arg_selectedCont 已选标签列表
         * @returns {Array} 转换后的分类标签数据
         */
        getCategoryList: function (arg_data, arg_selectedCont) {
            var currentContName = [];
            arg_selectedCont.forEach(function (element) {
                var count = 0;
                for (var i = 0, il = currentContName.length; i < il; i++) {
                    if (currentContName[i] === element.pName) {
                        count++;
                    }
                }
                if (!count) {
                    currentContName.push(element.pName);
                }
            });

            var _list = [];

            arg_data = arg_data || [];

            for (var i = 0, il = arg_data.length; i < il; i++) {

                var flag = true;
                for (var k = 0, kl = currentContName.length; k < kl; k++) {
                    if (currentContName[k] === arg_data[i].name) {
                        flag = false;
                    }
                }

                if (flag) {
                    var _tags = [];
                    for (var j = 0, jl = arg_data[i].tags.length; j < jl; j++) {
                        _tags.push({
                            name: arg_data[i].tags[j],
                            isSelected: false
                        });
                    }

                    _list.push({
                        name: arg_data[i].name,
                        tags: _tags,
                        isMultiSelect: false
                    });
                }
            }

            return _list;
        },

        /**
         * 将选择的tag数组转化成'tag1,tag2,tag3'字符串形式
         * @author LouGaZen
         * @param arg_selected 已选择的标签数组
         * @returns {string}
         */
        parseSelectedTags: function (arg_selected) {
            var str = "";
            for (var i = 0, len = arg_selected.length; i < len; i++) {
                str += arg_selected[i] + (i == len - 1 ? '' : ',');
            }
            return str;
        },
    };

    function searchCtrl($scope, $sce, course, service, search, dialog) {

        var type = $scope.type = rcpAid.queryString('type'),
            query = $scope.query = rcpAid.queryString('query'),
            urlTags = rcpAid.queryString('tags');

        console.log('host', win.location.host);

        $scope.searchWord = query;

        $scope.loaded = false;
        $scope.loading = true;
        $scope.resultTotal = 0;
        $scope.strMore = '更多';
        $scope.strHide = '收起';
        $scope.firstTag = searchConfig.eduTypes[rcpAid.getCourseCat() - 1];

        $scope.firstLoading = true;

        $scope.selected = [];//{str Array}存放选择的标签，用于设置请求SearchRelated中Tags参数
        $scope.selectedCont = [];//{obj{pName（标签所属分类名）: str, mName（标签名）: str} Array}存放已筛选的内容，用于显示

        /**
         * isDescended 表示升降序。true 表示降序，false 表示升序
         * @type {{active: boolean, isDescended: boolean}}
         */
        var baseSortType = {active: false, isDescended: true};
        var sortTypeCode = searchConfig.sortTypeCode;
        $scope.sortTypes = [
            {name: '综合排序', code: 0},
            {name: '最新发布', code: sortTypeCode.auditTime},
            {name: '最近开课', code: sortTypeCode.startTime},
            {name: '人气', code: sortTypeCode.joinedNum},
            {name: '价格', code: sortTypeCode.minPrice}
        ];
        angular.forEach($scope.sortTypes, function (v, k) {
            angular.extend(v, baseSortType);
        });
        $scope.sortTypes[0].active = true;//默认高亮综合排序


        var urlTagArray = urlTags ? urlTags.split(',') : [];
        console.log('url urlTags', urlTagArray);

        if (urlTagArray.length) {
            $scope.selectedCont.push({
                pName: urlTagArray[0],
                mName: urlTagArray[1]
            });
            $scope.selected.push(urlTagArray[1]);
        }

        //----------
        var reloadPage = function () {
            $scope.pageargs = {
                // 每页结果数
                ps: 20,
                // 当前第几页
                pn: 1,
                filter: query,
                //底部页码最多显示数量,超过pl的一般后加省略号表示更多页码
                pl: 5
            };
        };

        // 新的接口SearchRelated
        var pagefnTemp = function (pageargs, callback) {
            $scope.loading = true;

            search.SearchRelated({
                // 扩展参数，用于获取章节数
                cmds: {text: {count: {}}},
                // 搜索指定域名
                // host: '*',
                // 搜索关键字
                searchKey: pageargs.filter,
                // 当前第几页
                page: pageargs.pn,
                // 每页显示课程数
                limit: pageargs.ps,
                // 分类层数---现时为网状结构，越大越好
                limit2: 10,
                // 课程类型
                courseTypes: $scope.type,
                // 排序
                sort: $scope.sortParams,
                // 标签
                tags: util.parseSelectedTags($scope.selected),
                // 标签或运算
                isOrTag: 1
            }).then(function (data) {
                // $('.loading').removeClass('loading');
                // $('.loading-body').removeClass('loading-body');

                $scope.loading = false;
                var course = data.data.course;
                $scope.resultTotal = course.allCount > 0 ? course.allCount : 0;
                $scope.searchResult = util.getSearchResult(course.courses, course.usr, course.items == null ? {} : course.items.text.count);

                $scope.categoryList = util.getCategoryList(data.data.refs || [], $scope.selectedCont);

                callback({pa: {total: course.allCount}});
            }, function (err) {
                $scope.loading = false;
                // dialog.alert('获取搜索结果列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '搜索页',
                    funcName: 'pagefnTemp',
                    text: '获取搜索结果列表失败'
                });
                console.log('pagefn err', err.data.config.url, err.data.status);
            });
        };

        /**
         * 获取课程url
         * @author LouGaZen
         * @param course 目标课程
         * @returns {String|string|*|String|string}
         */
        var getCourseUrl = function (course) {
            return rcpAid.getUrl('课程详情', {
                cid: course.id
            });
        };

        /**
         * 点击标签事件
         * @author LouGaZen
         * @param arg_mName 标签名
         * @param arg_pName 标签所属分类名
         */
        var clickTag = function (arg_mName, arg_pName) {
            $scope.selected.push(arg_mName);
            $scope.selectedCont.push({
                pName: arg_pName,
                mName: arg_mName
            });
            reloadPage();
        };

        /**
         * 多选按钮事件，使标签前出现勾选框
         * @author LouGaZen
         * @param arg_catgName 分类名称
         */
        var multiSelect = function (arg_catgName) {
            $scope.categoryList.forEach(function (element) {
                element.isMultiSelect = (element.name === arg_catgName);
            });
        };

        /**
         * 多选框清除事件，恢复标签初始状态
         * @author LouGaZen
         * @param arg_catgName 分类名称
         */
        var clearMulti = function (arg_catgName) {
            // $scope.catgContList.cont = $scope.catgContList.cont || [];
            // util.resetMultiSelect($scope.catgContList.cont);
            $scope.categoryList.forEach(function (element) {
                if (element.name === arg_catgName) {
                    element.tags.forEach(function (e) {
                        e.isSelected = false;
                    });
                    element.isMultiSelect = false;
                }
            });
        };

        /**
         * 多选框确定事件
         * @author LouGaZen
         * @param arg_catgName 分类名称
         */
        var confirmMulti = function (arg_catgName) {
            $scope.categoryList.forEach(function (element) {
                if (element.name === arg_catgName) {
                    element.isMultiSelect = false;
                    element.tags.forEach(function (e) {
                        if (e.isSelected) {
                            $scope.selected.push(e.name);
                            $scope.selectedCont.push({
                                pName: arg_catgName,
                                mName: e.name
                            });
                        }
                    })
                }
            });

            reloadPage();
        };

        /**
         * 清除搜索关键字，直接重定向
         * @author LouGaZen
         */
        var clearKeyword = function () {
            location.href = rcpAid.getUrl('搜索', {
                type: type,
                query: null
            });
        };

        /**
         * 清除单个标签
         * @author LouGaZen
         * @param arg_index 标签所在数组的索引
         */
        var clearContAt = function (arg_index) {
            $scope.selectedCont.splice(arg_index, 1);
            $scope.selected.splice(arg_index, 1);
            reloadPage();
        };

        /**
         * 点击左上角全部课程清空选择标签数据
         * @author LouGaZen
         */
        var reload = function () {
            // $scope.selected = [];
            // $scope.selectedCont = [];
            // reloadPage();
            location.href = rcpAid.getUrl('搜索', {
                type: type,
                query: null
            });
        };

        // 点击排序
        var clickSort = function (sort, hasDescended) {
            if (hasDescended) {
                sort.active && (sort.isDescended = !sort.isDescended);
            }

            if (!sort.active || hasDescended) {
                angular.forEach($scope.sortTypes, function (value) {
                    value.active = false;
                });
                sort.active = true;

                $scope.sortParams = sort.code * (sort.isDescended ? searchConfig.sortOrder.desc : searchConfig.sortOrder.asc);
                reloadPage();
            }
        };

        /**
         * 关键字高亮（用于$watch）
         * @author LouGaZen
         * @param arg_value $watch对象的值
         */
        var highLightWatchFunc = function (arg_value) {
            if (arg_value && query) {
                angular.forEach(arg_value, function (item) {
                    var regExp = new RegExp(query, 'ig'),
                        result = item.title.match(regExp),
                        before = '<span class="orange-c"></span>';
                    item.highLightText = item.highLightText.replace(regExp, before);
                    for (var i = 0, len = result.length; i < len; i++) {
                        var after = '<span class="orange-c">' + result[i] + '</span>';
                        item.highLightText = item.highLightText.replace(before, after);
                    }
                });
            }
        };

        /**
         * 课程推荐demo todo: 需要新的api
         * @author LouGaZen
         */
        $scope.recommendCourse = [];
        $scope.recommendCourseUserList = {};
        course.searchCourse({
            // type: type,
            type: 10,
            sort: Math.round(Math.random() * 6),
            pageCount: 6
        }).then(function (data) {
            // for (var i = 0; i < 4; i++) {
            //     $scope.recommendCourse.push(data.data.courses[Math.floor(Math.random() * 20)]);
            // }
            // console.log($scope.recommendCourse);
            $scope.recommendCourse = data.data.courses || [];
            $scope.recommendCourseUserList = data.data.usr || {};
        }, function (err) {
            // dialog.alert('获取推荐课程列表失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '搜索页',
                funcName: 'searchCourse',
                text: '获取推荐课程列表失败'
            });
        });

        /**
         * 获取推荐课程的用户信息
         * @author LouGaZen
         * @param arg_uid 用户id
         * @returns {*}
         */
        $scope.getRCUserData = function (arg_uid) {
            var _check = $scope.recommendCourseUserList.hasOwnProperty(arg_uid)
                && $scope.recommendCourseUserList[arg_uid].hasOwnProperty('attrs')
                && $scope.recommendCourseUserList[arg_uid].attrs.hasOwnProperty('basic')
                && $scope.recommendCourseUserList[arg_uid].attrs.basic.hasOwnProperty('nickName');
            
            return _check ? $scope.recommendCourseUserList[arg_uid].attrs.basic.nickName : arg_uid;
        };


        //----------
        $scope.lImgConfig = {};
        $scope.rImgConfig = {
            width: 186,
            height: 108
        };
        // $scope.pagefn = pagefn;
        $scope.pagefn = pagefnTemp;
        // $scope.jumpToCourseDetail = jumpToCourseDetail;
        $scope.getCourseUrl = getCourseUrl;
        $scope.clickSort = clickSort;
        $scope.clickTag = clickTag;
        $scope.multiSelect = multiSelect;
        $scope.clearMulti = clearMulti;
        $scope.confirmMulti = confirmMulti;
        $scope.clearKeyword = clearKeyword;
        $scope.clearContAt = clearContAt;
        $scope.reload = reload;
        $scope.$watch('searchResult', highLightWatchFunc);

        //----------
        reloadPage();
    }

    var module = angular.module("RCP", ['ngRoute', 'ngCookies', 'LocalStorageModule', 'ngSanitize', 'chat_directive']);
    module.controller('searchCtrl', searchCtrl);

    win.module = module;
})(window, angular);

