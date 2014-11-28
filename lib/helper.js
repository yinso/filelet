// Generated by CoffeeScript 1.4.0
(function() {
  var async, copy, fs, functlet, glob, loadFile, loadFiles, loglet, mkdirP, mkdirp, move, ncp, newname, path, readBuffer, rename, saveFiles, vinyl, writeArray, writeFile,
    __slice = [].slice;

  async = require('async');

  vinyl = require('vinyl');

  fs = require('fs');

  path = require('path');

  glob = require('glob');

  loglet = require('loglet');

  ncp = require('ncp');

  mkdirp = require('mkdirp');

  functlet = require('funclet');

  readBuffer = function(file, cb) {
    return fs.readFile(file.path, function(err, data) {
      if (err) {
        return cb(err);
      } else {
        file.contents = data;
        return cb(null, file);
      }
    });
  };

  newname = function(fileName, options) {
    var baseName, destDir, dirName, newExt, oldExt;
    if (options == null) {
      options = {};
    }
    oldExt = path.extname(fileName);
    newExt = options.extname || oldExt;
    dirName = path.dirname(fileName);
    destDir = options.destDir || dirName;
    baseName = path.basename(fileName, oldExt) + newExt;
    return path.join(destDir, baseName);
  };

  rename = function(file, options) {
    var dirName, fileName;
    if (options == null) {
      options = {};
    }
    fileName = path.basename(file.path, path.extname(file.path)) + (options.extname || path.extname(file.path));
    dirName = options.destDir ? path.resolve(file.base, options.destDir) : path.dirname(file.path);
    return file.path = path.join(dirName, fileName);
  };

  loadFiles = function(source, transform, cb) {
    var helper, load;
    if (arguments.length === 2) {
      cb = transform;
      transform = function(file, cb) {
        return cb(null, file);
      };
    }
    helper = function(filePath, next) {
      return loadFile(filePath, transform, next);
    };
    load = function(sources) {
      return async.map(sources, helper, function(err, files) {
        loglet.debug('async.map.end', err, files);
        return cb(err, files);
      });
    };
    if (source instanceof Array) {
      return load(source);
    } else if (typeof source === 'string') {
      return glob(source, function(err, files) {
        if (err) {
          return cb(err);
        } else {
          return load(files);
        }
      });
    } else {
      return cb({
        error: 'unknown_source_type',
        src: source
      });
    }
  };

  loadFile = function(filePath, transform, cb) {
    var file;
    if (arguments.length === 2) {
      cb = transform;
      transform = function(file, cb) {
        return cb(null, file);
      };
    }
    file = new vinyl({
      cwd: process.cwd(),
      base: process.cwd(),
      path: path.resolve(process.cwd(), filePath)
    });
    return readBuffer(file, function(err, file) {
      if (err) {
        return cb(err);
      } else {
        return transform(file, cb);
      }
    });
  };

  saveFiles = function(files, options, cb) {
    var helper;
    helper = function(file, next) {
      rename(file, options);
      if (options.transform instanceof Function) {
        return options.transform(file, function(err, file) {
          if (err) {
            return next(err);
          } else {
            return writeFile(file.path, file.contents, next);
          }
        });
      } else {
        return writeFile(file.path, file.contents, next);
      }
    };
    return async.each(files, helper, cb);
  };

  writeFile = function(filePath, contents, options, cb) {
    var dir;
    if (arguments.length === 3) {
      cb = options;
      options = 'utf8';
    }
    dir = path.dirname(filePath);
    return mkdirp(dir, function(err) {
      if (err) {
        return cb(err);
      } else {
        return fs.writeFile(filePath, contents, options, function(err) {
          if (err) {
            return cb(err);
          } else {
            return cb(null);
          }
        });
      }
    });
  };

  writeArray = function(filePath, ary, options, cb) {
    var dir;
    if (arguments.length === 3) {
      cb = options;
      options = 'utf8';
    }
    dir = path.dirname(filePath);
    return mkdirP(dir, function(err) {
      var item, stream, _i, _len;
      if (err) {
        return cb(err);
      }
      try {
        stream = fs.createWriteStream(filePath);
        stream.on('error', cb);
        stream.on('finish', function() {
          return cb(null);
        });
        for (_i = 0, _len = ary.length; _i < _len; _i++) {
          item = ary[_i];
          if (typeof item === 'string') {
            stream.write(item, 'utf8');
          } else {
            stream.write(item);
          }
        }
        return stream.end();
      } catch (e) {
        cb(e);
        return next(null);
      }
    });
  };

  copy = function(srcPath, destPath, options, cb) {
    if (arguments.length === 3) {
      cb = options;
      options = {
        dereference: true
      };
    }
    options.dereference = true;
    return mkdirp(path.dirname(destPath), function(err) {
      if (err) {
        return cb(err);
      } else {
        return ncp.ncp(srcPath, destPath, options, cb);
      }
    });
  };

  mkdirP = function() {
    var arg, cb, _i;
    arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    return mkdirp.apply(null, __slice.call(arg).concat([function(err) {
      if (err) {
        return cb(err);
      } else {
        return cb(null);
      }
    }]));
  };

  move = function(src, dest, cb) {
    return mkdirP(path.dirname(dest), function(err) {
      if (err) {
        return cb(err);
      } else {
        return fs.rename(src, dest, cb);
      }
    });
  };

  module.exports = {
    loadFiles: loadFiles,
    loadFile: loadFile,
    saveFiles: saveFiles,
    writeFile: writeFile,
    rename: rename,
    move: move,
    newname: newname,
    readBuffer: readBuffer,
    copy: copy,
    mkdirp: mkdirP,
    writeArray: writeArray
  };

}).call(this);