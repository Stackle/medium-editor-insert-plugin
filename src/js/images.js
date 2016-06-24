; (function ($, window, document, undefined) {

    'use strict';

    /** Default values */
    var pluginName = 'mediumInsert',
        addonName = 'Images', // first char is uppercase
        defaults = {
            label: '<span class="fa fa-picture-o"></span>',
            placeholder: 'Paste a photo url and press Enter',
            captions: true,
            captionPlaceholder: 'Type caption (optional)',
            styles: {
                "col-2-left": {
                    title: 'align left 2 column',
                    label: '<span class="medium-btn-img-icon img-col-2-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-4-left": {
                    title: 'align left 4 column',
                    label: '<span class="medium-btn-img-icon img-col-4-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-6-left": {
                    title: 'align left 6 column',
                    label: '<span class="medium-btn-img-icon img-col-6-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-8-left": {
                    title: 'align left 8 column',
                    label: '<span class="medium-btn-img-icon img-col-8-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-2-right": {
                    title: 'align right 2 column',
                    label: '<span class="medium-btn-img-icon img-col-2-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-4-right": {
                    title: 'align right 4 column',
                    label: '<span class="medium-btn-img-icon img-col-4-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-6-right": {
                    title: 'align right 6 column',
                    label: '<span class="medium-btn-img-icon img-col-6-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "col-8-right": {
                    title: 'align right 8 column',
                    label: '<span class="medium-btn-img-icon img-col-8-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                bottom: {
                    title: 'move caption to bottom',
                    label: '<span class="medium-btn-img-icon bottom"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "caption-top-left": {
                    title: 'move caption to top left',
                    label: '<span class="medium-btn-img-icon cap-top-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "caption-top-right": {
                    title: 'move caption to top right',
                    label: '<span class="medium-btn-img-icon cap-top-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "caption-bottom-left": {
                    title: 'move caption to bottom left',
                    label: '<span class="medium-btn-img-icon cap-bottom-l"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "caption-bottom-right": {
                    title: 'move caption to bottom right',
                    label: '<span class="medium-btn-img-icon cap-bottom-r"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                "extra-margin": {
                    title: 'add extra margin',
                    label: '<span class="medium-btn-img-icon img-extra-margin"></span>',
                    added: function ($el) {
                        var classList = $el.attr('class').split(/\s+/),
                        marginSide;
                        $.each(classList, function (index, item) {
                            if (item.match(/^medium-insert-images-col-([0-9]+)-left$/)) {
                                marginSide = 'right';
                            } else if (item.match(/^medium-insert-images-col-([0-9]+)-right$/)) {
                                marginSide = 'left';
                            }
                        });
                        if (marginSide) {
                            $el.addClass('extra-margin-' + marginSide);
                        }
                    }
                }
            },
            actions: {
                remove: {
                    label: '<span class="fa fa-times"></span>',
                    clicked: function () {
                        var $event = $.Event('keydown');

                        $event.which = 8;
                        $(document).trigger($event);
                    }
                }
            },
            parseOnPaste: false
        };

    /**
     * Images object
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Images(el, options) {
        this.el = el;
        this.$el = $(el);
        this.templates = window.MediumInsert.Templates;
        this.core = this.$el.data('plugin_' + pluginName);

        this.options = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        // Extend editor's functions
        if (this.core.getEditor()) {
            this.core.getEditor()._serializePreImages = this.core.getEditor().serialize;
            this.core.getEditor().serialize = this.editorSerialize;
        }

        this.init();
    }

    /**
     * Initialization
     *
     * @return {void}
     */

    Images.prototype.init = function () {
        var $images = this.$el.find('.medium-insert-images');

        $images.attr('contenteditable', false);
        $images.each(function () {
            if ($(this).find('.medium-insert-images-overlay').length === 0) {
                $(this).append($('<div />').addClass('medium-insert-images-overlay'));
            }
        });

        this.events();
    };

    /**
     * Event listeners
     *
     * @return {void}
     */

    Images.prototype.events = function () {
        $(document)
            .on('click', $.proxy(this, 'unselectImage'))
            .on('keydown', $.proxy(this, 'removeImage'))
            .on('click', '.medium-insert-images-toolbar .medium-editor-action', $.proxy(this, 'toolbarAction'))
            .on('click', '.medium-insert-images-toolbar2 .medium-editor-action', $.proxy(this, 'toolbar2Action'));

        this.$el
            .on('keyup click paste', $.proxy(this, 'togglePlaceholder'))
            .on('keydown', $.proxy(this, 'processLink'))
            .on('click', '.medium-insert-images-overlay', $.proxy(this, 'selectImage'))
            .on('contextmenu', '.medium-insert-images-placeholder', $.proxy(this, 'fixRightClickOnPlaceholder'));

        if (this.options.parseOnPaste) {
            this.$el
                .on('paste', $.proxy(this, 'processPasted'));
        }
    };

    /**
     * Extend editor's serialize function
     *
     * @return {object} Serialized data
     */

    Images.prototype.editorSerialize = function () {
        var data = this._serializePreImages();

        $.each(data, function (key) {
            var $data = $('<div />').html(data[key].value);

            $data.find('.medium-insert-images').removeAttr('contenteditable');
            $data.find('.medium-insert-images-overlay').remove();

            data[key].value = $data.html();
        });

        return data;
    };

    /**
     * Add imageded element
     *
     * @return {void}
     */

    Images.prototype.add = function () {
        var $place = this.$el.find('.medium-insert-active');

        // Fix #132
        // Make sure that the content of the paragraph is empty and <br> is wrapped in <p></p> to avoid Firefox problems
        $place.html(this.templates['src/js/templates/core-empty-line.hbs']().trim());

        // Replace paragraph with div to prevent #124 issue with pasting in Chrome,
        // because medium editor wraps inserted content into paragraph and paragraphs can't be nested
        if ($place.is('p')) {
            $place.replaceWith('<div class="medium-insert-active">' + $place.html() + '</div>');
            $place = this.$el.find('.medium-insert-active');
            this.core.moveCaret($place);
        }

        $place.addClass('medium-insert-images medium-insert-images-input medium-insert-images-active');

        this.togglePlaceholder({ target: $place.get(0) });

        $place.click();
        this.core.hideButtons();
    };

    /**
     * Toggles placeholder
     *
     * @param {Event} e
     * @return {void}
     */

    Images.prototype.togglePlaceholder = function (e) {
        var $place = $(e.target),
            selection = window.getSelection(),
            range, $current, text;

        if (!selection || selection.rangeCount === 0) {
            return;
        }

        range = selection.getRangeAt(0);
        $current = $(range.commonAncestorContainer);

        if ($current.hasClass('medium-insert-images-active')) {
            $place = $current;
        } else if ($current.closest('.medium-insert-images-active').length) {
            $place = $current.closest('.medium-insert-images-active');
        }

        if ($place.hasClass('medium-insert-images-active')) {

            text = $place.text().trim();

            if (text === '' && $place.hasClass('medium-insert-images-placeholder') === false) {
                $place
                    .addClass('medium-insert-images-placeholder')
                    .attr('data-placeholder', this.options.placeholder);
            } else if (text !== '' && $place.hasClass('medium-insert-images-placeholder')) {
                $place
                    .removeClass('medium-insert-images-placeholder')
                    .removeAttr('data-placeholder');
            }

        } else {
            this.$el.find('.medium-insert-images-active').remove();
        }
    };

    /**
     * Right click on placeholder in Chrome selects whole line. Fix this by placing caret at the end of line
     *
     * @param {Event} e
     * @return {void}
     */

    Images.prototype.fixRightClickOnPlaceholder = function (e) {
        this.core.moveCaret($(e.target));
    };

    /**
     * Process link
     *
     * @param {Event} e
     * @return {void}
     */

    Images.prototype.processLink = function (e) {
        var $place = this.$el.find('.medium-insert-images-active'),
            url;

        if (!$place.length) {
            return;
        }

        url = $place.text().trim();

        // Return empty placeholder on backspace, delete or enter
        if (url === '' && [8, 46, 13].indexOf(e.which) !== -1) {
            $place.remove();
            return;
        }

        if (e.which === 13) {
            e.preventDefault();
            e.stopPropagation();

            if (this.options.oimageProxy) {
                this.oimage(url);
            } else {
                this.parseUrl(url);
            }
        }
    };

    /**
     * Process Pasted
     *
     * @param {Event} e
     * @return {void}
     */

    Images.prototype.processPasted = function (e) {
        var pastedUrl, linkRegEx;
        if ($(".medium-insert-images-active").length) {
            return;
        }

        pastedUrl = e.originalEvent.clipboardData.getData('text');
        linkRegEx = new RegExp('^(http(s?):)?\/\/','i');
        if (linkRegEx.test(pastedUrl)) {
            this.parseUrl(pastedUrl, true);
        }
    };

    /**
     * Get HTML using regexp
     *
     * @param {string} url
     * @param {bool} pasted
     * @return {void}
     */

    Images.prototype.parseUrl = function (url, pasted) {
        var cleanedUrl = url.replace(/\n?/g, '');

        if (pasted) {
            this.image(cleanedUrl, url);
        } else {
            this.image(cleanedUrl);
        }
    };

    /**
     * Add html to page
     *
     * @param {string} html
     * @param {string} pastedUrl
     * @return {void}
     */

    Images.prototype.image = function (url, pastedUrl) {
        var $place = this.$el.find('.medium-insert-images-active');

        if (!url) {
            alert('Incorrect URL format specified');
            return false;
        } else {

            if (pastedUrl) {
                // Get the element with the pasted url
                // place the image template and remove the pasted text
                $place = this.$el.find(":not(iframe, script, style)")
                    .contents().filter(
                        function () {
                            return this.nodeType === 3 && this.textContent.indexOf(pastedUrl) > -1;
                        }).parent();

                $place.after(this.templates['src/js/templates/images-wrapper.hbs']({
                    url: url
                }));
                $place.text($place.text().replace(pastedUrl, ''));
            } else {
                $place.after(this.templates['src/js/templates/images-wrapper.hbs']({
                    url: url
                }));
                $place.remove();
            }


            this.core.triggerInput();
        }
    };

    /**
     * Select clicked image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.selectImage = function (e) {
        var that = this,
            $image;
        if (this.core.options.enabled) {
            $image = $(e.target).hasClass('medium-insert-images') ? $(e.target) : $(e.target).closest('.medium-insert-images');

            $image.addClass('medium-insert-images-selected');

            setTimeout(function () {
                that.addToolbar();

                if (that.options.captions) {
                    that.core.addCaption($image.find('figure'), that.options.captionPlaceholder);
                }
            }, 50);
        }
    };

    /**
     * Unselect selected image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.unselectImage = function (e) {
        var $el = $(e.target).hasClass('medium-insert-images') ? $(e.target) : $(e.target).closest('.medium-insert-images'),
            $image = this.$el.find('.medium-insert-images-selected');

        if ($el.hasClass('medium-insert-images-selected')) {
            $image.not($el).removeClass('medium-insert-images-selected');
            $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();
            this.core.removeCaptions($el.find('figcaption'));

            if ($(e.target).is('.medium-insert-caption-placeholder') || $(e.target).is('figcaption')) {
                $el.removeClass('medium-insert-images-selected');
                this.core.removeCaptionPlaceholder($el.find('figure'));
            }
            return;
        }

        $image.removeClass('medium-insert-images-selected');
        $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();

        if ($(e.target).is('.medium-insert-caption-placeholder')) {
            this.core.removeCaptionPlaceholder($el.find('figure'));
        } else if ($(e.target).is('figcaption') === false) {
            this.core.removeCaptions();
        }
    };

    /**
     * Remove image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.removeImage = function (e) {
        var $image, $empty;

        if (e.which === 8 || e.which === 46) {
            $image = this.$el.find('.medium-insert-images-selected');

            if ($image.length) {
                e.preventDefault();

                $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();

                $empty = $(this.templates['src/js/templates/core-empty-line.hbs']().trim());
                $image.before($empty);
                $image.remove();

                // Hide addons
                this.core.hideAddons();

                this.core.moveCaret($empty);
                this.core.triggerInput();
            }
        }
    };

    /**
     * Adds image toolbar to editor
     *
     * @returns {void}
     */

    Images.prototype.addToolbar = function () {
        var $image = this.$el.find('.medium-insert-images-selected'),
            active = false,
            $toolbar, $toolbar2, top, mediumEditor, toolbarContainer,
            toolbarLeft, toolbar2Left;

        if ($image.length === 0) {
            return;
        }

        mediumEditor = this.core.getEditor();
        toolbarContainer = mediumEditor.options.elementsContainer || 'body';

        $(toolbarContainer).append(this.templates['src/js/templates/images-toolbar.hbs']({
            styles: this.options.styles,
            actions: this.options.actions
        }).trim());

        $toolbar = $('.medium-insert-images-toolbar');
        $toolbar2 = $('.medium-insert-images-toolbar2');

        top = $image.offset().top - $toolbar.height() - 8 - 2 - 5; // 8px - hight of an arrow under toolbar, 2px - height of an image outset, 5px - distance from an image
        if (top < 0) {
            top = 0;
        }
        toolbarLeft = Math.max(0, $image.offset().left + $image.width() / 2 - $toolbar.width() / 2);
        toolbar2Left = Math.max(0, $image.offset().left + $image.width() - $toolbar2.width() - 4); // 4px - distance from a border

        $toolbar
            .css({
                top: top,
                left: toolbarLeft
            })
            .show();

        $toolbar2
            .css({
                top: $image.offset().top + 2, // 2px - distance from a border
                left: toolbar2Left
            })
            .show();

        $toolbar.find('button').each(function () {
            if ($image.hasClass('medium-insert-images-' + $(this).data('action'))) {
                $(this).addClass('medium-editor-button-active');
                active = true;
            }
        });

        if (active === false) {
            //find default button, move caption to bottom
            $toolbar.find('button').each(function () {
                if ($(this).attr('data-action') === 'bottom') {
                    $(this).addClass('medium-editor-button-active');
                }
            });
        }
    };

    /**
     * Fires toolbar action
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.toolbarAction = function (e) {
        var $button = $(e.target).is('button') ? $(e.target) : $(e.target).closest('button'),
            $li = $button.closest('li'),
            $ul = $li.closest('ul'),
            $lis = $ul.find('li'),
            $image = this.$el.find('.medium-insert-images-selected'),
            that = this,
            classList = $image.attr('class').split(/\s+/),
            alignmentClass, oldClass;

        $button.addClass('medium-editor-button-active');
        $li.siblings().find('.medium-editor-button-active').removeClass('medium-editor-button-active');

        $.each(classList, function (index, item) {
            if (item.match(/^medium-insert-images-col-([0-9]+)-left$/)) {
                alignmentClass = item;
            } else if (item.match(/^medium-insert-images-col-([0-9]+)-right$/)) {
                alignmentClass = item;
            } else if (item.match(/^medium-insert-images-caption-([a-z-]+)$/) || item === 'medium-insert-images-bottom') {
                oldClass = item;
            }
        });

        $lis.find('button').each(function () {
            var className = 'medium-insert-images-' + $(this).data('action');
            if ($(this).hasClass('medium-editor-button-active')) {
                $image.removeClass('extra-margin-right');
                $image.removeClass('extra-margin-left');
                if (alignmentClass && className === 'medium-insert-images-extra-margin') {
                    $image.addClass(alignmentClass);
                }
                if (jQuery.inArray(className, classList) > -1 && className === 'medium-insert-images-extra-margin') {
                    $image.removeClass(className);
                } else if (alignmentClass || className !== 'medium-insert-images-extra-margin') {
                    $image.addClass(className);
                    if (that.options.styles[$(this).data('action')].added) {
                        that.options.styles[$(this).data('action')].added($image);
                    }
                } else {
                    $image.addClass(oldClass);
                }
            } else {
                $image.removeClass(className);

                if (that.options.styles[$(this).data('action')].removed) {
                    that.options.styles[$(this).data('action')].removed($image);
                }
            }
        });

        this.core.triggerInput();
    };

    /**
     * Fires toolbar2 action
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.toolbar2Action = function (e) {
        var $button = $(e.target).is('button') ? $(e.target) : $(e.target).closest('button'),
            callback = this.options.actions[$button.data('action')].clicked;

        if (callback) {
            callback(this.$el.find('.medium-insert-images-selected'));
        }

        this.core.triggerInput();
    };

    /** Plugin initialization */

    $.fn[pluginName + addonName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName + addonName)) {
                $.data(this, 'plugin_' + pluginName + addonName, new Images(this, options));
            }
        });
    };

})(jQuery, window, document);
