/**
 * Created by Zhongj on 2016/6/4.
 * 模块说明：成绩管理
 */

module.factory('debounce', ['$timeout', '$q', function($timeout, $q) {
    return function(func, wait, immediate) {
        var timeout;
        var deferred = $q.defer();
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if(!immediate) {
                    deferred.resolve(func.apply(context, args));
                    deferred = $q.defer();
                }
            };
            var callNow = immediate && !timeout;
            if ( timeout ) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);
            if (callNow) {
                deferred.resolve(func.apply(context,args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
}]);

module.controller("scoreManagerCtrl",['$scope','$http','$interval','debounce','service','scoremanager'
    ,function ($scope,$http,$interval,debounce,service,scoremanager) {
    //---------------------------------variable defined-------------------------------------------//
    $scope.data = {};
    $scope.data.course = [];//课程列表内容
    $scope.data.rowNum = 4;//默认筛选列表每行显示4个
    $scope.data.showMore = false;//默认筛选列表不现实“更多”
    $scope.data.curCourseIndex = 0;//默认选中筛选列表的第一个课程
    var postSaveData = {};//定义保存数据时的请求数据
    postSaveData.saveUsrScoreLst = [];//定义保存数据时需要更新成绩的学生数据
    var postSubmitData = [];//定义保存数据时的请求数据

    var requestTimes = 1;//默认是第一次请求
    var requestData = {//定义请求后台接口数据,有4个参数：cid：课程id；page：页数；pageCount：每页个数；query：搜索条件（都是可选的）
        page:1,
        pageCount:50
    };
    $scope.data.curCourseId = "";//当前成绩列表的课程id
    $scope.data.scoreTags = [];// 成绩列表表头
    $scope.data.usrScorelst = [];//当前页的学生成绩列表内容
    $scope.data.allUsrScoreLst = [];//所有学生的成绩列表
    $scope.data.scoreInvalid = false;//默认成绩格式是正确的

    //分页
    $scope.data.usrScoreAllCount = 0;//成绩列表总数
    $scope.data.pageSize = 15;//成绩列表每页默认显示15条
    $scope.data.pageList = [];//分页的总页数

    //统计
    $scope.data.joinCurStuCount = 0;//参与课程的学生总数
    $scope.data.noEntryStuCount = 0;//未录入成绩的学生总数
    $scope.data.EntringStuCount = 0;//已改动或已发送的学生成绩总数

    //定时器
    var atuoSaveTimer;//自动保存，每隔10s保存一次的定时器

    if(angular.isUndefined($http)){
        console.log("$http is undefined.");
        return;
    }

    //---------------------------------function defined-------------------------------------------//

    /*
     * 清空上一个课程遗留的历史数据
     * author:zhongj
     * */
    function clearPreCourse() {
        $scope.data.scoreTags = [];// 成绩列表表头
        $scope.data.usrScorelst = [];//学生成绩列表内容
        $scope.data.allUsrScoreLst = [];//所有学生的成绩列表

        requestData.page = 1;//请求页数清为初始值
        //分页
        $scope.data.usrScoreAllCount = 0;
        $scope.data.pageSize = 15;//成绩列表每页默认显示15条
        $scope.data.pageList = [];//分页的总页数

        //统计
        $scope.data.joinCurStuCount = 0;//参与课程的学生总数
        $scope.data.noEntryStuCount = 0;//未录入成绩的学生总数
        $scope.data.EntringStuCount = 0;//正在录入但未保存成绩的学生总数

        //取消定时器
        $interval.cancel(atuoSaveTimer);
    }

    /*
     * 将数组pushArray追加到argArray尾部，重返argArray数组
     * param: argArray，pushArray
     * author:zhongj
     * return: argArray（追加了pushArray）
     * */
    function pushArray(argArray,pushArray) {
        if(angular.isUndefined(argArray) || argArray == null||angular.isUndefined(pushArray) || pushArray == null){
            console.log("argArray or pushArray is undefined or null.");
            return;
        }
        argArray.push(pushArray);
        return argArray;
    }

    /*
     * 从服务器获取的课程列表根据样式呈现需求进行重组
     * param: data,response data which come from ListScore,it's course tags
     * author:zhongj
     * */
    function formCourseTags(argData) {
        if(angular.isUndefined(argData) || argData == null){
            console.log("【formCourseTags】:argData is undefined or null.");
            return;
        }
        //将成绩列表表头类型加入scoreTags数组参数里
        angular.forEach(argData,function (obj,tagType) {
            angular.forEach(obj,function (val,key) {
                val.status = tagType;
            });
        });
        //组建成绩管理表格的表头
        angular.forEach(argData,function (obj,key) {
            angular.forEach(obj,function (val,key) {
                $scope.data.scoreTags = pushArray($scope.data.scoreTags,val);
            });
        });
        console.log("$scope.data.scoreTags = ");
        console.log($scope.data.scoreTags);
    }

    /*
     * 从服务器获取的课程列表根据样式呈现需求进行重组
     * param: argSelfPage：当前选中页的页数；argNewPages：分页页组的间隔大小;argPages：总页数
     * 说明：处理selfpage至首时；selfpage至尾时；selfpage靠左不至首时，左边留一位；selfpage在尾页的间距范围内，就全部呈现。
     * return:paperList
     * author:zhongj
     * */
    function getPaperLst(argSelfPage,argNewPages,argPages) {
        var pageLst = [];
        if(angular.isUndefined(argNewPages) || argNewPages <= 0){
            console.log("【getPaperLst】:argNewPages is undefined or <= 0.");
            return pageLst;
        }
        if(angular.isUndefined(argSelfPage) || argSelfPage <= 0){
            console.log("【getPaperLst】:argSelfPage is undefined or <= 0.");
            return pageLst;
        }
        if(angular.isUndefined(argPages) || argPages <= 0){
            console.log("【getPaperLst】:argPages is undefined or <= 0.");
            return pageLst;
        }
        console.log("【getPaperLst】:argSelfPage = " + argSelfPage);
        console.log("【getPaperLst】:argPages = " + argPages);
        console.log("【getPaperLst】:argNewPages = " + argNewPages);

        if(argSelfPage == 1){//如果当前页是首页
            for (var i = argSelfPage; i <= argNewPages; i++) {
                pageLst.push(i);
            }
            console.log("【getPaperLst】:pageList = "+ pageLst);
            return pageLst;
        }
        if(argSelfPage == argPages){//如果当前页是尾页
            for (var i = argSelfPage-argNewPages+1; i <= argPages; i++) {
                pageLst.push(i);
            }
            console.log("【getPaperLst】:pageList = "+ pageLst);
            return pageLst;
        }
        var temp = argPages-argNewPages;
        if(argSelfPage == temp+1){
            for (var i = argPages-argNewPages; i < argPages; i++) {
                pageLst.push(i);
            }
            console.log("【getPaperLst】:pageList = "+ pageLst);
            return pageLst;
        }
        if(argSelfPage>temp){//当前页在尾页间距范围内，把尾页全部显示
            for (var i = argPages-argNewPages+1; i <= argPages; i++) {
                pageLst.push(i);
            }
            console.log("【getPaperLst】:pageList = "+ pageLst);
            return pageLst;
        }
        if(argSelfPage>1 && argSelfPage<=temp){//当前页居中的情况处理
            for (var i = argSelfPage-1; i < (argSelfPage+argNewPages-1); i++) {
                pageLst.push(i);
            }
            console.log("【getPaperLst】:pageList = "+ pageLst);
            return pageLst;
        }
    }

    /*
     * 通过当前页筛选出当前列表呈现的数据
     * param: argSelfPage：当前选中页的页数;argSelPageContent:当前页的条数
     * 说明：处理selfpage至首时；selfpage至尾时；selfpage靠左不至首时，左边留一位；selfpage在尾页的间距范围内，就全部呈现。
     * return:paperList
     * author:zhongj
     * */
    function setUsrScoreLst(argSelfPage,argSelPageContent) {
        if(angular.isUndefined(argSelfPage) || argSelfPage <= 0){
            console.log("【setUsrScoreLst】:argSelfPage is undefined or <= 0.");
            return;
        }
        if(angular.isUndefined(argSelPageContent) || argSelPageContent < 0){
            console.log("【setUsrScoreLst】:argSelPageContent is undefined or < 0.");
            return;
        }
        if(angular.isUndefined(requestData) || requestData == null){
            console.log("【setUsrScoreLst】:requestData is invalid or null.");
            return;
        }
        if(angular.isUndefined($scope.data.pageSize) || $scope.data.pageSize == null){
            console.log("【setUsrScoreLst】:pageSize is invalid or null.");
            return;
        }
        var interval = argSelfPage * $scope.data.pageSize;
        console.log("【setUsrScoreLst】:argSelPageContent = " + argSelPageContent);
        console.log("【setUsrScoreLst】:usrScoreAllCount = " + $scope.data.usrScoreAllCount);
        console.log("【setUsrScoreLst】:allUsrScoreLst.length = " + $scope.data.allUsrScoreLst.length);
        if(argSelPageContent<$scope.data.pageSize && ($scope.data.usrScoreAllCount != $scope.data.allUsrScoreLst.length)){
            //当缓存的数据已使用完，而实际数据比缓存数据大时，请求下一页
            requestData.cid = $scope.data.curCourseId;
            requestData.page = requestData.page + 1;
            requestData.pageCount = 50;
            $scope.data.scoreTags = [];
            requestTimes = requestTimes + 1;//请求+1
            reqScorelist(requestData,"PN");
            return;
        }
        $scope.data.usrScorelst = $scope.data.allUsrScoreLst.slice(($scope.data.pageSize*(argSelfPage - 1)),
            interval);
    }

    //只有当存在未保存的学生成绩时才会向服务器发送，但会定格10s检测是否存在未保存的数据
    function startAutoSave() {
        if(angular.isUndefined($interval) || $interval == null){
            console.log("【startAutoSave】:$timeout is undefined or null.");
            return;
        }
        atuoSaveTimer = $interval(function () {
            if(!angular.isUndefined($scope.data.EntringStuCount) && $scope.data.EntringStuCount>0){
                // console.log("【startAutoSave】:saveEntryStuScore.");
                $scope.saveEntryStuScore();
            }
            // console.log("【startAutoSave】:start.");
        },10000);
    }

    /*
     * 分页
     * param: data：response data which come from ListScore，it's response（json对象）【必选参数】
     * param:type：请求类型，CT表示点击课程请求；PN表示分页请求，【必选参数】
     * author:zhongj
     * */
    function pageFn(argData,argType) {
        if(angular.isUndefined(argData) || argData == null){
            console.log("【pageFn】:argData is undefined or null.");
            return;
        }
        if(angular.isUndefined(argType) || argType == null){
            console.log("【pageFn】:argType is undefined or null.");
            return;
        }
        console.log("【pageFn】:start.");
        if(argType == "CT"){
            console.log("【pageFn:CT】:allCount = " + argData.allCount);
            $scope.data.usrScoreAllCount = argData.allCount;
            $scope.pages = Math.ceil($scope.data.usrScoreAllCount/ $scope.data.pageSize);//从后台获取数据后计算分页数
            console.log("【pageFn:CT】:pages = " + $scope.pages);
            $scope.newPages = $scope.pages > 5 ? 5 : $scope.pages;
            console.log("【pageFn:CT】:newPages = " + $scope.newPages);

            $scope.selPage = 1;
            angular.copy(argData.form,$scope.data.allUsrScoreLst);//将每次请求的user score list存储起来
            console.log("$scope.data.allUsrScoreLst = ");
            console.log($scope.data.allUsrScoreLst);

            if($scope.data.usrScoreAllCount >= $scope.data.pageSize){
                // console.log("form = "+ response.form);
                //默认读0~15条的数据
                $scope.data.usrScorelst = $scope.data.allUsrScoreLst.slice(0,$scope.data.pageSize);
            }else {
                $scope.data.usrScorelst = $scope.data.allUsrScoreLst.slice(0,$scope.data.usrScoreAllCount);//当usrScoreAllCount<pageSize,只有一页，且当前页的条数是usrScoreAllCount
            }
            // console.log("usrScorelst = "+ $scope.data.usrScorelst);
            $scope.data.pageList = getPaperLst($scope.selPage,$scope.newPages,$scope.pages);
            // console.log("pageList = "+ $scope.data.pageList);
            startAutoSave();//启动每隔10s自动保存机制

        }else if(argType == "PN" && ((!angular.isUndefined(argData.form) || argData.form != null) && argData.form.length > 0)){
            $scope.data.usrScoreAllCount = argData.allCount;
            console.log("【pageFn:PN】:usrScoreAllCount = "+ $scope.data.usrScoreAllCount);
            $scope.pages = Math.ceil($scope.data.usrScoreAllCount/ $scope.data.pageSize);//从后台获取数据后计算分页数
            console.log("【pageFn:PN】:pages = "+ $scope.pages);
            $scope.newPages = $scope.pages > 5 ? 5 : $scope.pages;
            // console.log("newPages = "+ $scope.newPages);
            console.log("【追加前】：allUsrScoreLst.length = "+ $scope.data.allUsrScoreLst.length);
            angular.forEach(argData.form,function (val,key) {
                $scope.data.allUsrScoreLst.push(val);//追加
            });
            console.log("【追加后】：allUsrScoreLst.length = "+ $scope.data.allUsrScoreLst.length);
            console.log($scope.data.allUsrScoreLst);

            $scope.data.usrScorelst = $scope.data.allUsrScoreLst.slice(($scope.data.pageSize*($scope.selPage - 1)),
                ( $scope.selPage * $scope.data.pageSize));
            $scope.data.pageList = getPaperLst($scope.selPage,$scope.newPages,$scope.pages);
        }
    }

    /*
     * 请求成绩列表
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListScore
     * param: request data (json),token,cid,page,pageCount,query || type:'CT':点击课程筛选列表 or 'PN'：分页
     * 说明：当type=‘CT’时，表头和表格内容会根据course变化；当type = ‘PN’，表示请求分页，表格内容会发生变化
     * author:zhongj
     * return: response or null
     * */
    function reqScorelist(argReqData,argType) {
        if(angular.isUndefined(argReqData)|| argReqData == null){
            console.log("【reqScorelist】：request data is undefined or null.");
            return;
        }
        if(argReqData.token == null){
            console.log("【reqScorelist】：request user token is null.");
            return;
        }
        console.log("【reqScorelist】：cid = " + argReqData.cid);
        console.log("【reqScorelist】：token = " + argReqData.token);
        console.log("【reqScorelist】：page = " + argReqData.page);
        console.log("【reqScorelist】：pageCount = " + argReqData.pageCount);

        scoremanager.getScoreList(argReqData)
            .then(function success(response) {
                console.log("【reqScorelist】：",response);
            if(response.code == 0){
                console.log("【reqScorelist】：success.");
                console.log("【reqScorelist】：data course = " + response.data.course);

                //当course发生变化时，会更新course，否则保留上一次的数据记录
                if(!angular.isUndefined(response.data.course) && response.data.course != null){
                    $scope.data.course = response.data.course;
                }

                if(requestTimes == 1){//首次请求后台默认列出第一个课程的成绩列表
                    $scope.data.curCourseId = $scope.data.course[0]._id;
                }

                //当key发生变化时，会更新key，否则保留上一次的数据记录
                if(!angular.isUndefined(response.data.key) && response.data.key != null){
                    clearPreCourse();//清空上一个课程遗留的数据
                    //组建筛选课程列表
                    formCourseTags(response.data.key);
                }else {
                    console.log("【reqScorelist】：call formCourseTags function in reqScorelist  is invalid.");//请求不合法
                    return;
                }
                console.log("【reqScorelist】：data form =",response.data.form);
                if((!angular.isUndefined(response.data.form) && response.data.form != null)){
                    //分页
                    pageFn(response.data,argType);
                }else {
                    console.log("【reqScorelist】：call pageFn  reqScorelist  function in reqScorelist is invalid.");//请求不合法
                    return;
                }

                if(angular.isUndefined($scope.data.joinCurStuCount) || $scope.data.joinCurStuCount <0){
                    console.log("【reqScorelist】：join course student count is undefined or < 0.");
                    //后台没有返回合法的参与课程学生总数
                    return;
                }
                $scope.data.joinCurStuCount = response.data.allCount;

                if(!angular.isUndefined($scope.data.noEntryStuCount) && $scope.data.noEntryStuCount >=0){
                    $scope.data.noEntryStuCount = response.data.uneditCount;
                }
            }else {
                console.log("【reqScorelist】：request server failed code is : "+ response.code + " & reason is :" + response.dmsg);
            }
        },function error(response){
            console.log("【reqScorelist】：request server failed reason is : "+ response);
        });
    }

    /*
     * 还原未保存成功的成绩数据
     * param: argUpdErrScore，返回的更新失败的成绩数据，格式是数组
     * author:zhongj
     * */
    function updateUsrScoreLst(argUpdErrScore) {
        if(angular.isUndefined(argUpdErrScore) || argUpdErrScore == null){
            console.log("【updateUsrScoreLst】：argUpdErrScore is undefined or less than 0.");
            return;
        }
        if(angular.isUndefined($scope.data.allUsrScoreLst) || $scope.data.allUsrScoreLst.length <= 0){
            console.log("【updateUsrScoreLst】：allUsrScoreLst is undefined or less than 0.");
            return;
        }
        for(var i=0;i<argUpdErrScore.length;i++){
            for(var j = 0;j<$scope.data.allUsrScoreLst.length;j++){
                if(argUpdErrScore[i].uid == $scope.data.allUsrScoreLst[j].uid){
                    $scope.data.allUsrScoreLst[j]["type"] = 1;//该数据已改动未保存成功
                    break;
                }
            }
        }
        $scope.data.EntringStuCount = argUpdErrScore.length;//已录入成绩未保存成功个数
    }

    //设置可编辑字段的数据格式是否符合要求
    function setInvalid(argUsrScore,argKey,argInValid) {
        if(angular.isUndefined(argUsrScore) || argUsrScore == null){
            console.log("【setInvalid】：argUsrScore is undefined or null.");
            return;
        }
        if(angular.isUndefined(argKey) || argKey == null){
            console.log("【setInvalid】：argKey is undefined or null.");
            return;
        }
        if(angular.isUndefined(argUsrScore.invalid)){
            argUsrScore.invalid = {};
        }
        argUsrScore.invalid[argKey] = argInValid;
    }

    /*
     * 切换课程
     * param: argCourseID，切换后的课程id，argIndex：筛选列表里面的第几位
     * author:zhongj
     * */
    function turnCourse(argCourseId,argIndex) {
        if(angular.isUndefined(argCourseId)){
            console.log("argCourse is undefined.");
            return;
        }
        if(angular.isUndefined(argIndex)||argIndex<0){
            console.log("argIndex("+argIndex+") is undefined or <0.");
            return;
        }
        if(angular.isUndefined($scope.data.curCourseIndex)){
            console.log("curCourseIndex is undefined.");
            return;
        }
        if(angular.isUndefined(requestTimes)){
            console.log("requestTimes is undefined.");
            return;
        }
        if(angular.isUndefined($scope.data.curCourseId)){
            console.log("curCourseId is undefined.");
            return;
        }
        if(angular.isUndefined(requestData)){
            console.log("requestData is undefined.");
            return;
        }
        $scope.data.curCourseIndex = argIndex;
        console.log("curCourseIndex = " + argIndex);
        requestTimes = requestTimes + 1;
        $scope.data.curCourseId = argCourseId;
        requestData.cid = argCourseId;
        console.log("cid = " + requestData.cid);
        reqScorelist(requestData,"CT");
    }

    //选中页数更新表单内容
    function updateContentForPage(argPage) {
        if(angular.isUndefined($scope.newPages) || angular.isUndefined($scope.pages)||angular.isUndefined($scope.data.pageList)){
            console.log("【selectPage】:newPages("+$scope.newPages+") or pages("+$scope.pages+") or data.pageList("+$scope.data.pageList+") is undefined.");
            return;
        }
        if(argPage<1 || argPage > $scope.pages){
            console.log("【selectPage】:argPage number = "+ argPage +" is invalid.");
            return;
        }else{
            $scope.data.pageList = getPaperLst(argPage,$scope.newPages,$scope.pages);
            console.log("【selectPage】:pageList = " + $scope.data.pageList);
        }
        if(angular.isUndefined($scope.selPage)){
            console.log("【selectPage】:selPage is undefined.");
            return;
        }
        $scope.selPage = argPage;
        if(angular.isUndefined($scope.data.allUsrScoreLst) || $scope.data.allUsrScoreLst.length<0){
            console.log("【selectPage】:allUsrScoreLst("+$scope.data.allUsrScoreLst+")  is undefined or allUsrScoreLst.length("
                +$scope.data.allUsrScoreLst.length+") < 0.");
            return;
        }
        if(angular.isUndefined($scope.data.pageSize) || $scope.data.pageSize<=0){
            console.log("【selectPage】:pageSize("+$scope.data.pageSize+") is undefined.");
            return;
        }
        //求當前頁的条数
        var len = $scope.data.allUsrScoreLst.length;//当前成绩列表总条数
        var curPageCount = Math.ceil(len/$scope.data.pageSize);//当前allUsrScoreLst的总页数

        var pageContent = 0;//默认当前页的总条数为零
        if(argPage < curPageCount){
            pageContent = $scope.data.pageSize;
        }else if(argPage == curPageCount){
            pageContent = len - Math.floor(len/$scope.data.pageSize)*$scope.data.pageSize;
        }
        // console.log("【selectPage】:Math.ceil = " + Math.ceil($scope.data.usrScoreAllCount/$scope.data.pageSize));
        // console.log("【selectPage】:Math.floor = " + Math.floor($scope.data.usrScoreAllCount/$scope.data.pageSize));
        console.log("【selectPage】:pageContent = " + pageContent);
        setUsrScoreLst(argPage,pageContent);
        $scope.isActivePage(argPage);
    }

    /*
     * 保存录入的学生成绩
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreForm
     * api params:token,[{"cid":"","uid":"","update":{"平时成绩":0,"考试成绩":0}}]
     * author:zhongj
     * */
    function saveScore() {
        if(angular.isUndefined(postSaveData)){
            console.log("【saveEntryStuScore】：postSaveData is undefined.");
            return;
        }
        if(angular.isUndefined(postSaveData.saveUsrScoreLst) || postSaveData.saveUsrScoreLst.length < 0){
            console.log("【saveEntryStuScore】：postSaveData.saveUsrScoreLst is undefined or < 0.");
            return;
        }
        if(angular.isUndefined($scope.data.allUsrScoreLst) || $scope.data.allUsrScoreLst.length <= 0){
            console.log("【saveEntryStuScore】：allUsrScoreLst is undefined or <= 0.");
            return;
        }
        if(angular.isUndefined($scope.data.usrToken) || $scope.data.usrToken == null){
            console.log("【saveEntryStuScore】：usrToken is undefined or null.");
            return;
        }
        console.log("$scope.data.allUsrScoreLst.length = " + $scope.data.allUsrScoreLst.length);
        for(var i = 0;i<$scope.data.allUsrScoreLst.length;i++){
            if($scope.data.allUsrScoreLst[i].type == 1||$scope.data.allUsrScoreLst[i].type == 2){//已改动或正在发送
                $scope.data.allUsrScoreLst[i].type = 2;//标记数据是已发送状态
                var item = {};
                item.cid = $scope.data.allUsrScoreLst[i].cid;
                item.uid = $scope.data.allUsrScoreLst[i].uid;
                item.update = $scope.data.allUsrScoreLst[i].update;
                postSaveData.saveUsrScoreLst.push(item);
            }
        }
        if(postSaveData.saveUsrScoreLst.length<=0){
            console.log("【saveEntryStuScore】：postSaveData.saveUsrScoreLst len <= 0 .");
            return;
        }
        postSaveData.token = $scope.data.usrToken;
        console.log("postSaveData.saveUsrScoreLst :");
        console.log(postSaveData.saveUsrScoreLst);

        scoremanager.saveEtyStuScore({
            token:postSaveData.token
        },postSaveData.saveUsrScoreLst).then(function success(response) {
            if(response.code == 0){
                console.log("response:");
                console.log(response);
                if(angular.isUndefined(response.data.success) || response.data.success == null){
                    console.log("【saveEntryStuScore】：response.data.success is undefined or null.");
                    return;
                }
                if(angular.isUndefined(response.data) || response.data == null){
                    console.log("【saveEntryStuScore】：response.data is undefined or null.");
                    return;
                }
                for(var i=0;i<postSaveData.saveUsrScoreLst.length;i++){
                    for(var j=0;j<$scope.data.allUsrScoreLst.length;j++){
                        if(postSaveData.saveUsrScoreLst[i].uid == $scope.data.allUsrScoreLst[j].uid){
                            // console.log("uid:" + $scope.data.allUsrScoreLst[j].uid);
                            $scope.data.allUsrScoreLst[j].type = $scope.data.allUsrScoreLst[j].type == 2 ? 3:$scope.data.allUsrScoreLst[j].type;//保存成功设置type=3
                            // console.log("type:" +$scope.data.allUsrScoreLst[j].type);
                            break;
                        }
                    }
                }
                $scope.data.EntringStuCount = 0;//录入成绩已保存
                postSaveData.saveUsrScoreLst = [];//清空已保存的数据信息
                if(angular.isUndefined(response.data.failed) || response.data.failed == null){
                    console.log("【saveEntryStuScore】：response.failed is undefined or null.");
                    return;
                }
                if(response.data.failed > 0){
                    // 需要弹窗提示有用户更新失败
                    updateUsrScoreLst(response.data.errs);//将没有保存成功的成绩数据还原
                }
                if(!angular.isUndefined(response.data.uneditCount) && response.data.uneditCount >= 0){
                    $scope.data.noEntryStuCount = response.data.uneditCount;
                }
            }else {
                console.log("【saveEntryStuScore】：save entry score is failed : "+ response.code + " & reason is :" + response.dmsg);
                postSaveData.saveUsrScoreLst = [];//清空已保存的数据信息
            }
        },function error(response) {
            console.log("【saveEntryStuScore】：request server failed reason is : "+ response);
            postSaveData.saveUsrScoreLst = [];//清空已保存的数据信息
        })
    }

    /*
     * 提交已录入的学生成绩，公布学生总成绩
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCommitScoreForm
     * api params:token,cid(course id)
     * author:zhongj
     * */
    function submitScore() {
        if(angular.isUndefined($scope.data.noEntryStuCount) || $scope.data.noEntryStuCount<0){
            console.log("【submitEntryStuScore】：noEntryStuCount is undefined or < 0.");
            return;
        }
        //需弹窗提示用户还有未录入的学生，需要全部录入完了之后才能提交
        if($scope.data.noEntryStuCount>0){
            console.log("【submitEntryStuScore】：noEntryStuCount > 0.");
            return;
        }
        if(angular.isUndefined($scope.data.usrToken) || $scope.data.usrToken == null){
            console.log("【submitEntryStuScore】：noEntryStuCount is undefined or null.");
            return;
        }
        if(angular.isUndefined($scope.data.curCourseId) || $scope.data.curCourseId == null){
            console.log("【submitEntryStuScore】：noEntryStuCount is undefined or null.");
            return;
        }
        var params = {};
        params.token = $scope.data.usrToken;
        params.cid = $scope.data.curCourseId;

        scoremanager.submitEtyStuScore(params)
            .then(function success(response) {
            if(response.code == 0){
                if(angular.isUndefined(response.data) || response.data == null){
                    console.log("【submitEntryStuScore】：response.data is undefined or null.");
                    return;
                }
                //需弹窗提示用户提交成功
                console.log("【submitEntryStuScore】：submit score sucess.");
            }else {
                console.log("【saveEntryStuScore】：save entry score is failed : "+ response.code + " & reason is :" + response.dmsg);
            }
        },function error(response) {
            console.log("【saveEntryStuScore】：request server failed reason is : "+ response);
        });
    }
    //---------------------------------ng-function defined-------------------------------------------//
    var turnCourseDebounce = debounce(turnCourse,500,false);
    //选中某个课程后刷新学生成绩列表
    $scope.clickCourseTag = function (tag,index) {
        if($scope.data.curCourseId == tag._id){
            console.log("selected course id equals to request course id.");
            return;
        }
        turnCourseDebounce(tag._id,index);
    };

    //切换展开、收起【未测试】
    $scope.toggleMore = function (argCourseList) {
        $scope.data.showMore = !$scope.data.showMore;
        if(!$scope.data.showMore && $scope.data.curCourseIndex >= $scope.data.rowNum){
            var i = Math.floor($scope.data.curCourseIndex / $scope.data.rowNum);
            i = i * $scope.data.rowNum;
            var j = i + $scope.data.rowNum;
            j = j < argCourseList.length ? $scope.data.rowNum : argCourseList.length % $scope.data.rowNum;
            var arr = argCourseList.splice(i, j);
            Array.prototype.unshift.apply(argCourseList, arr);
            $scope.data.curCourseIndex = $scope.data.curCourseIndex % $scope.data.rowNum;
        }
    };

    var selectPageDebounce = debounce(updateContentForPage,500,false);
    //选中页数更新表单内容
    $scope.selectPage = function (page) {
        selectPageDebounce(page);
    };

    //设置当前选中页样式
    $scope.isActivePage = function (page) {
        if(angular.isUndefined($scope.selPage)){
            console.log("【Previous】:selPage is undefined.");
            return;
        }
        return $scope.selPage == page;
    };
    //上一页
    $scope.Previous = function () {
        if(angular.isUndefined($scope.selPage) || $scope.selPage <=0){
            console.log("【Previous】:selPage is undefined or  <=0.");
            return;
        }
        $scope.selectPage($scope.selPage - 1);
    };
    //下一页
    $scope.Next = function () {
        if(angular.isUndefined($scope.selPage) || $scope.selPage <=0){
            console.log("【Previous】:selPage is undefined or  <=0.");
            return;
        }
        $scope.selectPage($scope.selPage + 1);
    };

    //当平时成绩、考试成绩、备注发生变化时
    $scope.scoreChange = function (argRow,argUsrScore,argScoreTag) {
        // console.log("argRow = " + argRow);
        // console.log("argUsrScore = ");
        // console.log(argUsrScore);
        console.log(argUsrScore.msg[argScoreTag.status][argScoreTag.key]);
        if(angular.isUndefined($scope.data.allUsrScoreLst) || $scope.data.allUsrScoreLst.length < 0){
            console.log("【saveEntryStuScore】：allUsrScoreLst is undefined or < 0.");
            return;
        }
        if(angular.isUndefined(argUsrScore.msg[argScoreTag.status][argScoreTag.key])){
            setInvalid(argUsrScore,argScoreTag.key,true);//不符合
            return;
        }
        setInvalid(argUsrScore,argScoreTag.key,false);
        /*
         *处理以下两种情况:
         * 1、修改原来已录入的平时成绩或期末成绩，及其录入多次的情况
         * 2、已录入平时成绩，接着录入期末成绩或者是已录入期末成绩，接着录入平时成绩
         */
        for(var i = 0;i<$scope.data.allUsrScoreLst.length;i++){
            if($scope.data.allUsrScoreLst[i].uid == argUsrScore.uid){
                $scope.data.allUsrScoreLst[i].cid = $scope.data.curCourseId;
                $scope.data.allUsrScoreLst[i].type = 1;//已改动，type字段是新增，用来记录数据状态，type是undefined的时候表示未改动；1：已改动；2：已发送；3：已保存

                // console.log(argUsrScore.msg[argScoreTag.status]);
                $scope.data.allUsrScoreLst[i].update = {};
                $scope.data.allUsrScoreLst[i].update[argScoreTag.key] = argUsrScore.msg[argScoreTag.status][argScoreTag.key];
                // console.log($scope.data.allUsrScoreLst[i].update);

                $scope.data.allUsrScoreLst[i].page = $scope.selPage;
                $scope.data.allUsrScoreLst[i].rowNum = argRow;
                console.log("$scope.data.allUsrScoreLst["+i+"] = ");
                console.log($scope.data.allUsrScoreLst[i]);
                startTimer = true;
                break;
            }
        }
        var count = 0;
        for(var i = 0;i<$scope.data.allUsrScoreLst.length;i++){
            if($scope.data.allUsrScoreLst[i].type == 1 || $scope.data.allUsrScoreLst[i].type == 2){//已改动或已发送
                count++;
            }
        }
        $scope.data.EntringStuCount = count;
        console.log(" $scope.data.EntringStuCount = " +  $scope.data.EntringStuCount);
    };

    var saveScoreDebounce = debounce(saveScore,500,false);
    /*
     * 保存录入的学生成绩
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreForm
     * api params:token,[{"cid":"","uid":"","update":{"平时成绩":0,"考试成绩":0}}]
     * author:zhongj
     * */
    $scope.saveEntryStuScore = function () {
        saveScoreDebounce();
    };

    var submitScoreDebounce = debounce(submitScore,500,false);

    //提交成绩
    $scope.submitEntryStuScore = function () {
        submitScoreDebounce();
    };

    //第一次请求usertoken
    $scope.data.usrToken = rcpAid.getToken();
    requestData.token = $scope.data.usrToken;
    reqScorelist(requestData,"CT");//请求成绩列表

    //页面销毁时，销毁定时器
    $scope.$on('$destroy',function () {
        $interval.cancel(atuoSaveTimer);
    });

}]);