/**
 * <div id="logo">
 *     <image id="menuCanvas"/>
 *     <text id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.ServiceLogo = function (parentContainer,index,text) {
    var serviceLogo = {
        onTime : 1000,
        index : -1,
        path : "assets/img/servicelogo/",
        logoOnURL : "",
        logoOffURL : "",
        logoDisableURL : "",
        width: 180,
        height: 160,
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

    serviceLogo.container.addEventListener("click",function(){
        if(!serviceLogo._disable)
            serviceLogo.onClickHandler(serviceLogo.index.toString());

        serviceLogo.logoOn = true;
        setTimeout(function(){
            serviceLogo.logoOn = false;
        },serviceLogo.onTime);
    });

    return serviceLogo;
}
