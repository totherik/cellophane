'use strict';

var test = require('tape'),
    path = require('path'),
    cellophane = require('../'),
    express = require('express');


test('cellophane', function (t) {

    t.test('settings', function (t) {
        var child, parent;

        child = cellophane();
        child.on('mount', function (mommy) {
            t.strictEqual(parent, mommy);
            t.strictEqual(child.get('foo'), mommy.get('foo'));
            t.strictEqual(child.get('views'), mommy.get('views'));
            t.strictEqual(child.get('views'), __dirname);

            // Child should automatically pick up any changes to parent settings.
            parent.set('views', path.dirname(__dirname));
            t.strictEqual(child.get('views'), path.dirname(__dirname));
        });

        parent = express();
        parent.set('foo', 'bar');
        parent.set('views', __dirname);
        parent.use(child);
        t.end();
    });


    t.test('bubble new event', function (t) {
        var child, parent;

        child = cellophane();
        setImmediate(function () {
            child.emit('howdy', 'doody');
        });

        parent = express();
        parent.use(child);
        parent.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });
    });


    t.test('bubble new events', function (t) {
        var child, parent;
        t.plan(2);

        child = cellophane();
        setImmediate(function () {
            child.emit('howdy', 'doody');
        });

        parent = express();
        parent.use(child);
        parent.on('howdy', function (doody) {
            t.ok(doody);
        });

        parent.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });
    });


    t.test('bubble existing event', function (t) {
        var child, parent;

        child = cellophane();
        setImmediate(function () {
            child.emit('howdy', 'doody');
        });

        parent = express();
        parent.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });
        parent.use(child);
    });


    t.test('bubble existing events', function (t) {
        var child, parent;
        t.plan(2);

        child = cellophane();
        setImmediate(function () {
            child.emit('howdy', 'doody');
        });

        parent = express();
        parent.on('howdy', function (doody) {
            t.ok(doody);
        });

        parent.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });

        parent.use(child);
    });


    t.test('capture new event', function (t) {
        var child, parent;

        child = cellophane();
        parent = express();
        parent.use(child);
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });

        child.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });
    });


    t.test('capture new events', function (t) {
        var child, parent;
        t.plan(2);

        child = cellophane();
        parent = express();
        parent.use(child);
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });

        child.on('howdy', function (doody) {
            t.ok(doody);
        });

        child.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });
    });


    t.test('capture existing event', function (t) {
        var child, parent;

        child = cellophane();
        child.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });

        parent = express();
        parent.use(child);
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });
    });


    t.test('capture existing events', function (t) {
        var child, parent;
        t.plan(2);

        child = cellophane();
        child.on('howdy', function (doody) {
            t.ok(doody);
        });

        child.on('howdy', function (doody) {
            t.ok(doody);
            t.end();
        });

        parent = express();
        parent.use(child);
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });
    });


});