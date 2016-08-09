var SWFUP = {
    nowScope: '',
    swfCb: '',
};

function SwfUpload(id, scope, cb, option) {
    SWFUP.nowScope = scope;
    SWFUP.swfCb = cb;
    var defaultOption = {
        session: document.cookie,
        isAutoUploadAfterSelect: false, //whether auto start upload after select file or not.
        fileMaxSize: 10240000, //the max file allow to be uploaded.
        fileMinSize: 10, //the min file allow to be uploaded.
        uploadUrl: DYCONFIG.fs.upload, //the upload server path.
        filePostName: 'file', //the file post name.
        language: 'ch', //the language of the information.
        selectErrorFunction: 'uploadErr', //the function that will be call when select error file.
        postVarsFun: 'postVal', //the function that will be call before upload.return the name/value you want to post ,split by '&'.
        returnDataType: 'json', //the return data type from server.
        completeCallBack: 'uploadSu', //the upload complete call back method.
        selectFile: 'selectFile', //the select file call back method.
        beforeSelectFile: 'upImg', //the before select file call back method.
        imageMaxWidth: 100000, //the image maximal width can be upload.
        imageMaxHeight: 100000, //the image maximal heigth can be upload.
        imageMinWidth: 1, //the image minimal width can be upload.
        imageMinHeight: 1, //the image minimal height can be upload.
        imageExts: ['.jpg', '.png', '.bmp', '.gif', '.jpeg'], //the image extension to check the width and height.
        multiFile: true, //whether can be upload multi-files.
        buttonWidth: '70',
        buttonHeight: '30',
        // callBackParam: {
        //     id: id
        // },
        id: id,
    };
    if(typeof option=='object'){
        defaultOption = $.extend(defaultOption, option);
    }
    var w = defaultOption.buttonWidth;
    var h = defaultOption.buttonHeight;
    defaultOption.buttonWidth = defaultOption.buttonWidth.replace('%','');
    defaultOption.buttonHeight = defaultOption.buttonHeight.replace('%','');
    swfobject.embedSWF(
        '/rcp-common/directive/upload/SingleFlashUploader.swf',
        id,
        w,
        h,
        '10.0.0',
        '/rcp-common/directive/upload/playerProductInstall.swf',
        defaultOption, {
            quality: 'high',
            bgcolor: 'transparent',
            allowscriptaccess: 'sameDomain',
            allowfullscreen: 'false',
            wmode: 'transparent',
        }, {
            id: id,
            name: id,
            align: 'middle'
        });
    swfobject.createCSS('#' + id + '', 'display:block;text-align:left;');
}
//上传失败
function uploadErr(err) {
    // console.log(err);
    jf.alert(err);
}
//选择后文件后
function selectFile(fv, f) {
    // console.log(f);
}
//上传成功
function uploadSu(opt, ob) {
    // console.log('up success');
    // console.log(opt);
    if (SWFUP.nowScope && SWFUP.swfCb && typeof SWFUP.nowScope[SWFUP.swfCb] == 'function') {
        SWFUP.nowScope[SWFUP.swfCb](opt, ob);
        SWFUP.nowScope.$digest();
    }
}
//上传参数
function postVal(args) {
    if (!args) {
        args = {};
    }
    var postData = {
        m: args.m || 'C',
        pub: args.pub || '1',
        picType: args.picType || '1',
        fileName: args.fileName || '1.png',
        token: rcpAid.getToken()
    };
    return $.param(postData);
}

function upImg(fv) {
    return [{
        'name': '图片',
        'extensions': '*.jpg;*.bmp;*.png,*.gif,*.jpeg'
    }];
}

function allFile(fv) {
    return [];
}
//upload process
function onSupProcess(argP) {
    // console.log(argP);
}
