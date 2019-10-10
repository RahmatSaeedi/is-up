const  query  = require('./db');
const lib = {};
const permittedTables = ['users'];


/********************************
  Create a new user
********************************/
lib.create = function(tableName, email, dataObject, cb) {
  tableName = typeof(tableName) === 'string'  && permittedTables.indexOf(tableName) > -1 ?  permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? email : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && email && dataObject && cb) {
    query(`INSERT INTO ${tableName} (firstName, lastName, email, password, tosAgreement, date_created)
          VALUES($1, $2, $3, $4, $5, NOW())`, [
      String(dataObject.firstName),
      String(dataObject.lastName),
      String(dataObject.email),
      String(dataObject.password),
      String(dataObject.tosAgreement)
    ], (qErr) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not add the user to the database.");
      }
    });
  } else {
    cb("Expected strings for 'tableName'/'email', object for 'dataObject', and function for 'cb'.");
  }
};

/********************************
  Update a given user
********************************/
lib.update = function(tableName, email, dataObject, cb) {
  tableName = typeof(tableName) === 'string'  && permittedTables.indexOf(tableName) > -1 ?  permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? email : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && email && dataObject && cb) {
    query(`UPDATE  ${tableName} SET firstName = $1, lastName = $2, email = $3, password = $4, tosAgreement = $5)
    WHERE email = $4`, [
      String(dataObject.firstName),
      String(dataObject.lastName),
      String(dataObject.email),
      String(dataObject.password),
      String(dataObject.tosAgreement)
    ], (qErr, qRes) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not update the user.");
      }
    });
  } else {
    cb("Expected strings for 'tableName'/'email', object for 'dataObject', and function for 'cb'.");
  }
};

/********************************
  Read user info from db
********************************/
lib.read = function(tableName, email, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? String(email) : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && email && cb) {
    query(`SELECT * FROM ${tableName} WHERE email =$1`, [email], (qErr, qRes) => {
      if (!qErr) {
        cb(false, qRes.rows[0]);
      } else {
        cb("An error occurred while looking up the user.");
      }
    });
  } else {
    cb("Expected strings for 'tableName'/'email', object for 'dataObject', and function for 'cb'.");
  }
};


/********************************
  Delete a user
********************************/
lib.delete = function(tableName, email, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? email : false;
  cb = typeof(cb) === 'function' ? cb : false;


  if (tableName && email && cb) {
    query(`DELETE FROM ${tableName} WHERE email = $1`, [email], (qErr, qRes) => {
      if (!qErr) {
        cb(false);
      } else {
        cb("Could not remove the user from db.");
      }
    });
  } else {
    cb("Expected strings for 'tableName'/'email', and function for 'cb'.");
  }
};








module.exports = lib;