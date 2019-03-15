/*
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const path = require('path');
const fs = require('fs');
const config = require('./config');
const util = require('util');
const debug = util.debuglog('helpers');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (inputString) => {
  if (typeof (inputString) == 'string' && inputString.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(inputString).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases
helpers.parseJsonToObject = (jsonString) => {
  try {
    const outputObject = JSON.parse(jsonString);
    return outputObject;
  } catch (err) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (let i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

// validate correct e-mail format
helpers.validateEmail = (email) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return typeof (email) == 'string' && emailRegex.test(String(email.trim()).toLowerCase()) ? email.trim() : false;
};

// Process payment via Stripe API
helpers.processStripePayment = (orderId, token, totalPrice, callback) => {
  // validate inputs
  orderId = typeof (orderId) == 'string' && orderId.length > 0 ? orderId : false;
  token = typeof (token) == 'string' && token.length > 0 ? token : false;
  totalPrice = typeof (totalPrice) == 'number' && totalPrice > 0 ? totalPrice : false;

  if (orderId && token && totalPrice) {
    // Create string with data to send via application/x-www-form-urlencoded Content-Type
    const stringPayload = querystring.stringify({
      'amount': totalPrice * 100,
      'currency': 'usd',
      'description': 'Charge for Order ID: ' + orderId,
      'source': token
    });

    // Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.stripe.com',
      'method': 'POST',
      'path': '/v1/charges',
      'headers': {
        'Authorization': 'Bearer ' + config.stripe.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
    debug('Stripe request config: ', requestDetails);

    // Instantitate the request object
    const request = https.request(requestDetails, (response) => {
      const status = response.statusCode;
      if (status === 200 || status === 201) {
        debug('Stripe payment successful.');
        callback(false);
      } else {
        callback('Status code: ' + status);
      }
    });

    // Bind to the error event so it doesn't get thrown
    request.on('error', (error) => {
      callback(error);
    });

    // Add the payload
    debug('Sending data to Stripe: ' + stringPayload);
    request.write(stringPayload);

    // End the request
    request.end();
  } else {
    callback('Order ID missing or invalid');
  }
}

// Send a confirmation e-mail via Mailgun API
// Required data: orderId, recipientEmail
helpers.sendConfirmationEmail = (orderId, recipientEmail, callback) => {
  // validate inputs
  orderId = typeof (orderId) == 'string' && orderId.length > 0 ? orderId : false;
  recipientEmail = typeof (recipientEmail) == 'string' && recipientEmail.length > 0 ? recipientEmail : false;

  if (orderId && recipientEmail) {
    debug('Confirmation for order ID ' + orderId + ' sending to an e-mail: ' + recipientEmail);
    // Create string with data to send via application/x-www-form-urlencoded Content-Type
    const stringPayload = querystring.stringify({
      'from': config.mailgun.from,
      'to': recipientEmail,
      'subject': 'Order confirmation: ' + orderId,
      'text': 'Place order review here' // @TODO: format order summary into HTML
    });

    // Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': config.mailgun.baseUrl,
      'method': 'POST',
      'path': '/v3/' + config.mailgun.domain + '/messages',
      'headers': {
        'Authorization': `Basic ${Buffer.from(`api:${config.mailgun.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
    debug('Mailgun request config: ', requestDetails);

    // Instantitate the request object
    const request = https.request(requestDetails, (response) => {
      const decoder = new StringDecoder('utf-8');
      const status = response.statusCode;
      
      // Load buffered response into string
      let buffer = '';
      response.on('data', (data) => {
        buffer += decoder.write(data)
      });

      response.on('end', () => {
        buffer += decoder.end();
        const payload = helpers.parseJsonToObject(buffer);

        if (status === 200 || status === 201) {
          callback(false, payload);
        } else {
          callback(400, 'Status code returned was: ' + status);
        }
      })
    });

    // Bind to the error event so it doesn't get thrown
    request.on('error', (error) => {
      callback(error)
    });

    // Add the payload
    debug('Sending request to Mailgun: ' + stringPayload);
    request.write(stringPayload);

    // End the request
    request.end();
  } else {
    callback('Missing required fields');
  }
}

// Send an SMS via Twilio
helpers.sendTwilioSms = (phone, message, callback) => {
  // validate parameters
  phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  message = typeof (message) == 'string' && message.trim().length > 0 && message.trim().length < 1600 ? message.trim() : false;

  if (phone && message) {
    // Configure the request payload
    const payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': message
    };

    // Strigify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantitate the request object
    const request = https.request(requestDetails, (response) => {
      // Grab the status of the sent request
      const status = response.statusCode;

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback('Status code: ' + status);
      }
    });

    // Bind to the error event so it doesn't get thrown
    request.on('error', (error) => {
      callback(error);
    });

    // Add the payload
    request.write(stringPayload);

    // End the request
    request.end();

  } else {
    callback('Given parameters missing or invalid');
  }
};

// Get the string content of the template
helpers.getTemplate = (templateName, data, callback) => {
  templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) == 'object' && data !== null ? data : {};

  if (templateName) {
    const templateDir = path.join(__dirname, '/../templates/');
    fs.readFile(templateDir + templateName + '.html', 'utf8', (error, str) => {
      if (!error && str && str.length > 0) {
        // Do the interpolation on the string
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('Template not found.');
      }
    });
  } else {
    callback('Template name not specified.');
  }
};

// Add the universal header and footer to the string and pass the provided data object to the header and footer for the interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, (error, headerString) => {
    if (!error && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, (error, footerString) => {
        if (!error && footerString) {
          // Add them all together
          const fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template.');
        }
      });
    } else {
      callback('Could not find the header template.');
    }
  });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};

  // Add the template globals to the data object prepending their key name with "global"
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName];
    }
  }

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key]) == 'string') {
      let replace = data[key];
      let find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }

  return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
  fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    var publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, function (error, data) {
      if (!error && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

// Export the module
module.exports = helpers;