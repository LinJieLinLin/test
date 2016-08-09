/**
 * Created by Zhongj on 2016/6/4.
 * 模块说明：成绩管理
 */
module.controller("scoreManagerCtrl", ['$scope', '$http', '$interval', 'service', 'debounce', 'dialog', 'course','$filter','$window','$routeParams'
  , function ($scope, $http, $interval, service, debounce,dialog, course,$filter,$window,$routeParams) {
    //---------------------------------variable defined-------------------------------------------//
    $scope.data = {};
    $scope.data.usrToken = rcpAid.getToken();//获取用户token
    $scope.data.curCourseId = $routeParams.cid;//选中的课程id

    // $scope.data.course = [];//课程列表内容
    // $scope.data.rowNum = 4;//默认筛选列表每行显示4个
    // $scope.data.showMore = false;//默认筛选列表不显示“更多”
    // $scope.data.curCourseIndex = 0;//当前选中课程的位置，默认是选中筛选列表的第一个课程

    var postSaveData = {};//定义保存数据时的请求数据
    postSaveData.saveUsrScoreLst = [];//定义保存数据时需要更新成绩 的学生数据
    var postSubmitData = [];//定义保存数据时的请求数据

    var requestData = {};//定义请求后台接口数据,有5个参数：cid：课程id；page：页数；pageCount：每页个数；query：搜索条件（都是可选的）

    $scope.data.scoreTags = [];// 成绩列表表头
    $scope.data.usrScoreLst = [];//所有学生的成绩列表
    // $scope.data.courseIsload = true;//标记课程筛选列表页面数据加载状态，默认加载
    $scope.data.curPage = 1;//默认当前页是第一页

    $scope.data.isEmtry = false;//判断课程列表和成绩列表是否为空，默认不为空
    var reqType;//记录scrPageFn每一次的请求类型

    //统计
    $scope.data.joinCurStuCount = 0;//参与课程的学生总数
    $scope.data.noEntryStuCount = 0;//未录入成绩的学生总数
    $scope.data.EntringStuCount = 0;//已改动或已发送的学生成绩总数

    //定时器
    var atuoSaveTimer;//自动保存，每隔10s保存一次的定时器
    $scope.data.isAutoSaving = false;//默认值，自动保存不开启
    $scope.data.isAutoSaved = 0;//0：未开始；1；保存成功；2：保存失败
    $scope.data.saveTime = null;//保存成功时间

    //选择器
    $scope.data.selected = false;//默认未全选
    var isSelectAll = false;//记录全选状态：true为选中全部，false未未选中全部
    var hasSelect = false;//默认未选
    //保存方式
    var saveType = 1;//默认自动保存,0表示手动点击保存

    //确认提示框
    $scope.confirm = {};
    $scope.confirm.show = false;//是否显示提示框
    $scope.confirm.isConfirm = false;//是否确定
    $scope.confirm.confirmTitle;
    $scope.confirm.cfmBtnName;//确定重命名
    $scope.confirm.cancelBtnName;//取消重命名
    $scope.confirm.isShow = true;//默认显示确定按钮
    var hasNoEntry = false;//默认没有未录入学生成绩数
    $scope.confirm.errs = [];//存储保存成绩时的错误信息，用于提示

    //设置成绩表格的表头和内容
    $scope.data.isSetScrShow = false;//默认不显示设置成绩
    $scope.data.loadingScrSur = false;//默认没有获得课程下的考试或试卷
    $scope.data.weightCount = 0;//设置成绩的权重总计，初始化为0
    $scope.data.gradeWeight = 0;//平时成绩权重
    $scope.data.gradeTotal = 100;//平时成绩总分，默认百分制
    $scope.data.examTotal = 100;//考试成绩总分，默认百分制
    $scope.data.examWeight = 0;//考试成绩权重
    $scope.data.isScrSurSelect = false;//默认成绩来源未修改

    //导出成绩url
    $scope.data.exportUrl = "";
    
    //输入关键词检索
    $scope.data.searchKey = {};
    $scope.data.searchKey.isEdit = false;//是否修改过
    $scope.data.searchKey.value = "";

    //清空成绩
    var isClearScore = false;

    //存储平时成绩、考试成绩指定试卷名称和备注原因的内容
    $scope.data.tipName = "";


    //提示http请求后端返回的错误信息
    var errLog = {
      moduleName: '成绩管理',//模块名称
      funcName:'', //函数名称
      text: ''//提示语，可选
    };

    if (angular.isUndefined($http)) {
      console.log("$http is undefined.");
      return;
    }

    //---------------------------------function defined-------------------------------------------//

    /*
     * 开始获取成绩管理列表课程筛选数据、学生数据
     * author:zhongj
     * */
    function init() {
      console.log("【成绩管理】：init.");
      if($scope.data.curCourseId == "" || $scope.data.curCourseId == null){
        console.log("【init】：cid is null.");
        $scope.data.isEmtry = true;
        return;
      }
      console.log("【成绩管理】：cid = ",$scope.data.curCourseId);
      requestData.token = $scope.data.usrToken;
      $scope.pageargs = {//请求分页的参数集(pn\ps\pl是固定参数，必选)
        pn: 1,//请求页，默认从第一页开始
        ps: 15,//每页的容量
        pl: 5,//底部分页页码默认呈现5个
        reqType: "CT"//是请求类型，CT是课程，PN是分页，SC是搜索
      };
    }
    /*
     * 清空上一个课程遗留的历史数据
     * author:zhongj
     * */
    function clearPreCourse() {
      $scope.data.scoreTags = [];// 成绩列表表头
      $scope.data.usrScoreLst = [];
      requestData.page = 1;//请求页数清为初始值
      $scope.data.curPage = 1;//当前页返回初始值
      requestData.query = "";//清除上一个课程的查询条件
      $scope.data.searchKey.isEdit = false;//清空搜索的修改记录
      $scope.data.searchKey.value = "";//清空搜索记录
      //统计
      $scope.data.joinCurStuCount = 0;//参与课程的学生总数
      $scope.data.noEntryStuCount = 0;//未录入成绩的学生总数
      $scope.data.EntringStuCount = 0;//正在录入但未保存成绩的学生总数

      //取消定时器
      $interval.cancel(atuoSaveTimer);
      $scope.data.isAutoSaving = false;
      $scope.data.isAutoSaved = 0;

      //清空设置成绩参数
      $scope.data.isSetScrShow = false;//默认不显示设置成绩
      $scope.data.loadingScrSur = false;//默认没有获得课程下的考试或试卷
      $scope.data.isScrSurSelect = false;//默认成绩来源未修改
    }

    /*
     * 从服务器获取的课程列表根据样式呈现需求进行重组
     * param: data,response data which come from ListScore,it's course tags
     * author:zhongj
     * */
    function formCourseTags(argData) {
      console.log("【formCourseTags】:argData = ",argData);
      if (angular.isUndefined(argData) || argData == null) {
        console.log("【formCourseTags】:argData is undefined or null.");
        return;
      }
      //将成绩列表表头类型加入scoreTags数组参数里
      angular.forEach(argData, function (obj, tagType) {
        angular.forEach(obj, function (val, key) {
          val.status = tagType;
          if(val.status == 'score' && val.key != '总成绩'){
            val.evalLst = [{name:"无"}];
            if(val.key == 'grade'){//平时成绩
              $scope.data.gradeWeight = val.weight;
              $scope.data.gradeTotal = val.totalScore;//平时成绩选中试卷或考试的总分
            }
            if(val.key == 'exam'){//考试成绩
              $scope.data.examWeight = val.weight;
              $scope.data.examTotal = val.totalScore;//考试成绩选中试卷或考试的总分
            }
            val.weightInvalid = false;
            val.showOptions = false;//默认收起下拉列表
          }
        });
      });
      console.log("【formCourseTags】：$scope.data.gradeTotal = ",$scope.data.gradeTotal);
      console.log("【formCourseTags】：$scope.data.examTotal = ",$scope.data.examTotal);
      //组建成绩管理表格的表头
      angular.forEach(argData, function (obj, key) {
        angular.forEach(obj, function (val, key) {
          $scope.data.scoreTags.push(val);
        });
      });
      if($scope.data.scoreTags.length > 0){
        var checkItem = {
          status:"checkbox"
        };
        $scope.data.scoreTags.unshift(checkItem);
      }
      $scope.data.weightCount = $scope.data.gradeWeight + $scope.data.examWeight;
      console.log("$scope.data.scoreTags = ",$scope.data.scoreTags);
    }

    //只有当存在未保存的学生成绩时才会向服务器发送，但会定格10s检测是否存在未保存的数据
    function startAutoSave() {
      if (angular.isUndefined($interval) || $interval == null) {
        console.log("【startAutoSave】:$timeout is undefined or null.");
        return;
      }
      atuoSaveTimer = $interval(function () {
        if (!angular.isUndefined($scope.data.EntringStuCount) && $scope.data.EntringStuCount > 0) {
          // console.log("【startAutoSave】:saveEntryStuScore.");
          $scope.data.isAutoSaving = true;
          $scope.data.isAutoSaved = 0;
          // console.log("【startAutoSave】:$scope.data.isAutoSaving =",$scope.data.isAutoSaving);
          $scope.saveEntryStuScore(1);
        }
        // console.log("【startAutoSave】:start.");
      }, 10000);
    }

    /*
    * param:argData是userScoreLst的msg对象
    * 作用:判断成绩是否已录完
    * */
    function isRecord(argData) {
      if(angular.isUndefined(argData) || argData == null){
        console.log("【isRecord】：argData is invalid,value = ",argData);
        return;
      }
      var gradeRecord = false;
      var examRecord = false;

      for(var key in argData.score){
        // console.log("【isRecord】：argData.score[key] = ",argData.score[key]);
        if(key == "grade" && argData.score[key] && argData.score[key]>=0){
          // console.log("【isRecord】：argData.score[key] = ",argData.score[key]);
          gradeRecord = true;

        }
        if(key == "exam" && argData.score[key] && argData.score[key]>=0){
          examRecord = true;
        }
      }
      var hasRecord = gradeRecord && examRecord ?true:false;
      for(var sKey in argData.scoreExt){
        if(sKey == "备注" && argData.scoreExt[sKey]!=""){
          hasRecord = true;
        }
      }
      // console.log("【isRecord】：hasRecord = ",hasRecord);
      return hasRecord;
    }

    /*
     * 获取成绩列表的学生数据
     * param: data：response data which come from ListScore，it's response（json对象）【必选参数】
     * param:type：请求类型，CT表示点击课程请求；PN表示分页请求，【必选参数】
     * author:zhongj
     * */
    function getScoreList(argData, argType) {
      if (angular.isUndefined(argData) || argData == null) {
        console.log("【getScoreList】:argData is undefined or null.",argData);
        return;
      }
      if (angular.isUndefined(argType) || argType == null) {
        console.log("【getScoreList】:argType is undefined or null.",argType);
        return;
      }
      if(angular.isUndefined(argData.form) || argData.form.length < 0){
        console.log("【getScoreList】:argData.form is undefined or length < 0.",argData.form);
        return;
      }
      console.log("【old】：$scope.data.usrScoreLst = ",$scope.data.usrScoreLst);
      if (argType == "CT") {
        startAutoSave();//启动每隔10s自动保存机制
      }

      $scope.data.usrScoreLst = argData.form;
      for (var i=0;i<argData.form.length;i++){
        // console.log("【getScoreList】：第 "+i+" 位");
        $scope.data.usrScoreLst[i]['checkbox'] = false;//默认未选
        if(!angular.isUndefined($scope.data.usrScoreLst[i].msg.score['grade'])){
          $scope.data.usrScoreLst[i].msg.score['grade'] = $filter('number')($scope.data.usrScoreLst[i].msg.score['grade'],1);
        }
        if(!angular.isUndefined($scope.data.usrScoreLst[i].msg.score['exam'])){
          $scope.data.usrScoreLst[i].msg.score['exam'] = $filter('number')($scope.data.usrScoreLst[i].msg.score['exam'],1);
        }
        $scope.data.usrScoreLst[i].hasRecord = isRecord(argData.form[i].msg);
      }
      console.log("【new】：$scope.data.usrScoreLst = ",$scope.data.usrScoreLst);
    }

    /*
     * 记录未保存成功的成绩数据
     * param: argUpdErrScore，返回的更新失败的成绩数据，格式是数组
     * author:zhongj
     * */
    function updateUsrScoreLstForErr(argUpdErrScore) {
      if (angular.isUndefined(argUpdErrScore) || argUpdErrScore == null) {
        console.log("【updateUsrScoreLstForErr】：argUpdErrScore is undefined or less than 0.");
        return;
      }
      if (angular.isUndefined($scope.data.usrScoreLst) || $scope.data.usrScoreLst.length <= 0) {
        console.log("【updateUsrScoreLstForErr】：usrScoreLst is undefined or less than 0.");
        return;
      }
      var updErrUsrScrLst = new Array();
      for (var i = 0; i < argUpdErrScore.length; i++) {
        for (var j = 0; j < $scope.data.usrScoreLst.length; j++) {
          if (argUpdErrScore[i].uid == $scope.data.usrScoreLst[j].uid) {
            $scope.data.usrScoreLst[j]["type"] = 1;//该数据已改动未保存成功
            updErrUsrScrLst[i] = {};
            updErrUsrScrLst[i].row = j+1;//第几行
            updErrUsrScrLst[i].page = $scope.data.curPage;//记录第几页
            updErrUsrScrLst[i].errMsg = argUpdErrScore[i].err;
            break;
          }
        }
      }
      if($scope.data.isAutoSaved != 2){//不是自动保存失败才提示用户保存失败信息
        $scope.confirm.show = true;
        $scope.confirm.errs = updErrUsrScrLst;
        $scope.confirm.cancelBtnName = "知道了";
        $scope.confirm.isShow = false;//隐藏确定按钮
      }
      $scope.data.EntringStuCount = argUpdErrScore.length;//已录入成绩未保存成功个数
    }

    //记录平时成绩或考试成绩等可编辑字段的数据格式是否符合要求
    function setInvalid(argUsrScore, argKey, argInValid) {
      if (angular.isUndefined(argUsrScore) || argUsrScore == null) {
        console.log("【setInvalid】：argUsrScore is undefined or null.");
        return;
      }
      if (angular.isUndefined(argKey) || argKey == null) {
        console.log("【setInvalid】：argKey is undefined or null.");
        return;
      }
      if (angular.isUndefined(argUsrScore.inScrValid)) {
        argUsrScore.inScrValid = {};
      }
      argUsrScore.inScrValid[argKey] = argInValid;
      console.log("【setInvalid】：argKey = ",argKey);
      console.log("【setInvalid】：argUsrScore.inScrValid[argKey] = ",argUsrScore.inScrValid[argKey]);
    }

    /*
     * 切换课程
     * param: argCourseID，切换后的课程id，argIndex：筛选列表里面的第几位
     * author:zhongj
     * */
    // function turnCourse(argCourseId, argIndex) {
    //   if (angular.isUndefined(argCourseId)) {
    //     service.dialog.alert("【turnCourse】：argCourse id is undefined，value = "+ argCourseId);
    //     return;
    //   }
    //   if (angular.isUndefined(argIndex) || argIndex < 0) {
    //     service.dialog.alert("【turnCourse】：argIndex is undefined or <0，value = " + argIndex);
    //     return;
    //   }
    //   if (angular.isUndefined($scope.data.curCourseIndex)) {
    //     console.log("curCourseIndex is undefined.");
    //     return;
    //   }
    //   if (angular.isUndefined(requestData)) {
    //     console.log("requestData is undefined.");
    //     return;
    //   }
    //   $scope.data.curCourseIndex = argIndex;
    //   console.log("【turnCourse】：curCourseIndex = " ,argIndex);
    //   $scope.data.curCourseId = argCourseId;//设置当前选中的课程id
    //   $scope.pageargs = {//请求分页的参数集(pn\ps\pl是固定参数，必选)
    //     pn: 1,//请求页，默认从第一页开始
    //     ps: 15,//每页的容量
    //     pl: 5,//底部分页页码默认呈现5个
    //     reqType: "CT"//是请求类型
    //   };
    //   clearPreCourse();//清空上一个课程遗留的数据
    //   // $scope.scrPageFn($scope.pageargs);
    // }

    //比较保存接口返回的score里的update和usrScoreLst里面的update是否相等，同时更新证书发放
    function compareUpdScr(argScore,argUsrScrLst) {
      if(angular.isUndefined(argScore)){
        console.log("【compareUpdScr】：argScore is undefined");
        return;
      }
      if(angular.isUndefined(argUsrScrLst)){
        console.log("【compareUpdScr】：argUsrScrLst is undefined");
        return;
      }
      var bol = false;
      for(var pKey in argScore){
        for(var uKey in argUsrScrLst){
          if(pKey == uKey && argScore[pKey] != argUsrScrLst[uKey]){
            console.log("【compareUpdScr】：pKey = ",pKey);
            console.log("【compareUpdScr】：argScore[pKey] = ",argScore[pKey]);
            bol = true;//匹配平时成绩、考试成绩是否保存后发生变化
            break;
          }
        }
      }
      return bol;
    }
    /*
    * param:argData保存接口返回的response.data,其中里面的score和unedit是需要用到的
    * 作用：匹配返回的平时成绩、考试成绩和备注是否是最新数据，以及更新总成绩、证书是否发放和未录入学生总数
    * */
    function updateUsrScoreLst(argData) {
      if($scope.data.usrScoreLst == null || $scope.data.usrScoreLst.length <=0){
        console.log("【updateUsrScoreLst】：$scope.data.usrScoreLst is null or len <=0,value = ",$scope.data.usrScoreLst);
        return;
      }
      if(angular.isUndefined(argData.score) || argData.score == null || argData.score.length <=0){
        console.log("【updateUsrScoreLst】：response.data.score is undefined or null or len <=0,value = ",argData.score);
        return;
      }
      if(angular.isUndefined(argData.uneditCount) || !argData.uneditCount){
        console.log("【updateUsrScoreLst】：response.data.uneditCount is undefined or null,value = ",argData.uneditCount);
        return;
      }
      if($scope.data.curCourseId == ""){
        console.log("【updateUsrScoreLst】：$scope.data.curCourseId is null,value = ",$scope.data.curCourseId);
        return;
      }
      if(!angular.isUndefined(argData.uneditCount[$scope.data.curCourseId])){
        $scope.data.noEntryStuCount = argData.uneditCount[$scope.data.curCourseId];//更新未录入学生数
        console.log("【updateUsrScoreLst】：$scope.data.noEntryStuCount =",$scope.data.noEntryStuCount);
      }
      for (var i = 0; i < argData.score.length; i++) {
        for (var j = 0; j < $scope.data.usrScoreLst.length; j++) {
          if (argData.score[i].uid == $scope.data.usrScoreLst[j].uid) {
            $scope.data.usrScoreLst[j].msg.score["总成绩"] = argData.score[i]["总成绩"];
            $scope.data.usrScoreLst[j].msg.scoreExt["证书发放"] = argData.score[i]["证书发放"];
            $scope.data.usrScoreLst[j].msg.scoreExt["原因"] = argData.score[i]["原因"];
            console.log("【updateUsrScoreLst】：argData.score[i].update = ",argData.score[i].update);
            var updBol =false;
            var unsetBol = false;
            if(argData.score[i].update){
              updBol = compareUpdScr(argData.score[i].update,$scope.data.usrScoreLst[j].update);
            }
            if(argData.score[i].unset){
              unsetBol = compareUpdScr(argData.score[i].unset,$scope.data.usrScoreLst[j].unset);
            }
            $scope.data.usrScoreLst[j].type = (updBol || unsetBol)?1:3;//1:已改动,3:已保存//保存成功设置type=3//本地存储会用到
            break;
          }
        }
      }
      console.log("【updateUsrScoreLst】：$scope.data.usrScoreLst =",$scope.data.usrScoreLst);
    }

    //判断平时成绩或考试成绩数据内容格式是否存在不合法的情况
    function extGraExmInv() {
      for(var i=0;i<$scope.data.usrScoreLst.length;i++){
        if(!angular.isUndefined($scope.data.usrScoreLst[i].inScrValid) && ($scope.data.usrScoreLst[i].inScrValid['grade'] || $scope.data.usrScoreLst[i].inScrValid['exam'])){
          return true;
        }
      }
      return false;
    }

    /*
     * 保存录入的学生成绩
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreForm
     * api params:token,[{"cid":"","uid":"","update":{"平时成绩":0,"考试成绩":0}}]
     * author:zhongj
     * */
    function saveScore() {
      if (angular.isUndefined(postSaveData)) {
        console.log("【saveScore】：postSaveData is undefined.");
        return;
      }
      if (angular.isUndefined(postSaveData.saveUsrScoreLst) || postSaveData.saveUsrScoreLst.length < 0) {
        console.log("【saveScore】：postSaveData.saveUsrScoreLst is undefined or < 0.");
        return;
      }
      if ($scope.data.usrScoreLst.length <= 0) {
        console.log("【saveScore】：usrScoreLst <= 0.");
        return;
      }
      if (angular.isUndefined($scope.data.usrToken) || $scope.data.usrToken == null) {
        console.log("【saveScore】：usrToken is undefined or null.");
        return;
      }
      var hasRecNum = false;//记录是否存在已录完的情况，默认不存在
      for(var i=0;i<$scope.data.usrScoreLst.length;i++){
        if($scope.data.usrScoreLst[i].hasRecord){
          hasRecNum=true;//存在已录完的情况
          break;
        }
      }
      if(saveType == 0 && !hasRecNum){
        service.dialog.alert("请先录入成绩再保存");
        return;
      }
      var bol = extGraExmInv();//判断平时成绩或考试成绩数据内容格式是否存在不合法的情况
      if(saveType == 0 && bol){
        service.dialog.alert("保存的成绩里存在不合法的数据格式，请重新输入后再保存");
        return;
      }
      // console.log("$scope.data.usrScoreLst.length = " + $scope.data.usrScoreLst.length);
      for (var i = 0; i < $scope.data.usrScoreLst.length; i++) {
        if ($scope.data.usrScoreLst[i].type == 1 || $scope.data.usrScoreLst[i].type == 2) {//已改动或正在发送
          $scope.data.usrScoreLst[i].type = 2;//标记数据是已发送状态
          var item = {};
          item.cid = $scope.data.usrScoreLst[i].cid;
          item.uid = $scope.data.usrScoreLst[i].uid;
          item.update = $scope.data.usrScoreLst[i].update;
          item.unset = $scope.data.usrScoreLst[i].unset;
          postSaveData.saveUsrScoreLst.push(item);
        }
      }
      if (saveType == 0 && postSaveData.saveUsrScoreLst.length <= 0) {
        console.log("【saveScore】：postSaveData.saveUsrScoreLst len <= 0 .");
        service.dialog.alert("成绩已保存");
        return;
      }
      postSaveData.token = $scope.data.usrToken;
      console.log("【saveScore】：postSaveData.saveUsrScoreLst =",postSaveData.saveUsrScoreLst);
      course.saveEtyStuScore({
        token: postSaveData.token
      }, postSaveData.saveUsrScoreLst).then(function success(response) {//success方法里面返回的是response.data.code=0的结果
        console.log("【saveScore】：response = ",response);
        if($scope.data.isAutoSaving){
          $scope.data.saveTime = new Date();
        }
        $scope.data.isAutoSaving = false;
        if (angular.isUndefined(response.data) || response.data == null) {
          service.dialog.alert("【saveScore】：response.data is undefined or null，value = "+ response.data);
          return;
        }
        if (angular.isUndefined(response.data.success) || response.data.success == null) {
          service.dialog.alert("【saveScore】：response.data.success is undefined or null，value="+ response.data.success);
          return;
        }
        if (angular.isUndefined(response.data.failed) || response.data.failed == null) {
          service.dialog.alert("【saveScore】：response.failed is undefined or null，value="+ response.data.failed);
          return;
        }
        //匹配返回的平时成绩、考试成绩和备注是否是最新数据，以及更新总成绩、证书是否发放和未录入学生总数
        updateUsrScoreLst(response.data);

        if (response.data.failed > 0) {
          $scope.data.isAutoSaved = saveType == 0?0:2;
          // 需要弹窗提示有用户更新失败
          updateUsrScoreLstForErr(response.data.errs);//将没有保存成功的成绩数据还原
        }else {
          $scope.data.isAutoSaved = saveType == 0?0:1;
        }
        if(saveType == 0 && response.data.failed == 0){
          if($scope.data.noEntryStuCount == 0){
            saveType = 1;
            service.dialog.alert("保存成绩成功");
          }else {
            saveType = 1;
            $scope.confirm.show = true;
            $scope.confirm.info = "保存成功，还有" + $scope.data.noEntryStuCount +"名学生没有录入成绩";
            hasNoEntry = true;
            $scope.confirm.cfmBtnName = "知道了";
            $scope.confirm.cancelBtnName = "继续录入";
          }
        }
      }, function error(response) {
        if(saveType == 0){
          saveType = 1;
          errLog.funcName = 'saveScore';
          service.dialog.showErrorTip(response, errLog);
        }
        console.log("【saveScore】:保存成绩失败：" + response);
      }).finally(function () {
        var count = 0;
        for(var i = 0;i<$scope.data.usrScoreLst.length;i++){
          if($scope.data.usrScoreLst[i].type == 1 || $scope.data.usrScoreLst[i].type == 2){
            count++;
          }
        }
        $scope.data.EntringStuCount = count;//录入成绩已保存
        postSaveData.saveUsrScoreLst = [];//清空post给服务器的参数
      });
    }

    /*
     * 提交已录入的学生成绩，公布学生总成绩
     * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCommitScoreForm
     * api params:token,cid(course id)
     * author:zhongj
     * */
    function submitScore() {
      if (angular.isUndefined($scope.data.usrToken) || $scope.data.usrToken == null) {
        console.log("【submitScore】：data.usrToken is undefined or null,value = ",$scope.data.usrToken);
        return;
      }
      if ($scope.data.curCourseId == "") {
        console.log("【submitScore】：$scope.data.curCourseId is null,value = ",$scope.data.curCourseId);
        return;
      }
      if ($scope.data.usrScoreLst.length <= 0) {
        console.log("【submitScore】：data.usrScoreLst len <=0,value = ",$scope.data.usrScoreLst);
        return;
      }
      var params = {};
      params.token = $scope.data.usrToken;
      params.cid = $scope.data.curCourseId;
      for(var i=0;i<$scope.data.usrScoreLst.length;i++){
        if($scope.data.usrScoreLst[i].checkbox){
          if(params.tuids == null){
            params.tuids = $scope.data.usrScoreLst[i].uid;
          }else {
            params.tuids = params.tuids + ","+$scope.data.usrScoreLst[i].uid;
          }
        }
      }
      if(angular.isUndefined(params.tuids) || params.tuids == null){
        params.commitTotal = 1;//提交该课程下的所有学生成绩
      }
      console.log("【submitScore】：params = ",params);
      course.submitEtyStuScore(params)
        .then(function success(response) {
          if (angular.isUndefined(response.data) || response.data == null) {
            service.dialog.alert("【submitScore】：response.data is undefined or null,value = "+ response.data);
            return;
          }
          console.log("【submitScore】：response.data =",response.data);
          service.dialog.alert("提交成绩成功");
          if(angular.isUndefined(response.data.tuids) || response.data.tuids == null ||　response.data.tuids.length<0){
            return;
          }
          if($scope.data.selected){//清除全选的checkbox状态
            $scope.data.selected = false;
          }
          for(var i=0;i<response.data.tuids.length;i++){
            for(var j=0;j<$scope.data.usrScoreLst.length;j++){
              if(response.data.tuids[i] == $scope.data.usrScoreLst[j].uid){
                $scope.data.usrScoreLst[j].checkbox = false;
                break;
              }
            }
          }
        }, function error(response) {
          errLog.funcName = 'submitScore';
          service.dialog.showErrorTip(response, errLog);
          console.log("【submitScore】：request server failed reason is : " , response);
        });
    }

    //清空提示框信息
    function cleanConfirm() {
      $scope.confirm.cfmBtnName = "";
      $scope.confirm.cancelBtnName = "";
      $scope.confirm.info = "";
      hasNoEntry = false;
      $scope.data.isScrSurSelect = false;//关闭设置成绩的提示
      $scope.confirm.confirmTitle = "";//清空标题
      judGraExm(1);//当平时成绩或考试成绩的权重比例不对时，还原权重数据
    }

    //设置总成绩到scoreTags的evalst里面
    function findTotalScore(argId,argInfo){
      if(argId == null){
        console.log("【setTotalScore】：argId is null.");
        return;
      }
      if(argInfo == null){
        console.log("【setTotalScore】：argInfo is null.");
        return;
      }
      var tScore = 0;
      for(var key in argInfo){
        if(argId == key){
          tScore = argInfo[key].total;
          break;
        }
      }
      return tScore;
    }

    /*
    * 描述：组建课程下所有评测信息
    * param:argData:课程下的所有评测，是数组;argPaperInfo是试卷信息，argTestInfo考试信息
    * */
    function formCurEval(argData,argPaperInfo,argTestInfo) {
      if(argData == null){
        console.log("【formCurEval】：argData is null.");
        return;
      }
      var evaluationLst = [{name:"无"}];//默认课程下的所有试卷、考试为空,数据格式：[{paperId,testId,type,name}]
      for(var i=0;i<argData.length;i++){
        for(var j=0;j<argData[i].items.length;j++){
          if(argData[i].items[j].t == "e_es"){
            var item = {};
            item.type = argData[i].items[j].c.type;
            item.name = argData[i].items[j].c.title || "(空名字的试卷)";
            item.paperId = argData[i].items[j].c.aid;
            if(item.type == "e_paper"){
              item.totalScore = findTotalScore(item.paperId,argPaperInfo);
            }
            if(item.type == "e_test"){
              item.testId = argData[i].items[j].c.tid;
              item.totalScore = findTotalScore(item.testId,argTestInfo);//暂未启用
            }
            evaluationLst.push(item);
          }
        }
      }
      for(var i=0;i<$scope.data.scoreTags.length;i++){
        if($scope.data.scoreTags[i].status == 'score' && $scope.data.scoreTags[i].key != '总成绩'){
          $scope.data.scoreTags[i].evalLst = evaluationLst;
          $scope.data.scoreTags[i].setOptionsValue($scope.data.scoreTags[i].evalLst);
          if(angular.isUndefined($scope.data.scoreTags[i].name) || $scope.data.scoreTags[i].name == "无" || $scope.data.scoreTags[i].name == ""){
            $scope.data.scoreTags[i].specPaper = evaluationLst[0].name;
            $scope.data.scoreTags[i].curSelectIndex = 0;
            $scope.data.scoreTags[i].selectSpecPaper = evaluationLst[0];
          }
          // console.log("$scope.data.scoreTags[i].type = ",$scope.data.scoreTags[i].type);
          // console.log("$scope.data.scoreTags[i].val = ",JSON.parse($scope.data.scoreTags[i].val));
          for(var j=0;j<evaluationLst.length;j++){
            // console.log("evaluationLst[j].paperId = ",evaluationLst[j].paperId);
            if($scope.data.scoreTags[i].type == "aid" && evaluationLst[j].paperId == $scope.data.scoreTags[i].val){
              $scope.data.scoreTags[i].curSelectIndex = j;
              $scope.data.scoreTags[i].selectSpecPaper = evaluationLst[j];
              $scope.data.scoreTags[i].specPaper = evaluationLst[j].name;
              $scope.data.scoreTags[i].totalScore = evaluationLst[j].totalScore;
              break;
            }
            // console.log("evaluationLst[j].testId = ",evaluationLst[j].testId);
            // console.log("$scope.data.scoreTags[i].val[evaluationLst[j].testId] = ",$scope.data.scoreTags[i].val[evaluationLst[j].testId]);
            // console.log("JSON.parse($scope.data.scoreTags[i].val).hasOwnProperty(evaluationLst[j].testId) = ",JSON.parse($scope.data.scoreTags[i].val).hasOwnProperty(evaluationLst[j].testId));
            if($scope.data.scoreTags[i].type == "tid" && JSON.parse($scope.data.scoreTags[i].val).hasOwnProperty(evaluationLst[j].testId)){//暂未启用
              $scope.data.scoreTags[i].curSelectIndex = j;
              $scope.data.scoreTags[i].selectSpecPaper = evaluationLst[j];
              $scope.data.scoreTags[i].specPaper = evaluationLst[j].name;
              $scope.data.scoreTags[i].totalScore = evaluationLst[j].totalScore;
              break;
            }
          }
          console.log("【formCurEval】：$scope.data.scoreTags[i] = ",$scope.data.scoreTags[i]);
        }
      }
      console.log("【formCurEval】：$scope.data.scoreTags = ",$scope.data.scoreTags);
    }

    //获取课程下试卷、考试信息
    function getCurScrSourse() {
      if($scope.data.curCourseId == ""){
        console.log("【getCurScrSourse】：$scope.data.curCourseId is null , value = ",$scope.data.curCourseId);
        return;
      }
      var params={};
      params.token = $scope.data.usrToken;
      params.cids = $scope.data.curCourseId;
      params.ret_ainfo=1;//要求返回试卷详细信息
      params.ret_tinfo=1;//要求返回考试详细信息
      console.log("【getCurScrSourse】：params = ",params);
      course.lstCourseEvaluation(params,'offRun')
        .then(function success(response) {
          console.log("【getCurScrSourse】：response.data = ",response.data);
          if(angular.isUndefined(response.data.iteml) || response.data.iteml == null ){
            service.dialog.alert("【getCurScrSourse】：listRef接口没有返回课程下正确的评测数据内容，response.data.iteml = " + response.data.iteml);
            // console.log("【getCurScrSourse】：response.data.iteml = ",response.data.iteml);
            return;
          }
          console.log("【getCurScrSourse】：response.data.iteml[params.cids] = ",response.data.iteml[params.cids]);
          if(angular.isUndefined(response.data.iteml[params.cids]) || response.data.iteml[params.cids] == null ){
            service.dialog.alert("【getCurScrSourse】：listRef接口没有返回请求课程ID =（ "+params.cids+" ）的评测数据内容。");
            return;
          }
          if(angular.isUndefined(response.data.ainfo)){
            service.dialog.alert("【getCurScrSourse】：listRef接口没有返回ainfo字段。");
            return;
          }
          if(angular.isUndefined(response.data.tinfo)){
            service.dialog.alert("【getCurScrSourse】：listRef接口没有返回tinfo字段。");
            return;
          }
          if(response.data.iteml[params.cids].length >= 0){
            formCurEval(response.data.iteml[params.cids],response.data.ainfo,response.data.tinfo);//组合params.cids课程下的评测（考试、练习、试卷）信息,ainfo是试卷信息，tinfo是考试信息
          }
        },function error(response) {
          errLog.funcName = 'getCurScrSourse';
          errLog.text = '获取试卷/考试列表失败';
          service.dialog.showErrorTip(response, errLog);
          console.log("【getCurScrSourse】：request server failed reason is : " , response);
        }).finally(function () {
        $scope.data.loadingScrSur = false;
      });
    }

    //保存设置的成绩来源和权重
    function saveCurScrSourse() {
      if($scope.data.curCourseId == ""){
        console.log("【saveCurScrSourse】：$scope.data.curCourseId is null , value = ",$scope.data.curCourseId);
        return;
      }

      var params={};
      params.token = $scope.data.usrToken;
      params.cid = $scope.data.curCourseId;

      if($scope.data.scoreTags.length < 0){
        console.log("【saveCurScrSourse】：$scope.data.scoreTags length < 0 , value = ",$scope.data.scoreTags);
        return;
      }
      var score = new Array();
      for(var i=0;i<$scope.data.scoreTags.length;i++){
        if($scope.data.scoreTags[i].status == 'score' && $scope.data.scoreTags[i].key != '总成绩'){
          var item = {};
          item.key = $scope.data.scoreTags[i].key;
          item.weight = parseFloat($scope.data.scoreTags[i].weight);
          // console.log("【saveCurScrSourse】：$scope.data.scoreTags[i].selectSpecPaper = ",$scope.data.scoreTags[i].selectSpecPaper);
          if($scope.data.scoreTags[i].selectSpecPaper.name == "无"){
            item.type = "";
            item.val = "";
            item.name = $scope.data.scoreTags[i].selectSpecPaper.name;
            item.unset = !$scope.data.scoreTags[i].isChange;//传true服务器不会修改成绩，传false会修改成绩
            item.totalScore = 100;//默认百分制
          }else if($scope.data.scoreTags[i].selectSpecPaper.type == "e_test"){
            item.type = "tid";
            var value = {};
            var aids = [];
            aids.push($scope.data.scoreTags[i].selectSpecPaper.paperId);
            value[$scope.data.scoreTags[i].selectSpecPaper.testId] = aids;
            item.val = JSON.stringify(value);
            item.name = $scope.data.scoreTags[i].selectSpecPaper.name;
            item.totalScore = $scope.data.scoreTags[i].selectSpecPaper.totalScore;
          }else {
            item.type = "aid";
            item.val = $scope.data.scoreTags[i].selectSpecPaper.paperId;
            item.name = $scope.data.scoreTags[i].selectSpecPaper.name;
            item.totalScore = $scope.data.scoreTags[i].selectSpecPaper.totalScore;
          }
          // console.log("【saveCurScrSourse】：item = ",item);
          score.push(item);
        }
      }
      params.score = JSON.stringify(score);
      console.log("【saveCurScrSourse】：params = ",params);
      course.saveCurScoreWeight(params).then(function success(response) {
        console.log("【saveCurScrSourse】：response.data = ",response.data);
        $scope.pageargs = {//请求分页的参数集(pn\ps\pl是固定参数，必选)
          pn: 1,//请求页，默认从第一页开始
          ps: 15,//每页的容量
          pl: 5,//底部分页页码默认呈现5个
          reqType: "CT"//是请求类型
        };
        clearPreCourse();//清空上一个课程遗留的数据
      },function error(response) {
        errLog.funcName = 'saveCurScrSourse';
        errLog.text = '保存成绩占比和指定试卷失败';
        service.dialog.showErrorTip(response, errLog);
        console.log("【saveCurScrSourse】：request server failed reason is : " , response);
        $scope.data.scrIsload = false;
      });
    }

    //初始化导出成绩url地址
    function initExportScore() {
      if($scope.data.curCourseId == ""){
        console.log("【exportScore】：$scope.data.curCourseId is null.");
        return;
      }
      if($scope.data.usrToken == ""){
        console.log("【exportScore】：$scope.data.usrToken is null.");
        return;
      }
      var params = {};
      params.token = $scope.data.usrToken;
      params.cid = $scope.data.curCourseId;
      params.host = window.location.host;//"rcp.dev.gdy.io";
      params.pageCount = $scope.data.joinCurStuCount;//将课程下的所有学生成绩导出
      $scope.data.exportUrl = course.exportScore(params);
      // console.log("【exportScore】：$scope.data.exportUrl = ",$scope.data.exportUrl);
    }
    //搜索关键词,匹配成绩列表表头的basic字段
    function searchScore() {
      if($scope.data.scoreTags.length<=0){
        console.log("【searchScore】：$scope.data.scoreTags.length <=0 .");
        return;
      }
      var reqType;
      if($scope.data.searchKey.value == ""){
        requestData.query = "";
        reqType = "CT";
      }else {
        var queryItem = [];

        for(var i=0;i<$scope.data.scoreTags.length;i++){
          if($scope.data.scoreTags[i].status == "basic"){
            var item = [];
            var key = {};
            key.type = "string";
            key.name = "msg.basic."+$scope.data.scoreTags[i].key;
            key.val = $scope.data.searchKey.value;
            item.push(key);
            queryItem.push(item);
          }
        }
        console.log("【searchScore】：queryItem = ",queryItem);
        requestData.query = JSON.stringify(queryItem);
        reqType = "SC";
      }
      console.log("【searchScore】：requestData.query = ",requestData.query);
      $scope.pageargs = {//请求分页的参数集(pn\ps\pl是固定参数，必选)
        pn: 1,//请求页，默认从第一页开始
        ps: 15,//每页的容量
        pl: 5,//底部分页页码默认呈现5个
        reqType: reqType//是请求类型，CT是切换课程，PN是分页，SC是搜索
      };
    }
    //清空课程下所有学生成绩
    function clearUsrScore() {
      if($scope.data.curCourseId == ""){
        console.log("【clearUsrScore】：$scope.data.curCourseId is null.");
        return;
      }
      var params = {};
      params.token = $scope.data.usrToken;
      params.cid = $scope.data.curCourseId;
      // params.clearTotal = 1;
      console.log("【clearUsrScore】：params = ",params);
      course.clearScore(params).then(function success(response) {
        isClearScore = false;
        $scope.pageargs = {//请求分页的参数集(pn\ps\pl是固定参数，必选)
          pn: 1,//请求页，默认从第一页开始
          ps: 15,//每页的容量
          pl: 5,//底部分页页码默认呈现5个
          reqType: "CL"//是请求类型，CT是切换课程，PN是分页，SC是搜索,CL是清空
        };
        service.dialog.alert("成功清空成绩");
      },function error(response) {
        errLog.funcName = 'clearUsrScore';
        errLog.text = '清空成绩失败';
        service.dialog.showErrorTip(response, errLog);
        console.log("【clearUsrScore】：request server failed reason is : " , response);
        $scope.data.scrIsload = false;
      });
    }

    //判断平时成绩你和考试成绩权重数据内容是否正确
    function judGraExm(argType) {
      for(var i =0;i<$scope.data.scoreTags.length;i++){
        if($scope.data.scoreTags[i].key == "grade" && $scope.data.scoreTags[i].weightInvalid){
          if(argType == 0){//0表示需要弹窗提示用户，非0表示不需要弹窗提示
            service.dialog.alert("输入的平时成绩权重占比格式不对，请重新输入。");
            return false;
          }
          $scope.data.scoreTags[i].weight = $scope.data.gradeWeight;
          $scope.data.scoreTags[i].weightInvalid = false;
        }
        if($scope.data.scoreTags[i].key == "exam" && $scope.data.scoreTags[i].weightInvalid){
          if(argType == 0){
            service.dialog.alert("输入的考试成绩权重占比格式不对，请重新输入。");
            return false;
          }
          $scope.data.scoreTags[i].weight = $scope.data.examWeight;
          $scope.data.scoreTags[i].weightInvalid = false;
        }
      }
      return true;
    }
    //---------------------------------ng-function defined-------------------------------------------//
    /*
    * 给scoreTag对象设置改变指定试卷的方法
    * argScoreTag:具体修改指定试卷的对象
    * argSpecPaper：修改后的试卷值
    * */
    $scope.data.changeScrSur = function (argScoreTag,argSpecPaper) {
      // console.log("argSpecPaper = ",argSpecPaper);
      // console.log("argScoreTag = ",argScoreTag);
      argScoreTag.selectSpecPaper = argSpecPaper;
      $scope.data.isScrSurSelect = true;//成绩来源修改了
      $scope.data.tips = "修改指定试卷的内容，原分数会被覆盖。";
    };
    //判断平时成绩和考试成绩的showOptions是否都为true
    $scope.data.scrSourceEqual =function () {
      var gradeBol = false;
      var examBol = false;
      for(var i=0;i<$scope.data.scoreTags.length;i++){
        if($scope.data.scoreTags[i].key == "grade" &&　$scope.data.scoreTags[i].showOptions == true){
          gradeBol = true;
        }
        if($scope.data.scoreTags[i].key == "exam" &&　$scope.data.scoreTags[i].showOptions == true){
          examBol = true;
        }
      }
      return gradeBol&&examBol;
    };

    //初始化设置成绩列表指定试卷和当前选中位置值，并计算出权重总和
    $scope.initScoreTag = function (argScoreTag) {
      argScoreTag.isChange = false;//数据是否改变
      argScoreTag.changeScrSourse = $scope.data.changeScrSur;
      argScoreTag.equal = $scope.data.scrSourceEqual;
   };

    // var turnCourseDebounce = debounce(turnCourse, 500, false);
    // //选中某个课程后刷新学生成绩列表
    // $scope.clickCourseTag = function (tag, index) {
    //   if ($scope.data.curCourseId == tag._id) {
    //     console.log("【clickCourseTag】：selected course id equals to request course id.");
    //     return;
    //   }
    //   console.log("【clickCourseTag】：selected course index =",index);
    //   turnCourseDebounce(tag._id, index);
    // };

    // //切换展开、收起【未测试】
    // $scope.toggleMore = function (argCourseList) {
    //   $scope.data.showMore = !$scope.data.showMore;
    //   if (!$scope.data.showMore && $scope.data.curCourseIndex >= $scope.data.rowNum) {
    //     var row = Math.floor($scope.data.curCourseIndex / $scope.data.rowNum);//算出curCourseIndex所在的行数，已除去第一行的情况
    //     // console.log("【toggleMore】： row =",row);
    //     var rowFirstIndex = row * $scope.data.rowNum;//算出curCourseIndex所在行数的第一位的位置
    //     // console.log("【toggleMore】： rowFirstIndex =",rowFirstIndex);
    //     var rowLastIndex = rowFirstIndex + $scope.data.rowNum-1;//算出curCourseIndex所在行数的最后一位的位置
    //     var cutNum = rowLastIndex <= argCourseList.length-1? $scope.data.rowNum : argCourseList.length - rowFirstIndex;//算出curCourseIndex所在行数的需要切割的容量
    //     var arr = argCourseList.splice(rowFirstIndex, cutNum);
    //     Array.prototype.unshift.apply(argCourseList, arr);
    //     $scope.data.curCourseIndex = $scope.data.curCourseIndex % $scope.data.rowNum;
    //     // console.log("【toggleMore】：$scope.data.curCourseIndex =",$scope.data.curCourseIndex);
    //   }
    // };

    /*请求成绩列表,并分页
     * @param:argPageArgs:请求分页的参数集；{'pn':'当前页，默认传1','ps':'每页容量','pl':'底部分页页码大小'},可根据自身需求追加属性值
     * @param：argSucsCbk:scrPageFn方法请求成功后的回调函数，需传入http请求的结果集
     * 模块说明：使用了pagination公共分页组件
     * 备注：当type=‘CT’时，表头和表格内容会根据course变化；当type = ‘PN’，表示请求分页，表格内容会发生变化
     * author:zhongj
     */
    $scope.scrPageFn = function (argPageArgs, argSucsCbk) {
      if (angular.isUndefined(argPageArgs)) {
        console.log("argPageArgs is undefined.");
        return;
      }
      console.log("【scrPageFn】：reqType = ",argPageArgs.reqType);
      reqType = argPageArgs.reqType;

      $scope.data.scrIsload = true;//标记成绩列表页面数据加载状态，默认加载

      console.log("【scrPageFn】：$scope.data.scoreTags.length  = " , $scope.data.scoreTags.length);
      console.log("【scrPageFn】：$scope.data.usrScoreLst.length  = " , $scope.data.usrScoreLst.length);

      requestData.cid = $scope.data.curCourseId;//获取课程id
      requestData.page = argPageArgs.pn;
      $scope.data.curPage = argPageArgs.pn;//记录当前页码
      requestData.pageCount = argPageArgs.ps;
      $scope.data.scoreTags = [];
      console.log("【scrPageFn】：requestData = ", requestData);
      course.getScoreList(requestData,'offRun')
        .then(function success(response) {
          console.log("【scrPageFn】：response = ", response);
          // console.log("【scrPageFn】：data course = " , response.data.course);

          if(!angular.isUndefined(argSucsCbk) && argSucsCbk != null){//提供分页
            response.pa = {total: response.data.matchCount};
            argSucsCbk(response);
          }
          $scope.data.searchKey.isEdit = false;//标记搜索关键词未修改

          //当course发生变化时，会更新course，否则保留上一次的数据记录
          // if (!angular.isUndefined(response.data.course) && response.data.course != null) {
          //   $scope.data.course = response.data.course;
          //   $scope.data.courseIsload = false;
          //   if($scope.data.curCourseId == "" &&　response.data.course.length > 0){//首次请求默认第一个为选中课程
          //     $scope.data.curCourseId = response.data.course[0]._id;
          //   }
          // }
          if(reqType == "CT" && !angular.isUndefined(response.data.matchCount)){
            $window.localStorage['score_curent_joinStudentCount'] = response.data.matchCount;
          }

          //当key发生变化时，会更新key，否则保留上一次的数据记录
          if (!angular.isUndefined(response.data.key) && response.data.key != null) {
            //组建筛选课程列表
            formCourseTags(response.data.key);
          } else {
            //返回数据不合法
            service.dialog.alert("【scrPageFn】：response.data.key(成绩列表表头) from getScoreList function is invalid,value = "+ response.data.key);
            console.log("【scrPageFn】：response.data.key(成绩列表表头) from getScoreList function is invalid,value = ", response.data.key);
            return;
          }
          console.log("【scrPageFn】：data form =", response.data.form);
          if ((!angular.isUndefined(response.data.form) && response.data.form.length >=0)) {
            //处理成绩列表的学生数据
            getScoreList(response.data, argPageArgs.reqType);
            $scope.pageargs.reqType = "PN";
          } else {
            //返回数据不合法
            service.dialog.alert("【scrPageFn】：response.data.form(成绩列表内容) from getScoreList function is invalid,value = " + response.data.form);
            return;
          }

          if (angular.isUndefined($scope.data.joinCurStuCount) || $scope.data.joinCurStuCount < 0) {
            service.dialog.alert("【scrPageFn】：join course student count is undefined or < 0,value = "+$scope.data.joinCurStuCount);
            //后台没有返回合法的参与课程学生总数
            return;
          }
          $scope.data.joinCurStuCount = response.data.matchCount;

          initExportScore();//初始化导出成绩

          if (!angular.isUndefined(response.data.uneditCount) && response.data.uneditCount >= 0) {
            $scope.data.noEntryStuCount = response.data.uneditCount;
          }
        }, function error(response) {
          errLog.funcName = 'scrPageFn';
          errLog.text = '请求成绩列表失败';
          service.dialog.showErrorTip(response, errLog);
          console.log("【scrPageFn】：request score page function failed reason is : " , response);
        }).finally(function () {
          // $scope.data.courseIsload = false;
          $scope.data.scrIsload = false;
          // console.log("【scrPageFn】：reqType = ",reqType);
          if(reqType == "CT" && !$scope.data.scrIsload && $scope.data.scoreTags && $scope.data.scoreTags.length<=0){
            $scope.data.isEmtry = true;
          }
          // console.log("$scope.data.isEmtry = ",$scope.data.isEmtry);
      });
    };

    //当平时成绩、考试成绩、备注发生变化时
    $scope.scoreChange = function (argRow, argUsrScore, argScoreTag) {
      // console.log("argRow = " + argRow);
      // console.log("argUsrScore = ");
      // console.log(argUsrScore);
      console.log("【scoreChange】：argUsrScore.msg[argScoreTag.status][argScoreTag.key] = ",argUsrScore.msg[argScoreTag.status]);
      console.log("【scoreChange】：argUsrScore.msg[argScoreTag.status][argScoreTag.key] = ",argUsrScore.msg[argScoreTag.status][argScoreTag.key]);
      if (angular.isUndefined($scope.data.usrScoreLst) || $scope.data.usrScoreLst.length < 0) {
        console.log("【scoreChange】：usrScoreLst is undefined or < 0.");
        return;
      }
      if (angular.isUndefined(argUsrScore.msg[argScoreTag.status][argScoreTag.key])) {
        setInvalid(argUsrScore, argScoreTag.key, true);//不符合
        return;
      }
      setInvalid(argUsrScore, argScoreTag.key, false);
      /*
       *处理以下两种情况:
       * 1、修改原来已录入的平时成绩或期末成绩，及其录入多次的情况
       * 2、已录入平时成绩，接着录入期末成绩或者是已录入期末成绩，接着录入平时成绩
       */
      for (var i = 0; i < $scope.data.usrScoreLst.length; i++) {
        if ($scope.data.usrScoreLst[i].uid == argUsrScore.uid) {
          $scope.data.usrScoreLst[i].cid = $scope.data.curCourseId;
          $scope.data.usrScoreLst[i].type = 1;//已改动，type字段是新增，用来记录数据状态，type是undefined的时候表示未改动；1：已改动；2：已发送；3：已保存

          if(angular.isUndefined($scope.data.usrScoreLst[i].update)|| $scope.data.usrScoreLst[i].update == null){
            $scope.data.usrScoreLst[i].update = {};
          }
          if(angular.isUndefined($scope.data.usrScoreLst[i].unset)|| $scope.data.usrScoreLst[i].unset == null){
            $scope.data.usrScoreLst[i].unset = {};
          }

          if(argUsrScore.msg[argScoreTag.status][argScoreTag.key] == ""){
            $scope.data.usrScoreLst[i].unset[argScoreTag.key] = argUsrScore.msg[argScoreTag.status][argScoreTag.key];
            delete $scope.data.usrScoreLst[i].update[argScoreTag.key];
          }else {
            $scope.data.usrScoreLst[i].update[argScoreTag.key] = argUsrScore.msg[argScoreTag.status][argScoreTag.key];
            delete $scope.data.usrScoreLst[i].unset[argScoreTag.key];
          }

          $scope.data.usrScoreLst[i].hasRecord = isRecord(argUsrScore.msg);
          $scope.data.usrScoreLst[i].page = $scope.data.curPage;
          $scope.data.usrScoreLst[i].rowNum = argRow;
          console.log("$scope.data.usrScoreLst[" + i + "] = ",$scope.data.usrScoreLst[i]);
          break;
        }
      }
      var count = 0;
      for (var i = 0; i < $scope.data.usrScoreLst.length; i++) {
        if (!angular.isUndefined($scope.data.usrScoreLst[i].type) && ($scope.data.usrScoreLst[i].type == 1 || $scope.data.usrScoreLst[i].type == 2)) {//已改动或已发送
          count++;
        }
      }
      $scope.data.EntringStuCount = count;
      console.log(" $scope.data.EntringStuCount = " + $scope.data.EntringStuCount);
    };

    var saveScoreDebounce = debounce(saveScore, 100, false);
    /*
     * 保存录入的学生成绩
     * @param:argType表示保存类型，0表示点击保存，1表示自动保存
     * author:zhongj
     * */
    $scope.saveEntryStuScore = function (argType) {
      saveType = argType;
      saveScoreDebounce();
    };

    //确定提交成绩
    $scope.confirmFn = function () {
      if($scope.data.isSetScrShow){
        if($scope.data.weightCount != 100){
          service.dialog.alert("平时成绩所占比例和考试成绩所占比例总和必须等于100，否则不能保存，请重新输入。");
          return;
        }
        var bol = judGraExm(0);//判断平时成绩和考试成绩权重是否正确
        if(!bol){
          return;
        }
        $scope.confirm.show = false;//关闭提示窗
        $scope.confirm.isConfirm = true;//点击了确定按钮
        $scope.data.isSetScrShow = false;
        $scope.data.scrIsload = true;
        saveCurScrSourse();
        cleanConfirm();//清空确定框数据，还原到初始状态
        return;
      }
      $scope.confirm.show = false;//关闭提示窗
      $scope.confirm.isConfirm = true;//点击了确定按钮
      if(isClearScore){
        $scope.data.scrIsload = true;
        clearUsrScore();//清空成绩
        cleanConfirm();//清空确定框数据，还原到初始状态
        return;
      }
      if(!hasNoEntry &&　$scope.confirm.isConfirm){
        submitScore();//提交成绩
      }
      cleanConfirm();//清空确定框数据，还原到初始状态（保存和提交都需要还原状态）
    };
    //取消提交成绩
    $scope.cancelFn = function () {
      $scope.confirm.show = false;//关闭提示窗
      $scope.confirm.isConfirm = false;//点击了取消按钮
      $scope.confirm.errs = [];//清空错误信息提示
      $scope.confirm.isShow = true;//还原确定按钮的显示状态
      $scope.data.isSetScrShow = false;//不显示设置成绩
      cleanConfirm();//清空确定框数据，还原到初始状态
    };
    //提交成绩
    $scope.submitEntryStuScore = function () {
      if ($scope.data.noEntryStuCount < 0) {
        console.log("【submitEntryStuScore】：noEntryStuCount < 0,value = ",$scope.data.noEntryStuCount);
        return;
      }
      hasSelect = false;
      var count = 0;
      var hasInvalid = false;
      var noSave = false;//判断选中的学生里是否存在未保存的数据
      for(var i=0;i<$scope.data.usrScoreLst.length;i++){
        if($scope.data.usrScoreLst[i].checkbox){
          hasSelect = true;
          if(!$scope.data.usrScoreLst[i].hasRecord){
            count++;
          }
          if(!angular.isUndefined($scope.data.usrScoreLst[i].inScrValid) &&($scope.data.usrScoreLst[i].inScrValid['grade']||$scope.data.usrScoreLst[i].inScrValid['exam'])){
            hasInvalid = true;
          }
          if(!angular.isUndefined($scope.data.usrScoreLst[i].type) && ($scope.data.usrScoreLst[i].type == 1 || $scope.data.usrScoreLst[i].type == 2)){
            noSave = true;
          }
        }
      }
      console.log("【submitEntryStuScore】：count = ",count);
      //有选择的情况下，需要判断选中的数据里是否存在未录入的学生
      if(hasSelect){
        if(hasInvalid){
          service.dialog.alert("您所选中的学生里存在录入成绩数据格式不合法的情况，请修改后再提交。");
          return;
        }
        if(noSave){
          service.dialog.alert("您所选中的学生里存在未保存的成绩，请保存后再提交。");
          return;
        }
        if(count>0){
          $scope.confirm.show = true;
          $scope.confirm.info = "您所选中的学生里存在"+count+"位没有录入成绩的情况，无法提交成绩。";
          hasNoEntry = true;
          $scope.confirm.cancelBtnName = "知道了";
          $scope.confirm.isShow = false;//隐藏确定按钮
          return;
        }

        $scope.confirm.show = true;
        $scope.confirm.info = "您所选中的学生成绩已录入，提交后学生可即刻查看成绩。";
      }else {
        var bol = extGraExmInv();//判断平时成绩或考试成绩数据内容格式是否存在不合法的情况
        if(bol){
          service.dialog.alert("提交的成绩里存在不合法的数据格式，请修改后再提交。");
          return;
        }
        if($scope.data.EntringStuCount > 0){
          service.dialog.alert("提交的成绩里存在未保存的成绩，请保存后再提交。");
          return;
        }
        //没有选择，直接点击提交的情况下，需弹窗提示用户还有未录入的学生，需要全部录入完了之后才能提交
        if( $scope.data.noEntryStuCount > 0){
          $scope.confirm.show = true;
          $scope.confirm.info = "还有" + $scope.data.noEntryStuCount +"名学生没有录入成绩，无法提交成绩";
          hasNoEntry = true;
          $scope.confirm.cfmBtnName = "知道了";
          $scope.confirm.cancelBtnName = "继续录入";
          console.log("【submitEntryStuScore】：noEntryStuCount > 0.");
          return;
        }
        $scope.confirm.show = true;
        $scope.confirm.info = "确定提交该课程下所有学生成绩？";
      }
    };
    /*
     *全选
     * @param:argSelectAll是否全部选中，argUsrLst表示这一页的学生成绩数组
     */
    $scope.selectAll = function (argSelectAll,argUsrLst) {
      // console.log("【selectAll】：argSelectAll = ",argSelectAll);
        if(!argSelectAll){
          isSelectAll = true;
          angular.forEach(argUsrLst,function (val,key) {
            val.checkbox = true;
          });
        }else {
          isSelectAll = false;
          angular.forEach(argUsrLst,function (val,key) {
            val.checkbox = false;
          });
        }
      // console.log("【selectAll】：argUsrLst = ",argUsrLst);
    };
    /*
     *记录每行的选中状态
     * @param:argIsSelect表示该行是否选中，argUsrScore表示该行的学生数据
     */
    $scope.checkUsr = function (argIsSelect,argUsrScore) {
      argUsrScore.checkbox = !argIsSelect;
      console.log("【checkUsr】：argUsrScore.uid = ",argUsrScore.uid);
      console.log("【checkUsr】：argUsrScore.checkbox = ",argUsrScore.checkbox);
    };
    //判断备注属性是否存在，不存在则声明一个备注
    $scope.isExist = function (argUsrScore,argScoreTag) {
      // console.log("【isExist】：argUsrScore.msg[argScoreTag.status] = ",argUsrScore.msg[argScoreTag.status]);
      if(angular.isUndefined(argUsrScore.msg[argScoreTag.status])){
        argUsrScore.msg[argScoreTag.status] = {};
        if(argScoreTag.key == "备注"){
          argUsrScore.msg[argScoreTag.status][argScoreTag.key] = argScoreTag.range[0];
        }
      }else if(angular.isUndefined(argUsrScore.msg[argScoreTag.status][argScoreTag.key])){
        if(argScoreTag.key == "备注"){
          argUsrScore.msg[argScoreTag.status][argScoreTag.key] = argScoreTag.range[0];
        }
        if(argScoreTag.key == "grade" || argScoreTag.key == "exam"){
          argUsrScore.msg[argScoreTag.status][argScoreTag.key] = "";
        }
      }
    };

    //当平时成绩或考试成绩的权重变化时，更新权重
    $scope.changeScrWeight = function (argScore) {
      if(angular.isUndefined(argScore.weight) || argScore.weight == null|| argScore.weight <0){
        argScore.weightInvalid = true;
        return;
      }
      if(argScore.key == "grade"){
        $scope.data.gradeWeight = parseFloat(argScore.weight);

      }
      if(argScore.key == "exam"){
        $scope.data.examWeight = parseFloat(argScore.weight);
      }
      argScore.weightInvalid = false;
      // console.log("【changeScrWeight】：$scope.data.gradeWeight = ",$scope.data.gradeWeight);
      // console.log("【changeScrWeight】：$scope.data.examWeight = ",$scope.data.examWeight);
      $scope.data.weightCount = $scope.data.gradeWeight + $scope.data.examWeight;
      // console.log("【changeScrWeight】：$scope.data.weightCount = ",$scope.data.weightCount);
    };

    //设置成绩数据来源
    $scope.setScoreSource = function () {
      $scope.confirm.show = true;
      $scope.data.isSetScrShow = true;
      $scope.confirm.confirmTitle = "设置成绩";
      $scope.confirm.cfmBtnName = "确认保存";
      $scope.data.loadingScrSur = true;
      getCurScrSourse();//请求获得课程下的试卷或考试
    };


    //记录关键词是否修改过
    $scope.isEditKey = function () {
      $scope.data.searchKey.isEdit = true;
      console.log("【isEditKey】：$scope.data.searchKey.isEdit = ",$scope.data.searchKey.isEdit);
    };

    var scrSearchDebounce = debounce(searchScore, 100, false);

    //查询关键词
    $scope.scrSearch = function () {
      if(!$scope.data.searchKey.isEdit){
        console.log("【scrSearch】：数据没有修改,不做重复查询。");
        return;//关键词没有修改过
      }
      var stuCount = $window.localStorage['score_curent_joinStudentCount'];//获取当前课程的学生参与总数
      if(stuCount<=0){
        service.dialog.alert("成绩列表为空，无数据可查询。");
        return;
      }
      scrSearchDebounce();
    };

    //清空成绩
    $scope.clearScore = function () {
      if($scope.data.usrScoreLst.length<=0){
        service.dialog.alert("没有需要清空的成绩");
        return;
      }
      $scope.confirm.show = true;
      $scope.confirm.info = "确定清空该课程下所有学生成绩？";
      isClearScore = true;
    };

    //悬浮显示提示语
    $scope.showTip = function (event,argType,argData,argId) {
      if(angular.isUndefined(argData)){
        console.log("【showTip】：u.msg.scoreExt is undefined.");
        return;
      }
      // console.log("argId = ",argId);
      var rect=document.getElementById(argId).getBoundingClientRect();
      // console.log("【showTip】：rect = ",rect);

      var scrollLeft= Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
      // console.log("【showTip】：scrollLeft = ",scrollLeft);
      var scrollTop=Math.max(document.documentElement.scrollTop, document.body.scrollTop);
      // console.log("【showTip】：scrollTop = ",scrollTop);

      if(argType == "ext"){
        if(angular.isUndefined(argData['原因']) || argData['原因'] == null || argData['原因'] == ""){
          // console.log("【showTip】：证书发放的原因不存在:",argData['原因']);
          return;
        }
        $scope.data.tipName = argData['原因'];
        $('.scr-tip').css("left", rect.left-rect.width+scrollLeft);
        $('.scr-tip').css("top", rect.top-rect.height*3+scrollTop);
      }
      if(argType == "score"){
        if(angular.isUndefined(argData.name) || argData.name == null || argData.name == "" || argData.name == "无"){
          // console.log("【showTip】：没有指定试卷不存在:",argData.name);
          return;
        }
        $scope.data.tipName = argData.name;
        $('.scr-tip').css("left", rect.left+scrollLeft);
        $('.scr-tip').css("top", rect.top-rect.height*2+scrollTop);
      }
      $('.scr-tip').css("display","block");
    };

    //隐藏悬浮提示语
    $scope.hideTip = function (argObj) {
      $('.scr-tip').css("display","none");
    };
    //---------------------------------call function -------------------------------------------//
    init();

    //----------------——-----------------destroy -------------------------------------------//

    //页面销毁时，销毁定时器
    $scope.$on('$destroy', function () {
      $interval.cancel(atuoSaveTimer);
    });
  }]);