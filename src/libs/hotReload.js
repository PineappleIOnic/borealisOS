const logger = new (require('./log'))('Hot Reload')
const chokidar = require('chokidar')
const { resolve } = require('path')
const { copyFileSync, readFileSync } = require('fs')
const Bundler = require('./bundler')

module.exports = class HotReload {
  constructor (injectorInstance) {
    this.injector = injectorInstance
    this.timeouts = {}
    this.bundler = new Bundler()

    logger.info('Watching for changes...')

    // Watch client folder
    chokidar.watch(resolve('./src/client/')).on('all', (event, path) => this.handleEvent(event, path, 'borealisCore'), {})

    // Watch plugins
    chokidar.watch(resolve('./plugins')).on('all', (event, path) => this.handleEvent(event, path, 'borealisCore'))

    // Watch themes
    chokidar.watch(resolve('./themes')).on('all', (event, path) => this.handleEvent(event, path, 'theme'))
  }

  async handleEvent (event, path, type) {
    if (event !== 'change') {
      return
    }
    // Get latest instances
    await this.injector.refreshInstances()

    if (this.timeouts[path]) {
      clearTimeout(this.timeouts[path])
      this.timeouts[path] = setTimeout(() => { this.timeouts[path] = undefined }, 10000)
      return
    }

    if (type === 'borealisCore' && event === 'change') {
      logger.info('Reloading borealisCore...')

      const startTime = Date.now()

      await this.bundler.bundle()

      copyFileSync(resolve('./dist/bundle.js'), resolve(this.injector.detectSteamInstall(), 'steamui/borealis/borealisCore.js'))
      this.injector.instance.SP.addScriptTag({ content: 'window.__BOREALIS__.uninject();' })
      this.injector.instance.SP.addScriptTag({ path })

      logger.info(`Rebundled and Reloaded borealisCore in ${Date.now() - startTime}ms`)
    } else if (type === 'theme' && event === 'change') {
      return
      // TODO: Throw this to the theme engine instead.

      logger.info('Reloading theme: ' + path)
      const themeCSS = readFileSync(path)
      // Also inject theme on non-SP pages
      for (const page in this.injector.instance) {
        this.injector.instance[page].addScriptTag({ content: 'window.Borealis.setTheme(`' + themeCSS + '`);' })
      }
    } else if (type === 'plugin') {

    }
  }
}
