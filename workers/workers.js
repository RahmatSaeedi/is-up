const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const _db = require('../db/db_v2'); // OR '../fs/data' OR '../db/db_v1'
const _db0 = require('../fs/data');
const _is = require('../lib/helpers').is;
const config = require('../config').workers;
const workers = {};


/********************************
  Workers
********************************/
workers.log = (checkData, checkOutcome, state, timeOfCheck) => {
  const logData = {
    'check' : checkData,
    'outcome' : checkOutcome,
    'state' : state,
    'time' : timeOfCheck
  };

};

workers.processCheckOutcome = (checkData, checkOutcome) => {
  const state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  
  // updates the check date
  const timeOfCheck = Date.now();
  workers.log(checkData, checkOutcome, state, timeOfCheck);

  checkData.state = state;
  checkData.lastChecked = timeOfCheck;
  _db.update('checks', checkData.id, checkData, (err) => {
    if (err) {
      console.log(`Workers: Could not update the check with ID=${checkData.id}.`);
    }
  });
};

workers.performCheck = (checkData) => {
  const checkOutcome = {
    'error' : false,
    'responseCode' : false
  };
  
  const parsedUrl = url.parse(checkData.protocol + '://' + checkData.url, true);
  const requestDetail = {
    protocol: checkData.protocol + ':',
    hostname: parsedUrl.hostname,
    method: checkData.method.toUpperCase(),
    path: parsedUrl.path,
    timeout: checkData.timeoutSeconds * 1000
  };

  let _module;
  switch (checkData.protocol) {
  case 'http':
    _module = http;
    break;

  case 'https':
    _module = https;
    break;
    
  default:
    _module = false;
    break;
  }

  if (_module) {
    let outcomeSent = false;

    const req = _module.request(requestDetail, (res) => {
      checkOutcome.responseCode = res.statusCode;
      if (!outcomeSent) {
        outcomeSent = true;
        workers.processCheckOutcome(checkData, checkOutcome);
      }
    });

    req.on('error', (err) => {
      checkOutcome.error = {
        error: true,
        value: err
      };
      if (!outcomeSent) {
        outcomeSent = true;
        workers.processCheckOutcome(checkData, checkOutcome);
      }
    });

    req.on('timeout', (err) => {
      checkOutcome.error = {
        error: true,
        value: 'timeout'
      };
      if (!outcomeSent) {
        outcomeSent = true;
        workers.processCheckOutcome(checkData, checkOutcome);
      }
    });

    req.end();
  } else {
    console.log(`Workers: Could not find the module to perform the '${checkData.protocol}' request.`);
  }
};

workers.validateCheckData = (checkData) => {
  checkData = typeof(checkData) && checkData !== null ? checkData : {};
  checkData.id = _is.checkId(checkData.id);
  checkData.email = _is.email(checkData.email);
  checkData.protocol = _is.protocol(checkData.protocol);
  checkData.method = _is.method(checkData.method);
  checkData.url = _is.str(checkData.url);
  checkData.successCodes = _is.successCodes(checkData.successCodes);
  checkData.timeoutSeconds = _is.timeoutSeconds(checkData.timeoutSeconds);

  checkData.state = _is.state(checkData.state);
  checkData.lastChecked = _is.lastChecked(checkData.lastChecked);

  if (checkData.id && checkData.email && checkData.protocol &&
    checkData.method && checkData.url && checkData.successCodes &&
    checkData.timeoutSeconds) {
    workers.performCheck(checkData);
  } else {
    console.log('Workers: One of the checks is invalid.');
  }
};

workers.gatherAllChecks = () => {
  _db.list('checks', (err, checkIDs) => {
    if (!err && checkIDs && checkIDs.length > 0) {
      checkIDs.forEach((check) => {
        _db.read('checks', check.id, (err, checkData) => {
          if (!err && checkData) {
            workers.validateCheckData(checkData);
          } else {
            console.log(`Workers: ${check} check could not be read.`);
          }
        });
      });
    } else {
      console.log("Workers: No checks to process");
    }
  });
};

workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * config.checkFrequencyInSeconds);
};

workers.init = function() {
  workers.gatherAllChecks();

  workers.loop();
};

module.exports = workers;
