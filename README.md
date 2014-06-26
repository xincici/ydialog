> Written with [StackEdit](https://stackedit.io/).

## ydialog ##
a jQuery based dialog component

#### 功能说明 ####

* 一个简单的基于jQuery的弹窗组件。  
* 支持多种特性。

#### 使用准备 ####

1. 引入 [yelin-dialog.css](https://github.com/xincici/ydialog/blob/master/css/yelin-dialog.css)
2. 引入 jQuery v1.4.3以上
3. 引入 [yelin-dialog.js](https://github.com/xincici/ydialog/blob/master/js/yelin-dialog.js)

#### 使用指南 ####

``` javascript
1. jQuery('selector').ydialog( params );
2. jQuery.ydialog( params );
```

#### 参数详解 ####
default settings
``` javascript
var defaultSettings = {
    type        : 'confirm'             //类型，默认是confirm，alert时无取消按钮
    ,vEvent     : 'click'               //触发事件，默认click，当作jQuery.fn.ydialog使用时
    ,simple     : false                 //是否是简单弹窗，简单弹窗内容紧凑，一般内容为一句话
    ,danger     : false                 //简单弹窗时对应的危险操作弹窗，红色警告图标
    ,dragable   : true                  //是否可拖动
    ,position   : 'fixed'               //定位方式，默认为fixed，可选absolute
    ,animate    : true                  //打开和关闭时是否显示动画
    ,title      : '提示消息'            //弹窗标题
    ,okText     : '确定'                //确定按钮文字
    ,cancelText : '取消'                //取消按钮文字
    ,content    : '确定要这么做吗？'    //默认弹窗内容
    ,lock       : true                  //是否锁定背景
    ,quickClose : true                  //背景锁定时，是否开启双击背景关闭
    ,id         : ''                    //弹窗元素id
    ,time       : 0                     //自动关闭时间，0为不自动关闭，单位是秒
    ,width      : 560                   //弹窗宽度
    ,maxHeight  : 300                   //内容最大高度，超出部分出现滚动条
    ,init       : function(){}          //弹窗显示后调用初始化方法
    ,ok         : function(){}          //确定回调
    ,cancel     : function(){}          //取消回调
    ,close      : function(){}          //点击关闭按钮回调
    ,okDelete   : true                  //点击确定时是否立刻关闭弹窗
    ,waitTitle  : '操作进行中...'       //okDelete为false时，显示等待消息标题
    ,waitMsg    : '操作进行中，请稍候...'//等待消息内容
};
```

#### 使用实例 ####

``` javascript
    var d1 = $('#button_1').ydialog();  //点击id为button_1的按钮时显示默认弹窗
    d1.ytitle();            //获取弹窗标题
    d1.ytitle('新标题')     //设置弹窗标题为“新标题”
    d1.ycontent();          //获取弹窗内容
    d1.ycontent('新的内容') //设置弹窗内容为“新的内容”
    d1.element();           //获取弹窗元素（jQuery对象）
    d1.yhide();             //弹窗元素隐藏
    d1.yshow();             //弹窗元素显示
    d1.yremove();           //弹窗元素移除
```
更多实例请参见 [Demo](https://github.com/xincici/ydialog/blob/master/index.html)
