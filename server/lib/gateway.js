/* jshint esversion: 6 */

const axios = require('axios'),
  logger = console || require('winston'),
  env = process.env.NODE_ENV || 'development',
  config = require('../config/config')[env],
  apiKey = config.moneywave.apiKey,
  secret = config.moneywave.secret,
  baseUrl = config.moneywave.baseUrl,
  fee = config.moneywave.fee,
  RedisClient = require('./client');

const redis = new RedisClient();
const gatewayTokenName = 'moneywaveToken';

const Gateway = {
  prepareDetails: function (data) {
    return {
      firstname: data.sender.fullName && data.sender.fullName.split(' ')[0],
      lastname: data.sender.fullName && data.sender.fullName.split(' ')[1],
      phonenumber: data.sender.phoneNumber,
      email: data.sender.email,
      recipient_bank: data.recipientBank.code,
      recipient_account_number: data.recipientBank.accountNumber,
      card_no: data.senderCard.number,
      cvv: data.senderCard.cvv,
      expiry_year: data.senderCard.expiryYear,
      expiry_month: data.senderCard.expiryMonth,
      pin: data.senderCard.pin,
      apiKey,
      fee,
      amount: data.amount,
      medium: 'mobile'
    };
  },

  getToken: async function() {
    let token;
    token = await redis.get(gatewayTokenName);
    if (!token) {
      const result = await axios({
        url: `${baseUrl}/v1/merchant/verify`,
        method: 'post',
        headers: { 'content-type': 'application/json' },
        data: { apiKey, secret }
      });
      token =
        result.status === 200 &&
        result.data.status === 'success' &&
        result.data.token;
      if (token) redis.set(gatewayTokenName, token, 2 * 60 * 60); //expires in 2hours
    }
    return token;
  },

  bankList: async function() {
    let list = await axios({
      url: `${baseUrl}/banks`,
      method: 'post',
      headers: { 'content-type': 'application/json' }
    });
    return list && list.status === 200 && list.data;
  },

  verifyAccount: async function(account, code) {
    const token = await this.getToken();
    let result;
    try {
      result = await axios({
        url: `${baseUrl}/v1/resolve/account`,
        method: 'post',
        headers: { 'content-type': 'application/json', Authorization: token },
        data: { account_number: account, bank_code: code }
      });
      return result && result.status === 200 && result.data;
    } catch (error) {
      return false;
    }
  },

  tokenize: async function() {},
  transfer: async function(data) {
    const token = await this.getToken();
    const transferDetails = this.prepareDetails(data);
    try {
      let result = await axios({
        url: `${baseUrl}/v1/transfer`,
        method: 'post',
        headers: { 'content-type': 'application/json', Authorization: token },
        data: transferDetails
      });
      return {
        status: result.response && result.response.data.status,
        message: result.response && result.response.data.message
      };
      
    } catch (error) {
      return {
        status: error.response && error.response.data.status,
        message: error.response && error.response.data.message
      };
    }
  }
};

module.exports = Gateway;
