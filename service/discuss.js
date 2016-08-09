/**
 * Created by LouGaZen on 2016-05-20.
 * 用于存放吐槽页相关的请求方法
 */

module.factory('discussMethod',['request', function (request) {
    var dmsUrl = g_conf.studyCircle.rUrl;
    return{

        //搜索帖子 api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiSearchDiscuss
        SearchDiscuss: function (arg_data, arg_filter) {
            var option = {
                method: 'POST',
                url: dmsUrl + 'pub/api/searchDiscuss',
                data: arg_data
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        // 获取指定对象发出的discuss api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiGetPersonDiscuss
        GetPersonDiscuss: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: dmsUrl + 'pub/api/personDiscuss',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //获取评论形式帖子详情(WEB) api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiGetDiscussCDetail
        GetDiscussCDetail: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: dmsUrl + 'pub/api/getCDetail',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //创建帖子/回复帖子/点赞 api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiCreateDiscuss
        CreateDiscuss: function (arg_data, arg_filter) {
            var option = {
                method: 'POST',
                url: dmsUrl + 'usr/api/createDiscuss',
                params: {
                    token: rcpAid.getToken()
                },
                data: arg_data
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //增加帖子阅读数 api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiAddDiscussReadCount
        AddDiscussReadCount: function (arg_params, arg_filter) {
            var option = {
                method: 'GET',
                url: dmsUrl + 'pub/api/statRead',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //我要吐槽首页常见问题 api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiSuggestPage
        SuggestPage: function (arg_params, arg_filter) {
            var option = {
                method: 'GET',
                url: dmsUrl + 'pub/api/suggestPage',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //删除帖子/删除回复/取消点赞 api->https://api.gdy.io/#w_gdy_io_dyf_dms_apiRemoveDiscuss
        RemoveDiscuss: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: dmsUrl + 'usr/api/delDiscuss',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        }
    }
}]).run(['service', 'discussMethod', function (service, discussMethod) {
    service.expand('discussMethod', function () {
        return discussMethod;
    });
}]);