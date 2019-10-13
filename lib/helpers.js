const crypro = require('crypto');
const config = require('../config');


const helpers = {};

/****************************************************************
  hashes a string: sha256 >>> digest:hex
****************************************************************/
helpers.hash = (str) => {
  if (typeof(str) === 'string' && str.length > 0) {
    return crypro.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
};



/****************************************************************
  parses a string to JSON without throwing
****************************************************************/
helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};



/****************************************************************
  Creates a string of random alphanumeral characters
****************************************************************/
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



/****************************************************************
  Validation helpers
****************************************************************/
helpers.is = {};

helpers.is.email = (email = '') => {
  const emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return typeof(email) === 'string' && email.trim().length > 0 && emailRegExp.test(email.trim().toLowerCase()) ? email.trim().toLowerCase() : false;
};

helpers.is.str = (str = '', minLength = 1, exactLength = false) => {
  if (exactLength) {
    str = str.trim().length === minLength ? str.trim() : false;
  }
  return typeof(str) === 'string' && str.trim().length >= minLength ? str.trim() : false;
};

helpers.is.token = (token = '') => {
  return typeof(token) === 'string' && token.trim().length === config.handlers.tokenIDLength ? token.trim() : false;
};

helpers.is.checkId = (id = '') => {
  return typeof(id) === 'string' && id.trim().length === config.handlers.checkIdLength ? id.trim() : false;
};

helpers.is.protocol = (prot  = '') => {
  const validProtocol = ['http', 'https'];
  return typeof(prot) === 'string' && validProtocol.indexOf(prot.trim()) > -1 ? prot.trim() : false;
};

helpers.is.method = (method  = '') => {
  const validMethod = ['post', 'get', 'put', 'delete'];
  return typeof(method) === 'string' && validMethod.indexOf(method.trim()) > -1 ? method.trim() : false;
};

helpers.is.successCodes = (successCodes  = []) => {
  return typeof(successCodes) === 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false;
};

helpers.is.timeoutSeconds = (timeoutSeconds = 0) => {
  return typeof(timeoutSeconds) === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds > 0 && timeoutSeconds <= 5 ? timeoutSeconds : false;
};

helpers.is.state = (state  = 'down') => {
  const validState = ['up', 'down'];
  return typeof(state) === 'string' && validState.indexOf(state.trim()) > -1 ? state.trim() : 'down';
};
helpers.is.lastChecked = (lastChecked) => {
  return typeof(lastChecked) === 'number' && lastChecked % 1 === 0 && lastChecked > 0 ? lastChecked : false;
};

module.exports = helpers;