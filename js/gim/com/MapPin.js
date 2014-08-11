/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.MapPin = function(parentContainer){
	var obj = {
        width : 300,
        height : 300,
        pinWidth : 98,
        pinHeight : 124,
        pinStrokeWidth : 4,
        container : document.createElement("div"),
        pin : document.createElement("canvas"),
        image : new Image()
	};

    parentContainer.appendChild(obj.container);
    obj.container.style.cssText = "width:" + obj.width + "px;height:" + obj.height + "px;position:absolute;background:#FF0033";

    obj.container.appendChild(obj.image);
    obj.image.src = "./assets/img/mappin/menu.png";
    obj.image.style.cssText = "left:55px;top:180px;position:absolute";

    obj.container.appendChild(obj.pin);
//    obj.pin = document.createElement("canvas");
    obj.pin.width = obj.pinWidth;
    obj.pin.height = obj.pinHeight;
    obj.pin.style.cssText = "top:" + (obj.height - obj.pinHeight) + "px;left:" + ((obj.width - obj.pinWidth) * 0.5) + "px;width:" + obj.pinWidth + "px;height:" + obj.pinHeight + "px;position:absolute;";
    obj.pin.id = "mapPin";
    var ctx = obj.pin.getContext("2d");
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#C30D23";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(obj.pinWidth * 0.5,obj.pinWidth * 0.5,(obj.pinWidth - ctx.lineWidth) * 0.5,Math.PI * 2 * (105 / 360), Math.PI * 2 * (75 / 360));
    ctx.lineTo(obj.pin.width * 0.5,obj.pin.height - ctx.lineWidth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


	return obj;
}
