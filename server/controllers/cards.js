/* jshint esversion: 6 */

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util');

module.exports = {
  new: (req, res) => {
    const fieldsToDecrypt = ['number', 'last4', 'expiryMonth', 'expiryYear', 'cvv'];
    const attrs = _.pick(req.body, 'number', 'last4', 'brand', 'expiryMonth', 'expiryYear', 'cvv');
    const user = req.user;
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }
    attrs.userId = user.id;
    models.Card.create(attrs)
      .then((card) => {
        if (process.env.NODE_ENV === 'production') {
          return Crypto.decryptObject({
            data: card,
            fields: models.Card.sensitiveFields,
            key: req.user.privateKey
          });
        } else {
          return card;
        }
      })
      .then((card) => {
        if (process.env.NODE_ENV === 'production') {
          return Crypto.encryptObject({
            data: card,
            fields: models.Card.sensitiveFields,
            key: req.user.clientKey
          });
        } else {
          return card;
        }
      })    
      .then(util.responseWithResult(res, 201))
      .catch(util.handleError(res));
  },
  
  index: (req, res) => {
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }
    const user = req.user;
    user.getCards()
      .then((cards) => {
        if (process.env.NODE_ENV === 'production') {
          return Crypto.decryptObjectArray({
            data: cards,
            fields: models.Card.sensitiveFields,
            key: req.user.privateKey
          });
        } else {
          return cards;
        }
      })
      .then((cards) => {
        if (process.env.NODE_ENV === 'production') {
          return Crypto.encryptObjectArray({
            data: cards,
            fields: models.Card.sensitiveFields,
            key: req.user.clientKey
          });
        } else {
          return cards;
        }
      })
      .then(util.responseWithResult(res, 200))
      .catch(util.handleError(res));
  },

  delete: (req, res) => {
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }
    if (!req.params.cardId) return res.status(400).json({ message: 'Invalid request' });
    models.Card.findById(req.params.cardId)
      .then(function(card) {
        if (card && card.userId === req.user.id) {
          card.destroy().then(function(data) {
            return res.status(200).json({success: true});
          });
        } else {
          res.status(404).json({message: 'Card not found'});
        }
      })
      .catch(util.handleError(res));
  }
};
