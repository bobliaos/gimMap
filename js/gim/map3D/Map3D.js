/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (domElementContainer) {
    var isDebug = false;

    var sourceURL = "assets/data.sgxml";
    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;
    var containerWidth = domElementContainer.clientWidth;
    var containerHeight = domElementContainer.clientHeight;
    var windowHalfX = containerWidth * 0.5;
    var windowHalfY = containerHeight * 0.5;

    var renderer, stats;
    var scene, camera, container3D;
    var projector;

    var meshes = [];
    var logoOnlyMeshes = [];
    var sourceSVG;
    var floor3Ds = {};
    var curSelectedUnit3D;

    var pathMesh;
    var pathColor = 0xFF0033;
    var machineNodeId = "node_2014_8_12_02:55:12_2154";
    var astarNodes = [];
    var floorGap = 500;

    var mapPin;
    var floorSelector;

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
            var posY = Math.sin(radian) * distance;
            camera.position.set(this._posX, -posY, posZ);
            camera.rotation.x = radian;
        }
    };

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0xFFFFFF);
        renderer.setSize(containerWidth, containerHeight);
        domElementContainer.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(15, containerWidth / containerHeight, near, far);
        container3D = new THREE.Object3D();
        scene.add(container3D);

        var light = new THREE.DirectionalLight(0x2B2B2B);
        light.position.set(0, -0.5, 1).normalize();
        scene.add(light);

        if (isDebug) {
            var plane = new THREE.Mesh(
                new THREE.PlaneGeometry(5000, 5000, 50, 50),
                new THREE.MeshBasicMaterial({color: 0xEEEEEE, wireframe: true}));
            container3D.add(plane);
        }

        projector = new THREE.Projector();

        mapPin = new GIM.MapPin(domElementContainer);

        GIM.SVGParser.loadURL(sourceURL, function (sourceString) {
            addFloorSelector();
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);
            var floorElements = sourceSVG.getElementsByTagName('g');
            for (var floorIndex = floorElements.length - 1; floorIndex >= 0; floorIndex--) {
                var floorElement = floorElements[floorIndex];
                var floor3D = new GIM.DisplayFloor3D(floorElement);

                floor3Ds[floor3D.data.floorId] = floor3D;
                container3D.add(floor3D.mesh);

//                addFloorLogo(floor3D.data.floorId); //should be logo URL of floor
                addFloorLogo(floor3D.data.floorId,"assets/img/floorlogo/" + floor3D.data.floorId + ".png"); //should be logo URL of floor

                for (var key in floor3D.subUnit3Ds) {
                    var pushMesh = floor3D.subUnit3Ds[key].mesh;
                    if (pushMesh)
                    {
                        meshes.push(pushMesh);
                        if(pushMesh.isLogo) logoOnlyMeshes.push(pushMesh);
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

            var machineAStarNode = astarNodes[machineNodeId];
            showFloors([machineAStarNode.data.floorId]);

            cameraPosition.setCamera(Math.PI * 0.3, 4000, 0);
            cameraPosition.posX = parseFloat(sourceSVG.getElementsByTagName('svg')[0].getAttribute("width")) * 0.5;
        });
    }

    function showFloors(floorIds,doAnimate) {
        doAnimate = doAnimate === undefined ? true : doAnimate;

        for(var key in floorLogoImages){
            floorLogoImages[key].style.border = "0px solid #FF0000";
            floorLogoImages[key].style.opacity = 0.4;
            if(floorIds.indexOf(floorLogoImages[key].id) > -1){
                floorLogoImages[key].style.opacity = 1;
                floorLogoImages[key].style.border = "1px solid #FF0000";
            }
        }

        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            floor3D.mesh.visible = false;
            floor3D.mesh.position.x = - 3000;
        }

        var preFloorId = null;
        var preFloor3D = null;
        for (var key in floorIds) {
            var floorId = floorIds[key];
            var floor3D = floor3Ds[floorId];
            if (floor3D) {
                if(preFloorId === null){
                    preFloorId = parseInt(floorId.substr(5,1));
                    preFloor3D = floor3D;
                    floor3D.mesh.position.z = 0;
                }else{
                    preFloor3D.mesh.position.z = floorGap * 0.5 * (preFloorId > parseInt(floorId.substr(5,1)) ? 1 : -1);
                    floor3D.mesh.position.z = floorGap * 0.5 * (preFloorId > parseInt(floorId.substr(5,1)) ? -1 : 1);
                }

                floor3D.mesh.visible = true;
                floor3D.mesh.position.x = 400;
                floor3D.mesh.scale.x = floor3D.mesh.scale.y = floor3D.mesh.scale.z = 0.1;

                if(doAnimate){
                    new TWEEN.Tween(floor3D.mesh.scale).to({x: 1,y:1,z:1}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100).start();
                    new TWEEN.Tween(floor3D.mesh.position).to({x: 0}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100).start();
                }else{
                    floor3D.mesh.scale.x = floor3D.mesh.scale.y = floor3D.mesh.scale.z = 1;
                    floor3D.mesh.position.x = floor3D.mesh.position.y = 0;
                }
            }
        }
    }

    function drawPath(vector3Ds) {
        var pathGeometry = new THREE.Geometry();
        var vector3D;
        if(false){
            var spline = new THREE.Spline(vector3Ds);
            var sub = 12;
            for (var i = 0;i < vector3Ds.length * sub;i ++){
                vector3D = spline.getPoint(i / (vector3Ds.length * sub));
                pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x,- vector3D.y,vector3D.z);
            }
        }else{
            for(var i = 0;i < vector3Ds.length;i ++){
                vector3D = vector3Ds[i];
                pathGeometry.vertices[i] = new THREE.Vector3(vector3D.x,- vector3D.y,vector3D.z);
            }
        }

//        for(var key in pathGeometry.vertices){
//            var point = pathGeometry.vertices[key];
//            var pointGeometry = new THREE.BoxGeometry(12,12,12);
//            var pointMaterial = new THREE.MeshBasicMaterial({color:pathColor});
//            var pointMesh = new THREE.Mesh(pointGeometry,pointMaterial);
//            container3D.add(pointMesh);
//            pointMesh.position.x = point.x;
//            pointMesh.position.y = - point.y;
//            pointMesh.position.z = point.z;
//        }

        var pathMaterial = new THREE.LineBasicMaterial({color:pathColor,opacity:0});
        pathMesh = new THREE.Line(pathGeometry,pathMaterial);
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
            //find path
            if (curSelectedUnit3D) {
                console.log("- [GimMap] findPath to Shop",curSelectedUnit3D.data.bindShopId);

                mapPin.close();
                var startFloorId = astarNodes[machineNodeId].data.floorId;
                var endFloorId = curSelectedUnit3D.data.floorId;
                showFloors(startFloorId === endFloorId ? [startFloorId] : [startFloorId,endFloorId],false);

                var vector3Ds = [];
                var pathNodes = GIM.AStar.search(astarNodes, machineNodeId, curSelectedUnit3D.data.nodeId)
                for (var key in pathNodes) {
                    var pathNode = pathNodes[key];
                    var floorId = pathNode.data.floorId;
                    var floor3D = floor3Ds[floorId];
                    var vector3 = new THREE.Vector3(pathNode.x, pathNode.y, floor3D.mesh.position.z + 5);
                    vector3Ds.push(vector3);
                }
                drawPath(vector3Ds);
            }
        } else {
            selectUnit3DByPosition(event.clientX, event.clientY);
        }
    }

    function selectUnit3DByPosition(mouseX, mouseY) {
        mapPin.close();

        if (curSelectedUnit3D) {
            var tweenPre = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1,x: 1,y: 1}, 500).easing(TWEEN.Easing.Elastic.Out);
            tweenPre.start();
            curSelectedUnit3D = null;
        }

        mouseX = 2 * mouseX / containerWidth - 1;
        mouseY = 1 - 2 * mouseY / containerHeight;
        var vec = new THREE.Vector3(mouseX, mouseY, 0);
        projector.unprojectVector(vec, camera);
        var rayCaster = new THREE.Raycaster(camera.position, vec.sub(camera.position).normalize());
        var intersects = rayCaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            if (mesh.displayUnit3D && mesh.displayUnit3D.data.selectable) {
                console.log("- [GimMap] select node",mesh.displayUnit3D.data.nodeId);
                curSelectedUnit3D = mesh.displayUnit3D;
                var tweenCur = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1.4,x:curSelectedUnit3D.mesh.isLogo ? 1.2:1,y:curSelectedUnit3D.mesh.isLogo ? 1.2:1}, 500).easing(TWEEN.Easing.Elastic.Out);
                tweenCur.start();

                var wordCoordinate = toScreenCoordinate(curSelectedUnit3D.data.nodePosition.x, -curSelectedUnit3D.data.nodePosition.y, curSelectedUnit3D.mesh.parent.position.z + parseInt(curSelectedUnit3D.data.deep) + 20);
//                showPin(wordCoordinate.x, wordCoordinate.y, curSelectedUnit3D.data.nodeId);
                mapPin.open(wordCoordinate.x, wordCoordinate.y)
            }
        }
    }

    function toScreenCoordinate(worldX, worldY, worldZ) {
        var projector = new THREE.Projector();
        var worldVector = new THREE.Vector3(worldX + container3D.position.x, worldY, worldZ);
        var vector = projector.projectVector(worldVector, camera);
        return {
            x: Math.round(vector.x * windowHalfX + windowHalfX),
            y: Math.round(-vector.y * windowHalfY + windowHalfY)
        };
    }

    function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
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
//            cameraPosition.distance += (targetRotation);
        }

        for (var key in logoOnlyMeshes){
            var mesh = logoOnlyMeshes[key];
            mesh.lookAt(camera.position);
        }

        renderer.render(scene, camera);
        stats.update();
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
        floorSelector.style.cssText = "width:120px;position:absolute;top:120px;left:0px";
    }

    var floorLogoImages = [];
    function addFloorLogo(floorId,logoURL) {
        var floorLogoContainer = document.createElement("div");
        floorSelector.appendChild(floorLogoContainer);
        floorLogoContainer.style.cssText = "width:120px;height:80px;";

        var floorLogoImage = new Image();
        floorLogoImages.push(floorLogoImage);
        floorLogoImage.src = logoURL;
        floorLogoImage.width = 120;
        floorLogoImage.id = floorId;
        floorLogoImage.style.cssText = "margin-bottom:20px;opacity:0.3";
        floorLogoContainer.appendChild(floorLogoImage);
        floorLogoImage.addEventListener('mousedown', function (event) {
            event.currentTarget.style.opacity = 1;
            var targetfloorId = event.currentTarget.id;
            showFloors([targetfloorId]);
        });
    }

    domElementContainer.style.cssText += "overflow: hidden";
    init3d();
    addStats();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    animate();
}
