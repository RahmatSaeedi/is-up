/* app.js  frontend application*/
const app = {};

app.config = {
  'sessionToken' : false
};

// AJAX client
app.client = {};
app.client.request = function(headers, path, method, queryStringObject, payload, cb) {

  headers = typeof(headers) ==='object' && headers !== null ? headers : {};
  path = typeof(path) === 'string'? path : '/';
  method = typeof(method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) ==='object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) ==='object' && payload !== null ? payload : {};
  cb =typeof(cb) === 'function'? cb : false;

  let requestUrl = path + '?';
  for(let key in queryStringObject) {
    if(queryStringObject.hasOwnProperty(key)) {
      requestUrl += key + '=' + queryStringObject[key] + '&';
    }
  }
  if(requestUrl.substr(-1) === '&') {
    requestUrl = substr(0, requestUrl.length - 1);
  }

  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  for(let key in headers) {
    if(headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, headers[key]);
    }
  }
  if(app.config.sessionToken) {
    xhr.setRequestHeader('token', app.config.sessionToken.id);
  }


  xhr.onreadystatechange = function() {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseText = xhr.responseText;

      if(cb) {
        try{
          const parsedResponseText = JSON.parse(responseText);
          cb(statusCode, parsedResponseText);
        } catch (e){
          cb(statusCode, false);
        }
      }
    }
  }

  xhr.send(JSON.stringify(payload));
}


app.bindForms = function() {
  if(document.querySelector("form")) {
    document.querySelector("form").addEventListener("submit" , function(e) {
      e.preventDefault();
  
      document.querySelector("#" + this.id + " .formError").style.display = "hidden";
  
      let payload = {};
      let elements = this.elements;
      const formId = this.id;
  
      for( let i = 0; i < elements.length; i++) {
        if(elements[i].type !== 'submit') {
          payload[elements[i].name] = (elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value);
        }
      }
  
      app.client.request(undefined, this.action, this.method.toUpperCase(), undefined, payload, function(statusCode, responsePayload) {
        if(statusCode !== 200){
          const error = typeof(responsePayload.Error) === 'string' ? responsePayload.Error : '';
          document.querySelector("#" + formId + " .formError").innerHTML = error;
          document.querySelector("#" + formId + " .formError").style.display = 'block';
  
        } else {
          app.formResponseProcessor(formId, payload, responsePayload)
        }
      }); 
  
    });
  
  }
}


app.formResponseProcessor = function(formId, requestPayload, responsePayload) {
  let functionToCall = false;
  switch(formId) {
    case 'accountCreate':
        let payload = {
          'email': requestPayload.email,
          'password': requestPayload.password
        };
        app.client.request(undefined, 'api/tokens', 'POST', undefined, payload, function(statusCode, resp) {
          if (statusCode === 200) {
            app.setSessionToken(resp);
            app.location ='/checks/all';
          } else {
            document.querySelector('#' + formId + ' .formError').innerHTML = 'Sorry, an error occured and could not log you in.';
            document.querySelector('#' + formId + ' .formError').style.display = 'block';
          }
        });
      break;
    case 'sessionCreate':
      app.setSessionToken(resp);
      app.location ='/checks/all';
  }
}

app.getSessionToken = function () {
  let tokenString = localStorage.getItem('token');
  if(typeof(tokenString) === 'string') {
    try {
      let token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) === 'object') {
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
  if(isLoggedIn) {
    document.querySelector('nav').classList.add('loggedIn');
  } else {
    document.querySelector('nav').classList.add('loggedOut');
  }
};

app.setSessionToken = function(token) {
  app.config.setSessionToken = token;
  localStorage.setItem('token', JSON.stringify(token));
  if(typeof(token) === 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

app.renewToken = function(cb) {
  const currentToken = typeof(app.config.sessionToken) === 'object' ? app.config.sessionToken : false;
  if(currentToken) {
    const payload = {
      'id' : currentToken.id,
      'extend' : true
    };

    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function(statusCode, resp) {
      if(statusCode === 200) {
        queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function(statusCode, resp) {
          if(statusCode === 200) {
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
}

app.tokenRenewalLoop = function() {
  setInterval(
    function(){
      app.renewToken(
        function(err) {
          if(!err) {
            console.log("Token renewed successully at " + Date.now() + ".");
          }
        }
      )
    }, 1000 * 60
  )
}

app.init = function() {
  app.bindForms();
};


window.onload = function(){
  app.init();
}