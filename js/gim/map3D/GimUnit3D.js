/**
 * @author bob / http://bobliaos.diandian.com
 * */

var GimUnit3D = function(pathElement){
    this.svgData = new GimSVGData(pathElement);

    var path = GimSVGParser.parse(this.svgData.d);
    var color = new THREE.Color(this.svgData.fill);
    var material = new THREE.MeshLambertMaterial({color:color,ambient:color,emissive:color/*,wireframe:true*/});
    var height = this.svgData.deep;
    var simpleShapes = path.toShapes(true);
    var length = simpleShapes.length;

    for(var i = 0;i < length;i ++){
        var simpleShape = simpleShapes[i];
        var shape3d = simpleShape.extrude({amount:height,bevelEnabled:false});
        this.mesh = new THREE.Mesh(shape3d,material);
    }

    return this;
}
