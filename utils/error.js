var  util = require('util')
var chalk = require('chalk')
var program = require('commander')

function AutoGeneratorError(message) {
  this.name =  'AutoGeneratorError'
  this.message = message
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, AutoGeneratorError)
  }
}

util.inherits(AutoGeneratorError, Error)

exports.AutoGeneratorError = AutoGeneratorError

exports.error = function(message) {
  program.outputHelp()
  console.log(`${chalk.red(`${message} \n`)}`)
  process.exit(1)
}