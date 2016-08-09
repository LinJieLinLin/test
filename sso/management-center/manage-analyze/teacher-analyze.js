/**
 * Created by hXiongSheng
 */


module.controller('teacherAlyCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.loading = true;  //数据加载标志
    $scope.teacherLoading = true;   //课程加载标志

    $scope.curCollegeIndex = 0; //当前选择的机构

    $scope.collegeList = [];    //学校列表

    $scope.teacherList = [];
    $scope.teacherSearch = '';  //教师搜索框内容

    //数量统计
    $scope.count = {
        course: 100,
        teacher: 4566,
        student: 123424
    };

    //初始化分页参数
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
     * 点击选择学院机构
     * @param item  对应的学校，$scope.collegeList 中的对象
     * @param index $scope.collegeList 数组下标
     */
    $scope.collegeClick = function (item, index) {
        $scope.curCollegeIndex = index;
        $scope.reLoadTeacherList(item.oid);
    };

    //搜索框回车
    $scope.keydown = function (e) {
        if(e.keyCode == 13){
            $scope.reLoadTeacherList();
        }
    };

    /**
     * 重新加载对应机构下的教师列表
     * @param oid   机构id
     */
    $scope.reLoadTeacherList = function (oid) {
        $scope.pageArgs = initPageArgs();
        if(angular.isDefined(oid)) {
            $scope.pageArgs.oid = oid;
        }
    };

    //分页回调，加载数据
    $scope.loadDataFn = function (args, cb) {
        $scope.teacherLoading = true;
        $timeout(function () {
            $scope.teacherLoading = false;
            $scope.teacherList = [
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
                {courseNum: 545, teacher: '不同道', college: '广州科技贸易职业学院', inStu: '234人', outStu: '324人', societyStu: '2345人'},
            ];
            cb({pa: {total: 100}});
        }, 500);
    };

    //================= init ==============
    loadCollegeList();
}]);