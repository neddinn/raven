const env         = process.env.NODE_ENV || 'development';
const express     = require('express');
const bodyParser  = require('body-parser');
const models      = require('./server/models/');

global._ = require('lodash');
global.t = require('moment');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use('*', (req, res) => {
  res.send('Its Raven, baby!');
});


models.sequelize.sync().then(function() {
  // start the server
  app.listen(app.get('port'), function() {
    console.log('Listening on port %d', app.get('port'));
  });
});
