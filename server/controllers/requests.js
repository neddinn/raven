/* jshint esversion: 6 */

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util'),
  Gateway = require('../lib/gateway');

const requiredFields = ['amount',
'currency',
'recipient',
'messageFromSender'];

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
        return models.Request.create(attrs);
      })
      .then(request => {
        if(request) return res.status(200).json({ success: true });
        return res.status(500).json({ success: false});
      })
      .catch(util.handleError(res));
  },

  userRequests: (req, res) => {
    if (util.isInvalidRequest(req.params, ['userId']))
      return res.status(400).json({ message: 'Invalid Request, ensure that all fields are present'});
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }    
    const user = req.user;
    user.getRequests()
      .then(util.responseWithResult(res, 200))
      .catch(util.handleError(res));
  },

  index: (req, res) => {
    const userId = req.user.id;
    models.Bank.find({ where: { user_id: userId } })
      .then(util.responseWithResult(res, 201))
      .catch(util.handleError(res));
  },

  accept: (req, res) => {
    const user = req.user;
    const attrs = _.pick(
      req.body,
      ['message', 'senderCardId']
    );
    const requestId = req.params.requestId;
    return models.Request.findById(requestId)
      .then(util.handleEntityNotFound(res))
      .then(request => {
        if (!request || 
          request.recipientId !== user.id ||
          request.status === 'cancelled') {
          res.status(400).json({ message: 'Invalid Request' });
          return;
        }
        request.messageFromRecipient = attrs.message;
        request.status = 'accepted';
        return request.save();
      })
      .then((request) => {
        if(!request) return;
        let transactionObj = _.pick(
          request, 
          ['amount',
          'currency',
          'recipientId',
          'status']
        );
        transactionObj.status = 'pending';
        transactionObj.senderCardId = attrs.senderCardId;
        transactionObj.recipientId = request.senderId;
        transactionObj.senderId = user.id;
        return models.Transaction.create(transactionObj);
      })
      .then((transaction) => {
        if(transaction) return res.status(200).json({ success: true });
      })
      .catch(util.handleError(res));
  },

  decline: (req, res) => {
    const user = req.user;
    const attrs = _.pick(
      req.body,
      ['message']
    );
    const requestId = req.params.requestId;
    return models.Request.findById(requestId)
      .then(util.handleEntityNotFound(res))
      .then(request => {
        if (!request || request.recipientId !== user.id) {
          res.status(400).json({ message: 'Invalid Request' });
          return;
        }
        request.messageFromRecipient = attrs.message;
        request.status = 'declined';
        return request.save();
      })
      .then((request) => {
        if(request) return res.status(200).json({ success: true });
      })
      .catch(util.handleError(res));
  },

  cancel: (req, res) => {
    const user = req.user;
    const requestId = req.params.requestId;
    return models.Request.findById(requestId)
      .then(util.handleEntityNotFound(res))
      .then(request => {
        if (!request || request.recipientId !== user.id) {
          res.status(400).json({ message: 'Invalid Request' });
          return;
        }
        request.status = 'cancelled';
        return request.save();
      })
      .then((request) => {
        if(request) return res.status(200).json({ success: true });
      })
      .catch(util.handleError(res));
  }
};
