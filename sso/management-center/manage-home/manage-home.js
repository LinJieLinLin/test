/**
 * Created by tangs on 2016/7/29.
 * 首页管理
 */
module.controller('homeCtrl',['$scope', 'service', '$timeout', function($scope,service,$timeout){
    $scope.manageHome='首页管理的内容';
    $scope.pcSelectDatas=[
        {value:"0",text:"酷校首页"},
        {value:"1",text:"爱科学首页"},
        {value:"2",text:"广州幕课首页"},
        {value:"3",text:"花都区首页"}
    ];
    $scope.wapSelectDatas=[
        {value:"0",text:"酷校移动端首页"},
        {value:"1",text:"爱科学移动端首页"},
        {value:"2",text:"广州幕课移动端首页"},
        {value:"3",text:"花都区移动端首页"}
    ];
    $scope.selectedPC=true;
    console.log('isCurrent:='+$scope.isCurrent)
    $scope.pcOption=false;
    $scope.wapOption=false;
    $scope.pcSelectVal='酷校首页';
    $scope.wapSelectVal='酷校移动端首页';
    $scope.cSelect=function(target){
        $scope.selectedPC = target === 'pc';
        if(target==='pc'){
            $scope.pcOption=!$scope.pcOption;
            $scope.wapOption=false;
        }
        else if(target==='wap'){
            $scope.wapOption=!$scope.wapOption;
            $scope.pcOption=false;
        }
    };
    //首页管理基本设置
    $scope.basicSetFormInfo={
        title:'',
        logo:'../rcp-common/imgs/face/d-face-1.png',
        Keywords:'',
        descripition:'',
        footLogo:'../rcp-common/imgs/face/d-face-1.png',
        cpName:'',
        cope:''

    }
    $scope.saveBasicSet=function(){
        if($scope.basicSetFormInfo.title===''){
            service.dialog.alert('平台标题不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.logo===''){
            service.dialog.alert('logo不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.Keywords===''){
            service.dialog.alert('配置keywords不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.descripition===''){
            service.dialog.alert('配置descripition不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.footLogo===''){
            service.dialog.alert('页尾logo不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.cpName===''){
            service.dialog.alert('公司名不能为空！');
            return;
        }
        if($scope.basicSetFormInfo.cope===''){
            service.dialog.alert('备案号不能为空！');
            return;
        }
    }
    //上传logo
    //显示的数据
    $scope.info = {
        avatar: '', //头像url
        desc: '',   //签名
        nickName: '',   //昵称
        gender: 2, //用户性别 0 女 1 男  2 保密
        country: '',    //国家
        province: '',   //省份
        city: '',   //城市
        hobby: []  //兴趣爱好
    };
    //上传配置logo
    $scope.uploadImgConfig = {
        showEdit: false,
        uploadNum: 0,     //上传图片位置
        upCancel: false,  //是否取消上传
        id: 'avatar',        //上传input ID
        width: 200,
        ratio: [1, 1],
        containerStyle: {width: '90px', height: '90px'},
        mode: 'fixed',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面
        scope: null,        //返回$scope
        cb: function (data) {
            if (data) {
                if($scope.nowImg==='user'){
                    $scope.basicSetFormInfo.logo = data;

                }else{
                    $scope.basicSetFormInfo.footLogo = data;
                }
            }
        }
    };
    //$scope.info.avatar =$scope.info.avatar|| '../rcp-common/imgs/face/d-face-1.png';
    $scope.uploadAvatarLogo = function (argType) {
        $scope.nowImg = argType;
        $timeout(function () {
            if ($scope.uploadImgConfig.scope) {
                $scope.uploadImgConfig.scope.selectImg();
            }
        });
    };
    //上传配置footLogo
    $scope.uploadImgConfigFoot = {
        showEdit: false,
        uploadNum: 0,     //上传图片位置
        upCancel: false,  //是否取消上传
        id: 'footAvatar',        //上传input ID
        width: 200,
        ratio: [1, 1],
        containerStyle: {width: '90px', height: '90px'},
        mode: 'fixed',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面
        scope: null,        //返回$scope
        cb: function (data) {
            if (data) {
                $scope.basicSetFormInfo.footLogo = data;
            }
        }
    };
    //$scope.info.avatar =$scope.info.avatar|| '../rcp-common/imgs/face/d-face-1.png';
    $scope.uploadAvatarFootLogo = function () {
        $timeout(function () {
            if ($scope.uploadImgConfigFoot.scope) {
                $scope.uploadImgConfigFoot.scope.selectImg();
            }
        });
    };
    //service.dialog.alert('昵称不能为空！');
    $scope.repeatClick=function(value,e){
        if(e==='pc'){
            $scope.pcOption=false;
            $scope.pcSelectVal=$scope.pcSelectDatas[value].text;
        }else if(e==='wap'){
            $scope.wapOption=false;
            $scope.wapSelectVal=$scope.wapSelectDatas[value].text;
        }
    }
    //请选择你要编辑的模块
    $scope.curTag=true;
    $scope.hTitle='基本设置';
    $scope.ngTagContain='basicSet';
    $scope.editModelDatas=[
        {tag:"basicSet",text:"基本设置",icon:"image-setting-u",curicon:"image-setting-s"},
        {tag:"navMenu",text:"导航菜单",icon:"image-navigationmenu-u",curicon:"image-navigationmenu-s"},
        {tag:"imgSet",text:"轮播图设置",icon:"image-carouselfigure-u",curicon:"image-carouselfigure-s"},
        {tag:"courseRecommend",text:"课程推荐",icon:"image-recommended-u",curicon:"image-recommended-s"},
        {tag:"orgManage",text:"机构管理",icon:"image-institutions-u",curicon:"image-institutions-s"},
        {tag:"footSet",text:"页尾设置",icon:"image-footersetting-u",curicon:"image-footersetting-s"}
    ];
    $scope.editModel=function(tag,text,index){
        $scope.selectIndex= index
        $scope.hTitle=text;
        switch(tag)
        {
            case 'basicSet':
                $scope.ngTagContain='basicSet';
                break;
            case 'navMenu':
                $scope.ngTagContain='navMenu';
                $scope.navMenuShow=true;
                break;
            case 'imgSet':
                $scope.ngTagContain='imgSet';
                $scope.imgSetShow=true;
                break;
            case 'courseRecommend':
                $scope.ngTagContain='courseRecommend';
                $scope.courseRShow=true;
                break;
            case 'orgManage':
                $scope.ngTagContain='orgManage';
                $scope.orgManageShow=true;
                break;
            case 'footSet':
                $scope.ngTagContain='footSet';
                $scope.footSetShow=true;
                break;
            default:
                console.log('default');
                $scope.ngTagContain=''
        }
    };
    //轮播图设置
    $scope.imgSetShow=true;
    $scope.imgSetDatas=[
        {name:"关于跨境电商的宣传图",src:"http://abc.com",describe:"五号到期",status:"1"},
        {name:"关于跨境电商的宣传图3",src:"http://abc3.com",describe:"五号到期3",status:"2"},
        {name:"关于跨境电商的宣传图2",src:"http://abc2.com",describe:"五号到期2",status:"1"}
    ];

    $scope.imgSetEdit=function(index){
        if(index!=='isAdd'){
            $scope.editOrAdd='编辑';
            $scope.editBtnShow=true;
            $scope.imgSetShow=false;
            $scope.imgSetEditInfo={
                name:$scope.imgSetDatas[index].name,
                src:$scope.imgSetDatas[index].src,
                describe:$scope.imgSetDatas[index].describe,
                status:$scope.imgSetDatas[index].status,
                index:index
            }
        }else{
            $scope.editOrAdd='添加新轮播图';
            $scope.editBtnShow=false;
            $scope.imgSetShow=false;
            $scope.imgSetEditInfo={
                name:'',
                src:'',
                describe:'',
                status:'',
                index:''
            }


        }
    };
    $scope.imgSetDelete=function(index){
        $scope.imgSetDatas.splice(index,1);
        console.log($scope.imgSetDatas);
    };
    $scope.editRadio=function(index){
        $scope.imgSetEditInfo.status=index;
    }
    $scope.imgSetEditSave=function(index){
        $scope.imgSetDatas[index].name=$scope.imgSetEditInfo.name;
        $scope.imgSetDatas[index].src=$scope.imgSetEditInfo.src;
        $scope.imgSetDatas[index].describe=$scope.imgSetEditInfo.describe;
        $scope.imgSetDatas[index].status=$scope.imgSetEditInfo.status;//??
        service.dialog.alert('编辑成功');
        $scope.imgSetShow=true;
    };
    $scope.imgSetAddSave=function(){
        $scope.imgSetAdd={};
        $scope.imgSetAdd.name=$scope.imgSetEditInfo.name;
        $scope.imgSetAdd.src=$scope.imgSetEditInfo.src;
        $scope.imgSetAdd.describe=$scope.imgSetEditInfo.describe;
        $scope.imgSetAdd.status=$scope.imgSetEditInfo.status;
        $scope.imgSetDatas=$scope.imgSetDatas.concat($scope.imgSetAdd);
        service.dialog.alert('添加成功');
        $scope.imgSetShow=true;
    };
    $scope.imgSetEditCancel=function(){
        $scope.imgSetShow=true;
    };
    //机构管理；
    $scope.orgManageShow=true;
    $scope.orgManageDatas=[
        {name:"关于跨境电商的宣传图",src:"../rcp-common/imgs/face/d-face-1.png",link:"http://abc.com"},
        {name:"关于跨境电商的宣传图3",src:"../rcp-common/imgs/face/d-face-1.png",link:"http://abc.com"},
        {name:"关于跨境电商的宣传图2",src:"../rcp-common/imgs/face/d-face-1.png",link:"http://abc.com"}
    ];
    $scope.orgManageEdit=function(index){
        if(index!=='isAdd'){
            $scope.editOrAdd='编辑';
            $scope.orgBtnShow=true;
            $scope.orgManageShow=false;
            $scope.orgManageEditInfo={
                name:$scope.orgManageDatas[index].name,
                src:$scope.orgManageDatas[index].src,
                link:$scope.orgManageDatas[index].link,
                index:index
            }
        }else{
            $scope.editOrAdd='新增';
            $scope.orgBtnShow=false;
            $scope.orgManageShow=false;
            $scope.orgManageEditInfo={
                name:'',
                src:'',
                link:'',
                index:''
            }


        }
    };
    $scope.orgManageDelete=function(index){
        $scope.orgManageDatas.splice(index,1);
        console.log($scope.orgManageDatas);
    };
    $scope.orgManageEditSave=function(index){
        $scope.orgManageDatas[index].name=$scope.orgManageEditInfo.name;
        $scope.orgManageDatas[index].src=$scope.orgManageEditInfo.src;
        $scope.orgManageDatas[index].link=$scope.orgManageEditInfo.link;
        service.dialog.alert('编辑成功');
        $scope.orgManageShow=true;
    };
    $scope.orgManageAddSave=function(){
        $scope.imgSetAdd={};
        $scope.imgSetAdd.name=$scope.orgManageEditInfo.name;
        $scope.imgSetAdd.src=$scope.orgManageEditInfo.src;
        $scope.imgSetAdd.link=$scope.orgManageEditInfo.link;
        $scope.orgManageDatas=$scope.orgManageDatas.concat($scope.imgSetAdd);
        service.dialog.alert('添加成功');
        $scope.orgManageShow=true;
    };
    $scope.orgManageEditCancel=function(){
        $scope.orgManageShow=true;
    };
    //--------------------------------------------------

    //课程推荐；
    $scope.courseRShow=true;
    $scope.courseRDatas=[
        {name:"关于跨境电商",selectShow:"1",way:"2",date:'2016/08/05'},
        {name:"宣传图3",selectShow:"2",way:"1",date:'2016/08/05'},
        {name:"关于跨境",selectShow:"1",way:"2",date:'2016/08/05'}
    ];
    $scope.courseREdit=function(index){
        if(index!=='isAdd'){
            $scope.editOrAdd='编辑';
            $scope.orgBtnShow=true;
            $scope.courseRShow=false;
            $scope.courseREditInfo={
                name:$scope.courseRDatas[index].name,
                selectShow:$scope.courseRDatas[index].selectShow,
                way:$scope.courseRDatas[index].way,
                index:index
            }
        }else{
            $scope.editOrAdd='新增';
            $scope.orgBtnShow=false;
            $scope.courseRShow=false;
            $scope.courseREditInfo={
                name:'',
                selectShow:'',
                way:'',
                index:''
            }


        }
    };
    $scope.courseRDelete=function(index){
        $scope.courseRDatas.splice(index,1);
        console.log($scope.courseRDatas);
    };
    $scope.courseREditSave=function(index){
        $scope.courseRDatas[index].name=$scope.courseREditInfo.name;
        $scope.courseRDatas[index].src=$scope.courseREditInfo.src;
        $scope.courseRDatas[index].link=$scope.courseREditInfo.link;
        service.dialog.alert('编辑成功');
        $scope.courseRShow=true;
    };
    $scope.courseRAddSave=function(){
        $scope.imgSetAdd={};
        $scope.imgSetAdd.name=$scope.courseREditInfo.name;
        $scope.imgSetAdd.src=$scope.courseREditInfo.src;
        $scope.imgSetAdd.link=$scope.courseREditInfo.link;
        $scope.courseRDatas=$scope.courseRDatas.concat($scope.imgSetAdd);
        service.dialog.alert('添加成功');
        $scope.courseRShow=true;
    };
    $scope.courseREditCancel=function(){
        $scope.courseRShow=true;
    };
    //--------------------------------------------------
    //页尾设置；
    $scope.footSetShow=true;
    $scope.footSetDatas=[
        {name:"关于跨境电商的宣传图",link:"http://rcp.dev.gdy.io/",date:"2015-09-07"},
        {name:"关于跨境电商的宣传图3",link:"http://rcp.dev.gdy.io/space/student-space.html",date:"2015-09-07"},
        {name:"关于跨境电商的宣传图2",link:"http://rcp.dev.gdy.io/",date:"2015-09-07"}
    ];
    $scope.footSetEdit=function(index){
        if(index!=='isAdd'){
            $scope.editOrAdd='编辑';
            $scope.orgBtnShow=true;
            $scope.footSetShow=false;
            $scope.footSetEditInfo={
                name:$scope.footSetDatas[index].name,
                src:$scope.footSetDatas[index].src,
                link:$scope.footSetDatas[index].link,
                index:index
            }
        }else{
            $scope.editOrAdd='新增';
            $scope.orgBtnShow=false;
            $scope.footSetShow=false;
            $scope.footSetEditInfo={
                name:'',
                src:'',
                link:'',
                index:''
            }


        }
    };
    $scope.footSetDelete=function(index){
        $scope.footSetDatas.splice(index,1);
        console.log($scope.footSetDatas);
    };
    $scope.footSetEditSave=function(index){
        $scope.footSetDatas[index].name=$scope.footSetEditInfo.name;
        $scope.footSetDatas[index].link=$scope.footSetEditInfo.link;
        $scope.footSetDatas[index].date='2017-4-4';
        service.dialog.alert('编辑成功');
        $scope.footSetShow=true;
    };
    $scope.footSetAddSave=function(){
        $scope.imgSetAdd={};
        $scope.imgSetAdd.name=$scope.footSetEditInfo.name;
        $scope.imgSetAdd.src=$scope.footSetEditInfo.src;
        $scope.imgSetAdd.link=$scope.footSetEditInfo.link;
        $scope.footSetDatas=$scope.footSetDatas.concat($scope.imgSetAdd);
        service.dialog.alert('添加成功');
        $scope.footSetShow=true;
    };
    $scope.footSetEditCancel=function(){
        $scope.footSetShow=true;
    };
    //--------------------------------------------------
    //导航菜单；
    $scope.navMenuShow=true;
    $scope.navMenuDatas=[
        {expand:false,name:"关于跨境电商的宣传图",link:"http://rcp.dev.gdy.io/",date:"2015-09-07",
            childDatas:[
                {expand:false,name:"关于商图",link:"http://rcp.y.io/",date:"2015-09-07"},
                {expand:false,name:"的传图3",link:"http://rcsspactml",date:"2015-09-07"},
                {expand:false,name:"关于跨2",link:"http://rcp.dedio/",date:"2015-09-07"}
            ]
        },
        {expand:false,name:"关于跨境电商的宣传图3",link:"http://rcp.dev.gdy.io/space/student-space.html",date:"2015-09-07",
            childDatas:[
                {expand:false,name:"关于商图",link:"http://rcp.y.io/",date:"2015-09-07"},
                {expand:false,name:"的传图3",link:"http://rcsspactml",date:"2015-09-07"}
            ]
        },
        {expand:false,name:"关于跨境电商的宣传图2",link:"http://rcp.dev.gdy.io/",date:"2015-09-07",
            childDatas:[
                {expand:false,name:"关于商图",link:"http://rcp.y.io/",date:"2015-09-07"},
                {expand:false,name:"关于跨2",link:"http://rcp.dedio/",date:"2015-09-07"}
            ]
        }
    ];
    $scope.navMenuEdit=function(index){
        $scope.navMenuDatas[index]={expand:false,name:"",link:"",date:"2015-09-07",
            childDatas:[]
        }
    };
    $scope.navMenuDelete=function(index){
        $scope.navMenuDatas.splice(index,1);
        console.log($scope.navMenuDatas);
    };
    $scope.navMenuDChileDelete=function(parentIndex,index){
        $scope.navMenuDatas[parentIndex].childDatas.splice(index,1);
        console.log($scope.navMenuDatas);
    };
    $scope.navMenuDChileAdd=function(index){
        $scope.childIndex=$scope.navMenuDatas[index].childDatas.length;
        $scope.navMenuDatas[index].childDatas[$scope.childIndex]={expand:false,name:"",link:"",date:"2015-09-07"}
    };
    //$scope.navMenuEditSave=function(index){
    //    $scope.navMenuDatas[index].name=$scope.navMenuEditInfo.name;
    //    $scope.navMenuDatas[index].link=$scope.navMenuEditInfo.link;
    //    $scope.navMenuDatas[index].date='2017-4-4';
    //    service.dialog.alert('编辑成功');
    //    $scope.navMenuShow=true;
    //};
    //$scope.navMenuAddSave=function(){
    //    $scope.imgSetAdd={};
    //    $scope.imgSetAdd.name=$scope.navMenuEditInfo.name;
    //    $scope.imgSetAdd.src=$scope.navMenuEditInfo.src;
    //    $scope.imgSetAdd.link=$scope.navMenuEditInfo.link;
    //    $scope.navMenuDatas=$scope.navMenuDatas.concat($scope.imgSetAdd);
    //    service.dialog.alert('添加成功');
    //    $scope.navMenuShow=true;
    //};

    $scope.expand=false;
    $scope.expandClick=function(index){
        $scope.navMenuDatas[index].expand=!$scope.navMenuDatas[index].expand;
    };
    //--------------------------------------------------

    // 交换数组元素
    var swapItems = function(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };

    // 上移
    $scope.upRecord = function(arr, $index) {
        if($index == 0) {
            return;
        }
        swapItems(arr, $index, $index - 1);
    };

    // 下移
    $scope.downRecord = function(arr, $index) {
        if($index == arr.length -1) {
            return;
        }
        swapItems(arr, $index, $index + 1);
    };

}]);