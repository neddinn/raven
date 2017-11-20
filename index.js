'use strict';

const env = process.env.NODE_ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const models = require('./server/models/');
const controllers = require('./server/controllers');

global._ = require('lodash');
global.t = require('moment');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

controllers(app);


models.sequelize.sync().then(function () {
  models.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');


  // start the server
  app.listen(app.get('port'), function () {
    console.log('Listening on port %d', app.get('port'));
  });

});


module.exports = app;
