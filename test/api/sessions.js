var controller = require('./controller').default;
var request = require('supertest');

it('should return 401 if auth fails', function (done) {

  require('./session').setAuthorized(false);
  request(controller.app)
    .get('/route1')
    .expect('Content-Type', /json/)
    .expect(401)
    .expect('{"message":"You shall not pass","name":"UnauthorizedError","code":401}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });

});
