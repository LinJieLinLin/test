var module = angular.module('RCP', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'LocalStorageModule'
]);
module.controller('learningRecordCtrl', ['$rootScope', '$scope', '$timeout', '$filter', 'service', function($rootScope, $scope, $timeout, $filter, service) {
    var init = function() {
        $scope.noSectionId = +(new Date());
        $scope.load = {
            loadRecord: true,
        };
        //图表时间段
        $scope.dayType = { chartTime: -1, chartNum: -1 };
        if (isPhonePage()) {
            $scope.dayType.chartTime = 7;
            $scope.dayType.chartNum = 7;
        }
        //课程内容id
        $scope.urlData = {};
        $scope.urlData.contentId = rcpAid.queryString('aid');
        $scope.urlData.studentId = rcpAid.queryString('uid');

        // tem todo
        $scope.urlData.contentId = $scope.urlData.contentId;
        $scope.urlData.studentId = $scope.urlData.studentId;
        if (!$scope.urlData.contentId) {
            if (!isPhonePage()) {
                service.dialog.alert('参数有误！正在为您跳到首页...');
                $timeout(function() {
                    location.href = '/';
                }, 3000);
            }
        }
        //记录的数据
        $scope.data = {};
        $scope.xLength = {};
        $scope.currentUser = $rootScope.currentUser;
        //隐藏加载更多
        $scope.loadMore = true;
        var time = new Date();
        $scope.selectDate = moment().format('YYYY年MM月');
        $scope.defaultData = {
            ret_listUsedTotal: 1,
            ret_artUsedTotal: 1,
            ret_chatTotal: 1,
            ret_discussTotal: 1,
            ret_artUsed: 1,
            ret_listUsed: 1,
            ret_chat: 1,
            ret_discuss: 1,
            ret_artUsedDetail: 1,
            ret_artAvgDetail: 1,
            ret_course: 1,
            beg: +moment($scope.selectDate, 'YYYY年MM月'),
            end: +moment($scope.selectDate, 'YYYY年MM月').add(1, 'M'),
            span: 1,
        };
        if (isPhonePage()) {
            var temData = +moment(moment().format('YYYY-MM-DD')).add(1, 'd');
            $scope.defaultData.beg = +moment(temData).subtract($scope.dayType.chartTime, 'd');
            $scope.defaultData.end = temData;
        }
        //判断是否登陆
        $scope.$on('login', function(rs, data) {
            if (!data) {
                service.common.toLogin();
                return;
            }
            $scope.req.loadRecord($scope.defaultData);
            $scope.currentUser = $rootScope.currentUser;
        });
    };
    //是否是手机页
    function isPhonePage() {
        var re = location.href.indexOf("mobile-learning-record.html") !== -1;
        return re;
    }
    $scope.changeDay = function(argType, argData) {
        if (argData < 1) {
            return;
        }
        $scope.dayType[argType] = argData;
        $scope.dayType[argType] = argData;
        var data = {
            span: 1,
        };
        var temData = +moment(moment().format('YYYY-MM-DD')).add(1, 'd');
        if (argType === 'chartNum') {
            data.ret_chat = 1;
            data.ret_chatTotal = 1;
            data.ret_discuss = 1;
            data.ret_discussTotal = 1;
        } else if (argType === 'chartTime') {
            data.ret_artUsed = 1;
            data.ret_artUsedTotal = 1;
            data.ret_listUsed = 1;
            data.ret_listUsedTotal = 1;
        }
        data.beg = +moment(temData).subtract(argData, 'd');
        data.end = temData;
        $scope.req.loadRecord(data);
    };
    /**
     * [heightChart 图表配置]
     * @param  {[type]} argData [description]
     * @param  {[type]} argId   [description]
     * @return {[type]}         [description]
     */
    $scope.heightChart = function(argId, argData) {
        if (!argData.dataA || !argData.dataA.length || !argData.dataB || !argData.dataB.length) {
            return;
        }
        var o = {
            xData: [],
            maxY: 0,
            pointInterval: 1,
            xLength: $scope.xLength[argId] || argData.dataA.length,
        };
        var minNum = 8;
        for (var i = 1; i <= o.xLength; i += 1) {
            var temMonth = moment($scope.selectDate, 'YYYY年MM月').format('M');
            var temData = temMonth + '/' + i;
            if ($scope.dayType[argId] > 0) {
                var temTime = moment().subtract($scope.dayType[argId] - i, 'd');
                temData = temTime.format('M') + '/';
                temData += temTime.format('D');
            }
            o.xData.push(temData);
            if (argData.dataA[i - 1]) {
                o.maxY = argData.dataA[i - 1] > o.maxY ? argData.dataA[i - 1] : o.maxY;
            }
            if (argData.dataB[i - 1]) {
                o.maxY = argData.dataB[i - 1] > o.maxY ? argData.dataB[i - 1] : o.maxY;
            }
        }

        var charts = {
            'chartNum': {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: '',
                    align: 'left',
                    style: { 'fontSize': '14px' },
                    x: 0,
                    y: 20
                },
                xAxis: {
                    //最大值
                    max: o.xLength - 1,
                    //刻度
                    tickInterval: 2,
                    //数据
                    categories: o.xData,
                    //设置刻度线位于相对于轴线的内部
                    tickPosition: 'inside',
                    //不允许小数
                    allowDecimals: false,
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    allowDecimals: false,
                    min: 0,
                    minorGridLineWidth: 0,
                    girdLineWidth: 0,
                    alternateGridColor: null,
                    labels: {
                        format: '{value}'
                    }
                },
                exporting: {
                    enabled: false
                },
                tooltip: {
                    // backgroundColor: 'rgba(0, 0, 0,0.5)',
                    headerFormat: '<span>时间：{point.x}<span><br>',
                    pointFormat: '<span>{series.name}: {point.y}次</span>',
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                },
                series: [{
                    color: '#ee7760',
                    name: '沟通数',
                    data: argData.dataA,
                }, {
                    color: '#59a9eb',
                    name: '发帖数',
                    data: argData.dataB,
                }],
                credits: {
                    enabled: false
                }
            },
            'chartTime': {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: '',
                    align: 'left',
                    style: { 'fontSize': '14px' },
                    x: 0,
                    y: 20
                },
                xAxis: {
                    //最大值
                    max: o.xLength - 1,
                    //刻度
                    tickInterval: 2,
                    //数据
                    categories: o.xData,
                    //设置刻度线位于相对于轴线的内部
                    tickPosition: 'inside',
                    //不允许小数
                    allowDecimals: false,
                },
                yAxis: {
                    // max: 24,
                    min: 0,
                    // tickInterval: 2,
                    allowDecimals: false,
                    //标题
                    title: {
                        text: '',
                    },
                    minorGridLineWidth: 0,
                    girdLineWidth: 0,
                    alternateGridColor: null,
                    //y轴单位
                    labels: {
                        format: '{value}h'
                    }
                },
                exporting: {
                    enabled: false
                },
                tooltip: {
                    // backgroundColor: 'rgba(0, 0, 0,0.5)',
                    headerFormat: '<span>日期：{point.x}<span><br>',
                    pointFormat: '<span>{series.name}: {point.y}小时</span>',
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                },
                series: [{
                    color: '#ee7760',
                    name: '在线时长',
                    data: argData.dataA,
                }, {
                    color: '#59a9eb',
                    name: '课程学习时长',
                    data: argData.dataB,
                }],
                credits: {
                    enabled: false
                }
            },
        };
        if (isPhonePage()) {
            if ($scope.dayType[argId] != 7) {
                charts[argId].xAxis.tickInterval = 2;
            } else {
                charts[argId].xAxis.tickInterval = 1;
            }
            charts[argId].yAxis.tickPixelInterval = 30;
            charts[argId].legend.enabled = false;
            charts[argId].legend.enabled = false;
            minNum = 6;
        }
        if (o.maxY < minNum) {
            charts[argId].yAxis.max = minNum;
            charts[argId].yAxis.tickInterval = 2;

        }
        $('#' + argId).highcharts(charts[argId]);
    };
    /**
     * 减一月
     * @return {[type]} [description]
     */
    $scope.timePrev = function() {
        $scope.selectDate = moment($scope.selectDate, 'YYYY年MM月').subtract(1, 'M').format('YYYY年MM月');
        var data = {
            ret_artUsed: 1,
            ret_listUsed: 1,
            ret_chat: 1,
            ret_discuss: 1,
            ret_course: 1,
            beg: +moment($scope.selectDate, 'YYYY年MM月'),
            end: +moment($scope.selectDate, 'YYYY年MM月').add(1, 'M'),
            span: 1,
        };
        $scope.req.loadRecord(data);
    };
    /**
     * 加一月
     * @return {[type]} [description]
     */
    $scope.timeNext = function() {
        if ($scope.selectDate === moment().format('YYYY年MM月')) {
            return;
        }
        $scope.selectDate = moment($scope.selectDate, 'YYYY年MM月').add(1, 'M').format('YYYY年MM月');
        var data = {
            ret_artUsed: 1,
            ret_listUsed: 1,
            ret_chat: 1,
            ret_discuss: 1,
            beg: +moment($scope.selectDate, 'YYYY年MM月'),
            end: +moment($scope.selectDate, 'YYYY年MM月').add(1, 'M'),
            span: 1,
        };
        $scope.req.loadRecord(data);
    };
    /**
     * 是否显示加载更多
     * @param  {[type]} argId [description]
     * @return {[type]}       [description]
     */
    $scope.checkLoadMore = function(argId) {
        $timeout(function() {
            try {
                var content = $(argId);
                var h = content.height() || 0,
                    mh = +(content.css('max-height') || 0).replace('px', '');
                if (h > 0 && h < mh) {
                    $scope.loadMore = false;
                } else {
                    $scope.loadMore = true;
                }
            } catch (e) {}
        }, 0);
    };
    /**
     * 展开收起章 并设置章的线
     * @param  {[type]} argData [description]
     * @param  {[type]} argType [description]
     * @param  {[type]} argIndex [description]
     * @return {[type]}         [description]
     */
    $scope.expand = function(argData, argType, argIndex) {
        if (angular.isArray(argData.items) && argData.items.length > 0) {
            argData.open = argType;
        }
        if (argType && argIndex >= 0 && argData.items && argData.items.length) {
            $timeout(function() {
                argData.lineStyle = $scope.getStyle(argData, argIndex);
                // $scope.checkLoadMore('.a-content');
            }, 0);
        }
    };
    /**
     * [getStyle 获取线高]
     * @param  {[type]} argTarget [description]
     * @return {[type]}           [description]
     */
    $scope.getStyle = function(argData, argIndex) {
        var target = '#section-' + argIndex;
        console.log($(target));
        var s = '';
        try {
            var h = $(target)[0].offsetHeight;
            //节与章高度
            var marginTop = 25;
            //圆点高度
            var dotA = 22 - 1;
            //章高度
            if (isPhonePage()) {
                marginTop = 0;
                dotA = 18;
            }
            h = h + marginTop - dotA;
            s = {
                height: h + 'px'
            };
            //设置节的线高度
            var temL = argData.items.length;
            angular.forEach(argData.items, function(v, k) {
                if (temL - 1 > k) {
                    var temH = $('#item-' + argIndex + '-' + k)[0].offsetHeight;
                    //节与节高度
                    var temTop = 25;
                    //圆点高度
                    var dotB = 12 - 1;
                    //章高度
                    if (isPhonePage()) {
                        temTop = 0;
                        dotB = 5;
                    }
                    temH = temH + temTop - dotB;
                    v.lineStyle = {
                        height: temH + 'px'
                    };
                }
            });
        } catch (e) {}
        return s;
    };
    /**
     * [getChartData 获取chart格式的数据]
     * @param  {[type]} argData [description]
     * @return {[type]}         [description]
     */
    $scope.getChartData = function(argData, argType) {
        var temData = {};
        var reData = [];
        var sTime, eTime;
        var i = 0;
        var nowSelectTime = +moment($scope.selectDate, 'YYYY年MM月');
        var nowTimestamp = +moment(moment().format('YYYY-MM-DD'));
        //按日
        if (argType === 'time') {
            if ($scope.dayType.chartTime > 0) {
                nowSelectTime = +moment(nowTimestamp).subtract($scope.dayType.chartTime - 1, 'd');
                sTime = nowSelectTime;
                eTime = nowTimestamp;
            }
        } else {
            if ($scope.dayType.chartNum > 0) {
                nowSelectTime = +moment(nowTimestamp).subtract($scope.dayType.chartNum - 1, 'd');
                sTime = nowSelectTime;
                eTime = nowTimestamp;
            }
        }
        //按月
        if (!sTime) {
            sTime = +moment($scope.selectDate, 'YYYY年MM月');
            eTime = +moment($scope.selectDate, 'YYYY年MM月').add(1, 'M');
        }
        if (!argData) {
            argData = {};
        }
        while (eTime >= sTime) {
            i++;
            if (nowTimestamp >= sTime) {
                if (argType === 'time') {
                    temData[sTime] = +(argData[sTime] / 1000 / 3600).toFixed(1) || 0;
                } else {
                    temData[sTime] = +argData[sTime] || 0;
                }
            }
            sTime = +moment(nowSelectTime).add(1, 'd');
            nowSelectTime = sTime;
        }
        //横坐标显示的数据;
        if (argType === 'time') {
            $scope.xLength.chartTime = i;
        } else {
            $scope.xLength.chartNum = i;
        }
        angular.forEach(temData, function(v, k) {
            reData.push(v);
        });
        return reData;
    };
    /**
     * 请求函数集合
     * @type {Object}
     */
    $scope.req = {
        loadRecord: function(argData) {
            $scope.load.loadRecord = true;
            var data = {
                host: location.host,
                uids: $scope.urlData.studentId,
                aids: $scope.urlData.contentId,
                // ret_listUsedTotal: null,
                // ret_artUsedTotal: null,
                // ret_chatTotal: null,
                // ret_discussTotal: null,
                // ret_artUsed: null,
                // ret_listUsed: null,
                // ret_chat: null,
                // ret_discuss: null,
                // ret_artUsedDetail: null,
                // ret_artAvgDetail: null,
                // beg: null,
                // end: null,
                // span: null,
            };
            service.course.loadRecord(angular.extend(data, argData)).then(function(rs) {
                $scope.checkLoadMore('.a-content');
                $scope.load.loadRecord = false;
                angular.extend($scope.data, rs.data);
                console.log($scope.data);
                try {
                    if (!$scope.urlData.studentId) {
                        $scope.urlData.studentId = $rootScope.currentUser.uid;
                    }
                    //时长图表
                    if ($scope.data.listUsed) {
                        $scope.data.chartOnline = $scope.getChartData($scope.data.listUsed[$scope.urlData.studentId], 'time');
                    }
                    if ($scope.data.artUsed) {
                        if ($scope.data.artUsed[$scope.urlData.studentId]) {
                            $scope.data.chartLearn = $scope.getChartData($scope.data.artUsed[$scope.urlData.studentId][$scope.urlData.contentId], 'time');
                        } else {
                            $scope.data.chartLearn = $scope.getChartData({}, 'time');
                        }
                    }
                    //次数图表
                    if ($scope.data.chat) {
                        $scope.data.chartChat = $scope.getChartData($scope.data.chat[$scope.urlData.studentId]);
                    }
                    if ($scope.data.discuss) {
                        $scope.data.chartDiscuss = $scope.getChartData($scope.data.discuss[$scope.urlData.studentId]);
                    }
                    $scope.heightChart('chartTime', {
                        dataA: $scope.data.chartOnline,
                        dataB: $scope.data.chartLearn
                    });
                    $scope.heightChart('chartNum', {
                        dataA: $scope.data.chartChat,
                        dataB: $scope.data.chartDiscuss
                    });
                    if ($scope.data.course._id) {
                        $scope.data.course.src = rcpAid.getUrl('课程详情', { cid: $scope.data.course._id });
                    }
                    if ($scope.data.section[$scope.urlData.contentId]) {
                        $scope.data.section = $scope.data.section[$scope.urlData.contentId];
                    }
                    //处理试卷
                    $scope.data.papers = {};
                    angular.forEach($scope.data.iteml[$scope.urlData.contentId], function(iteml) {
                        if (iteml.beg) {
                            angular.forEach(iteml.items, function(item) {
                                if (item.c) {
                                    item.c.avtScore = 0;
                                    if (item.c.type === 'e_paper' || item.c.type === 'e_exercise') {
                                        item.c = angular.extend(item.c, $scope.data.exam.paper[item.c.aid]);
                                        if ($scope.data.score_count && $scope.data.score_count._ && $scope.data.score_count._[item.c.aid]) {
                                            item.c.avtScore = $scope.data.score_count._[item.c.aid].avg || 0;
                                        }
                                    } else if (item.c.type === 'e_test') {
                                        if ($scope.data.score_count && $scope.data.score_count._ && $scope.data.score_count[item.c.tid]) {
                                            item.c.avtScore = $scope.data.score_count[item.c.tid][item.c.aid].avg || 0;
                                        }
                                        if ($scope.data.exam.tests[item.c.tid]) {
                                            item.c = angular.extend(item.c, $scope.data.exam.tests[item.c.tid][item.c.aid]);
                                        }
                                    }
                                    item.c.avtScore = 1 * (+item.c.avtScore.toFixed(1)) || 0;
                                    item.c.status = '未作答';
                                    if (item.c.exam) {
                                        switch (item.c.exam.status) {
                                            case 100:
                                                item.c.status = '未提交';
                                                break;
                                            case 200:
                                                item.c.status = '批改中';
                                                break;
                                            case 400:
                                                var score = 1 * item.c.score.toFixed(1) || 0;
                                                item.c.status = '得分' + item.c.score + '分';
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                }
                            });
                            $scope.data.papers[iteml.beg.i] = iteml.items;
                        }
                    });
                    console.log($scope.data.papers);
                    //历遍章节
                    $scope.data.sections = [];
                    angular.forEach($scope.data.section, function(section) {
                        var temT, tmeAvgT;
                        section.papers = $scope.data.papers[section.i] || [];
                        if ($scope.data.artUsedDetail && $scope.data.artUsedDetail[$scope.urlData.studentId]) {
                            temT = $scope.data.artUsedDetail[$scope.urlData.studentId][$scope.urlData.contentId]._[section.i];
                        } else {
                            temT = 'no Data';
                        }
                        if ($scope.data.artAvgDetail && $scope.data.artAvgDetail[$scope.urlData.contentId]) {
                            tmeAvgT = $scope.data.artAvgDetail[$scope.urlData.contentId]._[section.i];
                        } else {
                            tmeAvgT = 'no Data';
                        }
                        section.time = rcpAid.countTime(temT / 1000, 's');
                        section.avgTime = rcpAid.countTime(tmeAvgT / 1000, 's');
                        if (section.t === 'T1') {
                            section.items = [];
                            $scope.data.sections.push(section);
                        } else if (section.t === 'T2') {
                            if ($scope.data.sections[$scope.data.sections.length - 1]) {
                                $scope.data.sections[$scope.data.sections.length - 1].items.push(section);
                            } else if ($scope.data.sections.length === 0) {
                                var temSection = {
                                    c: {
                                        title: $scope.noSectionId
                                    },
                                    items: [],
                                    open: true,
                                };
                                temSection.items.push(section);
                                $scope.data.sections.push(temSection);
                            }
                        }
                    });
                    if ($scope.data.sections[0] && $scope.data.sections[0].c.title === $scope.noSectionId) {
                        $scope.expand($scope.data.sections[0], true, 0);
                    }
                } catch (e) {
                    service.dialog.alert('返回数据有误！');
                    console.log(e);
                }
            }, function(e) {
                $scope.load.loadRecord = false;
                console.log(e);
                service.dialog.showErrorTip(e, { moduleName: 'learinng-record', funcName: 'loadRecord' });
                // try {
                //     switch (e.data.data.code) {
                //         case 10:
                //             service.dialog.alert('您还没有权限！');
                //             break;
                //         default:
                //             service.dialog.alert('没有找到数据');
                //     }
                // } catch (err) {
                //     service.dialog.alert('读取数据出错，请稍候重试！');
                // }
            });
        }
    };
    init();
}]);
