/*
    @author yelin yelin@sohu-inc.com
    @brief : this plugin is based on jquery, inject the jquery namespace with 
            5 veriable : $.yfixtipstimer, $.ydialog, $.fn.ydialog, $.fn.yfixtips, $.fn.ytips
            notice : $.ydialog, $.fn.ydialog, $.fn.yfixtips  needs the outer css support, see yelin-dialog.css
                     and $.fn.ytips has no dependencies except jquery and can be used freely
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
            ,width      : 560
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

        var overlayElement, dialogElement;
        var yallElement;

        var closeTimeout;

        this.yremove = function(){
            yallElement.remove();
        }
        this.yhide = function(){
            yallElement.hide();
        }
        this.yshow = function(){
            yallElement.show();
        }
        this.element = function(){
            return yallElement;
        }
        this.ytitle = function(){
            if( arguments.length == 0 || typeof arguments[0] != 'string' ){
                return dialogElement.find('.dialog_title').html();
            }else{
                dialogElement.find('.dialog_title').html( arguments[0] );
            }
        }
        this.ycontent = function(){
            if( arguments.length == 0 || typeof arguments[0] != 'string' ){
                return dialogElement.find('.dialog_body').html();
            }else{
                dialogElement.find('.dialog_body').html( arguments[0] );
                dialogElement.css('height', 'auto');
            }
        }

        if( document === this[0] ){
            showDialog();
            return this;
        }

        var self = this;
        this.on(opt.vEvent, function(){
            showDialog();
        });

        function showDialog(){
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
                        + '<table class="pop_dialog_table">'
                            + '<tr>'
                                + '<td class="pop_content" colspan="3">'
                                    + '<div class="dialog_header '+ (opt.dragable ? 'dialog_header_drag':'') +'">'
                                        + '<i></i><div class="dialog_title">'+ opt.title +'</div>'
                                        + '<a class="dialog_minimize" href="javascript:;" style="display: none;">最小化</a>'
                                        + '<a class="dialog_close yclose" href="javascript:;" title="关闭">关闭</a>'
                                    + '</div>'
                                    + '<div class="dialog_body" style="'+ (opt.simple ? '':'min-height: 180px;_height:180px;') +'max-height: '+ opt.maxHeight +'px;">'
                                        + (opt.simple ? '<div class="simple_wrapper"><div class="simple_inner '+ (opt.danger ? 'simple_danger':'') +'">'+ opt.content +'</div></div>' : opt.content)
                                    + '</div>'
                                    + '<div class="dialog_footer">'
                                        + '<span class="info-msg"></span>'
                                        + '<a href="javascript:;" class="btn nbtn nbtn-primary yconfirm">'+ opt.okText +'</a>'
                                        + (opt.type == 'confirm' ? '<a href="javascript:;" class="btn nbtn nbtn-default ycancel">'+ opt.cancelText +'</a>' : '')
                                    + '</div>'
                                + '</td>'
                            + '</tr>'
                        + '</table>'
                    + '</div>';
                return str;
            }
            function createWaitOverlay(){
                var str = '';
                    str += '<div class="yoverlay wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +';">'
                                + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                                + '<div></div>'
                            + '</div>'
                return str;
            }
            function createWaitElement( opt ){
                var str = '';
                str += '<div class="wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +'; left: 50%; width: 300px; margin: 0 0 0 -150px; color: rgb(255, 255, 255); font-size: 14px;position: fixed; top: 45%;"><img src="img/loading.gif" style="vertical-align:middle;" />'
                            + '<span style="vertical-align:middle;">'+ opt.waitMsg +'</span>'
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

            // do the init function after dialog elements are append to the document
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
                //dialogElement && dialogElement.remove();
                if( el.hasClass('yconfirm') && !opt.okDelete ){
                    $(document.body).append( $( createWaitOverlay() ) ).append( $( createWaitElement(opt) ));
                }else{
                    destroyDialog();
                }
            });
            if( opt.lock && opt.quickClose ){
                overlayElement.on('dblclick', function(){
                    destroyDialog();
                });
            }

            var _left,_top;
            var startLeft,startTop;
            var $header = dialogElement.find('.dialog_header');
            if( opt.dragable ){
                $header.on('mousedown', function(e){
                    $header.addClass('dialog_header_move');
                    _left = parseInt(dialogElement.css('left').slice(0, -2));
                    _top = parseInt(dialogElement.css('top').slice(0, -2));
                    startLeft = e.pageX;
                    startTop = e.pageY;
                    if( !$(e.target).hasClass('yclose') ){
                        $(document).on('mousemove', doDrag);
                    }
                }).on('mouseup', function(e){
                    $header.removeClass('dialog_header_move');
                    $(document).off('mousemove', doDrag);
                });
            }
            function doDrag(e){
                //clear select when mouse move
                clsSelect();
                var left = e.pageX;
                var top = e.pageY;
                dialogElement.css('left', (_left+left-startLeft)+'px' );
                dialogElement.css('top', (_top+top-startTop)+'px' );
            }
            if( opt.time != 0 && $.isNumeric(opt.time) ){
                closeTimeout = setTimeout(function(){
                    clearTimeout( closeTimeout );
                    destroyDialog();
                }, parseInt(opt.time, 10)*1000);
            }
            function destroyDialog(){
                // dialogElement && dialogElement.remove();
                // overlayElement && overlayElement.remove();
                // yallElement && yallElement.remove();
                if( opt.animate ){
                    animateElement( dialogElement , true, function(){
                        yallElement && yallElement.remove();
                    });
                }else{
                    yallElement && yallElement.remove();
                }
                $(document).off('mousemove', doDrag);
                closeTimeout && clearTimeout( closeTimeout );
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
            obj.scrollTop       = document.documentElement.scrollTop;
            obj.scrollLeft      = document.documentElement.scrollLeft;
            return obj;
        }
        function positionElement(el){
            var info = getInfo();
            if( opt.position == 'fixed' ){
                el.css({
                    position : 'fixed',
                    width : opt.simple ? '450px' : opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + 'px'
                });
            }else{
                el.css({
                    position : 'absolute',
                    width : opt.simple ? '450px' : opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + info.scrollTop ) + 'px'
                });
            }
            if( opt.animate ){
                animateElement(el);
            }
        }
        function animateElement(el, flag, callback){
            var lastStyle = {
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
            ,time : 2
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

        $(document.body).append(overlayElement).append(el);

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
        var defaultSettings = {
            content : self.data('title') ? self.data('title') : '提示消息内容。'
        };
        var opt = $.extend({}, defaultSettings, opts);
        function createHTML( left, top ){
            var str = '';
            str +=    '<div class="ytips-element" style="width:180px;height:28px;z-index: 1100;background:#fff;border:1px solid #999;border-radius:3px;position:absolute;left:'+left+';top'+top+';">'
                        + '<div class="ytips-body" style="">'
                            +'<div style="font-size:13px;padding:5px 10px;">'
                                + '<p style="text-align:center;">'+ opt.content +'</p>'
                            +'</div>'
                        + '</div>'
                    + '</div>'
            return str;
        }
        this.on('mouseenter', function(e){
            var left = (e.pageX-90) + 'px';
            var top = (e.pageY-34) + 'px';
            var el = $(createHTML(left, top));
            $(document.body).append(el);
        }).on('mousemove', function(e){
            var left = (e.pageX-90) + 'px';
            var top = (e.pageY-34) + 'px';
            $('.ytips-element').css({
                left : left,
                top : top
            });
        }).on('mouseleave', function(e){
            $('.ytips-element').remove();
        });
    }
})(jQuery || $);