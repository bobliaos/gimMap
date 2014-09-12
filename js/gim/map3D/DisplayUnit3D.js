/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.DisplayUnit3D = function (unitData) {
    var tmpMesh = null;
    function addMesh(){
        var path = GIM.SVGParser.parse(unitData.d);
        try{
            var shape3d = path.toShapes(true)[0].extrude({amount: unitData.deep * GIM.UNIT_HEIGHT_SCALE, bevelEnabled: false});
            var color = new THREE.Color(unitData.fill);
            var material = new THREE.MeshLambertMaterial({color: color, ambient: color, emissive: color});
            tmpMesh = new THREE.Mesh(shape3d, material);
        }catch (e){
            console.log("- [GimMap].addMesh: ERROR:",e);
        }
    }

    var positionOffsetZ = 10;

    function addLogo(logoURL,isServiceLogo,logoSize){
//        var logoSize = logoSize === undefined ? (isServiceLogo ? 60 : 80) : logoSize;
        var logoSize = logoSize === undefined ? (isServiceLogo ? 30 : 40) : logoSize;

        var logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize, 1, 1);
        THREE.ImageUtils.crossOrigin = 'anonymous';
        var logoTexture = THREE.ImageUtils.loadTexture(logoURL);
        var logoMaterial = new THREE.MeshBasicMaterial({map: logoTexture, transparent: true});
        var logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.isServiceLogo = isServiceLogo;
        if(tmpMesh) tmpMesh.add(logoMesh);
        else tmpMesh = logoMesh;
        logoMesh.castShadow = true;
        logoMesh.receiveShadow = true;
        logoMesh.position.x = unitData.nodePosition.x;
        logoMesh.position.y = - unitData.nodePosition.y + (isServiceLogo ? 0 : logoSize * 0.5) + (logoSize > 100 ? 20 : 0);
        logoMesh.position.z = parseInt(unitData.deep) + positionOffsetZ;
        if(isServiceLogo) {
            logoMesh.rotation.x = Math.PI * 0.25;
            unitData.origZ = logoSize * 0.5 + 20;
            logoMesh.position.z = unitData.origZ;
        }
    }

    function addText(text,offsetY,fontSize){
        if(text == "") return;
        if(offsetY === undefined) offsetY = 0;
        if(fontSize === undefined) fontSize = 12;

//        var fontStyle = "Bold " + fontSize + "px " + GIM.FONT_NAME;
        var fontStyle = fontSize + "pt " + GIM.FONT_NAME;

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
            tmpMesh.position.z = - (unitData.deep * GIM.UNIT_HEIGHT_SCALE + 1);
            break;
        case GIM.NODE_TYPE_SHOP:
            addMesh();
            if(unitData.isMapping){
                if (unitData.bindShopId){
                    if(unitData.mappingType === 't' || unitData.mappingType === 'b')
                        addText(unitData.shopName,2,2);
                    if(unitData.mappingType === 'i' || unitData.mappingType === 'b')
//                        addLogo("http://g.hiphotos.baidu.com/baike/c0%3Dbaike80%2C5%2C5%2C80%2C26%3Bt%3Dgif/sign=07a0ef5680025aafc73f76999a84c001/0df431adcbef76099d8530092cdda3cc7dd99e9e.jpg",false,unitData.mappingSize.x);
                        addLogo(unitData.shopLogo,false,unitData.mappingSize.x);
                }
            }
            break;
        case GIM.NODE_TYPE_MACHINE:
            addLogo(GIM.SERVER + "img/nodetypelogo/machine_.png",true,80);
            var tween = new TWEEN.Tween(tmpMesh.material);

            function doAnimate(){
                tween.to({opacity:1},600).easing(TWEEN.Easing.Elastic.InOut).onComplete(function(){
                    tween.to({opacity:0},220).easing(TWEEN.Easing.Linear.None).onComplete(doAnimate).start();
                }).delay(Math.random() * 600 + 300).start();
            }
            doAnimate();
            break;
        case GIM.NODE_TYPE_ESCALATOR:
            addLogo(GIM.SERVER + "img/nodetypelogo/escalator.png",true);
            break;
        case GIM.NODE_TYPE_LIFT:
            addLogo(GIM.SERVER + "img/nodetypelogo/lift.png",true);
            break;
        case GIM.NODE_TYPE_TOILET:
            addLogo(GIM.SERVER + "img/nodetypelogo/toilet.png",true);
            break;
        case GIM.NODE_TYPE_SERVICE:
            addLogo(GIM.SERVER + "img/nodetypelogo/service.png",true);
            break;
        case GIM.NODE_TYPE_ATM:
            addLogo(GIM.SERVER + "img/nodetypelogo/atm.png",true);
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
