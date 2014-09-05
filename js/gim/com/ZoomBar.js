/**
 * <div id="logo">
 *     <image id="menuCanvas"/>
 *     <text id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.ZoomBar = function (parentContainer,cameraController) {
    var bar = {
        width: 34,
        height: 332,
        thumbSize: 34,
        minThumbY: 36,
        maxThumbY: 262,
        backgroundURL: GIM.SERVER + "img/slider.png",
        cameraController: cameraController,
        container: document.createElement("div"),
        plus: document.createElement("div"),
        minus: document.createElement("div"),
        rail: document.createElement("div"),
        thumb: document.createElement("div"),
        init: function () {
            this.container.appendChild(this.rail);
            this.container.appendChild(this.thumb);
            this.container.appendChild(this.plus);
            this.container.appendChild(this.minus);

            parentContainer.appendChild(this.container);
            cameraController.bar = this;

            this.container.style.cssText = "width: "+this.width+"px;height: "+this.height+"px;position: absolute;top: 220px;right: 20px;";
            this.rail.style.cssText = "width: "+this.width+"px;height:"+this.height+"px;position: absolute;left: 0px;top: 0px;background:url(" + this.backgroundURL+") no-repeat 0px 0px;";
            this.thumb.style.cssText = "width: "+this.thumbSize+"px;height: "+this.thumbSize+"px;position: absolute;top: 70px;left: "+ (this.width - this.thumbSize) * 0.5+"px;;background:url(" + this.backgroundURL+") no-repeat 0px -341px;";
            this.plus.style.cssText = "width: " + this.width + "px;height: " + this.width + "px;position: absolute;top: 0px;left: 0px;background:url("+this.backgroundURL+") no-repeat 0px 0px;";
            this.minus.style.cssText = "width: " + this.width + "px;height: " + this.width + "px;position: absolute;bottom: 0px;left: 0px;background:url("+this.backgroundURL+") no-repeat 0px -299px;";

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
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent + 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    },false);
    bar.minus.addEventListener("click",function(e){
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent - 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    },false);
    bar.plus.addEventListener("touchstart",function(e){
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent + 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    },false);
    bar.minus.addEventListener("touchstart",function(e){
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent - 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    },false);

    function onMouseMove(e){
        e.preventDefault();

        var touch;
        if(e instanceof MouseEvent){
            touch = e;
        }else{
            touch = e.targetTouches[0];
        }

        origTopY = touch.clientY;

        document.addEventListener("mousemove",onAnimate,false);
        bar.thumb.addEventListener("mouseup",onAnimateOver,false);
        bar.thumb.addEventListener("mouseout",onAnimateOver,false);

        document.addEventListener("touchmove",onAnimate,false);
        document.addEventListener("touchend",onAnimateOver,false);
    }

    var origTopY;
    bar.thumb.addEventListener("mousedown",onMouseMove,false);
    bar.thumb.addEventListener("touchstart",onMouseMove,false);
    function onAnimate(e){
        e.preventDefault();

        var touch;
        if(e instanceof MouseEvent){
            touch = e;
        }else{
            touch = e.targetTouches[0];
        }

        var deltaY = touch.clientY - origTopY;
        var deltaPercent = deltaY / (bar.maxThumbY - bar.minThumbY) * 100;
        bar.percent -= deltaPercent;
        origTopY = touch.clientY;
    };
    function onAnimateOver(e){
        document.removeEventListener("mousemove",onAnimate,false);
        bar.thumb.removeEventListener("mouseup",onAnimateOver,false);
        bar.thumb.removeEventListener("mouseout",onAnimateOver,false);

        document.removeEventListener("touchmove",onAnimate,false);
        document.removeEventListener("touchend",onAnimateOver,false);
    };

    bar.init();

    return bar;
}
