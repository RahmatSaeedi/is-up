const http = require('http');
const https = require('https');

const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const router = require('./router');




// Server initiation & setup
const httpsServerOptions = {
  'key': fs.readFileSync(config.pathToSslKey),
  'cert': fs.readFileSync(config.pathToSslCert)
};

const httpServer = http.createServer((req, res) => unifiedServer(req, res));
const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res));


httpServer.listen(config.httpPort, ()=> {
  console.log(`HTTP server is listening on port ${config.httpPort}.`);
});
httpsServer.listen(config.httpsPort, ()=> {
  console.log(`HTTPS server is listening on port ${config.httpsPort}.`);
});


/********************************
          Unified Server
********************************/
const unifiedServer = (req, res) => {
  // Gets the URL, parse it, & trim the leading and trailling '/'
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');
  
  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let payload = '';
  req.on('data', (data) => {
    payload += decoder.write(data);
  });
  req.on('end', () => {
    payload += decoder.end();


    // Construct the data object to send to the handler
    const data = {
      path,
      query: parsedUrl.query,
      method : req.method.toLowerCase(),
      headers: req.headers,
      payload
    };
    // choose the handler
    const chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : notFound;
    // route the request
    chosenHandler(data, (statusCode, response) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      if (typeof(response) === 'object') {
        response = JSON.stringify(response);
        res.setHeader('Content-Type', 'application/json');
      }
      // send the reponse
      res.writeHead(statusCode);
      res.end(response);
    });
  });
};


/********************************
    Not Found Handler
********************************/
const notFound = (data, callBack) => {
  callBack(404);
};