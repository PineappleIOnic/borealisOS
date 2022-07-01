const fs = require('fs')
const { resolve } = require('path')
const logger = new (require('./log'))('Plugin Engine')
const babel = require('@babel/core')

module.exports = class PluginEngine {
  constructor (injectorInstance, communicator) {
    communicator.registerEventHook('loadPlugins', () => {
      logger.info('Transpiling ClientSide Plugins...')

      // Read all plugins
      const allPlugins = {}

      fs.readdirSync(resolve('./plugins')).forEach(file => {
        if (!file.endsWith('.client.js')) {
          return
        }

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

    this.plugins = []

    logger.info('Loading all serverside components...')

    fs.readdirSync(resolve('./plugins')).forEach(file => {
      if (!file.endsWith('.server.js')) {
        return
      }
      try {
        const Plugin = new (require(resolve('./plugins', file)))(communicator)

        if (Plugin.main) {
          Plugin.main()
        }
      } catch (e) {
        logger.error(`Failed to load ${file}: ${e}`)
      }
    })
  }
}
