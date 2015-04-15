var controller = require('./controller');
var request = require('supertest');

it('should work with SYNC methods', function (done) {
  request(controller.app)
    .get('/route1')
    .expect('Content-Type', /json/)
    .expect('Content-Length', '18')
    .expect(200)
    .expect('{"route":"route1"}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });

});

it('should work with ASYNC methods', function (done) {
  request(controller.app)
    .get('/route2')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('{"route":"route2"}')
    .end(function(err, res){
      if (err) throw err;
      done();
    });

});
