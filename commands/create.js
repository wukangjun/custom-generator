var fs = require('fs')
var path = require('path')
var touch = require('touch')
var mkdir = require('make-dir')
var pretty = require('pretty')
var paths = require('../config/paths')
var variable = require('../config/variable')
var { findConfig } = require('../utils/index')
var { TPL_REGEXP, INHERITS_REGEXP, FIELD_REGEXP } = require('../utils/helper') 
var { AutoGeneratorError, error } = require('../utils/error')
var FactoryAssemblyLine = require('../utils/FactoryAssemblyLine')
var assemblyline = new FactoryAssemblyLine()


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
        list.template
          && writeFileFromTemplate(
            filepath,
            list.template,
            template,
            variable,
            rootName)
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

module.exports = function(params) {
  try {
    assemblyline.start({
      ...findConfig(paths.appPath),
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
    })
  })