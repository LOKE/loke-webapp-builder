var controller = require('./controller').default;
var request = require('supertest');

it('should handle errors thrown in handler', function(done) {
  request(controller.app)
    .get('/err1')
    .expect('Content-Type', /json/)
    .expect(500)
    .expect('{"message":"System encountered error of type: Error","code":500,"name":"SystemError"}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });
});

it('should handle errors thrown inside promise', function(done) {
  request(controller.app)
    .get('/err2')
    .expect('Content-Type', /json/)
    .expect(500)
    .expect('{"message":"System encountered error of type: Error","code":500,"name":"SystemError"}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });
});

it('should return not found + json message for undefined routes', function(done) {
  request(controller.app)
    .get('/nosuchroute')
    .expect('Content-Type', /json/)
    .expect(404)
    .expect('{"message":"Resource not found","name":"NotFoundError","code":404}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });
});
