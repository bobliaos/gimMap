/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function(gElement){
    this.data = new GIM.FloorData(gElement);
    this.subUnit3Ds = {};
    this.mesh = new THREE.Object3D();
    this.mesh.displayUnit3D = this;

    console.log(this.data.floorId,"CONSTRUCTION...");

    for(var key in this.data.unitsData){
        var unitData = this.data.unitsData[key];
        if(unitData.nodeTypeId != GIM.NODE_TYPE_ASTAR){
            var displayUnit3D = new GIM.DisplayUnit3D(unitData);
            this.mesh.add(displayUnit3D.mesh);
            displayUnit3D.mesh.position.z = unitData.meshZ;
            this.subUnit3Ds[unitData.nodeId] = displayUnit3D;
        }
    }
    return this;
}

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
        this.mesh.displayUnit3D = this;
    }
    var logoGeometry = new THREE.PlaneGeometry(60,60,1,1);

    if(this.data.nodeTypeId === GIM.NODE_TYPE_SHOP && this.data.bindShopId){
        var logoTexture = THREE.ImageUtils.loadTexture("assets/img/shoplogo/" + this.data.bindShopId + ".png");
        var logoMaterial = new THREE.MeshBasicMaterial({map:logoTexture,transparent: true,overdraw:true,antialias:true});
        var logoMesh = new THREE.Mesh (logoGeometry,logoMaterial);
//    logoMesh.lookAt(camera.position);
        this.mesh.add(logoMesh);
        logoMesh.position.x = this.data.nodePosition.x;
        logoMesh.position.y = - this.data.nodePosition.y;
        logoMesh.position.z = parseInt(this.data.deep) + 2;
    }
//    else if(this.data.nodeTypeId === GIM.NODE_TYPE_ESCALATOR) ...

    return this;
}