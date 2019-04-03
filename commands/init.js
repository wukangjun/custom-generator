var program = require('commander')
var paths = require('../config/paths')
var { findConfig } = require('../utils/index')
var routerGenerator = require('./router')

var pkg = require(paths.appPackageJson)
module.exports = function() {
  var config = findConfig(paths.appPath)
  if (config) {
    routerGenerator(config)
  } else {
    error(`Autogenerator config was not found`)
  }
}

function error(mess) {
  program.outputHelp()
  process.stderr.write(`${pkg.name}: ${mess} \n`)
  process.exit(1)
}
