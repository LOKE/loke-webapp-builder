var Q = require('q');

module.exports = exports = function(customHandlers, logger) {

  customHandlers = customHandlers || [];

  return function(err, req, res, next) {
    var promiseChain = Q();

    // build a promise chain to work through each one
    customHandlers.forEach(function(handler) {
      promiseChain = promiseChain.then(function () {
        return Q.when(handler(err)).then(function (newErr) {
          // this will cause the promise chain to skip straight to a fail
          if (newErr) throw newErr;
        });
      });
    });

    promiseChain.then(function() {
      // the error wasn't altered
      next(err);
    })
    .fail(function (newErr) {
      // the error was altered
      next(newErr);
    })
    .done();

  };

};
