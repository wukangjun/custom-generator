#!/usr/bin/env node

var program = require('commander')
var paths = require('../config/paths')

program
  .version(require(paths.ownPackageJson).version, '-v, --version')
  .option('-a, --all', 'Both routing and data state are configured', () => true)
  .option('-r, --router <items>', 'The read configuration generates the route', split)
  .option('-s --struct [type]', 'hello world')

// first command is not accept the argument of second
// 采用了description
program
  .command('init')
  .description('Initialize the routing configuration')
  .command('create [options...]', 'Custom manual file template creation')

program
  .action(function(cmd, options) {
    require(`../commands/${cmd}`)({
      options,
      program
    })
  })
  .parse(process.argv)

function split(val) {
  return val.split(',')
}



