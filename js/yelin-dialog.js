/*
    @author yelin yelin@sohu-inc.com
    @brief : this plugin is based on jquery, inject the jquery namespace with 
            3 veriable : $.ydialog, $.fn.ydialog, $.yzindex
*/
;(function($){
    $.yzindex = $.yzindex || 2014;
    $.fn.ydialog = function(opts){
        return new Dialog( this, opts );
    };
    $.ydialog = function(){
        return $(document).ydialog(arguments[0]);
    };
    function Dialog( node, opts ){
        this.node = node;
        var opt = $.extend( {}, Dialog.defaultSettings, opts );
        this.opt = opt;
        var self = this;
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
                self.opt.position = 'absolute';
            }
        }());
        this.init();
    }
    Dialog.defaultSettings = {
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
        ,waitMsg    : '操作进行中，请稍候...'
    };
    Dialog.prototype = {
        inDOM : false,
        overlayElement : null,
        dialogElement : null,
        waitElement : null,
        yallElement : null,

        closeTimeout : null,
        _left : 0,
        _top : 0,
        startLeft : 0,
        startTop : 0,
        lastStyle : {},
        reset : function(){
            this.inDOM = false;
            this.overlayElement = null;
            this.dialogElement = null;
            this.waitElement = null;
            this.yallElement = null;
            this.closeTimeout = null;
            this._left = 0;
            this._top = 0;
            this.startLeft = 0;
            this.startTop = 0;
            this.lastStyle = {};
        },
        init : function(){
            if( document === this.node[0] ){
                this.showDialog();
            }

            var self = this;
            if( !this.node.data('ydialogAlready') ){
                this.node.on(this.opt.vEvent, function(){
                    self.showDialog();
                });
            }

        },
        throwNotInDOM : function(){
            if( !this.inDOM ){
                throw new Error('Dialog not in DOM, check your logic pls!');
            }
        },
        visible : function(){
            return !!(this.inDOM && this.yallElement.css('display') == 'block');
        },
        yremove : function(){
            this.throwNotInDOM();
            this.destroyDialog();
        },
        yremovewait : function(){
            this.throwNotInDOM();
            this.waitElement && this.waitElement.remove();
        },
        yhide : function(){
            this.throwNotInDOM();
            if( this.yallElement.css('display') == 'none' ) return this;
            this.destroyDialog( true );
            return this;
        },
        yshow : function(){
            this.throwNotInDOM();
            if( this.yallElement.css('display') == 'block' ) return this;
            this.yallElement.show();
            this.animateElement(this.dialogElement);
            return this;
        },
        element : function(){
            this.throwNotInDOM();
            return this.yallElement;
        },
        ytitle : function(){
            this.throwNotInDOM();
            if( arguments.length == 0 || typeof arguments[0] != 'string' ){
                return this.dialogElement.find('.dialog-title').html();
            }else{
                this.dialogElement.find('.dialog-title').html( arguments[0] );
                return this;
            }
        },
        ycontent : function(){
            this.throwNotInDOM();
            if( arguments.length == 0 ){
                return this.dialogElement.find('.dialog-body').html();
            }else if( typeof arguments[0] == 'string' ){
                this.dialogElement.find('.dialog-body').html( arguments[0] );
                this.dialogElement.css('height', 'auto');
                return this;
            }else if( typeof arguments[0] == 'object' ){
                this.dialogElement.find('.dialog-body').html('').append( arguments[0] );
                this.dialogElement.css('height', 'auto');
                return this;
            }else{
                return this.dialogElement.find('.dialog-body').html();
            }
        },
        showDialog : function(){
            var self = this;
            //check the dialog already flag to prevent dialog repeat
            if( self && self.node.data('ydialogAlready') ){
                self.yshow();
                return;
            }

            this.overlayElement = this.opt.lock ? $( this.createOverlay() ) : $('');

            this.dialogElement = $( this.createElement() );

            this.yallElement = this.overlayElement.add( this.dialogElement );

            $(document.body).append( this.yallElement );

            //make the elements right position
            this.positionElement( this.dialogElement );
            this.inDOM = true;
            
            //clear selection in case of some bugs
            this.clsSelect();

            //do the init function after dialog elements are append to the document
            typeof this.opt.init === 'function' && this.opt.init.call( this );

            this.dialogElement.on('click', function(e){
                var el = $(e.target);
                var rval;
                if( el.hasClass('yconfirm') ){
                    if( typeof self.opt.ok == 'function' ){
                        rval = self.opt.ok.call( self );
                        if( rval === false ) return;
                        if( self.opt.okDelete != false ){
                            typeof self.opt.close == 'function' && self.opt.close.call( self );
                        }
                    }else{
                        typeof self.opt.close == 'function' && self.opt.close.call( self );
                    }
                }else if( el.hasClass('ycancel') ){
                    if( typeof self.opt.cancel == 'function' ){
                        rval = self.opt.cancel.call( self );
                        if( rval === false ) return;
                        typeof self.opt.close == 'function' && self.opt.close.call( self );
                    }else{
                        typeof self.opt.close == 'function' && self.opt.close.call( self );
                    }
                }else if( el.hasClass('yclose') ){
                    if( typeof self.opt.close == 'function' ){
                        rval = self.opt.close.call( self );
                        if( rval === false ) return;
                    }
                }else{
                    return;
                }
                if( el.hasClass('yconfirm') && !self.opt.okDelete ){
                    self.waitElement = $( self.createWaitOverlay() ).add( $( self.createWaitElement() ) );
                    self.yallElement = self.yallElement.add( self.waitElement );
                    $(document.body).append( self.waitElement );
                }else{
                    self.destroyDialog();
                }
            });
            if( self.opt.lock && self.opt.quickClose ){
                self.overlayElement.on('dblclick', function(){
                    self.dialogElement.find('.yclose').click();
                });
            }

            var $header = this.dialogElement.find('.dialog-header');
            if( self.opt.dragable ){
                $header.on('mousedown', function(e){
                    $header.addClass('dialog-header-move');
                    self._left = parseInt(self.dialogElement.css('left').slice(0, -2));
                    self._top = parseInt(self.dialogElement.css('top').slice(0, -2));
                    self.startLeft = e.pageX;
                    self.startTop = e.pageY;
                    if( !$(e.target).hasClass('yclose') ){
                        $(document).on('mousemove.ydialog', self.doDrag.bind(self));
                    }
                }).on('mouseup', function(e){
                    $header.removeClass('dialog-header-move');
                    $(document).off('mousemove.ydialog');
                });
            }
            if( self.opt.time != 0 && $.isNumeric(self.opt.time) ){
                self.closeTimeout = setTimeout(function(){
                    clearTimeout( self.closeTimeout );
                    self.destroyDialog();
                }, parseInt(self.opt.time, 10)*1000);
            }
            // add dialog already show flag to prevent more than one dialog triggered by the same element show together
            self && self.node.data('ydialogAlready', true);
        },

        createOverlay :function(){
            var str = '';
            str += '<div class="yoverlay ydialog-element" style="z-index: '+ ($.yzindex++) +';">'
                        + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                        + '<div></div>'
                    + '</div>';
            return str;
        },
        createElement :function(){
            var str = '';
            str += '<div id="'+ this.opt.id +'" class="ydialog ydialog-element" style="z-index: '+ ($.yzindex++) +';">'
                    + '<table class="pop-dialog-table">'
                        + '<tr>'
                            + '<td class="pop-content" colspan="3">'
                                + '<div class="dialog-header '+ (this.opt.dragable ? 'dialog-header-drag':'') +'">'
                                    + '<i></i><div class="dialog-title">'+ this.opt.title +'</div>'
                                    + '<a class="dialog-minimize" href="javascript:;" style="display: none;">最小化</a>'
                                    + '<a class="dialog-close yclose" href="javascript:;" title="关闭">关闭</a>'
                                + '</div>'
                                + '<div class="dialog-body" style="'+ (this.opt.simple ? '':'min-height: 100px;_height:100px;') +'max-height: '+ this.opt.maxHeight +'px;">'
                                    + (this.opt.simple ? '<div class="simple-wrapper"><div class="simple-inner '+ (this.opt.danger ? 'simple-danger':'') +'">'+ this.opt.content +'</div></div>' : this.opt.content)
                                + '</div>'
                                + '<div class="dialog-footer">'
                                    + '<span class="info-msg"></span>'
                                    + '<a href="javascript:;" class="ybtn ybtn-confirm yconfirm">'+ this.opt.okText +'</a>'
                                    + (this.opt.type == 'confirm' ? '<a href="javascript:;" class="ybtn ybtn-cancel ycancel">'+ this.opt.cancelText +'</a>' : '')
                                + '</div>'
                            + '</td>'
                        + '</tr>'
                    + '</table>'
                + '</div>';
            return str;
        },
        createWaitOverlay :function(){
            var str = '';
                str += '<div class="yoverlay wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +';opacity:0.6;filter:alpha(opacity=60);">'
                            + '<iframe width="100%" height="100%" frameborder="0" src="javascript:;"></iframe>'
                            + '<div></div>'
                        + '</div>'
            return str;
        },
        createWaitElement :function(){
            var str = '';
            str += '<div class="wait-element ydialog-element" style="z-index: '+ ($.yzindex++) +'; left: 50%; width: 400px; margin: 0 0 0 -200px; color: #fff; font-size: 14px;position: fixed; _position:absolute; top: 40%;text-align:center;"><img src="img/loading.gif" style="vertical-align:middle;" />'
                        + '<span style="vertical-align:middle;margin-left:5px;">'+ this.opt.waitMsg +'</span>'
                    + '</div>';
            return str;
        },
        doDrag : function(e){
            //clear select when mouse move
            this.clsSelect();
            var left = e.pageX;
            var top = e.pageY;
            this.dialogElement.css('left', (this._left + left - this.startLeft) + 'px' );
            this.dialogElement.css('top', (this._top + top - this.startTop) + 'px' );
        },
        destroyDialog : function( isHide ){
            // dialogElement && dialogElement.remove();
            // overlayElement && overlayElement.remove();
            // yallElement && yallElement.remove();
            var self = this;
            if( this.opt.animate ){
                this.animateElement( this.dialogElement , true, function(){
                    if( !isHide ){
                        self.yallElement && self.yallElement.remove();
                        self.reset();
                    }else{
                        self.yallElement && self.yallElement.hide();
                    }
                });
            }else{
                if( !isHide ){
                    self.yallElement && self.yallElement.remove();
                    self.reset();
                }else{
                    self.yallElement && self.yallElement.hide();
                }
            }
            if( !isHide ){
                $(document).off('mousemove.ydialog');
                self.closeTimeout && clearTimeout( self.closeTimeout );
                self && self.node.data('ydialogAlready', false);
            }
        },
        clsSelect : function(){
            if( 'getSelection' in window ){
                window.getSelection().removeAllRanges();
            }else{
                try {
                    document.selection.empty();
                } catch (e) {}
            }
        },
        //not for quirks mode page
        getInfo :function(){
            var obj = {};
            obj.bodyWidth       = document.body.clientWidth;
            obj.bodyHeight      = document.body.clientHeight;
            obj.visibleWidth    = document.documentElement.clientWidth;
            obj.visibleHeight   = document.documentElement.clientHeight;
            obj.scrollTop       = document.documentElement.scrollTop || document.body.scrollTop;
            obj.scrollLeft      = document.documentElement.scrollLeft || document.body.scrollLeft;
            return obj;
        },
        positionElement : function(el){
            var info = this.getInfo();
            if( this.opt.position == 'fixed' ){
                el.css({
                    position : 'fixed',
                    width : this.opt.simple ? '420px' : this.opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + 'px'
                });
            }else{
                el.css({
                    position : 'absolute',
                    width : this.opt.simple ? '420px' : this.opt.width+'px'
                });
                el.css({
                    left : ( info.visibleWidth - parseInt(el.css('width').slice(0,-2)) )/2 + 'px',
                    top : ( ( info.visibleHeight*0.8 - parseInt(el.css('height').slice(0,-2)) )/2 + info.scrollTop ) + 'px'
                });
            }
            if( this.opt.animate ){
                // add new dialog need recount style
                this.reCountStyle(el);
                this.animateElement(el);
            }
        },
        reCountStyle : function(el){
            this.lastStyle = {
                width : el.css('width'),
                height : el.css('height'),
                left : el.css('left'),
                top : el.css('top'),
                opacity : 1
            };
        },
        animateElement :function(el, flag, callback){
            this.lastStyle = this.lastStyle ? this.lastStyle : {
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
                    top : parseInt( this.lastStyle.top.slice(0,-2) ) + parseInt(this.lastStyle.height.slice(0,-2))/2,
                    opacity : 0.1
                }, 250, function(){
                    typeof callback == 'function' && callback();
                });
            }else{
                el.css({
                    width : '1px',
                    height : '1px',
                    left : '50%',
                    top : parseInt( this.lastStyle.top.slice(0,-2) ) + parseInt(this.lastStyle.height.slice(0,-2))/2,
                    opacity : 0.1
                });
                el.animate( this.lastStyle, 250);
            }
        }
    };
}(jQuery || $));

