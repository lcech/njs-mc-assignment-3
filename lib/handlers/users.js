/*
 * Users handler
 */

// Dependencies
const _data = require('./../data');
const config = require('./../config');
const helpers = require('./../helpers');
const tokens = require('./../handlers/tokens');
const util = require('util');
const debug = util.debuglog('handlers');

const users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  debug('Users handler called: ', data)

  if (acceptableMethods.indexOf(data.method) != -1) {
    users._methods[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
users._methods = {};

// Users - post
// Required data: firstName, lastName, email, password, streetAddress
users._methods.post = (data, callback) => {
  // Check that all required fileds are available
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const email = helpers.validateEmail(data.payload.email);
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

  debug('Creating user: ', firstName, lastName, email, password, streetAddress);

  if (firstName && lastName && email && password && streetAddress) {
    // Make sure that the user doesn't already exist
    _data.read('users', email, (error, data) => {
      if (error) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          const userObject = {
            firstName,
            lastName,
            email,
            hashedPassword,
            streetAddress
          };

          debug('Storing user: ', userObject);
          // Store the user
          _data.create('users', userObject.email, userObject, (error, data) => {
            if (!error) {
              callback(200);
            } else {
              console.log(error);
              callback(500, { 'Error': 'Could not create the new user.' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the password.' });
        }
      } else {
        // User already exists
        callback(400, { 'Error': 'This user already exists.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Required fields missing.' });
  }
};

// Users - get
// Required data: email
users._methods.get = (data, callback) => {
  // Check that the email is valid
  const email = helpers.validateEmail(data.queryStringObject.email);

  if (email) {
    // Get token from headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email
    tokens._methods.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, (error, data) => {
          if (!error && data) {
            // Remove the hashedPssword from the object before returning it to requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

// Users - put
// Required data: email
// Optional data: firstName, lastName, password, streetAddress (at least one must be specified)
users._methods.put = (data, callback) => {
  // Check that the email is valid
  const email = helpers.validateEmail(data.payload.email);

  // Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

  if (email) {
    if (firstName || lastName || password || streetAddress) {
      // Get token from headers
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the email
      tokens._methods.verifyToken(token, email, (tokenIsValid) => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', email, (error, userData) => {
            if (!error && data) {
              // Update the necessary data
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress;
              }
              // Store the updates
              _data.update('users', email, userData, (error) => {
                if (!error) {
                  callback(200);
                } else {
                  console.log(error);
                  callback(500, { 'Error': 'Could not update the user.' })
                }
              });
            } else {
              callback(400, { 'Error': 'The specified user does not exist.' });
            }
          });
        } else {
          callback(403, { 'Error': 'Missing required token in header, or token is invalid.' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing fields to update.' });
    }
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

// Users - delete
// Required data: email
users._methods.delete = (data, callback) => {
  // Check that the email number is valid
  const email = helpers.validateEmail(data.payload.email);

  if (email) {
    // Get token from headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the email
    tokens._methods.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, (error, userData) => {
          if (!error && userData) {
            // delete the user
            _data.delete('users', email, (error) => {
              if (!error) {
                // Delete each of the orders associated with the user
                var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                var checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  var checksDeleted = 0;
                  var deletionErrors = false;
                  // Loop through the checks
                  userChecks.forEach((checkId) => {
                    // Delete the check
                    _data.delete('checks', checkId, (error) => {
                      if (error) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully.' });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(400, { 'Error': 'Could not delete the specified user.' });
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
    callback(400, { 'Error': 'Missing required field.' });
  }
};

module.exports = users;