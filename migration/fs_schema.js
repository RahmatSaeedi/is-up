const {mkDir} = require('../fs/data');

mkDir('', (err) => {
  mkDir('users/', (err) => {

  });
});