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

    t.test('engines', function (t) {
        var child, parent;

        function render() {
            // noop
        }

        child = cellophane();
        child.on('mount', function (mommy) {
            t.strictEqual(parent, mommy);
            t.strictEqual(child.engines['.html'], parent.engines['.html']);
            t.strictEqual(child.engines['.html'], render);

            // Child should automatically pick up any changes to parent settings.
            parent.engine('ejs', render);
            t.strictEqual(child.engines['.ejs'], parent.engines['.ejs']);
            t.strictEqual(child.engines['.ejs'], render);
        });

        parent = express();
        parent.engine('html', render);
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
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
        });

        parent.on('howdy', function (doody) {
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
        });

        parent.on('howdy', function (doody) {
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
        });

        child.on('howdy', function (doody) {
            t.equal(doody, 'doody');
            t.end();
        });
    });


    t.test('capture existing event', function (t) {
        var child, parent;

        child = cellophane();
        child.on('howdy', function (doody) {
            t.equal(doody, 'doody');
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
            t.equal(doody, 'doody');
        });

        child.on('howdy', function (doody) {
            t.equal(doody, 'doody');
            t.end();
        });

        parent = express();
        parent.use(child);
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });
    });


    t.test('existing app and capturing events', function (t) {
        var child, parent;

        child = express();
        child.on('howdy', function (doody) {
            t.equal(doody, 'doody');
            t.end();
        });

        parent = express();
        parent.use(cellophane(child));
        setImmediate(function () {
            parent.emit('howdy', 'doody');
        });
    });


    t.test('existing app and bubbling events', function (t) {
        var child, parent;

        child = express();
        setImmediate(function () {
            child.emit('howdy', 'doody');
        });

        parent = express();
        parent.use(cellophane(child));
        parent.on('howdy', function (doody) {
            t.equal(doody, 'doody');
            t.end();
        });
    });


    t.test('all parent', function (t) {
        var child, parent;
        t.plan(2);

        function assert(doody) {
            t.equal(doody, 'doody');
        }

        child = cellophane();
        child.name1 = 'child';

        parent = express();
        parent.name1 = 'parent';

        parent.on('howdy', assert);
        parent.use(child);
        parent.on('howdy', assert);

        setImmediate(function () {
            parent.emit('howdy', 'doody');
            t.end();
        });
    });


    t.test('all child', function (t) {
        var child, parent;
        t.plan(2);

        function assert(doody) {
            t.equal(doody, 'doody');
        }

        child = cellophane();
        parent = express();

        child.on('howdy', assert);
        parent.use(child);
        child.on('howdy', assert);

        setImmediate(function () {
            child.emit('howdy', 'doody');
            t.end();
        });
    });

});