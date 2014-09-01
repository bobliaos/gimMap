/**
 * <div id="logo">
 *     <image id="menuCanvas"/>
 *     <text id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.ZoomBar = function (parentContainer,cameraController) {
    var bar = {
        width: 80,
        height: 400,
        imageSize: 80,
        minThumbY: 80,
        maxThumbY: 280,
        cameraController: cameraController,
        container: document.createElement("div"),
        plus: document.createElement("canvas"),
        minus: document.createElement("canvas"),
        rail: document.createElement("canvas"),
        thumb: document.createElement("canvas"),
        init: function () {
            this.container.appendChild(this.rail);
            this.container.appendChild(this.thumb);
            this.container.appendChild(this.plus);
            this.container.appendChild(this.minus);

            parentContainer.appendChild(this.container);

            this.container.width = this.rail.width = this.width;
            this.container.height = this.rail.height = this.height;
            this.plus.width = this.plus.height = this.minus.width = this.minus.height = this.imageSize;
            this.thumb.width = 40;
            this.thumb.height = 40;

            this.container.style.cssText = "width: "+this.width+"px;height: "+this.height+"px;position: absolute;top: 460px;right: 20px;";
            this.rail.style.cssText = "width: "+this.width+"px;height:"+this.height+"px;position: absolute;left: 0px;top: 0px";
            this.thumb.style.cssText = "width: "+this.thumb.width+"px;height: "+this.thumb.height+"px;position: absolute;top: 70px;left: "+ (this.width - this.thumb.width) * 0.5+"px;";
            this.plus.style.cssText = "width: " + this.imageSize + "px;height: " + this.imageSize + "px;position: absolute;top: 0px;left: 0px;";
            this.minus.style.cssText = "width: " + this.imageSize + "px;height: " + this.imageSize + "px;position: absolute;bottom: 0px;left: 0px;";

            var logoPadding = 20;

            var ctx;

            //draw rail
            ctx = this.rail.getContext("2d");
            ctx.clearRect(0,0,this.imageSize,this.imageSize);
            ctx.beginPath();
            ctx.strokeStyle = "#888888";
            ctx.lineWidth = 16;
            ctx.moveTo(this.imageSize * 0.5,this.imageSize * 0.5);
            ctx.lineTo(this.imageSize * 0.5,this.height - this.imageSize * 0.5);
            ctx.stroke();
            ctx.closePath();

            //draw thumb
            ctx = this.thumb.getContext("2d");
            ctx.clearRect(0,0,this.thumb.width,this.thumb.height);
            ctx.beginPath();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 12;
            ctx.fillStyle = "#888888";
            ctx.arc(this.thumb.width * 0.5,this.thumb.height * 0.5,(this.thumb.width - ctx.lineWidth) * 0.5,0,Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            //draw plus
            ctx = this.plus.getContext("2d");
            ctx.clearRect(0,0,this.imageSize,this.imageSize);
            ctx.beginPath();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 8;
            ctx.fillStyle = "#888888";
            ctx.arc(this.imageSize * 0.5,this.imageSize * 0.5,(this.imageSize - ctx.lineWidth) * 0.5,0,Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineWidth = 12;
            ctx.moveTo(logoPadding,this.imageSize * 0.5);
            ctx.lineTo(this.imageSize - logoPadding,this.imageSize * 0.5);
            ctx.moveTo(this.imageSize * 0.5,logoPadding);
            ctx.lineTo(this.imageSize * 0.5,this.imageSize - logoPadding);
            ctx.stroke();
            ctx.closePath();

            //draw minus
            ctx = this.minus.getContext("2d");
            ctx.clearRect(0,0,this.imageSize,this.imageSize);
            ctx.beginPath();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 8;
            ctx.fillStyle = "#888888";
            ctx.arc(this.imageSize * 0.5,this.imageSize * 0.5,(this.imageSize - ctx.lineWidth - 6) * 0.5,0,Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineWidth = 12;
            ctx.moveTo(logoPadding,this.imageSize * 0.5);
            ctx.lineTo(this.imageSize - logoPadding,this.imageSize * 0.5);
            ctx.stroke();
            ctx.closePath();

            this.updateDisplay();
        },
        updateDisplay: function(){
//            this.container.style.visibility = "hidden";
            this.thumb.style.top = (this.maxThumbY - this.minThumbY) * (100 - this._percent) * 0.01 + this.minThumbY;
        },
        _percent: 0,
        set percent(value){
            this._percent = value;
            if(this._percent > 100) this._percent = 100;
            else if(this._percent < 0) this._percent = 0;
            this.cameraController.percent = this._percent;
            this.updateDisplay();
        },
        get percent(){
            return this._percent;
        }
    }

    bar.plus.addEventListener("click",function(e){
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent + 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    });
    bar.minus.addEventListener("click",function(e){
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent - 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    });

    var origTopY;
    bar.thumb.addEventListener("mousedown",function(e){
        e.preventDefault();

        origTopY = e.clientY;

        document.addEventListener("mousemove",onAnimate);
        bar.thumb.addEventListener("mouseup",onAnimateOver);
        bar.thumb.addEventListener("mouseout",onAnimateOver);
    });
    function onAnimate(e){
        var deltaY = e.clientY - origTopY;
        var deltaPercent = deltaY / (bar.maxThumbY - bar.minThumbY) * 100;
        bar.percent -= deltaPercent;
        origTopY = e.clientY;
    };
    function onAnimateOver(e){
        document.removeEventListener("mousemove",onAnimate);
        bar.thumb.removeEventListener("mouseup",onAnimateOver);
        bar.thumb.removeEventListener("mouseout",onAnimateOver);
    };

    bar.init();

    return bar;
}
