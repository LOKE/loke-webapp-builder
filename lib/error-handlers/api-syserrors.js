var errors = require('../errors');
var HttpSysError = errors.http.HttpSysError;

module.exports = exports = function(logger) {

  return function(err, req, res, next) {
    if (logger) logger(err);

    console.log(err);

    if (err instanceof HttpSysError) {
      res.status(err.code)
        .send({message: err.message, code: err.code, name: err.name});
    } else {
      res.status(500)
        .send({message: 'System encountered error of type: ' + err.name, code: 500, name: 'SystemError'});
    }
  };

};
