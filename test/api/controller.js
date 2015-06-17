var Q = require('q');
var builder = require('../../lib');

function create(opts) {
  opts = opts || {};
  var apiOpts = {};
  if (opts.sessionManager) {
    apiOpts.sessionManager = getSessionManager();
  }
  if (opts.cors) {
    apiOpts.cors = true;
  }

  return builder.createApiController(apiOpts)
    .get('/route1', route1)
    .get('/route2', route2)
    .get('/err1', err1)
    .get('/err2', err2)
    .done();
}


function route1() {
  return {route:'route1'};
}

function route2() {
  return Q.Promise(function(resolve) {
    setTimeout(function() {
      resolve({route:'route2'});
    },1);
  });
}

function err1() {
  throw new Error('Err1');
}

function err2() {
  return Q.Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error('Err2'));
    },1);
  });
}

function getSessionManager() {
  return {
    getSession: require('./session').getSession
  };
}

exports.create = create;
exports.default = create({sessionManager:true});
