const handlers = require('./handlers');

const router = {
  'users' : handlers.users,
  'ping' : handlers.ping,
  'notFound': handlers.notFound
};

module.exports = router;