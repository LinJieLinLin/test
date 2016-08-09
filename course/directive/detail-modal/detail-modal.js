/**
 * 课程详情框
 * type: 0 课程转让详情, 1 课程接收操作, 2 课程转让操作
 */
module.directive('detailModal', function () {
    return {
        template:'<div class="detail-modal" ng-show="show"><div class="modal" modal-fixed><i class="fa fa-times" aria-hidden="true" ng-click="data.reset();"></i><div class="content"><span class="title" ng-bind="data.title"></span><div class="label"><span><i aria-hidden="true">*</i>选择课程</span><span class="text-of course-title" title="{{data.name}}" ng-show="type == 0 || type == 1" ng-class="{\'just-show\': type == 0}" ng-bind="data.name"></span><div class="dm-select" ng-show="type == 2"><div class="dm-s-name" ng-click="toggle();"><span class="text-of" ng-bind="data.selectCrs.name"></span> <i ng-class="{\'dao\': showOptions}"></i></div><ul ng-show="showOptions"><li class="text-of" ng-repeat="item in data.options" ng-bind="item.name" title="{{item.name}}" ng-click="itemClick(item)"></li></ul></div></div><div class="label v-a-t"><span><i aria-hidden="true">*</i>课程信息</span><div class="dm-course-info"><ng-img c="{\'img\': data.cover, \'default\': \'/rcp-common/imgs/icon/gray-default-img.png\', \'divClass\': \'cover\', \'imgClass\': \'cover-img\'}"></ng-img><div class="dm-info"><p ng-bind="data.name" title="{{data.name}}"></p><p ng-bind="\'课程学分：\' + data.credit"></p><p ng-bind="\'开课时间：\' + ((data.startTime | date:\'yyyy-MM-dd\') || \'无\')"></p><p ng-bind="\'结束时间：\' + ((data.endTime | date:\'yyyy-MM-dd\') || \'无\')"></p><p ng-bind="\'学生人数：\' + (data.joined || 0)"></p></div></div></div><div class="label v-a-t teachers"><span><i aria-hidden="true">*</i>教师团队</span><p><span class="names" ng-class="{\'line\': data.showKeep && type == 0 && !data.teachersKeep && data.teachers.length && data.teachers}" ng-bind="(data.teachers.length && data.teachers || [\'无\']).join(\'、\')"></span> <span ng-show="data.showKeep && type == 0 && data.teachers.length && data.teachers" ng-class="{\'t-i-red\': !data.teachersKeep, \'t-i-green\': data.teachersKeep}" ng-bind="data.teachersKeep ? \'（保留）\' : \'（不保留）\'"></span></p></div><div class="label"><span><i aria-hidden="true">*</i>版权作者</span><span ng-bind="data.author"></span></div><div class="label"><span><i aria-hidden="true">*</i>转让对象</span><span ng-show="type == 0 || type == 1" ng-class="{\'just-show\': type == 0}" ng-bind="data.toUser"></span><div class="dm-input" ng-show="type == 2"><search-user export="data"></search-user></div></div><label for="dm-checkbox" class="checkbox" ng-show="type == 1 || type == 2"><input id="dm-checkbox" ng-model="checkbox" ng-class="{\'m-l-small\': type == 1, \'m-l-large\': type == 2}" type="checkbox"> <span ng-bind="type == 1 ? \'保留教师团队（勾选可保留课程教师团队）\' : \'我同意，版权转让后将不再拥有该课程。\'"></span></label><div class="dm-btn" ng-show="type == 1 || type == 2"><div><span class="bg-blue" ng-click="data.okCb && data.okCb(data.cid, checkbox, data.searchUser);" ng-bind="type == 1 ? \'接收\' : \'确定\'" ng-class="{\'disabled\': type == 2 && (!checkbox || !data.searchUser), \'cursor-normal\': type == 2 && (!checkbox || !data.searchUser)}"></span> <span class="bg-orange" ng-click="data.cancelCb && data.cancelCb(); data.reset();" ng-bind="type == 1 ? \'拒绝\' : \'取消\'"></span></div></div></div></div></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            type: '=',
            show: '=',
            data: '='
        },
        controller: ['$scope', '$timeout', function ($scope, $timeout) {

            $scope.data.reset = function () {
                $scope.show = false;
                $scope.checkbox = false;
                $scope.data.showKeep = false;
                $scope.data.searchUserReset();
            };

            $scope.itemClick = function (item) {
                if ($scope.data.selectCrs === item) {
                    $scope.toggle();
                    return;
                }
                $scope.data.changeCb && $scope.data.changeCb(item.cid);
                $scope.data.selectCrs = item;
                $scope.toggle();
            };

            $scope.toggle = function () {
                $scope.showOptions = !$scope.showOptions;
                if ($scope.showOptions) {
                    $(document).on('click', closeFn);
                } else {
                    $(document).off('click', closeFn)
                }
            };

            var closeFn = function (e) {
                var con = $('.detail-modal .label .dm-select');
                console.log(con, con.has(e.target), e.target);
                if (!con.is(e.target) && con.has(e.target).length === 0) {
                    $timeout(function () {
                        $scope.showOptions = false;
                    });
                    $(document).off('click', closeFn)
                }
            };
        }]
    }
});