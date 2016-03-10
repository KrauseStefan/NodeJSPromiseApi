const fs = require('fs');

exports.readDir = function readDir(path: string) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files: Array<string>) => {
      resolve(files);
    });
  });
};
