/*
 * Server related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const util = require('util');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// HTTP server
server.httpServer = http.createServer((request, result) => {
  server.unifiedServer(request, result);
});

// HTTPS server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (request, result) => {
  server.unifiedServer(request, result);
});

// cretae the server for both http and https
server.unifiedServer = (request, result) => {

  // Get the URL and parse it
  const parsedUrl = url.parse(request.url, true);

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the HTTP Method
  const method = request.method.toLowerCase();

  // Get headers
  const headers = request.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  request.on('data', (data) => {
    buffer += decoder.write(data);
  });

  request.on('end', () => {

    buffer += decoder.end();

    // Choose the handler, if not found, use notFound handler
    let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory use to the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    // Construct the data object
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {

      debug('\x1b[32m%s\x1b[0m', JSON.stringify(data));

      // use statusCode returned by handler or 200 as default
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

      // determine callback content type
      contentType = typeof (contentType) == 'string' ? contentType : 'json';

      // Return the content specific response parts
      let payloadString = '';
      if (contentType == 'json') {
        // set the header for the correct content/type
        result.setHeader('Content-Type', 'application/json');

        // use payload returned by the handler or {} as default
        payload = typeof (payload) == 'object' ? payload : {};

        // convert payload to string
        payloadString = JSON.stringify(payload);
      }
      if (contentType == 'html') {
        result.setHeader('Content-Type', 'text/html');
        payloadString = typeof (payload) == 'string' ? payload : '';
      }
      if (contentType == 'favicon') {
        result.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'plain') {
        result.setHeader('Content-Type', 'text/plain');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'css') {
        result.setHeader('Content-Type', 'text/css');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'png') {
        result.setHeader('Content-Type', 'image/png');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'jpg') {
        result.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }

      // Return the common response parts
      result.writeHead(statusCode);
      result.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
    });

  });
};

// Define a request routeer
server.router = {
  '': handlers.index,
  'ping': handlers.ping,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'pizzas/all': handlers.pizzasList,
  'cart/view': handlers.cartView,
  'order/created': handlers.orderPlaced,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/products': handlers.products,
  'api/carts': handlers.carts,
  'api/orders': handlers.orders,
  'favicon.ico': handlers.favicon,
  'public': handlers.public
};

// Init script
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.log('\x1b[36m%s\x1b[0m', 'The HTTP server is running on port ' + config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function () {
    console.log('\x1b[35m%s\x1b[0m', 'The HTTPS server is running on port ' + config.httpsPort);
  });
};

// Export the module
module.exports = server;