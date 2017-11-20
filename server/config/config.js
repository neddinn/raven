

const development = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven',
    port: '5432',
    host: 'localhost',
  },
  nexmo: {
    API_KEY: '3c89eb82',
    API_SECRET: 'f40be594512c2793',
    APP_ID: 'appId',
    PRIVATE_KEY_PATH: 'privateKeyPath',
  },
};

const test = {
  secret: 'thisisasecretkey',
  database: {
    url: 'postgres://postgres:password@localhost:5432/raven_test',
    port: '5432',
    host: 'localhost',
  },
  nexmo: {
    API_KEY: '3c89eb82',
    API_SECRET: 'f40be594512c2793',
    APP_ID: 'appId',
    PRIVATE_KEY_PATH: 'privateKeyPath',
  },
};

const production = {
  secret: process.env.JWT_SECRET,
  database: {
    url: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
  },
  nexmo: {
    API_KEY: process.env.NEXMO_API_KEY,
    API_SECRET: process.env.NEXMO_API_SECRET,
    APP_ID: process.env.NEXMO_APP_ID,
    PRIVATE_KEY_PATH: process.env.NEXMO_PRIVATE_KEY_PATH,
  },
};

const config = {
  development,
  production,
  test,
};

module.exports = config;
