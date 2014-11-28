async = require 'async'
vinyl = require 'vinyl'
fs = require 'fs'
path = require 'path'
glob = require 'glob'
loglet = require 'loglet'
ncp = require 'ncp'
mkdirp = require 'mkdirp'
functlet = require 'funclet'

readBuffer = (file, cb) ->
  fs.readFile file.path, (err, data) ->
    if err 
      cb err
    else
      file.contents = data 
      cb null, file

newname = (fileName, options = {}) ->
  oldExt = path.extname(fileName)
  newExt = options.extname or oldExt
  dirName = path.dirname fileName
  destDir = options.destDir or dirName
  baseName = path.basename(fileName, oldExt) + newExt 
  #loglet.log 'newname', fileName, ext, dirName, baseName, path.join(dirName, baseName)
  path.join destDir, baseName

# options are used to change file path... specifically target directory & the file extension...
# we will need a 
rename = (file, options = {}) ->
  fileName = path.basename(file.path, path.extname(file.path)) + (options.extname or path.extname(file.path))
  dirName = 
    if options.destDir 
      path.resolve file.base, options.destDir 
    else
      path.dirname file.path 
  file.path = path.join dirName, fileName

loadFiles = (source, transform, cb) ->
  if arguments.length == 2 
    cb = transform
    transform = (file, cb) -> cb null, file 
  
  helper = (filePath, next) ->
    loadFile filePath, transform, next
  load = (sources) ->
    async.map sources, helper, (err, files) ->
      loglet.debug 'async.map.end', err, files
      cb err, files 
  if source instanceof Array
    load source
  else if typeof(source) == 'string'
    glob source, (err, files) ->
      if err 
        cb err
      else
        load files
  else
    cb {error: 'unknown_source_type', src: source}

loadFile = (filePath, transform, cb) ->
  if arguments.length == 2
    cb = transform 
    transform = (file, cb) -> cb null, file
  file = new vinyl {cwd: process.cwd(), base: process.cwd(), path: path.resolve(process.cwd(), filePath)}
  readBuffer file, (err, file) ->
    if err
      cb err
    else
      transform file, cb

saveFiles = (files, options, cb) ->
  helper = (file, next) ->
    rename(file, options)
    if options.transform instanceof Function
      options.transform file, (err, file) ->
        if err 
          next err
        else
          writeFile file.path, file.contents, next
    else
      writeFile file.path, file.contents, next
  async.each files, helper, cb
  
writeFile = (filePath, contents, options, cb) ->
  if arguments.length == 3
    cb = options
    options = 'utf8'
  dir = path.dirname filePath
  mkdirp dir, (err) ->
    if err 
      cb err
    else
      fs.writeFile filePath, contents, options, (err) ->
        if err 
          cb err
        else
          cb null 

writeArray = (filePath, ary, options, cb) ->
  if arguments.length == 3 
    cb = options
    options = 'utf8'
  dir = path.dirname filePath
  mkdirP dir, (err) ->
    if err 
      return cb err
    try
      stream = fs.createWriteStream filePath
      stream.on 'error', cb
      stream.on 'finish', () -> cb null
      for item in ary 
        if typeof(item) == 'string'
          stream.write item, 'utf8'
        else
          stream.write item
      stream.end()
    catch e 
      cb e
      next null

copy = (srcPath, destPath, options, cb) ->
  if arguments.length == 3
    cb = options
    options = { dereference: true }
  options.dereference = true
  mkdirp path.dirname(destPath), (err) ->
    if err
      cb err
    else
      ncp.ncp srcPath, destPath, options, cb

mkdirP = (arg..., cb) ->
  mkdirp arg..., (err) ->
    if err
      cb err
    else
      cb null

move = (src, dest, cb) ->
  mkdirP path.dirname(dest), (err) ->
    if err
      cb err
    else
      fs.rename src, dest, cb

module.exports = 
  loadFiles: loadFiles
  loadFile: loadFile
  saveFiles: saveFiles
  writeFile: writeFile
  rename: rename
  move: move
  newname: newname
  readBuffer: readBuffer
  copy: copy
  mkdirp: mkdirP
  writeArray: writeArray

  

