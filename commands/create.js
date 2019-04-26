const fs = require('fs')
const path = require('path')
const touch = require('touch')
const chalk = require('chalk')
const mkdir = require('make-dir')
const pretty = require('pretty')
const paths = require('../config/paths')
const variable = require('../config/variable')
const { findConfig } = require('../utils/index')
const { TPL_REGEXP, INHERITS_REGEXP, FIELD_REGEXP } = require('../utils/helper') 
const { AutoGeneratorError, error } = require('../utils/error')
const FactoryAssemblyLine = require('../utils/FactoryAssemblyLine')
const assemblyline = new FactoryAssemblyLine()


function eachStruct(
  parent,
  lists,
  rootName, 
  template, 
  variable) {
    lists.forEach(function(list) {
      var filepath = path.join(
        parent,
        list.name.replace(INHERITS_REGEXP, function(m, r) { return rootName }))
      
      if (list.type === 'dir') {
        mkdir.sync(filepath)
      } else if (list.type === 'file'){
        touch.sync(filepath)
        if (list.template) {
          writeFileFromTemplate(filepath, list.template, template, variable, rootName)
        }
      }
      list.children
        && eachStruct(filepath, list.children, rootName, template, variable)
  })
}

function writeFileFromTemplate(writepath, tpl, template, variable, rootName) {
  var temp = tpl.replace(TPL_REGEXP, function(m, r1) {
    if (!template[r1]) {
      throw new AutoGeneratorError(
        `Please check whether there is template for '${r1}' field `)
    }

    //  当模版的的字段为inherit 默认为路径名
    return template[r1].replace(FIELD_REGEXP, function(m, r2) {
      return r2 === 'inherit' ? rootName : variable[r2]
    })
  })
  fs.writeFileSync(writepath, pretty(temp))
}

module.exports = async function(params) {
  const generatorConfig = await findConfig(paths.appPath)
  try {
    assemblyline.start({
      ...generatorConfig,
      structKey: params.program.struct,
      targetFilename: params.options.split(',')
    })
  } catch (e) {
    error(
      'Files should be created with a file path argument \n' +
      'eg. autogenerator create -s pages src/home,src/login')
  }
}

assemblyline
  /**
   * find struct from autogenerator
   * @param {Object} config = { key, lists }
   */
  .pipe(function(config) {
    try {
      var struct = config.struct[config.structKey]
      config.targetFilename.forEach(filename => {
        filename = path.resolve(paths.appPath, filename)
        if (fs.existsSync(filename)) {
          throw new AutoGeneratorError(
            `Directory '${filename}' already exists in your project`)
        }
        mkdir.sync(filename)
        eachStruct(
          filename, 
          struct, 
          path.basename(filename),
          config.template || {},
          Object.assign({}, variable, config.variable))
        
        console.log(chalk.green(`success: ${filename} was created successfully in your project`))
      }) 
    } catch (e) {
      error(`
        the struct field does not have the ${config.structKey} keyword from autogenerator.js`)
    }
  })