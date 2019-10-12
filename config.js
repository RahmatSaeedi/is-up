const { user, host, port, password } = require('../../psqlConfig');

module.exports = {
  httpPort: 80,
  httpsPort: 443,
  pSqlConfig: {
    user,
    host,
    port,
    password
  },
  hashingSecret: 'topSecret'
};