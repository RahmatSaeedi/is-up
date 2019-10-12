const handlers = require('./handlers');

const router = {
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks,
  'ping' : handlers.ping,
  'notFound': handlers.notFound
};

module.exports = router;