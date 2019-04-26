const fs = require('fs')
const pretty = require('pretty')
const { blue } = require('./helper')
const paths = require('../config/paths')
const inquirer = require('inquirer')
const templates = require('../templates')

module.exports = async function() {
  const { framework } = await inquirer.prompt({
    name: 'framework',
    message: 'Select the framework(only the vue basic configuration is available):',
    type: 'list',
    choices: [
      { name: 'vue', value: 'vue' },
      { name: 'react', value: 'react' }
    ]
  })
  
  // 拿到framework进行模版选择，再下载到项目中
  const tplConfig = templates[framework]
  if (tplConfig) {
    const endContent = `module.exports = \n${JSON.stringify(tplConfig, null, '\t')}`
    const results = fs.writeFileSync(paths.appAutogenerator, endContent)
    !results && console.log(blue('`autogenerator.js` in' + ' ' + paths.appAutogenerator))
  } else {
    throw new Error('no framework matched;Currently, only the vue basic configuration is available')
  }
}