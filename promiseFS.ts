import * as fs from 'fs';

exports.readDir = function readDir(path: string) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err: any, files: Array<string>) => {
      resolve(files);
    });
  });
};

