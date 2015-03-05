var errors = require('../errors');
var HttpAppError = errors.http.HttpAppError;

module.exports = exports = function(BaseAppError, logger) {

  return function(err, req, res, next) {

    if (err instanceof HttpAppError) {
      if (logger) logger(err);
      res.status(err.code).send(err);

    } else if (BaseAppError && err instanceof BaseAppError) {
      if (logger) logger(err);
      res.status(400).send(err);

    } else {
      next(err);
      
    }

  };

};
