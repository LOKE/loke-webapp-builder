# Web App Builder

Request tracking (requests in progress)

Middleware to drop connections

Middleware to block connections on disable

Versioning of API

Route groups (define group of routes)

Correlation ID

Opinionated framework for building API based express apps.

Soon: build web applications too.

*NOTE: this is not intended to be a flexible framework for building APIs in a variety of manners. It is an opinionated framework for building APIs using express in a consistent and maintainable manner.*

## Overview & Usage

Building an express app using the builder at a basic level is much the same as building an express app:

```js
var expressBuilder = require('express-builder');

expressBuilder.createApiController()
.get('/route1', require('./routeHandler1'))
.get('/route2', require('./routeHandler2'))
.listen(3000)
.then(function() {
    console.log('started!');
});
```

## So what's different?

### Defining Routes

Use .get .post .put .patch and .delete to bind a route handler.

The function signature for each is ```function(route, handler, opts)``` where opts are route options intended for use in the session manager (see below). Examples of route options are `allowAnonymous` to bypass authentication requirement and `requireRole` to limit a routes usage to certain roles or permissions. Eg:

```js
.post('/login', require('./login'), {allowAnonymous:true})
.get('/private', require('./private'), {requireRole:'admin'})
```

To bind a subcontroller use the `.bind` method.
```js
var submodule = builder.createApiController()
  .get('/', require('./submodule'));

var submodule = builder.createApiController()
  .get('/', require('./mainmodule'))
  .bind('/submodule', submodule);
```

NOTE: all methods are chainable except for `.listen` which returns a promise once the server is started;

### Defining Submodules

### Route Handlers

In express a route handler has a function signature ```function(req, res, next)```.

Using the app builder:

#### Basic Route Handlers

The simplest route handlers have a function signature ```function(req)``` and simply either return a value or a promise.

**This will always return a 2xx status code.**

To return an error status code, simply *throw an error* (or return a rejected promise);

```js
var routeHandler1 = function(req) {
    var response = doStuff(req);
    return response;
};

var routeHandler2 = function(req) {
    var deferred = Q.defer();
    setTimeout(function() {
        deferred.resolve({result:true});
    },1000);
    return deferred.promise;
};
```

### Extended Route Handlers

Route handles also have access to session information, and global context information.

The full function signature is ```function(req, session, ctx)``` where `session` is the authenticated users session object (see Session Managers below), and `ctx` is the optional controller context supplied on controller creation (see Controller Context below).

Having the session and context available in the function signature allows route handlers to be completely stateless and can thus be defined as static modules/methods.

### Pre-route Middleware

All defined **pre-route middleware** are run after the session manager and before the route handler for each route in a controller.

The intended purpose of pre-route middleware is to allow for:
1. additional information to be retrieved and injected into the request object.
2. global checking of the request object.

The function signature for pre-route middleware is the same as a route handler: ```function(req, session, ctx)```.

Pre-route middleware are run in the same order that they are defined. If the middleware returns a promise the next middleware or route will not be run until the promise resolves.

If the middleware throws an error (or returns a rejected promise) the route handler will not be executed and the error will be passed straight through to the error handlers.

To include the pre-route middleware in a controller:

```js
var controller = builder.createApiController({
    preroute:[middleware1, middleware2]
})
```

### Post-route Middleware

All defined **post-route middleware** are run after the route handler (if it completed successfully).

The intended purpose of pre-route middleware is to allow for:
1. globally check the response value before returning to the user (last chance to throw an error).
2. alter or inject additional data into the response value, for example removing sensitive information, or adding global values
3. map the response value into a completely different value, for example wrapping in an array

The function signature for post-route middleware is : ```function(val, session, ctx)```.

Post-route middleware are run in the same order that they are defined. If the middleware returns a promise the next middleware or route will not be run until the promise resolves.

If the middleware returns a value (directly or via a resolved promise) this will be used as a new response value and will also be passed to any further middleware in the chain.

If the middleware throws an error (or returns a rejected promise) the response value will be discarded and the error will be passed straight through to the error handlers.

To include the post-route middleware in a controller:

```js
var controller = builder.createApiController({
    postroute:[middleware1, middleware2]
})
```

## Error Handling & Responses

Throwing an error response (or returning a rejected promise) is all that is required to return an error response.

Unless otherwise specified, errors will return a HTTP 500 status code, and the error message will be hidden from the user - only the type will be displayed.

### 4xx Error Codes

4xx error codes will be returned if either:
1. The error is an instance of HttpAppError (err instanceof HttpAppError must be true). This will return a HTTP status code matching the error type.
2. The error is an instance of the supplied BaseAppError (provided via the createApiController). This will return a HTTP 400 status code.

HttpAppError is available via require('app-builder').HttpAppError. Extensions of this error type are BadRequest, Unauthorized, PaymentRequired, Forbidden, NotFound.

BaseAppError is defined when calling , thus any error thrown that extends from this will cause a 400 response code.

### Custom error handlers - altering the error type

Sometimes we may want to alter a domain or infrastructure service error type so that it will result in a more restful response. Custom error handlers can provide this.

The function signature is ```function(err, session, ctx)```. Either throw or return a new error to alter the response.

For example, the following handler identifies DatabaseRecordNotFound errors that would result in a 500 response and returns the HTTP NotFound error that will result in a 404 response.

```js
function (err) {
    if (err.name === 'DatabaseRecordNotFound') {
        throw new errors.NotFound();
    }
}
```

Custom error handlers are run in the order they are provided.

To include the custom error handlers in a controller:

```js
var controller = builder.createApiController({
    errorHandlers:[handler1, handler2]
})
```

## Session Management

If a session manager is provided, then it's `getSession(req)` method will be called at the start of each request. This method should return a session either directly or via a promise. This session object will be passed to each of the handlers.

The session object must expose a method `authorize(routeOpts)` that throws an error (or returns a failed p)

To include the custom error handlers in a controller:

```js
var controller = builder.createApiController({
    sessionManager: mySessionManager
})
```

## Controller Context

The intent of the controller context is to pass scope to various handlers. This allows a shared/static handler or external module to access global scope information and services.

You provide the optional context object as the second argument when creating a controller:

```
var ctx = {
  config: getConfig(),
  db: getDbRepos()
};

var controller = builder.createApiController(opts, ctx)
  .get('/handler', require('./handler'));
```

...then in handler.js...
```js
module.exports = function(req, session, ctx) {
  var config = ctx.config;
  var db = services.db;
};
```

## Logging

Two types of logging are provided: request logging and error logging.

Request logging occurs at the start of every request and occurs *after the session manager*. This is so the session information can be provided with the log event.

Error logging occurs when an error has been responded to, so if the error has changed types the logged error will be the resulting one, not the originally thrown one.

*TODO: the request ID should be added to the domain so that internal errors can be tracked*

A request ID is provided with the request metadata, and a session is also attached to each log call that errors to be matched up to their original requests.

### Request Logger

Function signature ```function(err, {status, req, session, cid, duration, method, path, route})```

TODO: this should probably actually be done at the end so the status code can be included.

To include a request logger in a controller:

```js
var logger = function(err, status, req, session, cid) {
    console.log('Request ['+status+'] ');
};

var controller = builder.createApiController({
    logger: logger
});
```


### Error Logger

Function signature ```function(err, req, session, cid)```

Where err is the resulting error.

To include an error logger in a controller:

```js
var logger = function(err, req, session) {
    console.error('Request error:', meta, err.stack);
};

var controller = builder.createApiController({
    errorLogger: logger
});
```

## Order

Unlike express, it is not necessary to bind error handlers before routes. The builder will automatically apply all forms of middleware at the correct time.

Actual routes must be defined in the correct order however.
