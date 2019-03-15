/*
 * Products handler
 */

// Dependencies
const _data = require('./../data');
const util = require('util');
const debug = util.debuglog('handlers');

const products = (data, callback) => {
  const acceptableMethods = ['get'];

  debug('Products handler called: ', data)

  if (acceptableMethods.indexOf(data.method) != -1) {
    products._methods[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the products submethods
products._methods = {};

// Products - get - lists all products
// Required header: token
// Optional data: id
products._methods.get = (data, callback) => {
  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

  if (token) {
    // Lookup the user phone by reading the token
    _data.read('tokens', token, (error, tokenData) => {
      if (!error && tokenData && tokenData.expires > Date.now()) {
        const userEmail = tokenData.email;
        // Lookup user data
        _data.read('users', userEmail, (error, userData) => {
          if (!error && userData) {
            // Check that id exists and is valid
            const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
            if (id) {
              _data.read('products', id, (error, data) => {
                if (!error && data) {
                  callback(200, data);
                } else {
                  callback(500, { 'Error': 'Menu item not available.' });
                }
              });
            } else {
              // Lookup all products
              _data.read('products', null, (error, data) => {
                if (!error && data) {
                  callback(200, data);
                } else {
                  callback(500, { 'Error': 'Menu items are not available.' });
                }
              });
            }
          } else {
            callback(500, { 'Error': 'Could not read user data.' });
          }
        });
      } else {
        callback(403, { 'Error': 'Invalid token data.' });
      }
    });
  } else {
    callback(403, { 'Error': 'Missing required token in header.' });
  }
};

module.exports = products;