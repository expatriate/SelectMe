/*
  jQuery Select plugin
  DKarbushev 04.2018
*/
(function ($) {

    let methods = {
        init : function(options) {
            return this.each(function() {
                let selectme = $(this); // Parent element

                // Language options
                let mainLangMess = {
                    'ru' : {
                        'chooseAriaLabel': 'Выберите из списка',
                        'chooseLabel': 'Выберите из списка',
                        'svgTitle': 'Стрелка выбора списка',
                    },
                    'en' : {
                        'chooseAriaLabel': 'Choose from options',
                        'chooseLabel': 'Choose from options',
                        'svgTitle': 'Select state arrow',
                    }
                }

                let default_options = {
                    options: [], // Format [{ID:NAME:}, {ID:NAME}...]
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
                    langMess: {},
                }

                // variables
                let scope = {
                        value: '',
                        opened: false,
                        optionsCount: 0,
                        id: '',
                        valid: true
                    }

                function setOptions(options) {
                    for (let key in options) {
                        //Check not empty value
                        let empty_test = options[key] + '';
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
                    for (let key in default_options) {
                        if (selectme.data(key.toLowerCase())) {
                            default_options[key] = selectme.data(key.toLowerCase());
                        }
                    }
                    default_options.langMess = mainLangMess[default_options.lang]
                };                

                function addListeners() {
                    selectme.control.off('click').on('click', (e) => {
                        console.log('click')
                        selectme.SelectMe('toggleOpen', e);
                        //selectOption(e.target);
                    });
                    selectme.control.off('keypress').on('keypress', (e) => {
                        console.log('keypress')
                        selectme.SelectMe('toggleOpen', e);
                        //selectOption(e.target);
                    });
                    selectme.options.unbind('click').on('click', (e) => {
                        selectme.SelectMe('selectOption', e.target);
                        //selectOption(e.target);
                    });

                    document.body.addEventListener('click', (e) => {
                        if (scope.opened && !$(e.target).parents('.select__item').length && !$(e.target).hasClass('select__value')) {
                            scope.opened = false;
                            selectme.SelectMe('closeOpened');
                            //closeOpened()
                        }
                    });
                    document.getElementById(scope.id).addEventListener('keydown', (e) => {
                        if (scope.opened) {
                            if (event.which === 38 || event.which === 40 || event.which === 13) {
                                selectme.SelectMe('handleKeypress', e);
                                //handleKeypress(e);
                            }
                            if (event.which === 27 || event.which === 9) {
                                if (!$(e.target).parents('.select__item').length) {
                                    selectme.SelectMe('close');
                                    //close();
                                    scope.opened = false;
                                }
                            }
                        }
                    });
                }
                function initialise() {
                    scope.id = `select_${Date.now().toString().substr(5)}`;
                    selectme.attr('id', scope.id);

                    selectme.trigger('onInitStart', scope);

                    if (default_options.fromMarkup) {
                        selectme.input = selectme.find('input');
                        selectme.control = selectme.find('.select__value');
                        selectme.body = selectme.find('.select__body');
                        selectme.options = selectme.find('.select__item');
                        scope.optionsCount = this.options.length;
                        selectme.checkboxes = [];
                    } else {
                        selectme.SelectMe('renderEmptyMarkup', selectme);

                        selectme.input = selectme.find('input');
                        selectme.control = selectme.find('.select__value');
                        selectme.body = selectme.find('.select__body');
                        selectme.options = selectme.find('.select__item');

                        selectme.SelectMe('renderOptions');
                    }
                    this.input = selectme.input;
                    this.control = selectme.control;
                    this.body = selectme.body;
                    this.options = selectme.options;

                    if (default_options.scroll) {
                        selectme.body.mCustomScrollbar({
                            advanced: {
                                autoScrollOnFocus: true,
                                updateOnContentResize: true
                            }
                        });
                    }

                    if (default_options.selectOnRender) {
                        selectme.SelectMe('selectOption', selectme.options.first());
                    } else {
                        selectme.SelectMe('selectOption');
                    }

                    // Add ids for options elements
                    selectme.SelectMe('addPreinstalledAttrs');
                    //addPreinstalledAttrs();

                    // Add aria-tags
                    selectme.SelectMe('addAriaTags');
                    //addAriaTags();

                    selectme.trigger('onInitEnd', scope);
                }

                setOptions(options);

                let data = selectme.data('selectme');
                if (!data) { 
                    selectme.data('selectme', {
                        target : selectme,
                        options: default_options,
                        scope: scope
                    });
                    data = selectme.data('selectme');
                }

                initialise();
                addListeners();

            });
        },
        renderEmptyMarkup: function(selectme) {
            // Clear main container
            selectme.empty();
            let options = selectme.data('selectme').options;
            //let langMess = mainLangMess[options.lang];
            let defaultArrow = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="${options.arrowClass}" viewBox="0 0 13 8" id="angle-down" width="100%" height="100%">
                                    <title>${options.langMess.svgTitle}</title>
                                    <path d="M2.207.793A1 1 0 1 0 .793 2.207l4.999 5a1 1 0 0 0 1.414 0l5.001-5A1 1 0 1 0 10.793.793L6.499 5.086 2.207.793z"></path>
                                </svg>`;
            let arrowSvg = !options.arrowPath ? defaultArrow : `<svg class="${options.arrowClass}"><use xlink:href="${options.arrowPath}"></use></svg>`;
            let template = `
                    <input ${!options.inputClass ? '' : `class="${options.inputClass}"` } type="hidden">
                    <div class="select__value ${options.selectClass}">
                    </div>
                    <div class="select__body js-scroll-select">
                    </div>
                    ${options.arrow === true ? `
                    <div class="select__arrow">
                        ${arrowSvg}
                    </div>
                        ` : ``}`
            selectme.append($(template));

            if (options.wrapClass.length) {
                let classes = options.wrapClass.split(' ');
                for (tempClass in classes) {
                    selectme.addClass(tempClass);
                }
            }
        },
        addPreinstalledAttrs: function() {
            // Add ID for options
            if (this.options.length) {
                this.options.each((index, item) => {
                    $(item).prop('id', `option_${Date.now().toString().substr(5)}_${$(item).data('value')}`);
                });
            }
        },
        addAriaTags: function() {
            let selectme = $(this);
            this.input.attr('aria-label', 'Value');
            this.control.attr('tabindex', 0)
                        .attr('role', 'button')
                        .attr('aria-haspopup', 'listbox')
                        .attr('aria-label', selectme.data('selectme').options.langMess.chooseAriaLabel);
            this.body.attr('role', 'listbox')
                    .attr('tabindex', '-1')
                    .attr('aria-label', selectme.data('selectme').options.langMess.chooseAriaLabel);
            if (this.body.find('.active').length) {
                this.body.attr('aria-activedescendant', this.body.find('.active').prop('id'));
            }
        },
        renderOptions: function() {
            let selectme = $(this);
            console.log('renderOptions', selectme);
            let default_options = selectme.data('selectme').options, optionsObj = selectme.data('selectme').options.options, blockOptions = '';;
            // If options is array - convert to object
            if (default_options.options && Array.isArray(default_options.options)) {
                optionsObj = default_options.options.reduce(function(acc, cur, i) {
                    acc[i] = cur;
                    return acc;
                }, {});
            }
            this.body.empty();

            $.each(optionsObj, function(index, item) {
                blockOptions +=`<div class="select__item" data-value="${item.ID}" role="option">${item.NAME}</div>`;
                selectme.data('selectme').scope.optionsCount++;
            });
            this.body.append(blockOptions);
            this.options = this.find('.select__item');
        },
        selectOption: function(item) {
            // if havent item
            let selectme = $(this);
            console.log('selectOption', selectme);

            if (!item) {
                this.control.html(this.langMess.chooseLabel);
                this.input.val('');
                this.options.find('.active').removeClass('active');
                selectme.data('selectme').scope.value = '';
            } else {
                this.control.html($(item).html());
                this.input.val($(item).data('value'));
                selectme.data('selectme').scope.value = this.input.val();
                this.options.find('.active').removeClass('active');
                $(item).addClass('active');
                this.body.attr('aria-activedescendant', $(item).prop('id'));
                selectme.trigger('onSelectedValue', selectme.data('selectme').scope.value);
            }
        },
        toggleOpen: function(e) {
            e.preventDefault();
            let selectme = $(this);
            console.log('toggleOpen', selectme);
            if (e.keyCode === 13 || e.keyCode === 32 || e.type === 'click') {
                //console.log(selectme.data('selectme'))
                selectme.data('selectme').scope.opened = !selectme.data('selectme').scope.opened;
                selectme.SelectMe('closeOpened');
                //closeOpened();
                
                return false;
            }
        }, 
        close: function() {
            let selectme = $(this);
            console.log('close', selectme);
            selectme.removeClass('open');
            selectme.find('.select__body').removeClass('open').attr('aria-activedescendant', selectme.find('.select__body').find('.active').prop('id'));
            selectme.find('.select__value').removeAttr('aria-expanded');
            selectme.trigger('onListClosed', selectme.data('selectme').scope);
        },
        open: function() {
            let selectme = $(this);
            console.log('open', selectme);
            selectme.addClass('open');
            selectme.find('.select__body').addClass('open');

            selectme.find('.select__value').attr('aria-expanded', 'true');
            selectme.trigger('onListOpened', selectme.data('selectme').scope);
        },
        closeOpened: function() {
            let selectme = $(this);
            console.log('closeOpened', selectme);
            if (!selectme.data('selectme').scope.opened) {
                selectme.SelectMe('close');
                //close();
            } else {
                selectme.SelectMe('open');
                //open();
            }
        },
        handleKeypress: function(e) {
            e.preventDefault();

            let selectme = $(this);
            console.log('handleKeypress', selectme);
            
            let select = selectme;
            let activeElement = select.find('.select__item.active');
            let firstElement = select.find('.select__item').first();
            let lastElement = select.find('.select__item').last();
            let allElements = select.find('.select__item');
            let elBody = select.find('.select__body');
            let currentElement = activeElement;
            
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
                }
            } else {
                firstElement.addClass('active');
                activeElement = firstElement;
                if (selectme.data('selectme').options.scroll) {
                    select.find('.select__body').mCustomScrollbar('scrollTo', activeElement);
                }
            }        
        }
    }

    $.fn.SelectMe = function( method ) {

        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Метод ' +  method + ' не существует в jQuery.SelectMe' );
        }   
    };
    
}(jQuery));