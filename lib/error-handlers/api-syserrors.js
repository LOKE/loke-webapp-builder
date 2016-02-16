var errors = require('../errors');
var HttpSysError = errors.http.HttpSysError;

module.exports = exports = function(logger) {

  return function(err, req, res, next) {
    var d = process.domain || {};
    var session = req.session || d.session;
    var cid = d.cid;

    if (logger) logger(err, req, session, cid);
    else console.log(err.stack);

    if (err instanceof HttpSysError) {
      res.status(err.code)
        .send({message: err.message, code: err.code, name: err.name});
    } else {
      res.status(500)
        .send({message: 'System encountered error of type: ' + err.name, code: 500, name: 'SystemError'});
    }
  };

};
