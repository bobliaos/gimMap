/**
 * @author bob / http://bobliaos.diandian.com
 * */

var GIM = {
    VERSION : '0.0.1',
    INFO : " *** Author:bob / http://bobliaos.diandian.com / FOR LOVE AND PEACE ***",
    _map : null,
    _mapInstance : null,
    set mapInstance(value){
        throw (new Error("THE MAP INSTANCE CAN'T BE SET!!!"));
    },
    get mapInstance(){
        if(this._mapInstance === null){
            console.log("- [GimMap]GIM.VERSION:",this.VERSION,this.INFO);
            this._mapInstance = document.createElement("div");
            this._mapInstance.style.cssText = "width: 1040px;height: 1440px;overflow: hidden;position: absolute;background:#000000";
            this._map = new GIM.Map3D(this._mapInstance);
        }
        return this._mapInstance;
    },
    goDetail : function(shopId){},
    navitateTo : function(shopId){},
    setSize : function(width,height){this._map.setSize(width,height);}
};

GIM.NODE_TYPE_ASTAR 		= "0";
GIM.NODE_TYPE_GROUND 		= "1";
GIM.NODE_TYPE_SHOP 		    = "2";
GIM.NODE_TYPE_MACHINE		= "3";
GIM.NODE_TYPE_ESCALATOR 	= "4";
GIM.NODE_TYPE_LIFT 		    = "5";
GIM.NODE_TYPE_STAIRS        = "6";
GIM.NODE_TYPE_TOILET		= "7";
GIM.NODE_TYPE_SERVICE		= "8";
GIM.NODE_TYPE_ATM   		= "9";

GIM.SERVER                  = "192.168.1.208:3000";
GIM.MACHINE_NODE_ID         = "node_2014_8_13_01:18:25_578";

GIM.FLOOR_GAP               = 700;
GIM.PATH_POINT_GAP          = 12;
GIM.PATH_COLOR              = 0xFF0000;
GIM.MAP_OFFSET_Y            = 200;
GIM.MAP_BACKGROUND_COLOR    = 0xDDDDDD;
GIM.SELECTED_COLOR          = 0xFFBB00;
GIM.FONT_NAME               = "Microsoft Yahei";
//GIM.FONT_NAME             = "造字工房悦黑演示版常规体";
GIM.SHADOW_MAP_SIZE         = 2 * 1024;

GIM.CONFIG_URL              = "map.conf";
GIM.DATA_SOURCE_URL         = "assets/data.sgxml";
GIM.SHOP_LIST_URL           = "assets/shoplist.json";
GIM.DEFAULT_SHOP_LOGO_URL   = "assets/img/shoplogo/0.png";
