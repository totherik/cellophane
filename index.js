'use strict';

var express = require('express'),
    slice = Function.prototype.call.bind(Array.prototype.slice);


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


function echo(src, dest) {
    var events = {};

    return function handler(event/*, listener*/) {
        var emit;

        function replay() {
            src.removeListener(event, replay);
            emit.apply(null, arguments);
            src.on(event, replay);
        }

        if (event !== 'mount' && !events.hasOwnProperty(event)) {
            emit = dest.emit.bind(dest, event);
            src.on(event, (events[event] = replay));
        }
    };
}


function bidirect(child) {
    return function (parent) {
        var bubble, capture;

        bubble = echo(child, parent);
        capture = echo(parent, child);

        child.settings = Object.create(parent.settings);

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