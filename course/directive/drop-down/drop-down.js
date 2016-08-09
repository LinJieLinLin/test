/**
 * Created by Zhongj on 2016/6/22.
 * 模块说明：
 */
module.directive("dropDown", function () {
  return {
    template:'<div class="drop-down" ng-class="{\'drop-down-spec\':isChange}"><div ng-click="toggle();" class="toggle"><div class="text-of key-width">{{key}}</div><div class="fa fa-caret-down" aria-hidden="true" ng-class="{\'fa-caret-down\': !content.showOptions, \'fa-caret-up\': content.showOptions,\'select-content\':isChange}"></div></div><ul class="drop-down-options" ng-show="content.showOptions" ng-class="{\'specify-paper\':isChange}"><li ng-repeat="option in options" ng-click="setSpecPaper(option, $index);" class="text-of" ng-class="{\'active\': content.curSelectIndex == $index, \'hover-bg\': content.curSelectIndex != $index}">{{option.name}}</li></ul></div>',
    restrict: "E",
    replace: true,
    transclude: true,
    scope: {
      key: '=',
      status:'=',
      content: '='
    },
    controller: ['$scope', function ($scope) {
      if($scope.content == null){
        console.log("【dropdown】：$scope.content = ",$scope.content);
        return;
      }
      $scope.isChange = false;
      if($scope.status == 'score'){
        $scope.isChange = true;
        $scope.options = $scope.content.evalLst || [];
        // console.log("$scope.options = ",$scope.options);
        $scope.changeSpecPaper = $scope.content.changeScrSourse;
        $scope.equal = $scope.content.equal;
      }

      //更新option的数据
      $scope.content.setOptionsValue = function (argOptions) {
        // console.log("argOptions = ",argOptions);
        $scope.options = argOptions;
      };

      var closeToggle = function (argEvent) {
        // console.log("closeToggle,$('.drop-down').has(argEvent.target).length = ",$('.drop-down').has(argEvent.target).length);
        var bol = $scope.equal();//判断平时成绩和考试成绩的showOptions是否都为true
        if(bol || $('.drop-down').has(argEvent.target).length == 0){//点击下拉列表的其他位置
          $scope.content.showOptions = false;
          $scope.$apply();
          $(document).off('click',closeToggle);//移除‘click’的closeToggle事件
        }
      };

      //控制下拉列表的显示
      $scope.toggle = function () {
        console.log("toggle,content.key = ",$scope.content.key);
        $scope.content.showOptions = !$scope.content.showOptions;
        console.log("toggle,content.showOptions = ",$scope.content.showOptions);
        if($scope.content.showOptions){
          //绑定页面单击事件，关闭下拉菜单功能
          $(document).on('click', closeToggle);
        }
      };

      //设置指定试卷，
      // argOption：选中的对象，argindex，选中对象的位置
      $scope.setSpecPaper = function (argOption,argIndex) {
        if($scope.content.curSelectIndex != argIndex){//没有改变选择
          $scope.key = argOption.name;//修改指定试卷名称
          $scope.content.curSelectIndex = argIndex;
        }
        $scope.content.isChange = true;//数据发生改变
        $scope.changeSpecPaper($scope.content,argOption);
        $scope.content.showOptions = false;
      };
    }],
    link: function ($scope, $element) {
      var ul = $element.find('.drop-down-options');
      //100 是 ul的宽度
      ul.css('left', ($element.width() - 100) / 2);
      // ul.css('display', 'block');
    }
  }
});