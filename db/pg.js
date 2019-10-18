const { Pool } = require('pg');
const { user, host, port, password } = require('../config').pSqlConfig;

const pool = new Pool({
  user,
  password,
  host,
  port,
  database: 'isup'
});


const query = (queryString, values, cb) => {
  pool.query(queryString, values, (qErr,qResp) => {

    if (typeof(cb) === "function") {
      cb(qErr, qResp);
    }
  });
};


module.exports = query;