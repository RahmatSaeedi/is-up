const { user, host, port, password } = require('../../psqlConfig');


const  lib = {
  pSqlConfig: {
    user,
    host,
    port,
    password
  },
  database : {
    database : 'db' // Choose bewteen file-system based ('fs') or psql based ('db') databas.
  },
  hashingSecret: 'topSecret',
  server : {
    httpPort: 80,
    httpsPort: 443,
  },
  handlers : {
    minPasswordLength: 1,
    tokenIDLength: 32,
    checkIdLength: 32,
    maxChecksLimit: 10
  },
  workers : {
    checkFrequencyInSeconds: 5
  },
  tempalteGlobals : {
    appName : 'is UP',
    companyName : 'isUp',
    yearCreated : '2018',
    baseUrl : 'http://localhost/'
  }
};

module.exports = lib;