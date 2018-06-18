var Controller = require('./controller');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var errors = require('./errors');
exports.errors = require('./errors').http;

/**
 * [createApiController description]
 * @param  {ControllerOptions} opts [description]
 * @param  {Object} ctx  [description]
 * @return {Controller}      [description]
 */
exports.createApiController = function(opts, ctx) {
  opts = opts || {};
  // if (!opts) {
  //   throw new errors.generic.MissingOptionsError('Options parameter must be provided');
  // }
  // if (!opts.sessionManager || !opts.sessionManager.getSession) {
  //   throw new errors.generic.ValidationError('Session manager must be provided with options');
  // }
  if (opts.sessionManager && !opts.sessionManager.getSession) {
    throw new errors.generic.ValidationError('Session manager must implement getSession');
  }

  var sessionManager = opts.sessionManager;

  var errorHandlers = (opts.subController) ?
    require('./error-handlers').apiSubControllerHandlers(opts) :
    require('./error-handlers').apiRootControllerHandlers(opts);

  var ctrlOps = {
    sessionManager: sessionManager,
    errorHandlers: errorHandlers,
    validator: opts.validator,
    models: opts.models,
    cors: opts.cors,
    logger: opts.logger,
    domain: opts.domain,
    preRequest: opts.preRequest || [bodyParser.json(), methodOverride('X-HTTP-Method-Override')]
  };

  return new Controller(ctrlOps, ctx);
};

exports.createStaticSite = function(opts) {

};

