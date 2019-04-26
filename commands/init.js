var chalk = require('chalk')
var program = require('commander')
var paths = require('../config/paths')
var { findConfig } = require('../utils/index')
var routerGenerator = require('./router')

var pkg = require(paths.appPackageJson)

/**
 * 目前初始化： 路由配置初始化
 */
module.exports = async function() {
  var config = await findConfig(paths.appPath)
  if (config) {
    routerGenerator(config)
  } else {
    error(`Autogenerator config was not found`)
  }
}

function error(mess) {
  program.outputHelp()
  console.log(chalk.red(`${pkg.name}: ${mess} \n`))
  process.exit(1)
}
