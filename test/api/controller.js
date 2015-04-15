var Q = require('q');
var builder = require('../../lib');
var controller = builder.createApiController({sessionManager:getSessionManager()})
    .get('/route1', route1)
    .get('/route2', route2)
    .get('/err1', err1)
    .get('/err2', err2)
    .done();

module.exports = controller;


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
