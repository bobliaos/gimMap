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
        textureData : pathElement.getAttribute("textureData"),//"f,b,20*20,10"  "[isMapping(t/f)],[text/image/both],[width*height],[rotation]"
        isMapping : false,
        mappingType : 'b',
        mappingSize : null, //THREE.Vector2()
        mappingRotation : 0,
        shopLogo : "",
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

    var textureDataArray = data.textureData.split(",");
    data.isMapping = textureDataArray[0] === "t";
    data.mappingType = textureDataArray[1]; //t/i/b
    data.mappingSize = new THREE.Vector2(textureDataArray[2].split("*")[0],textureDataArray[2].split("*")[1]);
    data.mappingRotation = parseFloat(textureDataArray[3]); //angle or radius?

    for(var i = 0;i < GIM.shopList.length;i ++){
        var shopData = GIM.shopList[i];
        if(shopData.shop_room != "" && shopData.shop_room === data.bindShopId){
            data.shopName = shopData.name;
            data.shopLogo = GIM.REMOTE_SERVER + "system" + shopData.shop_logo;
            break;
        }
    }

    return data;
}
