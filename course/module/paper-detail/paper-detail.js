/**
 * Created by LouGaZen on 2016-05-27.
 * 模块说明：教学中心→试卷批改→试卷详情
 * 公共组件依赖：pagination, loader-ui, dialog css
 */

module

    .directive('highcharts', function () {
        /**
         * highCharts dir
         * option: highCharts option
         * config: {width: number, height: number}(disposable)
         */
        return {
            template: '<div id="highcharts" style="margin: 0 auto;"></div>',
            scope: {
                option: '=',
                config: '='
            },
            restrict: 'EA',
            replace: true,
            link: function ($scope, $element) {
                $($element).width($scope.config.width || 0).height($scope.config.height || 0);

                $scope.$watch('option', function () {
                    $('#highcharts').highcharts($scope.option)
                }, true)
            }
        }
    })

    .directive('slideShow', function () {
        /**
         * 向下展示滑动效果
         * slide-show: boolean
         */
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.slideShow, function (value) {
                    if (value) {
                        $(element).slideDown();
                    } else {
                        $(element).slideUp();
                    }
                });
            }
        }
    })

    .filter('percentage', function () {
        /**
         * 将小数转换成百分数
         */
        return function (input) {
            return angular.isNumber(input) ? (input * 100 + '%') : input
        }
    })

    .directive('progressBar', function () {
        /**
         * 进度条
         * config: {totalNum: **分母**, curNum: **分子**, color: '#******'}
         */
        return {
            template: '<div style="width: 100%;  height: 20px;  background-color: #eeefe9;  border-radius: 3px;  color: #ffffff;  display: inline-block;  overflow: hidden;  text-align: center;">' +
            '<span ng-bind="config.curNum"></span>/<span ng-bind="config.totalNum"></span>' +
            '<div ng-style="{\'width\': config.totalNum == 0 ? 0 : (config.curNum / config.totalNum | percentage), \'background-color\': config.color, \'height\': \'20px\',  \'margin-top\': \'-19px\',  \'border-radius\': \'3px\'}"></div>' +
            '</div>',
            restrict: 'E',
            replace: true,
            scope: {
                config: '='
            }
        }
    })

    .controller('pdCtrl', ['$scope', '$routeParams', 'course', 'dialog', '$timeout', '$location', '$window', function ($scope, $routeParams, course, dialog, $timeout, $location, $window) {
//-----------------------------获取传入试卷id-----------------------------
        var pid = $routeParams.pid,//试卷id，后台接口字段为aid
            cid = $routeParams.cid,//课程id
            tid = $routeParams.tid == 'null' ? '' : $routeParams.tid;//考试id

        $scope.isExam = tid != '';

        if (!pid || !cid) {
            dialog.alert('无效的试卷ID或课程ID');
            setTimeout("location.href = rcpAid.getUrl('教学中心', {token: rcpAid.getToken()}) + '#/paperManager';", 2000);
            return;
        }
//-----------------------------截取所需数据-----------------------------
        /**
         * 截取学生列表数据
         * @param arg_data: 返回数据中的data.info{array}字段
         * @returns {Array}
         */
        function convertStdData(arg_data) {
            var _stdList = [];

            if (arg_data) {
                arg_data.forEach(function (element) {
                    _stdList.push({
                        //勾选状态
                        click: false,
                        usrId: element.exam.uid || '',
                        //提交次数
                        subTimes: element.submited || 0,
                        //最新成绩
                        curResult: element.score || 0,
                        //发布状态，非400为未发布状态
                        pubStatus: element.exam.status === 400,
                        //批改状态，只有未批改题数（notc） === 0时为已批改
                        corStatus: element.hasOwnProperty('exam') && element.exam.hasOwnProperty('id') && element.exam.id != '' && element.notc == 0,
                        //提交状态（现在不返回未提交的学生数据，已作废）
                        hasNotSub: element.submited == 0 || (element.hasOwnProperty('exam') && element.exam.hasOwnProperty('id') && element.exam.id == '')
                    })
                });
            }

            return _stdList
        }

//-----------------------------数据和方法定义-----------------------------
        $scope.loadPage = function () {
            $scope.pageargs = {
                ps: 10,
                pn: 1
            }
        };

        var back2Initial = function () {
            $scope.searchKw = '';//搜索关键字
            $scope.clickAll = false;//全选状态

            // $scope.sortParams = 0;
            // $scope.correctParam = '';
            // $scope.publishParam = '';

            $scope.loadPage();
        };

        $scope.paperDetail = {
            detail: {},//试卷信息
            progress: {},//提交进度与批改进度
            stdList: []//学生列表
        };
        $scope.userList = {};//用户信息表
        $scope.userStatusList = {};//用户状态列表

        $scope.msort = {
            corrected_s: -1,
            time: 1
        };//存放用于请求的排序 && 筛选参数

        //排序
        $scope.sortTypes = [
            {name: '提交次数', code: 1, active: false, isDescended: true},
            {name: '最新成绩', code: 1, active: false, isDescended: true}
        ];

        //提交状态筛选和方法
        $scope.correctSelectorFn = function (item) {
            $scope.msort.corrected = item.value;
            $scope.msort.submited = '';
            $scope.msort.score = '';
            $scope.msort.corrected_s = -1;
            $scope.msort.time = 1;
            $timeout(function () {
                $scope.loadPage();
            });
        };

        $scope.correctSelector = {
            options: [
                {name: '全部', value: ''},
                {name: '未批改', value: 201},
                {name: '已批改', value: 200}
            ],
            changeCb: $scope.correctSelectorFn
        };

        //发布状态筛选和方法
        $scope.publishSelectorFn = function (item) {
            $scope.msort.published = item.value;
            $scope.msort.submited = '';
            $scope.msort.score = '';
            $scope.msort.corrected_s = -1;
            $scope.msort.time = 1;
            $timeout(function () {
                $scope.loadPage();
            });
        };

        $scope.publishSelector = {
            options: [
                {name: '全部', value: ''},
                {name: '未发布', value: 101},
                {name: '已发布', value: 100}
            ],
            changeCb: $scope.publishSelectorFn
        };

        $scope.firstLoading = false;
        $scope.showDialog = false;
        $scope.showLoading = false;

        $scope.clickAll = false;//全选状态

        /**
         * 根据某数值获取合适的统计表纵轴最大值（max）和分隔（divide）
         * @param arg_num 传入统计数组中的最大值
         * @returns {{max: number, divide: number}}
         */
        function getSuitableDivide(arg_num) {
            var _max = arg_num > 0 ? arg_num : 10,
                _divide = 0;
            while (_max % 10) {
                _max++;
            }
            _divide = _max / 5;
            return {
                max: _max,
                divide: _divide
            }
        }

//-----------------------------配置HighCharts-----------------------------
        $scope.hcOption = {
            chart: {
                type: 'column'
            },
            title: {
                text: '成绩分布图'
            },
            xAxis: {
                tickLength: 0,
                tickWidth: 0
            },
            yAxis: {
                title: {
                    text: ''
                },
                min: 0,
                max: 100,
                tickInterval: 10
            },
            series: [{
                name: '人数',
                color: '#8dc957'
            }],
            credits: {
                enabled: false
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    }
                }
            }
        };
//-----------------------------获取统计信息-----------------------------
        $scope.firstLoading = true;
        course.getListGroup({
            aid: pid,
            ret_count: 2,
            tid: tid
        }).then(function (data) {
            var cat = [],//统计表标签数组
                dat = [],//统计表数据数组
                count = data.data.count || {};//返回的统计数据，含avg, count, total

            var _per = 0,//组区间
                _total = data.data.ext != null && data.data.ext.hasOwnProperty('total') ? data.data.ext.total : 0,//试卷总分
                _group = data.data.group || _total,//统计表分组间距
                _start = 0,//每一组的起始点
                _end = 0,//每一组的终止点
                _adviseCost = data.data.ext != null && data.data.ext.hasOwnProperty('ext') && data.data.ext.ext.hasOwnProperty('advise_cost') && data.data.ext.ext.advise_cost ? data.data.ext.ext.advise_cost : 0;//建议时长

            while (_per < _total) {
                _start = _per;
                _end = (_per + _group) >= _total ? _total : (_per + _group);

                cat.push(_start + (_start == _end ? '' : ('-' + _end)) + '分');
                dat.push(count.hasOwnProperty(_per + '') ? count[_per + ''] : 0);
                _per += _group;
            }

            if (count.hasOwnProperty(_total + '')) {
                dat[dat.length - 1] += count[_total + ''];//满分纳入最后一组
            }

            $scope.paperDetail.detail = {
                paperName: data.data.title || '',
                // answerTime: {
                //     startTime: 0,
                //     endTime: 0
                // },
                suggestTime: _adviseCost == 0 ? '无' : ((+moment(_adviseCost).utc().hour() == 0 ? '' : (+moment(_adviseCost).utc().hour() + '小时')) + +moment(_adviseCost).utc().minute() + '分钟'),
                // avgTime: moment(0).utc().format('HH:mm:ss'),
                avgScore: count.avg || 0
            };

            $scope.hcOption.xAxis.categories = cat;
            $scope.hcOption.series[0].data = dat;

            $scope.firstLoading = false;
        }, function (err) {
            // dialog.alert('获取统计信息错误，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
            dialog.showErrorTip(err, {
                moduleName: '试卷详情',
                funcName: 'getListGroup',
                text: '获取统计信息错误'
            });
            $scope.firstLoading = false;
        });

//-----------------------------分页获取数据-----------------------------
        $scope.pagefn = function (args, success) {
            $scope.showLoading = true;

            var _tids = {};
            _tids[tid] = [pid];//考试情况下需传{tid: [pid]}参数

            course.listPaperCorrect({
                aids: tid == '' ? pid : '',
                cid: cid,
                limit: args.ps,
                skip: (args.pn - 1) * args.ps,
                keyword: $scope.searchKw,
                ret_answer: 1,
                ret_score: 2,
                msort: $scope.msort,
                tids: tid == '' ? {} : _tids
            }).then(function (data) {

                $scope.paperDetail.stdList = convertStdData(data.data.info || []);
                $scope.userList = data.data.usr || {};
                $scope.userStatusList = data.data.status || {};

                var _property = tid == '' ? '_' : tid;
                var _check = data.data.hasOwnProperty('count') &&
                    data.data.count.hasOwnProperty(_property) &&
                    data.data.count[_property].hasOwnProperty(pid);

                var _count = _check ? data.data.count[_property] : {};

                $scope.paperDetail.progress = {
                    submitProgress: {
                        totalNum: data.data.joined || 0,
                        curNum: _check ? _count[pid].submitted : 0
                    },
                    correctProgress: {
                        totalNum: _check ? _count[pid].submitted : 0,
                        curNum: (_check ? _count[pid].submitted : 0) - (_check ? _count[pid].notc : 0)
                    }
                };

                var _data = [].concat($scope.hcOption.series[0].data), _maxNum = -100;
                if (_data) {
                    _data.forEach(function (element) {
                        if (element > _maxNum) {
                            _maxNum = element;
                        }
                    })
                }

                // var _divideConfig = getSuitableDivide(data.data.joined || 0);
                var _divideConfig = getSuitableDivide(_maxNum);
                $scope.hcOption.yAxis.max = _divideConfig.max;
                $scope.hcOption.yAxis.tickInterval = _divideConfig.divide;

                if ($scope.msort.hasOwnProperty('submited') && $scope.msort.hasOwnProperty('score') && $scope.msort.submited == '' && $scope.msort.score == '') {
                    angular.forEach($scope.sortTypes, function (value) {
                        value.active = false;
                    });
                }

                //-------------考试情况下的时间统计数据-------------
                $scope.paperDetail.detail.answerTime = {
                    startTime: tid == '' ? 0 : (data.data.test[0].start_time || 0),
                    endTime: tid == '' ? 0 : (data.data.test[0].end_time || 0)
                };
                $scope.paperDetail.detail.avgTime = moment(_check && _count[pid].hasOwnProperty('avg_cost') ? _count[pid].avg_cost : 0).utc().format('HH:mm:ss');
                if (tid != '') {
                    var _hour = +moment(data.data.test[0].cost_time || 0).utc().hour(),
                        _minute = +moment(data.data.test[0].cost_time || 0).utc().minute();
                    $scope.paperDetail.detail.suggestTime = (_hour == 0 ? '' : (_hour + '小时')) + _minute + '分钟';
                }
                //-----------考试情况下的时间统计数据 end-----------

                $scope.showLoading = false;
                success({pa: {total: _check ? _count[pid].submitted : 0}});
            }, function (err) {
                console.log('listPaperCorrect error', err);
                // dialog.alert('获取试卷信息失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '试卷详情',
                    funcName: 'pagefn',
                    text: '获取试卷信息和学生列表失败'
                });
                $scope.showLoading = false;
            });
        };
//-----------------------------方法定义（续）-----------------------------
        /**
         * 根据用户id获取用户信息
         * @param arg_uid
         * @returns {{nickname: string, account: *}}
         *              昵称              账号
         */
        $scope.getUserData = function (arg_uid) {
            var _check = $scope.userList.hasOwnProperty(arg_uid)
                && $scope.userList[arg_uid].hasOwnProperty('attrs')
                && $scope.userList[arg_uid].attrs.hasOwnProperty('basic')
                && $scope.userList[arg_uid].attrs.basic.hasOwnProperty('nickName');
            return {
                nickname: _check ? $scope.userList[arg_uid].attrs.basic.nickName : '',
                account: $scope.userList.hasOwnProperty(arg_uid) && $scope.userList[arg_uid].hasOwnProperty('usr') ?
                    $scope.userList[arg_uid].usr[$scope.userList[arg_uid].usr.length - 1] : arg_uid
            }
        };

        /**
         * 根据用户id获取用户状态
         * @param arg_uid
         * @returns {string}
         */
        $scope.getUserStatus = function (arg_uid) {
            return $scope.userStatusList.hasOwnProperty(arg_uid + '') ? $scope.userStatusList[arg_uid + ''] : ''
        };

        /**
         * 排序
         * @param arg_sort (value range -> $scope.sortTypes)
         */
        $scope.clickSort = function (arg_sort) {
            arg_sort.active && (arg_sort.isDescended = !arg_sort.isDescended);
            angular.forEach($scope.sortTypes, function (value) {
                value.active = false;
            });
            arg_sort.active = true;

            $scope.msort.corrected_s = '';
            $scope.msort.time = '';

            switch (arg_sort.name) {
                case '提交次数':
                    $scope.msort.submited = arg_sort.code * (arg_sort.isDescended ? -1 : 1);
                    $scope.msort.score = '';
                    break;
                case '最新成绩':
                    $scope.msort.submited = '';
                    $scope.msort.score = arg_sort.code * (arg_sort.isDescended ? -1 : 1);
                    break;
                default:
                    break;
            }

            $scope.loadPage();
        };

        /**
         * 点击全选
         */
        $scope.selectAll = function () {
            var flag = false;
            $scope.paperDetail.stdList.forEach(function (element) {
                flag = flag || element.click;
            });

            flag = flag === $scope.clickAll ? !flag : flag;

            $scope.clickAll = flag;

            $scope.paperDetail.stdList.forEach(function (element) {
                element.click = flag;
            });
        };

        /**
         * 检测每项的勾选状态，全部勾选返回true
         * @returns {boolean}
         */
        function checkSelect() {
            var flag = false;
            $scope.paperDetail.stdList.forEach(function (element, index) {
                if (!index) {
                    flag = element.click;
                } else {
                    flag = flag && element.click;
                }
            });
            return flag;
        }

        //点击单个选项↓
        $scope.selectClick = function (arg_obj) {
            arg_obj.click = !arg_obj.click;
            $scope.clickAll = checkSelect();
        };

        /**
         * 发布成绩弹窗，统计选中学生中已批改未批改的人数
         */
        $scope.publishResult = function () {
            $scope.selectedUid = {
                hasCorrect: [],//勾选学生中已经批改的学生
                notCorrect: []//勾选学生中未批改的学生
            };
            $scope.paperDetail.stdList.forEach(function (element) {
                if (element.click) {
                    // $scope.selectedUid.push(element.usrId);
                    if (element.corStatus) {
                        $scope.selectedUid.hasCorrect.push(element.usrId);
                    } else {
                        $scope.selectedUid.notCorrect.push(element.usrId);
                    }
                }
            });

            // for (var i = 0, il = $scope.paperDetail.stdList.length; i < il; i++) {
            //     if (!$scope.paperDetail.stdList[i].corStatus) {
            //         dialog.alert('选中的学生中还有未批改的学生哦');
            //         return;
            //     }
            //
            //     if ($scope.paperDetail.stdList[i].click) {
            //         $scope.selectedUid.push($scope.paperDetail.stdList[i].usrId);
            //     }
            // }

            // console.log($scope.selectedUid);

            if (!$scope.selectedUid.hasCorrect.length && !$scope.selectedUid.notCorrect.length) {
                dialog.alert('请选择需要发布的学生');
            } else {
                // $scope.showDialog = true;
                var _confirmStr = '';
                if ($scope.selectedUid.notCorrect.length === 0) {
                    _confirmStr = $scope.selectedUid.hasCorrect.length === 1 ? '<span>发布后该学生即可查看成绩</span>' : '<span>已批改学生<span class="color-cyan">' + $scope.selectedUid.hasCorrect.length + '</span>名，点击确定发布成绩。</span>';
                    dialog.confirm(_confirmStr, {
                        mask: true,
                        singleBtn: false,
                        confirmTitle: '确定发布？',
                        btnTextConfirm: '确定',
                        btnTextCancel: '取消'
                    }, function () {
                        $scope.commitPublish();
                    }, function () {
                        $scope.closeDialog();
                    });
                } else {
                    _confirmStr = $scope.selectedUid.notCorrect.length === 1 ? '<span>选中的学生尚未批改完成，不能发布</span>' : '<span>有<span class="color-red">' + $scope.selectedUid.notCorrect.length + '</span>名学生尚未批改完成</span>';
                    dialog.confirm(_confirmStr, {
                        mask: true,
                        singleBtn: true,
                        confirmTitle: '还不能发布哦',
                        btnTextConfirm: '确定'
                    }, function () {
                        $scope.closeDialog();
                    });
                }
            }
        };

        /**
         * 关闭弹窗，清空选择学生数据
         */
        $scope.closeDialog = function () {
            // $scope.showDialog = false;
            $scope.selectedUid = {
                hasCorrect: [],
                notCorrect: []
            };
        };

        /**
         * 发布成绩
         */
        $scope.commitPublish = function () {
            var _uids = '';
            for (var i = 0, len = $scope.selectedUid.hasCorrect.length; i < len; i++) {
                _uids += $scope.selectedUid.hasCorrect[i] + (i === len - 1 ? '' : ',');
            }

            course.Publish({
                aid: pid,
                tid: tid,
                uids: _uids,
                eid: 'C_SUBMITED'
            }).then(function (data) {
                if (data.code === 0) {
                    dialog.alert('发布成功');
                }

                $scope.showDialog = false;
                back2Initial();
            }, function (err) {
                // dialog.alert('发布成绩失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
                dialog.showErrorTip(err, {
                    moduleName: '试卷详情',
                    funcName: 'commitPublish',
                    text: '发布成绩失败'
                });
                $scope.showDialog = false;
            });
        };

        /**
         * 获取 批改/查看 Url
         * @param arg_type (value range: '批改' || '查看')
         * @param arg_params: obj
         * @returns {string}
         */
        $scope.getUrl = function (arg_type, arg_params) {
            arg_params.aid = pid;
            arg_params.tid = tid;
            arg_params.cid = cid;
            arg_params.tag = encodeURIComponent($routeParams.tag);
            arg_params.cname = encodeURIComponent($routeParams.cname);
            var _str = '';
            switch (arg_type) {
                case '批改':
                    arg_params.resolvestatus = 2;
                    _str = rcpAid.getUrl('批改页', arg_params);
                    break;
                case '查看':
                    arg_params.resolvestatus = 3;
                    _str = rcpAid.getUrl('批改页', arg_params);
                    break;
                default:
                    break;
            }
            return _str;
        };

        /**
         * 进入批改（批量）
         */
        $scope.enterCorrect = function () {
            var _tuids = '';
            $scope.paperDetail.stdList.forEach(function (element) {
                if (element.click) {
                    _tuids += element.usrId + ',';
                }
            });

            if (_tuids.length) {
                _tuids = _tuids.substring(0, _tuids.length - 1);
            }

            open($scope.getUrl('批改', {tuids: _tuids}));
        };

        /**
         * 左上角跳回试卷批改
         */
        $scope.back2PaperManager = function () {
            // location.href = rcpAid.getUrl('教学中心', {token: rcpAid.getToken()}) + '#/paperManager';
            $location.path('paperManager/' + $routeParams.tag + '/' + $routeParams.cid + '/' + $routeParams.cname);
        };

        /**
         * 搜索操作，清空筛选条件
         */
        $scope.searchStd = function () {
            $scope.msort = {
                corrected_s: -1,
                time: 1
            };
            $scope.loadPage();
        };

        /**
         * 搜索框回车事件
         */
        $scope.onKeyDown = function (event) {
            if (event.keyCode === 13) {
                $scope.searchStd();
            }
        };

        back2Initial();
    }]);