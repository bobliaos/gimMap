/**
 * @author bob / http://bobliaos.diandian.com
 * */

var GIM = { VERSION : '0.1' };

GIM.mapInstans             = null;

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

GIM.SERVER                  = "192.168.1.151:3000";
GIM.MACHINE_NODE_ID         = "node_2014_8_13_01:18:25_578";

GIM.FLOOR_GAP               = 1220;
GIM.PATH_COLOR              = 0xFF0033;
GIM.MAP_OFFSET_Y            = 300;
GIM.MAP_BACKGROUND_COLOR    = 0xDDDDDD;

GIM.DATA_SOURCE_URL         = "assets/data.sgxml";
GIM.DEFAULT_SHOP_LOGO_URL   = "assets/img/shoplogo/0.png";

GIM.goDetail                = function(shopId){};
GIM.navitateTo              = function(shopId){};

