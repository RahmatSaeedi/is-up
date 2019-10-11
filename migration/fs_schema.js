const {mkDir} = require('../fs/data');

mkDir('', () => {
  mkDir('users/', () => {

  });
  mkDir('tokens/', () => {

  });
});