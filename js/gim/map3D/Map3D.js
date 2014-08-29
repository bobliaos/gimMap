/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (mainContainer) {
    var isDebug = false;
    var isHideShadow = false;

    var containerWidth, containerHeight, containerHalfWidth, containerHalfHeight;

    var renderer, stats, scene, cameraController, container3D, projector;

    var meshes = [];
    var serviceLogoMeshes = [];
    var sourceSVG;
    var floor3Ds = {};
    var curSelectedUnit3D = null;
    var curShownFloorIds = null;

    var pathMesh;
    var astarNodes = {};
    var minFloorPositionZ = -4200;
    var maxFloorPositionZ = 1200;
    var isMapReady = false;

    var pathAnimatePointMeshes = [];
    var pathAnimateIndexDelta = 0;
    var pathAnimateTime = 60;
    var pathAnimateCircleLength = 25;

    var zoomBar;
    var mapPin;
    var floorSelector;
    var serviceSelector;

    var preSelectedUnit3DMaterial = null;
    var machineNodeId = null;

    //MAIN FUNCTIONS///////////////////////////////////////////

    function reset() {
        if (isMapReady) {
            clearPath();
            showFloors([astarNodes[machineNodeId].data.floorId]);
        }
    }

    function navigateTo(shopId) {
        selectUint3DByShopId(shopId);
        drawPathToCurrentSelectedUnit();
        showPinOnUnit3D(curSelectedUnit3D);
    }

    function showFloors(floorIds) {
        zoomBar.percent = 0;

        if (curShownFloorIds === null) curShownFloorIds = floorIds;

        if (mapPin._isOpenning) mapPin.close();

        console.log("- [GimMap]Map3D.showFloors:", floorIds.toString());

        //UPDATE FLOOR LOGOS
        floorSelector.showFloors(floorIds);

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

        serviceSelector.setLogos(floor3Ds, astarNodes, curShownFloorIds, machineNodeId);
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
                }
            }
        }
    }

    function showPinOnUnit3D(unit3D) {
        if (unit3D === null) return;

        var wordCoordinate = toScreenCoordinate(unit3D.data.nodePosition.x, -unit3D.data.nodePosition.y, unit3D.mesh.parent.position.z + parseInt(unit3D.data.deep) + 20);
        mapPin.open(wordCoordinate.x, wordCoordinate.y, getShopLogoURL(unit3D.data.bindShopId));
    }

    function searchPath(startNodeId, endNodeId) {
        var startNode = astarNodes[startNodeId].data;
        var endNode = astarNodes[endNodeId].data;

        var startFloorId = startNode.floorId;
        var endFloorId = endNode.floorId;

        var startFloorAStarNodes = {};
        var endFloorAStarNodes = {};

        for (var key in astarNodes) {
            var astarNode = astarNodes[key];
            if (astarNode.data.floorId == startFloorId)
                startFloorAStarNodes[key] = astarNode;
            else if (astarNode.data.floorId == endFloorId)
                endFloorAStarNodes[key] = astarNode;
        }

        var pathNodes = [];
        if (startFloorId === endFloorId) {
            pathNodes = GIM.AStar.search(startFloorAStarNodes, machineNodeId, curSelectedUnit3D.data.nodeId);
        } else {
            var startFloorEndAStarNode = null;
            var endFloorStartAStarNode = null;

            for (var key in startFloorAStarNodes) {
                var astarNode = startFloorAStarNodes[key];
                if (astarNode.data.nodeTypeId === GIM.NODE_TYPE_LIFT || astarNode.data.nodeTypeId === GIM.NODE_TYPE_ESCALATOR) {
                    for (var i = 0; i < astarNode.bindNodes.length; i++) {
                        var bindAStarNode = astarNode.bindNodes[i];
                        if (bindAStarNode.data.floorId === endFloorId) {
                            startFloorEndAStarNode = astarNode;
                            endFloorStartAStarNode = bindAStarNode;
                            break;
                        }
                    }
                    if (startFloorEndAStarNode !== null && endFloorStartAStarNode !== null) {
                        var startFloorPathNodes = GIM.AStar.search(startFloorAStarNodes, machineNodeId, startFloorEndAStarNode.data.nodeId);
                        var endFloorPathNodes = GIM.AStar.search(endFloorAStarNodes, endFloorStartAStarNode.data.nodeId, curSelectedUnit3D.data.nodeId);

                        pathNodes = pathNodes.concat(endFloorPathNodes);
                        pathNodes = pathNodes.concat(startFloorPathNodes);

                        break;
                    }
                }
            }
        }

        return pathNodes;
    }

    function drawPathToCurrentSelectedUnit(){
        if (curSelectedUnit3D) {
            console.log("- [GimMap]Map3D.navigateTo Node", curSelectedUnit3D.data.nodeId);

            var startFloorId = astarNodes[machineNodeId].data.floorId;
            var endFloorId = curSelectedUnit3D.data.floorId;
            showFloors(startFloorId === endFloorId ? [startFloorId] : [startFloorId, endFloorId]);

            var vector3Ds = [];
            var pathNodes = searchPath(machineNodeId, curSelectedUnit3D.data.nodeId);
            if (pathNodes.length === 0) {
                showFloors([startFloorId]);
            } else {
                for (var i = 0; i < pathNodes.length; i++) {
                    var pathNode = pathNodes[i];
                    var floor3D = floor3Ds[pathNode.data.floorId];
                    var vector3 = new THREE.Vector3(pathNode.x, pathNode.y, floor3D.mesh.position.z + 5);
                    vector3Ds.push(vector3);
                }
                drawPath(vector3Ds);
            }
        }
    }

    function drawPath(vector3Ds) {
        vector3Ds = averageVectors(vector3Ds);

        var pathGeometry = new THREE.Geometry();
        var vector3D;

        for (var i = 0; i < vector3Ds.length; i++) {
            vector3D = vector3Ds[i];
            pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x, -vector3D.y, vector3D.z + 15);
        }
        pathMesh = new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({color: GIM.PATH_COLOR}));
//        pathMesh.visible = isDebug;

        for (var i = 0; i < pathGeometry.vertices.length; i++) {
            var vector3DofPath = pathGeometry.vertices[i];
            if (!(pathGeometry.vertices[i + 1] && pathGeometry.vertices[i].z !== pathGeometry.vertices[i + 1].z && i % 2 != 0)) {
                var pointGeometry = new THREE.CircleGeometry(6, 8);
                var pointMaterial = new THREE.MeshBasicMaterial({color: GIM.PATH_COLOR});
                var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
                container3D.add(pointMesh);
                pointMesh.visible = false;
                pathAnimatePointMeshes.push(pointMesh);
                pointMesh.position.x = vector3DofPath.x;
                pointMesh.position.y = vector3DofPath.y;
                pointMesh.position.z = vector3DofPath.z;
            }
        }

        pathAnimateCircleLength = pathAnimatePointMeshes.length;
        pathAnimateIndexDelta = pathAnimatePointMeshes.length;

        container3D.add(pathMesh);
    }

    function doPathAnimate() {
        pathAnimateIndexDelta--;
        if (pathAnimateIndexDelta < 0) pathAnimateIndexDelta = pathAnimateCircleLength;

        for (var i = 0; i < pathAnimatePointMeshes.length; i++) {
            var mesh = pathAnimatePointMeshes[i];
            if (true) {
                mesh.visible = i === pathAnimateIndexDelta;
            } else {
                if (!mesh.visible) mesh.visible = true;
                mesh.scale.x = mesh.scale.y = (1 - (i + pathAnimateCircleLength - pathAnimateIndexDelta) % pathAnimateCircleLength / pathAnimateCircleLength);
            }
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

    function setSize(width, height) {
        console.log("- [GimMap]Map3D.setSize:", width, height);

        containerWidth = width;
        containerHeight = height;

        containerHalfWidth = containerWidth * 0.5;
        containerHalfHeight = containerHeight * 0.5;

        cameraController.camera.aspect = containerWidth / containerHeight;
        cameraController.camera.updateProjectionMatrix();

        renderer.setSize(containerWidth, containerHeight);
    }

    //ASSIST FUNCTIONS//////////////////////////////////////////

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

    function selectUnit3DByPosition(mouseX, mouseY) {
        clearSelectedUnit3D();
        mouseX = 2 * mouseX / containerWidth - 1;
        mouseY = 1 - 2 * mouseY / containerHeight;
        var vec = new THREE.Vector3(mouseX, mouseY, 0);
        projector.unprojectVector(vec, cameraController.camera);
        var rayCaster = new THREE.Raycaster(cameraController.camera.position, vec.sub(cameraController.camera.position).normalize());
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
        if (unit3D.mesh.isServiceLogo) {
            new TWEEN.Tween(unit3D.mesh.position).to({z: unit3D.data.origZ + 20}, 500).easing(TWEEN.Easing.Elastic.Out).start();
        } else {
            preSelectedUnit3DMaterial = curSelectedUnit3D.mesh.material;
            var color = new THREE.Color(curSelectedUnit3D.data.fill);
            var i = color.getHSL();
            color.setHSL(i.h, i.s + 0.3, i.l + 0.07);
            curSelectedUnit3D.mesh.material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color });
            new TWEEN.Tween(unit3D.mesh.scale).to({z: 1.4, x: unit3D.mesh.isServiceLogo ? 1.1 : 1, y: unit3D.mesh.isServiceLogo ? 1.1 : 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
        }
    }

    function clearSelectedUnit3D() {
        for (var i = 0; i < serviceLogoMeshes.length; i++) {
            var mesh = serviceLogoMeshes[i];
            if (mesh.position.z != mesh.displayUnit3D.data.origZ)
                new TWEEN.Tween(mesh.position).to({z: mesh.displayUnit3D.data.origZ}, 500).easing(TWEEN.Easing.Elastic.Out).start();
        }

        if (curSelectedUnit3D !== null) {
            if (preSelectedUnit3DMaterial !== null && !curSelectedUnit3D.mesh.isServiceLogo) {
                var tmpMaterial = curSelectedUnit3D.mesh.material;
                tmpMaterial = undefined;
                delete  tmpMaterial;
                curSelectedUnit3D.mesh.material = preSelectedUnit3DMaterial;
            }
            new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1, x: 1, y: 1}, 500).easing(TWEEN.Easing.Elastic.Out).start();
            curSelectedUnit3D = null;
        }
    }

    function toScreenCoordinate(worldX, worldY, worldZ) {
        var projector = new THREE.Projector();
        var worldVector = new THREE.Vector3(worldX + container3D.position.x, worldY, worldZ);
        var vector = projector.projectVector(worldVector, cameraController.camera);
        return {
            x: Math.round(vector.x * containerHalfWidth + containerHalfWidth),
            y: Math.round(-vector.y * containerHalfHeight + containerHalfHeight)
        };
    }

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
            if (curSelectedUnit3D) {
                if (curSelectedUnit3D.data.nodeTypeId === GIM.NODE_TYPE_SHOP) {
                    showPinOnUnit3D(curSelectedUnit3D);
                } else {
                    drawPathToCurrentSelectedUnit();
                }
            }
        }
    }

    //INITIALIZE FUNCTIONS///////////////////////////////////////

    function init() {
        GIM.SVGParser.loadURL(GIM.SHOP_LIST_URL, function (json) {
//            GIM.shopList = JSON.parse(jsonString);
            GIM.shopList = json;
            GIM.navitateTo = navigateTo;
            GIM.setSize = setSize;

            init3d();
            initComponents();
            initData();

            doAnimate();
            setInterval(doPathAnimate, pathAnimateTime);

            mainContainer.addEventListener('mousedown', onContainerMouseDown, false);
            mainContainer.addEventListener("DOMNodeInserted", reset, false);

            setSize(parseFloat(mainContainer.style.width), parseFloat(mainContainer.style.height));
        });
    }

    function init3d() {

        isHideShadow = GIM.SHADOW_MAP_SIZE === 0;

        renderer = new THREE.WebGLRenderer({antialias: true});
        mainContainer.appendChild(renderer.domElement);
        renderer.setClearColor(GIM.MAP_BACKGROUND_COLOR);
        renderer.setSize(64, 64);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;

        scene = new THREE.Scene();

        container3D = new THREE.Object3D();
        scene.add(container3D);

        cameraController = new GIM.CameraController(mainContainer,container3D);

        if (!isHideShadow) {
            var shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
            scene.add(shadowLight);
            shadowLight.position.set(1400, -2200, 2200);
            shadowLight.target.position.set(500, -300, 0);
            shadowLight.castShadow = true;
            shadowLight.shadowCameraNear = 1800;
            shadowLight.shadowCameraFar = 4500;
            shadowLight.shadowBias = 0.0001;
            shadowLight.shadowDarkness = 0.6;
            shadowLight.shadowMapWidth = shadowLight.shadowMapHeight = GIM.SHADOW_MAP_SIZE;
            if (isDebug) shadowLight.shadowCameraVisible = true;
        }

        var backLight = new THREE.DirectionalLight(0x333333, 0.8);
        scene.add(backLight);
        backLight.position.set(400, 500, 500);

        if (true) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000, 50, 50), new THREE.MeshBasicMaterial({color: 0xEEEEEE, wireframe: true}));
            container3D.add(plane);
        }

        projector = new THREE.Projector();
    }

    function initComponents() {
        if (isDebug) {
            stats = new Stats();
            stats.domElement.style.cssText += 'position:absolute;top:0px';
            mainContainer.appendChild(stats.domElement);
        }
        floorSelector = new GIM.FloorSelector(mainContainer);
        serviceSelector = new GIM.ServiceSelector(mainContainer, showNodeTypes);
        zoomBar = new GIM.ZoomBar(mainContainer,cameraController);
        mapPin = new GIM.MapPin(mainContainer);
    }

    function initData() {
        GIM.SVGParser.loadURL(GIM.DATA_SOURCE_URL, function (sourceString) {
//            var json = JSON.parse(sourceString);
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);

            var floorElements = sourceSVG.getElementsByTagName('g');
            for (var floorIndex = floorElements.length - 1; floorIndex >= 0; floorIndex--) {
                var floorElement = floorElements[floorIndex];
                var floor3D = new GIM.DisplayFloor3D(floorElement);

                floor3Ds[floor3D.data.floorId] = floor3D;
                container3D.add(floor3D.mesh);

                var isCurFloor = false;
                for (var key in floor3D.subUnit3Ds) {
                    var pushMesh = floor3D.subUnit3Ds[key].mesh;
                    if (pushMesh) {
                        meshes.push(pushMesh);
                        if (pushMesh.isServiceLogo)
                            serviceLogoMeshes.push(pushMesh);
                        if (pushMesh.displayUnit3D.data.nodeTypeId === GIM.NODE_TYPE_MACHINE) {
                            if (pushMesh.displayUnit3D.data.bindShopId === GIM.MACHINE_CODE) {
                                machineNodeId = pushMesh.displayUnit3D.data.nodeId;
                                console.log("- [GimMap].initData:MACHINE_NODE_ID FOUND:", machineNodeId);
                                isCurFloor = true;
                            } else {
                                pushMesh.position.x = -20000;
                                pushMesh.visible = false;
                            }
                        }
                    }
                }

                for (var key in floor3D.data.unitsData) {
                    var unitData = floor3D.data.unitsData[key];
                    astarNodes[unitData.nodeId] = unitData.astarNode;
                }

                floorSelector.addLogo(floor3D.data.floorId, "assets/img/floorlogo/" + floor3D.data.floorId + ".png", isCurFloor, showFloors);
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

            showFloors([astarNodes[machineNodeId].data.floorId]);

            cameraController.lookAtVector.x = parseFloat(sourceSVG.getElementsByTagName('svg')[0].getAttribute("width")) * 0.5 - 100;
            cameraController.distance = 1800;

            isMapReady = true;
        });
    }

    function doAnimate() {
        requestAnimationFrame(doAnimate);

        if (isDebug) {
//            camera.rotation.x += (targetRotation - camera.rotation.x) * 0.05;
//            container3D.rotation.z += (targetRotation - container3D.rotation.z) * 0.05;
//            cameraPosition.distance += (targetRotation) * 10;
            stats.update();
        }

        for (var i = 0; i < serviceLogoMeshes.length; i++) {
            var mesh = serviceLogoMeshes[i];
//            mesh.lookAt(camera.position);
        }

        renderer.render(scene, cameraController.camera);
        TWEEN.update();
    }

    init();
}
