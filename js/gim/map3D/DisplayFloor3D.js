/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function (gElement) {
    this.data = new GIM.FloorData(gElement);
    this.subUnit3Ds = {};
    this.mesh = new THREE.Object3D();
    this.mesh.displayUnit3D = this;

    console.log("- [GimMap]DisplayFloor3D.constructor:",this.data.floorId, "CONSTRUCTING...");

    for (var key in this.data.unitsData) {
        var unitData = this.data.unitsData[key];
        var displayUnit3D = new GIM.DisplayUnit3D(unitData);
        if(displayUnit3D.mesh) {
            this.mesh.add(displayUnit3D.mesh);
        }
        this.subUnit3Ds[unitData.nodeId] = displayUnit3D;
    }
    return this;
}

GIM.DisplayUnit3D = function (unitData) {
    var tmpMesh = null;
    function addMesh(){
        var path = GIM.SVGParser.parse(unitData.d);
        var shape3d = path.toShapes(true)[0].extrude({amount: unitData.deep * 1, bevelEnabled: false});

        var color = new THREE.Color(unitData.fill);
        var material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color});

        tmpMesh = new THREE.Mesh(shape3d, material);
    }

    var positionOffsetZ = 10;

    function addLogo(logoURL,isServiceLogo,logoSize){
        var logoSize = logoSize === undefined ? (isServiceLogo ? 60 : 80) : logoSize;

        var logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize, 1, 1);
        var logoTexture = THREE.ImageUtils.loadTexture(logoURL);
        var logoMaterial = new THREE.MeshBasicMaterial({map: logoTexture, transparent: true});
        var logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.isServiceLogo = isServiceLogo;
        if(tmpMesh) tmpMesh.add(logoMesh);
        else tmpMesh = logoMesh;
        logoMesh.castShadow = true;
        logoMesh.receiveShadow = true;
        logoMesh.position.x = unitData.nodePosition.x;
        logoMesh.position.y = - unitData.nodePosition.y + (isServiceLogo ? 0 : logoSize * 0.5);
        logoMesh.position.z = parseInt(unitData.deep) + positionOffsetZ;
        logoMesh.rotation.x = Math.PI * 0.25;
        if(isServiceLogo) {
            unitData.origZ = logoSize * 0.5 + 10;
            logoMesh.position.z = unitData.origZ;
        }
    }

    function addText(text,offsetY,fontSize){
        if(text == "") return;
        if(offsetY === undefined) offsetY = 0;
        if(fontSize === undefined) fontSize = 18;

//        var fontStyle = "Bold " + fontSize + "px " + GIM.FONT_NAME;
        var fontStyle = fontSize + "px " + GIM.FONT_NAME;

        var textCanvas = document.createElement("canvas");
//        document.body.appendChild(textCanvas);

        var textCTX = textCanvas.getContext("2d");
        textCTX.font = fontStyle;
        textCanvas.width = textCTX.measureText(text).width + 2;
        textCanvas.height = 24;
        textCanvas.style.cssText = "width:"+textCanvas.width+"px;height:"+textCanvas.height+"px;background:#FF0000;margin:2px;";

        textCTX.font = fontStyle;
        textCTX.fillStyle = "#000";
        textCTX.fillText(text,1,textCanvas.height - 6);

        var textGeometry = new THREE.PlaneGeometry(textCanvas.width,textCanvas.height,1,1);
        var textTexture = new THREE.Texture(textCanvas);
        textTexture.needsUpdate = true;
        var textMaterial = new THREE.MeshBasicMaterial({map:textTexture,transparent:true});
        var textMesh = new THREE.Mesh(textGeometry,textMaterial);
        textMesh.position.x = unitData.nodePosition.x;
        textMesh.position.y = - unitData.nodePosition.y - offsetY - textCanvas.height * 0.5;
        textMesh.position.z = parseInt(unitData.deep) + positionOffsetZ;
        if(tmpMesh) tmpMesh.add(textMesh);
        else tmpMesh = textMesh;
    }

    switch (unitData.nodeTypeId) {
        case GIM.NODE_TYPE_ASTAR:
            break;
        case GIM.NODE_TYPE_GROUND:
            addMesh();
            unitData.selectable = false;
            tmpMesh.position.z = - (unitData.deep * 1 + 1);
            break;
        case GIM.NODE_TYPE_SHOP:
            addMesh();
            if (unitData.bindShopId) {
//                addLogo("assets/img/shoplogo/0.png");
                addText(unitData.shopName);
                addText(unitData.bindShopId,18,14);
            }
            break;
        case GIM.NODE_TYPE_MACHINE:
            addLogo("assets/img/nodetypelogo/machine.png",true);
            break;
        case GIM.NODE_TYPE_ESCALATOR:
            addLogo("assets/img/nodetypelogo/escalator.png",true);
            break;
        case GIM.NODE_TYPE_LIFT:
            addLogo("assets/img/nodetypelogo/lift.png",true);
            break;
        case GIM.NODE_TYPE_TOILET:
            addLogo("assets/img/nodetypelogo/toilet.png",true);
            break;
        case GIM.NODE_TYPE_SERVICE:
            addLogo("assets/img/nodetypelogo/service.png",true);
            break;
        case GIM.NODE_TYPE_ATM:
            addLogo("assets/img/nodetypelogo/atm.png",true);
            break;
        default :
            break;
    }

    if(tmpMesh){
        tmpMesh.castShadow = true;
        tmpMesh.receiveShadow = true;
        this.mesh = tmpMesh;
        this.mesh.displayUnit3D = this;
    }
    this.data = unitData;

    return this;
}
