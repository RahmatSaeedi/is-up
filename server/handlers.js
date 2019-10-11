// callback a status code, & a payload object
const _db0 = require('../db/index');
const _db = require('../fs/data');
const helpers = require('../lib/helpers');


const handlers = {};

/********************************
  Validation helpers
********************************/
const _is = {};

_is.email = (email = '') => {
  const emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return typeof(email) === 'string' && email.trim().length > 0 && emailRegExp.test(email.trim().toLowerCase()) ? email.trim().toLowerCase() : false;
};

_is.str = (str = '', minLength = 0) => {
  return typeof(str) === 'string' && str.trim().length > minLength ? str.trim() : false;
};

/********************************
  users Handler
********************************/
handlers.users = (data, cb) => {
  const methods = ['post', 'get', 'put', 'delete'];
  if (methods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
};
handlers._users = {};

// Users - post
// Required data: firstName, lastName, email, password(10 characters, no leading or trailling whitespaces), tosAgreement
// Optional data: none
handlers._users.post = (data, cb) => {
  const firstName = _is.str(data.payload.firstName);
  const lastName = _is.str(data.payload.lastName);
  const email = _is.email(data.payload.email);
  const password = _is.str(data.payload.password, 10);
  const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

  if (firstName && lastName && email && password && tosAgreement) {
    // Make sure the user doesn't exist already
    _db.read('users', email, (err, data) => {
      if (err || !data.length) {
        // Hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            tosAgreement: true
          };
  
          _db.create('users', email, userObject, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, {'Error' : 'Could not create the new user.'});
            }
          });
        } else {
          cb(500, {'Error' : 'Could not hash the password.'});
        }
      } else {
        cb(400,{'Error': 'A user with that email already exists.'});
      }
    });
  } else {
    cb(400, {'Error' : 'Missing required fields.'});
  }
};

// Users - get
// Required data: email
// Optional data: none
// @TODO authentication
handlers._users.get = (data, cb) => {
  const email = _is.email(data.query.email);

  if (email) {
    _db.read('users', email, (err, resp) => {
      if (!err && resp) {
        delete resp.password;
        cb(200, resp);
      } else {
        cb(404);
      }
    });

  } else {
    cb(400, {"Error" : "Missing required field."});
  }
};

// Users - put
// Required data: email, at least one optional data
// Optional data: firstName, lastName, password
// @TODO authentication
handlers._users.put = (data, cb) => {
  const email = _is.email(data.payload.email);
  const firstName = _is.str(data.payload.firstName);
  const lastName = _is.str(data.payload.lastName);
  const password = _is.str(data.payload.password, 10);

  if (email && (firstName || lastName || password)) {
    _db.read('users', email, (err, userData) => {
      if (!err && userData) {
        if (firstName) {
          userData.firstName = firstName;
        }
        if (lastName) {
          userData.lastName = lastName;
        }
        if (password) {
          userData.password = helpers.hash(password);
        }
        _db.update('users', email, userData, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500, {'Error' : 'Could not update the user.'});
          }
        });

      } else {
        cb(404, {'Error': 'The user was not found.'});
      }
    });
  } else {
    cb(400, {'Error' : 'Missing required fields.'});
  }

};

// Users - delete
// Required data: email
// Optional data: none
// @TODO authentication
// @TODO delete any other data associated with the user
handlers._users.delete = (data, cb) => {
  const email = _is.email(data.query.email);

  if (email) {
    _db.read('users', email, (err) => {
      if (!err) {
        _db.delete('users', email, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500, {"Error" : "Could not delete the specified user."});
          }
        });
      } else {
        cb(404, {"Error" : "Could not find the specified user."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing required field."});
  }
};



/********************************
    PING Handler
********************************/
handlers.ping = (data, cb) => {
  cb(200);
};

/********************************
    Not Found Handler
********************************/
handlers.notFound = (data, cb) => {
  cb(404);
};


module.exports = handlers;