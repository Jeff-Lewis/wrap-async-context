# wrap-async-context

Uses node's experimental [AsyncWrap](https://github.com/nodejs/tracing-wg/blob/master/docs/AsyncWrap/README.md)
to share 'global' data across related async operations.

## Usage:

```js
import context, { createContext } from 'wrap-async-context';

function doABunchOfAsyncThings() {
  createContext(getId(), { data: 'yay' });
  setTimeout(function() {
    doSomeOtherAsyncThing();
  }, 100);
}

// elsewhere:
function doSomeOtherAsyncThing() {
  console.log(context().data);
  // prints 'yay'
}
```

### contrived express example:

Passing a request ID to other services for logging/monitoring.

```js
import uuid from 'node-uuid';
import { createContext } from 'wrap-async-context';

app.use((req, res, next) => {
  createContext(req.headers['x-request-id'] || uuid.v4(), { req });
  next();
});

app.get('/something', (req, res) => {
  otherService.loadUser();
});

// In otherService.js:
function loadUser() {
  return fetch('http://example.com/load-user', {
    headers: { 'x-request-id': context().id },
  });
}
```
