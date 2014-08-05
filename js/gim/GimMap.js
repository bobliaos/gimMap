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
    var containerWidth = domElementContainer.clientWidth;
    var containerHeight = domElementContainer.clientHeight;
    var windowHalfX = window.innerWidth * 0.5;
    var windowHalfY = window.innerHeight * 0.5;
    var meshes = [];
    var projector;

    function init3d() {
        var near = 1;
        var far = 10000;

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0xBBBBBB);
        renderer.setSize(containerWidth, containerHeight);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, containerWidth / containerHeight, near, far);
        camera.position.set(0, 0, 1500);
        camera.lookAt({x: 0, y: 0, z: 0 });

        main3dContainer = new THREE.Object3D();
        scene.add(main3dContainer);
        main3dContainer.position.x = - 600;
//        main3dContainer.position.y = - 250;
        main3dContainer.rotation.x = -Math.PI * 0.25;

//        var ambientLight = new THREE.AmbientLight(0x222222);
//        scene.add(ambientLight);

        var light = new THREE.DirectionalLight(0x222222);
        light.position.set(0, 1, 1).normalize();
        scene.add(light);

//                var plane = new THREE.Mesh(
//                new THREE.PlaneGeometry(2000,2000,20,20),
//                new THREE.MeshBasicMaterial({color:0xEEEEEE,wireframe:true}));
//                plane.rotation.x = Math.PI;
//                main3dContainer.add(plane);

        projector = new THREE.Projector();

        loadData();
    }

    var unit3Ds;
    var curSelectedUnit3D;

    function loadData(){
        var svgLoader = new XMLHttpRequest();
        svgLoader.onreadystatechange = function () {
            if (svgLoader.readyState == 4) {
                if (svgLoader.status == 200) {
                    var svgString = svgLoader.responseText;

                    unit3Ds = GimSVGParser.getSVGObject(svgString);
                    for (var key in unit3Ds){
                        var unit3D = unit3Ds[key];
                        main3dContainer.add(unit3D.mesh);
                        meshes.push(unit3D.mesh);
                    }
                }
            }
        }
        svgLoader.open("GET", "assets/data.sgxml", false);
        svgLoader.send(null);
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

//        document.addEventListener('mousemove',onDocumentMouseMove,false);
//        document.addEventListener('mouseup',onDocumentMouseOut,false);
//        document.addEventListener('mouseout',onDocumentMouseOut,false);

        selectUnit3DByPosition(event.clientX,event.clientY);
    }

    function selectUnit3DByPosition(mouseX,mouseY){
        mouseX = 2 * mouseX / containerWidth - 1;
        mouseY = 1 - 2 * mouseY / containerHeight;
        var vec = new THREE.Vector3(mouseX, mouseY, 0);
        projector.unprojectVector(vec, camera);
        var raycaster = new THREE.Raycaster(camera.position, vec.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            for(var key in unit3Ds){
                var unit3D = unit3Ds[key];
                if(mesh === unit3D.mesh){
                    console.log(key);
                    if(curSelectedUnit3D){
                        var tweenPre = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1}, 500).easing(TWEEN.Easing.Elastic.Out);
                        tweenPre.start();
                        curSelectedUnit3D = null;
                    }
                    if(unit3D.svgData.selectable === true){
                        curSelectedUnit3D = unit3D;
                        if(curSelectedUnit3D.mesh.scale.z < 1.2){
                            var tweenCur = new TWEEN.Tween(curSelectedUnit3D.mesh.scale).to({z: 1.2}, 500).easing(TWEEN.Easing.Elastic.Out);
                            tweenCur.start();
                        }
                    }
                    break;
                }
            }
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
