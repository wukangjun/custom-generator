const fs = require('fs')
const path = require('path')
const paths = require('../config/paths')
const chalk = require('chalk')
const promptConfig = require('./promptConfig')
const { isObject, isEmptyObject } = require('../utils/helper')
const { AutoGeneratorError } = require('../utils/error')

const configCache = {}
exports.uploadConfig = function(dir) {
  var cacheKey = exports.isFile(dir) ? path.dirname(dir) : dir
  if (cacheKey in configCache) {
    return configCache[cacheKey]
  }
  var config = exports.findConfig(dir)
  configCache[cacheKey] = config
  return config
}

exports.findConfig = async function(dir) {
  var config = path.join(dir, 'autogenerator.js')
  var pkg = path.join(dir, 'package.json')
  var rc = path.join(dir, '.autogeneratorrc')
  
  var autogeneratorConfig
  if (exports.isFile(pkg)) {
    try {
      autogeneratorConfig = parseConfigFromPackage(pkg)
    } catch (error) {
      if (error.name === 'AutoGeneratorError') throw error
      console.warn(
        '[AutoGenerator] Could not parse ' + pkg + '. Ignoring it.')
    }
  }

  if (exports.isFile(config) && autogeneratorConfig) {
    throw new AutoGeneratorError(`
      ${dir} contains both autogenerator and package.json with autogeneratorConfig`)
  } else if (exports.isFile(rc) && autogeneratorConfig) {
    throw new AutoGeneratorError(`
      ${dir} contains both .autogeneratorrc and package.json with autogeneratorConfig`)
  } else if (exports.isFile(config) && exports.isFile(rc)) {
    throw new AutoGeneratorError(`
      ${dir} contains both autogenerator and .autogeneratorrc with autogeneratorConfig`)
  } else if (exports.isFile(config)) {
    return exports.readConfig(config, 'requireload')
  } else if (exports.isFile(rc)) {
    return exports.readConfig(rc, 'autoload')
  } else {
    if (autogeneratorConfig) {
      return autogeneratorConfig
    } else {
      // 说明没有配置项，这里让用户自动选择自己需要的配置，下载到他的本地
      await promptConfig()
      return exports.findConfig(paths.appPath)
    }
  }
}

exports.isFile = function(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile()
}

exports.isDirectory = function(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
}

exports.readConfig = function(filename, type) {
  try {
    var autogeneratorObject
    if (type === 'requireload') {
      autogeneratorObject = require(filename)
      process.env.AUTOGENERATOR_FILENAME = 'autogenerator.js'
    } else if( type === 'autoload') {
      var rcConfig = fs.readFileSync(filename, 'utf8')
      process.env.AUTOGENERATOR_FILENAME = '.autogeneratorrc'
      autogeneratorObject = JSON.parse(rcConfig)
    }
    checkEvery(autogeneratorObject)
    return autogeneratorObject
  } catch (error) {
    if(error.name === 'AutoGeneratorError') throw error
    console.log(`
      ${chalk.red('.autogeneratorrc config should be a standard Object')}
    `)
  }
}

/**
 * 从package.json 解析autogenerator的配置数据
 * 
 * @param {*} dir
 */
function parseConfigFromPackage(dir) {
  var package = JSON.parse(fs.readFileSync(dir))
  process.env.AUTOGENERATOR_FILENAME = 'package.json'
  if (!package.autogenerator) {
    return false
  }
  var autogeneratorObject = package.autogenerator
  if (!isObject(autogeneratorObject)) {
    throw new AutoGeneratorError(`
      Autogenerator config should be a Object
    `)
  }
  checkEvery(autogeneratorObject)
  return autogeneratorObject
}

function checkEvery(config) {
  var checkField = (value, type) => `Autogenerator the field ${value} should be a ${type}`
  if (!isObject(config)) {
    throw new AutoGeneratorError(`
      Autogenerator config should be a Object
    `)
  } else if (isEmptyObject(config)) {
    throw new AutoGeneratorError(`
      Autogenerator should be a struct or template field
    `)
  }
  Object.keys(config).forEach(c => {
    var value = config[c]
    if (c === 'struct' && !isObject(value)) {
      throw new AutoGeneratorError(checkField(c, 'Array'))
    } else if (c === 'template' && !isObject(value)) {
      throw new AutoGeneratorError(checkField(c, 'Object'))
    }
  })
}