var domain = require('domain');

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
