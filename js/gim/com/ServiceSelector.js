/**
 * <div id="logo">
 *     <image id="menuCanvas"/>
 *     <text id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.ServiceSelector = function(parentContainer,showNodeTypes){
    var selector = {
        container: document.createElement("div"),
        serviceLogos: [],
        init: function(){
            parentContainer.appendChild(this.container);

            this.container.style.cssText = "position:absolute;top:30px;left:230px";

            var imgNodeTypeIds = [GIM.NODE_TYPE_MACHINE, GIM.NODE_TYPE_SERVICE, GIM.NODE_TYPE_ATM, GIM.NODE_TYPE_TOILET, GIM.NODE_TYPE_ESCALATOR, GIM.NODE_TYPE_LIFT];   //"assets/img/servicelogo/1.png"
            var imgNodeTypeTexts = ["我的位置", "服务中心", "ATM", "洗手间", "扶梯", "升降梯"];
            for (var i = 0; i < imgNodeTypeIds.length; i++) {
                var index = imgNodeTypeIds[i];
                var text = imgNodeTypeTexts[i];
                var serviceLogo = new GIM.ServiceLogo(this.container,index,text);
                this.serviceLogos.push(serviceLogo);
                serviceLogo.onClickHandler = showNodeTypes;
            }
        },
        setLogos: function(floor3Ds,astarNodes,curShownFloorIds,machineNodeId){
            var currentAvaliableNodeTypeIds = [];
            for (var i = 0; i < curShownFloorIds.length; i++) {
                var floor3D = floor3Ds[curShownFloorIds[i]];
                for (var nodeId in floor3D.subUnit3Ds) {
                    var unit3D = floor3D.subUnit3Ds[nodeId];
                    var nodeTypeId = unit3D.data.nodeTypeId;
                    if(currentAvaliableNodeTypeIds.indexOf(nodeTypeId) < 0)
                        currentAvaliableNodeTypeIds.push(nodeTypeId);
                }
            }

            for (var i = 0;i < this.serviceLogos.length;i ++){
                var serviceLogo = this.serviceLogos[i];
                serviceLogo.disable = (currentAvaliableNodeTypeIds.indexOf(serviceLogo.index) < 0);
                if(serviceLogo.index == GIM.NODE_TYPE_MACHINE){
                    var machineFloorId = astarNodes[machineNodeId].data.floorId;
                    serviceLogo.disable = curShownFloorIds.indexOf(machineFloorId) == -1;
                }
            }
        }
    };
    selector.init();
    return selector;
}

GIM.ServiceLogo = function (parentContainer,index,text) {
    var serviceLogo = {
        onTime : 1000,
        index : -1,
        path : GIM.SERVER + "img/servicelogo/",
        logoOnURL : "",
        logoOffURL : "",
        logoDisableURL : "",
        width: 180,
        height: 160,
        title: text,
        container: document.createElement("div"),
        logoImage: new Image(),
        logoText: document.createElement("div"),
        init: function () {
            this.index = index;
            this.logoOnURL = this.path + index + ".png";
            this.logoOffURL = this.path + index + "_.png";
            this.logoDisableURL = this.path + index + "__.png";

            this.container.appendChild(this.logoImage);
            this.container.appendChild(this.logoText);
            parentContainer.appendChild(this.container);

            this.logoImage.style.cssText = "";
            this.logoText.style.cssText = "color:#444444;font-size:18px;font-family:Microsoft Yahei;margin-top:12px;";
            this.container.style.cssText = "width:100px;height:100px;margin-left: 0px;float:left";

            this.logoText.innerHTML = text;

            this._isReady = true;

            this.updateDisplay();
        },
        _isReady : false,
        _logoOn: false,
        set logoOn(value) {
            this._logoOn = value;
            this.updateDisplay();
        },
        get logoOn() {
            return this._logoOn;
        },
        _disable: false,
        set disable(value) {
            this._disable = value;
            this.updateDisplay();
        },
        get disable() {
            return this._disable;
        },
        updateDisplay: function () {
            if(this._isReady) {
                this.logoImage.src = this._disable ? this.logoDisableURL : (this._logoOn ? this.logoOnURL : this.logoOffURL);
                this.logoText.style.color = this._disable ? "#888888" : (this._logoOn ? "#FF0033" : "#222244");
            }
        },
        onClickHandler:function(){}
    }

    serviceLogo.init();

    function onClick(e){
        if(!serviceLogo._disable)
            serviceLogo.onClickHandler(serviceLogo.index.toString());

        serviceLogo.logoOn = true;
        setTimeout(function(){
            serviceLogo.logoOn = false;
        },serviceLogo.onTime);

        console.log(serviceLogo.index,serviceLogo.title);
        GIM.onServiceLogoClick(serviceLogo.index);
    }

    serviceLogo.container.addEventListener("click",onClick);
    serviceLogo.container.addEventListener("touchstart",onClick);

    return serviceLogo;
}
