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
        floorId : null,
        shopName : ""
    };
    var nodePositionStringArr = pathElement.getAttribute("nodePosition").split(",");
    data.nodePosition = {
        x : parseFloat(nodePositionStringArr[0]),
        y : parseFloat(nodePositionStringArr[1])
    }
    data.selectable = true;
    data.astarNode = new GIM.AStarNode(data);

    for(var i = 0;i < GIM.shopList.length;i ++){
        var shopData = GIM.shopList[i];
        if(shopData.shop_room === data.bindShopId){
            data.shopName = shopData.name;
            break;
        }
    }

    return data;
}
