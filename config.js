const { user, host, port, password } = require('../../psqlConfig');

module.exports = {
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
  }
};