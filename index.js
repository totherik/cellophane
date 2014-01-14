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

        function onevent() {
            src.removeListener(event, onevent);
            emit.apply(null, arguments);
            src.on(event, onevent);
        }

        if (event !== 'mount' && !events.hasOwnProperty(event)) {
            emit = dest.emit.bind(dest, event);
            src.on(event, (events[event] = onevent));
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
        retroactivate(child._events, capture);
        parent.on('newListener', bubble);
        child.on('newListener', capture);
    };
}


module.exports = function cellophane(app) {
    app = app || express();
    app.on('mount', bidirect(app));
    return app;
};