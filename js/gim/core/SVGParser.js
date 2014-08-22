/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.SVGParser = {

    loadURL : function(sourceURL,callBackFunc){
//        console.log("- [GimMap]SVGParser.loadURL >>> ",sourceURL);
//        var svgLoader = new XMLHttpRequest();
//        svgLoader.onreadystatechange = function () {
//            if (svgLoader.readyState == 4) {
//                if (svgLoader.status == 200) {
//                    var svgString = svgLoader.responseText;
//                    callBackFunc(svgString);
//                }
//            }
//        }
//        svgLoader.open("GET", sourceURL, false);
//        svgLoader.send(null);

        $.getJSON(sourceURL,function(data){
            if(typeof (callBackFunc) != "undefined") callBackFunc(data);
        });
    },

    getSVGObject: function (svgString) {
        var p = new DOMParser();
        return p.parseFromString(svgString,"text/xml");
    },

    parse: function (pathStr) {
        const DEGS_TO_RADS = Math.PI / 180, UNIT_SIZE = 100;
        const DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46, MINUS = 45;

        var path = new THREE.Shape();

        var idx = 1, len = pathStr.length, activeCmd,
            x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
            x1 = 0, x2 = 0, y1 = 0, y2 = 0,
            rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;

        function eatNum() {
            var sidx, c, isFloat = false, s;

            while (idx < len) {
                c = pathStr.charCodeAt(idx);
                if (c !== COMMA && c !== SPACE) break;
                idx++;
            }
            if (c === MINUS)
                sidx = idx++;
            else
                sidx = idx;

            while (idx < len) {
                c = pathStr.charCodeAt(idx);
                if (DIGIT_0 <= c && c <= DIGIT_9)    //0~9
                {
                    idx++;
                    continue;
                }
                else if (c === PERIOD)               //.
                {
                    idx++;
                    isFloat = true;
                    continue;
                }

                s = pathStr.substring(sidx, idx);
                break;
            }
            return isFloat ? parseFloat(s) : parseInt(s);
        }

        function nextIsNum() {
            var c;
            while (idx < len) {
                c = pathStr.charCodeAt(idx);
                if (c !== COMMA && c !== SPACE) break;
                idx++;
            }

            c = pathStr.charCodeAt(idx);
            return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
        }

        var canRepeat;
        activeCmd = pathStr[0];
        while (idx <= len) {
            canRepeat = true;
            switch (activeCmd) {
                case 'M':
                    x = eatNum();
                    y = eatNum();
                    path.moveTo(x, -y);
                    activeCmd = 'L';
                    firstX = x;
                    firstY = y;
                    break;
                case 'm':
                    x += eatNum();
                    y += eatNum();
                    path.moveTo(x, -y);
                    activeCmd = 'L';
                    firstX = x;
                    firstY = y;
                    break;
                case 'Z':
                    break;
                case 'z':
                    canRepeat = false;
                    if (x !== firstX || y !== firstY)
                        path.lineTo(firstX, -firstY);
                    break;
                case 'L':
                case 'H':
                case 'V':
                    nx = (activeCmd === 'V') ? x : eatNum();
                    ny = (activeCmd === 'H') ? y : eatNum();
                    path.lineTo(nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'l':
                case 'h':
                case 'v':
                    nx = (activeCmd === 'v') ? x : (x + eatNum());
                    ny = (activeCmd === 'h') ? y : (y + eatNum());
                    path.lineTo(nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'C':
                    x1 = eatNum();
                    y1 = eatNum();
                case 'S':
                    if (activeCmd === 'S') {
                        x1 = 2 * x - x2;
                        y1 = 2 * y - y2;
                    }
                    x2 = eatNum();
                    y2 = eatNum();
                    nx = eatNum();
                    ny = eatNum();
                    path.bezierCurveTo(x1, -y1, x2, -y2, nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'c':
                    x1 = x + eatNum();
                    y1 = y + eatNum();
                case 's':
                    if (activeCmd === 's') {
                        x1 = 2 * x - x2;
                        y1 = 2 * y - y2;
                    }
                    x2 = x + eatNum();
                    y2 = y + eatNum();
                    nx = x + eatNum();
                    ny = y + eatNum();
                    path.bezierCurveTo(x1, -y1, x2, -y2, nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'Q':
                    x1 = eatNum();
                    y1 = eatNum();
                case 'T':
                    if (activeCmd === 'T') {
                        x1 = 2 * x - x1;
                        y1 = 2 * y - y1;
                    }
                    nx = eatNum();
                    ny = eatNum();
                    path.quadraticCurveTo(x1, -y1, nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'q':
                    x1 = x + eatNum();
                    y1 = y + eatNum();
                case 't':
                    if (activeCmd === 't') {
                        x1 = 2 * x - x1;
                        y1 = 2 * y - y1;
                    }
                    nx = x + eatNum();
                    ny = y + eatNum();
                    path.quadraticCurveTo(x1, -y1, nx, -ny);
                    x = nx;
                    y = ny;
                    break;
                case 'A':
                    rx = eatNum();
                    ry = eatNum();
                    xar = eatNum() * DEGS_TO_RADS;
                    laf = eatNum();
                    sf = eatNum();
                    nx = eatNum();
                    ny = eatNum();
                    x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
                    y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;

                    var norm = Math.sqrt(
                            (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
                            (rx * rx * y1 * y1 + ry * ry * x1 * x1));
                    if (laf === sf) norm = -norm;
                    x2 = norm * rx * y1 / ry;
                    y2 = norm * -ry * x1 / rx;

                    cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
                    cy = Math.sin(xar) * x2 - Math.cos(xar) * y2 + (y + ny) / 2;

                    var u = new THREE.Vector2(1, 0);
                    var v = new THREE.Vector2((x1 - x2) / rx, (y1 - y2) / ry);
                    var startAng = Math.acos(u.dot(v) / u.length() / v.length());
                    if (u.x * v.y - u.y * v.x < 0) startAng = -startAng;

                    u.x = (-x1 - x2) / rx;
                    u.y = (-y1 - y2) / ry;

                    var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
                    if (v.x * u.y - v.y * u.x < 0) deltaAng = -deltaAng;
                    if (!sf && deltaAng > 0) deltaAng -= Math.PI * 2;
                    if (sf && deltaAng < 0) deltaAng += Math.PI * 2;

                    path.absarc(cx, -cy, rx, startAng, startAng + deltaAng, sf);
                    x = nx;
                    y = ny;
                    break;
                default :
                    console.log(">>>" + activeCmd + "<<<")
//                    throw  new Error("weird path command:" + activeCmd);
            }

            if (canRepeat && nextIsNum())
                continue;
            activeCmd = pathStr[idx++];
        }

        return path;
    }
}
