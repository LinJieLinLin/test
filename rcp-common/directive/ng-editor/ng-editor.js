/**
 * Created by Fox2081 on 2016/6/6.
 */
/**
 * Created by Fox2081 on 2015/10/15.
 */


/*
 <div id=""
 args="{}"
 ng-model="item.dataT.answer"
 ng-editor
 ng-bind-html="item.dataT.content.answer"
 contenteditable="true">
 </div>
* */


module.directive('ngEditor', function () {
    return {
        require: '?ngModel',
        scope: {
            args: "=args",
        },
        link: function ($scope, $element, $attr, ngModel) {

            var ckeditor = null;

            $scope.init = function () {
                if (ckeditor != null)return;
                var config = {
                    //allowedContent: true,
                    width: $attr["width"], //宽度
                    height: $attr["height"],

                    font_names: '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;' + CKEDITOR.config.font_names,

                    extraPlugins: 'language',
                    removePlugins: 'resize',
                    skin: '../../../ckeditor_ext/skin/minimalist',
                    toolbarCanCollapse: true,
                    toolbar: 'Full',
                    toolbarGroups: [
                        {name: 'document', groups: ['doctools', 'mode', 'document']},
                        {name: 'clipboard', groups: ['clipboard', 'undo']},
                        {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
                        {name: 'forms', groups: ['forms']},
                        {name: 'insert', groups: ['insert']},
                        {name: 'paragraph', groups: [/*'list',*/ 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
                        '/',
                        {name: 'links', groups: ['links']},
                        {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                        {name: 'styles', groups: ['styles']},
                        {name: 'colors', groups: ['colors']},
                        {name: 'tools', groups: ['tools']},
                        //{ name: 'others', groups: [ 'others' ] },
                        //{ name: 'about', groups: [ 'about' ] }
                    ],
                    removeButtons: 'Save,NewPage,Print,Preview,Templates,Source,Flash,Iframe,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Scayt,Anchor,Language,Styles,About,ShowBlocks,NumberedList,BulletedList,CreateDiv,Flash,Smiley,PageBreak,Image,SelectAll,Blockquote',
                };

                if (!$element[0].id) {
                    $element[0].id = 'editor-' + new Date().getTime() + '-' + (''+ Math.floor(Math.random() * 100000000));
                }

                var id = $element[0].id;

                ckeditor = CKEDITOR.inline($element[0].id, config);

                ckeditor.on('instanceReady', function (event) {
                    ckeditor.setData(ngModel.$viewValue);
                });
                ckeditor.on('pasteState', function (event) {
                    ngModel.$setViewValue(ckeditor.getData());
                });
                ckeditor.on('refData', function (event) {
                    ngModel.$setViewValue(ckeditor.getData());
                });
                ckeditor.on('focus', function (event) {
                });
                ckeditor.on('change', function (event) {
                    ngModel.$setViewValue(ckeditor.getData());
                });
                ckeditor.on('key', function (event) {

                });
                ckeditor.on("blur", function (event) {
                });
                ckeditor.on('contentDom', function (event) {
                });

                ngModel.$render = function (value) {
                    if (ckeditor) {
                        ckeditor.setData(ngModel.$viewValue);
                    }
                };

            };

        }
    };
});