var errors = require('../errors');
var HttpAppError = errors.http.HttpAppError;

function isHttpError(err) {
  return err instanceof HttpAppError;
}

module.exports = exports = function(BaseAppError, logger) {

  var isBaseError = BaseAppError ?
    Array.isArray(BaseAppError) ?
      // BaseAppError is an array of errors
      function(err) {
        return BaseAppError.some(function(ErrType) {
          return err instanceof ErrType;
        });
      } :
      // BaseAppError is a single errors
      function(err) {
        return err instanceof BaseAppError;
      } :
    // BaseAppError is not defined
    function() {
      return false;
    };


  return function(err, req, res, next) {
    var d = process.domain || {};
    var session = req.session || d.session;
    var cid = d.cid;

    if (isHttpError(err)) {

      if (logger) logger(err, req, session, cid);
      res.status(err.code).send(err);

    } else if (isBaseError(err)) {

      if (logger) logger(err, req, session, cid);
      res.status(400).send(err);

    } else {

      next(err);

    }

  };

};
