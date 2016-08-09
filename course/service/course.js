/**
 * 用于存放课程相关的请求或方法
 */

module.factory('course', ['request', function (request) {
    var courseUrl = DYCONFIG.course.rUrl,
        appraiseUrl = DYCONFIG.appraise.rUrl,
        ssoUrl = DYCONFIG.sso.rUrl;
        extraUrl = DYCONFIG.extra.rUrl;
    return {
        /**
         * 获取课程详情 详见api：https://api.gdy.io/?tags=%E8%AF%BE%E7%A8%8B/#i0LoadCourse
         * @param params
         * @param filter
         * @returns {*}
         */
        getCourseDetail: function (params, filter) {
            params.token = rcpAid.getToken();
            if (filter && filter.noToken) {
                delete params.token;
            }
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/loadCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取与老师相关的课程
         * @param params    api: https://api.gdy.io/?tags=%E8%AF%BE%E7%A8%8B/#i0SearchCourse
         * @param filter
         * @returns {*}
         */
        getTeacherCourses: function (params, filter) {
            params.token = rcpAid.getToken();
            params.isSelf = params.isSelf || 1;
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/searchCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 加入免费课程 详见api：https://api.gdy.io/?tags=%E8%AF%BE%E7%A8%8B/#i0joinCourse
         * @param params
         * @param filter
         * @returns {*}
         */
        joinFreeCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/joinCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //搜索课程列表    详见api: https://api.gdy.io/#i1SearchCourse
        searchCourse: function (params, filter) {
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/searchCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //审核课程    详见api: https://api.gdy.io/#i1VerifyCourse
        verifyCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/verifyCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 创建课程
         * @param params    api:https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCreateCourse
         * @param filter
         * @param data
         * @returns {*}
         */
        createCourse: function (params, filter, data) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/createCourse',
                params: params,
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取学生课程
         * @param params    api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiSearchCourse
         * @param filter
         * @returns {*}
         */
        getStudentCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            params.isSelf = 10;
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/searchCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 发布课程
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiReleaseCourse
         * @param params  cid    [必选]    课程id
         * @param filter
         * @returns {*}
         */
        releaseCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/releaseCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 创建新课程
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateCourse
         * @param data
         * @param filter
         * @returns {*}
         */
        saveCourseData: function (data, filter) {
            var params = {};
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/updateCourse',
                params: params,
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 下架课程
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCancelCourse
         * @param params cid 课程id
         * @param filter
         * @returns {*}
         */
        cancelCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/cancelCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 列出练习或题组的标题、得分、作答等情况
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListGroup
         * @param params
         * @param filter
         * @returns {*}
         */
        getListGroup: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/listGroup',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取全部TAGS
         * api: https://api.gdy.io/#w_gdy_io_dyf_pes_pesapiGetPage
         * @param params
         * @param filter
         * @returns {*}
         */
        getAllTags: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: DYCONFIG.pes.rUrl + 'pub/api/page/GetPage?keys=[{"key":"p_classifi"}]',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 更新试卷额外信息
         * api: https://api.gdy.io/#w_gdy_io_dyf_wcms_artapiUpdateExt
         * @param params
         * @param filter
         * @returns {*}
         */
        updateArticleExt: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/updateExt',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取Article额外信息
         * api: https://api.gdy.io/#w_gdy_io_dyf_wcms_artapiUpdateExt
         * @param params
         * @param filter
         * @returns {*}
         */
        getArticleExt: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/listArtExt',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 评价统计信息  https://api.gdy.io/#w_gdy_io_dyf_appraise_appapiCountScores
        countScores: function (params, filter) {
            var option = {
                method: 'GET',
                url: appraiseUrl + 'pub/api/countScores',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 发表评论  https://api.gdy.io/#w_gdy_io_dyf_appraise_appapiPublishComment
        publishComment: function (data, filter) {
            var params = {};
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: appraiseUrl + 'usr/api/publishComment',
                params: params,
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        // 更改评论  https://api.gdy.io/#w_gdy_io_dyf_appraise_appapiUpdateComment
        updateComment: function (data, filter) {
            var params = {};
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: appraiseUrl + 'usr/api/updateComment',
                params: params,
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        // 查找评论  https://api.gdy.io/#w_gdy_io_dyf_appraise_appapiUpdateComment
        searchComment : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: appraiseUrl + 'usr/api/searchComment',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 加载评论  https://api.gdy.io/#w_gdy_io_dyf_appraise_appapiLoadComment
        loadComment: function (params, filter) {
            params.token = rcpAid.getToken();
            var option  ={
                method: 'GET',
                url: appraiseUrl + 'pub/api/loadComment',
                params: params
            }
            return request(angular.extend(option, filter || {}));
        },

        //学习痕迹页面    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiLoadRecord
        loadRecord: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/loadRecord',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //列出试卷批改列表->https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListPaperCorrect
        listPaperCorrect: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listPaperCorrect',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //公布成绩->https://api.gdy.io/#w_gdy_io_dyf_wcms_esapiPublish
        Publish: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/publish',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //列出转让课程历史    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListTransfer
        listTransfer: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listTransfer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //转让详情加载课程    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiLoadTransferCourse
        loadTransferCourse: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/loadTransferCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //转让课程    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiPublishTransfer
        publishTransfer: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/publishTransfer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //同意转让课程，接收课程    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiPublishTransfer
        agreeTransfer: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/agreeTransfer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //拒绝接收转让课程，接收课程    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiRefuseTransfer
        refuseTransfer: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/refuseTransfer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //取消转让课程    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCancelTransfer
        cancelTransfer: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/cancelTransfer',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //列出管理员列表    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListAdmin
        listCourseAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //移除管理员    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiRemoveAdmin
        removeAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/removeAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //邀请管理员    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiInvateAdmin
        invateAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/invateAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //更新管理员权限    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiManageAdmin
        manageAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/manageAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //退出团队    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiQuitTeam
        quitTeam: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/quitTeam',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 课程添加管理员（新建用户）    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiAddUser
        addAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/addUser',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //申请课程认证 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiApplyAuth
        applyAuth: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method:'GET',
                url: courseUrl + 'usr/api/applyAuth',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //审核课程认证 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCommitAuth
        commitAuth: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/commitAuth',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //列出请求课程认证列表 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListAuth
        listAuth: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listAuth',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //列出机构 => api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiListOrgs
        listOrgs: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/listOrgs',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //退出课程 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiQuitCourse
        quitCourse : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/quitCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //检测用户帐号是否已存在 => api: https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_ssoExist
        userExist : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'sso/api/exist',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //加载课程参与条件 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiLoadRole
        loadRole: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'pub/api/loadRole',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //更新课程参与条件 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateRole
        updateRole: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/updateRole',
                params: arg_params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //列出课程提交审核信息 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListCourseForm
        listCourseForm: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listCourseForm',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //审核学生审核信息 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiVerifyForm
        verifyForm: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/verifyForm',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
        },

        //提交审核信息 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpsertForm
        upsertForm : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'POST',
                url: courseUrl + 'usr/api/upsertForm',
                params: params
            };console.log(angular.extend(option, filter || {}));
            return request(angular.extend(option, filter || {}));
        },

        //记录信息或者修改记录的信息 => api: https://api.gdy.io/#w_gdy_io_dyf_extra_extraapiUpsertStore
        //文件预览记录key:用户ID+课程ID+文件MARk组成，val为当前查看页数
        upsertStore: function (arg_params, arg_filter) {
            arg_params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: extraUrl + 'usr/api/upsertStore',
                params: arg_params
            };
            return request(angular.extend(option, arg_filter || {}));
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

        //取消邀请管理员 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCancelAdmin
        cancelAdmin : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/cancelAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        /*
         * 请求成绩列表
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListScore
         * param: argParams：token,cid,page,pageCount,query；argType：执行方法，正式运行offRun，测试类型test
         * request data (json)
         * author:zhongj
         * */
        getScoreList: function (argParams,argType) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option;
            if(argType == 'offRun'){
                console.log("argParams = ",argParams);
                option = {
                    method:'GET',
                    url: courseUrl+ 'usr/api/listScore',
                    params:argParams
                };
            }else {
                option = {
                    method:'GET',
                    url: 'module/score-manager/listScore.json'
                };
            }
            return request(angular.extend(option));
        },

        /*
         * 保存已录入的学生成绩
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreForm
         * api params:token,[{"cid":"","uid":"","update":{"平时成绩":0,"考试成绩":0}}]
         * author:zhongj
         * */
        saveEtyStuScore: function (argParams, argData) {
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
            return request(angular.extend(option));
        },

        /*
         * 提交已录入的学生成绩，公布学生总成绩
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiCommitScoreForm
         * api params:token,cid(course id),tuids:单选或多选的用户id，commitTotal：传1提交课程下的所有学生；
         * mode：无论是否填充完整,都提交成绩,传-1,不传默认为有未编辑完成绩的学生会提示个数,不用提交
         * author:zhongj
         * */
        submitEtyStuScore: function (argParams) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option = {
                method:'GET',
                url: courseUrl+ 'usr/api/commitScoreForm',
                params:argParams
            };
            return request(angular.extend(option));
        },

        /*
         * 获得课程下的评测（练习和考试）
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListRef
         * api params:token、cids（多个课程id用逗号隔开），其他参数看接口
         * 返回的data参数说明：
         *  ainfo对象存储的是试卷信息，以aid（试卷id）作为key来区分不同试卷下的详细信息
         *  course数组，表示请求获取评测（试卷、考试、练习）的课程列表
         *  einfo存放请求接口获取评测的错误信息【暂未开放使用】
         *  iteml存储的是请求的课程下的所有评测，以课程id作为key，表示某个课程下的所有评测，以数组形式存储，每一个评测以对象形式存储，具体格式如下：
         *      beg表示该某一个或多个评测所在的章节位置
         *      count表示该章节下所拥有的评测共多少个
         *      items是数组，存放该章节下的评测列表，每一个评测以对象形式存储，如下所示：
         *          c存放该评测的信息
         *              type类型:e_paper（试卷）、e_e_exercise(练习)、e_test(考试)
         *              title：试卷名称
         *              aid：试卷id
         *              tid：考试id
         *          i表示这一个评测存放的章节下的具体位置
         *          g表示可以使用这个评测的用户组
         *          t表示评测类别：e_es(试卷/考试/练习)、e_text(简答题)、e_fill(填空题)、e_sel(单选题、多选、判断题)
         *  tinfo存储的是考试信息，以tid（考试id）为key，存储某场考试的详细信息
         * function params:argParams请求参数，argType执行类型：offRun是正常执行，test：测试
         * author:zhongj
         * date：2016/6/25
         * */
        lstCourseEvaluation: function (argParams,argType) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option;
            if(argType == "offRun"){
                option = {
                    method:'GET',
                    url: courseUrl+ 'pub/api/listRef',
                    params:argParams
                };
            }else {
                option = {
                    method:'GET',
                    url: 'module/score-manager/listRef.json'
                };
            }
            return request(angular.extend(option));
        },

        /*
         * 保存设置的课程成绩来源和权重
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiUpdateScoreWeight
         * api params:token、cid，其他参数看接口
         * author:zhongj
         * date：2016/6/27
         * */
        saveCurScoreWeight: function (argParams) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option = {
                method:'GET',
                url: courseUrl+ 'usr/api/updateScoreWeight',
                params:argParams
            };
            return request(angular.extend(option));
        },

        /*
         * 导出成绩
         * api:https://api.gdy.io/#w_gdy_io_dyf_course_courseapiExportScore
         * api params:token、cid:课程id；page：页码；pageCount：当前页容量；query：查询关键词
         * author:zhongj
         * date：2016/6/29
         * */
        exportScore: function (argParams) {
            if(angular.isUndefined(argParams)){
                return;
            }
            return courseUrl+ 'usr/api/exportScore?token='+argParams.token+"&cid="+argParams.cid+"&pageCount="+argParams.pageCount+"&host="+argParams.host;
        },

        /*
         * 清空成绩
         * api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiClearScore
         * api params:token、cid;课程id；clearTotal：传1清空课程下所有成绩；keys：清空指定列；tuids：uid的组合，
         * 用逗号隔开，如uid1,,uid2,uid3清空单个或多个学生成绩
         * author:zhongj
         * date：2016/6/30
         * */
        clearScore: function (argParams) {
            if(angular.isUndefined(argParams)){
                return;
            }
            var option = {
                method:'GET',
                url: courseUrl+ 'usr/api/clearScore',
                params:argParams
            };
            return request(angular.extend(option));
        },

        // 删除课程 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiDelCourse
        deleteCourse : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/delCourse',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 列出IM历史消息 => api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListRecord
        listRecord  : function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listRecord',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //确认管理员邀请    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiSubmitAdmin
        submitAdmin: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/submitAdmin',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //列出关于个人被邀请管理员状态列表    详见api: https://api.gdy.io/#w_gdy_io_dyf_course_courseapiListAdminInvate
        listAdminInvate: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: courseUrl + 'usr/api/listAdminInvate',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
    };
}]);

module.run(['service', 'course', function (service, course) {
    service.expand('course', function () {
        return course;
    });
}]);
