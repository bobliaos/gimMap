/**
 * <div id="container">
 *     <canvas id="menuCanvas"/>
 *     <canvas id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.MapPin = function (parentContainer) {
    var pin = {
        width: 220,
        height: 180,
        container: document.createElement("div"),
        menuCanvas: document.createElement("canvas"),
        pinCanvas: document.createElement("canvas"),
        logoCanvas: document.createElement("canvas"),
        logoImage: new Image(),
        gotoImage: new Image(),
        searchImage: new Image(),
        init: function () {
            parentContainer.appendChild(this.container);
            this.container.appendChild(this.menuCanvas);
            this.container.appendChild(this.pinCanvas);
            this.container.appendChild(this.logoCanvas);
//            this.container.appendChild(this.logoImage);

            this.container.appendChild(this.gotoImage);
            this.container.appendChild(this.searchImage);

            this.container.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;display:none;";   //background:#222222
            this.menuCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.menuCanvas.width = this.width;
            this.menuCanvas.height = this.height;
            this.pinCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";
            this.pinCanvas.width = this.width;
            this.pinCanvas.height = this.height;

            this.pinCanvas.id = "pinCanvas";
            this.logoCanvas.id = "logoCanvas";
            this.gotoImage.id = "gotoImage";
            this.searchImage.id = "searchImage";

            this.logoImage.bindPin = this;
            this.logoImage.onload = function(event){
                var left = (this.bindPin.width - event.currentTarget.naturalWidth) * 0.5;
                var top = (this.bindPin.height - event.currentTarget.naturalHeight) * 0.5;
                this.bindPin.logoCanvas.style.cssText = "position:absolute;top:" + top + "px;left:" + left + "px;";
            }

            this.gotoImage.src = "assets/img/mappin/goto.png";
            this.gotoImage.style.cssText = "top: 64px;position: absolute;left: 16px;";
            this.searchImage.src = "assets/img/mappin/search.png";
            this.searchImage.style.cssText = "top: 68px;position: absolute;left: 170px;";
        },
        _isOpenning: false,
        open: function (x, y) {
            this._isOpenning = true;

            this.logoImage.src = "";
            this.logoImage.src = "assets/img/shoplogo/"+parseInt(Math.random() * 11)+".png";
//            this.logoImage.src = "http://a3.att.hudong.com/37/20/01300000484892126216205973483.jpg";

            this.container.style.display = "block";
            this.container.style.left = x - this.width * 0.5;
            this.container.style.top = y - this.height;
            //tween radius (0->MaxRadius);visible = true;

            this.radius = 10;
            this.alpha = 0.3;
//            this.rotation = Math.PI * (Math.random() * 2 - 1);
            this.rotation = - Math.PI * 2;
//            this.rotation = 0;
            new TWEEN.Tween(this).to({alpha: 1, rotation: 0, radius: this.maxRadius}, 600).easing(TWEEN.Easing.Back.Out).onComplete(function(){
//            new TWEEN.Tween(this).to({alpha: 1, rotation: 0, radius: this.maxRadius}, 600).easing(TWEEN.Easing.Elastic.InOut).onComplete(function(){
                this.gotoImage.style.display = this.searchImage.style.display = "block";
                this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
                new TWEEN.Tween(this.gotoImage.style).to({opacity:1},300).start();
                new TWEEN.Tween(this.searchImage.style).to({opacity:1},300).start();
            }).start();
        },
        close: function () {
            this._isOpenning = false;

            this.gotoImage.style.opacity = this.searchImage.style.opacity = 0;
            new TWEEN.Tween(this).to({alpha: 0, rotation: Math.PI * 2, radius: 10}, 400).easing(TWEEN.Easing.Back.In).onComplete(function () {
                if (!this._isOpenning)
                    this.container.style.display = "none";
            }).start();
        },
        pinRadius: 57,
        maxRadius: 98,
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
            //draw menuCanvas
            if (tmpRadius > this.pinRadius) {
                var angle = 8 * Math.PI / 180;

                menuCanvasCTX.strokeStyle = "rgba(255,255,255," + this._alpha + ")";
                menuCanvasCTX.lineWidth = 4;
                menuCanvasCTX.fillStyle = "rgba(235,97,104," + this._alpha + ")";
                menuCanvasCTX.beginPath();
                menuCanvasCTX.moveTo(this.width * 0.5 - 20, this.height * 0.5);
                menuCanvasCTX.arc(this.width * 0.5, this.height * 0.5, tmpRadius, Math.PI * (1 - angle) + this._rotation, Math.PI * (1 + angle) + this._rotation);
                menuCanvasCTX.lineTo(this.width * 0.5 - 20, this.height * 0.5);
                menuCanvasCTX.moveTo(this.width * 0.5 + 20, this.height * 0.5);
                menuCanvasCTX.arc(this.width * 0.5, this.height * 0.5, tmpRadius, Math.PI * (0 + angle) + this._rotation, Math.PI * (2 - angle) + this._rotation, true);
                menuCanvasCTX.lineTo(this.width * 0.5 + 20, this.height * 0.5);
                menuCanvasCTX.stroke();
                menuCanvasCTX.fill();
                menuCanvasCTX.closePath();
            }

            pinCanvasCTX.strokeStyle = "rgba(255,255,255," + this._alpha + ")";
            pinCanvasCTX.lineWidth = 4;
            pinCanvasCTX.fillStyle = "rgba(195,13,35," + this._alpha + ")";
            pinCanvasCTX.lineCap = "round";
            pinCanvasCTX.beginPath();
            var centerX = this.width * 0.5;
            var centerY = this.height - this._radius - 10;
            if(centerY < this.height * 0.5) centerY = this.height * 0.5;
            var bottomY = this.height - pinCanvasCTX.lineWidth;
            var curRadius = tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius;
            pinCanvasCTX.moveTo(centerX, bottomY);
            pinCanvasCTX.arc(centerX, centerY, curRadius, Math.PI * (0.5 + 0.13), Math.PI * (0.5 - 0.13));
            pinCanvasCTX.lineTo(centerX, bottomY);
            pinCanvasCTX.stroke();
            pinCanvasCTX.fill();
            pinCanvasCTX.closePath();

            var t = 1;
            if(this.pinRadius > this._radius){
                t = this._radius / this.pinRadius;
            }

            this.logoCanvas.style.top = (centerY - this.pinRadius * t + 3) + "px";
            var logoRadius = (tmpRadius > this.pinRadius ? this.pinRadius : tmpRadius) - 3;
            if(logoRadius < 0) logoRadius = 0;
            logoCanvasCTX.beginPath();
            logoCanvasCTX.arc(this.logoImage.width * 0.5, logoRadius , logoRadius, Math.PI * 0, Math.PI * 2);
            var pat = logoCanvasCTX.createPattern(this.logoImage, "repeat-y");
            logoCanvasCTX.fillStyle = pat;
            logoCanvasCTX.fill();
            logoCanvasCTX.closePath();
        }
    }

    pin.init();

    return pin;
}
