'use strict';

var pgtools = require('pgtools'),
  models = require("../server/models/");

pgtools.dropdb({
  user: 'postgres',
  password: 'password',
  port: 5432,
  host: 'localhost'
}, 'raven_test', function (err, res) {
  if (err) {
    console.error(err);
  }
  pgtools.createdb({
    user: 'postgres',
    password: 'password',
    port: 5432,
    host: 'localhost'
  }, 'raven_test', function (err, res) {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    models.sequelize.sync().then(function () {
      process.exit();
    });
  });
});
