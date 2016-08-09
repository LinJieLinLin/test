/**
 * Created by Fox2081 on 2016/3/31.
 */

//在文本上添加属性 plug-style="all time"   // 配置 all / expired / real , 需要时间的 再加上 time
$(function (){
    $('.jf-date').each(function(index, element) {
        $(this).date();
    });
});

$(function (){ //列表伸展、编辑全屏事件
    var
        fullScreen = '.full-screen',
        list = '.options-list',
        option = '.o-item',
        sv = '.s-v',
        eBtn = '.edit-b',
        sBtn = '.stretch-b',
        breadCrumbs = '.bread-crumbs',
        v = '.my-view',
        returnBtn = '.return-b',
        curScrollTop = 0,
        timer;

    $(list).find(sv).hide();
    $(list).find(option).each(function (index,item){
        $(this).find('.w').click(function (){
            $(this).find(sBtn).click();
        });
        $(this).find(sBtn).click(function (event){
            clearTimeout(timer);
            $(list).find(option).each(function (i,o){
                if(i!==index && $(this).find(sBtn)[0].toggle){
                    $(this).find(sv).slideToggle('fast');
                    $(this).find(sBtn).toggleClass('up').find('font').html('展开');
                    $(this).find(sBtn)[0].toggle=!$(this).find(sBtn)[0].toggle;
                }
            });
            $(item).find(sv).slideToggle('fast');
            $(this).toggleClass('up').find('font').html((!this.toggle ? '收起' : '展开')).parent().find('em > i').attr('class',(!this.toggle ? 'image-c-course-o-2r' : 'image-c-course-o-2'));
            if(!this.toggle){
                timer = setTimeout(function (){
                    $('body,html').stop(true,true).animate({scrollTop:$(item).offset().top},'normal');
                },300);
            }
            this.toggle=!this.toggle;
            event.stopPropagation();
        });
        $(this).find(eBtn).click(function (event){
            curScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            $('body').css({overflow:'hidden'});
            $(breadCrumbs).find('span:eq(0)').html(' — 编辑'+$(item).find('.title span').eq(0).html());
            $(fullScreen).show();
            $(v).hide().eq(index).show();
            jf.css3Animate($(fullScreen)[0],"scaleIn animated",function (){
                $(fullScreen).siblings('div').hide();
            });
            event.stopPropagation();
        });
    });

    $(fullScreen).find(returnBtn).click(function (){
        $(fullScreen).siblings('div').show();
        document.documentElement.scrollTop = document.body.scrollTop = curScrollTop;
        jf.css3Animate($(fullScreen)[0],"scaleOut animated",function (){
            $('body').css({overflow:''});
            $(breadCrumbs).find('span:eq(0)').html('');
            $(v).hide();
            $(fullScreen).hide();
        });
    });
});

$(function (){ //描点导航
    var
        nav = '.md-nav a',
        item = '.options-list .o-item',
        timer;
    $(nav).each(function (index,a){
        $(this).click(function (){
            clearTimeout(timer);
            if(!$(item).eq(index).find('.s-v').is(':visible')){
                $(item).eq(index).find('.stretch-b').click();
            }else{
                timer = setTimeout(function (){
                    $('body,html').stop(true,true).animate({scrollTop:$(item).eq(index).offset().top},'normal');
                },300);
            }
        });
    });
});

$(function (){
    function item(w,v,b,b2,attr){
        $(w).each(function (index,item){
            $(this).find(b2).addClass('open').attr('title','展开');
            eval("$(this).find(v).css({"+ attr +":-$(this).find(v).outerWidth(true)}).hide()");
            if($(this).find(b).length>0 && !$(this).find(b)[0].clickFlag){
                $(this).find(b).click(function (){
                    if(!this.toggleFlag){
                        $(item).find(b2).removeClass('open').attr('title','隐藏');
                        eval("$(item).find(v).show().stop(true,true).animate({"+ attr +":0},'fast')");
                        eval("$(item).find('.ew-word').stop(true,true).animate({"+ attr +":"+ ($(item).find(v).outerWidth(true)+5) +"},'fast')");
                    }else{
                        $(item).find(b2).addClass('open').attr('title','展开');
                        eval("$(item).find(v).stop(true,true).animate({"+ attr +":-$(item).find(v).outerWidth(true)},'fast',function (){ $(this).hide() })");
                        eval("$(item).find('.ew-word').stop(true,true).animate({"+ attr +":0},'fast')");
                    }
                    this.toggleFlag = !this.toggleFlag;
                });
                $(this).find(b)[0].clickFlag = true;
            }
            if($(this).find(v).find(b2).length>0 && !$(this).find(v).find(b2)[0].clickFlag){
                $(this).find(v).find(b2).click(function (){
                    $(item).find(b).click();
                });
                $(this).find(v).find(b2)[0].clickFlag = true;
            }
        });
    }
    item('.edit-w','.ew-list','.overview-b','.close-b','left');  //编辑栏左边
    item('.edit-w','.ew-related','.set-knowledge-b','.close-b','right');  //编辑栏右边
});

$(function (){
    function run(){
        var dh = $(document).height()-91;
        var sh = $(window).scrollTop()+$(window).height();
        if(sh > dh){
            $('.mft-f').removeClass('mft-fixed');
        }else{
            $('.mft-f').addClass('mft-fixed');
        }
        $('.return-top').css({display:($(window).scrollTop()>100?'block':'none')});
        setTimeout(run);
    }
    run();
});