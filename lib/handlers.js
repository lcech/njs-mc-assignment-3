/*
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
  // Callback an HTTP status code and a payload object
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  // Callback an HTTP status code
  callback(404);
};

/*
 * HTML Handlers
 */

// Index handler
handlers.index = (data, callback) => {
  // Reject everything besides GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Pizza!',
      'head.description': 'Delicious pizzas of different kinds',
      'body.class': 'index'
    };

    // Read the template
    helpers.getTemplate('index', templateData, (error, str) => {
      if (!error && str) {
        // add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Create Account
handlers.accountCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds.',
      'body.class': 'accountCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Create New Session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your account.',
      'head.description': 'Please enter your phone number and password to access your account.',
      'body.class': 'sessionCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Session has been deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out of your account.',
      'body.class': 'sessionDeleted'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionDeleted', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Edit Your Account
handlers.accountEdit = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit'
    };
    // Read in a template as a string
    helpers.getTemplate('accountEdit', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Account has been deleted
handlers.accountDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted.',
      'body.class': 'accountDeleted'
    };
    // Read in a template as a string
    helpers.getTemplate('accountDeleted', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// List all pizzas
handlers.pizzasList = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Our menu',
      'body.class': 'pizzasList'
    };
    // Read in a template as a string
    helpers.getTemplate('pizzasList', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// View shopping cart
handlers.cartView = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Shopping cart',
      'body.class': 'cartView'
    };
    // Read in a template as a string
    helpers.getTemplate('cartView', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Account has been deleted
handlers.orderPlaced = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Order Placed',
      'body.class': 'orderPlaced'
    };
    // Read in a template as a string
    helpers.getTemplate('orderPlaced', templateData, (error, str) => {
      if (!error && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (error, str) => {
          if (!error && str) {
            // Return that page as HTML
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Users handler
handlers.users = require('./handlers/users');

// Tokens handler
handlers.tokens = require('./handlers/tokens');

// Products handler
handlers.products = require('./handlers/products');

// Orders handler
handlers.carts = require('./handlers/carts');

// Orders handler
handlers.orders = require('./handlers/orders');

// Favicon handler
handlers.favicon = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (error, data) => {
      if (!error && data) {
        // Callback the data
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets handler
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Get the filename being requested
    var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (error, data) => {
        if (!error && data) {

          // Determine the content type (default to plain text)
          var contentType = 'plain';

          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }
          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }
          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }
          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          // Callback the data
          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

// Export the module
module.exports = handlers;