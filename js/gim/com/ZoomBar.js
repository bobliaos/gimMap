/**
 * <div id="logo">
 *     <image id="menuCanvas"/>
 *     <text id="logoAndPinCanvas"/>
 * </div>
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.ZoomBar = function (parentContainer,cameraController,floorContainer3D) {
    var bar = {
        width: 92,
        height: 350,
        thumbSize: 34,
        minThumbY: 132,
        maxThumbY: 296,
        btnSize:38,
        backgroundURL: GIM.SERVER + "img/slider.png",
        cameraController: cameraController,
        floorContainer3D: floorContainer3D,
        container: document.createElement("div"),
        plus: document.createElement("div"),
        minus: document.createElement("div"),
        thumb: document.createElement("div"),

        lfetBtn: document.createElement("div"),
        upBtn: document.createElement("div"),
        rightBtn: document.createElement("div"),
        downBtn: document.createElement("div"),

        init: function () {
            this.container.appendChild(this.thumb);
            this.container.appendChild(this.plus);
            this.container.appendChild(this.minus);
            this.container.appendChild(this.lfetBtn);
            this.container.appendChild(this.upBtn);
            this.container.appendChild(this.rightBtn);
            this.container.appendChild(this.downBtn);

            parentContainer.appendChild(this.container);
            cameraController.bar = this;

            this.container.style.cssText = "width: "+this.width+"px;height: "+this.height+"px;position: absolute;top: 220px;right: 20px;background:url(" + this.backgroundURL+") no-repeat 0px 0px;";
            this.thumb.style.cssText = "width: "+this.thumbSize+"px;height: "+this.thumbSize+"px;position: absolute;top: 70px;left: "+ (this.width - this.thumbSize) * 0.5+"px;;background:url(" + this.backgroundURL+") no-repeat -30px -352px;";
            this.plus.style.cssText = "width: " + this.btnSize + "px;height: " + this.btnSize + "px;position: absolute;top: 96px;left: 26px;";
            this.minus.style.cssText = "width: " + this.btnSize + "px;height: " + this.btnSize + "px;position: absolute;bottom: 0px;left: 26px;";

            this.lfetBtn.style.cssText = "width: " + this.btnSize * 0.8 + "px;height: " + this.btnSize * 0.8 + "px;position: absolute;top: 31px;left: 6px;";
            this.upBtn.style.cssText = "width: " + this.btnSize * 0.8 + "px;height: " + this.btnSize * 0.8 + "px;position: absolute;top: 6px;left: 31px;";
            this.rightBtn.style.cssText = "width: " + this.btnSize * 0.8 + "px;height: " + this.btnSize * 0.8 + "px;position: absolute;top: 31px;left: 55px;";
            this.downBtn.style.cssText = "width: " + this.btnSize * 0.8 + "px;height: " + this.btnSize * 0.8 + "px;position: absolute;top: 55px;left: 31px;";

            this.lfetBtn.title = "left";
            this.upBtn.title = "up";
            this.rightBtn.title = "right";
            this.downBtn.title = "down";

            this.updateDisplay();
        },
        updateDisplay: function(){
            this.thumb.style.top = (this.maxThumbY - this.minThumbY) * (100 - this._percent) * 0.01 + this.minThumbY + "px";
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
        },
        goArrow: function(point){
            var aimX = floorContainer3D.position.x + point.x * 30;
            var aimY = floorContainer3D.position.y + point.y * 30;
            aimX = aimX > cameraController.maxX ? cameraController.maxX : (aimX < cameraController.minX ? cameraController.minX : aimX);
            aimY = aimY > cameraController.maxY ? cameraController.maxY : (aimY < cameraController.minY ? cameraController.minY : aimY);
            TWEEN.remove(floorContainer3D.position);
            new TWEEN.Tween(floorContainer3D.position).to({x:aimX,y:aimY}, 600).easing(TWEEN.Easing.Exponential.Out).start();
        }
    };

    function onArrowClick(e){
        var title = e.target.title;
        switch (title){
            case "left":
                bar.goArrow({x:-1,y:0});
                break;
            case "up":
                bar.goArrow({x:0,y:1});
                break;
            case "right":
                bar.goArrow({x:1,y:0});
                break;
            case "down":
                bar.goArrow({x:0,y:-1});
                break;
            default :break;
        }
    }

    bar.lfetBtn.addEventListener("click",onArrowClick,false);
    bar.lfetBtn.addEventListener("touchstart",onArrowClick,false);
    bar.upBtn.addEventListener("click",onArrowClick,false);
    bar.upBtn.addEventListener("touchstart",onArrowClick,false);
    bar.rightBtn.addEventListener("click",onArrowClick,false);
    bar.rightBtn.addEventListener("touchstart",onArrowClick,false);
    bar.downBtn.addEventListener("click",onArrowClick,false);
    bar.downBtn.addEventListener("touchstart",onArrowClick,false);

    function onPlusClick(e){
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent + 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    }
    function onMinusClick(e){
        e.preventDefault();
        TWEEN.remove(bar);
        new TWEEN.Tween(bar).to({percent: bar.percent - 20}, 800).easing(TWEEN.Easing.Exponential.Out).start();
    }

    bar.plus.addEventListener("click",onPlusClick,false);
    bar.plus.addEventListener("touchstart",onPlusClick,false);
    bar.minus.addEventListener("click",onMinusClick,false);
    bar.minus.addEventListener("touchstart",onMinusClick,false);

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
