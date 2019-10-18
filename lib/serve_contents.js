const join = require('path').join;
const fs = require('fs');
const tempalteGlobals = require('../config').tempalteGlobals;


const lib = {};

const interpolate = (str, data) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : '';
  data = typeof(data) === 'object' && data !== null ? data : {};

  for (let keyName in tempalteGlobals) {
    if (Object.prototype.hasOwnProperty.call(tempalteGlobals, keyName)) {
      data['global.' + keyName] = tempalteGlobals[keyName];
    }
  }
  for (let key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key) && typeof(data[key]) === 'string') {

      str = str.replace('{' + key + '}', data[key]);
    }
  }
  return str;
};



lib.getTemplate = function(templateName, data, cb) {
  templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) === 'object' && data !== null ? data : {};

  if (templateName) {
    const templateDir = join(__dirname, '/../templates/');
    fs.readFile(templateDir + templateName + '.html','utf8', (err, str) => {
      if (!err && str && str.length > 0) {

        str = interpolate(str, data);
        cb(false, str);
      } else {
        cb("No template could be found.");
      }
    });
  } else {
    cb('A valid template name was not defined.');
  }
};



lib.addUniversalTemplates = (str, data, cb) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : '';
  data = typeof(data) === 'object' && data !== null ? data : {};

  lib.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      lib.getTemplate('_footer', data, (err, footerString) =>{
        if (!err && footerString) {
          cb(false, headerString + str + footerString);
        } else {
          cb('Could not find the footer template.');
        }
      });
    } else {
      cb('Could not find the header template.');
    }
  });
};


lib.getStaticAsset = (fileName, cb) => {
  fileName = typeof(fileName) === 'string' && fileName.length > 0 ? fileName : '';

  if (fileName) {
    const publicDir = join(__dirname, '../public/');
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        cb(false, data);
      } else {
        cb('No file could be found.');
      }
    });
  } else {
    cb('A valid filename was not specified.');
  }

};

module.exports = lib;