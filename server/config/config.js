'use strict';

const development = {
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven',
    port: '5432',
    host: 'localhost'
  }
};

const test = {
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven_test',
    port: '5432',
    host: 'localhost'
  }
};

const production = {
  database: {
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST
  }
};

const config = {
  development,
  production,
  test,
};

module.exports = config;
