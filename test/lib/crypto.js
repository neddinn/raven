process.env.NODE_ENV = 'test';
const chai = require('chai');
const nock = require('nock');
const should = chai.should();
const Crypto = require('../../server/lib/crypto');

let pubKey;
let privKey;

describe('PGP', () => {
  // TODO: Add more tests for edge cases
  
  describe('Generate keys', () => {
    xit('should generate keys with valid object', done => {
      const opt = { userId: 20 };
      Crypto.generateKeys(opt).then((keys) => {
        keys.should.have
          .property('privateKey')
          .and.match(/^-----BEGIN PGP PRIVATE/);
        keys.should.have
          .property('publicKey')
          .and.match(/^-----BEGIN PGP PUBLIC/);
        pubKey = keys.publicKey;
        privKey = keys.privateKey;
        done();
      });
    });
  });

  describe('Encrypt & Decrypt', () => {
    let encryptedData;
    const testData = 'This is a test data';
    xit('Should encrypt with public key', done => {
      Crypto.encrypt(testData, pubKey)
        .then((data) => {
          should.exist(data);
          data.should.match(/^-----BEGIN PGP MESSAGE/);
          encryptedData = data;
          done();
        });
    });

    xit('Should decrypt with private key', done => {
      Crypto.decrypt(encryptedData, privKey)
        .then((data) => {
          should.exist(data);
          data.should.eql(testData);
          done();
        });
    });
  });
});
