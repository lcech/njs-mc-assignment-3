/*
 * Create and export all the variables
 */

// Setup environments
let environments = {},
  currentEnvironment,
  environmentToExport;

// Staging (default) environemnt
environments.staging = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'staging',
  'hashingSecret': 'justSomeRandomString',
  'firebase': {
    'apiKey': 'AIzaSyDgmxp3s7N_5EItF4jbWeYCpwvR9O1WXEo',
    'authDomain': 'pizza-delivery-354bc.firebaseapp.com',
    'databaseURL': 'https://pizza-delivery-354bc.firebaseio.com',
    'projectId': 'pizza-delivery-354bc',
    'storageBucket': 'pizza-delivery-354bc.appspot.com',
    'messagingSenderId': '232461015225'
  },
  'stripe': {
    'apiKey': 'sk_test_P1a6AGsIyHKLuYWDaQcHyOzX'
  },
  'mailgun': {
    'baseUrl': 'api.mailgun.net',
    'domain': 'sandbox2dd84763fe2544d7841d72d46b82b726.mailgun.org',
    'apiKey': '5b2650edbd71fc9aea0d7bf52758faa4-49a2671e-d087e5cb',
    'from': 'ja@lukascech.cz'
  },
  'twilio': {
    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone' : '+15005550006'
  },
  'templateGlobals': {
    'appName': 'pizzaDelivery',
    'companyName': 'Pizza Corp.',
    'yearCreated': '2019',
    'baseUrl': 'http://localhost:5000/'
  }
};

// Production environemnt
environments.production = {
  'httpPort': 5000,
  'httpsPort': 50001,
  'envName': 'production',
  'hashingSecret': 'justAnotherRandomString',
  'twilio': {
    'fromPhone': 'test',
    'accountSid': '',
    'authToken': ''
  }
};

// Determine which environemnt should be exported
currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check if defined environment exists
environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the environemnt
module.exports = environmentToExport;