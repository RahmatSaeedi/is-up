const { user, host, port, password } = require('../../../psqlConfig');

module.exports = {
  httpPort: 80,
  httpsPort: 443,
  pathToSslKey: "./server/https/key.pem",
  pathToSslCert: "./server/https/cert.pem",
  pSqlConfig: {
    user,
    host,
    port,
    password
  },
  hashingSecret: 'topSecret'
};