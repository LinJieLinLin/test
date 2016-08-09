/**
 * Created by mj on 2015/2/3.
 */
CKEDITOR.plugins.add('optionFill', {
    init: function (editor) {
        editor.addCommand('insertFillOption', {
            exec: function (editor, obj) {

                var text = editor.getSelection().getSelectedText();
                if (text) {
                    obj.selectText({
                        text: text
                    });
                }

                var selected = editor.getSelection();

                var html = '<span class="fill-option">('+obj.index+')</span>';
                var insertElement = CKEDITOR.dom.element.createFromHtml(html);
                editor.insertElement(insertElement);
            }
        });
    }
});