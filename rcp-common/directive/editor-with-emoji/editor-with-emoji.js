/**
 * Created by ph2 on 2016/7/6.
 * 表情选择框
 */

// 要将编辑框的表情占位符转换成 unicode 或者 将 unicode 转换成图片显示
// 使用 dyf_w_rcp-common/src/filter/emoticon.js

/**
 * editorWithEmoji 输入框
 * 事实上，这个输入框与 emoticon 无关
 */
module.directive('editorWithEmoji', function () {
    return {
        template:'<div class="editor-with-emoji"><div class="exceed-prompt"><span ng-class="{\'c-gray\':exceed}" ng-hide="exceed">还可以输入<b class="text1">{{surplus}}</b>字</span> <span ng-class="{\'c-red\':exceed>0}" ng-show="exceed">已超出<b class="text1">{{exceed}}</b>字</span></div><label><textarea ng-attr-placeholder="{{config.placeholder}}" ng-attr-id="{{config.id}}" ng-model="content" ng-focus="onFocus()" ng-blur="onBlur()" ng-trim="false" ng-class="config.class" ng-style="config.style"></textarea></label></div>',
        restrict: 'E',
        replace: true,
        scope: {
            content: '=',
            exceed: '=',
            // config: {id: '', limit: 255, placeholder: '', style: {}, class: ''}
            config: '='
        },
        controller: ['$scope', '$element', function ($scope, $element) {

            function init() {
                var config = $scope.config || {};
                // 剩余字数
                $scope.surplus = config.limit;
                // 超过字数
                $scope.exceed = 0;
            }
            
            function checkWords() {
                if ($scope.config.limit) {
                    var diff = parseInt((parseInt($scope.config.limit * 2) - $scope.content._getLen()) / 2);

                    // 剩余字数
                    $scope.surplus = diff > 0 ? diff : 0;
                    // 超过字数
                    $scope.exceed = diff > 0 ? 0 : -diff;
                }
            }

            $scope.onFocus = function () {
                $scope.config && $scope.config.limit && $element.find('.exceed-prompt').show();
                // console.log('[editorWithEmoji]: onFocus');
            };

            $scope.onBlur = function () {
                $element.find('.exceed-prompt').hide();
                // console.log('[editorWithEmoji]: onBlur');
            };

            $scope.$watch('content', function (newValue, oldValue) {
                if (typeof newValue === 'string' && newValue !== oldValue) {
                    checkWords();
                }
                // console.log('[editorWithEmoji]: ', newValue, ',', oldValue);
            });

            init();
        }]
    }
});

/**
 * editorEmojiPicker 表情选择框
 * scope: {showed: '', editor: ''}
 * 位置自行控制
 * 需要引入 emoticonService /rcp-common/filter/emoticon.js
 *          /rcp-common/styles/emoticon.css
 *         /js-emoji/lib/emoji.js
 * eg.
  <editor-emoji-picker showed="replyDiscuss.emojiPickerShowed"
                       editor="'#send-reply'"
                       style="top: 35px; left: 11px;"></editor-emoji-picker>
 */
module.directive('editorEmojiPicker', function () {
   return {
       template:'<div class="editor_emoji_picker" ng-show="showed"><div class="categories"><a class="item active">符号表情</a></div><div class="scroll-wrapper"><div class="scroll-bd"><div class="face-content active"><div class="faces"><span class="item" data-ng-repeat="colon in emoticonList" data-ng-bind-html="colon|emojiColonToCss|html"></span></div></div></div></div></div>',
       restrict: 'E',
       replace: true,
       scope: {
           // 是否显示
           showed: '=',
           // 插入表情的目标编辑框(选择器语法)
           // 只允许 textarea, input，但可以是包含这些元素的父节点(使用找到的第一个子节点)
           editor: '='
       },
       controller: ['$scope', '$element', 'emoticonService', '$timeout', function ($scope, $element, emoticonService, $timeout) {

           var initEvents;
           $scope.targetEditor = null;
           $scope.emoticonList = [];

           var wrapper = emoticonService.emojiConvertor._custom_wrapper;
           angular.forEach(emoticonService.emojiConvertor.commonEmoji, function (v) {
               $scope.emoticonList.push(wrapper.left + v[0] + wrapper.right);
           });

           /**
            * 初始化编辑框
            * 已初始化编辑框 直接返回
            * 否则 在自身和子代中寻找
            */
           var initTargetEditor = function () {
               if ($scope.targetEditor && $scope.targetEditor.length) {
                   return;
               }

               if (!$scope.editor) {
                   console.log('[editorEmojiPicker]: 没有指定目标输入框');
                   return;
               }

               var editor = angular.element($scope.editor);
               if (editor.is('textarea,input[type=text]')) {
                   $scope.targetEditor = editor;
               } else {
                   $scope.targetEditor = editor.find('textarea,input[type=text]').eq(0);
               }
           };

           initEvents = function () {
               angular.element('body').bind({
                   click: function () {
                       $timeout($scope.hide);
                   }
               });

               $element.bind({
                       click: function (event) {
                           event.stopPropagation();
                       }
                   })
                   .delegate('.faces .item', {
                       click: function (event) {
                           var text = $(this).children('.emoji').text();
                           $scope.insertText(text);
                           $scope.hide();
                           event.preventDefault();
                       }
                   });
           };

           $scope.show = function () {
               $scope.showed = true;
           };

           $scope.hide = function () {
               $scope.showed = false;
           };

           // 向绑定的编辑框插入选择的表情
           $scope.insertText = function (text) {
               if (!text) {
                   return;
               }

               initTargetEditor();
               if (!($scope.targetEditor && $scope.targetEditor.length)) {
                   console.log('[editorEmojiPicker]: 没有目标输入框');
                   return;
               }
               var editor = $scope.targetEditor[0];
               editor.focus();
               $timeout(function () {
                   if (document.selection) {
                       var cr = document.selection.createRange();
                       cr.text = text;
                       cr.collapse();
                       cr.select();
                   } else if (editor.selectionStart !== undefined) {
                       var start = editor.selectionStart;
                       var end = editor.selectionEnd;
                       editor.value = editor.value.substring(0, start) + text
                           + editor.value.substring(end, editor.value.length);
                       editor.selectionStart = editor.selectionEnd = start + text.length;
                   } else {
                       editor.value += text;
                   }

                   // 触发 input 事件，触发 ng 数据检查 (input event ie9 不起作用, change 可以)
                   $scope.targetEditor.trigger('input').trigger('change');

                   // console.log('[editorEmojiPicker]: insertText');
               }, 10);
           };

           initEvents();
       }]
   }
});
