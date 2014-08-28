/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.CameraController = function () {
    var controller = {
        fov: 60,
        near: 1,
        far: 10000,
        camera: new THREE.PerspectiveCamera(),
        lookAtVector: new THREE.Vector3(0,0,0),
        positionVector: new THREE.Vector3(0,0,0),
        init: function () {
            this.camera.fov = this.fov;
            this.camera.near = this.near;
            this.camera.far = this.far;
        },
        _radian: Math.PI * 0.25,
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
            this.camera.position.set(this.positionVector.x,-this.positionVector.y,this.positionVector.z);
//            this.camera.lookAt(this.lookAtVector);
            this.camera.rotation.x = this._radian;
        }
    }
    controller.init();
    return controller;
}
