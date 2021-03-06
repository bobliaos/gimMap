/**
 * <div id="container">
 *     <canvas id="menuCanvas"/>
 *     <canvas id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.MapPin = function (parentContainer) {
    var pin = {
        width: 180,
        height: 160,
//        pinRadius: 57,
//        maxRadius: 98,
        pinRadius: 42,
        maxRadius: 88,
        container: document.createElement("div"),
        menuCanvas: document.createElement("canvas"),
        pinCanvas: document.createElement("canvas"),
        logoCanvas: document.createElement("canvas"),
        logoImage: new Image(),
        gotoImage: new Image(),
        searchImage: new Image(),
        init: function () {
            this.container.appendChild(this.menuCanvas);
            this.container.appendChild(this.pinCanvas);
            this.container.appendChild(this.logoCanvas);
//            this.container.appendChild(this.logoImage);

            this.container.appendChild(this.gotoImage);
            this.container.appendChild(this.searchImage);

            parentContainer.appendChild(this.container);

            this.container.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;display:none;";   //background:#222222
            this.menuCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.menuCanvas.width = this.width;
            this.menuCanvas.height = this.height;
            this.pinCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.pinCanvas.width = this.width;
            this.pinCanvas.height = this.height;
            this.logoCanvas.width = 90;
            this.logoCanvas.height = 90;
            this.logoCanvas.cssText = "width:82px;height:82px";

            this.pinCanvas.id = "pinCanvas";
            this.logoCanvas.id = "logoCanvas";
            this.gotoImage.id = "gotoImage";
            this.searchImage.id = "searchImage";

            this.logoImage.bindPin = this;
            this.logoImage.onload = function(event){
                var left = (this.bindPin.width - event.currentTarget.naturalWidth) * 0.5;
                var top = (this.bindPin.height - event.currentTarget.naturalHeight) * 0.5;
                this.bindPin.logoCanvas.style.cssText = "width:90px;height:90px;position:absolute;top:" + top + "px;left:" + left + "px;display:block";
                this.bindPin.updateDisplay();
            }

            this.gotoImage.src = GIM.SERVER + "img/mappin/goto.png";
            this.gotoImage.style.cssText = "top: 20px;position: absolute;left: 96px;";
            this.searchImage.src = GIM.SERVER + "img/mappin/search.png";
            this.searchImage.style.cssText = "top: 56px;position: absolute;left: 132px;";
        },
        _isOpenning: false,
        open: function (x, y, shopLogoURL) {
	    if(shopLogoURL === "") return;
            this._isOpenning = true;

            //if(shopLogoURL === "") shopLogoURL = GIM.SERVER + GIM.DEFAULT_SHOP_LOGO_URL;
            this.logoImage.src = shopLogoURL;
            console.log("- [GimMap]MapPin.open:",this.logoImage.src);

            this.container.style.display = "block";
            this.container.style.left = (x - this.width * 0.5) + "px";
            this.container.style.top = (y - this.height) + "px";

            TWEEN.remove(this);
            TWEEN.remove(this.gotoImage.style);
            TWEEN.remove(this.searchImage.style);

            this.radius = 10;
            this.alpha = 0.3;
            this.rotation = 0;
            this.gotoImage.style.display = this.searchImage.style.display = "none";
            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            new TWEEN.Tween(this).to({alpha: 1, rotation: 0, radius: this.maxRadius}, 800).easing(TWEEN.Easing.Elastic.Out).onComplete(function(){

            }).start();
            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            this.gotoImage.style.display = this.searchImage.style.display = "block";
            new TWEEN.Tween(this.gotoImage.style).to({opacity:1},200).start();
            new TWEEN.Tween(this.searchImage.style).to({opacity:1},200).start();
        },
        close: function () {
            this._isOpenning = false;
            this.logoImage.src = "";
            this.logoCanvas.style.display = "none";
            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            new TWEEN.Tween(this).to({alpha: 0, rotation: 0, radius: 10}, 20).easing(TWEEN.Easing.Back.In).onComplete(function () {
                if (!this._isOpenning)
                    this.container.style.display = "none";
            }).start();
        },
        _radius: 100,
        set radius(value) {
            this._radius = value > this.maxRadius ? this.maxRadius : value;
            this.updateDisplay();
        },
        get radius() {
            return this._radius;
        },
        _rotation: 0,
        set rotation(value) {
            this._rotation = value;
            this.updateDisplay();
        },
        get rotation() {
            return this._rotation;
        },
        _alpha: 0,
        set alpha(value) {
            this._alpha = value;
            this.updateDisplay();
        },
        get alpha() {
            return this._alpha;
        },
        updateDisplay: function () {
            var menuCanvasCTX = this.menuCanvas.getContext("2d");
            var pinCanvasCTX = this.pinCanvas.getContext("2d");
            var logoCanvasCTX = this.logoCanvas.getContext("2d");

            //clear all
            menuCanvasCTX.clearRect(0, 0, this.width, this.height);
            pinCanvasCTX.clearRect(0, 0, this.width, this.height);
            logoCanvasCTX.clearRect(0, 0, this.width, this.height);

            var tmpRadius = this._radius > this.maxRadius ? this.maxRadius : this._radius;
            tmpRadius = tmpRadius < 0 ? 0 : tmpRadius;

            pinCanvasCTX.strokeStyle = "#2d3540";
            pinCanvasCTX.lineWidth = 2;
            pinCanvasCTX.fillStyle = "#2d3540";
            pinCanvasCTX.lineCap = "round";
            pinCanvasCTX.beginPath();
            var centerX = this.width * 0.5;
            var centerY = this.height - this._radius + 20;
            if(centerY < this.height * 0.5 + 20) centerY = this.height * 0.5 + 20;
            var bottomY = this.height - pinCanvasCTX.lineWidth - 4;
            var curRadius = tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius;
            pinCanvasCTX.moveTo(centerX, bottomY);
            pinCanvasCTX.arc(centerX, centerY, curRadius, Math.PI * (0.5 + 0.04), Math.PI * (0.5 - 0.04));
            pinCanvasCTX.lineTo(centerX, bottomY);
            pinCanvasCTX.stroke();
            pinCanvasCTX.fill();
            pinCanvasCTX.closePath();

            //draw menuCanvas
            if (tmpRadius > this.pinRadius + 10) {
                menuCanvasCTX.strokeStyle = "#FFFFFF";
                menuCanvasCTX.lineWidth = 4;
                menuCanvasCTX.fillStyle = "#cc1847";
                var menuCenterX = this.width * 0.5;
                var menuCenterY = this.height * 0.5 + 20;
                menuCanvasCTX.beginPath();
                menuCanvasCTX.moveTo(menuCenterX, menuCenterY);
                menuCanvasCTX.arc(menuCenterX, menuCenterY, tmpRadius,  - Math.PI * 0.5,- Math.PI * 0.254);
                menuCanvasCTX.lineTo(menuCenterX, menuCenterY);
                menuCanvasCTX.closePath();
                menuCanvasCTX.stroke();
                menuCanvasCTX.fill();

                menuCanvasCTX.fillStyle = "#2d3540";
                menuCanvasCTX.beginPath();
                menuCanvasCTX.moveTo(menuCenterX, menuCenterY);
                menuCanvasCTX.arc(menuCenterX, menuCenterY, tmpRadius, -Math.PI * 0.246,0);
                menuCanvasCTX.lineTo(menuCenterX, menuCenterY);
                menuCanvasCTX.closePath();
                menuCanvasCTX.stroke();
                menuCanvasCTX.fill();
            }

            var rate = 1;
            if(this.pinRadius > this._radius){
                rate = this._radius / this.pinRadius;
            }

            try{
                this.logoCanvas.style.top = (centerY - this.pinRadius * rate + this.pinRadius - this.logoImage.height * 0.5 + 1.5) + "px";
                var logoRadius = (tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius) - 3;
                if(logoRadius < 0) logoRadius = 0;
                logoCanvasCTX.beginPath();
                logoCanvasCTX.arc(this.logoImage.width * 0.5, logoRadius , logoRadius, Math.PI * 0, Math.PI * 2);
                var pat = logoCanvasCTX.createPattern(this.logoImage, "no-repeat");
                logoCanvasCTX.fillStyle = pat;
                logoCanvasCTX.fill();
                logoCanvasCTX.closePath();
            }catch (e){
                console.log("- [GimMap]MapPin Load Image Error!");
                this.logoImage.src = GIM.SERVER + GIM.DEFAULT_SHOP_LOGO_URL;
            }
        }
    }

    pin.init();

    return pin;
}
