/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.CameraController = function (mainContainer,container3D) {
    var controller = {
        fov: GIM.MAP_CONFIG.fov,
        near: GIM.MAP_CONFIG.near,
        far: GIM.MAP_CONFIG.far,
        minDistance: GIM.MAP_CONFIG.minDistance,
        maxDistance: GIM.MAP_CONFIG.maxDistance,
        minX: GIM.MAP_CONFIG.minX,
        maxX: GIM.MAP_CONFIG.maxX,
        minY: GIM.MAP_CONFIG.minY,
        maxY: GIM.MAP_CONFIG.maxY,
        cameraContainerZ: new THREE.Object3D(),
        cameraContainerZPosition: new THREE.Vector3(0,0,0),
        camera: new THREE.PerspectiveCamera(),
        positionVector: new THREE.Vector3(0,0,0),
        shadowLight: new THREE.DirectionalLight(0xAAAAAA,0.01),
        init: function () {
            this.camera.fov = this.fov;
            this.camera.near = this.near;
            this.camera.far = this.far;

            container3D.add(this.cameraContainerZ);
            this.cameraContainerZ.add(this.camera);
//            this.camera.rotation.z = - Math.PI * 0.03;

            if(GIM.SHADOW_MAP_SIZE !== 0){
                this.cameraContainerZ.add(this.shadowLight);
                this.shadowLight.castShadow = true;
                this.shadowLight.shadowCameraFov = this.fov;
//            this.shadowLight.shadowCameraNear = 1800;
//            this.shadowLight.shadowCameraFar = 4500;
                this.shadowLight.shadowCameraNear = this.near;
                this.shadowLight.shadowCameraFar = 1500;
                this.shadowLight.shadowCameraLeft = -1600;
                this.shadowLight.shadowCameraRight = 1600;
                this.shadowLight.shadowCameraTop = 400;
                this.shadowLight.shadowCameraBottom = -800;
                this.shadowLight.shadowBias = 0.00001;
                this.shadowLight.shadowDarkness = 0.3;
                this.shadowLight.shadowMapWidth = this.shadowLight.shadowMapHeight = GIM.SHADOW_MAP_SIZE;
                if(GIM.DEBUG_MODE)
                    this.shadowLight.shadowCameraVisible = true;
            }
        },
        _radian: Math.PI * 0.2,
        _percent: 0,
        get percent(){
            return this._percent;
        },
        set percent(value){
            this._percent = value;
            this.distance = (this.maxDistance - this.minDistance) * (1 - this._percent / 100) + this.minDistance;
            if(GIM.DEBUG_MODE) console.log("- [GimMap]CameraController.persent:"+value+"camera distance:"+this.distance);
            this.update();
        },
        _distance: 0,
        get distance(){
            return this._distance;
        },
        set distance(value){
            value = value > this.maxDistance ? this.maxDistance : (value < this.minDistance ? this.minDistance : value);
            this._distance = value;
            this.update();
        },
        get rotation(){
            return this.camera.rotation;
        },
        set rotation(value){
            this._rotation = value;
        },
        get position(){
            return this.camera.position;
        },
        update: function (){
            this.positionVector.z = Math.cos(this._radian) * this._distance;
            this.positionVector.y = Math.sin(this._radian) * this._distance + GIM.MAP_OFFSET_Y;
            this.camera.position.set(this.positionVector.x,-this.positionVector.y,this.positionVector.z);
            this.camera.rotation.x = this._radian;

            this.cameraContainerZ.position.set(this.cameraContainerZPosition.x,-this.cameraContainerZPosition.y,this.cameraContainerZPosition.z);

            this.shadowLight.position.set(200,-200,600);
            this.shadowLight.target.position.set(this.cameraContainerZPosition.x,-this.cameraContainerZPosition.y,0);
        }
    }
    controller.init();

//    var mouseOrigPoint = {x:0,y:0};
//    function onContainerTouchStart(e){
//        e.preventDefault();
//        e.stopPropagation();
//
//        var touch;
//        if(e instanceof MouseEvent){
//            touch = e;
//        }else{
//            touch = e.targetTouches[0];
//        }
//
//
//        mouseOrigPoint.x = touch.clientX;
//        mouseOrigPoint.y = touch.clientY;
//
//        console.log("----------touchstart");
//
//        mainContainer.addEventListener('touchmove', onContainerTouchMove, false);
//        mainContainer.addEventListener('touchend', onContainerTouchEnd, false);
//
//        mainContainer.addEventListener("mousemove",onContainerTouchMove, false);
//        mainContainer.addEventListener("mouseup",onContainerTouchEnd, false);
//    }
//
//    function onContainerTouchMove(e) {
//        e.preventDefault();
//        e.stopPropagation();
//
//        console.log("---------- touchmove");
//
//        var touch;
//        if(e instanceof MouseEvent){
//            touch = e;
//        }else{
//            touch = e.targetTouches[0];
//        }
//
//        var deltaX = touch.clientX - mouseOrigPoint.x;
//        var deltaY = touch.clientY - mouseOrigPoint.y;
//        mouseOrigPoint.x = touch.clientX;
//        mouseOrigPoint.y = touch.clientY;
//
//        var aimX = controller.cameraContainerZPosition.x - deltaX * 1;
//        var aimY = controller.cameraContainerZPosition.y - deltaY * 1;
//        aimX = aimX > controller.maxX ? controller.maxX : (aimX < controller.minX ? controller.minX : aimX);
//        aimY = aimY > controller.maxY ? controller.maxY : (aimY < controller.minY ? controller.minY : aimY);
//        controller.cameraContainerZPosition.x = aimX;
//        controller.cameraContainerZPosition.y = aimY;
//
//        controller.update();
//    }
//
//    function onContainerTouchEnd(e) {
//        e.preventDefault();
//        e.stopPropagation();
//        console.log("----------touchend");
//
//        mainContainer.removeEventListener('touchmove', onContainerTouchMove, false);
//        mainContainer.removeEventListener('touchend', onContainerTouchEnd, false);
//
//        mainContainer.removeEventListener("mousemove",onContainerTouchMove, false);
//        mainContainer.removeEventListener("mouseup",onContainerTouchEnd, false);
//    }
//
    function onCOntainerMouseWheel(e){
        e.preventDefault();
        if(controller.bar) controller.bar.percent -= e.deltaY * 0.01;
    }

//    mainContainer.addEventListener("touchstart",onContainerTouchStart, false);
//    mainContainer.addEventListener("mousedown",onContainerTouchStart, false);
    mainContainer.addEventListener('mousewheel', onCOntainerMouseWheel, false);

    return controller;
}
