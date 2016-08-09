/**
 * Created by ph2 on 2016/7/13.
 */

module.factory('emoticonService', [function () {

    var emoji = new EmojiConvertor();

    // 是否允许使用自定义的字符替换 colons 模式的 ":"
    emoji.use_custom_wrapper = true;

    // 表情符号是否支持中文 eg: [微笑]
    emoji.support_chinese = true;

    // 用于替换 colons 模式 ":" 的字符
    emoji.custom_wrapper_left = '[';
    emoji.custom_wrapper_rigth = ']';

    emoji._custom_wrapper = {};

    /**
     * 覆盖 replace_colons 方法
     * 可自定义字符替换 ":"
     * @memberof emoji
     * @param {string} str A string potentially containing colon string
     * representations of emoticons (ie. `:smile:`)
     *
     * @returns {string} A new string with all colon string emoticons replaced
     * with the appropriate representation.
     */
    emoji.replace_colons = function (str) {
        var self = this;
        self.init_colons();
        var wrapper = self._custom_wrapper;

        return str.replace(self.rx_colons, function (m) {
            // modify by ph2.
            // var idx = m.substr(1, m.length-2);
            var idx = m.substr(wrapper.left_len, m.length - wrapper.left_len - wrapper.right_len);

            if (self.allow_caps) idx = idx.toLowerCase();

            // 针对肤色emoji 处理 todo
            // special case - an emoji with a skintone modified
            if (idx.indexOf('::skin-tone-') > -1) {

                var skin_tone = idx.substr(-1, 1);
                var skin_idx = 'skin-tone-' + skin_tone;
                var skin_val = self.map.colons[skin_idx];

                idx = idx.substr(0, idx.length - 13);

                var val = self.map.colons[idx];
                if (val) {
                    return self.replacement(val, idx, ':', {
                        'idx': skin_val,
                        'actual': skin_idx,
                        'wrapper': ':'
                    });
                } else {
                    return ':' + idx + ':' + self.replacement(skin_val, skin_idx, ':');
                }
            } else {
                var val = self.map.colons[idx];
                // return val ? self.replacement(val, idx, ':') : m;
                return val ? self.replacement(val, idx, wrapper) : m;
            }
        });
    };

    /**
     * 覆盖 addAliases 方法
     * 在原来基础上添加别名映射
     * @param map
     */
    emoji.addAliases = function(map){
        var self = this;

        self.init_colons();
        self.initCustomAliases();
        for (var i in map){
            self.map.colons[i] = map[i];
            self.map.customAliases[map[i]] = i;
        }
    };

    // Does the actual replacement of a character with the appropriate
    /**
     * 覆盖 replacement 方法
     * @private
     */
    emoji.replacement = function(idx, actual, wrapper, variation){
        var self = this;

        // for emoji with variation modifiers, set `etxra` to the standalone output for the
        // modifier (used if we can't combine the glyph) and set variation_idx to key of the
        // variation modifier (used below)
        var extra = '';
        var variation_idx = 0;
        if (typeof variation === 'object'){
            extra = self.replacement(variation.idx, variation.actual, variation.wrapper);
            variation_idx = idx + '-' + variation.idx;
        }

        var img_set = self.img_set;

        // When not using sheets (which all contain all emoji),
        // make sure we use an img_set that contains this emoji.
        // For now, assume set "apple" has all individual images.
        if ((!self.use_sheet || !self.supports_css) && !(self.data[idx][6] & self.img_sets[self.img_set].mask)) {
            img_set = 'apple';
        }

        // 处理 wrapper 为 object时的情况 modify by ph2.
        // wrapper = wrapper || '';
        // 使用指定的 wrapper；如果不指定 wrapper，若全局指定自定义wrapper，使用自定义wrapper，否则使用 ''
        if (wrapper === undefined) {
            if (self.use_custom_wrapper) {
                self.initCustomWrappers();
                wrapper = self._custom_wrapper;
            } else {
                wrapper = {left: '', right: '', left_len: 0, right_len: 0};
            }
        } else if (typeof wrapper === 'string') {
            wrapper = {left: wrapper, right: wrapper, left_len: wrapper.length, right_len: wrapper.length};
        }

        // deal with simple modes (colons and text) first
        // if (self.colons_mode) return ':'+self.data[idx][3][0]+':'+extra;
        // var text_name = (actual) ? wrapper+actual+wrapper : self.data[idx][8] || wrapper+self.data[idx][3][0]+wrapper;
        if (self.colons_mode) return wrapper.left + self.data[idx][3][0] + wrapper.right + extra;
        var text_name = (actual) ? wrapper.left + actual + wrapper.right : self.data[idx][8] || wrapper.left + self.data[idx][3][0] + wrapper.right;
        if (self.text_mode) return text_name + extra;

        // native modes next.
        // for variations selectors, we just need to output them raw, which `extra` will contain.
        self.init_env();
        if (self.replace_mode == 'unified'  && self.allow_native && self.data[idx][0][0]) return self.data[idx][0][0] + extra;
        if (self.replace_mode == 'softbank' && self.allow_native && self.data[idx][1]) return self.data[idx][1] + extra;
        if (self.replace_mode == 'google'   && self.allow_native && self.data[idx][2]) return self.data[idx][2] + extra;

        // finally deal with image modes.
        // variation selectors are more complex here - if the image set and particular emoji supports variations, then
        // use the variation image. otherwise, return it as a separate image (already calculated in `extra`).
        // first we set up the params we'll use if we can't use a variation.
        var img = self.data[idx][7] || self.img_sets[img_set].path+idx+'.png' + self.img_suffix;
        // var title = self.include_title ? ' title="'+(actual || self.data[idx][3][0])+'"' : '';
        var title = self.include_title ? ' title="'+(actual || (self.map.customAliases&&self.map.customAliases[idx]) || self.data[idx][3][0])+'"' : '';
        // var text  = self.include_text  ? wrapper+(actual || self.data[idx][3][0])+wrapper : '';
        var text = self.include_text ? wrapper.left + (actual || (self.map.customAliases&&self.map.customAliases[idx]) || self.data[idx][3][0]) + wrapper.right : '';
        var px = self.data[idx][4];
        var py = self.data[idx][5];

        // now we'll see if we can use a varition. if we can, we can override the params above and blank
        // out `extra` so we output a sinlge glyph.
        // we need to check that:
        //  * we requested a variation
        //  * such a variation exists in `emoji.variations_data`
        //  * we're not using a custom image for self glyph
        //  * the variation has an image defined for the current image set
        if (variation_idx && self.variations_data[variation_idx] && self.variations_data[variation_idx][2] && !self.data[idx][7]){
            if (self.variations_data[variation_idx][2] & self.img_sets[self.img_set].mask){
                img = self.img_sets[self.img_set].path+variation_idx+'.png';
                px = self.variations_data[variation_idx][0];
                py = self.variations_data[variation_idx][1];
                extra = '';
            }
        }

        if (self.supports_css) {
            if (self.use_sheet && px != null && py != null){
                var mul = 100 / (self.sheet_size - 1);
                var style = 'background: url('+self.img_sets[img_set].sheet+');background-position:'+(mul*px)+'% '+(mul*py)+'%;background-size:'+self.sheet_size+'00%';
                return '<span class="emoji-outer emoji-sizer"><span class="emoji-inner" style="'+style+'"'+title+'>'+text+'</span></span>'+extra;
            }else if (self.use_css_imgs){
                return '<span class="emoji emoji-'+idx+'"'+title+'>'+text+'</span>'+extra;
            }else{
                return '<span class="emoji emoji-sizer" style="background-image:url('+img+')"'+title+'>'+text+'</span>'+extra;
            }
        }
        return '<img src="'+img+'" class="emoji" '+title+'/>'+extra;
    };

    // Initializes the colon string data
    /** 覆盖 init_colons 方法
     *  可自定义字符替换 ":"
     * @private
     */
    emoji.init_colons = function(){
        var self = this;
        if (self.inits.colons) return;
        self.inits.colons = 1;

        // modify by ph2.
        self.initCustomWrappers();
        var wrapper_l = self._custom_wrapper.left_escape;
        var wrapper_r = self._custom_wrapper.right_escape;

        var regexpStr;
        if (self.support_chinese) {
            regexpStr = wrapper_l + '[^\\[\\]]+' + wrapper_r
                + '(' + wrapper_l + 'skin-tone-[2-6]' + wrapper_r + ')?';
        } else {
            regexpStr = wrapper_l + '[a-zA-Z0-9-_+]+' + wrapper_r
                + '(' + wrapper_l + 'skin-tone-[2-6]' + wrapper_r + ')?';
        }
        // modify by ph2. end.

        self.rx_colons = new RegExp(regexpStr, 'g');
        self.map.colons = {};
        for (var i in self.data){
            for (var j=0; j<self.data[i][3].length; j++){
                self.map.colons[self.data[i][3][j]] = i;
            }
        }
    };

    /**
     * 初始化自定义 wrappers 信息
     */
    emoji.initCustomWrappers = function () {
        var self = this;
        if (self.inits.custom_wrappers) return;
        self.inits.custom_wrappers = 1;

        var w = self._custom_wrapper = self._custom_wrapper || {};
        w.left = self.use_custom_wrapper ? (self.custom_wrapper_left || '' ) : ':';
        w.right = self.use_custom_wrapper ? (self.custom_wrapper_rigth || '' ) : ':';
        w.left_len = w.left.length;
        w.right_len = w.right.length;
        w.left_escape = util.escapeRegExpStr(w.left);
        w.right_escape = util.escapeRegExpStr(w.right);
    };

    /**
     * 初始化自定义的别名
     * 建立 map[unified] = aliase 的映射 只映射用a ddAliases 添加的
     */
    emoji.initCustomAliases = function () {
      var self = this;
        if (self.inits.customAliases ) return;
        self.inits.customAliases = 1;
        self.map.customAliases = {};
    };

    var util = {
        // 转义正则元字符
        escapeRegExpStr: function (str) {
            return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }
    };

    /**
     * e.g. `Hello[破涕为笑]😄` ==> `Hello[破涕为笑][smile]`
     * @param {string} str
     * @returns {string}
     */
    var emojiUnifiedToColon = function (str) {
        if (!str) return '';
        emoji.colons_mode = true;
        return emoji.replace_unified(str);
    };

    /**
     * emojiUnifiedToColon 的逆操作
     * @param {string} str
     * @returns {string}
     */
    var emojiColonToUnified = function (str) {
        if (!str) return '';
        emoji.colons_mode = false;
        emoji.text_mode = false;
        emoji.replace_mode = 'unified';
        return emoji.replace_colons(str);
    };
    
    /**
     * e.g. `Hello[破涕为笑]😄` ==> `Hello[破涕为笑]<span class="emoji emoji-sizer" style="background-image:url(/1f604.png)"></span>`
     * @param {string} str
     * @returns {string}
     */
    var emojiUnifiedToCss = function (str) {
        if (!str) return '';
        emoji.colons_mode = false;
        emoji.text_mode = false;
        emoji.replace_mode = 'img';
        emoji.supports_css = true;
        return emoji.replace_unified(str);
    };

    /**
     * e.g. `Hello[破涕为笑]😄` ==> `Hello<span class="emoji emoji-sizer" style="background-image:url(/emoji/emoji-data/img-apple-22/1f602.png)"></span>😄`
     * @param {string} str
     * @returns {string}
     */
    var emojiColonToCss = function (str) {
        if(!str) return '';
        emoji.colons_mode = false;
        emoji.text_mode = false;
        emoji.replace_mode = 'img';
        emoji.supports_css = true;
        return emoji.replace_colons(str)
    };
    
    var emojiColonToUnified_Test = function () {
        var map = emoji.map;
        var result = [];
        var matchNum = 0;
        for (var i in map.colons ) {
            if (!i) {
                break;
            }
            var unified = emojiColonToUnified(i);
            var colon = emojiUnifiedToColon(unified);

            if (colon && unified) {
                if (unified !== i) {
                    result.push({
                        origin: i,
                        colon: colon,
                        unified: unified,
                        info: map.colons[i],
                        data: emoji.data[map.colons[i]]
                    })
                } else {
                    matchNum++;
                }
            } else {
                console.warn('emojiColonToUnified_Test: colon or unified is empty', colon, unified, map.unified[i]);
            }
        }
        console.log('emojiColonToUnified_Test result: ', matchNum, ' matched, ' , result.length, ' unmatched', result);
    };

    // 常用 emoji
    emoji.commonEmoji = [
        ['笑脸', '1f604'],
        ['开心', '1f60a'],
        ['大笑', '1f603'],
        ['热情', '263a'],
        ['眨眼', '1f609'],
        ['色', '1f60d'],
        ['接吻', '1f618'],
        ['亲吻', '1f61a'],
        ['脸红', '1f633'],
        ['露齿笑', '1f601'],
        ['满意', '1f60c'],
        ['戏弄', '1f61c'],
        ['吐舌', '1f61d'],
        ['无语', '1f612'],
        ['得意', '1f60f'],
        ['汗', '1f613'],
        ['失望', '1f614'],
        ['低落', '1f61e'],
        ['呸', '1f616'],
        ['焦虑', '1f625'],
        ['担心', '1f630'],
        ['震惊', '1f628'],
        ['悔恨', '1f623'],
        ['眼泪', '1f622'],
        ['哭', '1f62d'],
        ['破涕为笑', '1f602'],
        ['晕', '1f632'],
        ['恐惧', '1f631'],
        ['心烦', '1f620'],
        ['生气', '1f621'],
        ['睡觉', '1f62a'],
        ['生病', '1f637'],
        ['恶魔', '1f47f'],

        ['外星人', '1f47d'],
        ['心', '2764'],
        ['心碎', '1f494'],
        ['丘比特', '1f498'],
        ['闪烁', '2728'],
        ['星星', '2b50'],
        ['叹号', '2757'],
        ['问号', '2753'],
        ['睡着', '1f4a4'],
        ['水滴', '1f4a6'],
        ['音乐', '1f3b5'],

        ['火', '1f525'],
        ['便便', '1f4a9'],
        ['强', '1f44d'],
        ['弱', '1f44e'],
        ['拳头', '1f44a'],
        ['胜利', '270c'],
        ['上', '1f446'],
        ['下', '1f447'],
        ['右', '1f449'],
        ['左', '1f448'],
        ['第一', '261d'],
        ['强壮', '1f4aa'],

        ['吻', '1f48f'],
        ['热恋', '1f491'],
        // 1f466-1f3fb
        ['男孩', '1f466'],
        // 1f467-1f3fb
        ['女孩', '1f467'],
        // 1f469-1f3fd
        ['女士', '1f469'],
        // 1f468-1f3fb
        ['男士', '1f468'],
        // 1f47c-1f3fc 1f47c-1f3fb
        ['天使', '1f47c'],
        ['骷髅', '1f480'],
        ['红唇', '1f444'],
        ['太阳', '2600'],
        ['下雨', '2614'],

        ['多云', '2601'],
        ['雪人', '26c4'],
        ['月亮', '1f319'],
        ['闪电', '26a1'],
        ['海浪', '1f30a'],
        ['猫', '1f431'],
        ['小狗', '1f436'],
        ['老鼠', '1f42d'],
        ['仓鼠', '1f439'],
        ['兔子', '1f430'],
        ['狗', '1f43a'],

        ['青蛙', '1f438'],
        ['老虎', '1f42f'],
        ['考拉', '1f428'],
        ['熊', '1f43b'],
        ['猪', '1f437'],
        ['牛', '1f42e'],
        ['野猪', '1f417'],
        ['猴子', '1f435'],
        ['马', '1f434'],
        ['蛇', '1f40d'],
        ['鸽子', '1f426'],

        ['鸡', '1f414'],
        ['企鹅', '1f427'],
        ['毛虫', '1f41b'],
        ['章鱼', '1f419'],
        ['鱼', '1f420'],
        ['鲸鱼', '1f433'],
        ['海豚', '1f42c'],
        ['玫瑰', '1f339'],
        ['花', '1f33a'],
        ['棕榈树', '1f334'],
        ['仙人掌', '1f335'],

        ['礼盒', '1f49d'],
        ['南瓜灯', '1f383'],
        ['鬼魂', '1f47b'],
        ['圣诞老人', '1f385'],
        ['圣诞树', '1f384'],
        ['礼物', '1f381'],
        ['铃', '1f514'],
        ['庆祝', '1f389'],
        ['气球', '1f388'],
        ['cd', '1f4bf'],
        ['相机', '1f4f7'],

        ['录像机', '1f3a5'],
        ['电脑', '1f4bb'],
        ['电视', '1f4fa'],
        ['电话', '260e'],
        ['解锁', '1f513'],
        ['锁', '1f512'],
        ['钥匙', '1f511'],
        ['成交', '1f528'],
        ['灯泡', '1f4a1'],
        ['邮箱', '1f4ec'],
        ['浴缸', '1f6c0'],

        ['钱', '1f4b0'],
        ['炸弹', '1f4a3'],
        ['手枪', '1f52b'],
        ['药丸', '1f48a'],
        ['橄榄球', '1f3c8'],
        ['篮球', '1f3c0'],
        ['足球', '26bd'],
        ['棒球', '26be'],
        ['高尔夫', '26f3'],
        ['奖杯', '1f3c6'],
        ['入侵者', '1f47e'],

        ['唱歌', '1f3a4'],
        ['吉他', '1f3b8'],
        ['比基尼', '1f459'],
        ['皇冠', '1f451'],
        ['雨伞', '1f302'],
        ['手提包', '1f45c'],
        ['口红', '1f484'],
        ['戒指', '1f48d'],
        ['钻石', '1f48e'],
        ['咖啡', '2615'],
        ['啤酒', '1f37a'],

        ['干杯', '1f37b'],
        ['鸡尾酒', '1f378'],
        ['汉堡', '1f354'],
        ['薯条', '1f35f'],
        ['意面', '1f35d'],
        ['寿司', '1f363'],
        ['面条', '1f35c'],
        ['煎蛋', '1f373'],
        ['冰激凌', '1f366'],
        ['蛋糕', '1f382'],
        ['苹果', '1f34e'],

        ['飞机', '2708'],
        ['火箭', '1f680'],
        ['自行车', '1f6b2'],
        ['高铁', '1f684'],
        ['警告', '26a0'],
        ['旗', '1f3c1'],
        ['男人', '1f6b9'],
        ['女人', '1f6ba'],
        ['o', '2b55'],
        ['x', '274c'],
        ['版权', '00a9'],

        ['注册商标', '00ae'],
        ['商标', '2122'],
    ];

    // 初始化常用 emoji 的别名
    var initCommonEmojiAliases = function () {
        var map = {};
        var commonEmoji = emoji.commonEmoji;
        for (var i = 0, il = commonEmoji.length; i < il; ++i) {
            var t = commonEmoji[i];
            map[t[0]] = t[1].toLowerCase();
        }
        emoji.addAliases(map);
    };


    // initial
    emoji.img_set = 'apple';
    emoji.use_sheet = false;
    emoji.img_sets = {
        'apple': {
            'path': '/emoji/emoji-data/img-apple-22/',
            'sheet': '',
            'mask': 1
        }
    };
    emoji.include_text = true;
    emoji.include_title = true;
    initCommonEmojiAliases();

    return {
        emojiConvertor: emoji,
        emojiUnifiedToColon: emojiUnifiedToColon,
        emojiUnifiedToCss: emojiUnifiedToCss,
        emojiColonToUnified: emojiColonToUnified,
        emojiColonToCss: emojiColonToCss,
        // emojiColonToUnified_Test: emojiColonToUnified_Test,
    };
}]);


module.filter('emojiUnifiedToColon', ['emoticonService', function (emoticonService) {
    return function (str) {
        return emoticonService.emojiUnifiedToColon(str);
    }
}]);

module.filter('emojiUnifiedToCss', ['emoticonService', function (emoticonService) {
    return function (str) {
        return emoticonService.emojiUnifiedToCss(str);
    }
}]);

module.filter('emojiColonToUnified', ['emoticonService', function (emoticonService) {
    return function (str) {
        return emoticonService.emojiColonToUnified(str);
    }
}]);

module.filter('emojiColonToCss', ['emoticonService', function (emoticonService) {
    return function (str) {
        return emoticonService.emojiColonToCss(str);
    }
}]);
