
// callback a status code, & a payload object
const handlers = {};


handlers.ping = (data, callback) => {
  callback(200);
};


const router = {
  'ping' : handlers.ping
};

module.exports = router;