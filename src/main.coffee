helper = require './helper'
Cache = require './cache'

helper.cache = (options) ->
  new Cache()

module.exports = helper
