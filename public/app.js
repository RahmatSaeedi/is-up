/* app.js  frontend application*/
const app = {};

app.config = {
  'sessionToken' : false
};

// AJAX client
app.client = {};
app.client.request = function(headers, path, method, queryStringObject, payload, cb) {
  console.log(method, path)
  headers = typeof(headers) === 'object' && headers !== null ? headers : {};
  path = typeof(path) === 'string' ? path : '/';
  method = typeof(method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) === 'object' && payload !== null ? payload : {};
  cb = typeof(cb) === 'function' ? cb : false;

  let requestUrl = path + '?';
  for (let key in queryStringObject) {
    if (queryStringObject.hasOwnProperty(key)) {
      requestUrl += key + '=' + queryStringObject[key] + '&';
    }
  }
  if (requestUrl.substring(-1) === '&') {
    requestUrl = substring(0, requestUrl.length - 1);
  }

  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  for (let key in headers) {
    if (headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, headers[key]);
    }
  }
  if (app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }


  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseText = xhr.responseText;

      if (cb) {
        try {
          const parsedResponseText = JSON.parse(responseText);
          cb(statusCode, parsedResponseText);
        } catch (e) {
          cb(statusCode, false);
        }
      }
    }
  };

  xhr.send(JSON.stringify(payload));
};


app.bindLogoutButton = function() {
  document.getElementById("logoutButton").addEventListener("click", function(e) {
    e.preventDefault();
    app.logUserOut();
  });
};


app.logUserOut = function() {
  const tokenId = typeof(app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;
  if(tokenId) {
    const queryStringObject = {
      'id' : tokenId
    };
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function(err) {
      app.setSessionToken(false);
      window.Location = '/session/deleted';
    });
  }
}

app.bindForms = function() {
  if (document.querySelector("form")) {
    
    const forms = document.querySelectorAll("form");
    for(let i =0; i< forms.length; i++) {

      forms[i].addEventListener("submit" , function(e) {
        e.preventDefault();
        let payload = {};
        let elements = this.elements;
        let method = this.method.toUpperCase();
        let queryStringObject = undefined;
        const formId = this.id;
        const path =this.action;

        switch (formId) {
          case 'accountEdit3':
              queryStringObject = {
                email: this.querySelector('#' + formId + ' .email').value
              };
            break;
          default:
            break;
        }


        document.querySelector("#" + formId + " .formError").style.display = "hidden";

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type !== 'submit' && elements[i].name !== '_method') {
            payload[elements[i].name] = (elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value);
          } else if(elements[i].name === '_method') {
            method = elements[i].value.toUpperCase();
          }
        }


        app.client.request(undefined, path, method, queryStringObject, payload, function(statusCode, responsePayload) {

          if (statusCode !== 200) {
            if(statusCode === 403 ){
              app.logUserOut();
            } else {
              const error = typeof(responsePayload.Error) === 'string' ? responsePayload.Error : '';
              document.querySelector("#" + formId + " .formError").innerHTML = error;
              document.querySelector("#" + formId + " .formError").style.display = 'block';  
            }
          } else {
            document.querySelector("#" + formId + " .formSuccess").innerHTML = "Success";
            document.querySelector("#" + formId + " .formSuccess").style.display = 'block';  
            app.formResponseProcessor(formId, payload, responsePayload);
          }
        });
    
      });
    
    }

  }
};



app.formResponseProcessor = function(formId, requestPayload, responsePayload) {
  let functionToCall = false;
  switch (formId) {
  case 'accountCreate':
    const payload = {
      'email': requestPayload.email,
      'password': requestPayload.password
    };
    app.client.request(undefined, 'api/tokens', 'POST', undefined, payload, function(statusCode, resp) {
      if (statusCode === 200) {
        app.setSessionToken(resp);
        window.location = '/checks/all';
      } else {
        document.querySelector('#' + formId + ' .formError').innerHTML = 'Sorry, an error occured and could not log you in.';
        document.querySelector('#' + formId + ' .formError').style.display = 'block';
      }
    });
    break;


  case 'sessionCreate':
    app.setSessionToken(responsePayload);
    window.location = '/checks/all';
    break;
  case 'accountEdit1':
    document.querySelector('#' + formId + " .formSuccess").style.display = 'block';
    break;
  case 'accountEdit2':
    document.querySelector('#' + formId + " .formSuccess").style.display = 'block';
    break;
  case 'accountEdit3':
    app.logUserOut();
    window.location = '/account/deleted'
    break;
  }
  
};




app.getSessionToken = function() {
  let tokenString = localStorage.getItem('token');
  if (typeof(tokenString) === 'string') {
    try {
      let token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (typeof(token) === 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }

    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(fale);
    }
  }
};

app.setLoggedInClass = function(isLoggedIn) {
  if (isLoggedIn) {
    document.querySelector('nav').classList.add('loggedIn');
  } else {
    document.querySelector('nav').classList.remove('loggedIn');
  }
};

app.setSessionToken = function(token) {
  app.config.setSessionToken = token;
  localStorage.setItem('token', JSON.stringify(token));
  if (typeof(token) === 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};


app.renewToken = function(cb) {
  const currentToken = typeof(app.config.sessionToken) === 'object' ? app.config.sessionToken : false;
  if (currentToken) {
    const payload = {
      'id' : currentToken.id,
      'extend' : true
    };

    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function(statusCode, resp) {
      if (statusCode === 200) {
        queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function(statusCode, resp) {
          if (statusCode === 200) {
            app.setSessionToken(resp);
            cb(false);
          } else {
            app.setSessionToken(false);
            cb(true);
          }
        });
      } else {
        app.setSessionToken(false);
        cb(true);
      }
    });
  } else {
    app.setSessionToken(false);
    cb(true);
  }
};




app.loadDataOnPage = function() {
  const primaryBodyClass = document.querySelector("body").classList[0];
  
  if(typeof(primaryBodyClass) === 'string' && primaryBodyClass === 'accountEdit') {
    app.loadAccountEditPage();
  }
};

app.loadAccountEditPage = function () {
  const email = typeof(app.config.sessionToken.email) === 'string' ?  app.config.sessionToken.email : false;
  if(email) {
    const queryStringObject = {
      email
    };

    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function(statusCode, responsePayload) {
      if(statusCode === 200) {
        document.querySelector("#accountEdit1 .firstName").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastName").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .email").value = responsePayload.email;
        document.querySelector("#accountEdit2 .email").value = responsePayload.email;
        document.querySelector("#accountEdit3 .email").value = responsePayload.email;
      } else {
        app.logUserOut();
      }
    });
  }
};

app.tokenRenewalLoop = function() {
  setInterval(
    function() {
      app.renewToken(
        function(err) {
          if (!err) {
            console.log("Token renewed successully at " + Date.now() + ".");
          }
        }
      );
    }, 1000 * 60
  );
};

app.init = function() {
  app.bindForms();
  app.bindLogoutButton();
  app.getSessionToken();
  app.tokenRenewalLoop();
  app.loadDataOnPage();
};


window.onload = function() {
  app.init();
};