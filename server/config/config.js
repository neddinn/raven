/* jshint esversion: 6 */

const development = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven',
    port: '5432',
    host: 'localhost'
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
    apikey: '4de350910ff37aaef10234cad2e8d4847875478f846db653d654f43582fc1eae',
    username: 'sandbox'
  },
  crypto: {
    passphrase: 'this is a passphrase'
  },
  moneywave: {
    baseUrl: 'https://moneywave.herokuapp.com',
    apiKey: 'ts_ABQBI46PSRG71AOVAZSQ',
    secret: 'ts_2TXVJ4N9V70V9GXHBTXTB3R236O4V7'
  }
};

const staging = {
  secret: process.env.JWT_SECRET,
  database: {
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
    apikey: process.env.SMS_API_KEY,
    username: process.env.SMS_API_USERNAME
  },
  crypto: {
    passphrase: process.env.HASH_PASSPHRASE,
  },
  moneywave: {
    baseUrl: process.env.PAYMENT_BASE_URL,
    apiKey: process.env.PAYMENT_API_KEY,
    secret: process.env.PAYMENT_API_SECRET
  }
};

const test = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven_test',
    port: '5432',
    host: 'localhost'
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER,
    apikey: '60c7c393ba74a2e3e95f5a1868ca611773bc6d51646654243475942529fe5651',
    username: 'sandbox'
  },
  crypto: {
    passphrase: 'this is a passphrase'
  }
};

const production = {
  secret: process.env.JWT_SECRET,
  database: {
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST
  },
  sms: {
    fromNumber: process.env.SMS_FROM_NUMBER
  },
  crypto: {
    passphrase: 'this is a passphrase'
  },
  moneywave: {
    baseUrl: 'https://live.moneywaveapi.co',
    apiKey: 'lv_YCBUH4CO1D100888U2BI',
    secret: 'lv_RYBGO4HXV1PJ3Q4AK7PCAH30G2Z1U1'
  }
};

const config = {
  development,
  production,
  test,
  staging,
};

module.exports = config;
