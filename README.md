cellophane
----------
Transparent express app mounting.


#### Usage
```javascript
var path = require('path'),
    express = require('express');

function subapp() {
  var app = cellophane();
  app.on('foo', function (bar) {
      console.log('foo', bar);
  });
  app.on('views', function () {
      console.log(app.get('views'));
  });
}

var app = express();
app.set('views', path.join('path', 'to', 'public', 'templates');
app.use(subapp());

app.emit('foo', 'bar');
// 'foo bar'

app.emit('views');
// '/path/to/public/templates'

```
