/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (domElementContainer) {
    var isDebug = false;

    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;
    var containerWidth = domElementContainer.clientWidth;
    var containerHeight = domElementContainer.clientHeight;
    var containerHalfWidth = containerWidth * 0.5;
    var containerHalfHeight = containerHeight * 0.5;

    var renderer, stats;
    var scene, camera, container3D;
    var projector;

    var meshes = [];
    var logoOnlyMeshes = [];
    var sourceSVG;
    var floor3Ds = {};
    var curSelectedUnit3D;
    var curShownFloorIds = null;

    var pathMesh;
    var astarNodes = {};
    var floorLogoImages = [];

    var mapPin;
    var shopList;
    var floorSelector;
    var serviceSelector;

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
            return this._posX;
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

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
//        renderer = new THREE.CanvasRenderer({antialias: true});
        renderer.setClearColor(GIM.MAP_BACKGROUND_COLOR);
        renderer.setSize(containerWidth, containerHeight);
        domElementContainer.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(15, containerWidth / containerHeight, near, far);
        container3D = new THREE.Object3D();
        scene.add(container3D);

        var light = new THREE.DirectionalLight(0x333333);
        light.position.set(0.5, -0.3, 0.8).normalize();
        scene.add(light);

        if (isDebug) {
            var plane = new THREE.Mesh( new THREE.PlaneGeometry(5000, 5000, 50, 50), new THREE.MeshBasicMaterial({color: 0xEEEEEE, wireframe: true}));
            container3D.add(plane);
        }

        projector = new THREE.Projector();

        mapPin = new GIM.MapPin(domElementContainer);

        GIM.SVGParser.loadURL(GIM.DATA_SOURCE_URL, function (sourceString) {
            addFloorSelector();
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);
            var floorElements = sourceSVG.getElementsByTagName('g');
            for (var floorIndex = floorElements.length - 1; floorIndex >= 0; floorIndex--) {
                var floorElement = floorElements[floorIndex];
                var floor3D = new GIM.DisplayFloor3D(floorElement);

                floor3Ds[floor3D.data.floorId] = floor3D;
                container3D.add(floor3D.mesh);

                addFloorLogo(floor3D.data.floorId, "assets/img/floorlogo/" + floor3D.data.floorId + ".png");

                for (var key in floor3D.subUnit3Ds) {
                    var pushMesh = floor3D.subUnit3Ds[key].mesh;
                    if (pushMesh) {
                        meshes.push(pushMesh);
                        if (pushMesh.isLogo) logoOnlyMeshes.push(pushMesh);
                    }
                }

                for (var key in floor3D.data.unitsData) {
                    var unitData = floor3D.data.unitsData[key];
                    astarNodes[unitData.nodeId] = unitData.astarNode;
                }
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

            cameraPosition.setCamera(Math.PI * 0.15, 6400, 0);
            cameraPosition.posX = parseFloat(sourceSVG.getElementsByTagName('svg')[0].getAttribute("width")) * 0.5 - 100;
        });
    }

    function showFloors(floorIds) {
        if(curShownFloorIds === null) curShownFloorIds = floorIds;

        if(mapPin._isOpenning) mapPin.close();

        console.log("- [GimMap].showFloors:",floorIds.toString());

        //FLOOR LOGOS
        for (var i = 0; i < floorLogoImages.length; i++) {
            floorLogoImages[i].style.border = "0px solid #FF0000";
            floorLogoImages[i].style.opacity = 0.4;
            if (floorIds.indexOf(floorLogoImages[i].id) > -1) {
                floorLogoImages[i].style.opacity = 1;
                floorLogoImages[i].style.border = "1px solid #FF0000";
            }
        }

        var minFloorPositionZ = -3500;
        var maxFloorPositionZ = 2000;

        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            floor3D.mesh.visible = false;
            floor3D.mesh.position.z = minFloorPositionZ;
        }

        if(floorIds.length === 1){
            if(curShownFloorIds.length > 0){
                var preFloorId = curShownFloorIds[0];
                var curFloorId = floorIds[0];
                var preVisibleFloor3D = floor3Ds[preFloorId];
                var curVisibleFloor3D = floor3Ds[curFloorId];

                curVisibleFloor3D.mesh.visible = preVisibleFloor3D.mesh.visible = true;

                if(preVisibleFloor3D !== curVisibleFloor3D){
                    var isUp = parseInt(preFloorId.substr(5,1)) > parseInt(curFloorId.substr(5, 1));
                    preVisibleFloor3D.mesh.position.z = 0;
                    curVisibleFloor3D.mesh.position.z = isUp ? minFloorPositionZ : maxFloorPositionZ;

//                    preVisibleFloor3D.mesh.position.z = isUp ? maxFloorPositionZ : minFloorPositionZ;
//                    curVisibleFloor3D.mesh.position.z = 0;

                    new TWEEN.Tween(preVisibleFloor3D.mesh.position).to({z: isUp ? maxFloorPositionZ : minFloorPositionZ}, 800).easing(TWEEN.Easing.Exponential.Out).start();
                    new TWEEN.Tween(curVisibleFloor3D.mesh.position).to({z: 0}, 800).easing(TWEEN.Easing.Exponential.Out).start();
                }else{
                    preVisibleFloor3D.mesh.position.z = 0;
                }

            }
        }else if(floorIds.length === 2){
            var floor3D1 = floor3Ds[floorIds[0]];
            var floor3D2 = floor3Ds[floorIds[1]];
            floor3D1.mesh.visible = floor3D2.mesh.visible = true;
            var isUp = parseInt(floor3D1.data.floorId.substr(5,1)) > parseInt(floor3D2.data.floorId.substr(5, 1));
            floor3D1.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (isUp ? 1 : -1);
            floor3D2.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (isUp ? -1 : 1);
//            var projector = new THREE.Projector();
//            var world_vector = new THREE.Vector3(curSelectedUnit3D.data.nodePosition.x, -curSelectedUnit3D.data.nodePosition.y, floor3D.mesh.position.z);
//            var vector = projector.projectVector(world_vector, camera);
//            mapPin.open(Math.round(vector.x * containerHalfWidth + containerHalfWidth), Math.round(-vector.y * containerHalfHeight + containerHalfHeight), findShopLogoURL(curSelectedUnit3D.data.bindShopId));
        }

        curShownFloorIds = floorIds;



//        var startFloor3D = null;
//        var endFloor3D = null;
//        for (var key in floor3Ds) {
//            var floor3D = floor3Ds[key];
//            floor3D.mesh.visible = false;
//            if(floorIds.indexOf(floor3D.data.floorId) >= 0){
//                floor3D.mesh.visible = true;
//                if(!startFloor3D) {
//                    startFloor3D = floor3D;
//                    var startFloorPositionZ = 0;
//                    if(curShownFloorIds.length > 0){
//                        var curFloorId = curShownFloorIds[0];
//                        startFloorPositionZ = GIM.FLOOR_GAP * (parseInt(curFloorId.substring(5,curFloorId.length)) > parseInt(startFloor3D.data.floorId.substring(5,curFloorId.length)) ? 1 : -1) ;
//                        floor3D.mesh.position.z = startFloorPositionZ;
//                        new TWEEN.Tween(floor3D.mesh.position).to({z: 0}, 800).easing(TWEEN.Easing.Exponential.Out).start();
//                    }
//                }
//                else {
//                    endFloor3D = floor3D;
//                }
//            }
////            new TWEEN.Tween(floor3D.mesh.position).to({z:200}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100).start();
//        }


        return;

        var preFloorId = null;
        var preFloor3D = null;
        for (var key in floorIds) {
            var floorId = floorIds[key];
            var floor3D = floor3Ds[floorId];
            if (floor3D) {
                if (preFloorId === null) {
                    preFloorId = parseInt(floorId.substr(5, 1));
                    preFloor3D = floor3D;
                    if(curSelectedUnit3D) floor3D.mesh.position.z = (parseInt(curSelectedUnit3D.data.floorId) > parseInt(floorId) ? 1 : -1) * 400;
                } else {
                    preFloor3D.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (preFloorId > parseInt(floorId.substr(5, 1)) ? 1 : -1);
                    floor3D.mesh.position.z = GIM.FLOOR_GAP * 0.5 * (preFloorId > parseInt(floorId.substr(5, 1)) ? -1 : 1);
                }

                floor3D.mesh.visible = true;
//                floor3D.mesh.position.x = 400;
//                floor3D.mesh.scale.x = floor3D.mesh.scale.y = floor3D.mesh.scale.z = 0.1;

                if (doAnimate) {
//                    new TWEEN.Tween(floor3D.mesh.scale).to({x: 1, y: 1, z: 1}, 800).easing(TWEEN.Easing.Exponential.Out).delay(parseInt(key) * 100).start();
//                    new TWEEN.Tween(floor3D.mesh.scale).to({x: 1, y: 1, z: 1}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100).start();
                    new TWEEN.Tween(floor3D.mesh.position).to({z: 0}, 800).easing(TWEEN.Easing.Exponential.Out).delay(parseInt(key) * 100).start();
                } else {
                    floor3D.mesh.scale.x = floor3D.mesh.scale.y = floor3D.mesh.scale.z = 1;
                    floor3D.mesh.position.x = floor3D.mesh.position.y = 0;

                    var projector = new THREE.Projector();
                    var world_vector = new THREE.Vector3(curSelectedUnit3D.data.nodePosition.x, -curSelectedUnit3D.data.nodePosition.y, floor3D.mesh.position.z);
                    var vector = projector.projectVector(world_vector, camera);

                    mapPin.open(Math.round(vector.x * containerHalfWidth + containerHalfWidth), Math.round(-vector.y * containerHalfHeight + containerHalfHeight), findShopLogoURL(curSelectedUnit3D.data.bindShopId));
                }
            }
        }
    }

    function averageVectors(vector3Ds){
        var tmpVectors;

        var startFloorPathPoints = [];
        var endFloorPathPoints = [];
        var gapFloorPathPoints = [];

        var preVector = null;
        var distance;
        for(var i = 0;i < vector3Ds.length;i ++){
            var vector = vector3Ds[i];
            if(preVector) {
                distance = preVector.distanceTo(vector);
                if(vector.z !== preVector.z){
                    startFloorEndIndex = i - 1;
                    endFloorStartIndex = i;
                    console.log(vector3Ds[startFloorEndIndex].z,vector3Ds[endFloorStartIndex].z,distance);
                    break;
                }
            }
            preVector = vector;
        }

        var lengthTotal = 0;
//        while()

        return vector3Ds;
    }

    function drawPath(vector3Ds) {
        vector3Ds =averageVectors(vector3Ds);

        var pathGeometry = new THREE.Geometry();
        var vector3D;
        if (true) {
            var spline = new THREE.Spline(vector3Ds);
            spline.reparametrizeByArcLength(1);
            var sub = 20;
            for (var i = 0; i < vector3Ds.length * sub; i++) {
//                vector3D = spline.getPoint(i / (vector3Ds.length * sub));
                vector3D = spline.getPoint(i / (vector3Ds.length * sub));
                pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x, -vector3D.y, vector3D.z);
            }
            pathMesh = new THREE.Line( pathGeometry, new THREE.LineDashedMaterial( { color: GIM.PATH_COLOR, dashSize: 6, gapSize: 4, linewidth: 4 } ), THREE.LinePieces );
        } else {
            for (var i = 0; i < vector3Ds.length; i++) {
                vector3D = vector3Ds[i];
                pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x, -vector3D.y, vector3D.z);
            }
            pathMesh = new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({color: GIM.PATH_COLOR}));
        }

//        for(var i = 0;i < pathGeometry.vertices.length;i ++){
//            if(i % 3 === 0){
//                var vector3DofPath = pathGeometry.vertices[i];
////                var pointGeometry = new THREE.PlaneGeometry(3,3,1,1);
//                var pointGeometry = new THREE.CircleGeometry(4,12);
//                var pointMaterial = new THREE.MeshBasicMaterial({color:GIM.PATH_COLOR});
//                var pointMesh = new THREE.Mesh(pointGeometry,pointMaterial);
//                container3D.add(pointMesh);
//                pointMesh.position.x = vector3DofPath.x;
//                pointMesh.position.y = vector3DofPath.y;
//                pointMesh.position.z = vector3DofPath.z;
//            }
//        }

        container3D.add(pathMesh);
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseOut, false);
        document.addEventListener('mouseout', onDocumentMouseOut, false);

        if (pathMesh) {
            pathMesh.parent.remove(pathMesh);
            pathMesh = null;
        }

        if (event.target.id === "gotoImage" && event.offsetY < mapPin.width) {
            if (curSelectedUnit3D) {
                console.log("- [GimMap].onDocumentMouseDown ShopId:", curSelectedUnit3D.data.bindShopId);
                if(curSelectedUnit3D.data.nodeTypeId === GIM.NODE_TYPE_SHOP){
                    navigateTo(curSelectedUnit3D.data.bindShopId);
                }else{
                    console.log("- [GimMap].navigateTo Shop", curSelectedUnit3D.data.bindShopId);

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
//                        showPinOnUnit3D(curSelectedUnit3D);
                }
            }
        } else if (event.target.id === "searchImage") {
            console.log("- [GimMap].goDetail:", curSelectedUnit3D.data.bindShopId);
            GIM.goDetail(curSelectedUnit3D.data.bindShopId);
        } else {
            selectUnit3DByPosition(event.offsetX, event.offsetY);
            showPinOnUnit3D(curSelectedUnit3D);
        }
    }

    function navigateTo(shopId) {
        selectUint3DByShopId(shopId);

        if (curSelectedUnit3D) {
            console.log("- [GimMap].navigateTo Shop", curSelectedUnit3D.data.bindShopId);

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
            showPinOnUnit3D(curSelectedUnit3D);
        }
    }

    //UPDATE curSelectedUnit3D ONLY!
    function selectUint3DByShopId(shopId) {
        clearSelectedUnit3D();

        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            for (var nodeId in floor3D.subUnit3Ds) {
                var unit3D = floor3D.subUnit3Ds[nodeId];
                if (shopId === unit3D.data.bindShopId) {
                    console.log("- [GimMap].selectUint3DByShopId:", shopId,"DONE!");
                    curSelectedUnit3D = unit3D;
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
                console.log("- [GimMap].selectUnit3DByPosition", mesh.displayUnit3D.data.nodeId);
                curSelectedUnit3D = mesh.displayUnit3D;
            }
        }
    }

    function clearSelectedUnit3D(){
        if (curSelectedUnit3D) {
            new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1, x: 1, y: 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
            curSelectedUnit3D = null;
        }
    }

    function showPinOnUnit3D(unit3D){
        var wordCoordinate = toScreenCoordinate(unit3D.data.nodePosition.x, -unit3D.data.nodePosition.y, unit3D.mesh.parent.position.z + parseInt(unit3D.data.deep) + 20);
        mapPin.open(wordCoordinate.x, wordCoordinate.y, findShopLogoURL(curSelectedUnit3D.data.bindShopId));
        new TWEEN.Tween(unit3D.mesh.scale).to({z: 1.4, x: unit3D.mesh.isLogo ? 1.2 : 1, y: unit3D.mesh.isLogo ? 1.2 : 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
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

    function findShopLogoURL(shopId) {
        var shopLogoURL = "";
        if (shopList) {
            for (var i = 0; i < shopList.length; i++) {
                var shop = shopList[i];
                if (shop.shop_room.toString() === shopId) {
                    console.log("- [GimMap].findShopLogoURL:", shopId);
                    shopLogoURL = GIM.SERVER + "/system" + shop.shop_logo;
                }
            }
        }
        return shopLogoURL;
    }

    function onDocumentMouseMove(event) {
        mouseX = event.clientX - containerHalfWidth;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
    }

    function onDocumentMouseOut(event) {
        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('mouseup', onDocumentMouseOut, false);
        document.removeEventListener('mouseout', onDocumentMouseOut, false);
    }

    function animate() {
        requestAnimationFrame(animate);

        if (isDebug) {
//            camera.rotation.x += (targetRotation - camera.rotation.x) * 0.05;
//            container3D.rotation.z += (targetRotation - container3D.rotation.x) * 0.05;
            cameraPosition.distance += (targetRotation);
            stats.update();
        }

        for (var i = 0; i < logoOnlyMeshes.length; i++) {
            var mesh = logoOnlyMeshes[i];
            mesh.lookAt(camera.position);
        }

        renderer.render(scene, camera);
        TWEEN.update();
    }

    function addStats() {
        stats = new Stats();
        stats.domElement.style.cssText += 'position:absolute;top:0px';
        domElementContainer.appendChild(stats.domElement);
    }

    function addFloorSelector() {
        floorSelector = document.createElement("div");
        domElementContainer.appendChild(floorSelector);
        floorSelector.style.cssText = "position:absolute;top:240px;left:0px";

        serviceSelector = document.createElement("div");
        domElementContainer.appendChild(serviceSelector);
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
            }
        }
    }

    function showNodeTypes(nodeTypeId) {
        for (var i = 0;i < curShownFloorIds.length;i ++) {
            var floor3D = floor3Ds[curShownFloorIds[i]];
            for (var nodeId in floor3D.subUnit3Ds) {
                var unit3D = floor3D.subUnit3Ds[nodeId];
                if (unit3D.data.nodeTypeId === nodeTypeId) {
                    unit3D.mesh.material.opacity = 0;
                    unit3D.mesh.scale.x = unit3D.mesh.scale.y = 1.2;
                    new TWEEN.Tween(unit3D.mesh.material).to({opacity: 1}, 600).easing(TWEEN.Easing.Back.InOut).repeat(2).start();
                    new TWEEN.Tween(unit3D.mesh.scale).to({x: 1, y: 1}, 600).easing(TWEEN.Easing.Elastic.InOut).repeat(2).start();
                }
            }
        }
    }

    function addFloorLogo(floorId, logoURL) {
        var floorLogoContainer = document.createElement("div");
        floorSelector.appendChild(floorLogoContainer);
        floorLogoContainer.style.cssText = "height:120px;width:200px";

        floorLogoContainer.innerHTML = "<p style='margin:0;position:absolute;font-size: 26px;font-weight: bold;font-family: \'Microsoft Yahei\';'>" + floorId.substr(5, 1) + "F</p>";

        var floorLogoImage = new Image();
        floorLogoImages.push(floorLogoImage);
        floorLogoImage.src = logoURL;
        floorLogoImage.id = floorId;
        floorLogoImage.style.cssText = "margin-bottom:20px;opacity:0.3;width:100%";
        floorLogoContainer.appendChild(floorLogoImage);
        floorLogoImage.addEventListener('mousedown', function (event) {
            event.currentTarget.style.opacity = 1;
            var targetfloorId = event.currentTarget.id;
            showFloors([targetfloorId]);
        });
    }

    function init(){
        GIM.SVGParser.loadURL("assets/shoplist.json", function (jsonString) {
            shopList = JSON.parse(jsonString);
        });
        GIM.navitateTo = navigateTo;
        domElementContainer.style.cssText += "overflow: hidden;position: absolute;";
        init3d();
        if (isDebug) addStats();
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        animate();
    }

    if(!GIM.mapInstans){
        init();
        GIM.mapInstans = this;
    }else{
        console.log("- [GimMap].constructor:mapInstance was instanced!")
    }

}
