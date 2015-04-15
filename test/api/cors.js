var controller = require('./controller').default;
var request = require('supertest');

it('should have CORS off by default', function (done) {
  request(controller.app)
    .get('/route1')
    .expect('Access-Control-Allow-Origin', '*')
    .end(function(err, res){
      if (err) {
        if (err.message == 'expected "Access-Control-Allow-Origin" header field') {
          done();
        } else {
          done(err);
        }
      } else {
        done(new Error('Expected to fail!'));
      }
    });

});

it('should have CORS ON when requested', function (done) {
  var controller2 = require('./controller').create({cors:true});
  request(controller2.app)
    .get('/route1')
    .expect('Access-Control-Allow-Origin', '*')
    .end(function(err, res){
      if (err) throw err;
      done();
    });

});
