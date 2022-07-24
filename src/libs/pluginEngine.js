const fs = require('fs')
const { resolve } = require('path')
const logger = new (require('./log'))('Plugin Engine')
const babel = require('@babel/core')
const Keystore = require('./keystore')

module.exports = class PluginEngine {
  constructor (injectorInstance, communicator) {
    this.pluginKeystore = new Keystore('pluginData')
    this.communicator = communicator

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

    communicator.registerEventHook('pluginConfigSet', (data) => {
      this.syncConfig(data, false);
    })

    communicator.registerEventHook('pluginConfigGet', (name) => {
      return this.pluginKeystore.readKey(`plugin_${name}`)
    })

    this.plugins = []

    logger.info('Loading all serverside components...')

    fs.readdirSync(resolve('./plugins')).forEach(file => {
      if (!file.endsWith('.server.js')) {
        return
      }
      try {
        const plugin = new (require(resolve('./plugins', file)))(communicator)

        const pluginEngine = this

        plugin.config = new Proxy(this.pluginKeystore.readKey(`plugin_${plugin.pluginInfo.name}`) || {}, {
          set: function (target, key, value) {
            target[key] = value

            // Send Data to backend
            const data = {
              name: plugin.pluginInfo.name,
              result: target,
              key: key,
              value: value
            }

            pluginEngine.syncConfig(data, true)
            return true
          }
        })

        if (plugin.main) {
          plugin.main()
        }
      } catch (e) {
        logger.error(`Failed to load ${file}: ${e}`)
      }
    })
  }

  // Helper function to sync configuration between a plugin that has both serverside and clientside plugins.
  // They **MUST** have the same plugin name.
  syncConfig (data, calledByServer) {
    this.pluginKeystore.writeKey(`plugin_${data.name}`, data.result)

    if (calledByServer) {
      // Send to clientside
      this.communicator.send('configRefresh', data)
    } else {
      this.plugins.forEach(plugin => {
        if (plugin.pluginInfo.name === pluginName) {
          plugin.config = new Proxy(data.target || {}, {
            set: function (target, key, value) {
              target[key] = value

              // Send Data to backend
              const data = {
                name: plugin.pluginInfo.name,
                result: target,
                key: key,
                value: value
              }
              pluginEngine.syncConfig(data, true)
              return true
            }
          })
        }
      }
      )
    }
  }
}
