'use strict';

const models = require('../../server/models/');
const chai = require('chai');
const should = chai.should();

describe('User', () => {
  let mockUser;
  beforeEach((done) => {
    mockUser = {
      'id': '3',
      'phoneNumber': '+2348012345678',
      'fullName': "John",
      'profilePictureURL': 'http://john-doe-url.com',
      'email': 'john@gmail.com',
      'pin': '1234'
    };
    models.User.destroy({ where: {} }).then(() => {
      done();
    });
  });

  afterEach((done) => {
    models.User.destroy({ where: {} }).then(() => {
      done();
    });
  });

  it('should create a user', (done) => {
    models.User.create(mockUser).then((user) => {
      should.exist(user);
      user.email.should.equal(mockUser.email);
      user.phoneNumber.should.equal(mockUser.phoneNumber);
      done();
    });
  });

  it('should not create two users with same uid', (done) => {
    models.User.create(mockUser).then((user) => {
      models.User.create(mockUser).catch((err) => {
        should.exist(err);
        err.message.should.equal('Validation error');
        err.errors[0].message.should.equal('id must be unique');
        done();
      });
    });
  });

  it('should be able to update a user', (done) => {
    models.User.create(mockUser).then((user) => {
      let newPhoneNumber = "+23490000000";
      user.phoneNumber = newPhoneNumber;
      user.save().then((user) => {
        should.exist(user);
        user.phoneNumber.should.not.equal(mockUser.phoneNumber);
        user.phoneNumber.should.equal(newPhoneNumber);
        done();
      });
    });
  });

  it('should be able to find a user', (done) => {
    models.User.create(mockUser).then((createdUser) => {
      models.User.findOne({
        where: {
          id: createdUser.id
        }
      }).then((user) => {
        should.exist(user);
        user.phoneNumber.should.equal(mockUser.phoneNumber);
        done();
      });
    });
  });

  it('should be able to delete a user', (done) => {
    models.User.create(mockUser).then((createdUser) => {
      createdUser.destroy().then(() => {
        models.User.findOne({
          where: {
            id: createdUser.id
          }
        }).then((user) => {
          should.not.exist(user);
          done();
        });
      });
    });
  });

  // TODO: Add test for new user fields

});
