/**
 * Generated by https://github.com/alexander-schranz/sulu-backend-bundle.
 */

define(['jquery', 'underscore'], function ($, _) {

    'use strict';

    var defaults = {
        activeTab: 'general',
        data: {},
        instanceName: 'form',
        newTitle: 'sulu_form.forms.new_form'
    };

    var tabs = {
        'general': {
            'name': 'general',
            'url': '/admin/api/form/templates/form.html',
            'formSelector': '#form-form'
        }
    };

    var translatePrefix = 'sulu_form.forms.';
    var eventPrefix = 'sulu.form.forms.';

    return {
        view: true,

        layout: {
            content: {
                width: 'max',
                topSpace: true,
                leftSpace: false,
                rightSpace: false
            }
        },

        /**
         * Initializes the collections list
         */
        initialize: function () {
            // extend defaults with options
            this.options = this.sandbox.util.extend(true, {}, defaults, this.options);

            this.saved = true;

            this.bindCustomEvents();
            this.render();
        },

        /**
         * Binds custom related events
         */
        bindCustomEvents: function () {
            this.sandbox.on('sulu.toolbar.save', this.save.bind(this));
            this.sandbox.on('sulu.toolbar.delete', this.delete.bind(this));
        },

        /**
         * Renders the component
         */
        render: function () {
            this.setHeaderInfos();
            this.renderForm(tabs[this.options.activeTab]['url']);
        },

        /**
         * Renders a specific tab
         */
        renderForm: function (template) {
            $.ajax({
                url: template + '?locale=' + this.options.language,
                method: 'GET',
                dataType: 'html',
                async: false,
                success: function(content) {
                    var formSelector = this.getActiveFormSelector();
                    this.sandbox.dom.html(this.$el, _.template(content, { translate: this.sandbox.translate, options: this.options }));

                    this.sandbox.form.create(formSelector);
                    this.sandbox.form.setData(formSelector, this.options.data).then(function () {
                        this.sandbox.start(formSelector); // start all components that are used in the form
                        this.bindFormEvents();
                        this.sandbox.dom.find('input[autofocus]').first().focus();
                    }.bind(this));
                }.bind(this)
            });
        },

        /**
         * Binds sandbox and dom events for active tab
         */
        bindFormEvents: function () {
            var formSelector = this.getActiveFormSelector();

            this.sandbox.dom.on(formSelector, 'keyup', this.activateSaveButton.bind(this), 'input, textarea');
            this.sandbox.dom.on(formSelector, 'change', this.activateSaveButton.bind(this), 'input[type="checkbox"], select');
            this.sandbox.on('husky.select.width.selected.item', this.activateSaveButton.bind(this));
            this.sandbox.on('husky.ckeditor.changed', this.activateSaveButton.bind(this));
            this.sandbox.on('sulu.content.changed', this.activateSaveButton.bind(this));
            this.sandbox.on('husky.overlay.alert.closed', this.activateSaveButton.bind(this));

            // FIXME https://github.com/sulu/sulu/issues/2652
            this.initSortableBlock();

            this.sandbox.dom.on(formSelector, 'form-add', function(e, propertyName, data, index) {
                var $elements = this.sandbox.dom.children(this.$find('[data-mapper-property="' + propertyName + '"]')),
                    $element = (index !== undefined && $elements.length > index) ? $elements[index] : this.sandbox.dom.last($elements);

                // start new subcomponents
                this.sandbox.start($element);

                // reinit sorting
                this.initSortableBlock();

                // activate save button
                this.activateSaveButton();
            }.bind(this));

            this.sandbox.dom.on(formSelector, 'form-remove', function() {
                // activate save button
                this.activateSaveButton();
            }.bind(this));

            this.sandbox.dom.on(formSelector, 'init-sortable', function(e) {
                // reinit sorting
                this.initSortableBlock();
                this.sandbox.emit('sulu.content.changed');
            }.bind(this));
        },

        initSortableBlock: function() {
            var $sortable = this.sandbox.dom.find('.sortable', this.$el),
                sortable;

            if (!!$sortable && $sortable.length > 0) {
                this.sandbox.dom.sortable($sortable, 'destroy');
                sortable = this.sandbox.dom.sortable($sortable, {
                    handle: '.move',
                    forcePlaceholderSize: true
                });

                // (un)bind event listener
                this.sandbox.dom.unbind(sortable, 'sortupdate');

                sortable.bind('sortupdate', function(event) {
                    this.sandbox.emit('sulu.content.changed');
                }.bind(this));
            }
        },

        getActiveFormSelector: function() {
            return tabs[this.options.activeTab]['formSelector'];
        },

        /**
         * Activates the save button in header
         */
        activateSaveButton: function () {
            if (this.saved === true) {
                this.sandbox.emit('sulu.header.toolbar.item.enable', 'save', false);
                this.saved = false;
            }
        },

        /**
         * Sets all the Info contained in the header
         * like breadcrumb or title
         */
        setHeaderInfos: function () {
            if (!this.options.data.id) {
                this.sandbox.emit('sulu.header.toolbar.item.disable', 'settings', false);
            }
        },

        /**
         * Deletes the current collection
         */
        delete: function () {
            if (!!this.options.data.id) {
                this.sandbox.emit(eventPrefix + 'delete', [this.options.data.id], null, function () {
                    this.sandbox.sulu.unlockDeleteSuccessLabel();
                    this.sandbox.emit(eventPrefix + 'navigate-list');
                }.bind(this));
            }
        },

        /**
         * Saves the current tab
         */
        save: function () {
            var formSelector = this.getActiveFormSelector();
            if (this.sandbox.form.validate(formSelector)) {
                var data = this.sandbox.form.getData(formSelector);
                data.id = this.options.data.id;
                data.locale = this.options.data.locale;

                this.options.data = data;

                this.sandbox.emit('sulu.header.toolbar.item.loading', 'save');
                this.sandbox.emit(eventPrefix + 'save', this.options.data, this.savedCallback.bind(this, !this.options.data.id));
            }
        },

        /**
         * Method which gets called after the save-process has finished
         * @param {Boolean} toEdit if true the form will be navigated to the edit-modus
         * @param {Object} result the saved collection model or the error model
         * @param {Boolean} success to trigger success callback, false to trigger error callback
         */
        savedCallback: function (toEdit, result, success) {
            if (success === true) {
                this.setHeaderInfos();
                this.sandbox.emit('sulu.header.toolbar.item.disable', 'save', true);

                this.saved = true;
                if (toEdit === true) {
                    this.sandbox.emit(eventPrefix + 'navigate-to', result.id);
                } else {
                    // TODO FIXME else the key of the fields are not set
                    this.sandbox.emit(eventPrefix + 'navigate-to', result.id);
                }
                this.sandbox.emit('sulu.labels.success.show', translatePrefix + 'save.success', 'labels.success');
            } else {
                this.sandbox.emit('sulu.header.toolbar.item.enable', 'save', false);
                if (result.code === 1) {
                    this.sandbox.emit('sulu.labels.error.show', translatePrefix + 'save.error-unique', 'labels.error');
                } else {
                    this.sandbox.emit('sulu.labels.error.show', translatePrefix + 'save.error', 'labels.error');
                }
            }
        }
    };
});