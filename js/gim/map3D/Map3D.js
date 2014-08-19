/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (mainContainer) {
    var isDebug = false;
    var isHideShadow = false;

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
            var i = color.getHSL();
            color.setHSL(i.h, i.s + 0.3, i.l + 0.07);
            curSelectedUnit3D.mesh.material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color });
//            curSelectedUnit3D.mesh.material = new THREE.MeshLambertMaterial({color: GIM.SELECTED_COLOR, ambient: GIM.SELECTED_COLOR, emissive: GIM.SELECTED_COLOR });
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

        isHideShadow = GIM.SHADOW_MAP_SIZE === 0;

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

        if(!false) {
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
            if(isDebug) shadowLight.shadowCameraVisible = true;
        }

        var backLight = new THREE.DirectionalLight(0x333333, 0.8);
        scene.add(backLight);
        backLight.position.set(400, 500, 500);

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
            height: 112,
            container: document.createElement("div"),
            floorLabel: document.createElement("p"),
            floorCurLabel: document.createElement("p"),
            floorLogoImage: new Image(),
            _selected: false,
            set selected(value) {
                this._selected = value;
                this.container.style.opacity = value ? 1 : 0.4;
//                this.container.style.border = value ? "1px dashed #FF0033" : "1px dashed #AAAAAA";
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

        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorLogoImage);
        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorLabel);
        floorLabelAndLogo.container.appendChild(floorLabelAndLogo.floorCurLabel);

        floorLabelAndLogo.container.style.cssText = "position:relative;height:" + floorLabelAndLogo.height + "px;width:" + floorLabelAndLogo.width + "px;opacity:0.3;margin-bottom:8px;font-size: 26px;font-weight: bold;font-family:" + GIM.FONT_NAME;
        floorLabelAndLogo.floorLabel.style.cssText = "margin:0;position:absolute;left:2px;top:2px;line-height:22px";
        floorLabelAndLogo.floorCurLabel.style.cssText = "font-size: 16px;font-weight: normal;position:absolute;bottom:2px;left:2px;margin:0;";
        floorLabelAndLogo.floorLogoImage.style.cssText = "width:100%;position:absolute;top:22px;left:2px;";

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

    init();
}
