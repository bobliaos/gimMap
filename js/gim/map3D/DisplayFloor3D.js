/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function(gElement){
    this.data = new GIM.FloorData(gElement);
    this.displayUnit3Ds = {};
    this.unit3DsContainer = new THREE.Object3D();

    console.log(this.data.floorId,"CONSTRUCTION...");

    for(var key in this.data.unitsData){
        var unitData = this.data.unitsData[key];
        if(unitData.nodeTypeId != "0"){
            var displayUnit3D = new GIM.DisplayUnit3D(unitData);
            this.unit3DsContainer.add(displayUnit3D.mesh);
            displayUnit3D.mesh.position.z = unitData.meshZ;
            this.displayUnit3Ds[unitData.nodeId] = displayUnit3D;
        }
    }
    return this;
}
