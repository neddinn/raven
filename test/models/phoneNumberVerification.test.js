/* jshint esversion: 6 */
'use strict';


const models = require('../../server/models/');
const should = require('should');

describe('PhoneNumberVerification', function () {
  const mockAuthData = {
    requestID: '12345678987654321',
    verificationCode: '1234',
    phoneNumber: '+2347000000000',
  };

  beforeEach(function (done) {
    models.PhoneNumberVerification.destroy({ where: {} }).then(() => {
      done();
    });
  });

  describe('Create', () => {
    it('should create auth data', (done) => {
      models.PhoneNumberVerification.create(mockAuthData)
        .then((data) => {
          should.exist(data);
          data.requestID.should.equal(mockAuthData.requestID);
          data.verificationCode.should.equal(mockAuthData.verificationCode);
          data.phoneNumber.should.equal(mockAuthData.phoneNumber);
        })
        .then(() => models.PhoneNumberVerification.findOne({ where: { requestID: mockAuthData.requestID } }))
        .then((data) => {
          data.should.be.an('object');
          data.should.have.property('requestID');
          data.should.have.property('verificationCode');
          data.requestID.should.equal(mockAuthData.requestID);
          data.verificationCode.should.equal(mockAuthData.verificationCode);
          data.phoneNumber.should.equal(mockAuthData.phoneNumber);
          done();
        });
    });
  });

  describe('Delete', () => {
    it('should be able to delete auth data', (done) => {
      models.PhoneNumberVerification.create(mockAuthData).then((createdAuth) => {
        createdAuth.destroy().then(function () {
          models.PhoneNumberVerification.findOne({
            where: {
              requestID: createdAuth.requestID
            }
          }).then(function (user) {
            should.not.exist(user);
            done();
          });
        });
      });
    });
  });


});
