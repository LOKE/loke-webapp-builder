var domain = require('domain');
// var onFinished = require('on-finished');
// var util = require('util');
var guid = require('node-uuid').v4;

module.exports = exports = function(req, res, next) {

  var d = domain.create();

  d.cid = req.cid;
  d.session = req.session;
  
  d.add(req);
  d.add(res);

  d.run(function() {
    next();
  });

  d.on('error', function(e) {
    next(e);
  });
};


// function resTime(req) {
//   if (!req._startAt) { return ''; }
//   var diff = process.hrtime(req._startAt);
//   var ms = diff[0] * 1e3 + diff[1] * 1e-6;
//   return ms.toFixed(3);
// }

// function fmt(req, res) {
//   var responseTime = resTime(req, res);
//   var url = req.originalUrl || req.url;

//   return util.format('HTTP %d %s %s %dms', res.statusCode, req.method, url, responseTime);
// }

// function AccessLogger(conf, logger) {
//   this._logger = logger;
// }

// /**
//  * Log an api action
//  * @param  {string} action the name of the action taken
//  * @param  {object} data
//  * @param  {object} user   user object from req.user
//  * @return {promise}
//  */
// AccessLogger.prototype.logAction = function (action, data) {
//   var d = process.domain || {};
//   var user = d.user || {};

//   this._logger.log('info', action, {
//     action: action,
//     user: {
//       id: user.id,
//       name: user.displayName,
//       email: user.email
//     },
//     actionData: data || {}
//   });
// };

// AccessLogger.prototype._requestLogger = function () {
//   var self = this;

//   return function requestLoggerMiddleware(req, res, next) {
//     req._startAt = process.hrtime();
//     var url = req.originalUrl || req.url;

//     onFinished(res, function(err) {
//       var msg = fmt(req, res);
//       var level;

//       if (err || res.statusCode >= 400) {
//         level = res.statusCode < 500 ? 'warn' : 'error';
//         if (err) {
//           self._logger.log(level, msg + ' ' + err.message, err);
//         } else {
//           self._logger.log(level, msg);
//         }
//       } else {
//         level = /^\/(api|auth)/i.test(url) ? 'info' : 'debug';
//         self._logger.log(level, msg);
//       }
//     });

//     next();
//   };
// };

// AccessLogger.prototype.setup = function () {
//   return [
//     domainer,
//     this._requestLogger()
//   ];
// };

// AccessLogger.$service = 'AccessLogger';
// AccessLogger.$inject = ['Conf', 'Logger'];
// exports.AccessLogger = AccessLogger;
