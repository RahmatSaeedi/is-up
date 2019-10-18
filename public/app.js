/* app.js  frontend application*/
const app = {};

app.config = {
  'sessionToken' : false
};

// AJAX client
app.client = {};
app.client.request = function(headers, path, method, queryStringObject, payload, cb) {
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
    app.client.request(undefined, '/api/tokens', 'DELETE', queryStringObject, undefined, function(err) {
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
        console.log(this.id)
        switch (formId) {
          case 'accountEdit3':
              queryStringObject = {
                email: this.querySelector('#accountEdit3 .email').value
              };
            break;
          case 'checksCreate':
              payload.successCodes =[];
              payload.method = this.querySelector('#checksCreate [name=httpmethod]').value;
              payload.protocol = this.querySelector('#checksCreate [name=protocol]').value;
              payload.url = this.querySelector('#checksCreate [name=url]').value;
              payload.timeoutSeconds = Number(this.querySelector('#checksCreate [name=timeoutSeconds]').value);
            break;

            case 'checksEdit1':
              payload.successCodes =[];
              payload.method = this.querySelector('#checksEdit1 [name=httpmethod]').value;
              payload.protocol = this.querySelector('#checksEdit1 [name=protocol]').value;
              payload.url = this.querySelector('#checksEdit1 [name=url]').value;
              payload.timeoutSeconds = Number(this.querySelector('#checksEdit1 [name=timeoutSeconds]').value);
              payload.id = this.querySelector('#checksEdit1 [name="_id"]').value;
            break;
            case 'checksEdit2':
                queryStringObject = {
                  id: this.querySelector("#checksEdit2 [name='_id']").value
                };
              break;
        }


        document.querySelector("#" + formId + " .formError").style.display = "hidden";

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type !== 'submit' && elements[i].name !== '_method' && elements[i].name !== 'successCodes' && elements[i].name !== 'httpmethod' && elements[i].name !== 'timeoutSeconds'  && elements[i].name !== '_id') {
            payload[elements[i].name] = (elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value);
          } else if ( elements[i].name === 'successCodes') {
            elements[i].checked ? payload.successCodes.push(elements[i].value) : null;
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
    app.client.request(undefined, '/api/tokens', 'POST', undefined, payload, function(statusCode, resp) {
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
    window.location = '/account/deleted';
    break;
  case 'checksCreate':
    window.location = '/checks/all';
    break;
  case 'checksEdit1':
    app.loadChecksEditPage();
    break;
  case 'checksEdit2':
    window.location = '/checks/all';
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

    app.client.request(undefined, '/api/tokens', 'PUT', undefined, payload, function(statusCode, resp) {
      if (statusCode === 200) {
        queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined, '/api/tokens', 'GET', queryStringObject, undefined, function(statusCode, resp) {
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
    switch(primaryBodyClass) {
      case 'accountEdit':
        app.loadAccountEditPage();
      break;
      case 'checksList':
        app.loadChecksListPage();
      break;
      case 'checksEdit':
        app.loadChecksEditPage();
      break;
  }
};

app.loadAccountEditPage = function () {
  const email = typeof(app.config.sessionToken.email) === 'string' ?  app.config.sessionToken.email : false;
  if(email) {
    const queryStringObject = {
      email
    };

    app.client.request(undefined, '/api/users', 'GET', queryStringObject, undefined, function(statusCode, responsePayload) {
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
  } else {
    app.logUserOut();
  }
};
app.loadChecksEditPage = function () {
  const id = typeof(window.location.href.split("=")[1]) === 'string'? window.location.href.split("=")[1] : false;
  if(id) {
    const queryStringObject = {
      'id' : id
    };

    app.client.request(undefined, '/api/checks', 'GET', queryStringObject, undefined, function(statusCode, data) {
      if(statusCode === 200 && data) {
        document.querySelector("#checksEdit1 [name='_id']").value = data.id;
        document.querySelector("#checksEdit2 [name='_id']").value = data.id;
        document.querySelector("#checksEdit1 [name='state']").value = data.state;
        document.querySelector("#checksEdit1 [name='protocol']").value = data.protocol;
        document.querySelector("#checksEdit1 [name='url']").value = data.url;
        document.querySelector("#checksEdit1 [name='httpmethod']").value = data.method;
        document.querySelector("#checksEdit1 [name='timeoutSeconds']").value = data.timeoutSeconds;

        const successCodeCheckboxes = document.querySelectorAll("#checksEdit1 [name='successCodes']");
        for(let i=0; i< successCodeCheckboxes.length; i++){
          if(data.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1) {
            successCodeCheckboxes[i].checked = true;
          }
        }
      } else {
        window.location = '/checks/all';
      }
    });
  } else {
    window.location = '/checks/all';
  }
};

app.loadChecksListPage = function() {
  const email = typeof(app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
  if(email) {
    app.client.request(undefined, '/api/users', 'GET', {email}, undefined, function(statusCode, data) {
      if(statusCode === 200) {
        const allChecks = typeof(data.checks) === 'object' && data.checks instanceof Array ? data.checks : [];
        if(allChecks.length > 0) {
          allChecks.forEach(function(checkId) {
            const queryStringObject = {
              'id' : checkId
            };
            app.client.request(undefined, '/api/checks', 'GET', queryStringObject, undefined, function(statusCode, data) {
              if(statusCode === 200) {
                const table = document.getElementById("checksListTable");
                let tr = table.insertRow(-1);
                tr.classList.add('checkRow');
                let td0 = tr.insertCell(0);
                let td1 = tr.insertCell(1);
                let td2 = tr.insertCell(2);
                let td3 = tr.insertCell(3);
                let td4 = tr.insertCell(4);

                td0.innerHTML = data.method.toUpperCase();
                td1.innerHTML = data.protocol + '://';
                td2.innerHTML = data.url;
                td3.innerHTML = typeof(data.state) === 'string' && ['up', 'down'].indexOf(data.state) > -1? data.state : 'unknown';
                td4.innerHTML = '<a href = "/checks/edit?id=' + data.id +'" >View Details</a>';
              } else {
                console.log("Error trying to load check ID: ", checkId);
              }
            });
          });
          if(allChecks.length < 10){
            document.getElementById("createCheckCTA").style.display = 'block';
          }
        } else {
          document.getElementById("noChecksMessage").style.display ='table-row';
          document.getElementById("createCheckCTA").style.display ='block';
        }
      } else {
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
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