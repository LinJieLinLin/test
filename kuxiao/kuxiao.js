/**
 * Created by FENGSB on 2016/2/24.
 */

var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);

(function() {
    var wrap = $('#index-banner');
    var item = wrap.find('.mban-container .mban-item');
    var key = wrap.find('.mban-key .key');
    var time = 3500;
    var timer;
    var page = 0;

    function change(i) {
        page = i;
        item.removeClass('active').eq(i).addClass('active');
        key.removeClass('active').eq(i).addClass('active');
    }

    function next() {
        page++;
        page %= item.length;
        change(page);
    }

    function clearTimer() {
        clearInterval(timer);
    }

    function autoPlay() {
        clearTimer();
        timer = setInterval(next, time);
    }
    autoPlay();
    wrap.on({
        'mouseenter': clearTimer,
        'mouseleave': autoPlay
    });
    key.each(function(index) {
        $(this).on({
            'click': function() {
                change(index);
            }
        });
    });
})();

(function() {
    var wrap = $('#by-school');
    var item = wrap.find('.sw-school-item');
    var scroll = wrap.find('.scroll-list');
    var before = wrap.find('.before');
    var after = wrap.find('.after');
    var time = 3500;
    var timer;
    var page = 0;
    if (!item.length || item.length < 8) {
        return;
    }
    var w = item.eq(0).outerWidth(true);
    scroll.css({ 'width': w * item.length });

    function change(i) {
        page = i;
        scroll.css({
            'transform': 'translate(' + -(page * w) + 'px, 0px)'
        });
    }

    function next() {
        page++;
        page %= (item.length - 6);
        change(page);
    }

    function prev() {
        page--;
        page = page < 0 ? (item.length - 7) : page;
        change(page);
    }

    function clearTimer() {
        clearInterval(timer);
    }

    function autoPlay() {
        clearTimer();
        timer = setInterval(next, time);
    }
    autoPlay();
    wrap.on({
        'mouseenter': clearTimer,
        'mouseleave': autoPlay
    });
    before.on({
        'click': prev
    });
    after.on({
        'click': next
    });
})();
