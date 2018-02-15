/* jshint esversion: 6 */

const development = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven',
    port: '5432',
    host: 'localhost',
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
  },
};

const test = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven_test',
    port: '5432',
    host: 'localhost',
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
  },
};

const production = {
  secret: process.env.JWT_SECRET,
  database: {
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
  },
};

const config = {
  development,
  production,
  test,
};

module.exports = config;
