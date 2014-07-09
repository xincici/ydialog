/*
    @author yelin yelin@sohu-inc.com
    @brief : this plugin is based on jquery, inject the jquery namespace with 
            6 veriable : $.yfixtipstimer, $.ydialog, $.fn.ydialog, $.yfixtips, $.fn.ytips, $.ytips
            notice : $.ydialog, $.fn.ydialog, $.yfixtips  needs the outer css support, see yelin-dialog.css
                     and $.fn.ytips, $.ytips has no dependencies except jquery and can be used freely
*/
;(function($){
    $.yzindex = 2014;
    $.yfixtipstimer = null;
    $.fn.ydialog = function(opts){
        var defaultSettings = {
            type        : 'confirm'
            ,vEvent     : 'click'
            ,simple     : false
            ,danger     : false
            ,dragable   : true
            ,position   : 'fixed'
            ,animate    : true
            ,title      : '提示消息'
            ,okText     : '确定'
            ,cancelText : '取消'
            ,content    : '确定要这么做吗？'
            ,lock       : true
            ,quickClose : true
            ,id         : ''
            ,time       : 0
            ,width      : 480
            ,maxHeight  : 300
            ,init       : function(){}
            ,ok         : function(){}
            ,cancel     : function(){}
            ,close      : function(){}
            ,okDelete   : true
            ,waitTitle  : '操作进行中...'
            ,waitMsg    : '操作进行中，请稍候...'
        };
        var opt = $.extend( {}, defaultSettings, opts );

        // ie6 use absolute position only
        (function(){
            var isIE = (function(){
                var v = 3,
                    div = document.createElement('div'),
                    all = div.getElementsByTagName('i');
                //通过IE检测HTML条件注释方式
                //循环判断IE浏览器当前支持版本
                while (
                    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                    all[0]
                );
                return v > 4 ? v : undefined;
            })();
            if( isIE && isIE < 7){
                opt.position = 'absolute';
            }
        }());
        var overlayElement, dialogElement;
        var waitElement;
        var yallElement;

        var closeTimeout;

        this.yremove = function(){
            //yallElement.remove();
            destroyDialog();
        }
        this.yremovewait = function(){
            waitElement && waitElement.remove();
        }
        this.yhide = function(){
            if( yallElement.css('display') == 'none' ) return this;
            destroyDialog( true );
            return this;
        }
        this.yshow = function(){
            if( yallElement.css('display') == 'block' ) return this;
            yallElement.show();
            animateElement(dialogElement);
            return this;
        }
        this.element = function(){
            return yallElement;
        }
        this.ytitle = function(){
            if( arguments.length == 0 || typeof arguments[0] != 'string' ){
                return dialogElement.find('.dialog-title').html();
            }else{
                dialogElement.find('.dialog-title').html( arguments[0] );
                return this;
            }
        }
        this.ycontent = function(){
            if( arguments.length == 0 ){
                return dialogElement.find('.dialog_body').html();
            }else if( typeof arguments[0] == 'string' ){
                dialogElement.find('.dialog-body').html( arguments[0] );
                dialogElement.css('height', 'auto');
                return this;
            }else if( typeof arguments[0] == 'object' ){
                dialogElement.find('.dialog-body').html('').append( arguments[0] );
                dialogElement.css('height', 'auto');
                return this;
            }else{
                return this;
            }
        }

        if( document === this[0] ){
            showDialog();
            return this;
        }

        var self = this;
        if( !this.data('ydialogAlready') ){
            this.on(opt.vEvent, function(){
                showDialog();
            });
        }

        var _left,_top;
        var startLeft,startTop;

        var lastStyle;

        function showDialog(){
            //check the dialog already flag to prevent dialog repeat
            if( self && self.data('ydialogAlready') ){
                self.yshow();
                return;
            }
            function createOverlay(){
                var str = '';
                str += '<div class="yoverlay ydialog-element" style="z-index: '+ ($.yzindex++) +';">'
                            + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                            + '<div></div>'
                        + '</div>';
                return str;
            }
            function createElement( opt ){
                var str = '';
                str += '<div id="'+ opt.id +'" class="ydialog ydialog-element" style="z-index: '+ ($.yzindex++) +';">'
                        + '<table class="pop-dialog-table">'
                            + '<tr>'
                                + '<td class="pop-content" colspan="3">'
                                    + '<div class="dialog-header '+ (opt.dragable ? 'dialog-header-drag':'') +'">'
                                        + '<i></i><div class="dialog-title">'+ opt.title +'</div>'
                                        + '<a class="dialog-minimize" href="javascript:;" style="display: none;">最小化</a>'
                                        + '<a class="dialog-close yclose" href="javascript:;" title="关闭">关闭</a>'
                                    + '</div>'
                                    + '<div class="dialog-body" style="'+ (opt.simple ? '':'min-height: 100px;_height:100px;') +'max-height: '+ opt.maxHeight +'px;">'
                                        + (opt.simple ? '<div class="simple-wrapper"><div class="simple-inner '+ (opt.danger ? 'simple-danger':'') +'">'+ opt.content +'</div></div>' : opt.content)
                                    + '</div>'
                                    + '<div class="dialog-footer">'
                                        + '<span class="info-msg"></span>'
                                        + '<a href="javascript:;" class="ybtn ybtn-confirm yconfirm">'+ opt.okText +'</a>'
                                        + (opt.type == 'confirm' ? '<a href="javascript:;" class="ybtn ybtn-cancel ycancel">'+ opt.cancelText +'</a>' : '')
                                    + '</div>'
                                + '</td>'
                            + '</tr>'
                        + '</table>'
                    + '</div>';
                return str;
            }
            function createWaitOverlay(){
                var str = '';
                    str += '<div class="yoverlay wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +';opacity:0.6;filter:alpha(opacity=60);">'
                                + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                                + '<div></div>'
                            + '</div>'
                return str;
            }
            function createWaitElement( opt ){
                var str = '';
                str += '<div class="wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +'; left: 50%; width: 400px; margin: 0 0 0 -200px; color: #fff; font-size: 14px;position: fixed; _position:absolute; top: 40%;text-align:center;"><img src="img/loading.gif" style="vertical-align:middle;" />'
                            + '<span style="vertical-align:middle;margin-left:5px;">'+ opt.waitMsg +'</span>'
                        + '</div>';
                return str;
            }

            overlayElement = opt.lock ? $( createOverlay() ) : $('');

            dialogElement = $( createElement(opt) );

            yallElement = overlayElement.add( dialogElement );

            $(document.body).append( yallElement );

            //make the elements right position
            positionElement( dialogElement );
            
            //clear selection in case of some bugs
            clsSelect();

            //do the init function after dialog elements are append to the document
            typeof opt.init === 'function' && opt.init();

            dialogElement.on('click', function(e){
                var el = $(e.target);
                var rval;
                if( el.hasClass('yconfirm') ){
                    if( typeof opt.ok == 'function' ){
                        rval = opt.ok();
                        if( rval === false ) return;
                        if( opt.okDelete != false ){
                        	typeof opt.close == 'function' && opt.close();
                        }
                    }else{
                        typeof opt.close == 'function' && opt.close();
                    }
                }else if( el.hasClass('ycancel') ){
                    if( typeof opt.cancel == 'function' ){
                        rval = opt.cancel();
                        if( rval === false ) return;
                        typeof opt.close == 'function' && opt.close();
                    }else{
                        typeof opt.cancel == 'function' && opt.cancel();
                        typeof opt.close == 'function' && opt.close();
                    }
                }else if( el.hasClass('yclose') ){
                    if( typeof opt.close == 'function' ){
                        rval = opt.close();
                        if( rval === false ) return;
                    }else{
                        typeof opt.close == 'function' && opt.close();
                    }
                }else{
                    return;
                }
                if( el.hasClass('yconfirm') && !opt.okDelete ){
                    waitElement = $( createWaitOverlay() ).add( $( createWaitElement(opt) ) );
                    yallElement = yallElement.add( waitElement );
                    $(document.body).append( waitElement );
                }else{
                    destroyDialog();
                }
            });
            if( opt.lock && opt.quickClose ){
                overlayElement.on('dblclick', function(){
                    destroyDialog();
                });
            }

            var $header = dialogElement.find('.dialog-header');
            if( opt.dragable ){
                $header.on('mousedown', function(e){
                    $header.addClass('dialog-header-move');
                    _left = parseInt(dialogElement.css('left').slice(0, -2));
                    _top = parseInt(dialogElement.css('top').slice(0, -2));
                    startLeft = e.pageX;
                    startTop = e.pageY;
                    if( !$(e.target).hasClass('yclose') ){
                        $(document).on('mousemove', doDrag);
                    }
                }).on('mouseup', function(e){
                    $header.removeClass('dialog-header-move');
                    $(document).off('mousemove', doDrag);
                });
            }
            if( opt.time != 0 && $.isNumeric(opt.time) ){
                closeTimeout = setTimeout(function(){
                    clearTimeout( closeTimeout );
                    destroyDialog();
                }, parseInt(opt.time, 10)*1000);
            }
            // add dialog already show flag to prevent more than one dialog triggered by the same element show together
            self && self.data('ydialogAlready', true);
        }
        function doDrag(e){
            //clear select when mouse move
            clsSelect();
            var left = e.pageX;
            var top = e.pageY;
            dialogElement.css('left', (_left+left-startLeft)+'px' );
            dialogElement.css('top', (_top+top-startTop)+'px' );
        }
        function destroyDialog( isHide ){
            // dialogElement && dialogElement.remove();
            // overlayElement && overlayElement.remove();
            // yallElement && yallElement.remove();
            if( opt.animate ){
                animateElement( dialogElement , true, function(){
                    if( !isHide ){
                        yallElement && yallElement.remove();
                    }else{
                        yallElement && yallElement.hide();
                    }
                });
            }else{
                if( !isHide ){
                    yallElement && yallElement.remove();
                }else{
                    yallElement && yallElement.hide();
                }
            }
            if( !isHide ){
                $(document).off('mousemove', doDrag);
                closeTimeout && clearTimeout( closeTimeout );
                self && self.data('ydialogAlready', false);
            }
        }
        function clsSelect(){
            if( 'getSelection' in window ){
                window.getSelection().removeAllRanges();
            }else{
                try {
                    document.selection.empty();
                } catch (e) {}
            }
        }
        //not for quirks mode page
        function getInfo(){
            var obj = {};
            obj.bodyWidth       = document.body.clientWidth;
            obj.bodyHeight      = document.body.clientHeight;
            obj.visibleWidth    = document.documentElement.clientWidth;
            obj.visibleHeight   = document.documentElement.clientHeight;
            obj.scrollTop       = document.documentElement.scrollTop || document.body.scrollTop;
            obj.scrollLeft      = document.documentElement.scrollLeft || document.body.scrollLeft;
            return obj;
        }
        function positionElement(el){
            var info = getInfo();
            if( opt.position == 'fixed' ){
                el.css({
                    position : 'fixed',
                    width : opt.simple ? '420px' : opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + 'px'
                });
            }else{
                el.css({
                    position : 'absolute',
                    width : opt.simple ? '420px' : opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + info.scrollTop ) + 'px'
                });
            }
            if( opt.animate ){
                // add new dialog need recount style
                reCountStyle(el);
                animateElement(el);
            }
        }
        function reCountStyle(el){
            lastStyle = {
                width : el.css('width'),
                height : el.css('height'),
                left : el.css('left'),
                top : el.css('top'),
                opacity : 1
            }
        }
        function animateElement(el, flag, callback){
            lastStyle = lastStyle ? lastStyle : {
                width : el.css('width'),
                height : el.css('height'),
                left : el.css('left'),
                top : el.css('top'),
                opacity : 1
            }
            if(flag){
                el.animate({
                    width : '1px',
                    height : '1px',
                    left : '50%',
                    top : parseInt( lastStyle.top.slice(0,-2) ) + parseInt(lastStyle.height.slice(0,-2))/2,
                    opacity : 0.1
                }, 250, function(){
                    typeof callback == 'function' && callback();
                });
            }else{
                el.css({
                    width : '1px',
                    height : '1px',
                    left : '50%',
                    top : parseInt( lastStyle.top.slice(0,-2) ) + parseInt(lastStyle.height.slice(0,-2))/2,
                    opacity : 0.1
                });
                el.animate( lastStyle, 250);
            }
        }
        return this;
    };
    $.ydialog = function(){
        return $(document).ydialog(arguments[0]);
    }

    $.yfixtips = function( opts ){
        if( $.yfixtipstimer ){
            clearTimeout($.yfixtipstimer);
            $.yfixtipstimer = null;
            $('.yfixtips-element').remove();
        }

        var opt;
        var defaultSettings = {
            title : '提示消息'
            ,content : '这里是提示内容...'
            ,time : 3
            ,type : 'error'
            ,lock : false
            ,width : 200
            ,position : 'right-bottom'
        };
        if(typeof opts === 'string'){
            opt = $.extend({}, defaultSettings, {content : opts});
        }else{
            opt = $.extend({}, defaultSettings, opts);
        }
        var positionStr = '';
        switch(opt.position){
            case 'left-top':
                positionStr = 'left:2px;top:2px;';
                break;
            case 'left-bottom':
                positionStr = 'left:2px;bottom:2px;';
                break;
            case 'right-top':
                positionStr = 'right:2px;top:2px;';
                break;
            case 'center':
                positionStr = 'left:50%;top:100px;margin-left:-' + opt.width/2 + 'px;';
                break;
            case 'right-bottom':
            default:
                positionStr = 'right:2px;bottom:2px;';
                break;
        }
        function createHTML(){
            var str = '';
            str +=    '<div class="yfixtips yfixtips-element" style="z-index: '+ ($.yzindex++) +';'+ positionStr +'width:'+ opt.width +'px;display:none;">'
                        + '<div class="ftips-header" style="background:'+ getColor() +';">'
                            + '<h4>'+ opt.title +'</h4>'
                            + '<a class="yfixtips-close" href="javascript:;" title="关闭">'
                                + '<i>x</i>'
                            + '</a>'
                        + '</div>'
                        + '<div class="ftips-body">'
                            +'<div class="ftips-body-wrapper">'
                                + '<p>'+ opt.content +'</p>'
                            +'</div>'
                        + '</div>'
                    + '</div>'
            return str;
        }
        function createOverlay(){
            var str = '';
            str += '<div class="yoverlay yfixtips-element" style="z-index: '+ ($.yzindex++) +';">'
                        + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                        + '<div></div>'
                    + '</div>';
            return str;
        }
        function getColor(){
            var color = '#900';
            switch(opt.type){
                case 'success':
                    color = '#1FBBA6';
                    break;
                case 'warn':
                    color = '#844';
                    break;
                case 'normal':
                    color = '#666';
                    break;
                case 'error':
                default:
                    break;
            }
            return color;
        }

        var el = $( createHTML() );
        var overlayElement = opt.lock ? $( createOverlay() ) : $('');

        var fixtipsElement = overlayElement.add( el );

        $(document.body).append(fixtipsElement);

        el.slideDown(600);
        $('.yfixtips-close').on('click', function(){
            $.yfixtipstimer && clearTimeout($.yfixtipstimer);
            el.slideUp(600, function(){
                fixtipsElement.remove();
            });
        });

        $.yfixtipstimer = setTimeout(function(){
            $.yfixtipstimer && clearTimeout($.yfixtipstimer);
            el.slideUp(600, function(){
                fixtipsElement.remove();
            });
        }, opt.time * 1000);

        el.on('mouseenter', function(){
            $.yfixtipstimer && clearTimeout($.yfixtipstimer);
        }).on('mouseleave', function(){
            $.yfixtipstimer = setTimeout(function(){
                $.yfixtipstimer && clearTimeout($.yfixtipstimer);
                el.slideUp(600, function(){
                    fixtipsElement.remove();
                });
            }, opt.time * 1000);
        });
    };

    $.fn.ytips = function(opts){
        var self = this;
        var opt = {};
        if( typeof opts == 'string' ){
            opt.content = opts;
        }else{
            var defaultSettings = {
                content : self.data('title') ? self.data('title') : '提示消息内容。'
            };
            opt = $.extend({}, defaultSettings, opts);
        }
        function createHTML(){
            var str = '';
            str +=    '<div class="ytips-element" style="max-width:180px;z-index: 1100;background:#000;color:#fff;border:1px solid #222;border-radius:3px;position:absolute;box-shadow:2px 2px 4px #333;">'
                        + '<div class="ytips-body" style="">'
                            +'<div style="font-size:13px;padding:8px 14px;">'
                                + '<p style="text-align:center;">'+ opt.content +'</p>'
                            +'</div>'
                        + '</div>'
                        + '<i class="arrow" style="border-top:8px solid #000;border-left:8px solid transparent;border-right:8px solid transparent;width:0;height:0;position:absolute;left:50%;margin-left:-4px;bottom:-7px;"></i>'
                    + '</div>'
            return str;
        }
        var el;
        var width,height;
        this.on('mouseenter', function(e){
            el = $( createHTML() );
            $(document.body).append(el);
            width = el.width();
            height = el.height();
            positionElement(el, e);
        }).on('mousemove', function(e){
            positionElement(el, e);
        }).on('mouseleave', function(e){
            el.remove();
        });
        function positionElement(el, e){
            var info = getInfo();
            var left = e.pageX - width/2,
                top = e.pageY - height - 14;
            if( left + width >= info.visibleWidth ){
                left = info.visibleWidth - width;
            }else if( left <= info.scrollLeft ){
                left = info.scrollLeft;
            }
            if( top <= info.scrollTop ){
                top = e.pageY + 18;
                el.find('.arrow').css({
                    'border-bottom' : '8px solid #000',
                    'border-top'    : '0 none',
                    'top'           : '-7px'
                });
            }else{
                el.find('.arrow').css({
                    'border-top'    : '8px solid #000',
                    'border-bottom' : '0 none',
                    'top'           : ( height -1 ) + 'px'
                });
            }
            el.css({
                left : left + 'px',
                top : top + 'px'
            });
        }
        function getInfo(){
            var obj = {};
            obj.bodyWidth       = document.body.clientWidth;
            obj.bodyHeight      = document.body.clientHeight;
            obj.visibleWidth    = document.documentElement.clientWidth;
            obj.visibleHeight   = document.documentElement.clientHeight;
            obj.scrollTop       = document.documentElement.scrollTop;
            obj.scrollLeft      = document.documentElement.scrollLeft;
            return obj;
        }
        return this;
    };
    $.ytips = function(){
        var els = $('[data-title]');
        return els.each(function(index, el){
            $(el).ytips();
        });
    };
})(jQuery || $);