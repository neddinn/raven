/* jshint esversion: 6 */

const logger = require('winston');
const jwt = require('jsonwebtoken');
const models = require('../models/');

const env = process.env.NODE_ENV || 'development';
const secret = require('../config/config')[env]['secret'];
const Pigeon = require('../lib/pigeon');
const authSvc = require('../services/auth.service');
const util = require('../util');

const maxCodeNumber = 9999;
const minCodeNumber = 1000;
const typeKey = {
  sms: 'sendSms',
  call: 'makeCall',
};

const generateVerificationCode =
  () => Math.floor(Math.random() * (maxCodeNumber - (minCodeNumber + 1))) + minCodeNumber;


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
    const requestID = authSvc.signToken({ phoneNumber, verificationCode }, '5m');
    const message = `Your verification code is ${verificationCode}`;

    models.PhoneNumberVerification.upsert({ requestID, verificationCode, phoneNumber }, { phoneNumber })
      // .then((data) => Pigeon[operation](phoneNumber, message))
      .then((result) => {
        if (result) {
          console.log('requestID', requestID);
          return res.status(200).json({ requestID });
        }
        console.log('verificationCode', verificationCode);
        return res.status(500).send('An Error occured');
      })
      .catch(util.handleError(res));
  },

  resend: (req, res) => {
    const { phoneNumber } = req.body;
    const _this = this;

    models.PhoneNumberVerification.findOne({ where: { phoneNumber } })
      .then(util.handleEntityNotFound(res))
      .then(data => data && data.destroy())
      .then(() => module.exports.authenticate(req, res))
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
      .then((authData) => {
        if (!authData) return;
        const decoded = authSvc.verifyToken(authData.requestID);
        if (!decoded || !decoded.phoneNumber || decoded.phoneNumber !== authData.phoneNumber) {
          return res.status(404).json(err);
        }
        authData.destroy()
        .then(authData => models.User.findOrCreate({ where: { phoneNumber: authData.phoneNumber }, defaults: { phoneNumber: authData.phoneNumber } }))
        .spread((userData, created) => {
          console.log('created', created);
          if (!created) {
            return userData;
          }
          return models.Key.pop()
          .then((key) => {
              userData.privateKey = key.privateKey;
              userData.serverKey = key.publicKey;
              userData.phoneNumber = authData.phoneNumber;
              console.log('about to saveeeeee');
              return userData.save();
            });
          })
          .then((userData) => {
            res.status(200).json({
              user: { id: userData.id, phoneNumber: userData.phoneNumber, serverKey: userData.serverKey },
              authToken: authSvc.signToken({ userId: userData.id, phoneNumber: userData.phoneNumber }, '7d'),
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
        if (!user) return res.status(404).json({ message: 'User Not found' });
        user.clientKey = clientKey;
        return user.save().then((data) => res.status(200).json({ 
          serverKey: data.serverKey,
          authToken: authSvc.signToken({ userId: user.id, phoneNumber: user.phoneNumber }, '7d'),
        }));
      })
      .catch(util.handleError(res));
  },
  
  keyTest: (req, res) => {
    console.log('Inside keytest', req.user);
    return res.status(200).send('done');
    // models.Key.findOne({ 
    //   where: {
    //     id: {
    //       $ne: null
    //     }
    //   } 
    // })
    // .then((key) => {
    //   key.privateKey = 'test';
    //   key.save().then((key) => {
    //     console.log('key', key.privateKey);
    //     res.status(200).send('done');
    //   });
    // })
    // .catch(util.handleError(res));
  },
};
