/* jshint esversion: 6 */

const Nexmo = require('nexmo');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// We need this to build our post string

var querystring = require('querystring');
var https       = require('https');

// Your login credentials
var username = 'talk2ned@gmail.com';
var apikey   = '21f242d950954f29074d9c0f01099408aa17acf14f7f2f336b1d38f25f48aac6';

function sendMessage(to, message) {

	var postData = querystring.stringify({
	    'username' : username,
	    'to'       : to,
	    'message'  : message
	});

	var postOptions = {
		host   : 'api.africastalking.com',
		path   : '/version1/messaging',
		method : 'POST',

		rejectUnauthorized : false,
		requestCert        : true,
		agent              : false,

		headers: {
		    'Content-Type' : 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length,
		    'Accept': 'application/json',
		    'apikey': apikey
		}
	};


  return axios({
    method: 'post',
    url: `${postOptions.host}${postOptions.path}`,
    data: postData,
    headers: postOptions.headers
  })
  .then(function (response) {
    console.log(response);
    return response;
  })
  .catch(function (error) {
    console.log(error);
    return error;
  });


  //
	// var post_req = https.request(postOptions, function(res) {
	//     res.setEncoding('utf8');
	//     res.on('data', function (chunk) {
	// 	    var jsObject   = JSON.parse(chunk);
	// 	    var recipients = jsObject.SMSMessageData.Recipients;
	// 	    if ( recipients.length > 0 ) {
	// 	    	for (var i = 0; i < recipients.length; ++i ) {
	// 	    		var logStr  = 'number=' + recipients[i].number;
	// 	    		logStr     += ';cost='   + recipients[i].cost;
	// 	    		logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
	// 	    		console.log(logStr);
	// 	    		}
	// 	    	} else {
	// 	    		console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
	// 	    }
	// 	});
	// });
  //
	// // Add post parameters to the http request
	// post_req.write(post_data);
  //
	// post_req.end();
}


const nexmo = new Nexmo({
  apiKey: config.nexmo.API_KEY,
  apiSecret: config.nexmo.API_SECRET,
  applicationId: config.nexmo.APP_ID,
  privateKey: config.nexmo.PRIVATE_KEY_PATH,
}, {});

const sender = config.nexmo.FROM_NUMBER;

const Pigeon = {
  sendSms: (phoneNumber, message) => sendMessage(phoneNumber, message)),

  makeCall: phoneNumber => (nexmo.calls.create({
    to: [{
      type: 'phone',
      number: phoneNumber,
    }],
    from: {
      type: 'phone',
      number: sender,
    },
    answer_url: ['ANSWER_URL'],
  }, (err, response) => (
    new Promise((resolve, reject) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    })
  ))),
};

module.exports = {
  Pigeon,
};
