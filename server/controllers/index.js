'use strict';

const users = require('../controllers/users');

module.exports = function (app) {
  app.get('/api/v1/users', users.index);

  app.get('/*', function(req, res) {
    res.send('its Raven, baby!');
  });
};
