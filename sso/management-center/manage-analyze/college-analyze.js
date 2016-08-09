/**
 * Created by hXiongSheng
 */

module.controller('collegeAlyCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    //数据加载标志
    $scope.loading = true;

    //表图容器样式
    $scope.containerStyle = {
        width: '737px',
        height: '427px'
    };

    /**
     * 初始化表图
     * @param id    容器id
     * @param option    highcharts jq组件配置
     * @returns {*|jQuery}
     */
    function initChartOption(id, option) {
        var init = {
            title: {
                style: {
                    display: 'none'
                }
            },
            colors: ['#df477a', '#50b9e6'],
            credits: {
                enabled: false
            },
            chart: {
                type: 'column'
            },
            xAxis: {
                labels: {
                    rotation: -45
                }
            },
            yAxis: {
                title: {
                    text: '（人数）',
                    align: 'high',
                    rotation: 0
                }
            },
            legend: {
                layout: 'vertical',
                floating: true,
                backgroundColor: 'white',
                align: 'right',
                verticalAlign: 'top',
                x: 0,
                y: -12
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        crop: false,
                        overflow: 'none'
                    }
                }
            }
        };

        option = option || {};
        for (var p in option) {
            if (option.hasOwnProperty(p)) {
                if (init[p] && angular.isObject(option[p])) {
                    init[p] = angular.extend(init[p], option[p]);
                } else {
                    init[p] = option[p];
                }
            }
        }

        return $('#' + id).highcharts(init);
    }

    /**
     * 请求加载数据
     */
    function loadData() {
        $scope.loading = true;
        $timeout(function () {
            $scope.loading = false;
            handleData();
        }, 500)
    }

    /**
     * 处理数据，链接视图
     * @param data 后台返回的data
     */
    function handleData(data) {
        var colleges = ['广州大学', '广州医科大学', '广州番禺职业技术学院', '广州城市职业学院', '广州体育职业学院', '广州科技贸易职业学院', '广州广播电视大学', '广州工程技术学院', '广州铁路职业技术学院'];
        var collegeData = [10, 20, 30, 40, 40, 50, 19, 60, 70];
        var teacherData = [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4];
        var studentData = [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 2016.4];

        //高校概况
        initChartOption('ca-college', {
            colors: ['#21ad90'],
            yAxis: {
                title: {
                    text: '（课程数）',
                    align: 'high',
                    rotation: 0
                }
            },
            series: [{
                name: '课程数',
                data: collegeData
            }],
            xAxis: {
                categories: colleges
            }
        });

        //人员统计
        initChartOption('ca-people', {
            series: [{
                name: '教师人数',
                data: teacherData
            }, {
                name: '学生人数',
                data: studentData
            }],
            xAxis: {
                categories: colleges
            }
        });
    }

    //==================== init ======================
    loadData();
}]);