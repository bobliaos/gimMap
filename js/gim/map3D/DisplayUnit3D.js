/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayUnit3D = function(unitData){
    this.data = unitData;

    var path = GIM.SVGParser.parse(this.data.d);
    var color = new THREE.Color(this.data.fill);
    var material = new THREE.MeshLambertMaterial({color:color,ambient:color,emissive:color/*,wireframe:true*/});
    var height = this.data.deep;
    var simpleShapes = path.toShapes(true);
    var length = simpleShapes.length;

    for(var i = 0;i < length;i ++){
        var simpleShape = simpleShapes[i];
        var shape3d = simpleShape.extrude({amount:height,bevelEnabled:false});
        this.mesh = new THREE.Mesh(shape3d,material);
    }

    return this;
}
