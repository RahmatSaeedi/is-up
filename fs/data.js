const fs = require('fs');
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname, '/.data/');


// create new directory
lib.mkDir =  function(dirName, cb){
  if(typeof(dirName) === 'string') {
    fs.mkdir(lib.baseDir + '/' + dirName, (err) => {
      if(!err) {
        cb(false);
      } else {
        cb('Could not make the new directory');
      }
    })
  } else {
    cb('dirName expected to be a string');
  }
}


// Writes data to a file
lib.create = function(dir, fileName, dataObject, cb) {
  fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'wx', (err, fileDiscriptor) => {
    if(!err && fileDiscriptor) {
      fs.writeFile(fileDiscriptor, JSON.stringify(dataObject), (err) => {
        if(!err) {
          fs.close(fileDiscriptor, (err) => {
            if(!err) {
              cb(false);
            } else {
              cb('Error while closing the file.');
            }
          })
        }else {
          cb('Error while writting to new file.');
        }
      })
    } else {
      cb('Could not create new file, it may already exist or the path could not be found.');
    }
  })
}






module.exports = lib;