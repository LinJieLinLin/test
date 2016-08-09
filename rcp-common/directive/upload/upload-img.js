/* global uer */

window.isUploadFinish = function() {
    for (var i = 0; i < uer.files.length; i++) {
        if (uer.files[i].Status !== 'L' && uer.files[i].Status !== 'E' && uer.files[i].Status !== 'A') {
            return false;
        }
    }
    return true;
};

angular.module('RCP').directive('uploadImg', function() {
    return {
        restrict: 'AE',
        scope: {
            selectFile: '=',
            upload: '=',
            onProcess: '=',
            onSuccess: '=',
            onErr: '='
        },
        template: '<input ng-show="isIe9==false" style="display:none;" type="file" multiple id="uploader-{{id}}" />' +
            '<style type="text/css">.swf-up{position: absolute;top: 0;opacity: 0;filter:alpha(opacity=0);}.swf-up-71 {position: absolute;left: -71px;opacity: 0;filter:alpha(opacity=0);}.swf-up-35 {position: absolute;left: 35px;top: 0;opacity: 0;filter:alpha(opacity=0);} </style>' +
            '<div ng-show="isIe9==true" id="swfUploader-{{id}}">' +
            '<a href="http://www.adobe.com/go/getflashplayer" ng-show="showMsg" style="background-color: #fff;opacity: 1;filter:alpha(opacity=1);">请先安装FLASH播放器！</a>',
        controller: ['$scope', '$timeout', 'service', function($scope, $timeout, service) {
            /**
             * 上传资源
             */
            var uer = new jswf.Uer(DYCONFIG.fs.upload, {
                m: "C",
                pub: 1,
                token: rcpAid.getToken()
            }, true);

            if (!angular.isObject($scope.upload)) {
                $scope.upload = {};
            }
            $scope.upload.status = 'wait';
            $scope.upload.rate = 0;
            $scope.upload.speed = 0;
            $scope.upload.file = [];
            $scope.upload.img = [];
            $scope.upload.num = 0;
            $scope.upload.max = $scope.upload.max || 6;

            $scope.isIe9 = false;
            if (isIE(9, 9)) {
                $scope.isIe9 = true;
                $timeout(function() {
                    $scope.showMsg = true;
                    SwfUpload('swfUploader-' + $scope.id, $scope, 'swfUpCb');
                }, 1000);
            }
            $scope.id = new Date().getTime();

            $scope.swfUpCb = function(opt, rs) {
                if (rs.code === 0) {
                    try {
                        var len = $scope.upload.max;
                        if (len < $scope.upload.img.length + 1) {
                            service.dialog.alert('最多只能添加' + len + '张图片！');
                            return false;
                        }
                        $scope.upload.img.push(rs.data);
                        $scope.$apply();
                    } catch (e) {}
                }
            };
            $scope.selectFile = function() {
                setTimeout(function() {
                    if ($scope.isIe9) {
                        $('#swfUploader-' + $scope.id).trigger('click');
                        return;
                    } else {
                        $('#uploader-' + $scope.id).trigger('click');
                    }
                }, 100);
                uer.AddI('uploader-' + $scope.id, {}, {});
                uer.OnProcess = function(f, rate, speed) {
                    $scope.upload.rate = rate;
                    $scope.upload.speed = speed;
                    $scope.upload.file = f;
                    if ($scope.onProcess && typeof $scope.onProcess == 'function') {
                        $scope.onProcess(f);
                    }
                    try {
                        $scope.$apply();
                    } catch (e) {}
                };
                uer.OnSuccess = function(f, data) {
                    if (!(--$scope.upload.num)) {
                        console.log('up success');
                        $scope.upload.status = 'success';
                    }
                    $scope.upload.rate = 0;
                    $scope.upload.speed = 0;
                    $scope.upload.file = f;
                    $scope.upload.img.push(data.data);
                    rcpAid.clearFile('uploader-' + $scope.id);
                    if ($scope.onSuccess && typeof $scope.onSuccess == 'function') {
                        $scope.onSuccess(f);
                    }
                    try {
                        $scope.$apply();
                    } catch (e) {}
                };
                uer.OnErr = function() {
                    if (!(--$scope.upload.num)) {
                        console.log('up error');
                        $scope.upload.status = 'error';
                    }
                    $scope.upload.rate = 0;
                    $scope.upload.speed = 0;
                    if ($scope.onErr && typeof $scope.onErr == 'function') {
                        $scope.onErr();
                    }
                    try {
                        $scope.$apply();
                    } catch (e) {}
                };
            };
            uer.OnSelect = function(item) {
                var flag = filter(item);
                if (flag.length) {
                    $scope.upload.status = 'uploading';
                }
                $scope.upload.num = flag.length;
                return flag;
            };

            var picArr = ['png', 'jpg', 'bmp', 'gif', 'jpeg'];

            var filter = function(item) {
                var flag = true;
                var i = 0;
                angular.forEach(item.files, function(file) {
                    var fileExt = file.name.split('.').pop().toLowerCase();
                    if ($.inArray(fileExt, picArr) === -1) {
                        service.dialog.alert('只支持以下格式图片上传：png,jpg,bmp,gif,jpeg。');
                        flag = false;
                        rcpAid.clearFile('uploader-' + $scope.id);
                    }
                    i++;
                });
                if ($scope.upload.max < i + $scope.upload.img.length) {
                    flag = false;
                    service.dialog.alert('最多只能上传' + $scope.upload.max + '张图片！');
                }
                return flag ? item.files : [];
            };
        }]
    };
});
