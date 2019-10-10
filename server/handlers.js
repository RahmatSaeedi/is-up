// callback a status code, & a payload object
const _db = require('../db/index');
const _db0 = require('../fs/data');
const helpers = require('../lib/helpers');


const handlers = {};
const emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

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
  const _email = data.payload.email;

  const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const email = typeof(_email) === 'string' && _email.trim().length > 0 && emailRegExp.test(_email.trim().toLowerCase()) ? _email.trim().toLowerCase() : false;
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 10 ? data.payload.password.trim() : false;
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

};

// Users - put
// Required data:
// Optional data: none
// @TODO authentication
handlers._users.put = (data, cb) => {

};

// Users - delete
// Required data:
// Optional data: none
// @TODO authentication
handlers._users.delete = (data, cb) => {

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