var guid = require('node-uuid').v4;

module.exports = exports = function(req, res, next) {
  if (!req.cid) req.cid = guid();
  next();
};
