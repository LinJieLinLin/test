/**
 * 用于存放考试相关的请求或方法
 */

module.factory('examReq', ['request', function(request) {
    var courseUrl = DYCONFIG.course.rUrl;
    return {
        /**
         * 列出练习或题组的标题、得分、作答等情况
         * @param params
         * @param filter
         * @returns {*}
         */
        getListGroup: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/listGroup',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 列出练习组信息或题组信息
         * @param params
         * @param filter
         * @returns {*}
         */
        getListItemL: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/listItemL',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 答题
         * @param params
         * @param filter
         * @returns {*}
         */
        answerPaper: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method:'POST',
                url:courseUrl+'usr/api/answer',
                params:params,
                option:{
                    loading:false
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 开始答题
         * @param params
         * @param filter
         * @returns {*}
         */
        startAnswer: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/startAnswer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 交卷
         * @param params
         * @param filter
         * @returns {*}
         */
        doneAnswer: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/doneAnswer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        //列出多个试卷、练习的结果
        //api: https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiListExam
        listExam: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listExam',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //公布练习或考试的成绩
        //api: https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiPublish
        publishAns: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/publish',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //批改试卷或练习
        //api: https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiCorrect
        correctPaper: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/correct',
                params: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            return request(angular.extend(option, filter || {}));
        },

        //点评某个学生的作答
        //api: https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiUpdateReviews
        updateReview: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/updateReviews',
                params: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            return request(angular.extend(option, filter || {}));
        },


        //列出课程的试卷或考试
        //api: https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiListRef_es
        listCourseRef: function(params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/listRef',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },


        //----------------------编辑试卷----------------------
        /**
         * 创建试卷
         * https://api.gdy.io/#w_gdy_io_dyf_wcms_artapiCreateArticle
         * @param params
         * @param filter
         * @returns {*}
         */
        createPaper: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'art/api/create',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 插入/更新考试
         * https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpsertTest
         * @param data
         * @param filter
         * @returns {*}
         */
        insertTest: function (data, filter) {
            data.params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/upsertTest',
                params: data.params,
                data: data.data
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取考试信息系
         * https://api.gdy.io/#w_gdy_io_dyf_course_courseapiLoadTest
         * @param params
         * @param filter
         */
        loadTest: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/loadTest',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        }


    };
}]);

module.run(['service', 'examReq', function(service, examReq) {
    service.expand('examReq', function() {
        return examReq;
    });
}]);
