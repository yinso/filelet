funclet = require 'funclet'
loglet = require 'loglet'
fs = require 'fs'
helper = require './helper'

class FileObject 
  constructor: (@filePath) ->
  load: (transform, cb) ->
    funclet
      .bind(fs.stat, @filePath)
      .then (stat, next) =>
        if not @stat or stat.mtime > @stat.mtime
          loglet.debug 'filelet.cache.load', @filePath, stat.mtime
          @stat = 
            mtime: stat.mtime
          helper.loadFile @filePath, transform, next
        else 
          loglet.debug 'filelet.cache.load.already', @filePath, stat.mtime
          next null, @inner
      .catch(cb)
      .done (file) =>
        @inner = file
        cb null, @inner

class FileCache
  constructor: () ->
    @inner = {}
  loadFile: (filePath, transform, cb) ->
    if arguments.length == 2
      cb = transform
      transform = (file, next) -> next null, file
    if not @inner.hasOwnProperty(filePath)
      @inner[filePath] = new FileObject(filePath)
    @inner[filePath].load transform, cb
  loadFiles: (filePaths, transform, cb) ->
    if arguments.length == 2
      cb = transform
      transform = (file, next) -> next null, file
    doHelp = (filePath, next) =>
      @loadFile filePath, transform, next
    funclet
      .map(filePaths, doHelp)
      .catch(cb)
      .done (files) ->
        cb null, files

module.exports = FileCache


