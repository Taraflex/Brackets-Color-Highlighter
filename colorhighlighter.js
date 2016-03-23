define(function (require) {
    'use strict';

    var Color = require('color'),
        colors = require('definedcolors');

    function processElement(e, color, tcolor) {
        e.style.backgroundColor = tcolor;
        e.style.borderRadius = '2px';
        e.style.color = color.light() < 50 ? '#fff' : '#000';
    }

    function parseCSSNumber(s) {
        s = s.trim();
        if (s[s.length - 1] == '%') {
            return parseInt(s) * 2.55;
        }
        else {
            return parseInt(s);
        }
    }

    function nextNodeValue(nd) {
        var sb = nd.nextSibling;
        if (sb) {
            sb = sb.nodeValue;
            return sb ? sb.trim() : null;
        }
        return null;
    }

    function isCMNumber(e) {
        return e && e.className == 'cm-number';
    }

    function sassRgbaText(startElement, endElement) {
        var scolor = '';
        do {
            scolor += startElement.innerText;
            var nsb = startElement.nextSibling;
            if (nsb) {
                nsb = nsb.nodeValue;
                if (nsb) {
                    scolor += nsb;
                }
            }
            startElement = startElement.nextElementSibling;
        } while (startElement != endElement)
        return scolor + endElement.innerText.split(')')[0] + ')'
    }

    function sassPercentOrBracket(e) {
        if (!e) {
            return null
        }
        var s = e.innerText;
        if (!s) {
            return null;
        }
        var pInd = s.indexOf('%');
        var bInd = s.indexOf(')');
        if (pInd > -1) {
            if (bInd <= pInd) {
                e = e.nextElementSibling;
                if (!e || e.className != 'cm-operator' || e.innerText[0] != ')') {
                    return null;
                }
            }
            return e;
        }
        return null;
    }

    function process(cm, _, node) {
        var mode = cm.options.mode;
        var nodes = [];
        switch (mode) {
        case 'sass':
            nodes = node.querySelectorAll('.cm-attribute, .cm-number');
            break;
        case 'text/x-styl':
            nodes = node.querySelectorAll('.cm-keyword, .cm-atom');
            break;
        default:
            nodes = node.getElementsByClassName('cm-atom');
        }
        for (var i = 0; i < nodes.length; i++) {
            var nd = nodes[i],
                color = null,
                scolor = "",
                nr, ng, nb, na,
                tr, tg, tb, tbracket;
            if (!nd.classList.contains('cm-error')) {
                var t = nd.innerText.trim();
                if (t[0] == '#' && (t.length == 3 + 1 || t.length == 6 + 1)) {
                    color = Color.fromHexString(t);
                    if (color) {
                        processElement(nd, color, t);
                    }
                }
                else {
                    t = t.toLowerCase();
                    if (mode == 'sass') {
                        if ((t == 'rgb' &&
                                (tbracket = nd.nextElementSibling, tbracket && tbracket.innerText == '(') &&
                                isCMNumber(nr = tbracket.nextElementSibling) &&
                                nextNodeValue(nr) == ',' &&
                                isCMNumber(ng = nr.nextElementSibling) &&
                                nextNodeValue(ng) == ',' &&
                                isCMNumber(nb = ng.nextElementSibling) &&
                                (tbracket = nb.nextElementSibling, tbracket && tbracket.innerText[0] == ')')) ||
                            (t == 'rgba' &&
                                (tbracket = nd.nextElementSibling, tbracket && tbracket.innerText == '(') &&
                                isCMNumber(nr = tbracket.nextElementSibling) &&
                                nextNodeValue(nr) == ',' &&
                                isCMNumber(ng = nr.nextElementSibling) &&
                                nextNodeValue(ng) == ',' &&
                                isCMNumber(nb = ng.nextElementSibling) &&
                                nextNodeValue(nb) == ',' &&
                                isCMNumber(na = nb.nextElementSibling) &&
                                (tbracket = na.nextElementSibling, tbracket && tbracket.innerText[0] == ')'))
                        ) {
                            color = new Color(parseCSSNumber(nr.innerText), parseCSSNumber(ng.innerText), parseCSSNumber(nb.innerText));
                            scolor = sassRgbaText(nd, tbracket);
                        }
                        else if ((t == 'hsl' &&
                                (tbracket = nd.nextElementSibling, tbracket && tbracket.innerText == '(') &&
                                isCMNumber(nr = tbracket.nextElementSibling) &&
                                nextNodeValue(nr) == ',' &&
                                isCMNumber(ng = nr.nextElementSibling) &&
                                (tbracket = ng.nextElementSibling, tbracket && tbracket.innerText == '%') &&
                                nextNodeValue(tbracket) == ',' &&
                                isCMNumber(nb = tbracket.nextElementSibling) &&
                                (tbracket = sassPercentOrBracket(nb.nextElementSibling))) ||
                            (t == 'hsla' &&
                                (tbracket = nd.nextElementSibling, tbracket && tbracket.innerText == '(') &&
                                isCMNumber(nr = tbracket.nextElementSibling) &&
                                nextNodeValue(nr) == ',' &&
                                isCMNumber(ng = nr.nextElementSibling) &&
                                (tbracket = ng.nextElementSibling, tbracket && tbracket.innerText == '%') &&
                                nextNodeValue(tbracket) == ',' &&
                                isCMNumber(nb = tbracket.nextElementSibling) &&
                                (tbracket = nb.nextElementSibling, tbracket && tbracket.innerText == '%') &&
                                nextNodeValue(tbracket) == ',' &&
                                isCMNumber(na = tbracket.nextElementSibling) &&
                                (tbracket = na.nextElementSibling, tbracket && tbracket.innerText[0] == ')'))
                        ) {
                            color = Color.fromHSL(parseInt(nr.innerText), parseInt(ng.innerText), parseInt(nb.innerText));
                            scolor = sassRgbaText(nd, tbracket);
                        }
                    }
                    else {
                        if ((t == 'rgb' || t == 'hsl') &&
                            nextNodeValue(nd) == '(' &&
                            isCMNumber(nr = nd.nextElementSibling) &&
                            nextNodeValue(nr) == ',' &&
                            isCMNumber(ng = nr.nextElementSibling) &&
                            nextNodeValue(ng) == ',' &&
                            isCMNumber(nb = ng.nextElementSibling) &&
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
                            isCMNumber(nr = nd.nextElementSibling) &&
                            nextNodeValue(nr) == ',' &&
                            isCMNumber(ng = nr.nextElementSibling) &&
                            nextNodeValue(ng) == ',' &&
                            isCMNumber(nb = ng.nextElementSibling) &&
                            nextNodeValue(nb) == ',' &&
                            isCMNumber(na = nb.nextElementSibling) &&
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
                    }
                    if (color) {
                        nd.dataset.color = scolor;
                        nd.classList.add('h-phantom');
                        processElement(nd, color, color.toHexString());
                    }
                }
            }
        }
        nodes = mode == 'sass' ? node.getElementsByClassName('cm-attribute') : node.getElementsByClassName('cm-keyword');
        for (var i = 0; i < nodes.length; i++) {
            var nd = nodes[i];
            var t = nd.innerText.trim().toLowerCase();
            if (t in colors) {
                processElement(nd, colors[t], t);
            }
        }
    };

    return {
        addHighlighter: function (cm) {
            if (!cm._colorHighlighter) {
                cm._colorHighlighter = true;
                cm.on('renderLine', process);
                process(cm, null, cm.display.lineDiv);
            }
        },
        destroyHighlighter: function (cm) {
            if (cm._colorHighlighter) {
                cm.off('renderLine', process);
                cm._colorHighlighter = null;
            }
        }
    };
});