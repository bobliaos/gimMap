/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.FloorData = function(gElement){
    var data = {
        origSVG : gElement,
        floorId : gElement.getAttribute("id"),
        unitsData : {}
    };

    var pathElements = gElement.getElementsByTagName('path');
    for(var pathIndex = 0;pathIndex < pathElements.length;pathIndex ++){
        var pathElement = pathElements[pathIndex];
        var unitData = new GIM.UnitData(pathElement);
        unitData.floorId = data.floorId;
        data.unitsData[unitData.nodeId] = unitData;
    }

    return data;
}
