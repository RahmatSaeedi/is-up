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
    query(`INSERT INTO ${tableName} (first_name, last_name, email, password, tos_agreement, date_created)
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
  Read user info from db
********************************/
lib.read = function(tableName, email, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? String(email) : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && email && cb) {
    query(`SELECT * FROM ${tableName} WHERE email =$1`, [email], (qErr, qRes) => {
      if (!qErr && qRes.rows[0]) {
        const userObject  = {
          firstName   : qRes.rows[0].first_name,
          lastName    : qRes.rows[0].last_name,
          email       : qRes.rows[0].email,
          password    : qRes.rows[0].password,
          tosAgreement: qRes.rows[0].tos_agreement,
          dateCreated : qRes.rows[0].date_created
        };
        cb(false, userObject);
      } else {
        cb("An error occurred while looking up the user.");
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
    query(`UPDATE  ${tableName} SET first_name = $1, last_name = $2, password = $3
    WHERE email = $4`, [
      String(dataObject.firstName),
      String(dataObject.lastName),
      String(dataObject.password),
      String(dataObject.email)
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
  Delete a user
********************************/
lib.delete = function(tableName, email, cb) {
  tableName = typeof(tableName) === 'string' && permittedTables.indexOf(tableName) > -1 ? permittedTables[permittedTables.indexOf(tableName)] : false;
  email = typeof(email) === 'string' ? email : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (tableName && email && cb) {
    query(`DELETE FROM ${tableName} WHERE email = $1`, [email], (qErr) => {
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