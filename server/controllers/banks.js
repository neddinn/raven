/* jshint esversion: 6 */

const _ = require('lodash'),
  logger = console || require('winston'),
  models = require('../models/'),
  util = require('../util'),
  Gateway = require('../lib/gateway');

var parseBank = (bankList) => {
  return Object.keys(bankList).map(code => ({
    code,
    name: bankList[code]
  }));
};

module.exports = {
  availableBanksList: (req, res) => {
    Gateway.bankList().then(data => {
      if (data && data.status === 'success' && data.data) {
        const bankList = parseBank(data.data);
        return res.status(200).json(bankList);
      }
      return res.status(500);
    });
  },

  verify: (req, res) => {
    const { bankCode, accountNumber } = req.body;
    if (!bankCode || !accountNumber) {
      return res.status(500).json({
        message: 'Bank code & account number required'
      });
    }
    Gateway.verifyAccount(accountNumber, bankCode).then(data => {
        return res.status(200).json({ isValid: 
            (data && data.status === 'success' && data.code !== 'INVALID_ACCOUNT') });
    })
    .catch(util.handleError(res));
  },

  new: (req, res) => {
    const attrs = _.pick(req.body, 'code', 'name', 'accountNumber');
    if (!attrs.code || !attrs.name || !attrs.accountNumber) {
      return res.status(500).json({
        message: 'Code, name and accountNumber is required'
      });
    }
    if (parseInt(req.params.userId, 10) !== req.user.id) {
        return res.status(500).json({
          message: 'Invalid user'
        });
    }
    models.Bank.create(attrs)
      .then((bank) => {
        if(bank) return bank.setUser(req.user);
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
    user.getBanks()
      .then(util.responseWithResult(res, 200))
      .catch(util.handleError(res));
  },

  delete: (req, res) => {
    if (parseInt(req.params.userId, 10) !== req.user.id) {
      return res.status(500).json({
        message: 'Invalid user'
      });
    }
    if (!req.params.bankId) return res.status(400).json({ message: 'Invalid request' });
    models.Bank.findById(req.params.bankId)
      .then(function(bank) {
        if (bank && bank.userId === req.user.id) {
          bank.destroy().then(function(data) {
            return res.status(200).json({success: true});
          });
        } else {
          res.status(404).json({message: 'Bank not found'});
        }
      })
      .catch(util.handleError(res));
  }
};
