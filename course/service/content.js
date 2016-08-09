module.factory('courseContent', ['request', function(request) {

    var fsUrl = DYCONFIG.fs;
    /*    
     rUrl: srvList.fs,
     upload: srvList.fs + 'usr/api/uload',
     down: srvList.fs + 'usr/api/dload',
     info: srvList.fs + 'pub/api/info',
     listInfo: srvList.fs + 'pub/api/listInfo',
     */

    return {
        /**
         * 获取文件下载路径
         * @param id
         * @returns {string}
         */
        transDownloadUrl: function(id) {
            return fsUrl.down + '?mark=' + id + '&dl=1' + '&token=' + rcpAid.getToken();
        },

        /**
         * 获取图片显示路径
         * @param id
         * @returns {string}
         */
        transImgUrl: function(id) {
            return fsUrl.down + '?mark=' + id + '&token=' + rcpAid.getToken();
        },

        /**
         * 获取视频路径
         * @param id
         * @returns {string}
         */
        transVideoUrl: function(id) {
            return fsUrl.down + '?mark=' + id + '&type=V_pc&token=' + rcpAid.getToken();
        },

        /**
         * 获取Flash路径
         * @param id
         * @returns {string}
         */
        transFlashUrl: function(id) {
            return fsUrl.down + '?mark=' + id + '&token=' + rcpAid.getToken();
        },


        /**
         * 获取文件预览页面
         * @param mark
         * @param ext
         * @param info
         * @returns {string}
         */
        transPreviewUrl: function(mark, ext, info) {
            try {
                return '/course/document-preview.html?mark=' + mark + '&type=' + this.convertExt.transExecType[ext] + '&count=' + info[this.convertExt.transExecType[ext]].count;
            } catch (e) { console.log(e); }
        },
        /**
         * 获取移动端文件预览路径
         * @param  {[type]} fid [description]
         * @return {[type]}     [description]
         */
        transPhoneViewUrl: function(mark, ext, info) {
            try {
                var re = { url: '', count: 0 };
                re.url = fsUrl.down + '?mark=' + mark + '&type=' + this.convertExt.transExecType[ext] + '&token=' + rcpAid.getToken() + '&idx=';
                re.count = info[this.convertExt.transExecType[ext]].count;
                return re;
            } catch (e) {
                console.log(e);
                return {};
            }
        },



        //需要转码的文件
        convertExt: {
            video: ['wmv', 'rm', 'rmvb', 'mpg', 'mpeg', 'mpe', '3gp', 'mov', 'mp4', 'm4v', 'avi', 'mkv', 'flv', 'vob'],
            attach: ["doc", "docx", "pdf", "ppt", "pptx"],
            transExecType: {
                'doc': "D_docx",
                'docx': "D_docx",
                'ppt': "D_pptx",
                'pptx': "D_pptx",
                'pdf': "D_pdfx"
            }
        },




        //--------------------------------------------------------------------------------------------------------------



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
                    'per="100%">';
            }
            if (type === 'video') {
                return '<video id="video-main-' + item.id + '" ' +
                    'src="' + this.transVideoUrl(fid) + '"' +
                    'class="ckVideo" ' +
                    'style="background-color: #000000" ' +
                    'width="640"' +
                    'height="360" ' +
                    'per="100%" ' +
                    'preload="none"' +
                    'controls="controls"' +
                    '></video>';
            }
        },


        //--------------------------------------------------------------------------------------------------------------

        /**
         * 获取文件详情(单个)
         * @param params
         * @param filter
         */
        getFileInfo: function(params, filter) {
            var option = {};
            if (typeof(params) === 'string') {
                option = {
                    method: 'GET',
                    url: fsUrl.info,
                    params: {
                        mark: params,
                        mode: 'mark'
                    }
                };
            } else {
                option = {
                    method: 'GET',
                    url: fsUrl.listInfo,
                    params: {
                        mark: params.join(','),
                        mode: 'mark',
                    }
                };
            }
            return request(angular.extend(option, filter || {}));
        },
        
        //获取记录的信息 => api: https://api.gdy.io/#w_gdy_io_dyf_extra_extraapiListStore
        listStore: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: extraUrl + 'usr/api/listStore',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },
    };

}]);
module.run(['service', 'courseContent', function(service, courseContent) {
    service.expand('courseContent', function() {
        return courseContent;
    });
}]);
