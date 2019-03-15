/*
 * Carts handler
 */

// Dependencies
const _data = require('./../data');
const config = require('./../config');
const helpers = require('./../helpers');
const util = require('util');
const debug = util.debuglog('handlers');

const carts = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'delete'];

  if (acceptableMethods.indexOf(data.method) != -1) {
    carts._methods[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the checks submethods
carts._methods = {};

// Cart - post
// Required data: productId
// Required header: token
// Optional data: items (1-10, default is 1)
carts._methods.post = (data, callback) => {
  // Validate inputs
  const productId = typeof (data.payload.productId) == 'string' && data.payload.productId.trim().length > 0 ? data.payload.productId.trim() : false;
  const items = typeof (data.payload.items) == 'number' && data.payload.items > 0 && data.payload.items <= 10 ? data.payload.items : 1;

  if (productId) {
    // Get token from headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    if (token) {
      // Lookup the user phone by reading the token
      _data.read('tokens', token, (error, tokenData) => {
        if (!error && tokenData && tokenData.expires > Date.now()) {
          const userEmail = tokenData.email;

          // Lookup the user data
          _data.read('users', userEmail, (error, userData) => {
            if (!error && userData) {

              // Check if the product exists in the menu
              _data.read('products', productId, (error, productData) => {
                if (!error && productData) {
                  // Use existing or create new cart
                  const userCart = typeof (userData.cart) == 'object' && userData.cart instanceof Array ? userData.cart : [];

                  let cartItem;

                  // Try to find the existing productId in the cart
                  if (userCart.length > 0) {
                    cartItem = userCart.find((item) => {
                      return item.productId == productId;
                    });
                  }

                  if (typeof cartItem == 'undefined') {
                    // Create cart item object
                    cartItem = {
                      'productId': productId,
                      'unitPrice': productData.unitPrice,
                      'items': items
                    };
                    // Create cart
                    userData.cart = userCart;
                    userData.cart.push(cartItem);
                  } else {
                    // Only increment items
                    cartItem.items += items;
                  }

                  // Save the new user data
                  _data.update('users', userData.email, userData, (error) => {
                    if (!error) {
                      // Return the data about the new cart item
                      callback(200, cartItem);
                    } else {
                      callback(500, { 'Error': 'Could not update the user with the new shopping cart data.' });
                    }
                  });
                } else {
                  callback(500, { 'Error': 'This item is not on the menu.' });
                }
              });
            } else {
              callback(403);
            }
          });
        } else {
          callback(403);
        }
      });
    } else {
      callback(403);
    }
  } else {
    callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' });
  }
};

// Carts - get
// Required header: token
carts._methods.get = (data, callback) => {
  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

  if (token) {
    // Lookup the user phone by reading the token
    _data.read('tokens', token, (error, tokenData) => {
      if (!error && tokenData && tokenData.expires > Date.now()) {
        const userEmail = tokenData.email;

        // Lookup the user data
        _data.read('users', userEmail, (error, userData) => {
          if (!error && userData) {
            callback(200, userData.cart);
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
};

// Carts - delete
// Required header: token
// Optional data: productId
carts._methods.delete = (data, callback) => {
  // Get token from headers
  const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

  if (token) {
    // Lookup the user phone by reading the token
    _data.read('tokens', token, (error, tokenData) => {
      if (!error && tokenData && tokenData.expires > Date.now()) {
        const userEmail = tokenData.email;

        // Lookup the user data
        _data.read('users', userEmail, (error, userData) => {
          if (!error && userData) {
            // Check that id exists and is valid
            const productId = typeof (data.queryStringObject.productId) == 'string' && data.queryStringObject.productId.trim().length > 0 ? data.queryStringObject.productId.trim() : false;
            if (productId) {
              userData.cart.forEach(function (product, index, userCart) {
                if (product.productId == productId) {
                  if (product.items > 1) {
                    product.items--;
                  } else {
                    userCart.splice(index, 1);
                  }
                }
              });
            } else {
              // delete the user's cart
              delete userData.cart;
            }
            // Update the user data
            _data.update('users', userEmail, userData, (error) => {
              if (!error) {
                callback(200);
              } else {
                callback(500, { 'Error': 'Could not update the user.' })
              }
            });
          } else {
            callback(400, { 'Error': 'Could not find the specified user.' });
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });
      }
    });
  } else {
    callback(403, { 'Error': 'Token missing.' });
  }
};

// Export the module
module.exports = carts;