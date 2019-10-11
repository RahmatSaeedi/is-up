const  query  = require('./db');
const lib = {};
const permittedTables = ['users', 'tokens'];

/********************************
  queries list
********************************/
const queries = {};
queries.users = {
  create : {
    columns: 'first_name, last_name, email, password, tos_agreement, date_created',
    values: '$1, $2, $3, $4, $5, NOW()',
    data: (dataObject) => {
      return [
        String(dataObject.firstName),
        String(dataObject.lastName),
        String(dataObject.email),
        String(dataObject.password),
        String(dataObject.tosAgreement)
      ];
    }
  },
  read : {
    condition : 'email = $1',
    data: (email) => {
      return [email];
    },
    format: (resRow) => {
      return {
        firstName   : resRow.first_name,
        lastName    : resRow.last_name,
        email       : resRow.email,
        password    : resRow.password,
        tosAgreement: resRow.tos_agreement,
        dateCreated : resRow.date_created
      };
    }
  },
  update: {
    columns : 'first_name = $1, last_name = $2, password = $3',
    condition : 'email = $4',
    data : (dataObject) => {
      return [
        String(dataObject.firstName),
        String(dataObject.lastName),
        String(dataObject.password),
        String(dataObject.email)
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
    data: (dataObject) => {
      return [
        String(dataObject.email),
        String(dataObject.id),
        String(dataObject.expires / 1000)
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
        expires : resRow.expires * 1000
      };
    }
  },
  update: {
    columns : 'email = $1, id = $2, expires = to_timestamp($3)',
    condition : 'id = $4',
    data : (dataObject) => {
      return [
        String(dataObject.email),
        String(dataObject.id),
        String(dataObject.expires / 1000),
        String(dataObject.id)
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
  Create a new
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








module.exports = lib;