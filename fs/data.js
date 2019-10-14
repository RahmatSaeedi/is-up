const fs = require('fs');
const path = require('path');

const lib = {};
lib.baseDir = path.join(__dirname, '/.data/');

/********************************
  Adds additional fields
  perior to saving a file
********************************/
const addAdditionalFields = {};
addAdditionalFields.users = {
  create: (o = {}) => {
    o.dateCreated = Date.now();
  }
};


/********************************
  Parses a string to
  JSON without throwing
********************************/
const parseJsonToObject = (str = '') => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};


/********************************
 create new directory
********************************/
lib.mkDir =  function(dirName = '', cb = (err)=>{}) {
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
lib.create = function(dir = '', fileName = '', dataObject = {}, cb  = (err)=>{}) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  dataObject = typeof(dataObject) === 'object' ? dataObject : false;
  cb = typeof(cb) === 'function' ? cb : false;

  if (dir && fileName && dataObject && cb) {
    fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'wx', (err, fileDiscriptor) => {
      if (!err && fileDiscriptor) {
        
        // Conditional additional db/server-side fields
        if (addAdditionalFields[dir] && addAdditionalFields[dir].create) {
          addAdditionalFields[dir].create(dataObject);
        }
        // Conditional additional fields Ends

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
lib.read = function(dir = '', fileName = '', cb = (err, data)=>{}) {
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
lib.update = function(dir = '', fileName = '', dataObject = {}, cb = (err)=>{}) {
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
lib.delete = function(dir = '', fileName = '', cb  = (err)=>{}, cascadeDelete = true) {
  dir = typeof(dir) === 'string' ? dir : false;
  fileName = typeof(fileName) === 'string' ? fileName : false;
  cb = typeof(cb) === 'function' ? cb : false;


  //Cascade delete based on the rules provided in 'cascade' object
  if (cascadeDelete && cascade[dir]) {
    cascade[dir].filesToDelete(fileName);
  }


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

/********************************
  Cascade Delete
********************************/
const cascade = {};
cascade.users = {
  filesToDelete: (fileName = '') => {
    fileName = typeof(fileName) === 'string' ? fileName : false;

    if (fileName) {
      lib.read('users', fileName, (err, userData) => {
        let deletionErrors = 0;
        if (!err && userData && userData.checks) {
          userData.checks.forEach((checkId) => {
            lib.delete('checks', checkId, (err) => {
              if (err) {
                deletionErrors++;
              }
            });
          });
        }
        return deletionErrors;
      });
    } else {
      return 1;
    }
  }
};

/********************************
  List all file in a directory
********************************/
lib.list = (dir = '', cb = (err, data)=>{}) => {
  dir = typeof(dir) === 'string' ? dir : false;
  cb = typeof(cb) === 'function' ? cb : false;
  if (dir && cb) {
    fs.readdir(lib.baseDir + dir + '/', (err, data) => {
      if (!err && data) {
        const row = {};
        let uID;
        switch (dir) {
        case 'users' :
          uID = 'email';
          break;
        default:
          uID = 'id';
          break;
        }
        const trimmedFileNames = [];
        data.forEach((fileName) => {
          row[uID] = fileName.replace('.json','');
          trimmedFileNames.push(row);
        });
        cb(false, trimmedFileNames);
      } else {
        cb(err, data);
      }
    });
  } else {
    cb("Expected string value for 'dir' and 'function' for 'cb'.");
  }
};


module.exports = lib;