'use strict';

const _ = require('lodash'),
  logger = require('winston'),
  jwt = require('jsonwebtoken'),
  models = require('../models/'),
  env = process.env.NODE_ENV || 'development',
  secret = require('../config/config')[env]['secret'];
Pigeon = require('../lib/pigeon');

const maxNumber = 9999;
const minNumber = 1000;

module.exports = {
  authenticate: (req, res) => {
    if (!req.body.phoneNumber) {
      res.status(500).json({
        message: 'Phone number is required'
      });
    }
    let phoneNumber = req.body.phoneNumber;
    let requestID = jwt.sign({ phoneNumber: phoneNumber }, secret, { algorithm: 'RS256' });
    let verificationCode = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    let message = `Your verification code is ${verificationCode}`;
    let pigeon = new Pigeon(phoneNumber, message);

    models.Auth.create({ requestID: requestID, verificationCode, verificationCode })
      .then((data) => {
        pigeon.sendSms((result) => {
          logger.log(`Result from sms client ${result}`);
        });
        res.status(200).json(data);
      })
      .catch((err) => {
        logger.error(err);
        res.status(500).json(err);
      });
  },

  resend: (req, res) => {
    if (!req.body.phoneNumber) {
      res.status(500).json({ message: 'Phone number is required' });
    }

    if (!req.body.requestID) {
      res.status(500).json({ message: 'Invalid request' });
    }

    let phoneNumber = req.body.phoneNumber;
    let type = req.body.type || 'sms';
    let requestID = request.body.requestID;
    let operation = typeKey[type] || 'sendSms';

    models.Auth.findOne({
      where: {
        requestID,
      }
    }).then((data) => {
      if (!data) {
        res.status(500).json({ message: 'Invalid request' });
      }

      data.destroy().then(() {
        let requestID = jwt.sign({ phoneNumber: phoneNumber }, secret, { algorithm: 'RS256' });
        let verificationCode = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        let message = `Your verification code is ${verificationCode}`;
        let pigeon = new Pigeon(phoneNumber, message);
        pigeon[operation]((result) => {
          logger.log(`Result from sms client ${result}`);
        })
        res.status(200).json(data);
      }).catch((err) => {
        logger.error(err);
        res.status(500).json(err);
      });
    }).catch((err) => {
      logger.error(err);
      res.status(500).json(err);
    });

  },

  verify: (req, res) => {
    if (!req.body.requestID || !req.body.verificationCode) {
      res.status(500).json({ message: 'Invalid request' });
    }


    models.Auth.findOne({
      where: {
        requestID: req.body.requestID,
        verificationCode: req.body.verificationCode
      }
    }).then((data) => {
      if (!data) {
        res.status(500).json({ message: 'Invalid request' });
      }
      jwt.verify(data.requestID, secret, function (err, decoded) {
        if (!decoded || !decoded.phoneNumber || decoded.phoneNumber !== data.phoneNumber) {
          res.status(500).json({ message: 'Invalid request' });
        }

        data.destroy()
          .then(() => {
            model.User.create({ phoneNumber: data.phoneNumber })
              .then(data => {
                res.status(200).json(data);
              }).catch((err) = {
                logger.error(err);
                res.status(500).json(err);
              })

          })
      });
    }).catch((err) => {
      logger.error(err);
      res.status(500).json(err);
    });
  }
}

var typeKey = {
  'sms': 'sendSms',
  'call': 'call',
};
