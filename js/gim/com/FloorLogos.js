/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.FloorLogos = function(container){
	var obj = {
		pin : doucment.createElement("canvas"),
	}

	pin.width = 300;
	pin.height = 300;
	pin.style.cssText = "width:" + pin.width + "px;height:" + pin.height + "px;position:absolute;";
	pin.id = "pinCanvas";
	container.appendChild(obj.pin);

	return obj;
}
