var UT = UT || {};

UT.Event = Class.extend({

    el: document.createElement('div'),

    initialize: function() {
        this.el = document.createElement('div');
    },

    init: UT.noop,

    trigger: function(name, data) {
        return UT.trigger(this.el, name, data);
    },

    on: function(type, subview, callback) {
        if (typeof subview === 'function') {
            callback = subview;
            subview = this;
        }

        var where = typeof subview !== 'object' ? this : subview;
        UT.on(where.el, type, typeof subview === 'string' ? subview : '', callback, this);
    },

    off: function(type, subview, callback) {
        if (typeof subview === 'function') {
            callback = subview;
            subview = this;
        }

        var where = typeof subview !== 'object' ? this : subview;
        UT.off(where.el, type, typeof subview === 'string' ? subview : '', callback);
    }
});
