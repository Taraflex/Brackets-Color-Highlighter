define(function (require) {
    'use strict';

    var Color = require('color'),
        colors = require('definedcolors');

    function Colorhighlighter(cm, mode) {
        cm.on('renderLine', this.process.bind(this));
        this.process(cm, null, cm.display.lineDiv);
    }

    Colorhighlighter.validMode = function (mode) {
        return mode == 'css' ||
            mode == 'sass' ||
            mode == 'text/x-scss' ||
            mode == 'text/x-less' ||
            mode == 'text/x-brackets-html' ||
            mode == 'text/x-styl';
    }

    function processElement(e, color, tcolor) {
        e.style.backgroundColor = tcolor;
        e.style.borderRadius = '2px';
        e.style.color = ((color.light() < 50) ? '#fff' : '#000');
    }

    function parseCSSNumber(s) {
        s = s.trim();
        if (s[s.length - 1] == '%') {
            return parseInt(s) / 100 * 255;
        }
        else {
            return parseInt(s);
        }
    }

    function nextNodeValue(nd) {
        if (!nd.nextSibling) {
            return "";
        }
        if (!nd.nextSibling.nodeValue) {
            return "";
        }
        return nd.nextSibling.nodeValue.trim();
    }

    Colorhighlighter.prototype.process = function (cm, cmline, node) {
        var nodes = node.getElementsByClassName('cm-atom');
        for (var i = 0; i < nodes.length; i++) {
            var nd = nodes[i],
                color = null,
                scolor = "",
                nr, ng, nb, na,
                tr, tg, tb;
            if ( !nd.classList.contains('cm-error') /*nd.className == 'cm-atom'*/ ) {
                var t = nd.innerText.trim();
                if (t[0] == '#' && (t.length == 3 + 1 || t.length == 6 + 1)) {
                    color = Color.fromHexString(t);
                    if (color) {
                        processElement(nd, color, t);
                    }
                }
                else {
                    t = t.toLowerCase();
                    if ((t == 'rgb' || t == 'hsl') &&
                        nextNodeValue(nd) == '(' &&
                        (nr = nd.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(nr) == ',' &&
                        (ng = nr.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(ng) == ',' &&
                        (nb = ng.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(nb)[0] == ')'
                    ) {
                        if (t == 'rgb') {
                            color = new Color(parseCSSNumber(tr = nr.innerText), parseCSSNumber(tg = ng.innerText), parseCSSNumber(tb = nb.innerText));
                        }
                        else {
                            color = Color.fromHSL(parseInt(tr = nr.innerText), parseInt(tg = ng.innerText), parseInt(tb = nb.innerText));
                        }
                        scolor = nd.innerText + nd.nextSibling.nodeValue + tr + nr.nextSibling.nodeValue + tg + ng.nextSibling.nodeValue + tb + nb.nextSibling.nodeValue.split(')')[0] + ')';
                    }
                    else if ((t == 'rgba' || t == 'hsla') &&
                        nextNodeValue(nd) == '(' &&
                        (nr = nd.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(nr) == ',' &&
                        (ng = nr.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(ng) == ',' &&
                        (nb = ng.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(nb) == ',' &&
                        (na = nb.nextElementSibling).className == 'cm-number' &&
                        nextNodeValue(na)[0] == ')'
                    ) {
                        if (t == 'rgba') {
                            color = new Color(parseCSSNumber(tr = nr.innerText), parseCSSNumber(tg = ng.innerText), parseCSSNumber(tb = nb.innerText));
                        }
                        else {
                            color = Color.fromHSL(parseInt(tr = nr.innerText), parseInt(tg = ng.innerText), parseInt(tb = nb.innerText));
                        }
                        scolor = nd.innerText + nd.nextSibling.nodeValue + tr + nr.nextSibling.nodeValue + tg + ng.nextSibling.nodeValue + tb + nb.nextSibling.nodeValue + na.innerText + na.nextSibling.nodeValue.split(')')[0] + ')';
                    }
                    if (color) {
                        nd.dataset.color = scolor;
                        nd.classList.add('h-phantom');
                        processElement(nd, color, color.toHexString());
                    }
                }
            }
        }

        nodes = node.getElementsByClassName('cm-keyword');
        for (var i = 0; i < nodes.length; i++) {
            var nd = nodes[i];
            //if (nd.className == 'cm-keyword') {
                var t = nd.innerText.trim().toLowerCase();
                if (t in colors) {
                    processElement(nd, colors[t], t);
                }
            //}
        }
    };
    return Colorhighlighter;
});