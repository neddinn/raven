process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../../index.js');
const models = require('../../server/models/');

chai.use(chaiHTTP);


describe('Users', () => {
  beforeEach((done) => {
    models.User.destroy({ where: {} }).then(() => done());
  });


  describe('/GET /v1/users/{userId}', () => {
    it('Should get all users', (done) => {
      chai.request(server)
        .get('/api/v1/users')
        .end((err, res) => {
          should.not.exist(err);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        })
    });
  });


  describe('/PUT /v1/users/{userId}', () => {
    let userDetails = { phoneNumber: '+2347066566012' };

    beforeEach((done) => {
      models.User.create(userDetails).then((data) => {
        userDetails.id = data.id;
        done()
      })
    });

    it('Should update a user', (done) => {
      chai.request(server)
        .put('/api/v1/users/' + userDetails.id)
        .send({ email: 'test@email.com' })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('phoneNumber');
          res.body.should.have.property('email');
          res.body.phoneNumber.should.eql(userDetails.phoneNumber);
          res.body.email.should.eql('test@email.com');
          done();
        })
    });
  });
})
