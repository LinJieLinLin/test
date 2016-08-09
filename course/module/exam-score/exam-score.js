/**
 * 作者：huangxs
 * 创建时间：2016/5/30
 * 依赖模块说明：loader-ui 加载动画；empty-tip 空数据显示图；head-selector 下拉选择框
 * 业务说明：列出有学生参与的课程下的试卷列表
 */

module.controller('paperManagerCtrl', ['$scope', '$timeout', '$location', 'service', 'course', 'examReq', '$routeParams', function ($scope, $timeout, $location, service, course, examReq, $routeParams) {
    //=========================== var ===================================
    $scope.pagerLoaded = false; //课程下试卷数据加载标志；false 未加载或正在加载，true 加载完成
    $scope.pagerList = [];  //课程下试卷列表

    //试卷类型下拉框配置
    $scope.pagerTypeSelector = {
        options: [
            {name: '全部', value: '0'},
            {name: '练习', value: 'e_exercise'},
            {name: '试卷', value: 'e_paper'},
            {name: '考试', value: 'e_test'}
        ],
        changeCb: changePagerType
    };

    $scope.curPagerType = $scope.pagerTypeSelector.options[0].value;    //当前试卷类型
    $scope.curCourseId = $routeParams.cid;    //当前显示试卷列表的课程id

    //========================== function ==================================
    /**
     * 下拉选择框选择回调
     * @param item  $scope.pagerTypeSelector.options 中的对象
     */
    function changePagerType(item) {
        $scope.curPagerType = item.value;
        // $scope.pagerPageArgs = initPageArgs();

        $timeout(function () {
            loadPagerData();
        });
    }

    /**
     * 根据试卷类型返回对应的类型名称
     * @param type  类型
     * @returns {*} 名称
     */
    function typeToName(type) {
        if (type) {
            var options = $scope.pagerTypeSelector.options;
            for (var i = 0, len = options.length; i < len; i++) {
                if (options[i].value == type) {
                    return options[i].name;
                }
            }
        }
        console.log('[error]', '类型转换成名称错误，无法识别的类型', $scope.pagerTypes, type);
        return '';
    }

    /**
     * 请求加载试卷数据
     */
    function loadPagerData() {
        $scope.pagerLoaded = false;
        var requestData = {
            ret_count: 1    //1 返回试卷统计信息
        };
        $scope.curPagerType && $scope.curPagerType !== '0' && (requestData.ctype = $scope.curPagerType);
        requestData.cids = $scope.curCourseId;

        //请求指定试卷类型指定课程的全部试卷数据
        examReq.listCourseRef(requestData).then(function (data) {
            $scope.pagerLoaded = true;
            if (!data || !data.data) {
                console.log('[error]', '获取试卷信息返回数据为空', data);
                return;
            }
            handlePagerData(data.data);
        }, function (err) {
            $scope.pagerLoaded = true;

            service.dialog.showErrorTip(err, {
                moduleName: '试卷批改',
                funcName: 'loadPagerData',
                text: '获取试卷信息失败'
            });
        });
    }

    /**
     * 处理后台返回的数据，后台返回指定试卷类型指定课程的全部试卷数据
     * @param data  后台返回的data
     */
    function handlePagerData(data) {
        // console.log('试卷数据', data);
        // var list = dataListCache.list || (dataListCache.list = []);
        var list = $scope.pagerList;
        list.length = 0;
        if (!data || !data.iteml) {
            console.log('[error]', '欲处理的试卷数据为空', data);
            return;
        }

        var countCache, joined;
        joined = data.course && data.course[0] && data.course[0].joined || 0;

        //获取已提交和已批改的数据
        function getCount(aid) {
            if (!countCache) {
                countCache = {};
                var d = data.count || {};
                for (var k in d) {
                    if (d.hasOwnProperty(k)) {
                        if (d[k]) {
                            for (var p in d[k]) {
                                countCache[p] = d[k][p];
                            }
                        }
                    }
                }
                console.log('pager data count info', countCache);
            }
            var tmp = countCache[aid] || {};
            var ans = {
                join: joined,
                submit: tmp.submitted || 0
            };
            ans.score = ans.submit - (tmp.notc || 0);
            return ans;
        }

        var count = 0, arr, tmp, location, items, iid, countinfo;
        for (var k in data.iteml) {
            if (data.iteml.hasOwnProperty(k)) {
                count++;
                arr = data.iteml[k];
                for (var i = 0, len = arr.length; i < len; i++) {
                    //获取所在位置，一般指第几章
                    tmp = arr[i];
                    location = tmp.beg && tmp.beg.c && tmp.beg.c.title || '未命名章';
                    items = tmp.items;
                    if (Array.isArray(items)) {
                        for (var j = 0, l = items.length; j < l; j++) {
                            tmp = items[j];
                            tmp = tmp && tmp.c || {};
                            //获取已提交和已批改的数据
                            countinfo = getCount(tmp.aid);
                            //将数据放进试卷列表
                            list.push({
                                name: tmp.title || '未命名试卷', //试卷名
                                type: typeToName(tmp.type), //试卷类型
                                location: location, //位置
                                submit: countinfo.submit + '/' + countinfo.join,    //提交数
                                score: countinfo.score + '/' + countinfo.submit,    //批改数
                                aid: tmp.aid || '', //试卷id
                                tid: tmp.tid || ''  //评测id，可能为空
                            });
                        }
                    } else {
                        console.log('[error]', '课程或章节下试卷获取错误', tmp, items);
                    }
                }
            }
        }

        // (count == 0 || count > 1 || data.course && data.course.length != count) && console.log('[error]', '返回的试卷所属的课程过多', 'count', count, 'courses count', data.course.length);
    }

    //============================== scope function ===========================
    /**
     * 批改按钮点击回调，跳转到试卷详情页
     * @param aid   试卷id
     * @param tid   评测id；可为空
     */
    $scope.toScore = function (aid, tid) {
        $location.path('/paper-detail/' + $routeParams.tag + '/' + $scope.curCourseId + '/' + $routeParams.cname + '/' +aid + '/' + (tid ? tid : 'null'));
    };

    //======================= init ======================
    loadPagerData();
}]);