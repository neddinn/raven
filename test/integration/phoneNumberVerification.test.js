process.env.NODE_ENV = 'test';
const chai = require('chai');
const nock = require('nock');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../../index.js');
const models = require('../../server/models/');

chai.use(chaiHTTP);

describe('PhoneNumberVerification', () => {

  beforeEach(function (done) {
    models.PhoneNumberVerification.destroy({ where: {} }).then(() => {
      done();
    });
  });


  describe('/api/v1/authenticate', () => {

    let details = { phoneNumber: '+2347066566012' };
    it('Should not authenticate without phoneNumber', (done) => {
      chai.request(server)
        .post('/api/v1/authenticate')
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(400);
          done();
        });
    });

    it('Should authenticate with phoneNumber', (done) => {
      nock('http://api.africastalking.com')
        .post('/version1/messaging')
        .reply(201, {
          status: 201,
          statusText: 'Created',
          name: 'Stephen'
        });

      chai.request(server)
        .post('/api/v1/authenticate')
        .send(details)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('requestID');

          models.PhoneNumberVerification.findOne({ where: { requestID: res.body.requestID } })
            .then((data) => {
              data.should.be.an('object')
              data.dataValues.should.have.property('requestID').and.eql(res.body.requestID);
              data.dataValues.should.have.property('verificationCode').with.lengthOf(4);
              done();
            });
        });
    });

    it('Should fail when sms service returns error', (done) => {
      nock('http://api.africastalking.com')
        .post('/version1/messaging')
        .reply(400, {
          status: 400,
        });

      chai.request(server)
        .post('/api/v1/authenticate')
        .send(details)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(500);
          res.body.should.not.have.property('requestID');
          done();
        });
    });

  });

  describe('/api/v1/verify', () => {
    it('Should not verify without required fields', (done) => {
      chai.request(server)
        .post('/api/v1/verify')
        .send({})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(400);
          res.body.should.not.have.property('user');
          res.body.should.not.have.property('authToken');
          res.body.should.have.property('message').and.eql('Invalid request');
          done();
        });
    });


    it('Should not verify without proper fields', (done) => {
      let details = { verificationCode: '1234', requestID: '00000000' };
      chai.request(server)
        .post('/api/v1/verify')
        .send(details)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(404);
          res.body.should.not.have.property('user');
          res.body.should.not.have.property('authToken');
          done();
        });
    });
  });


});