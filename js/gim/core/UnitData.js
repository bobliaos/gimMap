/**
 * @author bob / http://bobliaos.diandian.com
 * */

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
        shopName : "",
        origZ : 0
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
