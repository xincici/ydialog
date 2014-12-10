/*
    @author yelin yelin@sohu-inc.com
    @brief : this plugin is based on jquery, inject the jquery namespace with 
            3 veriable : $.yfixtipstimer, $.yfixtips, $.yzindex
*/
;(function($){
    $.yzindex = $.yzindex || 2014;
    $.yfixtipstimer = null;
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
}(jQuery || $));

