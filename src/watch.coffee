fs = require 'fs'
path = require 'path'
helper = require './helper'

# 
class Monitor 
  constructor: (@rootPath, @options, files = []) ->
    @files = {}
    

# what is the options here? 
watch = (rootPath, options, cb) ->
  if arguments.length == 2
    cb = options
    options = {}
  helper.readdir rootpath, options, (err, files) ->
    if err
      cb err
    else
      cb null, new Monitor rootPath, options, files

module.exports = 
  watch: watch
