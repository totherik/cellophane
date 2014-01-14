#### cellophane
Transparent express app mounting.


#### Usage
```javascript
var express = require('express');

function subapp() {
  var app = cellophane();
  app.on('foo', function (bar) {
      console.log('foo', bar);
  });
}

var app = express();
app.use(subapp());
app.emit('foo', 'bar');
// 'foo bar'

```