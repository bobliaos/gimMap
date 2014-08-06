/**
 * @author bob / http://bobliaos.diandian.com
 * */

GIM.Tools = {
    loadURL : function(sourceURL,callBackFunc){
        var svgLoader = new XMLHttpRequest();
        svgLoader.onreadystatechange = function () {
            if (svgLoader.readyState == 4) {
                if (svgLoader.status == 200) {
                    var svgString = svgLoader.responseText;
                    callBackFunc(svgString);
                }
            }
        }
        svgLoader.open("GET", sourceURL, false);
        svgLoader.send(null);
    }
}
