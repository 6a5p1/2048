var UT = UT || {};

(function(UT) {

    // DOM
    UT.q = function(el, where) {
        return (where || document).querySelector(el);
    };
    UT.qq = function(el, where) {
        return (where || document).querySelectorAll(el);
    };

    UT.isArray = function(x) {
        return Array.isArray(x);
    };
    UT.isElement = function(x) {
        return x instanceof HTMLElement;
    };
    UT.isObject = function(x) {
        return x !== null && typeof x === 'object';
    };

    UT.noop = function() {},
    UT.matchesSelector = Element.prototype.matches || Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector ||
        function(s) {
            return [].indexOf.call(UT.qq(s), this) !== -1;
        };

    UT.matches = function(el, selector) {
        if (!el || el === document) { return false; }
        return UT.matchesSelector.call(el, selector);
    };

    UT.element = function(el) {
        if (typeof el === 'string') return UT.q(el);
        return el;
    };

    UT.extend = function() {
        var obj = {}, i = 0, il = arguments.length, key;
        for (; i < il; i++) {
            for (key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    obj[key] = arguments[i][key];
                }
            }
        }
        return obj;
    };

    UT.getProbability = function(number) {
        return Math.floor((Math.random() * 100)) < number;
    };

    UT.arraysEqual = function(a1, a2) {
        return JSON.stringify(a1) == JSON.stringify(a2);
    };

    UT.cloneDeep = function(array) {
        return JSON.parse(JSON.stringify(array));
    };


    // events
    var swipeEvents = ['swipeleft', 'swiperight', 'swipedown', 'swipeup'];
    var eventsMapping = {};
    var eventsType = {};
    var eventsCallback = {};
    var eventsUserCallback = {};
    var eventsIndex = 0;
    var getIndexes = function(element, type, subselector, userCallback) {
        var ret = [];
        for (var index in eventsMapping) {
            if (eventsMapping[index] === element
                && eventsType[index] === type + subselector
                && (!userCallback || eventsUserCallback[index] === userCallback)) {
                ret.push(index);
            }
        }
        return ret;
    };
    var clearEvent = function(index) {
        delete eventsMapping[index];
        delete eventsType[index];
        delete eventsCallback[index];
        delete eventsUserCallback[index];
    };

    var getScreenX = function(event) {
        if ('screenX' in event)
            return event.screenX;
        return event.touches[0].screenX;
    };
    var getScreenY = function(event) {
        if ('screenY' in event)
            return event.screenY;
        return event.touches[0].screenY;
    };
    UT.on = function(element, type, subselector, callback, context, useCapture) {
        if (UT.isArray(type)) {
            return type.forEach(function(t) {
                UT.on(element, t, subselector, callback, context, useCapture);
            });
        }
        if (swipeEvents.indexOf(type) !== -1 && !element.has_swipe_active) {
            var OFFSET = 10, startX, startY, stopX, stopY;
            var onMouseDown = function(event) {
                event.preventDefault();
                startX = getScreenX(event);
                startY = getScreenY(event);
            };
            var onMouseMove = function(event) {
                event.preventDefault();
                stopX = getScreenX(event);
                stopY = getScreenY(event);
            };
            var onMouseUp = function(event) {
                var x = stopX - startX;
                var y = stopY - startY;

                var dir = Math.abs(x) - Math.abs(y) > 0 ? x : y;
                if (Math.abs(dir) > OFFSET) {
                    if (dir === x) {
                        UT.trigger(UT.q(subselector, element), 'swipe' + (x < 0 ? 'left' : 'right'));
                    } else if (dir === y) {
                        UT.trigger(UT.q(subselector, element), 'swipe' + (y < 0 ? 'up' : 'down'));
                    }
                }
            };

            element.has_swipe_active = true;

            UT.on(element, ['mousedown', 'touchstart'], subselector, onMouseDown);
            UT.on(element, ['mousemove', 'touchmove'], subselector, onMouseMove);
            UT.on(element, ['mouseup', 'touchend'], subselector, onMouseUp);
        }
        eventsMapping[eventsIndex] = element;
        eventsType[eventsIndex] = type + (subselector || '');
        eventsCallback[eventsIndex] = function(ev) {
            var target = ev.target;
            if (!subselector) {
                return callback.call((context || target), ev, element);
            }
            while (target) {
                if (UT.matches(target, subselector)) {
                    return callback.call((context || target), ev, target);
                }
                target = target.parentNode;
            }
        };
        eventsUserCallback[eventsIndex] = callback;

        element.addEventListener(type, eventsCallback[eventsIndex], !!useCapture);
        eventsIndex++;
    };
    UT.off = function(element, type, subselector, callback) {
        if (UT.isArray(type)) {
            return type.forEach(function(t) {
                UT.off(element, t, subselector, callback);
            });
        }

        var indexes = getIndexes(element, type, subselector || '', callback);
        indexes.forEach(function(index) {
            element.removeEventListener(type, eventsCallback[index]);
            clearEvent(index);
        });
    };
    UT.trigger = function(element, name, data) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent(name, true, true);
        event.data = data;
        element.dispatchEvent(event);
    };
})(UT);
