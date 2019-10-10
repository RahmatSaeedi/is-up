const { Pool } = require('pg');
const { user, host, port, password } = require('../server/config').pSqlConfig;

const pool = new Pool({
  user,
  password,
  host,
  port,
  database: 'isup'
});


function query(queryString, values, cb){
  pool.query(queryString, values, (q_err,q_res) => {

    if(typeof(cb) === "function")
      cb(q_err, q_res);
  });
}


module.exports = {
  query
};