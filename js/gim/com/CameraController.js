/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.CameraController = function (mainContainer,container3D) {
    var controller = {
        fov: 60,
        near: 1,
        far: 10000,
        minDistance: 200,
        maxDistance: 1800,
        minX: -900,
        maxX: 2000,
        minY: -100,
        maxY: 300,
        cameraContainerZ: new THREE.Object3D(),
        cameraContainerZPosition: new THREE.Vector3(0,0,0),
        camera: new THREE.PerspectiveCamera(),
        positionVector: new THREE.Vector3(0,0,0),
        shadowLight: new THREE.DirectionalLight(0xffffff, 0.2),
        init: function () {
            this.camera.fov = this.fov;
            this.camera.near = this.near;
            this.camera.far = this.far;

            container3D.add(this.cameraContainerZ);
            this.cameraContainerZ.add(this.camera);

            GIM.SHADOW_MAP_SIZE = 1024 * 2;
            if(GIM.SHADOW_MAP_SIZE !== 0){
                this.cameraContainerZ.add(this.shadowLight);
                this.shadowLight.castShadow = true;
//            this.shadowLight.shadowCameraNear = 1800;
//            this.shadowLight.shadowCameraFar = 4500;
                this.shadowLight.shadowCameraNear = this.near;
                this.shadowLight.shadowCameraFar = 1500;
                this.shadowLight.shadowCameraLeft = -1000;
                this.shadowLight.shadowCameraRight = 1000;
                this.shadowLight.shadowBias = 0.0001;
                this.shadowLight.shadowDarkness = 0.6;
                this.shadowLight.shadowMapWidth = this.shadowLight.shadowMapHeight = GIM.SHADOW_MAP_SIZE;
                if(GIM.DEBUG_MODE) this.shadowLight.shadowCameraVisible = true;
            }
        },
        _radian: Math.PI * 0.25,
        _percent: 0,
        get percent(){
            return this._percent;
        },
        set percent(value){
            this._percent = value;
            this.distance = (this.maxDistance - this.minDistance) * (1 - this._percent / 100) + this.minDistance;
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

            this.shadowLight.position.set(100,-600,500);
            this.shadowLight.target.position.set(this.cameraContainerZPosition.x,-this.cameraContainerZPosition.y,0);
        }
    }
    controller.init();

    var mouseOrigPoint = {x:0,y:0};
    function onContainerMouseDown(e){
        mouseOrigPoint.x = e.offsetX;
        mouseOrigPoint.y = e.offsetY;

        mainContainer.addEventListener('mousemove', onContainerMouseMove, false);
        mainContainer.addEventListener('mouseup', onContainerMouseOut, false);
        mainContainer.addEventListener('mouseout', onContainerMouseOut, false);
    }

    function onContainerMouseMove(e) {
        var deltaX = e.offsetX - mouseOrigPoint.x;
        var deltaY = e.offsetY - mouseOrigPoint.y;
//        controller.lookAtVector.x -= deltaX;
        mouseOrigPoint.x = e.offsetX;
        mouseOrigPoint.y = e.offsetY;

        var aimX = controller.cameraContainerZPosition.x - deltaX * 1;
        var aimY = controller.cameraContainerZPosition.y - deltaY * 1;
        aimX = aimX > controller.maxX ? controller.maxX : (aimX < controller.minX ? controller.minX : aimX);
        aimY = aimY > controller.maxY ? controller.maxY : (aimY < controller.minY ? controller.minY : aimY);
        controller.cameraContainerZPosition.x = aimX;
        controller.cameraContainerZPosition.y = aimY;

        controller.update();
    }

    function onContainerMouseOut(e) {
        mainContainer.removeEventListener('mousemove', onContainerMouseMove, false);
        mainContainer.removeEventListener('mouseup', onContainerMouseOut, false);
        mainContainer.removeEventListener('mouseout', onContainerMouseOut, false);
    }

    mainContainer.addEventListener("mousedown",onContainerMouseDown);

    return controller;
}
