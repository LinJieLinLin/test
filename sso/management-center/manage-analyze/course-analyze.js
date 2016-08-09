/**
 * Created by hXiongSheng
 */

module.controller('courseAlyCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.curCollegeIndex = 0; //当前选择的机构
    $scope.showPage = 0;    //显示的页面，0 课程统计，1 课程详情

    $scope.loading = true;  //数据加载标志
    $scope.collegeList = [];    //学校机构列表

    $scope.courseLoading = true;    //课程加载标志
    $scope.courseList = []; //课程列表
    $scope.courseSearch = '';   //课程搜索框内容

    
    $scope.studentLoading = true;   //加载学生数据
    $scope.studentList = [];    //学生列表
    $scope.detailSearch = '';   //详情搜索框内容

    //数量统计
    $scope.count = {
        course: 100,
        teacher: 4566,
        student: 123424
    };

    //分数人数数据
    $scope.scoreNum = {
        maxScore: 2333,
        minScore: 123,
        avgScore: 234,
        creditNum: 234, //获得学分人数
        totalNum: 34
    };

    /**
     * 初始化分页参数
     * @returns {{pn: number, ps: number, pl: number}}
     */
    function initPageArgs() {
        return {
            pn: 1,  //当前第几页
            ps: 5,  //每页显示的课程数
            pl: 5
        }
    }

    /**
     * 加载学校机构列表
     */
    function loadCollegeList() {
        $scope.loading = true;
        $timeout(function () {
            $scope.loading = false;
            $scope.collegeList = [
                {id: '', name: '不限'},
                {id: '', name: '广州大学', num: 14},
                {id: '', name: '广州医科大学', num: 0},
                {id: '', name: '广州番禺职业技术学院', num: 43534},
                {id: '', name: '广州城市职业学院', num: 2342},
                {id: '', name: '广州体育职业学院', num: 234},
                {id: '', name: '广州科技贸易职业学院', num: 234},
                {id: '', name: '广州广播电视大学', num: 789},
                {id: '', name: '广州工程技术学院', num: 234},
                {id: '', name: '广州铁路职业技术学院', num: 2342342}
            ];
            $scope.collegeClick($scope.collegeList[0], 0);
        }, 500)
    }

    /**
     * 重置，初始化
     */
    function detailReset() {
        $scope.detailSearch = '';
        $('#startTime').val('');
        $('#endTime').val('');
    }

    /**
     * 加载对应课程的学生数据
     * @param cid   课程id
     */
    function loadStudentList(cid) {
        detailReset();
        $scope.studentPageArgs = initPageArgs();
        $scope.studentPageArgs.cid = cid;
    }

    /**
     * 将时间戳格式化成 x天x小时x分x秒
     * @param timestamp 时间戳
     * @returns {string}
     */
    function formatTimestamp(timestamp) {
        var unit = 1;
        var day = Math.floor(timestamp / (86400 * unit));
        timestamp = timestamp % (86400 * unit);
        var hour = Math.floor(timestamp / (3600 * unit));
        timestamp = timestamp % (3600 * unit);
        var minute = Math.floor(timestamp / (60 * unit));
        timestamp = timestamp % (60 * unit);
        var second = Math.floor(timestamp / unit);

        var format = '';
        day && (format += day + '天');
        hour && (format += hour + '小时');
        minute && (format += minute + '分');
        second && (format += second + '秒');

        format || (format = '0秒');
        return format;
    }

    /**
     * 搜索框回车
     * @param e 按键事件
     * @param cb    回车回调
     */
    $scope.keydown = function (e, cb) {
        if(e.keyCode == 13){
            cb && cb();
        }
    };

    /**
     * 点击选择学院机构
     * @param item  对应的学校，$scope.collegeList 中的对象
     * @param index $scope.collegeList 数组下标
     */
    $scope.collegeClick = function (item, index) {
        $scope.curCollegeIndex = index;
        $scope.reLoadCourseList(item.oid);
    };
    
    //查看点击
    $scope.lookDetail = function (item) {
        $scope.showPage = 1;
        loadStudentList(item.cid);
    };

    /**
     * 重新加载对应机构下的课程
     * @param oid   机构id
     */
    $scope.reLoadCourseList = function (oid) {
        $scope.pageArgs = initPageArgs();
        if(angular.isDefined(oid)) {
            $scope.pageArgs.oid = oid;
        }
    };

    /**
     * 重新加载对应课程下的学生列表
     */
    $scope.reLoadStudentList = function() {
        var cid = $scope.studentPageArgs.cid;
        $scope.studentPageArgs = initPageArgs();
        $scope.studentPageArgs.cid = cid;
    };

    //分页回调，加载课程数据
    $scope.loadDataFn = function (args, cb) {
        $scope.courseLoading = true;
        $timeout(function () {
            $scope.courseLoading = false;
            $scope.courseList = [
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {title: '跨界电商综合课程（下）', teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'}
            ];
            cb({pa: {total: 100}});
        }, 500);
    };

    //分页回调，加载学生数据
    $scope.loadStudentDataFn = function (args, cb) {
        $scope.studentLoading = true;
        $timeout(function () {
            $scope.studentLoading = false;
            $scope.studentList = [
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(5645646), studyTime: formatTimestamp(564551515), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(0), studyTime: formatTimestamp(1), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(60), studyTime: formatTimestamp(61), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(3600), studyTime: formatTimestamp(3601), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(86400), studyTime: formatTimestamp(86400 + 1), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(86400 + 60), studyTime: formatTimestamp(86400 + 3600), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(3600 + 60), studyTime: formatTimestamp(564551515), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(845), studyTime: formatTimestamp(852), totalScore: 234},
                {teacher: '不同道', college: '广州科技贸易职业学院', credit: 234, onlineTime: formatTimestamp(24), studyTime: formatTimestamp(24), totalScore: 234},
            ];
            cb({pa: {total: 100}});
        }, 500);
    };
    
    //========================== init ==========================

    function init() {
        //初始化时间选择插件
        $(function (){
            $('.la-time-date').each(function(index, element) {
                $(this).date();
                if(index == 1){
                    //时间选择插件默认左对齐，这里把第二个时间选择框重置成右对齐
                    var select = $(this);
                    select.bind('click', function () {
                        var wrap = $(window.binDate.oWrap);
                        // console.log('offset:', wrap.offset(), 'select outw:', select.outerWidth(), 'wrap outw:', wrap.outerWidth());
                        wrap.offset();
                        wrap.css('left', select.offset().left + select.outerWidth() - wrap.outerWidth());
                    });
                }
            });
        });
    }

    loadCollegeList();
    init();
}]);