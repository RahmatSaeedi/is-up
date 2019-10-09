const http = require('http');
const url = require('url');
const config = require('./config');


// Server initiation & setup
const server = http.createServer((req, res) => {
  // Gets the URL, parse it, & trimm the leading and ending '/'
  const trimmedPath = url.parse(req.url, true).pathname.replace(/^\/+|\/+$/g,'');

  // Send response
  res.end(`Hello world\n You requested path: ${trimmedPath}`);
});

server.listen(config.httpPort, ()=> {
  console.log(`Server is listening on port ${config.httpPort}.`);
})