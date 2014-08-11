/**
 * <div id="container">
 *     <canvas id="menuCanvas"/>
 *     <canvas id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.MapPin = function(parentContainer){
    var pin = {
        width : 220,
        height : 140,
        container : document.createElement("div"),
        menuCanvas : document.createElement("canvas"),
        pinCanvas : document.createElement("canvas"),
        logoImage : new Image(),
        logoCanvas : document.createElement("canvas"),
        init : function(){
            parentContainer.appendChild(this.container);
            this.container.appendChild(this.menuCanvas);
            this.container.appendChild(this.pinCanvas);
            this.container.appendChild(this.logoCanvas);
//            this.container.appendChild(this.logoImage);

            this.container.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px;";   //background:#222222
            this.menuCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px";
            this.menuCanvas.width = this.width;
            this.menuCanvas.height = this.height;
            this.pinCanvas.style.cssText = "width:" + this.width + "px;height:" + this.height + "px;position:absolute;top:0px;left:0px";
            this.pinCanvas.width = this.width;
            this.pinCanvas.height = this.height;

            this.pinCanvas.id = "pinCanvas";

            this.updateDisplay();
        },
        _isOpenning : false,
        open : function(x,y){
            this._isOpenning = true;

            this.container.style.display = "block";
            this.container.style.left = x - this.width * 0.5;
            this.container.style.top = y - this.height;
            //tween radius (0->MaxRadius);visible = true;

            this.radius = 40;
            this.alpha = 0.3;
            this.rotation = Math.PI * (Math.random() * 2 - 1);
            var tween = new TWEEN.Tween(this).to({alpha:1,rotation:0,radius: this.maxRadius}, 1200).easing(TWEEN.Easing.Elastic.Out).start();
        },
//        close : function(){
//            //tween radius (MaxRadius -> 0);visible = false;
//            var tween = new TWEEN.Tween(this).to({alpha:0,rotation:Math.PI * 2,radius: 40}, 1200).easing(TWEEN.Easing.Elastic.Out).onComplete(function(){console.log("OK" + event);}).start();
//        },
        pinRadius : 50,
        maxRadius : 100,
        _radius : 100,
        set radius(value){this._radius = value > this.maxRadius ? this.maxRadius : value;this.updateDisplay();},
        get radius(){return this._radius;},
        _rotation : 0,
        set rotation(value){this._rotation = value;this.updateDisplay();},
        get rotation(){return this._rotation;},
        _alpha : 0,
        set alpha(value){this._alpha = value;this.updateDisplay();},
        get alpha(){return this._alpha;},
        updateDisplay : function(){
            var menuCanvasCTX = this.menuCanvas.getContext("2d");
            var pinCanvasCTX = this.pinCanvas.getContext("2d");
            var logoCanvasCTX = this.logoCanvas.getContext("2d");

            //clear all
            menuCanvasCTX.clearRect(0,0,this.width,this.height);
            pinCanvasCTX.clearRect(0,0,this.width,this.height);
            logoCanvasCTX.clearRect(0,0,this.width,this.height);

            //draw menuCanvas
            if(this._radius > this.pinRadius)
            {
                menuCanvasCTX.strokeStyle = "rgba(225,225,225," + this._alpha + ")";
                menuCanvasCTX.lineWidth = 4;
                menuCanvasCTX.fillStyle = "rgba(225,30,60," + this._alpha + ")";
                menuCanvasCTX.beginPath();
                menuCanvasCTX.moveTo(this.width * 0.5,this.height * 0.5);
                menuCanvasCTX.arc(this.width * 0.5,this.height * 0.5,this._radius,Math.PI * 0.9 + this._rotation,Math.PI * 1.1 + this._rotation);
                menuCanvasCTX.lineTo(this.width * 0.5,this.height * 0.5);
                menuCanvasCTX.arc(this.width * 0.5,this.height * 0.5,this._radius,Math.PI * 0.1 + this._rotation,Math.PI * 1.9 + this._rotation,true);
                menuCanvasCTX.lineTo(this.width * 0.5,this.height * 0.5);
                menuCanvasCTX.stroke();
                menuCanvasCTX.fill();
                menuCanvasCTX.closePath();
            }

            pinCanvasCTX.strokeStyle = "rgba(225,225,225," + this._alpha + ")";
            pinCanvasCTX.lineWidth = 4;
            pinCanvasCTX.fillStyle = "rgba(225,0,20," + this._alpha + ")";
            pinCanvasCTX.lineCap = "round";
            pinCanvasCTX.beginPath();
            pinCanvasCTX.moveTo(this.width * 0.5,this.height - pinCanvasCTX.lineWidth);
            pinCanvasCTX.arc(this.width * 0.5,this.height * 0.5,this._radius > this.pinRadius ? this.pinRadius : this._radius,Math.PI * 0.55,Math.PI * 0.45);
            pinCanvasCTX.lineTo(this.width * 0.5,this.height - pinCanvasCTX.lineWidth);
            pinCanvasCTX.stroke();
            pinCanvasCTX.fill();
            pinCanvasCTX.closePath();

            logoCanvasCTX.beginPath();
            logoCanvasCTX.arc(this.logoImage.width * 0.5,this.logoImage.height * 0.5 - 1,(this._radius > this.pinRadius ? this.pinRadius : this._radius) - 2,Math.PI * 0,Math.PI * 2);
            var pat = logoCanvasCTX.createPattern(this.logoImage,"repeat");
            logoCanvasCTX.fillStyle = pat;
            logoCanvasCTX.fill();
            logoCanvasCTX.closePath();
        }
    }

    pin.close = function(){
        pin._isOpenning = false;
        var tween = new TWEEN.Tween(pin).to({alpha:0,rotation:Math.PI * 2,radius: 40}, 1200).easing(TWEEN.Easing.Elastic.Out).onComplete(function(){
            console.log("OK" + pin.container.style.display);
            if(!pin._isOpenning)
                pin.container.style.display = "none";
        }).start();
    };

    pin.init();
    pin.logoImage.onload = function(event){
        var left = (pin.width - event.currentTarget.naturalWidth) * 0.5;
        var top = (pin.height - event.currentTarget.naturalHeight) * 0.5;
        pin.logoCanvas.style.cssText = "position:absolute;top:"+top+"px;left:"+left+"px;";
    };
    pin.logoImage.src = "assets/img/shoplogo/11.png";

    return pin;
}
