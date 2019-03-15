/*
 * Tokens handler
 */

// Dependencies
const _data = require('./../data');
const config = require('./../config');
const helpers = require('./../helpers');
const util = require('util');
const debug = util.debuglog('handlers');

const orders = (data, callback) => {
  const acceptableMethods = ['post'];

  if (acceptableMethods.indexOf(data.method) != -1) {
    orders._methods[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the checks submethods
orders._methods = {};

// Orders - post
// Required data: stripeToken
// Required headers: token
orders._methods.post = (data, callback) => {
  //const stripeToken = typeof (stripeToken) == 'string' && stripeToken.length > 0 ? stripeToken : false;
  const stripeToken = 'tok_visa';

  if (stripeToken) {
    // Get token from headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    if (token) {
      // Lookup the user email by reading the token
      _data.read('tokens', token, (error, tokenData) => {
        if (!error && tokenData && tokenData.expires > Date.now()) {
          const userEmail = tokenData.email;

          // Lookup the user data
          _data.read('users', userEmail, (error, userData) => {
            if (!error && userData) {
              if (typeof (userData.cart) == 'object' && userData.cart instanceof Array && userData.cart.length > 0) {
                let totalPrice = 0;
                // Calculate total price
                userData.cart.forEach((cartItem) => {
                  totalPrice += totalPrice + cartItem.items * cartItem.unitPrice;
                });

                // Generate orderId
                const orderId = helpers.createRandomString(20);

                debug('Sending the payment for: ' + JSON.stringify(userData.cart) + ' with total price of ' + totalPrice + ' and orderId ' + orderId);

                // Process the payment via Stripe
                helpers.processStripePayment(orderId, stripeToken, totalPrice, (error) => {
                  if (!error) {
                    helpers.sendConfirmationEmail(orderId, userData.email, (error, message) => {
                      if (!error) {
                        debug(message);
                      } else {
                        debug('Confirmation e-mail was not sent.');
                      }
                      callback(200);
                    });
                  } else {
                    debug(error);
                    callback(400, { 'Error': 'Could not process the payment.' });
                  }
                });
              } else {
                callback(400, { 'Error': 'There is no cart.' });
              }
            } else {
              callback(403, { 'Error': 'Related user not found.' });
            }
          });
        } else {
          callback(403, { 'Error': 'Could not read valid token data.' });
        }
      });
    } else {
      callback(403, { 'Error': 'Token missing.' });
    }
  } else {
    callback(400, { 'Error': 'Required fields missing.' });
  }
};

// Export the module
module.exports = orders;