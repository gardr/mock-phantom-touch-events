function computedStyle(el, prop) {
    return (
        window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle
    )[prop.replace(/-(\w)/gi, function (word, letter) {
        return letter.toUpperCase();
    })];
}

function getChildrenSize(container) {
    if (!container) {
        return;
    }
    var children = [].slice.call(container.children, 0).filter(function (el) {
        var pos = computedStyle(el, 'position');
        el.rect = el.getBoundingClientRect(); // store rect for later
        return !(
            (pos === 'absolute' || pos === 'fixed') ||
            (el.rect.width === 0 && el.rect.height === 0)
        );
    });
    if (children.length === 0) {
        return {
            width: 0,
            height: 0
        };
    }

    var totRect = children.reduce(function (tot, el) {
        return (!tot ?
            el.rect : {
                top: Math.min(tot.top, el.rect.top),
                left: Math.min(tot.left, el.rect.left),
                right: Math.max(tot.right, el.rect.right),
                bottom: Math.max(tot.bottom, el.rect.bottom)
            });
    }, null);

    return {
        width: totRect.right - totRect.left,
        height: totRect.bottom - totRect.top
    };
}

/*
    list can be either [[x, y], [x, y]] or [x, y]
*/
function createTouchList(target, list) {
    if (Array.isArray(list) && list[0] && !Array.isArray(list[0])) {
        list = [list];
    }
    list = list.map(function (entry, index) {
        return createTouch(entry[0], entry[1], target, index + 1);
    });
    return document.createTouchList.apply(document, list);
}

function createTouch(x, y, target, id) {
    return document.createTouch(window, target,
        //identifier
        id || 1,
        //pageX / clientX
        x,
        //pageY / clientY
        y,
        //screenX
        x,
        //screenY
        y
    );
}

//http://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
function initTouchEvent(touchEvent, type, touches) {
    var touch1 = touches[0];
    return touchEvent.initTouchEvent(
        //touches
        touches,
        //targetTouches
        touches,
        //changedTouches
        touches,
        //type
        type,
        //view
        window,
        //screenX
        touch1.screenX,
        //screenY
        touch1.screenY,
        //clientX
        touch1.clientX,
        //clientY
        touch1.clientY,
        //ctrlKey
        false,
        //altKey
        false,
        //shiftKey
        false,
        //metaKey
        false
    );
}

function createTouchEvent(elem, type, touches) {
    var touchEvent = document.createEvent('TouchEvent');
    if (Array.isArray(touches)) {
        touches = createTouchList(elem, touches);
    }

    function dispatch(getEvent) {
        initTouchEvent(touchEvent, type, touches);
        if (typeof getEvent === 'function'){
            getEvent(touchEvent, elem);
        }
        elem.dispatchEvent(touchEvent);
    }
    dispatch.event = touchEvent;
    return dispatch;
}

function apply(fn, arg, args) {
    return fn.apply(null, [arg].concat(Array.prototype.slice.call(args)));
}

function swipeLeft() {
    return apply(swipe, 'left', arguments);
}

function swipeRight() {
    return apply(swipe, 'right', arguments);
}

function swipe(direction, elem, ms, frames, getEvent) {
    var elemSize = getChildrenSize(elem.parentNode);
    var x      = Math.round(elemSize.height / 2);
    // swipe
    var from   = [x*1, Math.round(elemSize.height*0.10)];
    var to     = [x*1.29, Math.round(elemSize.width*0.90)];
    // console.log(
    //     'swipe' + direction,
    //     JSON.stringify(elemSize),
    //     from,
    //     to
    // );
    if (direction === 'right') {
        touchActionSequence(elem, from, to, ms, frames, getEvent);
    } else {
        touchActionSequence(elem, to, from, ms, frames, getEvent);
    }
}

function getDiff(fromList, toList){
    return [
        toList[0] - fromList[0],
        toList[1] - fromList[1]
    ];
}

function getXandYFrame(startPoint, diffToWalk, currentProgress){
    return [
        Math.round(
            Math.abs(
                startPoint[0] + (diffToWalk[0] * currentProgress))),
        Math.round(
            Math.abs(
                startPoint[1] + (diffToWalk[1] * currentProgress)))
    ];
}

function touchActionSequence(elem, fromXandY, toXandY, ms, frames, getEvent) {
    frames       = frames || 10;
    ms           = Math.round((ms||1000) / frames);
    // lets find difference from start to end and divide on frames
    var diff     = getDiff(fromXandY, toXandY);
    var counter  = frames;
    setTimeout(function handler() {
        counter--;
        if (counter) {
            createTouchEvent(elem, 'touchmove', getXandYFrame(fromXandY, diff, counter/frames))(getEvent);
            setTimeout(handler, ms);
        } else {
            createTouchEvent(elem, 'touchend', [[0, 0]])(getEvent);
        }
    }, ms);
    createTouchEvent(elem, 'touchstart', getXandYFrame(fromXandY, diff, counter/frames))(getEvent);
}

if (module && module.exports){
    module.exports = {
        _apply: apply,
        _getXandYFrame: getXandYFrame,
        _getDiff: getDiff,
        swipeLeft: swipeLeft,
        swipeRight: swipeRight,
        touchActionSequence: touchActionSequence,
        createTouchEvent: createTouchEvent
    };
}