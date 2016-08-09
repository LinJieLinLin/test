//
module.factory('appraiseService', ['service', 'course', function (service, course) {

    // 服务器返回评价等级对应关系
    var gradeTypes = [
        // 赞
        '1',
        // 一般
        '2',
        // 踩
        '3'
    ];

    var errorTipper = service.dialog.getErrorTipper({moduleName: '评价服务'});

    function getBasicUserComment() {
        return {
            // 评价id
            id: '',
            // 评价内容id (第一个)
            cid: '',
            // 评价文本内容
            text: '',
            // 评价等级 0(赞) 1(一般) 2(踩)
            grade: -1,
            valid: false
        }
    }

    function getBasicGrade() {
        var o = {};
        var l = gradeTypes.length;
        for (var i = 0; i < l; ++i) {
            o[i] = 0;
        }
        return o;
    }

    function getBasicTargetComment() {
        return {
            total: 0,
            grades: getBasicGrade(),
            gradesPercent: getBasicGrade(),
            gradesCount: 0,
            comments: [],
            serveTime: 0,
            valid: false
        }
    }

    function getBasicTargetCommentItem() {
        return {
            appraiseId: '',

            uid: '',
            avatar: '',
            userNickName: '',
            userDesc: '',
            user: {},

            grade: -1,

            cttId: '',
            contentText: '',
            contentTime: 0,
            content: {},
            replies: [],
            valid: false
        }
    }

    function getBasicReplyItem() {
        return {
            uid: '',
            userNickName: '',
            user: {},
            contentText: '',
            content: {},
            valid: false
        }
    }

    /**
     * 获取合法的回调函数
     * @param func
     * @returns {function}
     */
    function getLegalCallback(func) {
        return angular.isFunction(func) ? func : angular.noop;
    }

    /**
     * 加载该用户对某个目标(课程)的评价信息 （设计上只有一条）
     * @param courseId 课程id
     * @param callback callback(ok, data)
     */
    function getUserComment(courseId, callback) {
        var params = {
            targetId: courseId
        };
        callback = getLegalCallback(callback);
        course.searchComment(params).then(function (data) {
            callback(true, handleSearchCommentData(data.data));
        }, function (err) {
            console.log('[appraise-service]:用户评价信息加载失败', err);
            callback(false, err);
        });
    }

    // 处理 searchComment 接口数据
    // 为了 分离 handleItselfCourseCommentData 出来
    function handleSearchCommentData(data) {
        var apps = data.apps;
        if (!apps) {
            console.log('[appraise-service]:searchComment data.apps miss');
            return getBasicUserComment();
        }

        // 目前用户对某个(课程)只能评价一次 所以直接读第一个元素
        var comment = apps[0];
        return handleItselfCourseCommentData(comment);
    }

    // 处理用户自己对某个目标(课程)的评价数据
    function handleItselfCourseCommentData(comment) {
        var o = getBasicUserComment();

        if (!comment) {
            return o;
        }

        try {
            o.id = comment.id;
            o.cid = comment.contents[0].cid;
            o.text = comment.contents[0].text||'';
            o.grade = gradeTypes.indexOf(comment.scores.vote + '');
            o.valid = true;
        } catch (e) {
            console.log('[appraise-service]:用户评价信息解析失败', e, comment);
            o = getBasicUserComment();
        }

        if (!o.id || !o.cid) {
            console.log('[appraise-service]:该用户评价信息为空');
            o = getBasicUserComment();
        }
        return o;
    }

    /**
     * 发布评价
     * @param option {id, type, grade, text}
     * @param callback
     */
    function publishSimpleComment(option, callback) {
        var postData = {
            target: option.id,
            type: option.type || 'course',
            scores: {vote: option.grade + 1},
            contents: [{
                text: option.text || ''
            }]
        };

        callback = getLegalCallback(callback);
        course.publishComment(postData).then(function (data) {
            service.dialog.alert('发表评论成功')
            callback(true, data.data);
        }, function (err) {
            errorTipper.setFuncName('publishSimpleComment').tip(err, {text: '发表评论出错'});
            callback(false);
        });
    }

    /**
     * 更新评价的评论内容(content->text)
     * @returns {*}
     * @param option {id, cid, text}
     * @param callback
     */
    function updateCommentContent(option, callback) {
        var postData = {
            id: option.id,
            contents: [{
                cid: option.cid,
                text: option.text
            }]
        };
        callback = getLegalCallback(callback);
        course.updateComment(postData).then(function (data) {
            service.dialog.alert('评论成功')
            callback(true);
        }, function (err) {
            errorTipper.setFuncName('updateCommentContent').tip(err, {text: '发表评论内容失败'});
            callback(false);
        });
    }

    /**
     * 加载某个目标评价的各等级数据 (赞, 一般, 踩)
     * @param option {id, type}
     * @param callback
     */
    function getGradeNum(option, callback) {
        var params = {
            targetId: option.id,
            pageCount: 1,
            "scores[]": [{type: 'vote'}]
        };
        callback = getLegalCallback(callback);
        course.loadComment(params).then(function (data) {
            var grade = handleGradeData(data.data.statistics).grades;
            callback(true, grade);
        }, function (err) {
            console.log('[appraise-service]:评价等级信息加载失败', err);
            callback(false, err);
        });
    }

    // 处理某个目标评价等级信息
    function handleGradeData(data) {
        var grades = getBasicGrade();
        var percent = getBasicGrade();
        var total = 0;
        data = data || [];
        angular.forEach(data, function (item) {
            var i = gradeTypes.indexOf(item.vote + '') ;
            if (i > -1) {
                grades[i] = item.count;
                total += item.count;
            }
        });

        angular.forEach(grades, function (v, k) {
            percent[k] = v / total;
        });
        return {grades: grades, percent: percent, gradesCount: total};
        // return {grades: grades, percent: percent};
    }

    // 获取指定目标(课程)的评价
    function getTargetComment(option, callback) {
        var scoresStr = '';
        if (option.scores) {
            try {
                scoresStr = JSON.stringify(option.scores);
            } catch (e) {
                console.warn('[appraise-service]:', e);
            }
        }

        var params = {
            targetId: option.targetId,
            page: option.page,
            pageCount: option.pageCount,
            sort: option.sort,
            // scores: [{"type":"vote","min":2,"max":3}]
            scores: scoresStr,
            minTime: option.minTime,
            // empty 是否显示评价内容为空的评价, 0 显示, 大于0 不显示
            empty: option.showContentCommentOnly ? 1 : 0
        };
        callback = getLegalCallback(callback);
        course.loadComment(params).then(function (data) {
            callback(true, handleTargetComment(data.data));
        }, function (err) {
            console.log('[appraise-service]:评价信息加载失败', err);
            callback(false, err);
        });
    }

    // 处理某个目标(课程)评价信息
    function handleTargetComment(data) {
        data = data || {};
        var comment = getBasicTargetComment();
        comment.total = data.total;

        var o = handleGradeData(data.statistics);
        comment.grades = o.grades;
        comment.gradesPercent = o.percent;
        comment.gradesCount = o.gradesCount;

        comment.serveTime = data.serveTime;
        comment.comments = handleTargetCommentItem(data.apps || [], data.user || []);
        comment.valid = true;
        return comment;
    }

    // 处理评价信息item
    function handleTargetCommentItem(appraise, users) {
        var list = [];
        angular.forEach(appraise, function (v) {
           var o = getBasicTargetCommentItem();

            try {
                o.appraiseId = v.id;
                o.uid = v.uid;

                var u = users[o.uid];
                o.avatar = u.attrs.basic.avatar;
                o.userNickName = u.attrs.basic.nickName || o.uid;
                o.userDesc = u.attrs.basic.desc || '';
                o.user = u;

                // v.scores && gradeTypes.indexOf() > -1 && (o.grade = v.scores.vote);
                if (v.scores) {
                    var gradeIndex = gradeTypes.indexOf(v.scores.vote + '');
                    if (gradeIndex > -1) {
                        o.grade = gradeIndex;
                    }
                }

                if (v.contents) {
                    var ctt = v.contents[0];
                    o.cttId = ctt.cid;
                    o.contentText = ctt.text;
                    o.contentTime = ctt.time;
                    o.content = ctt;
                    o.replies = handleCommentReplies(v.contents.slice(1), users);
                }
                o.valid = true;
            } catch (e) {
                console.log('[appraise-service]:解析评论item数据失败', e, v);
            }
            o.valid && list.push(o);
        });
        return list;
    }

    // 处理评论的回复
    function handleCommentReplies(sourceReplies, users) {
        var list = [];
        angular.forEach(sourceReplies, function (v) {
            var o = getBasicReplyItem();
            try {
                o.uid = v.uid;
                var u = users[o.uid];
                // o.avatar = u.attrs.basic.avatar;
                o.userNickName = u.attrs.basic.nickName || o.uid;
                o.user = u;

                // o.cttId = v.cid;
                o.contentText = v.text;
                // o.contentTime = v.time;
                o.content = v;
                o.valid = true;
            } catch (e) {
                console.log('[appraise-service]:解析回复item错误', e, v);
            }
            o.valid && list.push(o);
        });
        return list;
    }

    return {
        getBasicGrade: getBasicGrade,
        getUserComment: getUserComment,
        handleItselfCourseCommentData: handleItselfCourseCommentData,
        publishSimpleComment: publishSimpleComment,
        updateCommentContent: updateCommentContent,
        getGradeNum: getGradeNum,
        handleGradeData: handleGradeData,
        getBasicTargetComment: getBasicTargetComment,
        getTargetComment: getTargetComment,
        handleTargetComment: handleTargetComment
    };
}]);
