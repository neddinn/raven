

const users = require('../controllers/users');
const auth = require('../controllers/auth');

module.exports = function (app) {
  app.get('/api/v1/users', users.index);
  app.post('/api/v1/users', users.new);
  app.put('/api/v1/users/:id', users.update);

  app.post('/api/v1/authenticate', auth.authenticate);
  app.post('/api/v1/verify', auth.verify);
  app.post('/api/v1/handshake', auth.handshake);

  app.get('/*', (req, res) => {
    res.send('its Raven, baby!');
  });
};
