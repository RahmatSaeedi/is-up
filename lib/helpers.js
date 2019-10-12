const crypro = require('crypto');
const {hashingSecret} = require('../config');
const helpers = {};

helpers.hash = (str) => {
  if (typeof(str) === 'string' && str.length > 0) {
    return crypro.createHmac('sha256', hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
};


// parses a string to JSON without throwing
helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};


// Create a string of random alphanumeral characters of a given length
helpers.createRandomString = (len) => {
  len = typeof(len) === 'number' && len > 0 ? len : false;
  if (len) {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let buffer = '';
    while (len) {
      buffer = buffer + charSet.charAt(Math.floor(Math.random() * charSet.length));
      len -= 1;
    }
    return buffer;
  } else {
    return false;
  }

};

module.exports = helpers;