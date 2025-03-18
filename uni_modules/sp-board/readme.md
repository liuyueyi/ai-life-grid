# 简晹画板 sp-board

#### 介绍
uniapp 自定义组件 简晹画板，支持自定义画笔涂鸦和自定义背景图，自定义取色板

#### 属性说明
|参数	|类型	|默认值	|说明			|
|:-:	|:-:	|:-:	|:-:			|
|tools	|Array	|["pen", "eraser", "color", "text", "back", "clear","upload","save"]		|要显示的工具|
|bgImage	|String	|		|背景图片|
|width	|String	|	100%	|组件宽度|
|height	|String	|	100vh	|组件高度|
|bgColor	|String	|	#FFFFFF	|无背景图片时的背景色|
|saveAction	|String	|	preview	|保存图片时的行为|

#### 事件说明
|事件名称	|返回类型	|说明			|
|:-:	|:-:	|:-:			|
|completed	|String	|用户点击保存后，组件保存canvas画布为本地文件，此为文件地址|

#### 使用说明

1.  最基本用法，不配置任何参数
```<sp-board></sp-board>
