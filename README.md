# Filelet - a simple vinyl-based file-helper library

## Install 

    npm install filelet

## Usage 

    var filelet = require('filelet');
    // see API


### `loadFiles(source, [transform,] callback)`

Load a list of files based on the `source` and apply `transform` if supplied. Callback should follow the signature of `function (err, files)`. The `files` returned are a list of [`vinyl`](https://www.npmjs.org/package/vinyl) file objects.

Source can be an array of file paths, or a glob as expected by the [`glob`](https://www.npmjs.org/package/glob) module.

`transform` is a helper function with the signature of `function(file, next)`, where `file` is a `vinyl` object and `next` should take in `error` and `file`.

    // silly example.
    filelet.loadFiles('./*.js', function(file, next) { next(null, file); }, function (err, files) {
      ...
    })

### `loadFile(filePath, [transform, ] callback)`

Singular form of `loadFiles`. It only expects a `filePath` (not a `glob`, since `glob` can map to more than one files).


### `copy(srcPath, destPath, callback)`

Copies files from `srcPath` to `destPath`. Will create intermediate directories if they don't exist.

Symlinks are automatically dereferenced - i.e. it will duplicate the content rather than the link.

### `move(srcPath, destPath, callback)`

Wrapper over `mkdirp` and `fs.rename` so you can move file to a previously nonexistent directory.

### `mkdirp(filePath, cb)`

Wrapper around [`mkdirp`](https://www.npmjs.org/package/mkdirp) module.

### `writeFile(filePath, content, [options, ] callback)`

Wrapping around `mkdirp` and `fs.writeFile`, so the intermediate non-existent directoreis are created prior to write.

### `readdirRSync(dirPath)`

### `cache()`

A file cache to cache the loaded files until the file is modified.

    var cache = filelet.cache()
    cache.loadFile('/path/to/file', [function(file, next) { /* transform */ }, ]function(err, file) { ... });
    cache.loadFiles(['/array/of/path/to/file', ...], [function (file, next) { /* transform */ } , ]function (err, files) { ... })

