/* jshint esversion: 6 */

const axios = require('axios');
const logger = console || require('winston');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const querystring = require('querystring');
const https = require('https');
const username = 'raven' || config.sms.username;
const apikey = '67f0e9d1d98bf55ce386130ab29c9abaa845b20e885408aef4f2dea2eb2cac5e' || config.sms.apikey;


function sendMessage(to, message) {

  const url = 'http://api.africastalking.com/version1/messaging';

  const data = querystring.stringify({ username, to, message });

  return axios({
    method: 'post',
    url,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      apikey,
    },
    data,
  })
    .then((response) => {
      return response && response.status === 201;
    })
    .catch((error) => {
      logger.error(error);
      return false;
    });
}

const sender = config.sms.fromNumber;

const Pigeon = {
  sendSms: (phoneNumber, message) => sendMessage(phoneNumber, message),
};

module.exports = Pigeon;
