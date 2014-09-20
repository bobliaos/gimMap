东门茂业视频监控需求
	后台服务连接摄像头
	前台播放

编辑器:
	检查连通性
	添加当前结点跨楼层绑定数
	* 楼层配置放入数据中
	测试连通性,得到主网,然后看有没有孤立点,有则显示高亮
	过滤SVG,删除命名空间,去除DISPLAY='NONE',过滤G结点(提升子结点,无G则添加父G)
	计算坐标点为最大值的问题
	* 若为地形,则INDEX为0
	* 色值修改
	图标和文字贴图功能开发
	对齐工具,横竖
	导入SVG图形工具,直接添加一个图形
	移动工具:移动每个图形模块
	重复数据的清理
	* 图片透明度
	结点缩放

模块:
	服务设施不能同时闪烁
	* 寻路,先找最近的能走的,再判断长度
	* gotoImage直接显示,以免点击不到
	* 去掉服务设施点击直接寻路
	* 小球移动速度更快点
	* 彻底解决TOUCH和MOUSE事件的问题
	地图旋转功能
	文字和LOGO贴图
	* 跨域调用的问题
	整合相机设置到数据中
	跨楼层的上下判断通过数据顺序来判断
	重构代码
	单向寻路
	复杂混合寻路,下楼再上楼
	A*优化,加权

http://personalbrandinstitute.com/
textureData="[isTexture:true/flase],[textureType:text/image/both],[textureSize:20*20],[textureRotation:Math.PI]"
eg:textureData="f,t,20*20,0.2";

http://terms.rongyi.com/suning_legoushi/terminals/53e09e8721232f697d000002/activities
ssh://hg@project.rongyi.com:155//opt/sourcecode/rongyi_term_v2/
