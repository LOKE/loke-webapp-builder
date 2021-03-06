var express = require('express');
var Q = require('q');
var errors = require('./errors').http;
var strings = require('./strings');
var onFinished = require('on-finished');
var merge = require('merge');

/**
 * Creates a new application
 * @param {object} opts - Configuration options ~
 *                        cors:bool  - enable/disable cors. default=false
 *                        domain:bool - enable/disable using a domain for each request
 *                        logger:Logger - logger to use
 * @param {object} ctx  - Global context object (passed to each route handler)
 */
function Controller(opts, ctx) {
  opts =  opts || {};

  var app = express()
  .use((req, res, next) => {
    req.startTime = process.hrtime();
    next();
  });

  this._app = app;
  this._opts = opts;
  this._done = false;
  this._ctx = ctx;

  // session manager will run first
  if (opts.sessionManager) this._bindSession(app, opts.sessionManager);

  // correlation ID injected on each request
  this._bindCID(app);

  // if cors is set, then cors will be enabled for each request
  if (opts.cors) this._bindCors(app);

  // if domain is set, then domain will be started for each request
  if (opts.domain) this._bindDomain(app);

  // logger will run on each request
  if (opts.logger) this._bindLogger(app, opts.logger);

  // pre-request handlers will run before each request
  var preRequest = opts.preRequest || [];

  // bind the pre-request handlers before anything else can run
  preRequest.forEach(function(middleware) {
    app.use(middleware);
  });
}

Controller.prototype._bindSession = function(app, sessionManager) {
  app.use(function(req, res, next) {
    Q.try(function() {
      return sessionManager.getSession(req);
    })
    .then(function(session) {
      var d = process.domain || {};
      req.session = d.session = session;
      next();
    })
    .catch(function(err) {
      next(err);
    })
    .done();
  });
};

Controller.prototype._bindCID = function(app) {
  app.use(require('./middleware/correlationid'));
};

Controller.prototype._bindCors = function(app) {
  app.use(require('cors')());
};

Controller.prototype._bindDomain = function(app) {
  app.use(require('./middleware/domains'));
};

Controller.prototype._bindLogger = function(app, logger) {
  if (!logger) return;
  //if (!logger) logger = require('morgan')('combined');
  app.use(function(req, res, next) {
    function hrtimeInSeconds(hrtime) {
      return hrtime[0] + (hrtime[1] / 1e9);
    }

    onFinished(res, function(err, res) {
      const duration = hrtimeInSeconds(process.hrtime(req.startTime));
      const method = req.method.toLowerCase();
      var d = process.domain || {};
      try {
        logger(err, { status: res.statusCode, req, session: (req.session || d.session), cid: d.cid, duration, method, route: req.route, path: req.originalUrl });
      } catch(newErr) {
        console.error('Failed to log: ' + newErr.stack);
        if (err) console.error('Original error: ' + err.stack);
      }
    });
    next();
  });
};

Controller.prototype._bindNotFound = function(app) {
  app.use(function(req, res, next) {
    next(new errors.NotFound());
  });
};

Controller.prototype._bindErrorHandlers = function(app, errorHandlers) {
  errorHandlers.forEach(function(errorHandler) {
    app.use(errorHandler);
  });
};

Controller.prototype.get = function(route, handler, opts) {
  return this._use('get', route, handler, opts);
};

Controller.prototype.post = function(route, handler, opts) {
  return this._use('post', route, handler, opts);
};

Controller.prototype.put = function(route, handler, opts) {
  return this._use('put', route, handler, opts);
};

Controller.prototype.delete = function(route, handler, opts) {
  return this._use('delete', route, handler, opts);
};

Controller.prototype.patch = function(route, handler, opts) {
  return this._use('patch', route, handler, opts);
};

/**
 * App is either:
 * - Another controller
 * - A function
 * - An object containing handlers with method names defined by convention:
 *   get, getById, post, put, patch, delete
 *
 * @param  {[type]} route [description]
 * @param  {[type]} app   [description]
 * @param  {[type]} opts  [description]
 * @return {[type]}       [description]
 */
Controller.prototype.use = function(route, app, opts) {
  if (this._done) throw new Error(strings.ROUTES_LOCKED);

  if (app instanceof Controller) {
    return this._useSubcontroller(route, app);
  }

  var appType = typeof app;

  if (appType === 'function') {
    return this._use('use', route, app, opts);
  }

  if (appType === 'object') {
    return this._useHandlerSet(route, app, opts);
  }

  throw new Error(strings.UNEXPECTED_APP_TYPE + ': ' + appType);
};

Controller.prototype._useSubcontroller = function(route, app) {
  // bind the internal express app
  this._app.use(route, app.done().app);
  return this;
};

Controller.prototype._useHandlerSet = function(route, app, opts) {
  // check what handles app exposes
  if (app.get) this.get(route, app.get, merge(opts, app.get.options));
  if (app.getById) this.get(route + '/:id', app.getById, merge(opts, app.getById.options));
  if (app.post) this.post(route, app.post, merge(opts, app.post.options));
  if (app.put) this.put(route, app.put, merge(opts, app.put.options));
  if (app.delete) this.delete(route, app.delete, merge(opts, app.delete.options));
  if (app.patch) this.patch(route + '/:id', app.patch, merge(opts, app.patch.options));

  return this;
};

Controller.prototype._use = function(method, route, handler, opts) {
  if (this._done) throw new Error(strings.ROUTES_LOCKED);

  var validator = this._opts.validator;
  var models = this._opts.models;
  var authorize = !!(this._opts.sessionManager);

  opts = opts || {};
  if (opts.validate && !validator) {
    throw new Error('Options for route '+route+' require validation, but no validator provided');
  }
  if (opts.cast && !models) {
    throw new Error('Options for route '+route+' require cast, but no models provider available');
  }

  var ctx = this._ctx;
  this._app[method](route, function (req, res, next) {
    req.route = route;
    Q.try(function() {
      return (authorize) ?
        req.session.authorize(opts) :
        true;
    })
    .fail(function(err) {
      throw new errors.Unauthorized(err.message);
    })
    .then(function() {
      // if specified validate the body first

      if (opts.validate) {
        validator.validate(req.body, opts.validate);
      }
      if (opts.cast) {
        req.body = models.create(opts.cast, req.body);
      }
      return handler(req, req.session, ctx, opts);
    })
    .then(function(response) {
      res.send(response);
    })
    .fail(function(err) {
      next(err);
    })
    .done();
  });
  return this;
};

/**
 * [done description]
 * @return {Function} [description]
 */
Controller.prototype.done = function() {
  if (this._done) return this;

  var app = this._app;
  var opts = this._opts;

  delete this._app;
  delete this._opts;

  // this will throw a 404 error if no other route has handled it
  this._bindNotFound(app);

  var postRequest = opts.postRequest || [];

  postRequest.forEach(function(middleware) {
    app.use(middleware);
  });

  if (opts.errorHandlers) this._bindErrorHandlers(app, opts.errorHandlers);

  Object.defineProperty(this, 'app', {get: function() {return app;}});

  this._done = true;

  return this;
};

Controller.prototype.listen = function(port) {
  var app = this.done().app;
  return Q.ninvoke(app, 'listen', port);
};

Controller.prototype.errors = errors;

module.exports = exports = Controller;
