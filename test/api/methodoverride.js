var controller = require('./controller').default;
var request = require('supertest');

it('should not override method unless correct explicit headers', function (done) {
  request(controller.app)
    .post('/patch1')
    .set('X-Override', 'PATCH')
    .expect('Content-Type', /json/)
    .expect(404)
    .end(function(err, res) {
      done(err);
    });
});

it('should not override method with incorrect verb in header', function (done) {
  request(controller.app)
    .post('/patch1')
    .set('X-HTTP-Method-Override', 'DELETE')
    .expect('Content-Type', /json/)
    .expect(404)
    .end(function(err, res) {
      done(err);
    });
});

it('should support method override headers', function (done) {
  request(controller.app)
    .post('/patch1')
    .set('X-HTTP-Method-Override', 'PATCH')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect('{"route":"patch1"}')
    .end(function(err, res) {
      done(err);
    });
});
