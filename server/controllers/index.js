/* jshint esversion: 6 */

const users               = require('../controllers/users');
const auth                = require('../controllers/auth');
const banks               = require('../controllers/banks');
const cards               = require('../controllers/cards');
const transactions        = require('../controllers/transactions');
const requests            = require('../controllers/requests');
const { isAuthenticated } = require('../services/auth.service.js');

module.exports = function (app) {

  // Users
  app.put('/api/v1/users/:id', isAuthenticated(), users.update);

  // Auth
  app.post('/api/v1/authenticate', auth.authenticate);
  app.post('/api/v1/verify', auth.verify);
  app.post('/api/v1/resend', auth.resend);
  app.post('/api/v1/handshake', isAuthenticated(), auth.handshake);
  app.get('/api/v1/keyTest', isAuthenticated(), auth.keyTest);

  // Banks
  app.get('/api/v1/banks', isAuthenticated(), banks.availableBanksList);
  app.post('/api/v1/verify_bank_account', isAuthenticated(), banks.verify);
  app.post('/api/v1/users/:userId/bankAccounts', isAuthenticated(), banks.new);
  app.get('/api/v1/users/:userId/bankAccounts', isAuthenticated(), banks.index);
  app.delete('/api/v1/users/:userId/bankAccounts/:bankId', isAuthenticated(), banks.delete);
  
  // Card
  app.post('/api/v1/users/:userId/cards', isAuthenticated(), cards.new);
  app.get('/api/v1/users/:userId/cards', isAuthenticated(), cards.index);
  app.delete('/api/v1/users/:userId/cards/:cardId', isAuthenticated(), cards.delete);

  // Transaction
  app.post('/api/v1/transactions', isAuthenticated(), transactions.new);
  app.get('/api/v1/users/:userId/transactions', isAuthenticated(), transactions.userTransactions);
  app.post('/api/v1/transactions/:transactionId/accept', isAuthenticated(), transactions.accept);
  app.post('/api/v1/transactions/:transactionId/decline', isAuthenticated(), transactions.decline);
  app.post('/api/v1/transactions/:transactionId/cancel', isAuthenticated(), transactions.cancel);
  
  // Request
  app.post('/api/v1/requests', isAuthenticated(), requests.new);
  app.get('/api/v1/users/:userId/requests', isAuthenticated(), requests.userRequests);
  app.post('/api/v1/requests/:requestId/accept', isAuthenticated(), requests.accept);
  app.post('/api/v1/requests/:requestId/decline', isAuthenticated(), requests.decline);
  app.post('/api/v1/requests/:requestId/cancel', isAuthenticated(), requests.cancel);


  app.get('/*', (req, res) => {
    res.send('its Raven, baby!');
  });
};
