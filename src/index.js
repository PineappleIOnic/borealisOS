const borealisCommunicator = require('./libs/communicator')
const borealisInjector = require('./libs/injector')
const logger = new (require('./libs/log'))('Core')
const { resolve } = require('path')
const fs = require('fs')
const crypto = require('crypto')
const BorealisUI = require('./libs/borealisUI')
const HotReload = require('./libs/hotReload')
const ThemeEngine = require('./libs/themeEngine')
const PluginEngine = require('./libs/pluginEngine')
const UpdateHandler = require('./libs/updateHandler')
const chokidar = require('chokidar')
require('dotenv').config()

global.borealisData = new (require('./libs/keystore.js'))()

function generateUILib (injector) {
  const BorealisAppdata = resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

  const steamInstall = injector.detectSteamInstall()

  const currentSpData = fs.readFileSync(resolve(steamInstall, 'steamui/sp.js'))
  const oldSpHash = global.keystore.readKey('spHash') || ''

  let currentSpHash = crypto.createHash('sha256')
  currentSpHash = (currentSpHash.update(currentSpData)).digest('hex')

  if ((oldSpHash == false || "")  || (oldSpHash !== currentSpHash && currentSpData.includes('BOREALIS') == false)) {
    logger.info('Detected new version of steam. Updating UI Libs.')
    logger.info('New Steam sp.js hash: ' + currentSpHash)

    // Remove old backups
    if (fs.existsSync(resolve(steamInstall, './borealis/backups'))) {
      fs.rmSync(resolve(steamInstall, './borealis/backups'), { recursive: true })
    }

    const borealisUI = new BorealisUI()

    const borealisUIScripts = borealisUI.decode({
      sp: currentSpData.toString(),
      libraryRoot: fs.readFileSync(resolve(injector.detectSteamInstall(), 'steamui/libraryroot~sp.js')),
      login: fs.readFileSync(resolve(injector.detectSteamInstall(), 'steamui/login.js'))
    })

    global.borealisData.writeKey('spHash', currentSpHash)

    fs.writeFileSync(resolve(BorealisAppdata, 'borealisUI_Client.js'), borealisUIScripts.clientScript)
    fs.writeFileSync(resolve(BorealisAppdata, 'borealisUI_Server.js'), borealisUIScripts.serverScript)
  }
}

async function init () {
  const injector = new borealisInjector()

  // Quick check to ensure CEF Debugging is enabled.
  if (!fs.existsSync(resolve(injector.detectSteamInstall(), '.cef-enable-remote-debugging'))) {
    fs.writeFileSync(resolve(injector.detectSteamInstall(), '.cef-enable-remote-debugging'), '')
    logger.error('CEF Debugging is not enabled. BorealisOS has enabled it for you. Please restart Steam and try again.')
    process.exit(1)
  }

  generateUILib(injector)

  const BorealisAppdata = resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

  logger.info('Initialising Borealis Injector')
  await injector.inject(BorealisAppdata)

  logger.info('Injection finished. Starting communicator.')

  const communicator = new borealisCommunicator()
  await communicator.init(injector)

  // Watch steam files ready for a restart, since steam will roll back borealis files to default ones.
  logger.info('Watching Steam files ready for repatch')
  chokidar.watch(borealisInjector.detectSteamInstall() + '/steamui').on('all', async (event, path) => {
    if (event === 'change' && path.endsWith('index.html')) {
      if (!fs.readFileSync(path).includes('BOREALIS MODIFIED')) {
        logger.info('Steam has rolled back BorealisOS changes! Repatching files now...')
        // Wait ten seconds for steam to finish updating.
        await new Promise((res) => { setTimeout(res, 10000) })
        await injector.inject(BorealisAppdata)

        // Reinitialise Communicator
        communicator.finaliseInit()

        logger.info('Successfully repatched files.')
      }
    }
  }, {})

  if (process.argv.includes('--hot-reload')) {
    const hotReload = new HotReload(injector)
  }

  new ThemeEngine(injector, communicator)
  new PluginEngine(injector, communicator)
  new UpdateHandler(injector, communicator)

  communicator.finaliseInit(injector)

  communicator.registerEventHook('uninject', async () => {
    await injector.uninject()
    process.exit()
  })

  async function shutdown () {
    logger.info('Shutting down BorealisOS')

    await injector.uninject()

    process.exit()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

init()
