const puppeteer = require('puppeteer-core')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fetch = require('cross-fetch')
const logger = new (require('./log'))('Injector')
const fs = require('fs')
const { resolve, basename } = require('path')

module.exports = class borealisInjector {
  constructor () {
    this.filesToPatch = [
      'steamui/sp.js',
      'steamui/libraryroot~sp.js',
      'steamui/index.html'
    ]
  }

  detectSteamInstall () {
    const locations = [
      'C:/Program Files (x86)/Steam/',
      '/home/deck/.steam/steam'
    ]

    let detectedLocation = false

    // Check all locations
    locations.forEach(element => {
      try {
        fs.accessSync(element)
        fs.accessSync(resolve(element, 'steamui/sp.js'))
        fs.accessSync(resolve(element, 'steamui/libraryroot~sp.js'))
        detectedLocation = element
      } catch (err) {

      }
    })

    return detectedLocation
  }

  async getCEFData () {
    for (let i = 0; i < 4; i++) {
      const response = fetch('http://localhost:8080/json/version')
        .then(response => response.json())
        .catch((err) => {
          logger.warning('Something went wrong attempt to contact debugger, retrying in 5 seconds...')
          return false
        })

      if (response !== false) {
        return response
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    throw new Error('Failed to get CEF Data after 5 tries. Not attempting again.')
  }

  async refreshInstances () {
    const cefdata = await this.getCEFData()

    // Hook Browser Instance

    for (let i = 0; i < 5; i++) {
      const connectSuccess = await puppeteer.connect({
        browserWSEndpoint: cefdata.webSocketDebuggerUrl,
        defaultViewport: null
      }).then((instance) => {
        this.browserInstance = instance
        return true
      }).catch((err) => {
        logger.warning('Failed to hook CEF, waiting 5 seconds then trying again.')
        return false
      })

      if (connectSuccess) {
        break
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    const pages = await this.browserInstance.pages()
    this.instance = {}

    await Promise.all(pages.map(async (page) => {
      const title = await page.title()
      if (title !== null && title !== '') {
        this.instance[title] = page
      }
    }))
  }

  loadPatchFiles () {
    this.patches = []
    fs.readdirSync('./src/patches').forEach(file => {
      if (!file.endsWith('.js')) {

      } else {
        this.patches.push(new (require(resolve('./src/patches/', file)))())
      }
    })
  }

  async patchFile (file, steamInstall) {
    for (const patch of this.patches) {
      for (const patchFile of patch.getPatchFiles()) {
        if (file.replace(/\\/g, '/').endsWith(patchFile)) {
          await patch.patch(file, steamInstall)
        }
      }
    }
  }

  async inject () {
    // Step 1, Patch all client files that need patching.
    const steamInstall = this.detectSteamInstall()

    if (!fs.existsSync(resolve(steamInstall, './borealis'))) {
      fs.mkdirSync(resolve(steamInstall, './borealis'))
    }

    if (!fs.existsSync(resolve(steamInstall, './borealis/backups'))) {
      fs.mkdirSync(resolve(steamInstall, './borealis/backups'))
    }

    this.loadPatchFiles()

    this.backups = []

    const startTime = Date.now()

    for (const file of this.filesToPatch) {
      const contents = fs.readFileSync(resolve(steamInstall, file))
      this.backups.push({
        directory: resolve(steamInstall, file),
        content: contents
      })

      if (!contents.includes('BOREALIS MODIFIED')) {
        // Write backup file
        fs.writeFileSync(resolve(steamInstall + '/borealis/backups', basename(file)), contents)
      }

      logger.info('Patching File: ' + file)
      await this.patchFile(resolve(steamInstall, file), steamInstall)
    }

    logger.info('All Files Patched. Took ' + (Date.now() - startTime) + 'ms')

    // Step 2, check if steam is running and willing to accept connections
    while (true) {
      if (!isSteamRunning()) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        break
      }
    }

    logger.info('Steam is running! Attempting to connect...')

    const cefdata = await this.getCEFData()

    // Hook Browser Instance

    for (let i = 0; i < 5; i++) {
      const connectSuccess = await puppeteer.connect({
        browserWSEndpoint: cefdata.webSocketDebuggerUrl,
        defaultViewport: null
      }).then((instance) => {
        logger.info('Successfully hooked CEF.')
        this.browserInstance = instance
        return true
      }).catch((err) => {
        logger.warning('Failed to hook CEF, waiting 5 seconds then trying again.')
        return false
      })

      if (connectSuccess) {
        break
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    const pages = await this.browserInstance.pages()
    this.instance = {}

    await Promise.all(pages.map(async (page) => {
      const title = await page.title()
      if (title === 'SP') {
        await page.reload()
        logger.info('Finished All Stages, BorealisOS is loaded.')
        this.instance.SP = page
      } else {
        // Manually inject borealisCore into non main pages.
        if (title !== null && title !== '') {
          page.addScriptTag({ path: resolve('src/client/borealisCore.js') })
          this.instance[title] = page
        }
      }
    }))
  }

  async uninject () {
    // Restore all files.
    this.backups.forEach(file => {
      fs.writeFileSync(file.directory, file.content)
      logger.info('Restored original file: ' + file.directory)
    })

    this.instance.SP.reload()
  }
}

// Check if steam is running
const isSteamRunning = async () => {
  switch (process.platform) {
    case 'win32': command = 'tasklist'; break
    case 'darwin': command = 'ps -ax | grep steamwebhelper'; break
    case 'linux': command = 'ps -ax | grep steamwebhelper'; break
    default: break
  }
  const response = await exec(command)
  if (response.stdout.toLowerCase().includes('steamwebhelper')) {
    return true
  }
}

module.exports.detectSteamInstall = function () {
  const locations = [
    'C:/Program Files (x86)/Steam/',
    '/home/deck/.steam/steam'
  ]

  let detectedLocation = false

  // Check all locations
  locations.forEach(element => {
    try {
      fs.accessSync(element)
      fs.accessSync(resolve(element, 'steamui/sp.js'))
      fs.accessSync(resolve(element, 'steamui/libraryroot~sp.js'))
      detectedLocation = element
    } catch (err) {

    }
  })

  return detectedLocation
}
