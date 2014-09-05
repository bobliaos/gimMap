/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.AStar = {
    search : function(nodes,startNodeId,endNodeId){
        //clear
        for (var key in nodes){
            var node = nodes[key];
            node.f = 0; node.g = 0; node.h = 0;
            node.closed = false;
            node.parent = null;
        }

        var startNode = nodes[startNodeId];
        var endNode = nodes[endNodeId];

        if(startNode && endNode)
        {
            function calculateDistance(node1,node2){
                var dx = node1.x - node2.x;
                var dy = node1.y - node2.y;
                return Math.sqrt(dx * dx + dy * dy);
            };

            var openList = [];
            var closeList = [];
            openList.push(startNode);
            while(openList.length > 0){
                var curNode = openList.pop();
                closeList.push(curNode);
                if(curNode === endNode){
                    break;
                }else{
                    for (var i = 0;i < curNode.bindNodes.length;i ++){
                        var bindNode = curNode.bindNodes[i];
                        if(closeList.indexOf(bindNode) < 0 && bindNode.data.floorId === curNode.data.floorId){
                            bindNode.g = calculateDistance(startNode,endNode);
                            bindNode.h = calculateDistance(bindNode,endNode);
                            bindNode.f = bindNode.g + bindNode.h;
                            bindNode.parent = curNode;
                            openList.push(bindNode);
                        }
                    }
                    openList.sort(function(node1,node2){
                        return node1.f < node2.f;
                    });
                }
            }
        }

        var pathNodes =[];
        var closeNode = closeList.pop();
        while(closeNode){
            pathNodes.push(closeNode);
            closeNode = closeNode.parent;
        }

        if(pathNodes[0] !== endNode) pathNodes = [];

        return pathNodes;
    }
}

GIM.AStarGraph = function (){
    this.nodes = [];
}

GIM.AStarNode = function (unitData){
    return {
        id : unitData.nodeId,
        data : unitData,
        x : unitData.nodePosition.x,
        y : unitData.nodePosition.y,
        f : 0,
        g : 0,
        h : 0,
        parent : null,
        bindNodes : []
    }
}
