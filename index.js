/*
 * Primary file for the Pizzcd a Delivery API
 */

const server = require('./lib/server');

// Declare the app
const app = {};

// Initialize the app
app.init = () => {

  // Start the server
  server.init();
};

// Execute
app.init();

// Export the app
module.exports = app;