const server = require('./server/server');
const workers = require('./workers/workers');

const app = {};

app.init = () => {
  server.init();
  workers.init();
};
app.init();



module.exports = app;
