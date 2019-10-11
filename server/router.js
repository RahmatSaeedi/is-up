const handlers = require('./handlers');

const router = {
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'ping' : handlers.ping,
  'notFound': handlers.notFound
};

module.exports = router;