/* jshint esversion: 6 */

const logger = require('winston');
const jwt = require('jsonwebtoken');
const models = require('../models/');

const env = process.env.NODE_ENV || 'development';
const test = require('../config/config');
const secret = require('../config/config')[env]['secret'];
const Pigeon = require('../lib/pigeon');

const maxCodeNumber = 9999;
const minCodeNumber = 1000;
const typeKey = {
  sms: 'sendSms',
  call: 'makeCall',
};

const generateVerificationCode =
  () => Math.floor(Math.random() * (maxCodeNumber - (minCodeNumber + 1))) + minCodeNumber;

const handleError = (res, statusCode) => ((err) => {
  logger.error(err);
  res.status(statusCode || 500).json(err);
});

const responseWithResult = (res, statusCode) => ((entity) => {
  res.status(statusCode || 200).json(entity);
});

const handleEntityNotFound = res => ((entity) => {
  if (!entity) {
    return res.status(404).end();
  }
  return entity;
});

const validateField = (req, res, field) => {
  if (!req.body[field]) {
    return res.status(400).json({
      message: `${field} is required`,
    });
  }
  return true;
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
    const requestID = jwt.sign({ phoneNumber, verificationCode }, secret, { algorithm: 'HS256', expiresIn: '5 minutes' });
    const message = `Your verification code is ${verificationCode}`;

    // .then(Pigeon[operation](phoneNumber, message))
    models.PhoneNumberVeirication.create({ requestID, verificationCode, phoneNumber })
      .then((data) => {
        res.status(200).json({ requestID });
      })
      .catch(handleError(res));
  },

  resend: (req, res) => {
    validateField(req, res, 'phoneNumber');
    const { phoneNumber } = req.body;
    const _this = this;

    models.PhoneNumberVeirication.findOne({ where: { phoneNumber } })
      .then(handleEntityNotFound(res))
      .then(data => data.destroy())
      .then(() => _this.authenticate(req, res))
      .catch(handleError);
  },

  verify: (req, res) => {
    if (!req.body.requestID || !req.body.verificationCode) {
      res.status(500).json({ message: 'Invalid request' });
    }

    models.PhoneNumberVeirication.findOne({
      where: {
        requestID: req.body.requestID,
        verificationCode: req.body.verificationCode,
      },
    })
      .then(handleEntityNotFound(res))
      .then((data) => {
        jwt.verify(data.requestID, secret, (err, decoded) => (
          new Promise((resolve, reject) => {
            if (err || !decoded ||
              !decoded.phoneNumber ||
              decoded.phoneNumber !== data.phoneNumber) {
              return reject(err);
            }
            return resolve(data);
          })
        ));
      })
      .then(data => data.destroy())
      .then(data => models.User.findOrCreate({ where: { phoneNumber: data.phoneNumber }, defaults: { phoneNumber: data.phoneNumber } }))
      .spread((data, created) => res.status(created ? 200 : 201).status(data.id))
      .catch(handleError(res));
  },
};
