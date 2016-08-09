/**
 * Created by Fox2081 on 2015/10/15.
 */
module.directive('contentEditor', function () {
    return {
        require: '?ngModel',
        scope: {
            args: "=args",
            scope: "=scope",
            index: "=index",
            tag: "=tag",
            editorScope: "=editorScope",
            group: "="
        },
        link: function ($scope, $element, $attr, ngModel) {
            
            var ckeditor = null;

            var toolBarId = 'topEditor-' + ($scope.group || '');

            var topEditor = $('#' + toolBarId);


            $scope.$watch('editorScope', function (n) {
                if (ckeditor) {
                    // topEditor.find('#cke_editor-'+ $scope.tag + '-' + $scope.args.id).remove();
                } else {
                    $scope.editorScope = $scope;
                    $scope.init();
                }
            });

            $scope.init = function () {
                if (ckeditor != null)return;
                var config = {
                    //allowedContent: true,
                    width: $attr["width"], //宽度
                    height: $attr["height"],

                    font_names: '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;' + CKEDITOR.config.font_names,

                    // extraPlugins: 'language,sharedspace,optionFill,lineutils,widget,mathjax',
                    extraPlugins: 'language,sharedspace,optionFill',
                    removePlugins: 'resize',
                    sharedSpaces: {
                        top: toolBarId
                    },
                    skin: '../../../ckeditor_ext/skin/minimalist',
                    toolbarCanCollapse: true,
                    toolbar: 'Full',
                    allowedContent: true,
                    // toolbarGroups: [
                    //     {name: 'document', groups: ['doctools', 'mode', 'document']},
                    //     {name: 'clipboard', groups: ['clipboard', 'undo']},
                    //     {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
                    //     {name: 'forms', groups: ['forms']},
                    //     {name: 'insert', groups: ['insert']},
                    //     {name: 'paragraph', groups: [/*'list',*/ 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
                    //     '/',
                    //     {name: 'links', groups: ['links']},
                    //     {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                    //     {name: 'styles', groups: ['styles']},
                    //     {name: 'colors', groups: ['colors']},
                    //     {name: 'tools', groups: ['tools']},
                    //     //{ name: 'others', groups: [ 'others' ] },
                    //     //{ name: 'about', groups: [ 'about' ] }
                    // ],
                    // removeButtons: 'Save,NewPage,Print,Preview,Templates,Source,Flash,Iframe,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Scayt,Anchor,Language,Styles,About,ShowBlocks,NumberedList,BulletedList,CreateDiv,Flash,Smiley,PageBreak,Image,SelectAll,Blockquote',
                };
                config.toolbar = [
                    {name: 'document', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
                    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] },
                    { name: 'links', items: [ 'Link', 'Unlink'] },
                    {name: 'editing', items: ['Find', 'Replace']},
                    '/',
                    { name: 'insert', items: [ /*'Image',*/ 'Table', 'HorizontalRule',  'Mathjax', 'SpecialChar'] },
                    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                    { name: 'styles', items: [ 'Format', 'Font', 'FontSize' ] },
                    { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                ];

                var id = 'editor-' + $scope.tag + '-' + $scope.args.id;
                // ckeditor = CKEDITOR.inline(id, config);-

                $element[0].id = 'editor-' + new Date().getTime() + '-' + (''+ Math.floor(Math.random() * 100000000));
                
                ckeditor = CKEDITOR.inline($element[0].id, config);


                ckeditor.on('instanceReady', function (event) {
                    ckeditor.setData(ngModel.$viewValue);
                });
                ckeditor.on('pasteState', function (event) {
                    ngModel.$setViewValue(ckeditor.getData());
                    // console.log('---------------------','pasteState');
                });
                ckeditor.on('refData', function (event) {
                    ngModel.$setViewValue(ckeditor.getData());
                });
                ckeditor.on('focus', function (event) {
                    topEditor.show();
                    $scope.args.s = "NON-UPDATE";
                });
                ckeditor.on('change', function (event) {
                    // console.log('---------------------','change');
                    ngModel.$setViewValue(ckeditor.getData());
                    $scope.args.s = "NON-UPDATE";
                });
                ckeditor.on('key', function (event) {
                    // console.log('---------------------','key');

                });
                ckeditor.on("blur", function (event) {
                    topEditor.hide();
                    $scope.scope($scope.index);
                });
                ckeditor.on('contentDom', function (event) {
                    // console.log('---------------------','contentDom');

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