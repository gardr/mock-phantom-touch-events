var IDS = ['TEST_ELEM_ID_1', 'TEST_ELEM_ID_2'];

function onPageOpen(api) {

    function touchDebug(ids) {


        var elem = document.createElement('a');
        elem.href = '#';
        elem.id = ids[0];
        elem.innerHTML = '<p>Some content</p>';

        document.body.appendChild(elem);
        elem.style.width = '100px';
        elem.style.height = '100px';
        elem.style.display = 'block';

        var canvas = document.createElement('canvas');
        canvas.id = ids[1];
        document.body.appendChild(canvas);

        canvas.style.width = '100px';
        canvas.style.height = '100px';
        canvas.style.display = 'block';


        [elem, canvas].forEach(function(el) {
            var keys = ['click', 'touchstart', 'touchend', 'touchmove', 'touchenter', 'touchleave', 'touchcancel'];

            keys.forEach(function(key) {
                el.addEventListener(key, onTouch, false);
            });

            function onTouch(e) {
                e.stopImmediatePropagation();
                //e.returnValue = false;
                //e.preventDefault();
                //e.stopPropagation();
                //return false;
            }

            keys.forEach(function(key) {
                el.addEventListener(key, onTouch2, false);
            });

            function onTouch2(e) {
                //e.returnValue = true;
                e.preventDefault();
            }
        });

    }

    api.evaluate(touchDebug, IDS);

}

var NAMESPACE = '__tests';

function onHalfTime(api) {
    api.injectLocalJs('./lib/index.js');
    api.evaluate(function(ns, ids) {

        function swipeElementWithId(id) {
            var elem = document.getElementById(id);

            function swipeEventHandler(_event) {
                window[ns] = window[ns] || {};
                window[ns][_event.type] = window[ns][_event.type] || [];
                var o = {
                    'id': id,
                    'x': _event.pageX,
                    'y': _event.pageY,
                    '__event': _event
                };
                window[ns][_event.type].push(o);
            }

            try {
                // RUN touch
                window.swipeLeft(elem, 200, 10, swipeEventHandler);
            } catch (e) {
                console.log('Failed swiping', e, e.message, e.stack);
            }
        }

        ids.forEach(swipeElementWithId);

    }, NAMESPACE, IDS);
}

function onBeforeExit(api) {
    function collectProbes(ns) {
        function reformatEvents(storedKey) {
            window[ns][storedKey].forEach(function(e) {
                e.returnValue = e.__event.returnValue;
                e.defaultPrevented = e.__event.defaultPrevented;
                delete e.__event;
            });
        }

        Object.keys(window[ns]).forEach(reformatEvents);



        return {
            tests: window[ns]
        };
    }

    api.set('testData', api.evaluate(collectProbes, NAMESPACE));
}

module.exports = {
    'onPageOpen': onPageOpen,
    'onHalfTime': onHalfTime,
    'onBeforeExit': onBeforeExit
};
