/* jshint esversion: 6 */

// const _ = require('lodash');
const logger = require('winston');
const jwt = require('jsonwebtoken');
const models = require('../models/');

const env = process.env.NODE_ENV || 'development';
const [secret] = require('../config/config')[env];
const Pigeon = require('../lib/pigeon');

const maxNumber = 9999;
const minNumber = 1000;
const typeKey = {
  sms: 'sendSms',
  call: 'makeCall',
};

const getVerificationCode =
  () => Math.floor(Math.random() * (maxNumber - (minNumber + 1))) + minNumber;

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
    return res.status(500).json({
      message: `${field} is required`,
    });
  }
  return true;
};

module.exports = {
  authenticate: (req, res) => {
    validateField(req, res, 'phoneNumber');
    const { phoneNumber } = req.body;
    const requestID = jwt.sign({ phoneNumber }, secret, { algorithm: 'RS256' });
    const verificationCode = getVerificationCode();
    const message = `Your verification code is ${verificationCode}`;

    models.Auth.create({ requestID, verificationCode, phoneNumber })
      .then(Pigeon.sendSms(phoneNumber, message))
      .then(() => {
        res.status(200).json({ requestID });
      })
      .catch(handleError(res));
  },

  resend: (req, res) => {
    validateField(req, res, 'phoneNumber');

    if (!req.body.requestID) {
      res.status(500).json({ message: 'Invalid request' });
    }

    const { phoneNumber } = req.body;
    const type = req.body.type || 'sms';
    const { requestID } = req.body;
    const operation = typeKey[type] || 'sendSms';
    const verificationCode = getVerificationCode();
    const message = `Your verification code is ${verificationCode}`;
    const newRequestID = jwt.sign({ phoneNumber }, secret, { algorithm: 'RS256' });

    models.Auth.findOne({ where: { requestID } })
      .then(handleEntityNotFound(res))
      .then(data => data.destroy())
      .then(() => models.Auth.create({ newRequestID, verificationCode, phoneNumber }))
      .then(Pigeon[operation](phoneNumber, message))
      .then(() => {
        res.status(200).json({ newRequestID });
      })
      .catch(handleError);
  },

  verify: (req, res) => {
    if (!req.body.requestID || !req.body.verificationCode) {
      res.status(500).json({ message: 'Invalid request' });
    }

    models.Auth.findOne({
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
      .then(data => models.User.findOrCreate({ where: { phoneNumber: data.phoneNumber }, defaults: {phoneNumber: data.phoneNumber} }))
      .spread((data, created) => res.status(created ? 200 : 201).status(data.id))
      .catch(handleError(res));
  },
};
