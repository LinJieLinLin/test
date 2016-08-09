/**
 * Created by Fox2081 on 2015/11/10.
 */
module.factory("contentService", ['$resource', '$http', '$q', function($resource, $http, $q) {
    var URL_FSRV = DYCONFIG.fs.rUrl;
    // var URL_FSRV = g_conf.rcp_srv;

    return {
        request: function(option) {
            return $http(option).then(function(response) {
                var defer = $q.defer();
                if (angular.isUndefined(response.data.code)) {
                    defer.reject({
                        type: -1,
                        data: response
                    });
                } else if (response.data.code !== 0) {
                    defer.reject({
                        type: 1,
                        data: response
                    });
                } else {
                    defer.resolve(response.data);
                }
                return defer.promise;
            }, function(err) {
                throw {
                    type: -1,
                    data: err
                };
            });
        },
        //接口信息
        GetFileDetail: $resource(URL_FSRV + '/srv/api/fileDetail'),
        GetFileToken: $resource(URL_FSRV + 'usr/api/fileDetail'),
        GetFileFid: $resource(URL_FSRV + 'pub/api/listInfo'),
        DownloadFile: $resource(URL_FSRV + '/srv/usr/api/dload'),


        itemType: {
            picArr: ["png", "jpg", "bmp", "gif", "jpeg", "PNG", "JPG", "BMP", "GIF", "JPEG"],
            videoArr: ["mp4", "flv", "avi"],
            docArr: ["doc", "docx", "pdf", "ppt", "xls", "xlsx", "pptx"],
            specialArr: ['swf'],
        },

        //Private
        GetValue: function(extObj, key) {
            for (var i = 0; i < extObj.length; i++) {
                if (extObj[i]["F_key"] == key) {
                    return extObj[i]["F_value"]
                }
            }
        },


        /**
         * flash和video便签组装
         * @param type
         * @param fid
         * @param item
         * @returns {string}
         */
        bindHtml: function(type, fid, item) {
            if (type === 'flash') {
                return '<embed src="' + this.transFlashUrl(fid) + '" id="embed-flash-' + item.id + '"' +
                    'wmode="Opaque"' +
                    'allowfullscreen="true"' +
                    'quality="high"' +
                    'width="800"' +
                    'height="450"' +
                    'align="middel"' +
                    'allowscriptaccess="always"' +
                    'type="application/x-shockwave-flash"' +
                    'per="100%">'
            }
            if (type === 'video') {
                return '<video id="video-main-' + item.id + '" ' +
                    'src="' + this.transFlashUrl(fid) + '"' +
                    'class="ckVideo" ' +
                    'style="background-color: #000000" ' +
                    'width="640"' +
                    'height="360" ' +
                    'per="100%" ' +
                    'preload="none"' +
                    'controls="controls"' +
                    '></video>'
            }
        },

        /**
         * 获取文件下载路径
         * @param fid
         * @returns {string}
         */
        transDownloadUrl: function(fid) {
            var token = rcpAid.getToken() || '';
            return URL_FSRV + 'usr/api/dload?fid=' + fid + '&dl=1' + '&token=' + token;
        },

        /**
         * 获取图片显示路径
         * @param fid
         * @returns {string}
         */
        transImgUrl: function(fid) {
            var token = rcpAid.getToken() || '';
            return URL_FSRV + 'usr/api/dload?fid=' + fid + '&dl=0' + '&token=' + token;
        },

        /**
         * 获取Flash显示路径
         * @param fid
         * @returns {string}
         */
        transFlashUrl: function(fid) {
            var token = rcpAid.getToken() || '';
            return URL_FSRV + 'usr/api/dload?fid=' + fid + '&dl=0' + '&token=' + token;
        },

        /**
         * 获取文件预览路径
         * @param fid
         * @returns {string}
         */
        transPreviewUrl: function(fid) {
            return URL_FSRV + 'viewPaperDemo.html?fileId=' + fid;
        },

        /**
         * 获取视频信息
         * @param item
         */
        getMediaInfo: function(item) {
            var file = item['File'];
            var exts = item['Exts'];

            var result = {
                status: "UNKNOWN",
                data: {},
                msg: "未知视频信息"
            };

            result.status = this.GetValue(exts, 'MEDIA_STATUS');
            switch (result.status) {
                //已完成
                case "N":
                    {
                        result.msg = this.GetValue(exts, 'MEDIA_MSG');
                        result.data.url = this.GetValue(exts, 'MEDIA_URL');
                        result.data.guid = this.GetValue(exts, 'MEDIA_GUID');
                        result.data.videoUrl = "http://" + result.data.url + "/" + result.data.guid + ".mp4";
                        result.data.imgUrl = [
                            this.GetValue(exts, 'MEDIA_PIC_URL') + result.data.guid + '.jpg',
                            this.GetValue(exts, 'MEDIA_PIC_URL') + result.data.guid + '_1.jpg',
                            this.GetValue(exts, 'MEDIA_PIC_URL') + result.data.guid + '_2.jpg',
                        ];
                        break;
                    }
                case "CONVERT": //转码中
                    {
                        result.msg = '视频转码中，请耐心等候';
                        break;
                    }
                case "FAIL":
                    {
                        result.msg = '视频转码失败，请删除后重新上传。';
                        break;
                    }
            }

            return result;
        },

        /**
         * 获取文件信息
         * @param item
         */
        getFileInfo: function(item) {
            var file = item['File'];
            var exts = item['Exts'];

            var result = {
                status: "UNKNOWN",
                data: {},
                msg: "未知文件信息"
            };

            result.status = this.GetValue(exts, 'STATUS');
            switch (result.status) {
                case "SUCCESS": //已完成
                    {
                        result.data.downUrl = this.transPreviewUrl(file.Tid);
                        break;
                    }
                case "CONVERT": //转码中
                    {
                        result.msg = '文件转码中，请耐心等候';
                        break;
                    }
                case "FAIL":
                    {
                        result.msg = '文件转码失败，请删除后重新上传。';
                        break;
                    }
            }

            return result;
        },

        /**
         * 根据文件后缀名判断进行的操作
         * @param ext
         * @returns {*}
         */
        getFileOperate: function(ext) {

            if ($.inArray(ext, this.itemType.picArr) != -1) {
                return 'show'; //直接显示
            } else if ($.inArray(ext, this.itemType.videoArr) != -1) {
                return 'meida'; //需要获取文件信息和转码信息
            } else if ($.inArray(ext, this.itemType.docArr) != -1) {
                return 'review'; //需要预览和下载，预览需要转码完成
            } else if ($.inArray(ext, this.itemType.specialArr) != -1) {
                return 'flash'; //flash
            } else {
                return 'download'; //直接下载
            }
        },


        /**
         * 是否获取文件转码信息
         * @param ext
         * @returns boolean
         */
        getFileExtOpt: function(ext) {
            return $.inArray(ext, this.itemType.docArr);
        },


        /**
         * 获取文件信息
         * @param cid   课程内容ID
         * @param mark  Array<string>
         * @returns  e.g. [{"owner":"12","mark":"123","fid":54559},{"owner":"12","mark":"1234","fid":54558}]
         */
        getFileFid: function(cid, mark) {
            var option = {
                method: 'GET',
                url: URL_FSRV + 'pub/api/listInfo',
                params: {
                    mark: mark.join(','),
                    mode: 'mark',
                    token: GetToken()
                }
            };
            return this.request(angular.extend(option, {}));
        },

        /**
         * 获取文件详情
         * @param fids
         * @param ftoken
         */
        getFileDetail: function(fids, ftoken) {
            var option = {
                method: 'GET',
                url: URL_FSRV + '/srv/api/fileDetail',
                params: {
                    fid: 1,
                    fileIds: fids,
                    ftoken: ftoken,
                    token: GetToken()
                }
            };
            return this.request(angular.extend(option, {}));
        },


        /**
         * 获取文件Token
         * @param fids
         * @returns {string:  [文件token]}
         */
        getFileToken: function(fids) {
            var option = {
                method: 'GET',
                url: URL_FSRV + 'usr/api/fileDetail',
                params: {
                    fid: 1,
                    fileIds: fids,
                    token: GetToken()
                }
            };
            return this.request(angular.extend(option, {}));
        }
    };
}]);
