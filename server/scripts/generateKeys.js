/* jshint esversion: 6 */

const logger = require('winston');
const models = require('../models/');

const Crypto = require('../lib/crypto');
const util = require('../util');
const numberOfKeys = 5;

const generate = () => {

  const randomNo = (Math.floor(Math.random() * (9**8 - (3**7 + 1))) + 3**7);
  const hash = new Date().getTime() + randomNo;

  return Crypto.generateKeys({ id: hash}).then((keys) =>
    models.Key.create({ privateKey: keys.privateKey, publicKey: keys.publicKey })
  );
};

async function process() {
  for (var i = 0; i < 5; i++) {
    await generate();
  }
  logger.log('Done!');
}


process();