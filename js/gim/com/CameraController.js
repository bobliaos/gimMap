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
        cameraContainerZ: new THREE.Object3D(),
        camera: new THREE.PerspectiveCamera(),
        lookAtVector: new THREE.Vector3(0,0,0),
        positionVector: new THREE.Vector3(0,0,0),
        init: function () {
            this.camera.fov = this.fov;
            this.camera.near = this.near;
            this.camera.far = this.far;

            container3D.add(this.cameraContainerZ);
            this.cameraContainerZ.add(this.camera);
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
            this.cameraContainerZ.position.set(this.positionVector.x,-this.positionVector.y,this.positionVector.z);
//            this.camera.lookAt(this.lookAtVector);
            this.cameraContainerZ.rotation.x = this._radian;
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
        controller.lookAtVector.x -= deltaX;
        mouseOrigPoint.x = e.offsetX;
        mouseOrigPoint.y = e.offsetY;

        controller.cameraContainerZ.rotation.y += deltaX * 0.01;

//        controller.update();
    }

    function onContainerMouseOut(e) {
        mainContainer.removeEventListener('mousemove', onContainerMouseMove, false);
        mainContainer.removeEventListener('mouseup', onContainerMouseOut, false);
        mainContainer.removeEventListener('mouseout', onContainerMouseOut, false);
    }

    mainContainer.addEventListener("mousedown",onContainerMouseDown);

    return controller;
}
