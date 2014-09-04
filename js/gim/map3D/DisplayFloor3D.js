/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function (gElement) {
    var floor = {
        data: new GIM.FloorData(gElement),
        subUnit3Ds : {},
        mesh: new THREE.Object3D()
    };
    floor.mesh.displayUnit3D = floor;

    console.log("- [GimMap]DisplayFloor3D.constructor:",floor.data.floorId, "CONSTRUCTING...");

    var tmpSize = null;
    for (var key in floor.data.unitsData) {
        var unitData = floor.data.unitsData[key];
        var displayUnit3D = new GIM.DisplayUnit3D(unitData);
        if(displayUnit3D.mesh) {
            floor.mesh.add(displayUnit3D.mesh);

            displayUnit3D.mesh.geometry.computeBoundingBox();
            var size = displayUnit3D.mesh.geometry.boundingBox.size();
            if(!tmpSize || tmpSize.length() < size.length()){
                tmpSize = size;
                floor.center = displayUnit3D.mesh.geometry.boundingBox.center();
            }
            tmpSize = !tmpSize ? size : (tmpSize.length() > size.length() ? tmpSize : size);
        }
        floor.subUnit3Ds[unitData.nodeId] = displayUnit3D;
    }

    return floor;
}
