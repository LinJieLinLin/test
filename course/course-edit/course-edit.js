/**
 * Created by Fox2081 on 2016/2/25.
 */
'use strict';

var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);

module.factory("$resource", ['request', function (request) {
    return function (u) {
        return {
            get: function (p, s, e) {
                request({
                    method: 'GET',
                    url: u,
                    params: p
                }).then(s, function (err) {
                    if (typeof e === 'function') {
                        e(err.data);
                    }
                });
            }
        };
    };
}]);

//主CTRL
module.controller('courseEditCtrl', ['$routeParams', '$scope', '$rootScope', '$http', 'service', '$timeout', 'course', '$location', function ($routeParams, $scope, $rootScope, $http, service, $timeout, course, $location) {

    //课程ID
    $rootScope.type = rcpAid.queryString('type');
    $rootScope.cid = rcpAid.queryString('id');
    $rootScope.eid = null;

    $scope.loadingMainShow = false;

    //从hash获取cid
    if (!$rootScope.cid) {
        $rootScope.cid = window.location.hash.replace('##', '');
    }


    //设置页面title
    $scope.$root.title = $rootScope.cid ? '编辑课程' : '创建课程';

    var reg = {
        period: /^(0|[1-9]\d*)$/,
        price: /^\d+.?\d{0,2}$/
    };

    //var
    $rootScope.course = {
        crs: {
            title: "",
            // imgs: [
            //     "http://fs.dev.gdy.io/8jdZ1t=="
            // ],
            // tags: [
            //     "一年级",
            //     "自然科学"
            // ],
            start_time: null,
            end_time: null,
            suitable: '',
            credit: null,
            period: null,
            status: -100,   //未创建，非后台标识
            tags: [],
            minPrice: null,
            type: $rootScope.type || '10'
        }
    };

    $scope.course = $rootScope.course;


    $scope.$on('login', function (rs, data) {
        if (!data) {
            //弹出登陆框
            service.common.toLogin();
            //跳转到登陆页
            // service.common.toLogin(true);
        }
    });

    //分类
    $scope.courseCat = {
        selectCur: '',
        topCat: [],
        tags: [],
        tagsSelect: [],
        tagsSelectRecord: {},
        tagsExpand: false,
        changeCat: function () {
            if ($scope.courseCat.selectCur) {
                if (!$scope.courseCat.tagsSelect.length) {
                    $scope.courseCat.tagsExpand = true;
                }
                $timeout(function () {
                    $('#courseCat').slideDown();
                });
            } else {
                $('#courseCat').slideUp();
            }
        },
        selectTag: function (name) {
            if ($scope.courseCat.tagsSelectRecord[name]) {
                return;
            }
            $scope.courseCat.tagsSelectRecord[name] = {
                name: name
            };
            $scope.courseCat.tagsSelect.push(name)
        },
        deleteTag: function (name) {
            if ($scope.courseCat.tagsSelectRecord[name]) {
                delete $scope.courseCat.tagsSelectRecord[name];
            }
            angular.forEach($scope.courseCat.tagsSelect, function (value, key) {
                if (value === name) {
                    $scope.courseCat.tagsSelect.splice(key, 1);
                }
            });
        },
        loadTags: function (tags) {
            if (tags.length) {
                if ($scope.courseCat.topCat.length) {
                    $scope.courseCat.selectCur = $scope.courseCat.topCat[0];
                    $scope.courseCat.changeCat();
                    $scope.courseCat.tagsSelect = tags;
                    angular.forEach($scope.courseCat.tagsSelect, function (value, key) {
                        $scope.courseCat.tagsSelectRecord[value] = {
                            name: value
                        }
                    });
                    $scope.courseCat.tagsExpand = false;
                }
            }
        }
    };

    $scope.eventTest = function ($event) {
        if ($event.target.href === $location.absUrl()) {
            $event.preventDefault();
            $timeout(function () {
                $event.target.href = '/';
                $timeout(function () {
                    $event.target.click();
                })
            }, 2000);
        }
    };


    // BEGIN ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ 编辑区域切换 ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ BEGIN


    //Controller组
    $rootScope.ctrlGrp = {
        'dirCtrl': angular.element('div[ng-controller="dirCtrl"]'),
        'introCtrl': angular.element('div[ng-controller="introCtrl"]')
    };

    //当前Controller，非全屏下为null
    $rootScope.ctrlCur = null;

    //  END  ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧ 编辑区域切换 ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧  END


    // BEGIN ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ 分项预览 ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ BEGIN

    //课程内容
    $scope.introList = {
        items: []
    };
    $scope.$on('getCourseIntroNew', function (event, data) {
        $scope.introList.items = data;
    });


    //课程内容
    $scope.dirList = {
        items: []
    };
    $scope.$on('getCourseDirNew', function (event, data) {
        $scope.dirList.items = data;
    });


    //  END  ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧ 分项预览 ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧  END


    //课程状态已经对应操作7
    $rootScope.courseStatusArr = {
        "20": {
            "opt": "public",
            "name": "编辑中",
            "namePub": "发布"
        },
        "100": {
            "opt": "update",
            "name": "已上架",
            "namePub": "更新"
        },
        "200": {
            "opt": "update",
            "name": "待审核",
            "namePub": "更新"
        },
        "300": {
            "opt": "public",
            "name": "已下架",
            "namePub": "发布"
        },
        "400": {
            "opt": "",
            "name": "已禁用",
            "namePub": "无法发布"
        },
        "500": {
            "opt": "public",
            "name": "审核未通过",
            "namePub": "发布"
        },
    };


    //XXX
    var courseInfo = {
        activityPrice: null,
        allType: ["60"],
        answerPrice: null,
        bankId: 57919,
        category: null,
        courseType: "10",
        credit: null,
        detailUrl: "",
        ext: null,
        guide: null,
        id: 43049,
        imgs: null,
        joinCnt: 0,
        kw: null,
        levelCategory: null,
        linkId: "56d3e359bc9a34399ae3fdd1",
        name: "课程名称",
        paperCnt: 0,
        questionCnt: 0,
        reason: "",
        role: null,
        score: 0,
        sectionPrice: null,
        startTime: "0000-00-00 00:00:00",
        status: "EDITING",
        teachPrice: null,
        testPrice: null,
        time: "2016-02-29 14:21:13",
        totalPrice: null,
        tryTime: 0,
        user: 200097,
        userName: "fox2081"
    };


    // BEGIN ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ 简介信息编辑 ∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨∨ BEGIN

    //上传封面
    $scope.coverUploadConfig = {
        showEdit: false,
        uploadNum: 0,     //上传图片位置
        upCancel: false,  //是否取消上传
        id: 'courseEdit',        //上传input ID
        width: 550,
        ratio: [16, 9],
        containerStyle: {width: '560px', height: '315px'},
        mode: 'course',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面
        scope: null,        //返回$scope
        cb: function (data) {
            $scope.course.crs.cover = data;
        }
    };


    /**
     * 点击上传封面
     */
    $scope.uploadCover = function () {
        $timeout(function () {
            if ($scope.coverUploadConfig.scope) {
                $scope.coverUploadConfig.scope.selectImg();
            }
        });
    };

    /**
     * 删除封面
     */
    $scope.deleteCover = function ($event) {
        $event.stopPropagation();
        if ($scope.course.crs.cover) {
            $scope.course.crs.cover = null;
        }
    };


    // END ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧ 简介信息编辑 ∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧∧  END


    //打开全屏编辑
    $scope.openFullEdit = function (item) {

        if (!$rootScope.cid) {
            $scope.dataSave('empty', function () {
                $scope.openFullEdit(item);
            });
            return;
        }

        switch (item) {
            case 'dir':
                $scope.$broadcast('openDir', {id: $scope.course.crs.iids.text.aid});
                $rootScope.ctrlCur = $rootScope.ctrlGrp.dirCtrl;
                break;
            case 'intro':
                $scope.$broadcast('openIntro', {id: $scope.course.crs.iids.summary.aid});
                $rootScope.ctrlCur = $rootScope.ctrlGrp.introCtrl;
                break;
        }
    };

    /**
     * 改变编辑状态
     * @param tgt
     * @param data
     */
    var changeEditStatus = function (tgt, data) {
        if (tgt === 'content') {
            $scope.contentEditStatus = data;
            $scope.$apply();
        }
        if (tgt === 'intro') {
            $scope.introEditStatus = data;
            $scope.$apply();
        }
    };

    $scope.$on('changeStatus', function (event, data) {
        changeEditStatus(data.tgt, data.status);
    });


    /**
     * 保存数据
     */
    $scope.dataSave = function (opt, cb) {
        var postData = {};


        var host = window.location.host;
        if (host.indexOf('localhost') > -1) {
            host = 'rcp.dev.gdy.io';
        }

        postData.host = [host];

        postData.type = $scope.course.crs.type;
        postData.title = $scope.course.crs.title;
        postData.imgs = $scope.course.crs.cover === '' ? [] : [$scope.course.crs.cover];

        postData.start_time = +moment($("#startTime").val()).format('x') || undefined;
        postData.end_time = +moment($("#endTime").val()).format('x') || undefined;

        postData.suitable = $scope.course.crs.suitable.replace('，', ',').split(',');

        if ($scope.course.crs.credit) {
            postData.credit = Number($scope.course.crs.credit);
        }
        if ($scope.course.crs.period) {
            postData.period = Number($scope.course.crs.period);
        }

        if((angular.isUndefined(opt) || opt !== 'empty')){
            if ($scope.course.crs.minPrice) {
                if (reg.price.test($scope.course.crs.minPrice)) {
                    postData.minPrice = parseFloat($scope.course.crs.minPrice);
                } else {
                    service.dialog.alert("总价格必须不小于0而且最多保留两位小数");
                    return;
                }
            }
        }

        if ((angular.isUndefined(opt) || opt !== 'empty') && !angular.isUndefined(postData.start_time) && !angular.isUndefined(postData.end_time) && postData.start_time > postData.end_time) {
            service.dialog.alert('课程结束时间必须大于开始时间');
            return;
        }

        var tags = [];
        if ($scope.courseCat.selectCur) {
            angular.forEach($scope.courseCat.tagsSelect, function (value, key) {
                tags.push(value);
            });
        }

        postData.tags = tags;

        if ($rootScope.cid) {

            if (!postData.title) {
                service.dialog.alert('课程名称不能为空');
                return;
            }

            postData.id = $rootScope.cid;
            course.saveCourseData(postData).then(function (rs) {
                if (rs.code === 0) {

                    if (opt && opt === 'release') {
                        $scope.dataRelease('release');
                    } else if (opt && opt === 'update') {
                        service.dialog.alert('课程更新成功');
                    } else {
                        service.dialog.alert('课程已保存');
                    }

                } else {
                    service.dialog.alert(rs.dmsg);
                }
            });
        } else {

            if (!postData.title) {
                postData.title = '课程名称';
            }

            $scope.loadingMainShow = true;

            course.createCourse({
                // demo: 1
            }, {option: {'loading': false}}, postData).then(function (rs) {

                $scope.loadingMainShow = false;

                if (rs.code === 0) {
                    $rootScope.cid = rs.data.id;

                    $scope.course.crs = $scope.makeCourseInfo({crs: rs.data}).crs;

                    window.location.hash = '##' + $rootScope.cid;
                    
                    if (opt && opt === 'release') {
                        $scope.dataRelease('release');
                    } else if (opt === 'empty') {
                        cb();
                    } else {
                        service.dialog.alert('课程已保存');
                    }

                } else {
                    service.dialog.alert(rs.dmsg);
                }
            });
        }

    };

    /**
     * 发布课程
     */
    $scope.dataRelease = function (opt) {
        if (opt && opt === 'release') {
            var postData = {
                cid: $rootScope.cid
            };
            course.releaseCourse(postData).then(function (rs) {
                if (rs.code === 0) {
                    // $scope.gotoTeacherSpace();
                    service.dialog.alert('课程' + ($scope.courseStatusArr[$scope.course.crs.status] ? $scope.courseStatusArr[$scope.course.crs.status].namePub : '发布') + '成功');
                    $scope.course.crs.status = 200;
                } 
            }, function (rs) {
                service.dialog.alert(rs.dmsg);
            });
        } else {
            if ($scope.course.crs.status && $scope.course.crs.status === 100) {
                $scope.dataSave('update');
            } else {
                $scope.dataSave('release');
            }
        }
    };

    /**
     * 分项保存
     */
    $scope.saveItem = function () {
        if (!$rootScope.ctrlCur) {
            return;
        }
        $rootScope.ctrlCur.scope().saveData();
    };


    //分类信息
    $rootScope.categoryList = [];

    /**
     * 提取课程数据
     * @param course
     */
    $scope.makeCourseInfo = function (course) {
        course.crs.start_time = course.crs.start_time ? moment(course.crs.start_time).format('YYYY-MM-DD HH:mm') : null;
        course.crs.end_time = course.crs.end_time ? moment(course.crs.end_time).format('YYYY-MM-DD HH:mm') : null;
        course.crs.cover = course.crs.imgs.length ? course.crs.imgs[0] : '';
        course.crs.suitable = course.crs.suitable.join(',');
        course.crs.credit = course.crs.credit || null;
        course.crs.period = course.crs.period || null;
        course.crs.minPrice = course.crs.minPrice || null;
        // $rootScope.categoryList = course.crs.tags || [];


        if (course.crs.type == '10') {
            $scope.makeCourseDir(course.items);
        }

        return course;
    };

    $scope.contentEditStatus = false;
    $scope.makeCourseDir = function (items) {
        if (items) {
            var tmp = [];
            angular.forEach(items.text.idx.items, function (value, key) {
                tmp.push({
                    type: value.t,
                    title: value.c.title
                })
            });
            $scope.dirList.items = tmp;

            tmp = [];
            angular.forEach(items.summary.idx.items, function (value, key) {
                tmp.push({
                    type: value.t,
                    title: value.c.title
                })
            });
            $scope.introList.items = tmp;
            if (items.text.idx.art && items.text.idx.art.idx && items.text.idx.art.idx.itemc) {
                var count = 0;
                angular.forEach(items.text.idx.art.idx.itemc, function (value, key) {
                    count += Number(value);
                });
                if (count) {
                    $scope.contentEditStatus = true;
                }
            }
            if (items.summary.idx.art && items.summary.idx.art.idx && items.summary.idx.art.idx.itemc) {
                var count = 0;
                angular.forEach(items.summary.idx.art.idx.itemc, function (value, key) {
                    count += Number(value);
                });
                if (count) {
                    $scope.introEditStatus = true;
                }
            }
        }
    };


    // BEGIN ------------------------------------------- 接口请求数据 ------------------------------------------- BEGIN
    /**
     * 获取课程数据
     * @param cid
     */
    $scope.getCourseInfo = function (cid) {
        course.getCourseDetail(
            {
                cid: cid,
                cmds: {
                    "text": {"idx": {"type": "T1,T2", "itemc": 1}},
                    "summary": {"idx": {"type": "T1", "itemc": 1}},
                }
            }
        ).then(function (rs) {
            if (rs.code === 0) {
                $scope.course = $scope.makeCourseInfo(rs.data);
                $scope.courseCat.loadTags($scope.course.crs.tags);
            } else {
                service.dialog.alert(rs.dmsg);
            }
        }, function () {

        });
    };

    // END ------------------------------------------- 接口请求数据 ------------------------------------------- END

    $scope.tags = null;
    /**
     * 获取所有分类
     */
    $scope.getTags = function () {
        course.getAllTags({}, '').then(function (rs) {
            if (rs.code === 0) {
                $scope.tags = rs.data.p_classifi.tags;
                $scope.courseCat.tags = rs.data.p_classifi.tags;
                $scope.courseCat.topCat.push({
                    name: rs.data.p_classifi.name
                })
            }
            if ($rootScope.cid) {
                $scope.getCourseInfo($rootScope.cid);
            }
        });

    };


    $scope.gotoPreview = function (event) {
        if ($rootScope.cid) {
            $('#preview-b').click();
        } else {
            event.preventDefault();
            service.dialog.alert('课程尚未创建');
        }
    };

    /**
     * 前往教师空间
     */
    $scope.gotoTeacherSpace = function () {
        window.location.href = rcpAid.getUrl('教学中心');  
    };

    /**
     * 前往预览课程
     */
    $scope.getUrlCourseDetail = function (id) {
        return rcpAid.getUrl('课程详情', {cid: id});
    };

    /**
     * 初始化
     */
    $scope.init = function () {
        $scope.getTags();
        // if ($rootScope.cid) {
        //     $scope.getCourseInfo($rootScope.cid);
        // }
    };


    //-----------init-----------
    $scope.init();


    wcms.update = DYCONFIG.course.rUrl + 'art/api/update';
    wcms.load = DYCONFIG.course.rUrl + "art/api/load";



    /**
     * 额外CKEDITOR插件
     */
    //公用工具栏插件
    // CKEDITOR.plugins.addExternal('lineutils', '../../ckeditor_ext/plugin/lineutils/', 'plugin.js');
    // CKEDITOR.plugins.addExternal('widget', '../../ckeditor_ext/plugin/widget/', 'plugin.js');
    // CKEDITOR.plugins.addExternal('mathjax', '../../ckeditor_ext/plugin/mathjax/', 'plugin.js');
    CKEDITOR.plugins.addExternal('sharedspace', '../../ckeditor_ext/plugin/sharedspace/', 'plugin.js');
    CKEDITOR.plugins.addExternal('optionFill', '../../ckeditor_ext/plugin/optionFill/', 'plugin.js');


}]);

module.controller('introCtrl', ['$scope', '$rootScope', '$interval', '$timeout', function ($scope, $rootScope, $interval, $timeout) {

    $scope.open = 'intro';
    $scope.aid = '';

    $scope.$on('openIntro', function (event, data) {

        $scope.open = 'intro';
        if (!$scope.aid) {
            $scope.initContent(data.id);
        }

    });

    /**
     * 初始化
     * @param aid
     */
    $scope.initContent = function (aid) {
        $scope.aid = aid;
        $timeout(function () {
            var interval = $interval(function () {
                if ($scope.contentConfig.scope) {
                    $scope.contentConfig.scope.init($scope.aid);
                    $scope.initContentEdit();
                    $interval.cancel(interval);
                }
            }, 500);
        });
    };


    //编辑内容
    $scope.contentConfig = {
        mark: 'intro',
        openPaper: function (item) {

        },
        changeStatus: function (rs) {
            $scope.$emit('changeStatus',{
                tgt: 'intro',
                status: rs ? true : false
            });
        },
        scope: null
    };


    $scope.initContentEdit = function () {
        if ($scope.contentConfig.scope) {
            $scope.contentConfig.scope.getContent();
        }
    };


}]);


//课程内容
module.controller('dirCtrl', ['$scope', '$rootScope', '$interval', '$timeout', function ($scope, $rootScope, $interval, $timeout) {

    $scope.open = 'dir';
    $scope.aid = '';

    $scope.$on('openDir', function (event, data) {

        $scope.open = 'dir';
        if (!$scope.aid) {
            $scope.initContent(data.id);
        }

        if ($scope.contentConfig.scope) {
            $scope.contentConfig.scope.openWindow();
        }
    });

    /**
     * 初始化
     * @param aid
     */
    $scope.initContent = function (aid) {
        $scope.aid = aid;
        $timeout(function () {
            var interval = $interval(function () {
                if ($scope.contentConfig.scope) {
                    $scope.contentConfig.scope.init($scope.aid);
                    $scope.initContentEdit();
                    $interval.cancel(interval);
                }
            }, 500);
        });
    };


    //编辑内容
    $scope.contentConfig = {
        mark: 'dir',
        openPaper: function (item) {
            if (item.data && item.data.aid) {
                $scope.paperConfig.aid = item.data.aid;
                $scope.paperConfig.type = item.data.type;
                $scope.paperConfig.tid = item.data.tid;
                $scope.paperConfig.id = item.id;
                $scope.paperConfig.cid = $rootScope.cid;
                $scope.paperConfig.scope.init();
                $scope.open = 'exam';

                $timeout(function () {
                    jf.css3Animate($('#paper-edit-' + $scope.paperConfig.aid)[0], "scaleIn animated");
                })
            }
        },
        changeStatus: function (rs) {
            $scope.$emit('changeStatus',{
                tgt: 'content',
                status: rs ? true : false
            });
        },
        scope: null
    };

    //编辑试卷
    $scope.paperConfig = {
        aid: '',
        id: '',
        save: function (rs) {
            $scope.contentConfig.scope.savePaper(rs);
        },
        back: function (rs) {
            $scope.contentConfig.scope.backToContent(rs);
            jf.css3Animate($('#paper-edit-' + $scope.paperConfig.aid)[0], "scaleOut animated", function () {
                $timeout(function () {
                    $scope.open = 'dir';
                });
            });
        },
        scope: null
    };

    $scope.saveData = function () {
        if ($scope.contentConfig.scope) {
            $scope.contentConfig.scope.saveContent();
        }
    };

    $scope.initContentEdit = function () {
        if ($scope.contentConfig.scope) {
            $scope.contentConfig.scope.getContent();
        }
    };


}]);