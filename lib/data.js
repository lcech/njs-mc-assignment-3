/*
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('data');

// Container for the module to be exported
const lib = {};

// Base directory for the data files
lib.baseDir = path.join(__dirname, '/../.data/');

lib._writeFile = (fileDescriptor, stringData, callback) => {
  fs.writeFile(fileDescriptor, stringData, (error) => {
    if (!error) {
      fs.close(fileDescriptor, (error) => {
        if (!error) {
          callback(false);
        } else {
          callback('Error closing new file.');
        }
      });
    } else {
      callback('Error writing to new file.');
    }
  });
};

// Write data to a file
lib.create = (dir, file, data, callback) => {
  debug('Writing file: ' + lib.baseDir + dir + '/' + file + '.json');

  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (error, fileDescriptor) => {
    if (!error && fileDescriptor) {
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Write to file and close it
      lib._writeFile(fileDescriptor, stringData, callback);
    } else {
      callback('Could not create new file, it may already exist.');
    }
  });
};

// Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (error, data) => {
    if (!error && data) {
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(error, data);
    }
  });
};

// Update the file with new data
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (error, fileDescriptor) => {
    if (!error && fileDescriptor) {
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // Write to file and close it
          lib._writeFile(fileDescriptor, stringData, callback);
        } else {
          callback('Error truncating file.');
        }
      });
    } else {
      callback('Could not open the file for updating, it may not exist yet.');
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (error) => {
    if (!error) {
      callback(false);
    } else {
      callback('Error deleting file.');
    }
  });
};

// List all the files in a directory
lib.list = (dir, callback) => {
  fs.readdir(lib.baseDir + dir + '/', (error, data) => {
    if (!error && data && data.length > 0) {
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(error, data);
    }
  });
};

// Export the module
module.exports = lib;