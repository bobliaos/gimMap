/**
 * @author bob / http://bobliaos.diandian.com
 * */

const SHOP_NODE_TYPE_ID = "3";

var GimSVGData = function(pathElement){
    var obj = {
        nodeId : pathElement.getAttribute("nodeId"),
        nodeTypeId : pathElement.getAttribute("nodeTypeId"),
        bindNodeIds : pathElement.getAttribute("bindNodeIds"),
        nodePosition : pathElement.getAttribute("nodePosition"),
        d : pathElement.getAttribute("d"),
        fill : pathElement.getAttribute("fill"),
        deep : pathElement.getAttribute("deep")
    };
    obj.selectable = (obj.nodeTypeId === SHOP_NODE_TYPE_ID);

    return obj;
}
