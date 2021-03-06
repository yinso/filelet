// Generated by CoffeeScript 1.4.0
(function() {
  var copy, fs, funclet, glob, loadFile, loadFiles, loglet, mkdirP, mkdirp, move, ncp, newname, path, readBuffer, readdirR, readdirRSync, rename, saveFiles, vinyl, writeArray, writeFile, _,
    __slice = [].slice;

  vinyl = require('vinyl');

  fs = require('fs');

  path = require('path');

  glob = require('glob');

  loglet = require('loglet');

  ncp = require('ncp');

  mkdirp = require('mkdirp');

  funclet = require('funclet');

  _ = require('underscore');

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
      return funclet.map(sources, helper)["catch"](function(err) {
        return next(err);
      }).done(function(files) {
        return next(null, files);
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
    return funclet.each(files, heler)["catch"](cb).done(function() {
      return cb(null);
    });
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

  readdirRSync = function(dirPath) {
    var helper;
    helper = function(currentDir, paths) {
      var file, filePath, files, stat, _i, _len;
      try {
        files = fs.readdirSync(currentDir);
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          filePath = path.join(currentDir, file);
          stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            helper(filePath, paths);
          } else {
            paths.push(filePath);
          }
        }
        return paths;
      } catch (e) {
        return paths;
      }
    };
    return helper(dirPath, []);
  };

  readdirR = function(rootPath, options, cb) {
    var filterPath, helper, makeTask, makeTasks, result;
    if (arguments.length === 2) {
      cb = options;
      options = {};
    }
    result = [];
    filterPath = function(filePath) {
      var extname;
      extname = path.extname(filePath);
      if (options.filter instanceof Array) {
        if (_.contains(options.filter, extname)) {
          return result.push(filePath);
        }
      } else if (typeof options.filter === 'string') {
        if (extname === options.filter) {
          return result.push(filePath);
        }
      } else {
        return result.push(filePath);
      }
    };
    makeTask = function(filePath) {
      var relPath;
      relPath = path.relative(rootPath, filePath);
      return function(cb) {
        return fs.stat(filePath, function(err, stat) {
          if (err) {
            return cb(err);
          } else if (stat.isDirectory()) {
            return helper(filePath, function(err, res) {
              if (err) {
                return cb(err);
              } else {
                return cb(null, res);
              }
            });
          } else {
            filterPath(relPath);
            return cb(null, relPath);
          }
        });
      };
    };
    makeTasks = function(dirName, files) {
      var fileName, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        fileName = files[_i];
        _results.push(makeTask(path.join(dirName, fileName)));
      }
      return _results;
    };
    helper = function(dirPath, cb) {
      return funclet.start(function(next) {
        return fs.readdir(dirPath, next);
      }).then(function(files, next) {
        return next(null, makeTasks(dirPath, files));
      }).thenParallel()["catch"](cb).done(function(res) {
        return cb(null);
      });
    };
    return helper(rootPath, function(err, res) {
      if (err) {
        return cb(null, []);
      } else {
        return cb(null, result);
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
    writeArray: writeArray,
    readdirRSync: readdirRSync,
    readdirR: readdirR
  };

}).call(this);
