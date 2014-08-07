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

GIM.UnitData = function(pathElement){
    var data = {
        origSVG : pathElement,
        nodeId : pathElement.getAttribute("nodeId"),
        nodeTypeId : pathElement.getAttribute("nodeTypeId"),
        bindNodeIds : pathElement.getAttribute("bindNodeIds"),
        bindShopId : pathElement.getAttribute("bindShopId"),
        d : pathElement.getAttribute("d"),
        fill : pathElement.getAttribute("fill"),
        deep : pathElement.getAttribute("deep"),
        floorId : null
    };
    var nodePositionStringArr = pathElement.getAttribute("nodePosition").split(",");
    data.nodePosition = {
        x : parseFloat(nodePositionStringArr[0]),
        y : parseFloat(nodePositionStringArr[1])
    }
    data.selectable = (data.nodeTypeId === GIM.NODE_TYPE_SHOP);
    data.astarNode = new GIM.AStarNode(data);
    data.meshZ = data.nodeTypeId === GIM.NODE_TYPE_GROUND ? - data.deep : 0;

    return data;
}
