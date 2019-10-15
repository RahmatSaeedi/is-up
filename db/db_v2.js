const  query  = require('./db');
const permittedTables = ['users', 'tokens', 'checks'];

/********************************
  Create
********************************/
const createUser = (data , cb) => {
  const values = [
    String(data.firstName),
    String(data.lastName),
    String(data.email),
    String(data.password),
    String(data.tosAgreement)
  ];

  query("INSERT INTO users(first_name, last_name, email, password, tos_agreement, date_created) VALUES($1, $2, $3, $4, $5, NOW())", values, (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not add the user to the database.");
    }
  });
};

const createToken = (data , cb) => {
  const values = [
    String(data.email),
    String(data.id),
    String(data.expires / 1000)
  ];
  query("INSERT INTO tokens(email, id, expires) VALUES($1, $2, to_timestamp($3))", values, (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not add the token to the database.");
    }
  });
};

const createCheck = (data , cb) => {
  const values = [
    String(data.id),
    String(data.email),
    String(data.protocol),
    String(data.url),
    String(data.method),
    String(data.successCodes),
    String(data.timeoutSeconds),
    String(data.state ? data.state : 'down'),
    data.lastChecked ? data.lastChecked : Date.now() / 1000
  ];

  query("INSERT INTO user_checks(check_id, email) VALUES($1, $2)", [data.id, data.email], (qErr) => {
    if (!qErr) {
      query("INSERT INTO checks(id, email, protocol, url, method, success_codes, timeout_seconds, state, last_checked) \
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9))", values, (qErr) => {
       if (!qErr) {
         cb(false);
       } else {
         cb("Could not add the check to the database.");
       }
     });
    } else {
      cb("Could not add the user_check to the database.");
    }
  });



};

/********************************
  Select
********************************/

const selectUser = (email, cb) => {
  query(`SELECT * FROM users WHERE email = $1`, [email], (qErr, qRes) => {
    if (!qErr && qRes.rows[0]) {
      const userData = {
        firstName   : qRes.rows[0].first_name,
        lastName    : qRes.rows[0].last_name,
        email       : qRes.rows[0].email,
        password    : qRes.rows[0].password,
        tosAgreement: qRes.rows[0].tos_agreement,
        dateCreated : qRes.rows[0].date_created,
        checks : selectUser_checks(qRes.rows[0].email)
      };
      cb(false, userData);
    } else {
      cb("An error occurred while looking up the user.");
    }
  });
};

const selectToken = (id , cb) => {
  query(`SELECT * FROM tokens WHERE id = $1`, [id], (qErr, qRes) => {
    if (!qErr && qRes.rows[0]) {
      const tokenData = {
        email   : qRes.rows[0].email,
        id      : qRes.rows[0].id,
        expires : qRes.rows[0].expires // pg already *1000 and converts it to js date format
      };
      cb(false, tokenData);
    } else {
      cb("An error occurred while looking up the token.");
    }
  });
};

const selectCheck = (id , cb) => {
  query(`SELECT * FROM checks WHERE id = $1`, [id], (qErr, qRes) => {
    if (!qErr && qRes.rows[0]) {
      const checkData = {
        id: qRes.rows[0].id,
        email: qRes.rows[0].email,
        protocol: qRes.rows[0].protocol,
        url: qRes.rows[0].url,
        method: qRes.rows[0].method,
        successCodes: qRes.rows[0].success_codes.split(',').map(Number),
        timeoutSeconds: qRes.rows[0].timeout_seconds,
        state: qRes.rows[0].state,
        lastChecked: qRes.rows[0].last_checked
      };
      cb(false, checkData);
    } else {
      cb("An error occurred while looking up the check.");
    }
  });
};

const selectUser_checks = (email) => {
  query(`SELECT * FROM user_checks WHERE email = $1`, [email], (qErr, qRes) => {
    if (!qErr) {
      if(qRes && qRes.rows) {
        let userChecks = [];
        qRes.rows.forEach((check) => {
          userChecks.push(check.check_id);
        });
        return userChecks;
      } else{
        return [];
      }
    } else {
      return "An error occurred while looking up the user_checks.";
    }
  });
}

/********************************
  Update
********************************/

const updateUser = (data, cb) => {
  const values = [
    String(data.firstName),
    String(data.lastName),
    String(data.password),
    String(data.email)
  ];

  query(`UPDATE users SET first_name = $1, last_name = $2, password = $3
  WHERE email = $4`, values, (qErr) => {
    if (!qErr) {
      updateUserChecks(data.email, data.checks);
      cb(false);
    } else {
      cb("Could not update the user.");
    }
  });
};

const updateToken = (data, cb) => {
  const values = [
    String(data.email),
    String(data.id),
    String(data.expires / 1000),
    String(data.id)
  ];

  query(`UPDATE tokens SET email = $1, id = $2, expires = to_timestamp($3)
  WHERE id = $4`, values, (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not update the token.");
    }
  });
};

const updateCheck = (data, cb) => {
  const values = [
    String(data.email),
    String(data.protocol),
    String(data.url),
    String(data.method),
    String(data.successCodes),
    String(data.timeoutSeconds),
    String(data.state),
    data.lastChecked /1000,
    String(data.id)
  ];

  query(`UPDATE checks SET email = $1, protocol = $2, url = $3, method = $4, success_codes = $5, timeout_seconds = $6, state = $7, last_checked = to_timestamp($8)
  WHERE id = $9`, values, (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      console.log(qErr);
      cb("Could not update the check.");
    }
  });
};

const updateUserChecks = (email, checkIDsToKeep) => {
  const currentChecks = selectUser_checks(email);
  if (currentChecks && currentChecks instanceof Array && currentChecks.length > 0 && checkIDsToKeep && checkIDsToKeep instanceof Array) {
    currentChecks.forEach(check => {
      if(checkIDsToKeep.indexOf(check) < 0) {
        query(`DELETE FROM user_checks WHERE check_id = $1`, [id], (qErr) => {
          if (!qErr) {
            cb(false);
          } else {
            cb("Could not remove user_check from db.");
          }
        });
      }
    });
  }
};

/********************************
  Delete
********************************/

const deleteUser = (email , cb) => {
  query(`DELETE FROM users WHERE email = $1`, [email], (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not remove the user from db.");
    }
  });
};

const deleteToken = (id , cb) => {
  query(`DELETE FROM tokens WHERE id = $1`, [id], (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not remove the token from db.");
    }
  });
};

const deleteCheck = (id , cb) => {
  query(`DELETE FROM user_checks WHERE check_id = $1`, [id], (qErr) => {
    if (!qErr) {
      cb(false);
    } else {
      cb("Could not remove the check from db.");
    }
  });
};


const lib = {};

/********************************
  Insert a row
********************************/
lib.create = function(tableName, uID, dataObject, cb) {
  tableName = typeof(tableName) === 'string'  && permittedTables.indexOf(tableName) > -1 ?  permittedTables[permittedTables.indexOf(tableName)] : false;
  uID = typeof(uID) === 'string' ? uID : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && uID && dataObject && cb) {
    switch(tableName) {
      case 'users':
          createUser(dataObject, cb);
        break;
      case 'tokens':
          createToken(dataObject, cb);
        break;
      case 'checks':
          createCheck(dataObject, cb);
        break;
    }
  } else {
    cb("Expected strings for 'tableName'/'uID', object for 'dataObject', and function for 'cb'.");
  }
};


/********************************
  Read a row from db
********************************/
lib.read = function(tableName, uID, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  uID = typeof(uID) === 'string' ? String(uID) : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && uID && cb) {
    switch(tableName) {
      case 'users':
          selectUser(uID, cb);
        break;
      case 'tokens':
          selectToken(uID, cb);
        break;
      case 'checks':
          selectCheck(uID, cb);
        break;
    }
  } else {
    cb("Expected strings for 'tableName'/'uID', object for 'dataObject', and function for 'cb'.");
  }
};


/********************************
  Update a row
********************************/
lib.update = function(tableName, uID, dataObject, cb) {
  tableName = typeof(tableName) === 'string'  && permittedTables.indexOf(tableName) > -1 ?  permittedTables[permittedTables.indexOf(tableName)] : false;
  uID = typeof(uID) === 'string' ? uID : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && uID && dataObject && cb) {
    switch(tableName) {
      case 'users':
          updateUser(dataObject, cb);
        break;
      case 'tokens':
          updateToken(dataObject, cb);
        break;
      case 'checks':
          updateCheck(dataObject, cb);
        break;
    }
  } else {
    cb("Expected strings for 'tableName'/'uID', object for 'dataObject', and function for 'cb'.");
  }
};


/********************************
  Delete a row
********************************/
lib.delete = function(tableName, uID, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  uID = typeof(uID) === 'string' ? uID : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && uID && cb) {
    switch(tableName) {
      case 'users':
          deleteUser(uID, cb);
        break;
      case 'tokens':
          deleteToken(uID, cb);
        break;
      case 'checks':
          deleteCheck(uID, cb);
        break;
    }
  } else {
    cb("Expected strings for 'tableName'/'uID', and function for 'cb'.");
  }
};


/********************************
  List all uID
********************************/
lib.list = function(tableName, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && cb) {
    const uID = tableName === 'users' ? 'email' : 'id';

    query(`SELECT ${uID} FROM ${tableName}`, null, (qErr, qRes) => {
      if (!qErr && qRes.rows) {
        cb(false, qRes.rows);
      } else {
        cb("Could not retrive the data from db.");
      }
    });
  } else {
    cb("Expected string value for 'tableName' and function for 'cb'.");
  }
};


module.exports = lib;