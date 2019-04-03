const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const resolveOwn = relativePath => path.resolve(__dirname, '../..', relativePath)

module.exports = {
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appSrc: resolveApp('src'),
  appPackageJson: resolveApp('package.json'),
  ownApp: resolveOwn('.'),
  ownBuild: resolveOwn('build'),
  ownPublic: resolveOwn('public'),
  ownSrc: resolveOwn('src'),
  ownPackageJson: resolveApp('package.json')
}