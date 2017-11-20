'use strict';

var models = require('../../server/models/');
var should = require('should');

describe('Auth', function() {
  var mockAuthData;
  beforeEach(function(done) {
    mockAuthData = {
      'requestID': '3',
      'verificationCode': '+2348012345678'
    }
    models.Auth.destroy({where: {}}).then(function() {
      done();
    });
  });

  afterEach(function(done) {
    models.Auth.destroy({where: {}}).then(function() {
      done();
    });
  });

  it('should create auth data', function(done) {
    models.Auth.create(mockAuthData).then(function(data) {
      should.exist(data);
      data.requestID.should.equal(mockAuthData.requestID);
      data.verificationCode.should.equal(mockAuthData.verificationCode);
      done();
    });
  });

  it('should be able to delete auth data', function(done) {
    models.Auth.create(mockAuthData).then(function(createdAuth) {
      createdAuth.destroy().then(function() {
        models.Auth.findOne({
          where : {
            requestID: createdAuth.requestID
          }
        }).then(function(user) {
          should.not.exist(user);
          done();
        });
      });
    });
  });

});
