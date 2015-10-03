define(function () {
    'use strict';

    function Color(r, g, b, a) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a;
        if (a == undefined) {
            this.a = 1;
        }
    }

    Color.prototype.toString = function () {
        return this.r + ',' + this.g + ',' + this.b;
    }

    Color.prototype.toRGBString = function () {
        return 'rgb(' + this.toString() + ')';
    }

    Color.prototype.light = function () {
        return (this.r * 0.8 + this.g + this.b * 0.2) / 510 * 100;
    }

    /*Color.prototype.valueOf = function () {
        return 65536 * this.r + 256 * this.g + this.b;
    }*/

    Color.prototype.toHexString = function () {
        function componentToHex(c) {
            var hex = (~~c).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return '#' + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
    }

    Color.fromHexString = function (hex) {
        if (hex.length == 4) {
            return new Color(parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16), parseInt(hex[3] + hex[3], 16));
        }
        else if (hex.length == 7) {
            return new Color(parseInt(hex[1] + hex[2], 16), parseInt(hex[3] + hex[4], 16), parseInt(hex[5] + hex[6], 16));
        }
    };

    Color.fromHSL = function (h, s, l, a) {

        h = (h % 360 + 360) % 360;
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));


        var rgb = null;

        if (s == 0) {
            l *= 2.55;
            rgb = {
                r: l,
                g: l,
                b: l
            };
        }
        else {
            var p = l < 50 ? l * (1 + s / 100) : l + s - l * s / 100;
            var q = 2 * l - p;

            rgb = {
                r: (h + 120) / 60 % 6,
                g: h / 60,
                b: (h + 240) / 60 % 6
            };

            for (var key in rgb) {

                if (rgb[key] < 1) {
                    rgb[key] = q + (p - q) * rgb[key];
                }
                else if (rgb[key] < 3) {
                    rgb[key] = p;
                }
                else if (rgb[key] < 4) {
                    rgb[key] = q + (p - q) * (4 - rgb[key]);
                }
                else {
                    rgb[key] = q;
                }

                rgb[key] *= 2.55;
            }
        }
        return new Color(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b), a);
    }

    return Color;
});