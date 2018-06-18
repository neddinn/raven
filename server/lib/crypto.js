/* jshint esversion: 6 */

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const passphrase = config.crypto.passphrase;
const openpgp = require('openpgp');
openpgp.config.aead_protect = true;
openpgp.config.use_native = false;
openpgp.initWorker({ path: 'worker/openpgp.worker.js' });

let Crypto = {};

Crypto.generateKeys = async (data) => {
  const options = {
    userIds: [data],
    numBits: 4096,         // RSA key size
    passphrase,           // protects the private key
  };
  const key = await openpgp.generateKey(options);
  return {
    privateKey: key.privateKeyArmored,
    publicKey: key.publicKeyArmored,
  }
};

Crypto.encrypt = async (data, pubkey) => {
  const options = { data, publicKeys: openpgp.key.readArmored(pubkey).keys, };
  const ciphertext = await openpgp.encrypt(options);
  return ciphertext.data;
};

Crypto.decrypt = async (encrypted, privkey) => {
  let privateKey = openpgp.key.readArmored(privkey).keys[0];
  await privateKey.decrypt(passphrase);
  const options = { message: openpgp.message.readArmored(encrypted), privateKey, };
  const plaintext = await openpgp.decrypt(options);
  return plaintext.data;
};

const encryptDecryptArray = (obj, operation) => {
  var {data, key, fields} = obj;
  
  const promises =  data.map(async (obj) => {
    for (let field of fields) {
      let value = await Crypto[operation](obj[field], key);
      obj[field] = value;
    }
    return obj;
  });

  return Promise.all(promises);
};

Crypto.decryptObjectArray = (obj) => {
  return encryptDecryptArray(obj, 'decrypt');
};

Crypto.encryptObjectArray = (obj) => {
  return encryptDecryptArray(obj, 'encrypt');
};

const encryptDecryptObject = async (obj, operation) => {
  var {data, key, fields} = obj;
  for (let field of fields) {
    let value = await Crypto[operation](data[field], key);
    data[field] = value;
  }
  return data;
};

Crypto.decryptObject = (obj) => {
  return encryptDecryptObject(obj, 'decrypt');
};

Crypto.encryptObject = (obj) => {
  return encryptDecryptObject(obj, 'encrypt');
};

module.exports = Crypto;