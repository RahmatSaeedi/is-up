const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const router = require('./router');

// Server initiation & setup
const server = http.createServer((req, res) => {
  // Gets the URL, parse it, & trim the leading and trailling '/'
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');


  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  var payload = '';
  req.on('data', (data) => {
    payload += decoder.write(data);
  });
  req.on('end', () => {
    payload += decoder.end();

    // choose the handler
    const chosenHandler = typeof(router[path]) !== 'undefined'? router[path] : notFound;
    
    // Construct the data object to send to the handler
    const data = {
      path,
      query: parsedUrl.query,
      method : req.method.toLowerCase(),
      headers: req.headers,
      payload
    }

    // route the request
    chosenHandler(data, (statusCode, response) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      if (typeof(response) === 'object'){
        response = JSON.stringify(response);
        res.setHeader('Content-Type', 'application/json');
      }

      
      // send the reponse
      res.writeHead(statusCode);
      res.end(response);
    })
  })
});

server.listen(config.httpPort, ()=> {
  console.log(`Server is listening on port ${config.httpPort}.`);
});

const notFound = (data, callBack) => {
  callBack(404);
}