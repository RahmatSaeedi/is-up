const crypro = require('crypto');
const {hashingSecret} = require('../server/config');
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


module.exports = helpers;