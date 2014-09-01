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
        minX: 0,
        maxX: 1000,
        minY: -200,
        maxY: 0,
        cameraContainerZ: new THREE.Object3D(),
        camera: new THREE.PerspectiveCamera(),
        lookAtVector: new THREE.Vector3(0,0,0),
        positionVector: new THREE.Vector3(0,0,0),
        shadowLight: new THREE.DirectionalLight(0xffffff, 0.2),
        init: function () {
            this.camera.fov = this.fov;
            this.camera.near = this.near;
            this.camera.far = this.far;

            container3D.add(this.cameraContainerZ);
            this.cameraContainerZ.add(this.camera);

            GIM.SHADOW_MAP_SIZE = 0;
            if(GIM.SHADOW_MAP_SIZE !== 0){
                this.cameraContainerZ.add(this.shadowLight);
                this.shadowLight.castShadow = true;
//            this.shadowLight.shadowCameraNear = 1800;
//            this.shadowLight.shadowCameraFar = 4500;
                this.shadowLight.shadowCameraNear = this.near;
                this.shadowLight.shadowCameraFar = this.far;
                this.shadowLight.shadowBias = 0.0001;
                this.shadowLight.shadowDarkness = 0.6;
                this.shadowLight.shadowMapWidth = this.shadowLight.shadowMapHeight = GIM.SHADOW_MAP_SIZE;
//            this.shadowLight.shadowCameraVisible = true;
            }
        },
//        _radian: Math.PI * 0.5,
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
            this.positionVector.x = this.lookAtVector.x;
            this.positionVector.z = Math.cos(this._radian) * this._distance;
            this.positionVector.y = Math.sin(this._radian) * this._distance + GIM.MAP_OFFSET_Y;
            this.camera.position.set(this.positionVector.x,-this.positionVector.y,this.positionVector.z);
//            this.camera.lookAt(this.lookAtVector);
            this.camera.rotation.x = this._radian;

            this.shadowLight.position.set(this.positionVector.x,-this.positionVector.y,this.positionVector.z);
            this.shadowLight.target.position.set(this.lookAtVector.x * 1.5,this.lookAtVector.y,this.lookAtVector.z);

//            this.shadowLight.shadowCameraNear = this.near;
//            this.shadowLight.shadowCameraFar = this.distance;
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
        mainContainer.addEventListener('mousewheel', onContainerMouseWheel, false);
    }

    function onContainerMouseWheel(e){
        e.preventDefault();
        controller.distance += e.deltaY;
    }

    function onContainerMouseMove(e) {
        var deltaX = e.offsetX - mouseOrigPoint.x;
        var deltaY = e.offsetY - mouseOrigPoint.y;
        controller.lookAtVector.x -= deltaX;
        mouseOrigPoint.x = e.offsetX;
        mouseOrigPoint.y = e.offsetY;

//        controller.cameraContainerZ.rotation.z += deltaX * 0.01;
//        controller.cameraContainerZ.position.z += deltaX * 0.1;

        var aimX = controller.cameraContainerZ.position.x - deltaX * 1;
        var aimY = controller.cameraContainerZ.position.y + deltaY * 1;
        aimX = aimX > controller.maxX ? controller.maxX : (aimX < controller.minX ? controller.minX : aimX);
        aimY = aimY > controller.maxY ? controller.maxY : (aimY < controller.minY ? controller.minY : aimY);

//        controller.cameraContainerZ.position.x = aimX;
//        controller.cameraContainerZ.position.y = aimY;

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
