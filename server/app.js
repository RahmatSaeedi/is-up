const http = require('http');
const config = require('./config');


// Server setup
const server = http.createServer((req, res) => {
  res.end('Hellow world\n');
});

server.listen(config.httpPort, ()=> {
  console.log(`Server is listening on port ${config.httpPort}`);
})