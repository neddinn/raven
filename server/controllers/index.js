

const users = require('../controllers/users');

module.exports = function (app) {
  app.get('/api/v1/users', users.index);
  app.post('/api/v1/users', users.new);
  app.put('/api/v1/users/:id', users.update);

  app.get('/*', (req, res) => {
    res.send('its Raven, baby!');
  });
};
