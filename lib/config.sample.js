/*
 * Create and export all the variables
 */

// Setup environments
let environments = {},
  currentEnvironment,
  environmentToExport;

// Staging (default) environemnt
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'justSomeRandomString',
  'firebase': {
    'apiKey': 'YOUR-API-KEY',
    'authDomain': 'YOUR-PROJECT-ID.firebaseapp.com',
    'databaseURL': 'https://YOUR-PROJECT-ID.firebaseio.com',
    'projectId': 'YOUR-PROJECT-ID',
    'storageBucket': 'YOUR-PROJECT-ID.appspot.com',
    'messagingSenderId': 'YOUR-MESSAGING-SENDER-ID'
  },
  'stripe': {
    'apiKey': 'YOUR_STRIPE_API_KEY'
  },
  'mailgun': {
    'baseUrl': 'https://api.mailgun.net/v3',
    'domain': 'YOUR_MAILGUN_DOMAIN',
    'apiKey': 'YOUR_MAILGUN_API_KEY',
    'from': 'from@address.com'
  },
  'twilio': {
    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone' : '+15005550006'
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