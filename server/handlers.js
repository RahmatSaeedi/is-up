/****************************************************************
  Handlers callback a status code & possibly a payload object
****************************************************************/
const _db = require('../db/db_v2');
const _db0 = require('../fs/data');
const config = require('../config').handlers;
const _is = require('../lib/helpers').is;
const _hash = require('../lib/helpers').hash;
const _createRandomString = require('../lib/helpers').createRandomString;
const {getTemplate, addUniversalTemplates, getStaticAsset} = require('../lib/serve_contents');

const handlers = {};

/////////////////////////////////////////////////////////////////
/****************************************************************
  html Handler
****************************************************************/
/////////////////////////////////////////////////////////////////
handlers.index = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Home',
      'head.description' : 'Uptime monitoring site',
      'body.title' : 'Hello World!',
      'body.class' :'index'
    };

    getTemplate('index', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};

handlers.accountCreate = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Create an account',
      'head.description' : 'Sign up is easy and only takes a few second.',
      'body.class' :'accountCreate'
    };

    getTemplate('accountCreate', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};

handlers.sessionCreate = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Login',
      'head.description' : 'Please enter your credentials.',
      'body.class' :'sessionCreate'
    };

    getTemplate('sessionCreate', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};


handlers.sessionDeleted = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Logged Out',
      'head.description' : 'You have been logged out.',
      'body.class' :'sessionDeleted'
    };

    getTemplate('sessionDeleted', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};

handlers.accountEdit = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Account Settings',
      'body.class' :'accountEdit'
    };

    getTemplate('accountEdit', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};

handlers.accountDeleted = (data, cb) => {
  if (data.method === 'get') {
    let templateData = {
      'head.title' : 'Account Deleted',
      'head.description' : 'Your account has been deleted.',
      'body.class' :'accountDeleted'
    };

    getTemplate('accountDeleted', templateData,(err, str) => {
      if (!err && str) {
        addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, 'html');
          } else {
            cb(500,undefined,'html');
          }
        });
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};



handlers.favicon = (data, cb) => {
  if (data.method === 'get') {
    getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        cb(200, data, 'ico');
      } else {
        cb(500,undefined,'html');
      }
    });
  } else {
    cb(405, undefined, 'html');
  }
};

handlers.public = (data, cb) => {
  if (data.method === 'get') {
    const assetName = data.path.replace('public/', '').trim();
    if (assetName.length > 0) {
      getStaticAsset(assetName, (err, data) => {
        if (!err && data) {
          const contentType = assetName.split('.').pop().length > 1 ? assetName.split('.').pop() : 'plain';
          cb(200, data, contentType);
        } else {
          cb(404,undefined,'html');
        }
      });
    } else {
      cb(404);
    }
  } else {
    cb(405, undefined, 'html');
  }
};

/////////////////////////////////////////////////////////////////
/****************************************************************
  JSON Handler
****************************************************************/
/////////////////////////////////////////////////////////////////

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
        const hashedPassword = _hash(password);
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
// Required data: email, token
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
// Required data: email, at least one optional data, token
// Optional data: firstName, lastName, password
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
              userData.password = _hash(password);
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
// Required data: email, token
// Optional data: none
// @TODO delete any other data associated with the user
handlers._users.delete = (data, cb) => {
  console.log(data.query.email)
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
        const hashedPassword = _hash(password);
        if (hashedPassword === userData.password) {
          const tokenId = _createRandomString(config.tokenIDLength);
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
handlers._tokens.verifyToken = (token, email, cb) => {
  token = _is.token(token);
  email = _is.email(email);

  if (token && email) {
    _db.read('tokens', token, (err, tokenData) => {
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
  } else {
    cb(false);
  }
};

/****************************************************************
  Checks services
****************************************************************/
handlers.checks = (data, cb) => {
  const methods = ['post', 'get', 'put', 'delete'];
  if (methods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, cb);
  } else {
    cb(405);
  }
};
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds, token
// Optional data: none
handlers._checks.post = (data, cb) => {
  const protocol = _is.protocol(data.payload.protocol);
  const url = _is.str(data.payload.url);
  const method = _is.method(data.payload.method);
  const successCodes = _is.successCodes(data.payload.successCodes);
  const timeoutSeconds = _is.timeoutSeconds(data.payload.timeoutSeconds);
  const token = _is.token(data.headers.token);

  if (protocol && url && method && successCodes && timeoutSeconds && token) {
    _db.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const email = tokenData.email;
        _db.read('users', email, (err, userData) => {
          if (!err && userData) {
            // get user checks & ensure max has not exceeded
            const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
            if (userChecks.length < config.maxChecksLimit) {

              const checkId = _createRandomString(config.checkIdLength);
              const checkObject = {
                id: checkId,
                email: userData.email,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds
              };
              _db.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  userChecks.push(checkId);
                  userData.checks = userChecks;
                  _db.update('users', userData.email, userData, (err) => {
                    if (!err) {
                      cb(200, checkObject);
                    } else {
                      cb(500, {"Error":"Could not update the user with the new check."});
                    }
                  });
                } else {
                  cb(500, {"Error":"Could not create the new check."});
                }
              });

            } else {
              cb(400, {"Error":`The user already has the maximum number of checks (${config.maxChecksLimit}).`});
            }
          } else {
            cb(500, {"Error":"User was not found."});
          }
        });
      } else {
        cb(500, {"Error" : "Session was not found."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing or invalid inputs."});
  }
};

// Checks - get
// Required data: checkId, token
// Optional data: none
handlers._checks.get = (data, cb) => {
  const id = _is.checkId(data.query.id);

  if (id) {
    _db.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        const token = _is.token(data.headers.token);
        handlers._tokens.verifyToken(token, checkData.email, (tokenIsValid) => {
          if (tokenIsValid) {
            cb(200, checkData);
          } else {
            cb(403, {"Error" : "Unauthorized."});
          }
        });
      } else {
        cb(400, {"Error" : "Could not find the check."});
      }
    });
  } else {
    cb(400, {"Error" : "Invalid checkId."});
  }
};

// Checks - put
// Required data: checkId, an optional parameter, token
// Optional data: protocol, url, method, successCodes, timeoutSeconds
handlers._checks.put = (data, cb) => {
  const checkId = _is.checkId(data.payload.id);
  const protocol = _is.protocol(data.payload.protocol);
  const url = _is.str(data.payload.url);
  const method = _is.method(data.payload.method);
  const successCodes = _is.successCodes(data.payload.successCodes);
  const timeoutSeconds = _is.timeoutSeconds(data.payload.timeoutSeconds);
  const token = _is.token(data.headers.token);

  if (checkId) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      _db.read('checks', checkId, (err, checkData) => {
        if (!err && checkData) {
          handlers._tokens.verifyToken(token, checkData.email, (tokenIsValid) => {
            if (tokenIsValid) {
              if (protocol) {
                checkData.protocol = protocol;
              }
              if (url) {
                checkData.url = url;
              }
              if (method) {
                checkData.method = method;
              }
              if (successCodes) {
                checkData.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }
              _db.update('checks', checkId, checkData, (err) => {
                if (!err) {
                  cb(200, checkData);
                } else {
                  cb(500, {"Error" : "Could not update the check."});
                }
              });
            } else {
              cb(403, {"Error" : "Unauthorized."});
            }
          });
        } else {
          cb(400, {"Error" : "Could not find the check."});
        }
      });
    } else {
      cb(400, {"Error" : "Missing fields to update."});
    }
  } else {
    cb(400, {"Error" : "Invalid checkId."});
  }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, cb) => {
  const checkId = _is.checkId(data.query.id);

  if (checkId) {
    _db.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
        const token = _is.token(data.headers.token);
        handlers._tokens.verifyToken(token, checkData.email, (tokenIsValid) => {
          if (tokenIsValid) {
            _db.delete('checks', checkId, (err) => {
              if (!err) {
                _db.read('users', checkData.email, (err, userData) => {
                  if (!err && userData) {
                    if (userData.checks) {
                      const checkPosition = userData.checks.indexOf(checkId);
                      if (checkPosition > -1) {
                        userData.checks.splice(checkPosition, 1);
                        _db.update('users', checkData.email, userData, (err) => {
                          if (!err) {
                            cb(200);
                          } else {
                            cb(500, {"Error" : "Could not update the user's object."});
                          }
                        });
                      } else {
                        cb(500, {"Error" : "Could not find the check in user's object."});
                      }
                    } else {
                      cb(200);
                    }
                  } else {
                    cb(500, {"Error" : "Could not clear the user's check."});
                  }
                });
              } else {
                cb(500, {"Error" : "Could not delete the check."});
              }
            });
          } else {
            cb(403);
          }
        });
      } else {
        cb(400, {"Error" : "Could not find the specified check."});
      }
    });
  } else {
    cb(400, {"Error" : "Missing or invalid fields."});
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