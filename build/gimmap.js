/**
 * @author bob / http://bobliaos.diandian.com
 * */

var GIM = {
    VERSION : '0.0.1',
    INFO : " *** Author:bob / http://bobliaos.diandian.com / FOR LOVE AND PEACE ***",
    _map : null,
    _mapInstance : null,
    set mapInstance(value){
        throw (new Error("THE MAP INSTANCE CAN'T BE SET!!!"));
    },
    get mapInstance(){
        if(this._mapInstance === null){
            console.log("- [GimMap]GIM.VERSION:",this.VERSION,this.INFO);
            this._mapInstance = document.createElement("div");
            this._mapInstance.style.cssText = "width: 1040px;height: 1440px;overflow: hidden;position: absolute;background:#000000";
            this._map = new GIM.Map3D(this._mapInstance);
        }
        return this._mapInstance;
    },
    goDetail : function(shopId){},
    navitateTo : function(shopId){},
    setSize : function(width,height){this._map.setSize(width,height);}
};

GIM.NODE_TYPE_ASTAR 		= "0";
GIM.NODE_TYPE_GROUND 		= "1";
GIM.NODE_TYPE_SHOP 		    = "2";
GIM.NODE_TYPE_MACHINE		= "3";
GIM.NODE_TYPE_ESCALATOR 	= "4";
GIM.NODE_TYPE_LIFT 		    = "5";
GIM.NODE_TYPE_STAIRS        = "6";
GIM.NODE_TYPE_TOILET		= "7";
GIM.NODE_TYPE_SERVICE		= "8";
GIM.NODE_TYPE_ATM   		= "9";

GIM.SERVER                  = "192.168.1.208:3000";
GIM.MACHINE_NODE_ID         = "node_2014_8_13_01:18:25_578";

GIM.FLOOR_GAP               = 700;
GIM.PATH_POINT_GAP          = 12;
GIM.PATH_COLOR              = 0xFF0000;
GIM.MAP_OFFSET_Y            = 200;
GIM.MAP_BACKGROUND_COLOR    = 0xDDDDDD;
GIM.SELECTED_COLOR          = 0xFFBB00;
GIM.FONT_NAME               = "Microsoft Yahei";
//GIM.FONT_NAME             = "造字工房悦黑演示版常规体";
GIM.SHADOW_MAP_SIZE         = 2 * 1024;

GIM.CONFIG_URL              = "map.conf";
GIM.DATA_SOURCE_URL         = "assets/data.sgxml";
GIM.SHOP_LIST_URL           = "assets/shoplist.json";
GIM.DEFAULT_SHOP_LOGO_URL   = "assets/img/shoplogo/0.png";

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.FloorLogos = function(container){
	var obj = {
		pin : doucment.createElement("canvas"),
	}

	pin.width = 300;
	pin.height = 300;
	pin.style.cssText = "width:" + pin.width + "px;height:" + pin.height + "px;position:absolute;";
	pin.id = "pinCanvas";
	container.appendChild(obj.pin);

	return obj;
}

/**
 * <div id="container">
 *     <canvas id="menuCanvas"/>
 *     <canvas id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.MapPin = function (parentContainer) {
    var pin = {
        width: 180,
        height: 160,
//        pinRadius: 57,
//        maxRadius: 98,
        pinRadius: 42,
        maxRadius: 86,
        container: document.createElement("div"),
        menuCanvas: document.createElement("canvas"),
        pinCanvas: document.createElement("canvas"),
        logoCanvas: document.createElement("canvas"),
        logoImage: new Image(),
        gotoImage: new Image(),
        searchImage: new Image(),
        init: function () {
            parentContainer.appendChild(this.container);
            this.container.appendChild(this.menuCanvas);
            this.container.appendChild(this.pinCanvas);
            this.container.appendChild(this.logoCanvas);
//            this.container.appendChild(this.logoImage);

            this.container.appendChild(this.gotoImage);
            this.container.appendChild(this.searchImage);

            this.container.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;display:none;";   //background:#222222
            this.menuCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.menuCanvas.width = this.width;
            this.menuCanvas.height = this.height;
            this.pinCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.pinCanvas.width = this.width;
            this.pinCanvas.height = this.height;
            this.logoCanvas.width = 90;
            this.logoCanvas.height = 90;
            this.logoCanvas.cssText = "width:82px;height:82px";

            this.pinCanvas.id = "pinCanvas";
            this.logoCanvas.id = "logoCanvas";
            this.gotoImage.id = "gotoImage";
            this.searchImage.id = "searchImage";

            this.logoImage.bindPin = this;
            this.logoImage.onload = function(event){
                var left = (this.bindPin.width - event.currentTarget.naturalWidth) * 0.5;
                var top = (this.bindPin.height - event.currentTarget.naturalHeight) * 0.5;
                this.bindPin.logoCanvas.style.cssText = "width:90px;height:90px;position:absolute;top:" + top + "px;left:" + left + "px;display:block";
                this.bindPin.updateDisplay();
            }

            this.gotoImage.src = "assets/img/mappin/goto.png";
            this.gotoImage.style.cssText = "top: 20px;position: absolute;left: 96px;";
            this.searchImage.src = "assets/img/mappin/search.png";
            this.searchImage.style.cssText = "top: 56px;position: absolute;left: 132px;";
        },
        _isOpenning: false,
        open: function (x, y, shopLogoURL) {
            this._isOpenning = true;

            if(shopLogoURL === "") shopLogoURL = GIM.DEFAULT_SHOP_LOGO_URL;
            else shopLogoURL = "http://" + shopLogoURL;
            this.logoImage.src = shopLogoURL;
            console.log("- [GimMap]MapPin.open:",shopLogoURL,this.logoImage.src);

            this.container.style.display = "block";
            this.container.style.left = (x - this.width * 0.5) + "px";
            this.container.style.top = (y - this.height) + "px";

            TWEEN.remove(this);
            TWEEN.remove(this.gotoImage.style);
            TWEEN.remove(this.searchImage.style);

            this.radius = 10;
            this.alpha = 0.3;
            this.rotation = 0;
            this.gotoImage.style.display = this.searchImage.style.display = "none";
            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            new TWEEN.Tween(this).to({alpha: 1, rotation: 0, radius: this.maxRadius}, 500).easing(TWEEN.Easing.Elastic.Out).onComplete(function(){
                this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
                this.gotoImage.style.display = this.searchImage.style.display = "block";
                new TWEEN.Tween(this.gotoImage.style).to({opacity:1},200).start();
                new TWEEN.Tween(this.searchImage.style).to({opacity:1},200).start();
            }).start();
        },
        close: function () {
            this._isOpenning = false;
            this.logoImage.src = "";
            this.logoCanvas.style.display = "none";
            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            new TWEEN.Tween(this).to({alpha: 0, rotation: 0, radius: 10}, 400).easing(TWEEN.Easing.Back.In).onComplete(function () {
                if (!this._isOpenning)
                    this.container.style.display = "none";
            }).start();
        },
        _radius: 100,
        set radius(value) {
            this._radius = value > this.maxRadius ? this.maxRadius : value;
            this.updateDisplay();
        },
        get radius() {
            return this._radius;
        },
        _rotation: 0,
        set rotation(value) {
            this._rotation = value;
            this.updateDisplay();
        },
        get rotation() {
            return this._rotation;
        },
        _alpha: 0,
        set alpha(value) {
            this._alpha = value;
            this.updateDisplay();
        },
        get alpha() {
            return this._alpha;
        },
        updateDisplay: function () {
            var menuCanvasCTX = this.menuCanvas.getContext("2d");
            var pinCanvasCTX = this.pinCanvas.getContext("2d");
            var logoCanvasCTX = this.logoCanvas.getContext("2d");

            //clear all
            menuCanvasCTX.clearRect(0, 0, this.width, this.height);
            pinCanvasCTX.clearRect(0, 0, this.width, this.height);
            logoCanvasCTX.clearRect(0, 0, this.width, this.height);

            var tmpRadius = this._radius > this.maxRadius ? this.maxRadius : this._radius;
            tmpRadius = tmpRadius < 0 ? 0 : tmpRadius;

            pinCanvasCTX.strokeStyle = "rgba(255,255,255," + this._alpha + ")";
            pinCanvasCTX.lineWidth = 4;
            pinCanvasCTX.fillStyle = "rgba(195,13,35," + this._alpha + ")";
            pinCanvasCTX.lineCap = "round";
            pinCanvasCTX.beginPath();
            var centerX = this.width * 0.5;
            var centerY = this.height - this._radius + 20;
            if(centerY < this.height * 0.5 + 20) centerY = this.height * 0.5 + 20;
            var bottomY = this.height - pinCanvasCTX.lineWidth;
            var curRadius = tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius;
            pinCanvasCTX.moveTo(centerX, bottomY);
            pinCanvasCTX.arc(centerX, centerY, curRadius, Math.PI * (0.5 + 0.13), Math.PI * (0.5 - 0.13));
            pinCanvasCTX.lineTo(centerX, bottomY);
            pinCanvasCTX.stroke();
            pinCanvasCTX.fill();
            pinCanvasCTX.closePath();

            //draw menuCanvas
            if (tmpRadius > this.pinRadius + 10) {
                var angle = 8 * Math.PI / 180;

                menuCanvasCTX.strokeStyle = "rgba(255,255,255," + this._alpha + ")";
                menuCanvasCTX.lineWidth = 4;
                menuCanvasCTX.fillStyle = "rgba(235,97,104," + this._alpha + ")";
                var menuCenterX = this.width * 0.5;
                var menuCenterY = this.height * 0.5 + 20;
                menuCanvasCTX.beginPath();
                menuCanvasCTX.moveTo(menuCenterX, menuCenterY);
                menuCanvasCTX.arc(menuCenterX, menuCenterY, tmpRadius,  - Math.PI * 0.5,- Math.PI * 0.254);
                menuCanvasCTX.lineTo(menuCenterX, menuCenterY);
                menuCanvasCTX.moveTo(menuCenterX, menuCenterY);
                menuCanvasCTX.arc(menuCenterX, menuCenterY, tmpRadius, -Math.PI * 0.246,0);
                menuCanvasCTX.lineTo(menuCenterX, menuCenterY);
                menuCanvasCTX.closePath();
                menuCanvasCTX.stroke();
                menuCanvasCTX.fill();
            }

            var rate = 1;
            if(this.pinRadius > this._radius){
                rate = this._radius / this.pinRadius;
            }

            try{
                this.logoCanvas.style.top = (centerY - this.pinRadius * rate + this.pinRadius - this.logoImage.height * 0.5 + 1.5) + "px";
                var logoRadius = (tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius) - 3;
                if(logoRadius < 0) logoRadius = 0;
                logoCanvasCTX.beginPath();
                logoCanvasCTX.arc(this.logoImage.width * 0.5, logoRadius , logoRadius, Math.PI * 0, Math.PI * 2);
                var pat = logoCanvasCTX.createPattern(this.logoImage, "no-repeat");
                logoCanvasCTX.fillStyle = pat;
                logoCanvasCTX.fill();
                logoCanvasCTX.closePath();
            }catch (e){
                console.log("- [GimMap]MapPin Load Image Error!");
                this.logoImage.src = GIM.DEFAULT_SHOP_LOGO_URL;
            }
        }
    }

    pin.init();

    return pin;
}

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.FloorData = function(gElement){
    var data = {
        origSVG : gElement,
        floorId : gElement.getAttribute("id"),
        unitsData : {}
    };

    var pathElements = gElement.getElementsByTagName('path');
    for(var pathIndex = 0;pathIndex < pathElements.length;pathIndex ++){
        var pathElement = pathElements[pathIndex];
        var unitData = new GIM.UnitData(pathElement);
        unitData.floorId = data.floorId;
        data.unitsData[unitData.nodeId] = unitData;
    }

    return data;
}

GIM.UnitData = function(pathElement){
    var data = {
        origSVG : pathElement,
        nodeId : pathElement.getAttribute("nodeId"),
        nodeTypeId : pathElement.getAttribute("nodeTypeId"),
        bindNodeIds : pathElement.getAttribute("bindNodeIds"),
        bindShopId : pathElement.getAttribute("bindShopId"),
        d : pathElement.getAttribute("d"),
        fill : pathElement.getAttribute("fill"),
        deep : pathElement.getAttribute("deep"),
        floorId : null,
        shopName : "",
        origZ : 0
    };
    var nodePositionStringArr = pathElement.getAttribute("nodePosition").split(",");
    data.nodePosition = {
        x : parseFloat(nodePositionStringArr[0]),
        y : parseFloat(nodePositionStringArr[1])
    }
    data.selectable = true;
    data.astarNode = new GIM.AStarNode(data);

    for(var i = 0;i < GIM.shopList.length;i ++){
        var shopData = GIM.shopList[i];
        if(shopData.shop_room === data.bindShopId){
            data.shopName = shopData.name;
            break;
        }
    }

    return data;
}

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.SVGParser = {

    loadURL : function(sourceURL,callBackFunc){
        console.log("- [GimMap]SVGParser.loadURL >>> ",sourceURL);
        var svgLoader = new XMLHttpRequest();
        svgLoader.onreadystatechange = function () {
            if (svgLoader.readyState == 4) {
                if (svgLoader.status == 200) {
                    var svgString = svgLoader.responseText;
                    callBackFunc(svgString);
                }
            }
        }
        svgLoader.open("GET", sourceURL, false);
        svgLoader.send(null);
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

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.AStar = {
    search : function(nodes,startNodeId,endNodeId){
        //clear
        for (var key in nodes){
            var node = nodes[key];
            node.f = 0; node.g = 0; node.h = 0;
            node.closed = false;
            node.parent = null;
        }

        var startNode = nodes[startNodeId];
        var endNode = nodes[endNodeId];

        if(startNode && endNode)
        {
            function calculateDistance(node1,node2){
                var dx = node1.x - node2.x;
                var dy = node1.y - node2.y;
                return Math.sqrt(dx * dx + dy * dy);
            };

            var openList = [];
            var closeList = [];
            openList.push(startNode);
            while(openList.length > 0){
                var curNode = openList.pop();
                closeList.push(curNode);
                if(curNode === endNode){
                    break;
                }else{
                    for (var i = 0;i < curNode.bindNodes.length;i ++){
                        var bindNode = curNode.bindNodes[i];
                        if(closeList.indexOf(bindNode) < 0){
                            bindNode.g = calculateDistance(startNode,endNode);
                            bindNode.h = calculateDistance(bindNode,endNode);
                            bindNode.f = bindNode.g + bindNode.h;
                            bindNode.parent = curNode;
                            openList.push(bindNode);
                        }
                    }
                    openList.sort(function(node1,node2){
                        return node1.f < node2.f;
                    });
                }
            }
        }

        var pathNodes =[];
        var closeNode = closeList.pop();
        while(closeNode){
            pathNodes.push(closeNode);
            closeNode = closeNode.parent;
        }

        return pathNodes;
    }
}

GIM.AStarGraph = function (){
    this.nodes = [];
}

GIM.AStarNode = function (unitData){
    return {
        id : unitData.nodeId,
        data : unitData,
        x : unitData.nodePosition.x,
        y : unitData.nodePosition.y,
        f : 0,
        g : 0,
        h : 0,
        parent : null,
        bindNodes : []
    }
}

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function (gElement) {
    this.data = new GIM.FloorData(gElement);
    this.subUnit3Ds = {};
    this.mesh = new THREE.Object3D();
    this.mesh.displayUnit3D = this;

    console.log("- [GimMap]DisplayFloor3D.constructor:",this.data.floorId, "CONSTRUCTING...");

    for (var key in this.data.unitsData) {
        var unitData = this.data.unitsData[key];
        var displayUnit3D = new GIM.DisplayUnit3D(unitData);
        if(displayUnit3D.mesh) {
            this.mesh.add(displayUnit3D.mesh);
        }
        this.subUnit3Ds[unitData.nodeId] = displayUnit3D;
    }
    return this;
}

GIM.DisplayUnit3D = function (unitData) {
    var tmpMesh = null;
    function addMesh(){
        var path = GIM.SVGParser.parse(unitData.d);
        var shape3d = path.toShapes(true)[0].extrude({amount: unitData.deep * 1, bevelEnabled: false});

        var color = new THREE.Color(unitData.fill);
        var material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color});

        tmpMesh = new THREE.Mesh(shape3d, material);
    }

    var positionOffsetZ = 10;

    function addLogo(logoURL,isServiceLogo){
        var logoSize = isServiceLogo ? 60 : 80;

        var logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize, 1, 1);
        var logoTexture = THREE.ImageUtils.loadTexture(logoURL);
        var logoMaterial = new THREE.MeshBasicMaterial({map: logoTexture, transparent: true});
        var logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.isServiceLogo = isServiceLogo;
        if(tmpMesh) tmpMesh.add(logoMesh);
        else tmpMesh = logoMesh;
        logoMesh.castShadow = true;
        logoMesh.receiveShadow = true;
        logoMesh.position.x = unitData.nodePosition.x;
        logoMesh.position.y = - unitData.nodePosition.y + (isServiceLogo ? 0 : logoSize * 0.5);
        logoMesh.position.z = parseInt(unitData.deep) + positionOffsetZ;
        logoMesh.rotation.x = Math.PI * 0.25;
        if(isServiceLogo) {
            unitData.origZ = 50;
            logoMesh.position.z = unitData.origZ;
        }
    }

    function addText(text,offsetY,fontSize){
        if(text == "") return;
        if(offsetY === undefined) offsetY = 0;
        if(fontSize === undefined) fontSize = 18;

//        var fontStyle = "Bold " + fontSize + "px " + GIM.FONT_NAME;
        var fontStyle = fontSize + "px " + GIM.FONT_NAME;

        var textCanvas = document.createElement("canvas");
//        document.body.appendChild(textCanvas);

        var textCTX = textCanvas.getContext("2d");
        textCTX.font = fontStyle;
        textCanvas.width = textCTX.measureText(text).width + 2;
        textCanvas.height = 24;
        textCanvas.style.cssText = "width:"+textCanvas.width+"px;height:"+textCanvas.height+"px;background:#FF0000;margin:2px;";

        textCTX.font = fontStyle;
        textCTX.fillStyle = "#000";
        textCTX.fillText(text,1,textCanvas.height - 6);

        var textGeometry = new THREE.PlaneGeometry(textCanvas.width,textCanvas.height,1,1);
        var textTexture = new THREE.Texture(textCanvas);
        textTexture.needsUpdate = true;
        var textMaterial = new THREE.MeshBasicMaterial({map:textTexture,transparent:true});
        var textMesh = new THREE.Mesh(textGeometry,textMaterial);
        textMesh.position.x = unitData.nodePosition.x;
        textMesh.position.y = - unitData.nodePosition.y - offsetY - textCanvas.height * 0.5;
        textMesh.position.z = parseInt(unitData.deep) + positionOffsetZ;
        if(tmpMesh) tmpMesh.add(textMesh);
        else tmpMesh = textMesh;
    }

    switch (unitData.nodeTypeId) {
        case GIM.NODE_TYPE_ASTAR:
            break;
        case GIM.NODE_TYPE_GROUND:
            addMesh();
            unitData.selectable = false;
            tmpMesh.position.z = - (unitData.deep * 1 + 1);
            break;
        case GIM.NODE_TYPE_SHOP:
            addMesh();
            if (unitData.bindShopId) {
//                addLogo("assets/img/shoplogo/0.png");
                addText(unitData.shopName);
                addText(unitData.bindShopId,18,14);
            }
            break;
        case GIM.NODE_TYPE_MACHINE:
            addLogo("assets/img/nodetypelogo/machine.png",true);
            break;
        case GIM.NODE_TYPE_ESCALATOR:
            addLogo("assets/img/nodetypelogo/escalator.png",true);
            break;
        case GIM.NODE_TYPE_LIFT:
            addLogo("assets/img/nodetypelogo/lift.png",true);
            break;
        case GIM.NODE_TYPE_TOILET:
            addLogo("assets/img/nodetypelogo/toilet.png",true);
            break;
        case GIM.NODE_TYPE_SERVICE:
            addLogo("assets/img/nodetypelogo/service.png",true);
            break;
        case GIM.NODE_TYPE_ATM:
            addLogo("assets/img/nodetypelogo/atm.png",true);
            break;
        default :
            break;
    }

    if(tmpMesh){
        tmpMesh.castShadow = true;
        tmpMesh.receiveShadow = true;
        this.mesh = tmpMesh;
        this.mesh.displayUnit3D = this;
    }
    this.data = unitData;

    return this;
}

/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (mainContainer) {
    var isDebug = false;

    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;

    var containerWidth,containerHeight,containerHalfWidth,containerHalfHeight;

    var renderer, stats, scene, camera, container3D, projector;

    var meshes = [];
    var serviceLogoMeshes = [];
    var sourceSVG;
    var floor3Ds = {};
    var curSelectedUnit3D = null;
    var curShownFloorIds = null;

    var pathMesh;
    var astarNodes = {};
    var floorSelecterLogos = [];
    var minFloorPositionZ = -4200;
    var maxFloorPositionZ = 1200;

    var pathAnimatePointMeshes = [];
    var pathAnimatePointSize = 4;
    var pathAnimateIndexDelta = 0;
    var pathAnimateTime = 60;
    var pathAnimateCircleLength = 25;

    var mapPin;
    var floorSelector;
    var serviceSelector;

    var preSelectedUnit3DMaterial = null;
    var selectedUnit3DMaterial = new THREE.MeshLambertMaterial({color: GIM.SELECTED_COLOR, ambient: GIM.SELECTED_COLOR, emissive: GIM.SELECTED_COLOR});

    var cameraPosition = {
        _radian: 0,
        _distance: 0,
        _posX: 0,
        set radian(value) {
            this._radian = value;
            this.setCamera(this._radian, this._distance, this._posX);
        },
        get radian() {
            return this._radian;
        },
        set distance(value) {
            this._distance = value;
            this.setCamera(this._radian, this._distance, this._posX);
        },
        get distance() {
            return this._distance;
        },
        set posX(value) {
            this._posX = value;
            this.setCamera(this._radian, this._distance, this._posX);
        },
        get posX() {
//            return this._posX;
        },
        setCamera: function (radian, distance, posX) {
            if (this._radian !== radian) this._radian = radian;
            if (this._distance !== distance) this._distance = distance;
            if (this._posX !== posX) this._posX = posX;
            var posZ = Math.cos(radian) * distance;
            var posY = Math.sin(radian) * distance + GIM.MAP_OFFSET_Y;
            camera.position.set(this._posX, -posY, posZ);
            camera.rotation.x = radian;
        }
    };


    //MAIN FUNCTIONS///////////////////////////////////////////

    function navigateTo(shopId) {
        selectUint3DByShopId(shopId);

        if (curSelectedUnit3D) {
            console.log("- [GimMap]Map3D.navigateTo Shop", curSelectedUnit3D.data.bindShopId);

            var startFloorId = astarNodes[GIM.MACHINE_NODE_ID].data.floorId;
            var endFloorId = curSelectedUnit3D.data.floorId;
            showFloors(startFloorId === endFloorId ? [startFloorId] : [startFloorId, endFloorId]);

            var vector3Ds = [];
            var pathNodes = GIM.AStar.search(astarNodes, GIM.MACHINE_NODE_ID, curSelectedUnit3D.data.nodeId);
            for (var i = 0; i < pathNodes.length; i++) {
                var pathNode = pathNodes[i];
                var floor3D = floor3Ds[pathNode.data.floorId];
                var vector3 = new THREE.Vector3(pathNode.x, pathNode.y, floor3D.mesh.position.z + 5);
                vector3Ds.push(vector3);
            }
            drawPath(vector3Ds);
            showPinOnUnit3D(curSelectedUnit3D);
        }
    }

    function showFloors(floorIds) {
        if (curShownFloorIds === null) curShownFloorIds = floorIds;

        if (mapPin._isOpenning) mapPin.close();

        console.log("- [GimMap]Map3D.showFloors:", floorIds.toString());

        //UPDATE FLOOR LOGOS
        for (var i = 0; i < floorSelecterLogos.length; i++) {
            var floorLogo = floorSelecterLogos[i];
            floorLogo.selected = false;
            if (floorIds.indexOf(floorSelecterLogos[i].id) > -1) {
                floorLogo.selected = true;
            }
        }

        //HIDE ALL FLOORS
        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            floor3D.mesh.visible = false;
            floor3D.mesh.position.z = minFloorPositionZ;
        }

        if (floorIds.length === 1) {
            if (curShownFloorIds.length > 0) {
                var preFloorId = curShownFloorIds[0];
                var curFloorId = floorIds[0];
                var preVisibleFloor3D = floor3Ds[preFloorId];
                var curVisibleFloor3D = floor3Ds[curFloorId];

                curVisibleFloor3D.mesh.visible = preVisibleFloor3D.mesh.visible = true;

                if (preVisibleFloor3D !== curVisibleFloor3D) {
                    var isUp = parseInt(preFloorId.substr(5, 1)) > parseInt(curFloorId.substr(5, 1));
                    preVisibleFloor3D.mesh.position.z = 0;
                    curVisibleFloor3D.mesh.position.z = isUp ? minFloorPositionZ : maxFloorPositionZ;
                    new TWEEN.Tween(preVisibleFloor3D.mesh.position).to({z: isUp ? maxFloorPositionZ : minFloorPositionZ}, 800).easing(TWEEN.Easing.Exponential.Out).start();
                    new TWEEN.Tween(curVisibleFloor3D.mesh.position).to({z: 0}, 800).easing(TWEEN.Easing.Exponential.Out).start();
                } else {
                    preVisibleFloor3D.mesh.position.z = 0;
                }

            }
        } else if (floorIds.length === 2) {
            var floor3D1 = floor3Ds[floorIds[0]];
            var floor3D2 = floor3Ds[floorIds[1]];
            floor3D1.mesh.visible = floor3D2.mesh.visible = true;
            var isUp = parseInt(floor3D1.data.floorId.substr(5, 1)) > parseInt(floor3D2.data.floorId.substr(5, 1));
            floor3D1.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (isUp ? 1 : -1);
            floor3D2.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (isUp ? -1 : 1);
        }

        curShownFloorIds = floorIds;
    }

    function showPinOnUnit3D(unit3D) {
        if (unit3D === null) return;

        var wordCoordinate = toScreenCoordinate(unit3D.data.nodePosition.x, -unit3D.data.nodePosition.y, unit3D.mesh.parent.position.z + parseInt(unit3D.data.deep) + 20);
        mapPin.open(wordCoordinate.x, wordCoordinate.y, getShopLogoURL(unit3D.data.bindShopId));
    }

    function showNodeTypes(nodeTypeId) {
        for (var i = 0; i < curShownFloorIds.length; i++) {
            var floor3D = floor3Ds[curShownFloorIds[i]];
            for (var nodeId in floor3D.subUnit3Ds) {
                var unit3D = floor3D.subUnit3Ds[nodeId];
                if (unit3D.data.nodeTypeId === nodeTypeId) {
                    unit3D.mesh.material.opacity = 0;
                    unit3D.mesh.scale.x = unit3D.mesh.scale.y = 1.2;
                    new TWEEN.Tween(unit3D.mesh.material).to({opacity: 1}, 600).easing(TWEEN.Easing.Back.InOut).repeat(2).start();
                    new TWEEN.Tween(unit3D.mesh.scale).to({x: 1, y: 1}, 600).easing(TWEEN.Easing.Elastic.InOut).repeat(2).start();
                } else {

                }
            }
        }
    }

    function drawPath(vector3Ds) {
        vector3Ds = averageVectors(vector3Ds);

        var pathGeometry = new THREE.Geometry();
        var vector3D;

        for (var i = 0; i < vector3Ds.length; i++) {
            vector3D = vector3Ds[i];
            pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x, -vector3D.y, vector3D.z);
        }
        pathMesh = new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({color: GIM.PATH_COLOR}));
        pathMesh.visible = isDebug;

        for (var i = 0; i < pathGeometry.vertices.length; i++) {
            var vector3DofPath = pathGeometry.vertices[i];
            if (!(pathGeometry.vertices[i + 1] && pathGeometry.vertices[i].z !== pathGeometry.vertices[i + 1].z && i % 2 != 0)) {
                var pointGeometry = new THREE.CircleGeometry(pathAnimatePointSize, 8);
                var pointMaterial = new THREE.MeshBasicMaterial({color: GIM.PATH_COLOR});
                var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
                container3D.add(pointMesh);
                pathAnimatePointMeshes.push(pointMesh);
                pointMesh.position.x = vector3DofPath.x;
                pointMesh.position.y = vector3DofPath.y;
                pointMesh.position.z = vector3DofPath.z + 15;
            }
        }

        container3D.add(pathMesh);
    }

    function doPathAnimate() {
        pathAnimateIndexDelta++;
        if (pathAnimateIndexDelta > pathAnimateCircleLength) pathAnimateIndexDelta = 0;
        for (var i = 0; i < pathAnimatePointMeshes.length; i++) {
            var mesh = pathAnimatePointMeshes[i];
            mesh.scale.x = mesh.scale.y = (1 - (i + pathAnimateIndexDelta) % pathAnimateCircleLength / pathAnimateCircleLength);
            if (mesh.scale.x < 0.3)
                mesh.scale.x = mesh.scale.y = 1;
        }
    }

    function clearPath() {
        if (pathMesh) {
            pathMesh.parent.remove(pathMesh);
            pathMesh = null;
            delete pathMesh;
        }

        while (pathAnimatePointMeshes.length > 0) {
            var mesh = pathAnimatePointMeshes.pop();
            if (mesh) {
                mesh.parent.remove(mesh);
                mesh = null;
                delete mesh;
            }
        }
    }

    function setSize(width,height){
        console.log("- [GimMap]Map3D.setSize:",width,height);

        containerWidth = width;
        containerHeight = height;

        containerHalfWidth = containerWidth * 0.5;
        containerHalfHeight = containerHeight * 0.5;

        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(containerWidth , containerHeight);
    }

    //ASSIST FUNCTIONS//////////////////////////////////////////

    function averageVectors(vector3Ds) {
        var resultVector3Ds = [];

        var preVector = null;
        for (var i = 0; i < vector3Ds.length; i++) {
            var vector = vector3Ds[i];
            if (preVector) {
                resultVector3Ds.push(preVector);
                var tmpVector = vector.clone().sub(preVector);
                var length = tmpVector.length();
                if (length > GIM.PATH_POINT_GAP) {
                    var times = parseInt(length / GIM.PATH_POINT_GAP);
                    for (var t = 1; t < times; t++) {
                        resultVector3Ds.push(tmpVector.clone().multiplyScalar(t / times).add(preVector));
                    }
                }
            }
            preVector = vector;
        }

        return resultVector3Ds;
    }

    //UPDATE curSelectedUnit3D ONLY!
    function selectUint3DByShopId(shopId) {
        clearSelectedUnit3D();
        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            for (var nodeId in floor3D.subUnit3Ds) {
                var unit3D = floor3D.subUnit3Ds[nodeId];
                if (shopId === unit3D.data.bindShopId) {
                    console.log("- [GimMap]Map3D.selectUint3DByShopId:", shopId, "DONE!");
                    selectUnit3D(unit3D);
                    break;
                }
            }
        }
    }

    //UPDATE curSelectedUnit3D ONLY!
    function selectUnit3DByPosition(mouseX, mouseY) {
        clearSelectedUnit3D();
        mouseX = 2 * mouseX / containerWidth - 1;
        mouseY = 1 - 2 * mouseY / containerHeight;
        var vec = new THREE.Vector3(mouseX, mouseY, 0);
        projector.unprojectVector(vec, camera);
        var rayCaster = new THREE.Raycaster(camera.position, vec.sub(camera.position).normalize());
        var intersects = rayCaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            if (mesh.displayUnit3D && mesh.displayUnit3D.data.selectable) {
                console.log("- [GimMap]Map3D.selectUnit3DByPosition", mesh.displayUnit3D.data.nodeId);
                selectUnit3D(mesh.displayUnit3D);
            }
        }
    }

    function selectUnit3D(unit3D) {
        curSelectedUnit3D = unit3D;
        if (!unit3D.mesh.isServiceLogo) {
            preSelectedUnit3DMaterial = curSelectedUnit3D.mesh.material;
            var color = new THREE.Color(curSelectedUnit3D.data.fill);
            color.add(new THREE.Color(0x333333));
            curSelectedUnit3D.mesh.material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color });
//            curSelectedUnit3D.mesh.material = selectedUnit3DMaterial;
        } else {

            for (var i = 0; i < serviceLogoMeshes.length; i++) {
                var mesh = serviceLogoMeshes[i];
                new TWEEN.Tween(mesh.position).to({z: unit3D.data.origZ}, 500).easing(TWEEN.Easing.Elastic.Out).start();
            }
            new TWEEN.Tween(unit3D.mesh.position).to({z: unit3D.data.origZ + 20}, 500).easing(TWEEN.Easing.Elastic.Out).start();
        }
        new TWEEN.Tween(unit3D.mesh.scale).to({z: 1.4, x: unit3D.mesh.isServiceLogo ? 1.1 : 1, y: unit3D.mesh.isServiceLogo ? 1.1 : 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
    }

    //UPDATE curSelectedUnit3D ONLY!
    function clearSelectedUnit3D() {
        if (curSelectedUnit3D !== null) {
            if (preSelectedUnit3DMaterial !== null && !curSelectedUnit3D.mesh.isServiceLogo) curSelectedUnit3D.mesh.material = preSelectedUnit3DMaterial;
            new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1, x: 1, y: 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
            curSelectedUnit3D = null;
        }
    }

    function toScreenCoordinate(worldX, worldY, worldZ) {
        var projector = new THREE.Projector();
        var worldVector = new THREE.Vector3(worldX + container3D.position.x, worldY, worldZ);
        var vector = projector.projectVector(worldVector, camera);
        return {
            x: Math.round(vector.x * containerHalfWidth + containerHalfWidth),
            y: Math.round(-vector.y * containerHalfHeight + containerHalfHeight)
        };
    }

    function getShopLogoURL(shopId) {
        var shopLogoURL = "";
        if (GIM.shopList) {
            for (var i = 0; i < GIM.shopList.length; i++) {
                var shop = GIM.shopList[i];
                if (shop.shop_room.toString() === shopId) {
                    console.log("- [GimMap]Map3D.getShopLogoURL:", shopId);
                    shopLogoURL = GIM.SERVER + "/system" + shop.shop_logo;
                }
            }
        }
        return shopLogoURL;
    }

    //EVENT HANDLERS/////////////////////////////////////////////

    function onContainerMouseDown(event) {
        event.preventDefault();

        mainContainer.addEventListener('mousemove', onContainerMouseMove, false);
        mainContainer.addEventListener('mouseup', onContainerMouseOut, false);
        mainContainer.addEventListener('mouseout', onContainerMouseOut, false);

        clearPath();
        mapPin.close();

        if (event.target.id === "gotoImage" && event.offsetY < mapPin.width) {
            if (curSelectedUnit3D) {
                console.log("- [GimMap]Map3D.onContainerMouseDown ShopId:", curSelectedUnit3D.data.bindShopId);
                if (curSelectedUnit3D.data.nodeTypeId === GIM.NODE_TYPE_SHOP) {
                    navigateTo(curSelectedUnit3D.data.bindShopId);
                }
            }
        } else if (event.target.id === "searchImage") {
            console.log("- [GimMap]Map3D.goDetail:", curSelectedUnit3D.data.bindShopId);
            GIM.goDetail(curSelectedUnit3D.data.bindShopId);
        } else {
            selectUnit3DByPosition(event.offsetX, event.offsetY);
            if(curSelectedUnit3D){
                if (curSelectedUnit3D.data.nodeTypeId === GIM.NODE_TYPE_SHOP) {
                    showPinOnUnit3D(curSelectedUnit3D);
                } else {
                    console.log("- [GimMap]Map3D.navigateTo Shop", curSelectedUnit3D.data.bindShopId);

                    var startFloorId = astarNodes[GIM.MACHINE_NODE_ID].data.floorId;
                    var endFloorId = curSelectedUnit3D.data.floorId;
                    showFloors(startFloorId === endFloorId ? [startFloorId] : [startFloorId, endFloorId]);

                    var vector3Ds = [];
                    var pathNodes = GIM.AStar.search(astarNodes, GIM.MACHINE_NODE_ID, curSelectedUnit3D.data.nodeId);
                    for (var i = 0; i < pathNodes.length; i++) {
                        var pathNode = pathNodes[i];
                        var floorId = pathNode.data.floorId;
                        var floor3D = floor3Ds[floorId];
                        var vector3 = new THREE.Vector3(pathNode.x, pathNode.y, floor3D.mesh.position.z + 5);
                        vector3Ds.push(vector3);
                    }
                    drawPath(vector3Ds);
                }
            }
        }
    }

    function onContainerMouseMove(event) {
        mouseX = event.clientX - containerHalfWidth;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
    }

    function onContainerMouseOut(event) {
        mainContainer.removeEventListener('mousemove', onContainerMouseMove, false);
        mainContainer.removeEventListener('mouseup', onContainerMouseOut, false);
        mainContainer.removeEventListener('mouseout', onContainerMouseOut, false);
    }

    //INITIALIZE FUNCTIONS///////////////////////////////////////

    function init() {
        GIM.SVGParser.loadURL(GIM.SHOP_LIST_URL, function (jsonString) {
            GIM.shopList = JSON.parse(jsonString);
            GIM.navitateTo = navigateTo;
            GIM.setSize = setSize;
            init3d();
            if (isDebug) addStats();
            mainContainer.addEventListener('mousedown', onContainerMouseDown, false);
            animate();
            setInterval(doPathAnimate, pathAnimateTime);
        });
    }

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
        mainContainer.appendChild(renderer.domElement);
        renderer.setClearColor(GIM.MAP_BACKGROUND_COLOR);
        renderer.setSize(64 , 64);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, 1, near, far);
        container3D = new THREE.Object3D();
        scene.add(container3D);

        setSize(parseFloat(mainContainer.style.width),parseFloat(mainContainer.style.height));

        var light = new THREE.DirectionalLight(0x000000, 0);
        scene.add(light);
        light.position.set(1400, -2200, 2200);
        light.target.position.set(500, -300, 0);
        light.castShadow = true;
        light.shadowCameraNear = 1800;
        light.shadowCameraFar = 4500;
        light.shadowBias = 0.0001;
        light.shadowDarkness = 0.6;
        light.shadowMapWidth = light.shadowMapHeight = GIM.SHADOW_MAP_SIZE;
        if(isDebug) light.shadowCameraVisible = true;

        var backLight = new THREE.DirectionalLight(0x333333, 1);
        scene.add(backLight);
        backLight.position.set(400, 500, 400);

        if (isDebug) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 50, 50), new THREE.MeshBasicMaterial({color: 0xEEEEEE, wireframe: true}));
            container3D.add(plane);
        }

        projector = new THREE.Projector();

        mapPin = new GIM.MapPin(mainContainer);

        GIM.SVGParser.loadURL(GIM.DATA_SOURCE_URL, function (sourceString) {
            addFloorSelector();
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);

            var floorElements = sourceSVG.getElementsByTagName('g');
            for (var floorIndex = floorElements.length - 1; floorIndex >= 0; floorIndex--) {
                var floorElement = floorElements[floorIndex];
                var floor3D = new GIM.DisplayFloor3D(floorElement);

                floor3Ds[floor3D.data.floorId] = floor3D;
                container3D.add(floor3D.mesh);

                for (var key in floor3D.subUnit3Ds) {
                    var pushMesh = floor3D.subUnit3Ds[key].mesh;
                    if (pushMesh) {
                        meshes.push(pushMesh);
                        if (pushMesh.isServiceLogo) serviceLogoMeshes.push(pushMesh);
                    }
                }

                var isCurFloor = false;
                for (var key in floor3D.data.unitsData) {
                    var unitData = floor3D.data.unitsData[key];
                    astarNodes[unitData.nodeId] = unitData.astarNode;
                    if (unitData.nodeId === GIM.MACHINE_NODE_ID) isCurFloor = true;
                }

                addFloorLogo(floor3D.data.floorId, "assets/img/floorlogo/" + floor3D.data.floorId + ".png", isCurFloor);
            }

            for (var nodeId in astarNodes) {
                var astarNode = astarNodes[nodeId];
                var bindNodeIdsString = astarNode.data.bindNodeIds;
                var bindNodeIds = bindNodeIdsString.split(',');
                for (var i in bindNodeIds) {
                    var bindNodeId = bindNodeIds[i];
                    var bindNode = astarNodes[bindNodeId];
                    if (bindNode)
                        astarNode.bindNodes.push(bindNode);
                }
            }

            showFloors([astarNodes[GIM.MACHINE_NODE_ID].data.floorId]);

            cameraPosition.setCamera(Math.PI * 0.25, 1800, 0);
            cameraPosition.posX = parseFloat(sourceSVG.getElementsByTagName('svg')[0].getAttribute("width")) * 0.5 - 100;
        });
    }

    function addFloorSelector() {
        floorSelector = document.createElement("div");
        mainContainer.appendChild(floorSelector);
        floorSelector.style.cssText = "position:absolute;top:240px;left:0px";

        serviceSelector = document.createElement("div");
        mainContainer.appendChild(serviceSelector);
        serviceSelector.style.cssText = "position:absolute;top:30px;left:240px";

        var imgURLs = ["assets/img/servicelogo/1.png", "assets/img/servicelogo/2.png", "assets/img/servicelogo/3.png", "assets/img/servicelogo/4.png", "assets/img/servicelogo/5.png", "assets/img/servicelogo/6.png"];   //"assets/img/servicelogo/1.png"
        var imgNodeTypeIds = [GIM.NODE_TYPE_MACHINE, GIM.NODE_TYPE_SERVICE, GIM.NODE_TYPE_ATM, GIM.NODE_TYPE_TOILET, GIM.NODE_TYPE_ESCALATOR, GIM.NODE_TYPE_LIFT];   //"assets/img/servicelogo/1.png"
        for (var i = 0; i < imgURLs.length; i++) {
            var img = new Image();
            serviceSelector.appendChild(img);
            img.style.cssText = "position:absolute;left:" + (i * 100) + "px";
            img.nodeTypeId = imgNodeTypeIds[i];
            img.src = imgURLs[i];
            img.onclick = function (event) {
                showNodeTypes(event.target.nodeTypeId);
                var targetImage = event.target;
                TWEEN.remove(targetImage);
                targetImage.style.opacity = 0;
                new TWEEN.Tween(targetImage.style).to({opacity: 1}, 300).easing(TWEEN.Easing.Exponential.InOut).start();
            }
        }
    }

    function addFloorLogo(floorId, logoURL, isCurFloor) {
        var floorLabelAndLogo = {
            id: floorId,
            width: 170,
            height: 120,
            container: document.createElement("div"),
            floorLabel: document.createElement("p"),
            floorCurLabel: document.createElement("p"),
            floorLogoImage: new Image(),
            _selected: false,
            set selected(value) {
                this._selected = value;
                this.container.style.opacity = value ? 1 : 0.4;
                this.container.style.border = value ? "1px dashed #FF0033" : "1px dashed #AAAAAA";
                this.container.style.color = value ? "#FF0033" : "#222222";
                this.floorCurLabel.style.display = value ? "block" : "none";
                TWEEN.remove(this);
                new TWEEN.Tween(this).to({scale: value ? 1.2 : 1}, 300).easing(TWEEN.Easing.Exponential.Out).start();
            },
            get selected() {
                return this._selected
            },
            _scale: 1,
            set scale(value) {
                this._scale = value;
                this.container.style.height = (this.height * value) + "px";
                this.container.style.width = (this.width * value) + "px";
            },
            get scale() {
                return this._scale;
            }
        };

        floorSelector.appendChild(floorLabelAndLogo.container);
        floorSelecterLogos.push(floorLabelAndLogo);

        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorLabel);
        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorCurLabel);
        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorLogoImage);

        floorLabelAndLogo.container.style.cssText = "position:relative;height:" + floorLabelAndLogo.height + "px;width:" + floorLabelAndLogo.width + "px;opacity:0.3;font-size: 26px;font-weight: bold;font-family:" + GIM.FONT_NAME;
        floorLabelAndLogo.floorLabel.style.cssText = "margin:0;position:absolute;left:2px;top:2px;line-height:22px";
        floorLabelAndLogo.floorCurLabel.style.cssText = "font-size: 20px;font-weight: normal;position:absolute;top:0px;left:40px;margin:0;";
        floorLabelAndLogo.floorLogoImage.style.cssText = "width:100%;position:absolute;top:36px;left:2px;";

        floorLabelAndLogo.floorLabel.innerHTML = floorId.substr(5, 1) + "F";
        floorLabelAndLogo.floorCurLabel.innerHTML = isCurFloor ? "当前楼层" : "目标楼层";
        floorLabelAndLogo.floorLogoImage.src = logoURL;

        floorLabelAndLogo.container.name = floorId;
        floorLabelAndLogo.container.addEventListener('mousedown', function (event) {
            var targetfloorId = event.currentTarget.name;
            showFloors([targetfloorId]);
        });
    }

    function addStats() {
        stats = new Stats();
        stats.domElement.style.cssText += 'position:absolute;top:0px';
        mainContainer.appendChild(stats.domElement);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (isDebug) {
//            camera.rotation.x += (targetRotation - camera.rotation.x) * 0.05;
            container3D.rotation.z += (targetRotation - container3D.rotation.z) * 0.05;
//            cameraPosition.distance += (targetRotation) * 10;
            stats.update();
        }

        for (var i = 0; i < serviceLogoMeshes.length; i++) {
            var mesh = serviceLogoMeshes[i];
//            mesh.lookAt(camera.position);
        }

        renderer.render(scene, camera);
        TWEEN.update();
    }

    GIM.SVGParser.loadURL(GIM.CONFIG_URL,function(configJSONString){
        var config = JSON.parse(configJSONString);
        if(typeof (config.server) !== "undefined"               && config.server !== "")            GIM.SERVER          = config.server;
        if(typeof (config.machindeNodeId) !== "undefined"       && config.machindeNodeId !== "")    GIM.MACHINE_NODE_ID = config.machindeNodeId;
        if(typeof (config.shadowRank) !== "undefined"           && config.shadowRank !== "")        GIM.SHADOW_MAP_SIZE = parseFloat(config.shadowRank) * 1024;
        if(typeof (config.sourceSVGURL) !== "undefined"         && config.sourceSVGURL !== "")      GIM.DATA_SOURCE_URL = config.sourceSVGURL;
        if(typeof (config.sourceShopListURL) !== "undefined"    && config.sourceShopListURL !== "") GIM.SHOP_LIST_URL   = config.sourceShopListURL;

        init();
    });
}
