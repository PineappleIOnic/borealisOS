const fs = require('fs')
const { resolve } = require('path')
const logger = new (require('./log'))('Plugin Engine')
const babel = require('@babel/core')

module.exports = class PluginEngine {
  constructor (injectorInstance, communicator) {
    communicator.registerEventHook('loadPlugins', () => {
      logger.info('Transpiling Plugins...')

      // Read all plugins
      const allPlugins = {}

      fs.readdirSync(resolve('./plugins')).forEach(file => {
        // Read file
        const data = fs.readFileSync(resolve('./plugins', file)).toString()

        const startTime = Date.now()

        // Transpile
        const transpiled = babel.transformSync(data, {
          presets: ['@babel/preset-react']
        })

        logger.info(`Transpiled ${file} in ${Date.now() - startTime}ms`)

        // Send to communicator
        communicator.send('plugin', {
          name: file,
          contents: transpiled.code
        })
      })
    })

    logger.info('Loading all serverside components...')


  }
}
