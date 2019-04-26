var { warn } = require('./warn')
var toString = Object.prototype.toString
var TPL_REGEXP = /{\s*([^{}]+)\s*}/g
var FIELD_REGEXP = /\[\s*([^\[\]]+)\s*\]/g
var INHERITS_REGEXP = /\<\s*([^\<\>]+)\s*\>/g

exports.isObject = function(str) {
  return !!str && toString.call(str) === '[object Object]'
}

exports.isEmptyObject = function(str) {
  for(var key in str) {
    return false
  }
  return true
}

exports.TPL_REGEXP = TPL_REGEXP

exports.replaceTemplate = function(config) {
  try {
    return config.router.template.replace(TPL_REGEXP, function(m, r) {
      return config.template[r]
    })
  } catch (error) {
    warn(error)
    return null
  }
}

exports.FIELD_REGEXP = FIELD_REGEXP
exports.INHERITS_REGEXP = INHERITS_REGEXP

exports.blue = function(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}