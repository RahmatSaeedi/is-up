const handlers = {};


handlers.hello = (data, callback) => {
  // callback a status code, & a payload object
  callback(406, {'hello': 'world'})
};


const router = {
  'hello' : handlers.hello
};


module.exports = router;