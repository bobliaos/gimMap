/**
 * @author bob / http://bobliaos.diandian.com
 * */

GimMap = function (domElementContainer) {
    var renderer, stats;
    var scene, camera, main3dContainer;
    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;
    var mouseX = 0;
    var mouseXOnMouseDown = 0;
    var windowHalfX = window.innerWidth * 0.5;
    var windowHalfY = window.innerHeight * 0.5;
    var meshes = [];

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0xBBBBBB);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, near, far);
        camera.position.set(0, 0, 1500);
        camera.lookAt({x: 0, y: 0, z: 0 });

        main3dContainer = new THREE.Object3D();
        scene.add(main3dContainer);
        main3dContainer.position.x = - 1250;
//        main3dContainer.position.y = - 250;
        main3dContainer.rotation.x = -Math.PI * 0.25;

//                var ambientLight = new THREE.AmbientLight(0xFFFFFF);
//                scene.add(ambientLight);

        var light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);

//                var plane = new THREE.Mesh(
//                    new THREE.PlaneGeometry(2000,2000,20,20),
//                    new THREE.MeshBasicMaterial({color:0xEEEEEE,wireframe:true}));
//                plane.rotation.x = Math.PI;
//                main3dContainer.add(plane);

        projector = new THREE.Projector();

        var svgLoader = new XMLHttpRequest();
        svgLoader.onreadystatechange = function () {
            if (svgLoader.readyState == 4) {
                if (svgLoader.status == 200) {
                    var svgString = svgLoader.responseText;

                    var svgObject = GimSVGParser.getSVGObject(svgString);
                    addGeoObject(main3dContainer, svgObject);
                }
            }
        }
        svgLoader.open("GET", "assets/SVGTest.svg", false);
        svgLoader.send(null);
    }

    var addGeoObject = function (container, svgObject) {
        var i, j, len, len1;
        var path, mesh, color, material, amount, simpleShapes, simpleShape, shape3d, x, toAdd, results = [];

        len = svgObject.pathes.length;
        for (var i = 0; i < len; ++i) {
            path = GimSVGParser.parse(svgObject.pathes[i]);
            color = new THREE.Color(svgObject.colors[i]);
            material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color});
            amount = svgObject.amounts[i];
            simpleShapes = path.toShapes(true);
            len1 = simpleShapes.length;
            for (var j = 0; j < len1; ++j) {
                simpleShape = simpleShapes[j];
                shape3d = simpleShape.extrude({amount: amount, bevelEnabled: false});
                mesh = new THREE.Mesh(shape3d, material);
//                        mesh.rotation.x = Math.PI;
//                        mesh.translateZ(-amount - 1);
//                        mesh.translateX(-svgObject.center.x);
//                        mesh.translateY(-svgObject.center.y);
                container.add(mesh);

                meshes.push(mesh);
            }
        }
    }

    var projector;

    function onDocumentMouseDown(event) {
        event.preventDefault();

//                document.addEventListener('mousemove',onDocumentMouseMove,false);
//                document.addEventListener('mouseup',onDocumentMouseOut,false);
//                document.addEventListener('mouseout',onDocumentMouseOut,false);

        var mx = event.clientX;
        var my = event.clientY;

        mx = 2 * mx / window.innerWidth - 1;
        my = 1 - 2 * my / window.innerHeight;
        var vec = new THREE.Vector3(mx, my, 0);
        projector.unprojectVector(vec, camera);
        var raycaster = new THREE.Raycaster(camera.position, vec.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            var tween = new TWEEN.Tween(mesh.scale)
                .to({z: mesh.scale.z > 1 ? 0.8 : 1.2}, 500)
                .easing(TWEEN.Easing.Elastic.Out);
            tween.start();
//                    mesh.scale.z += 0.1;
        }
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

//                main3dContainer.rotation.x += (targetRotation - main3dContainer.rotation.x) * 0.05;
//                main3dContainer.rotation.y += (targetRotation - main3dContainer.rotation.y) * 0.05;
//                main3dContainer.rotation.z += (targetRotation - main3dContainer.rotation.z) * 0.05;
//                camera.position.x += (targetRotation) * 5;
        renderer.render(scene, camera);
        stats.update();
        TWEEN.update()
    }

    function addStats() {
        stats = new Stats();
        stats.domElement.style.cssText += 'position:absolute;top:0px';
        container.appendChild(stats.domElement);
    }

    var container = domElementContainer;
    container.style.cssText += "overflow: hidden";

    init3d();
    addStats();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    animate();
}
