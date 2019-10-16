const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;

const config = require('../config').server;
const router = require('./router');
const _parseJsonToObject = require('../lib/helpers').parseJsonToObject;
const join = require('path').join;


// Server initiation & setup
const server = {};
server.httpsServerOptions = {
  'key': fs.readFileSync(join(__dirname, '/https/key.pem')),
  'cert': fs.readFileSync(join(__dirname, '/https/cert.pem'))
};
server.httpServer = http.createServer((req, res) => server.unifiedServer(req, res));
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => server.unifiedServer(req, res));



server.init = function() {
  server.httpServer.listen(config.httpPort, ()=> {
    console.log(`HTTP server is listening on port ${config.httpPort}.`);
  });

  server.httpsServer.listen(config.httpsPort, ()=> {
    console.log(`HTTPS server is listening on port ${config.httpsPort}.`);
  });
};


/********************************
          Unified Server
********************************/
server.unifiedServer = (req, res) => {
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
      payload: _parseJsonToObject(payload)
    };
    console.log(data);
    // choose the handler
    const chosenHandler = path.indexOf('public/') > -1 ? router.public : (typeof(router[path]) !== 'undefined' ? router[path] : router.notFound);
    

    // route the request
    chosenHandler(data, (statusCode = 200, resPayload, contentType = 'json') => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      contentType = typeof(contentType) === 'string' ? contentType : 'json';

      switch (contentType) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        resPayload = typeof(resPayload) === 'object' ? JSON.stringify(resPayload) : '{}';
        break;
      case 'html':
        res.setHeader('Content-Type', 'text/html');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'css':
        res.setHeader('Content-Type', 'text/css');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'js':
        res.setHeader('Content-Type', 'text/javascript');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'plain':
        res.setHeader('Content-Type', 'text/plain');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'png':
        res.setHeader('Content-Type', 'image/png');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'jpg':
        res.setHeader('Content-Type', 'image/jpeg');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      case 'ico':
        res.setHeader('Content-Type', 'image/x-icon');
        resPayload = typeof(resPayload) !== 'undefined' ? resPayload : '';
        break;
      default:
        resPayload = '';
        break;
      }


      

      // send the reponse
      res.writeHead(statusCode);
      res.end(resPayload);
    });
  });
};


module.exports = server;