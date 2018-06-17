const redis = require('redis');
const env = process.env.NODE_ENV || 'development';
const url = require('url');
const config = require('../config/config')[env];
const redisUrl = config.redisUrl;
const { promisify } = require('util');


class RedisClient {
  constructor() {
    if (redisUrl) {
      const rtg = url.parse(redisUrl);
      this.client = redis.createClient(rtg.port, rtg.hostname);
      this.client.auth(rtg.auth.split(':')[1]);
    } else {
      this.client = redis.createClient();
    }
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return await getAsync(key);
  }

  set(key, value, expiry) {
    this.client.set(key, value);
    if (expiry) {
      this.client.expire(key, expiry);
    }
  }
}

module.exports = RedisClient;