/* Raven messaging service */

const Nexmo   = require('nexmo');
      env     = process.env.NODE_ENV || 'development',
      config  = require('../config/config')[env];

const nexmo = new Nexmo({
    apiKey: config.nexmo.API_KEY,
    apiSecret: config.nexmo.API_SECRET,
    applicationId: config.nexmo.APP_ID,
    privateKey: config.nexmo.PRIVATE_KEY_PATH,
  }, {});

const sender = config.nexmo.FROM_NUMBER;

let Pigeon = function(phoneNumber, message) {
  this.phoneNumber = phoneNumber;
  this.message = message;
};

Pigeon.prototype.sendSms = function(cb) {
  nexmo.message.sendSms(sender, this.phoneNumber, this.message, {}, cb);
};

Pigeon.prototype.call = function(cb) {
  nexmo.calls.create({
    to: [{
      type: 'phone',
      number: this.phoneNumber
    }],
    from: {
      type: 'phone',
      number: sender
    },
    answer_url: ['ANSWER_URL']
  }, cb);
};
