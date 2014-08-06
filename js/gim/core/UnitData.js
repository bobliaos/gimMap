/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.UnitData = function(pathElement){
    var data = {
        origSVG : pathElement,
        nodeId : pathElement.getAttribute("nodeId"),
        nodeTypeId : pathElement.getAttribute("nodeTypeId"),
        bindNodeIds : pathElement.getAttribute("bindNodeIds"),
        d : pathElement.getAttribute("d"),
        fill : pathElement.getAttribute("fill"),
        deep : pathElement.getAttribute("deep")
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
