var chalk = require('chalk')

exports.warn = function(message) {
  console.log(`
    ${chalk.yellow(message)}`)
}