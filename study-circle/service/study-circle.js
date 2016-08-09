/**
 * 用于存放圈子相关的请求或方法
 */

module.factory('studyCircle', ['request', function(request) {
    var rUrl = DYCONFIG.studyCircle.rUrl || '/';
    return {
        //写圈子/回复/点赞
        //api: https://api.gdy.io/?tags=discuss/#w_gdy_io_dyf_dms_apiCreateDiscuss
        sendCircle: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: rUrl + 'usr/api/createDiscuss',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        
        //获取圈子列表
        //api: https://api.gdy.io/?tags=discuss/#w_gdy_io_dyf_dms_apiSearchDiscuss
        getCircleList: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: rUrl + 'pub/api/searchDiscuss',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        
        //获取圈子详情
        //api: https://api.gdy.io/?tags=discuss/#w_gdy_io_dyf_dms_apiGetDiscussCDetail
        getCircleDetail: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: rUrl + 'pub/api/getCDetail',
                params: params
            };

            return request(angular.extend(option, filter || {}));
        },
        
        //增加阅读数
        //api: https://api.gdy.io/?tags=discuss/#w_gdy_io_dyf_dms_apiAddDiscussReadCount
        setReadCount: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: rUrl + 'pub/api/statRead',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 获取指定对象发出的discuss
        //api: https://api.gdy.io/#w_gdy_io_dyf_dms_apiGetPersonDiscuss
        getPersonDiscuss : function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: rUrl + 'pub/api/personDiscuss',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 删除帖子/删除回复/取消点赞
        //api: https://api.gdy.io/#w_gdy_io_dyf_dms_apiRemoveDiscuss
        removeDiscuss : function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: rUrl + 'usr/api/delDiscuss',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 获取指定用户发出的回复或赞
        //api: https://api.gdy.io/#w_gdy_io_dyf_dms_apiGetPersonReply
        getPersonReply : function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: rUrl + 'pub/api/personReply',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        }
    };
}]);

module.run(['service', 'studyCircle', function(service, studyCircle) {
    service.expand('studyCircle', function() {
        return studyCircle;
    });
}]);
