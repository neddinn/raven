/* jshint esversion: 6 */

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util'),
  Gateway = require('../lib/gateway');

const requiredFields = ['amount',
'currency',
'recipient',
'messageFromSender',
'senderCardId'];

module.exports = {
  new: (req, res) => {
    if (util.isInvalidRequest(req.body, requiredFields))
      return res.status(400).json({ message: 'Invalid Request, ensure that all fields are present'});

    const attrs = _.pick(
      req.body,
      requiredFields
    );
    
    attrs.senderId = req.user.id;
    attrs.status = 'pending';
    models.User.find({ where: { phoneNumber: attrs.recipient } })
      .then(recipient => {
        if (!recipient)
          return res
            .status(404)
            .json({ success: false, message: 'Recipient not found' });
        return recipient;
      })
      .then(recipient => {
        if(!recipient) return;
        attrs.recipientId = recipient.id;
        return models.Transaction.create(attrs);
      })
      .then(transaction => {
        if(transaction) return res.status(200).json({ success: true });
        return res.status(500).json({ success: false});
      })
      .catch(util.handleError(res));
  },

  userTransactions: (req, res) => {
    if (util.isInvalidRequest(req.params, ['userId']))
      return res.status(400).json({ message: 'Invalid Request, ensure that all fields are present'});
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }    
    const user = req.user;
    user.getTransactions()
      .then(util.responseWithResult(res, 200))
      .catch(util.handleError(res));
  },

  accept: (req, res) => {
    let transferObj;
    let transactionObj;

    const user = req.user;
    const attrs = _.pick(
      req.body,
      ['message', 'bankId']
    );
    const transactionId = req.params.transactionId;
    return models.Transaction.findById(transactionId)
      .then(util.handleEntityNotFound(res))
      .then(transaction => {
        if(!transaction) return;
        transaction.messageFromRecipient = attrs.message;
        transaction.recipientBankId = attrs.bankId;
        transaction.status = 'accepted';
        return transaction.save();
      })
      .then(transaction => {
        if(!transaction) return;
        models.Transaction.findOne({ where: {
          id: transactionId
        }, include: [
          {
            model: models.User,
            as: 'sender',
            attributes: ['email', 'phoneNumber', 'fullName']
          },
          {
            model: models.Bank,
            as: 'recipientBank',
            attributes: ['name', 'accountNumber']
          },
          {
            model: models.Card,
            as: 'senderCard',
            attributes: ['cvc', 'number', 'expiryMonth', 'expiryYear']
          }
        ]})
        .then(transaction => {
          let operationDetails = {
            transactionId: transaction.id,
            status: 'pending'
          };
          return [models.Operation.create(operationDetails), transaction];
        })
        .spread((operation, transaction) => {
          if(operation)
            return Gateway.transfer(transaction);
        })
        .then(result => {
          return res.status(200).json({ success: false });
        })
        .catch(util.handleError(res));
    });
  },

  decline: (req, res) => {
    const user = req.user;
    const attrs = _.pick(
      req.body,
      ['message']
    );
    const transactionId = req.params.transactionId;
    return models.Transaction.findById(transactionId)
      .then(util.handleEntityNotFound(res))
      .then(transaction => {
        if (!transaction || transaction.recipientId !== user.id) {
          res.status(400).json({ message: 'Invalid Request' });
          return;
        }
        transaction.messageFromRecipient = attrs.message;
        transaction.status = 'declined';
        return transaction.save();
      })
      .then((transaction) => {
        if(transaction) return res.status(200).json({ success: true });
      })
      .catch(util.handleError(res));
  },

  cancel: (req, res) => {
    const user = req.user;
    const transactionId = req.params.transactionId;
    return models.Transaction.findById(transactionId)
      .then(util.handleEntityNotFound(res))
      .then(transaction => {
        if (!transaction || transaction.recipientId !== user.id) {
          res.status(400).json({ message: 'Invalid Request' });
          return;
        }
        transaction.status = 'cancelled';
        return transaction.save();
      })
      .then((transaction) => {
        if(transaction) return res.status(200).json({ success: true });
      })
      .catch(util.handleError(res));
  }
};
