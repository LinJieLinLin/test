module.directive('uploadImgBase', function() {
    return {
        template:'<div id="upload-img-{{uploadConfig.id}}" ng-show="uploadConfig.showEdit"><div class="cropper-tool imgCropTool" ng-show="uploadConfig.mode===\'fixed\'"><div class="cropper-tool-a"><div class="cropper-tool-b"><div class="up-header jf-drag"><div class="f-l">上传图片</div><div class="f-r"><a ng-click="cancelImg()" href="" class="close-panel">×</a></div><div class="clear"></div></div><div class="up-body"><div class="show-tool f-l"><div class="cropper-img-fixed" ng-style="containerStyle"><img ng-src="{{newImg}}" alt="Picture" src=""></div><div id="img-view-{{uploadConfig.id}}" style="display:none" class="img-view"></div></div><div class="show-line"></div><div class="show-pre f-l"><div class="pd-20"><span class="name-img">预览：</span><div class="img-preview"></div></div></div><div class="clear"></div><div id="img-show-cover" class="loading" ng-show="upLoading"><div class="cover-img" style=""><img alt="loading..." src="../../rcp-common/imgs/loading1.gif" class="mg-r10"> 上传中...</div></div></div><div class="up-footer"><div class="btn-grp"><a ng-click="confirmImg()" class="confirm mg-r10">上传</a> <a ng-click="cancelImg()" class="cancel mg-l10">取消</a></div></div></div></div></div><div class="imgCropTool img-crop-tool" ng-show="uploadConfig.mode===\'course\'"><div ng-show="upLoading" class="loading-cover"><div class="cover-img"><img src="../../rcp-common/imgs/loading1.gif" class="mg-r10">上传中...</div></div><table><tr><td class="show-tool"><div class="cropper-img-course"><img ng-src="{{newImg}}" alt="Picture" src=""></div><div id="img-view-{{uploadConfig.id}}" style="display:none"></div></td><td class="show-pre"><span class="name-img">封面预览：</span><div class="img-preview"></div><div class="btn-grp"><a ng-click="confirmImg()" class="confirm">上传</a> <a ng-click="cancelImg()" class="cancel">取消</a></div></td></tr></table></div><input type="file" id="upload-input-{{uploadConfig.id}}" style="display:none"></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            uploadConfig: '='
        },
        controller: ['$scope', '$timeout', '$http', 'service', function($scope, $timeout, $http, service) {
            //uploadConfig：
            // $scope.uploadConfig = {
            //     showEdit: false,  //显示编辑模式
            //     uploadNum: 0,     //上传图片位置
            //     upCancel: false,  //是否取消上传
            //  *  id: '123',        //上传input ID
            //  *  mode: 'fixed',    //组件样式： 'fixed': 浮动弹窗   , 'course': 创建课程封面
            //     ratio: [16,9],    //裁剪比例   默认   16 / 9
            //     width: 550,       //裁剪宽度,单位px   默认   550px
            //     containerStyle:   //参见框样式      {width: '300px', height: '300px'},
            //     scope: {},        //返回$scope
            //     cb: function() {}
            // }
            //------------------------------------------------------------------------------------------------------------

            $scope.uploadConfig.scope = $scope;
            $scope.uploadConfig.aspectRatio = $scope.uploadConfig.ratio ? $scope.uploadConfig.ratio[0] / $scope.uploadConfig.ratio[1] : (16 / 9);
            $scope.containerStyle = $scope.uploadConfig.containerStyle || { width: '300px', height: '300px' };

            /**
             * 初始化
             */
            $scope.init = function() {

                //上传input
                var uploadImg = $('#upload-img-' + $scope.uploadConfig.id);
                var uploadInput = $('#upload-input-' + $scope.uploadConfig.id);
                var imgView = $('#img-view-' + $scope.uploadConfig.id);


                //显示隐藏Loading
                $scope.upLoading = false;
                //封面默认图
                $scope.newImg = '';
                /**
                 * [selectImg 选择要上传的图片]
                 * @return {[type]} [description]
                 */
                $scope.selectImg = function() {
                    uploadInput.trigger('click');
                };

                //确认上传图片
                $scope.confirmImg = function() {
                    if ($scope.upLoading === true) {
                        return;
                    }
                    var result = imgCropper.cropper('getCroppedCanvas', {
                        width: $scope.uploadConfig.width || 550,
                        style: 'display:none',
                        fillColor: '#FFFFFF'
                    });

                    result.id = 'canvas' + $scope.uploadConfig.id;
                    result.display = false;
                    imgView.html(result);
                    imgCropper.on({
                        'zoom.cropper': function(e) {

                        }
                    });
                    $timeout(function() {
                        var code = $('#canvas' + $scope.uploadConfig.id)[0].toDataURL('img/png');
                        var arr = code.split(',');
                        if (arr.length !== 2) {
                            service.dialog.alert('图片转换失败，请重试');
                            return;
                        }
                        $scope.upLoading = true;
                        $scope.uploadBasePic({
                            baseCode: arr[1]
                        });
                    });
                };

                //取消上传图片
                $scope.cancelImg = function() {
                    $scope.upLoading = false;
                    if (uploadImg.get(0).style.display === "block") {
                        uploadImg.get(0).off();
                    }
                    $scope.uploadConfig.upCancel = true;
                    $scope.uploadConfig.showEdit = false;

                };

                //base64图片上传
                $scope.uploadBasePic = function(args) {
                    var postData = {
                        m: args.m || 'C',
                        pub: args.pub || '1',
                        picType: args.picType || '1',
                        fileName: args.fileName || '1.png',
                        name: args.fileName || '1.png',
                        base64: 1,
                        token: rcpAid.getToken()
                    };
                    $http({
                        method: 'POST',
                        url: DYCONFIG.fs.upload + '?' + $.param(postData),
                        data: args.baseCode || '',
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).success(function(rs) {
                        $scope.upLoading = false;
                        $scope.uploadConfig.showEdit = false;

                        if (rs.code === 0) {
                            if (uploadImg.get(0).style.display === "block") {
                                uploadImg.get(0).off();
                            }
                            $scope.uploadConfig.cb(rs.data);
                        } else {
                            service.dialog.alert(rs.msg);
                        }

                    }).error(function(data) {
                        $scope.upLoading = false;
                        $scope.uploadConfig.showEdit = false;

                        console.log(data);
                    });
                };



                //切割组件功能初始化
                var imgCropper = $('.cropper-img-' + $scope.uploadConfig.mode + ' > img');
                imgCropper.cropper({
                    aspectRatio: $scope.uploadConfig.aspectRatio,
                    autoCropArea: 0.85,
                    preview: '.img-preview',
                    strict: false,
                    guides: true,
                    highlight: true,
                    dragCrop: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true
                });
                //切割组件运行
                var imgCropCtrl = {
                    URL: window.URL || window.webkitURL,
                    blobURL: null,
                    inputImage: uploadInput
                };
                imgCropCtrl.inputImage.change(function() {

                    var files = this.files;
                    var file;
                    if (!imgCropper.data('cropper')) {
                        return;
                    }
                    if (files && files.length) {
                        console.log('step1')
                        file = files[0];
                        if (/^image\/\w+$/.test(file.type)) {

                            $scope.uploadConfig.showEdit = true;
                            // $timeout(function () {
                            // });

                            imgCropCtrl.blobURL = imgCropCtrl.URL.createObjectURL(file);
                            imgCropper.one('built.cropper', function() {
                                imgCropCtrl.URL.revokeObjectURL(imgCropCtrl.blobURL); // Revoke when load complete
                            }).cropper('reset').cropper('replace', imgCropCtrl.blobURL);
                            imgCropCtrl.inputImage.val('');
                            $scope.$apply();
                        } else {
                            service.dialog.alert('只支持以下格式图片上传：png,jpg,bmp,gif,jpeg。');
                            imgCropCtrl.blobURL = imgCropCtrl.URL.createObjectURL(file);
                            imgCropCtrl.inputImage.val('');
                        }
                    }
                });
            };


            $timeout(function() {
                $scope.init();
            })

        }]
    };
});
