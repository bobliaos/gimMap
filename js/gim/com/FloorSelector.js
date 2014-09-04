/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.FloorSelector = function(parentContainer){
	var selector = {
        width: 170,
        container: document.createElement("div"),
        upImage: new Image(),
        downImage: new Image(),
        floorSelecterLogos: [],
        init : function(){
            this.container.appendChild(this.upImage);
            this.container.appendChild(this.downImage);
            parentContainer.appendChild(this.container);

            this.container.style.cssText = "position:absolute;top:240px;left:0px;text-align:left;width:" + this.width + "px;";
            this.upImage.style.cssText = this.downImage.style.cssText = "left: 60px;position: relative;";

            this.upImage.src = GIM.SERVER + "img/up.png";
            this.downImage.src = GIM.SERVER + "img/down.png";
        },
        addLogo: function(floorId,logoURL,isCurFloor,clickHandler){
            var floorLabelAndLogo = new GIM.FloorLogo(floorId,logoURL,isCurFloor,clickHandler,this.width);
            this.container.insertBefore(floorLabelAndLogo.container,this.container.lastChild);
            this.floorSelecterLogos.push(floorLabelAndLogo);
        },
        showFloors: function(floorIds){
            for (var i = 0; i < this.floorSelecterLogos.length; i++) {
                var floorLogo = this.floorSelecterLogos[i];
                floorLogo.selected = false;
                if (floorIds.indexOf(floorLogo.id) > -1) {
                    floorLogo.selected = true;
                }
            }
        }
	};
    selector.init();
	return selector;
}

GIM.FloorLogo = function(floorId,logoURL,isCurFloor,clickHandler,parentWidth){
    var floorLabelAndLogo = {
        id: floorId,
        width: parentWidth,
        height: 80,
        container: document.createElement("div"),
        floorLabel: document.createElement("p"),
        floorCurLabel: document.createElement("p"),
        floorLogoImage: new Image(),
        _selected: false,
        set selected(value) {
            this._selected = value;
            this.container.style.opacity = value ? 1 : 0.4;
            this.container.style.color = value ? "#FF0033" : "#222222";
            this.floorCurLabel.style.display = value ? "block" : "none";
            TWEEN.remove(this);
            new TWEEN.Tween(this).to({scale: value ? 1.2 : 1}, 300).easing(TWEEN.Easing.Exponential.Out).start();
        },
        get selected() {
            return this._selected
        },
        _scale: 1,
        set scale(value) {
            this._scale = value;
            this.container.style.height = (this.height * value) + "px";
            this.container.style.width = (this.width * value) + "px";
        },
        get scale() {
            return this._scale;
        },
        init: function(){
            this.container.appendChild(this.floorLogoImage);
            this.container.appendChild(this.floorLabel);
            this.container.appendChild(this.floorCurLabel);

            this.container.style.cssText = "position:relative;height:" + this.height + "px;width:" + this.width + "px;opacity:0.3;margin-bottom:8px;font-size: 26px;font-weight: bold;font-family:" + GIM.FONT_NAME;
            this.floorLabel.style.cssText = "margin:0;position:absolute;left:2px;top:2px;line-height:22px";
            this.floorCurLabel.style.cssText = "font-size: 16px;font-weight: normal;position:absolute;bottom:2px;left:2px;margin:0;";
            this.floorLogoImage.style.cssText = "width:100%;position:absolute;top:22px;left:2px;";

            this.floorLabel.innerHTML = floorId.substr(5, 1) + "F";
            this.floorCurLabel.innerHTML = isCurFloor ? "当前楼层" : "目标楼层";
            this.floorLogoImage.src = logoURL;

            this.container.name = floorId;
            this.container.addEventListener('mousedown', function (event) {
                var targetfloorId = event.currentTarget.name;
                clickHandler([targetfloorId]);
            });
        }
    };
    floorLabelAndLogo.init();
    return floorLabelAndLogo;
}
