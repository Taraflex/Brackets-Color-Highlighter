define(function (require, exports, module) {
    'use strict';

    var css = ".h-phantom{position:relative;}\
.h-phantom:before{content:attr(data-color);color:inherit;background-color:inherit;pointer-events:none;position:absolute;top:0;left:0;border-radius:2px;white-space:nowrap;}";

    var document = window.document;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    var Colorhighlighter = require('colorhighlighter'),
        EditorManager = brackets.getModule('editor/EditorManager');

    EditorManager.on('activeEditorChange', function (event, editor) {
         if (editor && editor._codeMirror) {
            var cm = editor._codeMirror;
            var mode = cm.options.mode;

            if (!cm._colorHighlighter && Colorhighlighter.validMode(mode)) {
                cm._colorHighlighter = new Colorhighlighter(cm, mode);
            }

            //TODO реакция на изменение контекста напр javascript ->css
            /*if (!editor._hasColorHighlighterListeners) {
                editor._hasColorHighlighterListeners = true;
                editor.on('optionChange', function () {
                    log(arguments);                  
                })
            }*/
        }
    });

});