const  query  = require('./db');
const lib = {};
const permittedTables = ['users', 'tokens', 'checks'];

/********************************
  queries list
********************************/
const queries = {};
queries.users = {
  create : {
    columns: 'first_name, last_name, email, password, tos_agreement, date_created',
    values: '$1, $2, $3, $4, $5, NOW()',
    data: (o) => {
      return [
        String(o.firstName),
        String(o.lastName),
        String(o.email),
        String(o.password),
        String(o.tosAgreement)
      ];
    }
  },
  read : {
    condition : 'email = $1',
    data: (email) => {
      return [email];
    },
    format: (resRow) => {
      let checks;
      if (resRow.checks.length === 0) {
        checks = [];
      } else {
        checks = resRow.checks.split(',');
      }
      return {
        firstName   : resRow.first_name,
        lastName    : resRow.last_name,
        email       : resRow.email,
        password    : resRow.password,
        tosAgreement: resRow.tos_agreement,
        dateCreated : resRow.date_created,
        checks
      };
    }
  },
  update: {
    columns : 'first_name = $1, last_name = $2, password = $3, checks = $4',
    condition : 'email = $5',
    data : (o) => {
      return [
        String(o.firstName),
        String(o.lastName),
        String(o.password),
        String(o.checks),
        String(o.email)
      ];
    }
  },
  delete : {
    condition : 'email = $1',
    data : (email) => {
      return [email];
    }
  }
};

queries.tokens = {
  create : {
    columns: 'email, id, expires',
    values: '$1, $2, to_timestamp($3)',
    data: (o) => {
      return [
        String(o.email),
        String(o.id),
        String(o.expires / 1000)
      ];
    }
  },
  read : {
    condition : 'id = $1',
    data: (id) => {
      return [id];
    },
    format: (resRow) => {
      return {
        email   : resRow.email,
        id      : resRow.id,
        expires : resRow.expires // pg already *1000 and converts it to js date format
      };
    }
  },
  update: {
    columns : 'email = $1, id = $2, expires = to_timestamp($3)',
    condition : 'id = $4',
    data : (o) => {
      return [
        String(o.email),
        String(o.id),
        String(o.expires / 1000),
        String(o.id)
      ];
    }
  },
  delete : {
    condition : 'id = $1',
    data : (id) => {
      return [id];
    }
  }
};

queries.checks = {
  create : {
    columns: 'id, email, protocol, url, method, success_codes, timeout_seconds',
    values: '$1, $2, $3, $4, $5, $6, $7',
    data: (o) => {
      return [
        String(o.id),
        String(o.email),
        String(o.protocol),
        String(o.url),
        String(o.method),
        String(o.successCodes),
        String(o.timeoutSeconds)
      ];
    }
  },
  read : {
    condition : 'id = $1',
    data: (id) => {
      return [id];
    },
    format: (resRow) => {
      return {
        id: resRow.id,
        email: resRow.email,
        protocol: resRow.protocol,
        url: resRow.url,
        method: resRow.method,
        successCodes: resRow.success_codes,
        timeoutSeconds: resRow.timeout_seconds
      };
    }
  },
  update: {
    columns : 'email = $1, protocol = $2, url = $3, method = $4, success_codes = $5, timeout_seconds = $6',
    condition : 'id = $7',
    data : (o) => {
      return [
        String(o.email),
        String(o.protocol),
        String(o.url),
        String(o.method),
        String(o.successCodes),
        String(o.timeoutSeconds),
        String(o.id)
      ];
    }
  },
  delete : {
    condition : 'id = $1',
    data : (id) => {
      return [id];
    }
  }
};
/********************************
  Insert a row
********************************/
lib.create = function(tableName, uID, dataObject, cb) {
  tableName = typeof(tableName) === 'string'  && permittedTables.indexOf(tableName) > -1 ?  permittedTables[permittedTables.indexOf(tableName)] : false;
  uID = typeof(uID) === 'string' ? uID : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && uID && dataObject && cb) {
    query(`INSERT INTO ${tableName} (${queries[tableName].create.columns})
          VALUES(${queries[tableName].create.values})`, queries[tableName].create.data(dataObject), (qErr) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not add the row to the database.");
      }
    });
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
    query(`SELECT * FROM ${tableName} WHERE ${queries[tableName].read.condition}`, queries[tableName].read.data(uID), (qErr, qRes) => {
      if (!qErr && qRes.rows[0]) {
        const respObject = queries[tableName].read.format(qRes.rows[0]);
        cb(false, respObject);
      } else {
        cb("An error occurred while looking up the row.");
      }
    });
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
    query(`UPDATE  ${tableName} SET ${queries[tableName].update.columns}
    WHERE ${queries[tableName].update.condition}`, queries[tableName].update.data(dataObject), (qErr) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not update the row.");
      }
    });
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
    query(`DELETE FROM ${tableName} WHERE ${queries[tableName].delete.condition}`, queries[tableName].delete.data(uID), (qErr) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not remove the user from db.");
      }
    });
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
        console.log(qRes.rows);
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