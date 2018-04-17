var UT = UT || {};

UT.View = UT.Event.extend({

    initialize: function() {

        this._super.call(this);

        var expose = ["el", "collection", "model"];
        var obj = UT.isObject(arguments[0]) ? arguments[0] : {};

        for (var x = 0; x < expose.length; x++) {
            if (obj[expose[x]]) {
                this[expose[x]] = obj[expose[x]];
            }
        }

        if (!UT.isElement(this.el))
            return console.error('Please specify a valid container! << ' + this.el + ' >> is not valid.');

        this.options = UT.extend(this.defaults, obj || {});

        for (var key in this.events) {
            var s = key.split(/\s+/);
            var eventName = s.shift().trim();
            var eventElement = s.join(' ').trim();
            var callback = typeof this.events[key] === 'function' ?
                this.events[key] : this[this.events[key]];
            this.on(eventName, eventElement, callback, this);
        }

        this.init.apply(this, arguments);
    },

    defaults: {},
    events: {},

    q: function(selector) {
        return UT.q(selector, this.el);
    },

    qq: function(selector) {
        return UT.qq(selector, this.el);
    },

    destroy: function() {
        var elClone = this.el.cloneNode(true);
        if (this.el.parentNode) {
            this.el.parentNode.replaceChild(elClone, this.el);
        }
        this.el.innerHTML = '';
    }
});
