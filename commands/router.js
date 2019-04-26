var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var pretty = require('pretty')
var globby = require('globby')
var paths = require('../config/paths')
var { warn } = require('../utils/warn')
var { isDirectory } = require('../utils')
var { isObject, FIELD_REGEXP } = require('../utils/helper')
var { AutoGeneratorError } = require('../utils/error')
var FactoryAssemblyLine = require('../utils/FactoryAssemblyLine')
var assemblyline = new FactoryAssemblyLine()

process.env.AUTOGENERATOR_CONFIGNAME = 'config.json'

module.exports = function routerGenerator(config) {
  if (isObject(config.router)) {
    assemblyline.start(config.router)
  } else {
    warn('If you need to configure the `router`，router config should be a `Object`')
  }
}

assemblyline
  /**
   * Check whether the enty exists and is a folder
   * @param {Object} config = {entry, ....}
   */
  .pipe(function(config, next) {
    if (!config.entry) {
      throw new AutoGeneratorError(
        'The router field `entry` is not found in `'+ process.env.AUTOGENERATOR_FILENAME +'`')
    } else if (!fs.existsSync(config.entry)) {
      throw new AutoGeneratorError(
        'The router `entry` file is not exist \n' +
        'Please check the entry in your router field')
    } else if (fs.existsSync(config.entry) && !isDirectory(config.entry)) {
      throw new AutoGeneratorError(
        'The router `entry` is not `directory`type')
    }
    next()
  })

  /**
   * Check whether the pattern exists and is a string or regexp
   */
  .pipe(function(config, next) {
    if (!config.pattern) {
      throw new AutoGeneratorError(
        'The router field `pattern` is not found in `'+ process.env.AUTOGENERATOR_FILENAME +'`')
    }
    next()
  })

  /**
   * Process routing data
   * @param {Object} config = { AUTOGENERATOR_ROUTERCONFIG_DATA: [...] }
   */
  .pipe(function(config, next) {
    try {
      function resolve() {
        return path.resolve.apply(
          path, 
          [paths.appPath, config.entry].concat(Array.prototype.slice.apply(arguments))
        )
      }
      function eachEveryApp(relativePath) {
        return fs.readdirSync(relativePath)
          .filter(function(filename) {
            return isDirectory(resolve(relativePath, filename))
          })
          .map(function(filename) {
            var currentpath = resolve(relativePath, filename)
            var configJsonPath = resolve(currentpath, process.env.AUTOGENERATOR_CONFIGNAME)
            var customConfig = fs.existsSync(configJsonPath) ? require(configJsonPath) : {}
            var filepath = globby.sync(resolve(currentpath, config.pattern), { deep: 0 })
            return Object.assign({
              name: filename,
              path: currentpath.substring(resolve().length),
              component: (filepath[0] || '').replace(resolve(), ''),
              children: eachEveryApp(resolve(currentpath))
            }, customConfig)
          })
      }

      next(config.AUTOGENERATOR_ROUTERCONFIG_DATA = eachEveryApp(resolve()))
    } catch (error) {
      throw new AutoGeneratorError(error)
    }
  })

  /**
   * Output to the specified file
   */
  .pipe(function(config, next) {
    if (!config.output) {
      throw new AutoGeneratorError(
        'The router field `output` is not found in `'+ process.env.AUTOGENERATOR_FILENAME +'`')
    } else if (!fs.existsSync(config.output)) {
      throw new AutoGeneratorError(
        'The router field `output` not a valid Address of the file')
    }

    try {
      var template = JSON.stringify(config.AUTOGENERATOR_ROUTERCONFIG_DATA, null, '\t')
      Object.keys(config.replace).forEach(key => {
        var value = config.replace[key]
        var regexp = new RegExp(`\\s*\"${key}\":\\s*\"([\\w\/\.]+)"`, 'g')
        template = template.replace(regexp, function(m, k) {
          return `\n"${key}": ${value.replace(FIELD_REGEXP, function() { return k })}`
        })
        fs.writeFileSync(
          path.resolve(paths.appPath, config.output),
          pretty('export default ' + template)
        )
      })
      next()
    } catch (error) {
      throw new AutoGeneratorError(error)
    }
  })

  .pipe(function(config) {
    console.log(
      `${chalk.green(
        'Routing configuration has been successfully generated in' 
        + config.output + ' file')}`)
  })