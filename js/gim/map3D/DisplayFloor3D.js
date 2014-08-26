/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function (gElement) {
    this.data = new GIM.FloorData(gElement);
    this.subUnit3Ds = {};
    this.mesh = new THREE.Object3D();
    this.mesh.displayUnit3D = this;

    console.log("- [GimMap]DisplayFloor3D.constructor:",this.data.floorId, "CONSTRUCTING...");

    for (var key in this.data.unitsData) {
        var unitData = this.data.unitsData[key];
        var displayUnit3D = new GIM.DisplayUnit3D(unitData);
        if(displayUnit3D.mesh) {
            this.mesh.add(displayUnit3D.mesh);
        }
        this.subUnit3Ds[unitData.nodeId] = displayUnit3D;
    }
    return this;
}
