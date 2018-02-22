/* jshint esversion: 6 */

const config = require('../config/config')[env];
const passphrase = config.crypto.passphrase;
const openpgp = require('openpgp');
openpgp.config.aead_protect = true;

// TODO: create worker for this

let Crypto = {};

Crypto.generateKeys = (data) => {
  var options = {
    userIds: [data],
    numBits: 4096,         // RSA key size
    passphrase,           // protects the private key
  };
  return openpgp.generateKey(options)
    .then((key) =>
      ({
        privateKey: key.privateKeyArmored,
        publickey: key.publicKeyArmored
      })
    );
};

Crypto.encrypt = (data, pubkey) => {

  const options = {
    data,
    publicKeys: openpgp.key.readArmored(pubkey).keys,
  };

  return openpgp.encrypt(options).then((ciphertext) => ciphertext.data);
};

Crypto.decrypt = (encrypted, privkey) => {

  const options = {
    message: openpgp.message.readArmored(encrypted),
    privateKey: openpgp.key.readArmored(privkey).keys[0],
  };

  openpgp.decrypt(options).then((plaintext) => plaintext.data);
};



module.exports = Crypto;