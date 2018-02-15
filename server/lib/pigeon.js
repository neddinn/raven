/* jshint esversion: 6 */

const axios = require('axios');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// We need this to build our post string

var querystring = require('querystring');
var https = require('https');

// Your login credentials
var username = config.sms.username;
var apikey = config.sms.apiKey;

function sendMessage(to, message) {

  var postData = querystring.stringify({
    'username': username,
    'to': to,
    'message': message
  });

  var postOptions = {
    host: 'api.africastalking.com',
    path: '/version1/messaging',
    method: 'POST',
  };
  const url = `${postOptions.host}${postOptions.path}`;

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
    'Accept': 'application/json',
    'apikey': apikey
  };

  return axios({
    method: 'post',
    url,
    data: postData,
    headers,
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      return error;
    });
}

const sender = config.sms.fromNumber;

const Pigeon = {
  sendSms: (phoneNumber, message) => sendMessage(phoneNumber, message),
};

module.exports = {
  Pigeon,
};
