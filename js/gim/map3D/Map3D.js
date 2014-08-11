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
    var machineNodeId = "node_2014_8_7_12:17:01_1094";
    var astarNodes = [];
    var floorGap = 500;

    var pin;
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
        renderer.setClearColor(0xBBBBBB);
        renderer.setSize(containerWidth, containerHeight);
        domElementContainer.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(15, containerWidth / containerHeight, near, far);
        container3D = new THREE.Object3D();
        scene.add(container3D);

        var light = new THREE.DirectionalLight(0x222222);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);

        if (isDebug) {
            var plane = new THREE.Mesh(
                new THREE.PlaneGeometry(5000, 5000, 50, 50),
                new THREE.MeshBasicMaterial({color: 0xEEEEEE, wireframe: true}));
            container3D.add(plane);
        }

        projector = new THREE.Projector();

        GIM.SVGParser.loadURL(sourceURL, function (sourceString) {
            addFloorSelector();
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);
            var floorElements = sourceSVG.getElementsByTagName('g');
            for (var floorIndex = 0; floorIndex < floorElements.length; floorIndex++) {
                var floorElement = floorElements[floorIndex];
                var floor3D = new GIM.DisplayFloor3D(floorElement);

                floor3Ds[floor3D.data.floorId] = floor3D;
                container3D.add(floor3D.mesh);

                addFloorLogo(floor3D.data.floorId); //should be logo URL of floor

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

    function showFloors(floorIds) {
        for (var key in floor3Ds) {
            var floor3D = floor3Ds[key];
            floor3D.mesh.visible = false;
        }

        for (var key in floorIds) {
            var floorId = floorIds[key];
            var floor3D = floor3Ds[floorId];
            if (floor3D) {
                floor3D.mesh.visible = true;
                floor3D.mesh.position.z = parseInt(key) * floorGap + 200;
                floor3D.mesh.position.x = 400;
                floor3D.mesh.scale.x = floor3D.mesh.scale.y = floor3D.mesh.scale.z = 0.1;
                var tween = new TWEEN.Tween(floor3D.mesh.scale).to({x: 1,y:1,z:1}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100);
                tween.start();
                var tween = new TWEEN.Tween(floor3D.mesh.position).to({x: 0,y:0,z:parseInt(key) * floorGap}, 800).easing(TWEEN.Easing.Elastic.Out).delay(parseInt(key) * 100);
                tween.start();
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

        if (event.target.id === "pinCanvas" && event.offsetY < pin.width) {
            console.log("pinCanvas mousedown");
            //find path
            if (curSelectedUnit3D) {
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
        hidePin();

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
                console.log(mesh.displayUnit3D.data.nodeId, mesh.displayUnit3D.data.nodePosition);
                curSelectedUnit3D = mesh.displayUnit3D;
                var tweenCur = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1.2,x:curSelectedUnit3D.mesh.isLogo ? 1.2:1,y:curSelectedUnit3D.mesh.isLogo ? 1.2:1}, 500).easing(TWEEN.Easing.Elastic.Out);
                tweenCur.start();

                var wordCoordinate = toScreenCoordinate(curSelectedUnit3D.data.nodePosition.x, -curSelectedUnit3D.data.nodePosition.y, curSelectedUnit3D.mesh.parent.position.z + parseInt(curSelectedUnit3D.data.deep) + 20);
                showPin(wordCoordinate.x, wordCoordinate.y, curSelectedUnit3D.data.nodeId);
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
            cameraPosition.distance += (targetRotation);
        }

        for (var key in logoOnlyMeshes){
            var mesh = logoOnlyMeshes[key];
            mesh.lookAt(camera.position);
        }

        renderer.render(scene, camera);
        stats.update();
        TWEEN.update();
    }

    function showPin(pinX, pinY, text) {
        pin.style.display = "block";
        pin.style.left = pinX - pin.width * 0.5 + "px";
        pin.style.top = pinY - pin.height + "px";

        if (text != undefined) {
            var ctx = pin.getContext("2d");
            ctx.font = "20px Microsoft Yahei";
            ctx.strokeText(text, 10, pin.width * 0.5);
        }
    }

    function hidePin() {
        pin.style.display = "none";
    }

    function addStats() {
        stats = new Stats();
        stats.domElement.style.cssText += 'position:absolute;top:0px';
        domElementContainer.appendChild(stats.domElement);
    }

    function addPin() {
        mapPin = new GIM.MapPin(domElementContainer);

        pin = document.createElement("canvas");
        domElementContainer.appendChild(pin);
        pin.id = "pinCanvas";
        pin.width = 150;
        pin.height = 200;
        pin.style.cssText = "width: " + pin.width + "px;height: " + pin.height + "px;position: absolute;";
        var pinContext = pin.getContext("2d");
        pinContext.strokeStyle = "#FFFFFF";
        pinContext.lineWidth = 3;
        pinContext.lineJoin = "round";
        pinContext.fillStyle = "#99CC33";
        pinContext.beginPath();
        pinContext.arc(pin.width * 0.5, pin.width * 0.5, (pin.width - pinContext.lineWidth) * 0.5, Math.PI * 2 * (3.5 / 12), Math.PI * 2 * (2.5 / 12));
        pinContext.lineTo(pin.width * 0.5, pin.height - pinContext.lineWidth);
        pinContext.closePath();
        pinContext.fill();
        pinContext.stroke();
    }

    function addFloorSelector() {
        floorSelector = document.createElement("div");
        domElementContainer.appendChild(floorSelector);
        floorSelector.style.cssText = "width:120px;position:absolute;top:60px;left:0px";
    }

    function addFloorLogo(logoURL) {
        var floorLogo = document.createElement("div");
        floorSelector.appendChild(floorLogo);
        floorLogo.style.cssText = "width:100%;height:20px;background:#DDD;cursor:pointer;margin-bottom:2px;";
        floorLogo.innerHTML = logoURL;
        floorLogo.id = logoURL;
        floorLogo.addEventListener('mousedown', function (event) {
            var floorId = event.currentTarget.id;
            if (floorId == "floor_1") showFloors([floorId]);
            else showFloors(["floor_1", "floor_2"]);
        });
    }

    domElementContainer.style.cssText += "overflow: hidden";
    init3d();
    addStats();
    addPin();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    animate();
}
