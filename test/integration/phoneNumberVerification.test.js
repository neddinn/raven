process.env.NODE_ENV = 'test';
const chai = require('chai');
const nock = require('nock');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../../index.js');
const models = require('../../server/models/');

chai.use(chaiHTTP);

describe('Auth', () => {

  beforeEach(function (done) {
    models.PhoneNumberVerification.destroy({ where: {} }).then(() => {
      done();
    });
  });

  describe('POST /v1/authenticate', () => {
    let details = { phoneNumber: '+2347066566012' };
    it('Should not authenticate without phoneNumber', (done) => {
      chai.request(server)
        .post('/api/v1/authenticate')
        .send({})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(400);
          done();
        });
    });

    it('Should authenticate with phoneNumber', (done) => {
      chai.request(server)
        .post('/api/v1/authenticate')
        .send(details)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('requestID');

          models.Auth.findOne({ where: { requestID: res.body.requestID } })
            .then((data) => {
              data.should.be.an('object')
              data.dataValues.should.have.property('requestID').and.eql(res.body.requestID);
              data.dataValues.should.have.property('verificationCode').with.lengthOf(4);
              done();
            });
        });
    });
  });
});
