/**
 * Created by Zhongj on 2016/6/19.
 * 模块说明：用于请求成绩管理后台接口的方法
 */
module.factory('scoremanager', ['request', function (request) {
    var courseUrl = DYCONFIG.course.rUrl;
    return {
        /*
         * 请求成绩列表
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListScore
         * param: request data (json),token,cid,page,pageCount,query
         * author:zhongj
         * */
        getScoreList: function (argParams, argFilter) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option = {
                method:'GET',
                url: courseUrl+ 'usr/api/listScore',
                params:argParams
            };
            return request(angular.extend(option,argFilter || {}));
        },

        /*
         * 保存已录入的学生成绩
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreForm
         * api params:token,[{"cid":"","uid":"","update":{"平时成绩":0,"考试成绩":0}}]
         * author:zhongj
         * */
        saveEtyStuScore: function (argParams, argData, argFilter) {
            if(angular.isUndefined(argParams)){
                return;
            }
            if(angular.isUndefined(argData)){
                return;
            }
            var option = {
                method:'POST',
                url: courseUrl+ 'usr/api/updateScoreForm',
                params:argParams,
                data:argData
            };
            return request(angular.extend(option,argFilter || {}));
        },

        /*
         * 提交已录入的学生成绩，公布学生总成绩
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCommitScoreForm
         * api params:token,cid(course id)
         * author:zhongj
         * */
        submitEtyStuScore: function (argParams, argFilter) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option = {
                method:'GET',
                url: courseUrl+ 'usr/api/commitScoreForm',
                params:argParams
            };
            return request(angular.extend(option,argFilter || {}));
        }
    };
}]);

module.run(['service', 'scoremanager', function (service, scoremanager) {
    service.expand('scoremanager', function () {
        return scoremanager;
    });
}]);