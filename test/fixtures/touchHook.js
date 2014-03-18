var ID = 'TEST_ELEM_ID';

function onPageOpen(api) {

    function touchDebug(id) {

        var elem = document.createElement('a');
        elem.href = '#';
        elem.id = id;
        elem.innerHTML = '<p>Some content</p>';

        document.body.appendChild(elem);
        elem.style.width = '100px';
        elem.style.height = '100px';
        elem.style.display = 'block';

        var keys = ['click','touchstart', 'touchend', 'touchmove', 'touchenter', 'touchleave', 'touchcancel'];

        keys.forEach(function(key) {
            elem.addEventListener(key, onTouch, false);
        });

        function onTouch(e) {
            e.stopImmediatePropagation();
            //e.returnValue = false;
            //e.preventDefault();
		    //e.stopPropagation();
            //return false;
        }

        keys.forEach(function(key) {
            elem.addEventListener(key, onTouch2, false);
        });

        function onTouch2(e) {
            //e.returnValue = true;
            e.preventDefault();
        }
    }

    api.evaluate(touchDebug, ID);

}

var KEY = '__tests';
function onHalfTime(api) {
    api.injectLocalJs('./lib/index.js');
    api.evaluate(function(key, id) {
        var elem = document.getElementById(id);
        try {
            window.swipeLeft(elem, 200, 10, function(_event) {
                window[key] = window[key] || {};
                window[key][_event.type] = window[key][_event.type] || [];
                var o = {
                    'x': _event.pageX,
                    'y': _event.pageY,
                    '__event': _event
                };
                window[key][_event.type].push(o);
            });
        } catch (e) {
            console.log('Failed swiping', e, e.message, e.stack);
        }
    }, KEY, ID);
}

function onBeforeExit(api) {
    var probed = api.evaluate(function(key) {
        Object.keys(window[key]).forEach(function(_key) {
            window[key][_key].forEach(function(e) {
                e.returnValue = e.__event.returnValue;
                e.defaultPrevented = e.__event.defaultPrevented;
                delete e.__event;
            });
        });
        return {
            tests: window[key]
        };
    }, KEY);
    api.set('testData', probed);
}

module.exports = {
    'onPageOpen': onPageOpen,
    'onHalfTime': onHalfTime,
    'onBeforeExit': onBeforeExit
};
