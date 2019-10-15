const { user, host, port, password } = require('../../psqlConfig');


const  lib = {
  pSqlConfig: {
    user,
    host,
    port,
    password
  },
  hashingSecret: 'topSecret',
  server : {
    httpPort: 80,
    httpsPort: 443,
  },
  handlers : {
    minPasswordLength: 10,
    tokenIDLength: 32,
    checkIdLength: 32,
    maxChecksLimit: 10
  },
  workers : {
    checkFrequencyInSeconds: 15
  },
  tempalteGlobals : {
    appName : 'is UP',
    companyName : 'isUp',
    yearCreated : '2018',
    baseUrl : 'http://localhost/'
  }
};

module.exports = lib;