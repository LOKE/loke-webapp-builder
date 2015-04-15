var session = require('./session');

beforeEach(function() {
  session.setAuthorized(true);
});

describe('Sync/async', function() {

  require('./syncasync');

});

describe('Errors', function() {

  require('./errors');

});

describe('Session Managers & Authorization', function() {

  require('./sessions');

});

describe('CORS', function() {

  require('./cors');

});
