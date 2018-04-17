'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
  jQuery Select plugin
  DKarbushev
*/
(function ($) {

    var globalOpened = false;

    var methods = {
        init: function init(options) {
            return this.each(function () {
                var $this = $(this); // Parent element

                // Language options
                var mainLangMess = {
                    'ru': {
                        'chooseAriaLabel': 'Выберите из списка',
                        'chooseLabel': 'Выберите из списка',
                        'svgTitle': 'Стрелка выбора списка'
                    },
                    'en': {
                        'chooseAriaLabel': 'Choose from options',
                        'chooseLabel': 'Choose from options',
                        'svgTitle': 'Select state arrow'
                    }
                };

                var default_options = {
                    items: [], // Format [{ID:NAME:}, {ID:NAME}...]
                    aria: true,
                    confirm: false,
                    closeOnClick: true,
                    fromMarkup: false,
                    scroll: true,
                    arrow: true,
                    arrowPath: '',
                    selectClass: '',
                    optionClass: '',
                    inputClass: '',
                    wrapClass: '',
                    arrowClass: 'icon icon-angle-down icon_block--icon icon_blue icon_small',
                    lang: 'ru',
                    selectOnRender: false,
                    langMess: {}

                    // variables
                };var scope = {
                    value: '',
                    opened: false,
                    optionsCount: 0,
                    id: '',
                    valid: true

                    // Setting options
                };for (var key in options) {
                    //Check not empty value
                    var empty_test = options[key] + '';
                    if (empty_test) {
                        if (key in default_options) {
                            // Validation tests
                            scope.valid = false;
                            switch (key) {
                                default:
                                    scope.valid = true;
                                    break;
                            };
                            scope.valid = true;
                            if (scope.valid) {
                                default_options[key] = options[key]; // Update default_options values
                            }
                        }
                    }
                }

                for (var _key in default_options) {
                    if ($this.data(_key.toLowerCase())) {
                        default_options[_key] = $this.data(_key.toLowerCase());
                    }
                }

                default_options.langMess = mainLangMess[default_options.lang];

                // Add data object to this element
                var data = $this.data('selectme');
                if (!data) {
                    $this.data('selectme', {
                        target: $this,
                        options: default_options,
                        scope: scope
                    });
                }

                // Main init
                $this.trigger('onInitStart', $this);

                scope.id = 'select_' + Date.now().toString().substr(5);
                $this.attr('id', scope.id);

                if (!default_options.fromMarkup) {
                    $this.SelectMe('renderEmptyMarkup');
                    $this.SelectMe('renderOptions');
                }

                if (default_options.scroll) {
                    $this.find('.select__body').mCustomScrollbar({
                        advanced: {
                            autoScrollOnFocus: true,
                            updateOnContentResize: true
                        }
                    });
                }

                // Fill selectme.data(target) object
                $this.SelectMe('fillDataObject');
                $this.SelectMe('addListeners');

                // Add ids for options elements
                $this.SelectMe('addPreinstalledAttrs');

                // Add aria-tags
                $this.SelectMe('addAriaTags');

                $this.trigger('onInitEnd', scope);

                if (default_options.selectOnRender) {
                    $this.SelectMe('selectOption', $this.data('selectme').target.items.first());
                } else {
                    $this.SelectMe('selectOption');
                }
            });
        },
        fillDataObject: function fillDataObject() {
            var selectme = $(this);
            var data = $(this).data('selectme');

            data.target.input = selectme.find('input');
            data.target.control = selectme.find('.select__value');
            data.target.body = selectme.find('.select__body');
            data.target.checkboxes = [];
            data.target.items = selectme.find('.select__item');
        },
        addListeners: function addListeners() {
            var selectme = $(this);
            var data = $(this).data('selectme');
            data.target.control.off('click').on('click', function (e) {
                //console.log('click')
                selectme.SelectMe('toggleOpen', e);
            });
            data.target.control.off('keypress').on('keypress', function (e) {
                //console.log('keypress')
                selectme.SelectMe('toggleOpen', e);
            });
            data.target.items.unbind('click').on('click', function (e) {
                selectme.SelectMe('selectOption', e.target);
            });

            document.body.addEventListener('click', function (e) {
                if (data.scope.opened && !$(e.target).parents('.select__item').length && !$(e.target).hasClass('select__value') || globalOpened) {
                    data.scope.opened = false;
                    selectme.SelectMe('closeOpened');
                    globalOpened = false;
                }
            });
            //console.log(data)
            selectme.off('keydown').on('keydown', function (e) {
                if (data.scope.opened || globalOpened) {
                    if (event.which === 38 || event.which === 40 || event.which === 13 || event.which === 32) {
                        selectme.SelectMe('handleKeypress', e);
                    }
                    if (event.which === 27 || event.which === 9) {
                        if (!$(e.target).parents('.select__item').length) {
                            selectme.SelectMe('close');
                            data.scope.opened = false;
                            globalOpened = false;
                        }
                    }
                }
            });
        },
        renderEmptyMarkup: function renderEmptyMarkup() {
            var selectme = $(this);
            var data = selectme.data('selectme');
            // Clear main container
            selectme.empty();

            var defaultArrow = '\n                                <svg xmlns="http://www.w3.org/2000/svg" class="' + data.options.arrowClass + '" viewBox="0 0 13 8" id="angle-down" width="100%" height="100%">\n                                    <title>' + data.options.langMess.svgTitle + '</title>\n                                    <path d="M2.207.793A1 1 0 1 0 .793 2.207l4.999 5a1 1 0 0 0 1.414 0l5.001-5A1 1 0 1 0 10.793.793L6.499 5.086 2.207.793z"></path>\n                                </svg>';
            var arrowSvg = !data.options.arrowPath ? defaultArrow : '<svg class="' + data.options.arrowClass + '"><use xlink:href="' + data.options.arrowPath + '"></use></svg>';
            var template = '\n                    <input ' + (!data.options.inputClass ? '' : 'class="' + data.options.inputClass + '"') + ' type="hidden">\n                    <div class="select__value ' + data.options.selectClass + '">\n                    </div>\n                    <div class="select__body js-scroll-select">\n                    </div>\n                    ' + (data.options.arrow === true ? '\n                    <div class="select__arrow">\n                        ' + arrowSvg + '\n                    </div>\n                        ' : '');
            selectme.append($(template));

            if (data.options.wrapClass.length) {
                var classes = data.options.wrapClass.split(' ');
                for (tempClass in classes) {
                    selectme.addClass(tempClass);
                }
            }
        },
        addPreinstalledAttrs: function addPreinstalledAttrs() {
            var selectme = $(this);
            var data = selectme.data('selectme');

            // Add ID for options
            if (data.target.items.length) {
                data.target.items.each(function (index, item) {
                    $(item).prop('id', 'option_' + Date.now().toString().substr(5) + '_' + $(item).data('value'));
                });
            }
        },
        addAriaTags: function addAriaTags() {
            var selectme = $(this);
            var data = selectme.data('selectme');

            data.target.input.attr('aria-label', 'Value');
            data.target.control.attr('tabindex', 0).attr('role', 'button').attr('aria-haspopup', 'listbox').attr('aria-label', data.options.langMess.chooseAriaLabel);
            data.target.body.attr('role', 'listbox').attr('tabindex', '-1').attr('aria-label', data.options.langMess.chooseAriaLabel);
            if (data.target.body.find('.active').length) {
                data.target.body.attr('aria-activedescendant', data.target.body.find('.active').prop('id'));
            }
        },
        renderOptions: function renderOptions() {
            var selectme = $(this);
            var data = selectme.data('selectme');

            var optionsObj = data.options.items,
                blockOptions = '';
            // If options is array - convert to object
            if (data.options && Array.isArray(data.options)) {
                optionsObj = data.options.reduce(function (acc, cur, i) {
                    acc[i] = cur;
                    return acc;
                }, {});
            }
            selectme.find('.select__body').empty();

            $.each(optionsObj, function (index, item) {
                blockOptions += '<div class="select__item" data-value="' + item.ID + '" role="option">' + item.NAME + '</div>';
                data.scope.optionsCount++;
            });
            selectme.find('.select__body').append(blockOptions);
        },
        selectOption: function selectOption(item) {
            // if havent item
            var selectme = $(this);
            var data = selectme.data('selectme');
            //console.log('selectOption', selectme);

            if (!item) {
                data.target.control.html(selectme.data('selectme').options.langMess.chooseLabel);
                data.target.input.val('');
                data.target.items.find('.active').removeClass('active');
                data.scope.value = '';
            } else {
                data.target.control.html($(item).html());
                data.target.input.val($(item).data('value'));
                data.scope.value = data.target.input.val();
                data.target.body.find('.active').removeClass('active');
                $(item).addClass('active');
                data.target.body.attr('aria-activedescendant', $(item).prop('id'));
                selectme.trigger('onSelectedValue', data.scope.value);
            }
        },
        addNewItems: function addNewItems(newItems) {
            var selectme = $(this);
            var data = selectme.data('selectme');

            data.options.items = newItems;

            selectme.SelectMe('renderOptions');

            if (data.options.scroll) {
                selectme.find('.select__body').removeClass('mCustomScrollbar _mCS_2 mCS_no_scrollbar').removeData('mCS');
                selectme.find('.select__body').mCustomScrollbar({
                    advanced: {
                        autoScrollOnFocus: true,
                        updateOnContentResize: true
                    }
                });
            }

            selectme.SelectMe('fillDataObject');
            selectme.SelectMe('addListeners');

            // Add ids for options elements
            selectme.SelectMe('addPreinstalledAttrs');

            // Add aria-tags
            selectme.SelectMe('addAriaTags');

            if (data.options.selectOnRender) {
                selectme.SelectMe('selectOption', data.target.items.first());
            } else {
                selectme.SelectMe('selectOption');
            }
        },
        toggleOpen: function toggleOpen(e) {
            e.preventDefault();
            var selectme = $(this);
            //console.log('toggleOpen', selectme);
            if (e.keyCode === 13 || e.keyCode === 32 || e.type === 'click') {
                ////console.log(selectme.data('selectme'))
                selectme.data('selectme').scope.opened = !selectme.data('selectme').scope.opened;
                selectme.SelectMe('closeOpened');
                //closeOpened();

                return false;
            }
        },
        close: function close() {
            var selectme = $(this);
            //console.log('close', selectme);
            selectme.removeClass('open');
            selectme.find('.select__body').removeClass('open').attr('aria-activedescendant', selectme.find('.select__body').find('.active').prop('id'));
            selectme.find('.select__value').removeAttr('aria-expanded');
            selectme.trigger('onListClosed', selectme.data('selectme').scope);
        },
        open: function open() {
            var selectme = $(this);
            //console.log('open', selectme);
            selectme.addClass('open');
            selectme.find('.select__body').addClass('open');

            selectme.find('.select__value').attr('aria-expanded', 'true');
            selectme.trigger('onListOpened', selectme.data('selectme').scope);
        },
        closeOpened: function closeOpened() {
            var selectme = $(this);
            //console.log('closeOpened', selectme);
            if (!selectme.data('selectme').scope.opened) {
                selectme.SelectMe('close');
                //close();
            } else {
                selectme.SelectMe('open');
                //open();
            }
        },
        handleKeypress: function handleKeypress(e) {
            e.preventDefault();

            var selectme = $(this);
            //console.log('handleKeypress', selectme);

            var select = selectme;
            var activeElement = select.find('.select__item.active');
            var firstElement = select.find('.select__item').first();
            var lastElement = select.find('.select__item').last();
            var allElements = select.find('.select__item');
            var elBody = select.find('.select__body');
            var currentElement = activeElement;

            if (activeElement.length > 0) {

                switch (event.which) {
                    case 38:
                        if (!currentElement.is(':first-child')) {
                            allElements.removeClass('active');
                            currentElement = currentElement.prev();
                            currentElement.addClass('active').focus();
                            elBody.attr('aria-activedescendant', currentElement.prop('id'));
                            if (selectme.data('selectme').options.scroll) {
                                select.find('.select__body').mCustomScrollbar('scrollTo', currentElement);
                            }
                        }
                        break;
                    case 40:
                        if (!currentElement.is(':last-child')) {
                            allElements.removeClass('active');
                            currentElement = currentElement.next();
                            currentElement.addClass('active').focus();
                            elBody.attr('aria-activedescendant', currentElement.prop('id'));
                            if (selectme.data('selectme').options.scroll) {
                                select.find('.select__body').mCustomScrollbar('scrollTo', currentElement);
                            }
                        }
                        break;
                    case 13:
                        currentElement.trigger('click');
                        break;
                    case 32:
                        currentElement.trigger('click');
                        break;
                }
            } else {
                firstElement.addClass('active');
                activeElement = firstElement;
                if (selectme.data('selectme').options.scroll) {
                    select.find('.select__body').mCustomScrollbar('scrollTo', activeElement);
                }
            }
        }
    };

    $.fn.SelectMe = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' не существует в jQuery.SelectMe');
        }
    };
})(jQuery);
//# sourceMappingURL=select.js.map
