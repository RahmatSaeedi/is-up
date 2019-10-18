const {mkDir} = require('../fs/db');

mkDir('', () => {
  mkDir('users/', () => {

  });
  mkDir('tokens/', () => {

  });
  mkDir('checks/', () => {

  });
});