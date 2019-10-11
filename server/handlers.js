// callback a status code, & a payload object
const _db0 = require('../db/index');
const _db = require('../fs/data');
const helpers = require('../lib/helpers');


const handlers = {};
/****************************************************************
  Configurations
****************************************************************/
const config = {
  minPasswordLength: 10,
  tokenIDLength: 32
};

/****************************************************************
  Validation helpers
****************************************************************/
const _is = {};

_is.email = (email = '') => {
  const emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return typeof(email) === 'string' && email.trim().length > 0 && emailRegExp.test(email.trim().toLowerCase()) ? email.trim().toLowerCase() : false;
};

_is.str = (str = '', minLength = 1, exactLength = false) => {
  if (exactLength) {
    str = str.trim().length === minLength ? str.trim() : false;
  }
  return typeof(str) === 'string' && str.trim().length >= minLength ? str.trim() : false;
};

_is.token = (str = '') => {
  return typeof(str) === 'string' && str.trim().length === config.tokenIDLength ? str.trim() : false;
};

/****************************************************************
  users Handler
****************************************************************/
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
// Required data: firstName, lastName, email, password($config.minPasswordLength characters, no leading or trailling whitespaces), tosAgreement
// Optional data: none
handlers._users.post = (data, cb) => {
  const firstName = _is.str(data.payload.firstName);
  const lastName = _is.str(data.payload.lastName);
  const email = _is.email(data.payload.email);
  const password = _is.str(data.payload.password, config.minPasswordLength);
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
    cb(400, {'Error' : 'Missing or invalid fields.'});
  }
};

// Users - get
// Required data: email
// Optional data: none
handlers._users.get = (data, cb) => {
  const email = _is.email(data.query.email);
  const token = _is.token(data.headers.token);

  if (email && token) {
    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
        _db.read('users', email, (err, resp) => {
          if (!err && resp) {
            delete resp.password;
            cb(200, resp);
          } else {
            cb(404);
          }
        });
      } else {
        cb(403, {"Error":"Expired or invalid session."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing or invalid fields."});
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
  const password = _is.str(data.payload.password, config.minPasswordLength);
  const token = _is.token(data.headers.token);

  if (email && token && (firstName || lastName || password)) {
    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
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
        cb(403, {"Error":"Expired or invalid session."});
      }
    });
  } else {
    cb(400, {'Error' : 'Missing or invalid fields.'});
  }

};

// Users - delete
// Required data: email
// Optional data: none
// @TODO delete any other data associated with the user
handlers._users.delete = (data, cb) => {
  const email = _is.email(data.query.email);
  const token = _is.token(data.headers.token);

  if (email && token) {
    handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
      if (tokenIsValid) {
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
        cb(403, {"Error":"Expired or invalid session."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing or invalid fields."});
  }
};

/****************************************************************
  tokens Handler
****************************************************************/
handlers.tokens = (data, cb) => {
  const methods = ['post', 'get', 'put', 'delete'];
  if (methods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
};
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, cb) => {
  const email = _is.email(data.payload.email);
  const password = _is.str(data.payload.password);

  if (email && password) {
    // Find the user
    _db.read('users', email, (err, userData) => {
      if (!err && userData) {
        // Hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.password) {
          const tokenId = helpers.createRandomString(config.tokenIDLength);
          const expires = Date.now() + 1000 * 60 * 60; //+1 hour
          
          const tokenObject = {
            email,
            id: tokenId,
            expires
          };
  
          _db.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              cb(200, tokenObject);
            } else {
              cb(500, {'Error' : 'Could not create the new token.'});
            }
          });
        } else {
          cb(400, {'Error' : 'Incorrect password.'});
        }
      } else {
        cb(400,{'Error': 'A user with that email was not found.'});
      }
    });
  } else {
    cb(400, {'Error' : 'Missing or invalid fields.'});
  }
};

// Tokens - get
// Required data: id
// Optional data: none
// @TODO authentication
handlers._tokens.get = (data, cb) => {
  const id = _is.token(data.query.id);

  if (id) {
    _db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        cb(200, tokenData);
      } else {
        cb(404);
      }
    });

  } else {
    cb(400, {"Error" : "Missing or invalid fields."});
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
// @TODO authentication
handlers._tokens.put = (data, cb) => {
  const id = _is.token(data.payload.id);
  const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

  if (extend) {
    _db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _db.update('tokens', id, tokenData, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, {'Error' : 'Could not update the token\'s expiration.'});
            }
          });
        } else {
          _db.delete('tokens', id, () => {
            cb(401, {'Error' : 'The token has already expired!'});
          });
        }
      } else {
        cb(404, {'Error': 'Specified token does not exist.'});
      }
    });
  } else {
    cb(400, {'Error' : 'Missing or invalid fields.'});
  }

};

// Tokens - delete
// Required data: id
// Optional data: none
// @TODO authentication
handlers._tokens.delete = (data, cb) => {
  const id = _is.token(data.query.id);

  if (id) {
    _db.read('tokens', id, (err) => {
      if (!err) {
        _db.delete('tokens', id, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500, {"Error" : "Could not delete the specified token."});
          }
        });
      } else {
        cb(404, {"Error" : "Could not find the specified token."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing or invalid fields."});
  }
};

// Tokens - session validation
// Required data: id, email, cb
// Optional data: none
handlers._tokens.verifyToken = (id, email, cb) => {
  id = _is.token(id);
  email = _is.email(email);

  if (id && email) {
    _db.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now() && tokenData.email === email) {
          cb(true);
        } else {
          cb(false);
        }
      } else {
        cb(false);
      }
    });
  }
};

/****************************************************************
    PING Handler
****************************************************************/
handlers.ping = (data, cb) => {
  cb(200);
};

/****************************************************************
    Not Found Handler
****************************************************************/
handlers.notFound = (data, cb) => {
  cb(404);
};


module.exports = handlers;