/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayFloor3D = function (gElement) {
    this.data = new GIM.FloorData(gElement);
    this.subUnit3Ds = {};
    this.mesh = new THREE.Object3D();
    this.mesh.displayUnit3D = this;

    console.log(this.data.floorId, "CONSTRUCTION...");

    for (var key in this.data.unitsData) {
        var unitData = this.data.unitsData[key];
        var displayUnit3D = new GIM.DisplayUnit3D(unitData);
        if(displayUnit3D.mesh) {
            this.mesh.add(displayUnit3D.mesh);
//            displayUnit3D.mesh.position.z = unitData.meshZ + ;
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
        var material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color/*, opacity: 0.5, transparent: true,wireframe:true*/});

        tmpMesh = new THREE.Mesh(shape3d, material);
    }

    function addLogo(logoURL,isLogo){
        var logoGeometry = new THREE.PlaneGeometry(isLogo?40:80, isLogo?40:80, 1, 1);
        var logoTexture = THREE.ImageUtils.loadTexture(logoURL);
        var logoMaterial = new THREE.MeshBasicMaterial({map: logoTexture, transparent: true});
        var logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.isLogo = isLogo;
        if(tmpMesh) tmpMesh.add(logoMesh);
        else tmpMesh = logoMesh;
        logoMesh.position.x = unitData.nodePosition.x;
        logoMesh.position.y = - unitData.nodePosition.y;
        logoMesh.position.z = parseInt(unitData.deep) + 2;
        if(isLogo) logoMesh.position.z = 30;
    }

    function addText(text){
        var textCanvas = document.createElement("canvas");
        textCanvas.width = 70;
        textCanvas.height = 22;
        textCanvas.style.cssText = "width:"+textCanvas.width+"px;height:"+textCanvas.height+"px;background:#FF0000;margin:2px";

        var textCTX = textCanvas.getContext("2d");
//        textCTX.font = "20px Microsoft Yahei";
        textCTX.font = "20px Felix Titling";
        textCTX.fillStyle = "#000";
        textCTX.fillText(text,0,17);
//        document.body.appendChild(textCanvas);

        var textGeometry = new THREE.PlaneGeometry(textCanvas.width,textCanvas.height,1,1);
        var textTexture = new THREE.Texture(textCanvas);
        textTexture.needsUpdate = true;
        var textMaterial = new THREE.MeshBasicMaterial({map:textTexture,transparent:true});
        var textMesh = new THREE.Mesh(textGeometry,textMaterial);
        textMesh.position.x = unitData.nodePosition.x;
        textMesh.position.y = - unitData.nodePosition.y;
        textMesh.position.z = parseInt(unitData.deep) + 3;
        if(tmpMesh) tmpMesh.add(textMesh);
        else tmpMesh = textMesh;

//        pin.style.display = "block";
//        pin.style.left = pinX - pin.width * 0.5 + "px";
//        pin.style.top = pinY - pin.height + "px";
//
//        if (text != undefined) {
//            var ctx = pin.getContext("2d");
//            ctx.font = "20px Microsoft Yahei";
//            ctx.strokeText(text, 10, pin.width * 0.5);
//        }
//    }
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
                //addText(unitData.bindShopId);
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
        this.mesh = tmpMesh;
        this.mesh.displayUnit3D = this;
    }
    this.data = unitData;

    return this;
}

GIM.NodeTypes = {
    "3": {
        "nodeTypeName": "MACHINE",
        "nodeTypeId": "3",
        "nodeTypeLogo": "img/nodetypelogo/machine.png"
    },
    "4": {
        "nodeTypeName": "ESCALATOR",
        "nodeTypeId": "4",
        "nodeTypeLogo": "img/nodetypelogo/escalator.png"
    },
    "5": {
        "nodeTypeName": "LIFT",
        "nodeTypeId": "5",
        "nodeTypeLogo": "img/nodetypelogo/lift.png"
    },
    "6": {
        "nodeTypeName": "STAIRS",
        "nodeTypeId": "6",
        "nodeTypeLogo": ""
    },
    "7": {
        "nodeTypeName": "TOILET",
        "nodeTypeId": "7",
        "nodeTypeLogo": "img/nodetypelogo/toilet.png"
    },
    "8": {
        "nodeTypeName": "SERVICE",
        "nodeTypeId": "7",
        "nodeTypeLogo": "img/nodetypelogo/service.png"
    },
    "9": {
        "nodeTypeName": "ATM",
        "nodeTypeId": "7",
        "nodeTypeLogo": "img/nodetypelogo/atm.png"
    }
}
