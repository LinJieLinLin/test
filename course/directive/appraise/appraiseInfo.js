
module.directive('appraiseInfo', function () {
    return {
        template:'<div><div id="learning-appraisal" class="learning-appraisal"><div class="comment-grade"><div ng-click="selectAppraisalGrade(0, $event)" class="grade_v good" ng-class="commentData.grade==0 ? \'selected\': \'unselected-color\' "><span class="icon">赞</span><span class="text" ng-bind="grades[\'0\']">0</span></div><i class="delimiter"></i><div ng-click="selectAppraisalGrade(1, $event)" class="grade_v ordinary" ng-class="commentData.grade==1 ? \'selected\': \'unselected-color\' "><span class="icon">一般</span><span class="text" ng-bind="grades[\'1\']">0</span></div><i class="delimiter"></i><div ng-click="selectAppraisalGrade(2, $event)" class="grade_v bad" ng-class="commentData.grade==2 ? \'selected\': \'unselected-color\' "><span class="icon">踩</span><span class="text" ng-bind="grades[\'2\']">0</span></div></div></div><div id="comment-popover" class="comment-popover-space" ng-show="dialogVisible"><div class="frame-dialog"><div class="dialog-body"><div class="editor-space"><textarea class="editor" ng-model="commentDialogContent" ng-attr-placeholder="{{placeholder}}" ng-trim="false" ng-readonly="commentEdited" maxlength="100"></textarea><span class="measure" ng-bind="commentDialogContent.length + \'/100\'"></span></div><div class="btn-bar"><div ng-click="hideDialog()" class="button cancel">取消</div><div ng-click="submitAppraisal()" ng-show="!commentEdited" class="button submit">提交</div></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            // config: {autoLoadGrade: false}
            config: '=',
            data: '='
        },
        controller: ['$scope', '$rootScope', '$document', '$element', 'service', 'course', '$timeout', 'appraiseService', function ($scope, $rootScope, $document, $element, service, course, $timeout, appraiseService) {

            $scope.commentDialogContent = '';
            $scope.placeholder = '';
            $scope.dialogVisible = false;
            $scope.grade = -1;
            $scope.commentData = {};
            $scope.grades = appraiseService.getBasicGrade();
            $scope.commentEdited = false;
            $scope.mustBeOwn = false;

            // 保存id
            $scope.targetid = $rootScope.courseData.cid;
            if (!$scope.targetid) {
                console.log('学习页 评价信息: 获取不到id', $rootScope.courseData);
                return;
            }

            var placeholderMsgs = [
                '你点了个赞哦，顺便写个评价吧！',
                '觉得课程一般？说点啥吧！',
                '觉得课程太糟？来说下吧！'
            ];

            function init() {
                $element.find('#comment-popover').on('click', function () {
                    return false;
                });
                // $scope.popoverDom = $element.find('#comment-popover')[0];
                // $document.on('click', documentClickHandler);

                var conf = $scope.config || {};
                if (!conf.autoLoadGrade) {
                    // 不自动加载评价等级数据 使用父级传的数据
                    $scope.$watch('data', function (newValue, oldValue) {
                        if (!newValue) {
                            return;
                        }
                        $scope.grades = appraiseService.handleGradeData(newValue.statistics).grades;
                    });
                }
            }

            // 刷新状态
            function refreshInfo() {
                loadCommentGrade();
                loadCommentInfo();
            }

            // 加载各评价等级数量
            function loadCommentGrade() {
                appraiseService.getGradeNum({id: $scope.targetid}, function (ok, data) {
                    if(ok) {
                        $scope.grades = data;
                        console.log('grades...', data);
                    }
                });
            }

            // 加载该用户的评价信息
            function loadCommentInfo(callback) {
                appraiseService.getUserComment($scope.targetid, function (ok, data) {
                    if (ok) {
                        $scope.commentData = data;
                        $scope.commentDialogContent = data.text;
                        $scope.commentEdited = !!data.text;
                        callback && callback();
                    }
                });
            }

            // 评价 （赞 一般般 踩）
            $scope.selectAppraisalGrade = function (index, event) {
                if (index < 0 || index > 2) {
                    return;
                }

                // 检查当前课程是否归属当前用户所有
                if (!$scope.mustBeOwn) {
                    var currentUser = $rootScope.currentUser;
                    var courseData = $rootScope.courseData;
                    if (currentUser.uid && courseData.crs && courseData.crs.uid) {
                        if (currentUser.uid == courseData.crs.uid) {
                            $scope.mustBeOwn = true;
                            service.dialog.alert('不允许评论自己的课程');
                            console.log('不允许评论自己的课程');
                            return;
                        }
                    } else {
                        console.log('appraise info: 用户信息或者课程信息缺失');
                        return;
                    }
                } else {
                    service.dialog.alert('不允许评论自己的课程');
                    console.log('不允许评论自己的课程');
                    return;
                }

                var comment = $scope.commentData;

                // 评价等级已经选择过
                if (comment.grade >= 0) {
                    if (comment.grade != index) {
                        console.log('点击评价等级与上一次不符合');
                        // service.dialog.alert('点击评价等级与上一次不符合');
                        return;
                    }

                    event.stopPropagation();
                    $scope.showDialog();

                    // // 评价等级已选择时 先拉取评价最新状态 在显示对话框
                    // loadCommentInfo(function () {
                    //     $scope.showDialog();
                    // })
                } else {
                    // 第一次发布评价
                    $scope.grade = index;

                    appraiseService.publishSimpleComment({id: $scope.targetid, grade: $scope.grade}, function (ok) {
                        if (ok) {
                            event.stopPropagation();
                            $scope.showDialog();
                        }
                        // 无论发布成功与否 都刷新信息
                        $timeout(refreshInfo);
                    });
                }
            };

            // 提交评论
            $scope.submitAppraisal = function () {
                var commentData = $scope.commentData;
                if (!commentData.id || !commentData.cid) {
                    console.error('获取评价id失败');
                    return;
                }

                if ($scope.commentDialogContent.trim().length <= 0 ) {
                    service.dialog.alert('评论不能为空');
                    return;
                }

                appraiseService.updateCommentContent({
                    id: commentData.id,
                    cid: commentData.cid,
                    text: $scope.commentDialogContent
                }, function () {
                    // 无论成功与否 都刷新信息
                    $timeout(refreshInfo)
                });

                $scope.hideDialog();
            };

            // 显示对话框
            $scope.showDialog = function () {
                refreshPopover();
                $document.one('click', documentClickHandler);
                $scope.placeholder = placeholderMsgs[$scope.commentData.grade] || placeholderMsgs[$scope.grade] || '';
                $scope.dialogVisible = true
            };

            // 隐藏对话框
            $scope.hideDialog = function () {
                $scope.dialogVisible = false;
            };

            // 更新 popover
            function refreshPopover() {
                var bar = $element.find('#learning-appraisal');
                var popover = $element.find('#comment-popover');
                popover.width(bar.width());
                var offset = bar.offset();
                popover.css('left', offset.left);
                popover.css('top', offset.top + bar.height() + 8);
            }

            function documentClickHandler(e) {
                if ($scope.dialogVisible) {
                    $scope.hideDialog();
                    $scope.$apply();
                }
                // if ($scope.dialogVisible && !$.contains($scope.popoverDom, e.target)) {
                //     $scope.hideDialog();
                //     $scope.$apply();
                // }
            }

            init();
            $timeout(function () {
                $scope.config && $scope.config.autoLoadGrade && loadCommentGrade();
                loadCommentInfo();
            });
        }]
    }
});
