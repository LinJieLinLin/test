/**
 * Created by LouGaZen on 2016-06-07.
 */
module

    .factory('emotionService', ['$rootScope', function ($rootScope) {
        var factory = {};

        (function ($) {
            var $target;

            var options;

            var emotions;

            var categories;

            var emotionsMap;

            var parsingArray = [];

            var defCategory = '默认';

            var initEvents = function () {
                $('body').bind({
                    click: function () {
                        $('#sinaEmotion').hide();
                    }
                });

                $('#sinaEmotion').bind({
                    click: function (event) {
                        event.stopPropagation();
                    }
                }).delegate('.prev', {
                    click: function (event) {
                        var page = $('#sinaEmotion .categories').data('page');
                        showCatPage(page - 1);
                        event.preventDefault();
                    }
                }).delegate('.next', {
                    click: function (event) {
                        var page = $('#sinaEmotion .categories').data('page');
                        showCatPage(page + 1);
                        event.preventDefault();
                    }
                }).delegate('.category', {
                    click: function (event) {
                        $('#sinaEmotion .categories .current').removeClass('current');
                        showCategory($.trim($(this).addClass('current').text()));
                        event.preventDefault();
                    }
                }).delegate('.page', {
                    click: function (event) {
                        $('#sinaEmotion .pages .current').removeClass('current');
                        var page = parseInt($(this).addClass('current').text() - 1);
                        showFacePage(page);
                        event.preventDefault();
                    }
                }).delegate('.face', {
                    click: function (event) {
                        $('#sinaEmotion').hide();
                        $target.insertText($(this).children('img').prop('alt'));
                        event.preventDefault();
                    }
                });
            };

            var loadEmotions = function (callback) {

                if (emotions) {
                    callback && callback();
                    return;
                }

                if (!options) {
                    options = $.fn.sinaEmotion.options;
                }

                emotions = {};
                categories = [];
                emotionsMap = {};

                $('body').append('<div id="sinaEmotion">正在加载，请稍后...</div>');

                initEvents();

                $.getJSON('https://api.weibo.com/2/emotions.json?callback=?', {
                    source: options.appKey,
                    language: options.language
                }, function (json) {

                    var item, category;
                    var data = json.data;

                    $('#sinaEmotion').html('<div class="right"><a href="#" class="prev">«</a><a href="#" class="next">»</a></div><ul class="categories"></ul><ul class="faces"></ul><ul class="pages"></ul>');

                    for (var i = 0, l = data.length; i < l; ++i) {
                        item = data[i];
                        category = item.category || defCategory;

                        if (!emotions[category]) {
                            emotions[category] = [];
                            categories.push(category);
                        }

                        emotions[category].push({
                            icon: item.icon,
                            phrase: item.phrase
                        });

                        emotionsMap[item.phrase] = item.icon;
                    }

                    $(parsingArray).parseEmotion();
                    parsingArray = null;

                    callback && callback();
                });
            };

            var showCatPage = function (page) {

                var html = '';
                var length = categories.length;
                var maxPage = Math.ceil(length / 5);
                var $categories = $('#sinaEmotion .categories');
                var category = $categories.data('category') || defCategory;

                page = (page + maxPage) % maxPage;

                for (var i = page * 5; i < length && i < (page + 1) * 5; ++i) {
                    html += '<li class="item"><a href="#" class="category'
                        + (category == categories[i] ? ' current' : '') + '">'
                        + categories[i] + '</a></li>';
                }

                $categories.data('page', page).html(html);
            };

            var showCategory = function (category) {
                $('#sinaEmotion .categories').data('category', category);
                showFacePage(0);
                showPages();
            };

            var showFacePage = function (page) {

                var face;
                var html = '';
                var pageHtml = '';
                var rows = options.rows;
                var category = $('#sinaEmotion .categories').data('category');
                var faces = emotions[category];
                page = page || 0;

                for (var i = page * rows, l = faces.length; i < l
                && i < (page + 1) * rows; ++i) {
                    face = faces[i];
                    html += '<li class="item"><a href="#" class="face"><img src="'
                        + face.icon + '" alt="' + face.phrase + '" width="22" height="22" /></a></li>';
                }

                $('#sinaEmotion .faces').html(html);
            };

            var showPages = function () {

                var html = '';
                var rows = options.rows;
                var category = $('#sinaEmotion .categories').data('category');
                var faces = emotions[category];
                var length = faces.length;

                if (length > rows) {
                    for (var i = 0, l = Math.ceil(length / rows); i < l; ++i) {
                        html += '<li class="item"><a href="#" class="page'
                            + (i == 0 ? ' current' : '') + '">' + (i + 1)
                            + '</a></li>';
                    }
                    $('#sinaEmotion .pages').html(html).show();
                } else {
                    $('#sinaEmotion .pages').hide();
                }
            };

            $.fn.sinaEmotion = function (target) {
                target = target
                    || function () {
                        return $(this).parents('form').find(
                            'textarea,input[type=text]').eq(0);
                    };

                var $that = $(this).last();
                var offset = $that.offset();

                if ($that.is(':visible')) {
                    if (typeof target == 'function') {
                        $target = target.call($that);
                    } else {
                        $target = $(target);
                    }

                    loadEmotions(function () {
                        showCategory(defCategory);
                        showCatPage(0);
                    });
                    $('#sinaEmotion').css({
                        top: offset.top + $that.outerHeight() + 5,
                        left: offset.left
                    }).show();
                }

                return this;
            };

            $.fn.parseEmotion = function () {

                if (!categories) {
                    parsingArray = $(this);
                    loadEmotions();
                } else if (categories.length == 0) {
                    parsingArray = parsingArray.add($(this));
                } else {
                    $(this).each(function () {
                        var $this = $(this);
                        var html = $this.html();

                        html = html.replace(/<.*?>/g, function ($1) {
                            $1 = $1.replace('[', '[');
                            $1 = $1.replace(']', ']');
                            return $1;
                        }).replace(
                            /\[[^\[\]]*?\]/g,
                            function ($1) {
                                var url = emotionsMap[$1];
                                if (url) {
                                    return '<img src="'
                                        + url
                                        + '" alt="'
                                        + $1 + '" width="22" height="22" />';
                                }
                                return $1;
                            });

                        $this.html(html);
                    });
                }

                return this;
            };

            $.fn.insertText = function (text) {

                this.each(function () {

                    if (this.tagName !== 'INPUT' && this.tagName !== 'TEXTAREA') {
                        return;
                    }
                    if (document.selection) {
                        this.focus();
                        var cr = document.selection.createRange();
                        cr.text = text;
                        cr.collapse();
                        cr.select();
                    } else if (this.selectionStart !== undefined) {
                        var start = this.selectionStart;
                        var end = this.selectionEnd;
                        this.value = this.value.substring(0, start) + text
                            + this.value.substring(end, this.value.length);
                        this.selectionStart = this.selectionEnd = start + text.length;
                    } else {
                        this.value += text;
                    }
                });

                $rootScope.$broadcast('innerEmotion');

                return this;
            };

            $.fn.sinaEmotion.options = {
                rows: 72, // 每页显示的表情数
                language: 'cnname', // 简体（cnname）、繁体（twname）
                appKey: '1362404091' // 新浪微博开放平台的应用ID
            };

            factory = {
                parseEmotion: function (input) {
                    if (typeof input == 'string' && input.length) {
                        input = input.replace(/\[[^\[\]]+\]/g, function (key) {
                            return emotionsMap[key] ? '<img src="' + emotionsMap[key] + '" width="22" height="22" />' : key;
                        })
                    }
                    return input;
                }
            };

        })(jQuery);

        return factory;
    }])

    .directive('emotionEditor', function () {
        return {
            template:'<div class="emotion-editor"><div class="exceed-prompt"><span ng-class="{\'c-gray\':exceed}" ng-hide="exceed">还可以输入<b class="text1">{{surplus}}</b>字</span> <span ng-class="{\'c-red\':exceed>0}" ng-show="exceed">已超出<b class="text1">{{exceed}}</b>字</span></div><label><textarea ng-attr-id="{{config.id}}" ng-attr-placeholder="{{config.placeholder}}" ng-model="model" ng-focus="onFocus()" ng-blur="onBlur()" ng-style="config.style"></textarea></label></div>',
            restrict: 'E',
            replace: true,
            scope: {
                model: '=model',
                exceed: '=exceed',
                config: '=config'//{id: '***', limit:255, style:{}, placeholder: '请输入内容'}
            },
            controller: ['$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
                $scope.surplus = $scope.config.limit;

                function checkLength() {
                    if ($scope.config.limit) {
                        var max = parseInt($scope.config.limit),
                            len = $scope.model.length || 0;

                        $scope.exceed = len > max ? Math.ceil((len - max)) : 0;
                        $scope.surplus = $scope.model && len > max ? 0 : $scope.model ? parseInt((max - len)) : parseInt($scope.config.limit);
                    }
                }

                $scope.onFocus = function () {
                    $scope.config.limit && $element.find('.exceed-prompt').show();
                };
                
                $scope.onBlur = function () {
                    $element.find('.exceed-prompt').css({display: $scope.exceed ? 'block' : 'none'});
                };

                $scope.$on('innerEmotion', function () {
                    $scope.model = $element.find('textarea').val();
                    $element.find('textarea').focus();
                });

                $scope.$watch('model', function () {
                    checkLength();
                });
            }]
        }
    })

    .directive('addTarget', function () {
        return {
            restrict: 'A',
            scope: {
                addTarget: '=addTarget'
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                $($element).bind('click', function (e) {
                    if (!$('#sinaEmotion').is(':visible')) {
                        $($element).sinaEmotion($scope.addTarget);

                        e = e || event;
                        e.stopPropagation();
                    }
                })
            }]
        }
    });

// .filter('emotion', ['$sce', 'emotionService', function ($sce, emotionService) {
//     return function (htmlCode) {
//         htmlCode = emotionService.parseEmotion(htmlCode);
//         htmlCode = htmlCode.replace(/(\n)+/g, '<br />');
//         return $sce.trustAsHtml(htmlCode);
//     }
// }]);