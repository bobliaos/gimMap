/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Map3D = function (domElementContainer) {
    var isDebug = false;

    var currentPositionNodeId = "node_2014_8_5_05:39:48_8279";
    var sourceURL = "assets/data.sgxml";
    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;
    var containerWidth = domElementContainer.clientWidth;
    var containerHeight = domElementContainer.clientHeight;
    var windowHalfX = window.innerWidth * 0.5;
    var windowHalfY = window.innerHeight * 0.5;

    var renderer, stats;
    var scene, camera, main3dContainer;
    var projector;

    var meshes = [];
    var sourceSVG;
    var displayFloors = {};
    var displayUnit3Ds = {};
    var curSelectedUnit3D;

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0xBBBBBB);
        renderer.setSize(containerWidth, containerHeight);
        domElementContainer.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, near, far);
        camera.position.set(500, -1300, 980);
        camera.rotation.x = Math.PI * 0.35;
//        camera.lookAt({x: 0, y: 0, z: 0 });

        main3dContainer = new THREE.Object3D();
        scene.add(main3dContainer);

        var light = new THREE.DirectionalLight(0x222222);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);

        if(isDebug){
            var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2000,2000,4,4),
            new THREE.MeshBasicMaterial({color:0xEEEEEE,wireframe:true}));
            main3dContainer.add(plane);
        }

        projector = new THREE.Projector();

        GIM.Tools.loadURL(sourceURL,function(sourceString){
            sourceSVG = GIM.SVGParser.getSVGObject(sourceString);

            var floorElements = sourceSVG.getElementsByTagName('g');
            for(var floorIndex = 0;floorIndex < floorElements.length;floorIndex ++){
                var floorElement = floorElements[floorIndex];
                var displayFloor = new GIM.DisplayFloor3D(floorElement);
                addFloorToContainer(displayFloor);
            }
        });
    }

    function addFloorToContainer(displayFloor3D){
        displayFloors[displayFloor3D.data.floorId] = displayFloor3D;
        displayFloor3D.unit3DsContainer.position.z = parseInt(displayFloor3D.data.floorId.split("_")[1]) * 500 - 250;
        main3dContainer.add(displayFloor3D.unit3DsContainer);
        for (var key in displayFloor3D.displayUnit3Ds){
            var unit3D = displayFloor3D.displayUnit3Ds[key];
            displayUnit3Ds[key] = unit3D;
            meshes.push(unit3D.mesh);
        }
    }

    var pathMesh;
    function drawPath(vector3Ds){
        var positions = new Float32Array(vector3Ds.length * 3);
        for(var i = 0;i < vector3Ds.length;i ++){
            var vector3D = vector3Ds[i];
            positions[i * 3] = vector3D.x;
            positions[i * 3 + 1] = - vector3D.y;
            positions[i * 3 + 2] = vector3D.z;
        }

        var pathGeometry = new THREE.BufferGeometry();
        pathGeometry.addAttribute('position',new THREE.BufferAttribute(positions,3));
        pathGeometry.computeBoundingSphere();
        var material = new THREE.LineBasicMaterial({color:0x0099CC});
        pathMesh = new THREE.Line(pathGeometry,material);
        scene.add(pathMesh);
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        document.addEventListener('mousemove',onDocumentMouseMove,false);
        document.addEventListener('mouseup',onDocumentMouseOut,false);
        document.addEventListener('mouseout',onDocumentMouseOut,false);

        if(pathMesh) {
            scene.remove(pathMesh);
            pathMesh = null;
        }

        if (event.target.id === "pinCanvas" && event.offsetY < pin.width) {
            console.log("pinCanvas mousedown");
            if(curSelectedUnit3D){
                var vector3Ds = [new THREE.Vector3(0,0,10),new THREE.Vector3(curSelectedUnit3D.data.nodePosition.x,curSelectedUnit3D.data.nodePosition.y,curSelectedUnit3D.mesh.parent.position.z)];
//                var r = Math.random() * 1000 + 500;
//                for(var i = 0;i < 100;i ++){
//                    vector3Ds.push(new THREE.Vector3(Math.random() * r,Math.random() * r,Math.random() * r));
//                }
                drawPath(vector3Ds);
            }
        } else {
            selectUnit3DByPosition(event.clientX, event.clientY);
        }
    }

    function selectUnit3DByPosition(mouseX, mouseY) {
        hidePin();
        if (curSelectedUnit3D) {
            var tweenPre = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1}, 500).easing(TWEEN.Easing.Elastic.Out);
            tweenPre.start();
            curSelectedUnit3D = null;
        }

        mouseX = 2 * mouseX / containerWidth - 1;
        mouseY = 1 - 2 * mouseY / containerHeight;
        var vec = new THREE.Vector3(mouseX, mouseY, 0);
        projector.unprojectVector(vec, camera);
        var raycaster = new THREE.Raycaster(camera.position, vec.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            for (var key in displayUnit3Ds) {
                var unit3D = displayUnit3Ds[key];
                if (mesh === unit3D.mesh) {
                    console.log(key, unit3D.data.nodePosition);
                    if (unit3D.data.selectable === true) {
                        curSelectedUnit3D = unit3D;
                        var wordCoordinate = toScreenCoordinate(unit3D.data.nodePosition.x, - unit3D.data.nodePosition.y,unit3D.mesh.parent.position.z + parseInt(unit3D.data.deep) + 20);
                        showPin(wordCoordinate.x, wordCoordinate.y, key);
                        if (curSelectedUnit3D.mesh.scale.z < 1.2) {
                            var tweenCur = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1.2}, 500).easing(TWEEN.Easing.Elastic.Out);
                            tweenCur.start();
                        }
                    }
                    break;
                }
            }
        }
    }

    function toScreenCoordinate(worldX, worldY, worldZ) {
        var projector = new THREE.Projector();
        var worldVector = new THREE.Vector3(worldX + main3dContainer.position.x, worldY, worldZ);
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

        if(isDebug){
//            camera.rotation.x += (targetRotation - camera.rotation.x) * 0.05;
            main3dContainer.rotation.x += (targetRotation - main3dContainer.rotation.x) * 0.05;
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

    var pin;

    function addPin() {
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

    domElementContainer.style.cssText += "overflow: hidden";
    init3d();
    addStats();
    addPin();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    animate();
}
