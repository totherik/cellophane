'use strict';

var express = require('express');


function retroactivate(events, replayer) {
    Object.keys(events).forEach(function (event) {
        var listeners, handler;

        listeners = events[event];
        handler = replayer.bind(null, event);

        if (Array.isArray(listeners)) {
            listeners.forEach(handler);
            return;
        }

        handler(listeners);
    });
}



function find(arr, predicate) {
    var match = undefined;
    arr.some(function test(item) {
        return predicate(item) && (match = item);
    });
    return match;
}


function echo(src, dest) {
    var events = {};

    function stoppable(fn) {
        return fn.stopPropagation === true;
    }

    function propagate(event, emitter) {
        var emit = emitter.emit.bind(emitter, event);

        function replay() {
            var play = find(emitter.listeners(event), stoppable);
            play && emitter.removeListener(event, play);
            emit.apply(null, arguments);
            play && emitter.addListener(event, play);
        }

        replay.stopPropagation = true;
        return replay;
    }

    return function handler(event/*, listener*/) {
        if (event !== 'mount' && !events.hasOwnProperty(event)) {
            src.on(event, (events[event] = propagate(event, dest)));
        }
    };
}


function bidirect(child) {
    return function (parent) {
        var bubble, capture;

        bubble = echo(child, parent);
        capture = echo(parent, child);

        child.settings = Object.create(parent.settings);
        child.engines = Object.create(parent.engines);

        retroactivate(parent._events, bubble);
        parent.on('newListener', bubble);

        retroactivate(child._events, capture);
        child.on('newListener', capture);
    };
}


module.exports = function cellophane(app) {
    app = app || express();
    app.on('mount', bidirect(app));
    return app;
};