helper = require './helper'
Cache = require './cache'
watch = require './watch'

helper.cache = (options) ->
  new Cache()

for key, val of watch
  helper[key] = val

module.exports = helper
