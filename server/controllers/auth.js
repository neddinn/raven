/* jshint esversion: 6 */

const logger = require('winston');
const jwt = require('jsonwebtoken');
const models = require('../models/');

const env = process.env.NODE_ENV || 'development';
const test = require('../config/config');
const secret = require('../config/config')[env]['secret'];
const Pigeon = require('../lib/pigeon');
const util = require('../util');

const maxCodeNumber = 9999;
const minCodeNumber = 1000;
const typeKey = {
  sms: 'sendSms',
  call: 'makeCall',
};

const generateVerificationCode =
  () => Math.floor(Math.random() * (maxCodeNumber - (minCodeNumber + 1))) + minCodeNumber;

const token = {
  sign: (data, expiry) => jwt.sign(data, secret, { algorithm: 'HS256', expiresIn: expiry }),
  verify: (data) => jwt.verify(data, secret),
};


module.exports = {
  authenticate: (req, res) => {
    if (!req.body.phoneNumber) {
      return res.status(400).json({
        message: 'phoneNumber is required',
      });
    }

    const { phoneNumber } = req.body;
    const verificationCode = generateVerificationCode();
    const type = req.body.type || 'sms';
    const operation = typeKey[type] || 'sendSms';
    const requestID = token.sign({ phoneNumber, verificationCode }, '5 minutes');
    const message = `Your verification code is ${verificationCode}`;

    models.PhoneNumberVerification.create({ requestID, verificationCode, phoneNumber })
      .then((data) => Pigeon[operation](phoneNumber, message))
      .then((result) => {
        if (result) {
          return res.status(200).json({ requestID });
        }
        return res.status(500).send('Error sending message');
      })
      .catch(util.handleError(res));
  },

  resend: (req, res) => {
    const { phoneNumber } = req.body;
    const _this = this;

    models.PhoneNumberVerification.findOne({ where: { phoneNumber } })
      .then(util.handleEntityNotFound(res))
      .then(data => data.destroy())
      .then(() => _this.authenticate(req, res))
      .catch(util.handleError(res));
  },

  verify: (req, res) => {
    if (!req.body.requestID || !req.body.verificationCode) {
      res.status(400).json({ message: 'Invalid request' });
    }

    models.PhoneNumberVerification.findOne({
      where: {
        requestID: req.body.requestID,
        verificationCode: req.body.verificationCode,
      },
    })
      .then(util.handleEntityNotFound(res))
      .then((data) => {
        if (!data) return;
        const decoded = token.verify(data.requestID);
        if (!decoded || !decoded.phoneNumber || decoded.phoneNumber !== data.phoneNumber) {
          return res.status(404).json(err);
        }

        data.destroy()
          .then(data => models.User.findOrCreate({ where: { phoneNumber: data.phoneNumber }, defaults: { phoneNumber: data.phoneNumber } }))
          .spread((data, created) => {
            if (created) {
              return Crypto.generateKeys(data).then((keys) =>
                data.update({ privateKey: keys.privateKey, serverKey: keys.publicKey }));
            }
            return data;
          })
          .then((data) => {
            res.status(200).json({
              user: { id: data.id, phoneNumber: data.phoneNumber, serverKey: data.serverKey },
              authToken: token.sign({ userId: data.id, phoneNumber: data.phoneNumber }),
            });
          });
      })
      .catch(util.handleError(res));
  },

  handshake: (req, res) => {
    if (!req.body.clientKey) {
      return res.status(400).json({
        message: 'client key is required',
      });
    }
    const { clientKey } = req.body;
    const user = req.user;

    models.User.findById(user.id)
      .then(util.handleEntityNotFound(res))
      .then((user) => {
        if (!user) return;
        return user.update({ clientKey, }).then((data) => res.status(200).json({ serverKey: data.serverKey }));
      })
      .catch(util.handleError(res));
  },
};
