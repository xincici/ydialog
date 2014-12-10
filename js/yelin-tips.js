/*
    @author yelin yelin@sohu-inc.com
    @brief : this plugin is based on jquery, inject the jquery namespace with 
            6 veriable : $.fn.ytips, $.ytips, $.yzindex
*/
;(function($){
    $.yzindex = $.yzindex || 2014;
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
}(jQuery || $));
