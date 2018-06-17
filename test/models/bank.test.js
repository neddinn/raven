'use strict';

const models = require('../../server/models/');
const chai = require('chai');
const should = chai.should();

describe('Bank', () => {
  let mockBank;
  beforeEach((done) => {
    mockBank = {
      'id': '3',
      'code': '122',
      'name': 'STANBIC IBTC',
      'accountNumber': '0699890809051201',
    };
    models.Bank.destroy({ where: {} }).then(() => {
      done();
    });
  });

  afterEach((done) => {
    models.Bank.destroy({ where: {} }).then(() => {
      done();
    });
  });

  describe('CRUD', () => {
    it('should create a bank', (done) => {
      models.Bank.create(mockBank).then((bank) => {
        should.exist(bank);
        bank.accountNumber.should.equal(mockBank.accountNumber);
        bank.code.should.equal(mockBank.code);
        bank.name.should.equal(mockBank.name);
        done();
      });
    });
  
    it('should not create two bank with same uid', (done) => {
      models.Bank.create(mockBank).then((bank) => {
        models.Bank.create(mockBank).catch((err) => {
          should.exist(err);
          err.message.should.equal('Validation error');
          err.errors[0].message.should.equal('id must be unique');
          done();
        });
      });
    });
  
    it('should be able to find a bank', (done) => {
      models.Bank.create(mockBank).then((createdBank) => {
        models.Bank.findOne({
          where: {
            id: createdBank.id
          }
        }).then((bank) => {
          should.exist(bank);
          bank.accountNumber.should.equal(mockBank.accountNumber);
          done();
        });
      });
    });
  
    it('should be able to delete a bank', (done) => {
      models.Bank.create(mockBank).then((createdBank) => {
        createdBank.destroy().then(() => {
          models.Bank.findOne({
            where: {
              id: createdBank.id
            }
          }).then((bank) => {
            should.not.exist(bank);
            done();
          });
        });
      });
    });
  });

  describe('Associations', () => {
    const mockUser = {
      'id': '3',
      'phoneNumber': '+2348012345678',
      'fullName': "John",
      'profilePictureURL': 'http://john-doe-url.com',
      'email': 'john@gmail.com',
      'pin': '1234'
    };
    beforeEach(done => {
      models.User.create(mockUser).then(user => {
        should.exist(user);
        user.email.should.equal(mockUser.email);
        user.phoneNumber.should.equal(mockUser.phoneNumber);
        done();
      });
    });

    it('Bank should have user field', done => {
      mockBank.userId = mockUser.id;
      models.Bank.create(mockBank).then(createdBank => {
        should.exist(createdBank);
        // createdBank.should.have.property('userId').and.eql(mockUser.id);
        models.Bank.findOne({
          where: {
            id: createdBank.id
          },
          include: [ { model: models.User } ]
        }).then(bank => {
          should.exist(bank);
          done();
        });
        done();
      });
    });

  });

});
