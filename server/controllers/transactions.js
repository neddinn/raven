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
            attributes: ['email', 'phoneNumber', 'fullName', 'privateKey']
          },
          {
            model: models.Bank,
            as: 'recipientBank',
            attributes: ['name', 'accountNumber']
          },
          {
            model: models.Card,
            as: 'senderCard',
            attributes: ['cvv', 'number', 'expiryMonth', 'expiryYear']
          }
        ]})
        .then(transaction => {
          let operationDetails = {
            transactionId: transaction.id,
            status: 'pending',
            message: '',
          };
          return models.Operation.findOne({transactionId,})
          .then((operation) => {

            // Dont continue if operation exists and was successful
            // Otherwise upsert (for when we implement retry functionality)
            if(operation && operation.status === 'success')
              return [null, transaction];
            operationDetails.id = operation && operation.id;
            return [models.Operation.upsert(operationDetails), transaction];
          });
        })
        .spread((operation, transaction) => {
          if (operation) return false;

          // Only decrypt on production environment
          if (process.env.NODE_ENV !== 'production') {
            return transaction;
          }
          if (operation) {
            return Crypto.decryptObject({
              data: transaction.senderCard,
              fields: models.Card.sensitiveFields,
              key: transaction.sender.privateKey
            })
            .then((data) => {
              for (let key of models.Card.sensitiveFields) {
                if (transaction.senderCard.hasOwnProperty(key)) {
                  transaction.senderCard[key] = data[key];
                }
              }
              return transaction;
            });
          }
        })
        .then((transaction) => transaction ? [Gateway.transfer(transaction), transaction.id] : [null, null])
        .spread((result, transactionId) => {
          return models.Operation.findOne({where: {transactionId}})
            .then((operation) => {
              if (!operation) return;
              operation.status = result.status;
              operation.message = result.message;
              return operation.save();
            });
        })
        .then(result => {
          if (!result) return util.handleError(res)();
          const {status, message} = result;
          return res.status(200).json({ status, message });
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
