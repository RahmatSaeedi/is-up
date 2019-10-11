const fs = require('fs');
const path = require('path');

const lib = {};
lib.baseDir = path.join(__dirname, '/.data/');


/********************************
  Parses a string to
  JSON without throwing
********************************/
const parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};


/********************************
 create new directory
********************************/
lib.mkDir =  function(dirName, cb) {
  if (typeof(dirName) === 'string') {
    fs.mkdir(lib.baseDir + dirName, (err) => {
      if (!err) {
        cb(false);
      } else {
        cb('Could not create the new directory.');
      }
    });
  } else {
    cb('dirName expected to be a string.');
  }
};


/********************************
  Writes data to a new file
********************************/
lib.create = function(dir, fileName, dataObject, cb) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (dir && fileName && dataObject && cb) {
    fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'wx', (err, fileDiscriptor) => {
      if (!err && fileDiscriptor) {
        dataObject.dateCreated = Date.now();
        fs.writeFile(fileDiscriptor, JSON.stringify(dataObject), (err) => {
          if (!err) {
            fs.close(fileDiscriptor, (err) => {
              if (!err) {
                cb(false);
              } else {
                cb('Error while closing the file.');
              }
            });
          } else {
            cb('Error while writting to new file.');
          }
        });
      } else {
        cb('Could not create new file, it may already exist or the path could not be found.');
      }
    });
  } else {
    cb("Expected strings for 'dir'/'fileName', object for 'dataObject', and function for cb.");
  }
};


/********************************
  Read data from a file
********************************/
lib.read = function(dir, fileName, cb) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (dir && fileName && cb) {
    fs.readFile(lib.baseDir + dir + '/' + fileName + '.json', 'utf8', (err, data) => {
      if (!err) {
        cb(false, parseJsonToObject(data));
      } else {
        cb(err, data);
      }
    });
  } else {
    cb("Expected strings for 'dir'/'fileName', and function for 'cb'.");
  }
};


/********************************
  Update data on a file
********************************/
lib.update = function(dir, fileName, dataObject, cb) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (dir && fileName && dataObject && cb) {
    fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'r+', (err, fileDiscriptor) => {
      if (!err && fileDiscriptor) {
        // Truncate the file
        fs.ftruncate(fileDiscriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDiscriptor, JSON.stringify(dataObject), (err) => {
              if (!err) {
                fs.close(fileDiscriptor, (err) => {
                  if (!err) {
                    cb(false);
                  } else {
                    cb('Error while closing the file.');
                  }
                });
              } else {
                cb('Error while writting to new file.');
              }
            });
          } else {
            cb('Error truncating the file.');
          }
        });
      } else {
        cb('Could not open the file for update, it may not already exist or the path could not be found.');
      }
    });
  } else {
    cb("Expected strings for 'dir'/'fileName', object for 'dataObject', and function for 'cb'.");
  }
};


/********************************
  Delete a file
********************************/
lib.delete = function(dir, fileName, cb) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (dir && fileName && cb) {
    fs.unlink(lib.baseDir + dir + '/' + fileName + '.json', (err) => {
      if (!err) {
        cb(false);
      } else {
        cb("Could not delete the file, it may might be not even exist.");
      }
    });
  } else {
    cb("Expected strings for 'dir'/'fileName', and function for 'cb'.");
  }
};


module.exports = lib;