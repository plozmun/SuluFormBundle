define(["type/default","form/util"],function(a){"use strict";return function(b,c){var d={id:"id",label:"value",required:!1},e={setValue:function(a){void 0!==a&&""!==a&&null!==a&&("object"==typeof a?this.$el.data({selection:a[this.options.id],selectionValues:a[this.options.label]}).trigger("data-changed"):this.$el.data({selection:a}).trigger("data-changed"))},getValue:function(){var a={},b=this.$el.data("selection"),c=this.$el.data("selection-values"),d=this.$el.attr("data-mapper-return-value");if(!b||0===b.length)return"";if("undefined"!=typeof d){if("id"===d)return Array.isArray(b)?b[0]:b;if("value"===d)return Array.isArray(c)?c[0]:c}return"string"===this.$el.attr("data-mapper-property-type")?Array.isArray(c)?c[0]:c:(a[this.options.label]=Array.isArray(c)?c[0]:c,a[this.options.id]=Array.isArray(b)?b[0]:b,a)},needsValidation:function(){var a=this.getValue();return!!a},validate:function(){var a=this.getValue();return"object"==typeof a&&a.hasOwnProperty("id")?!!a.id:""!==a&&"undefined"!=typeof a}};return new a(b,d,c,"select-custom",e)}});