const borealisCommunicator = require('./libs/communicator')
const borealisInjector = require('./libs/injector')
const logger = new (require('./libs/log'))('Core')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const BorealisUI = require('./libs/borealisUI')
const HotReload = require('./libs/hotReload')
const ThemeEngine = require('./libs/themeEngine')
const PluginEngine = require('./libs/pluginEngine')
const UpdateHandler = require('./libs/updateHandler')

global.keystore = new (require('./libs/keystore.js'))()

function generateUILib (injector) {
  const BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

  const currentSpData = fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/sp.js'))
  const oldSpHash = global.keystore.readKey('spHash') || ''

  let currentSpHash = crypto.createHash('sha256')
  currentSpHash = (currentSpHash.update(currentSpData)).digest('hex')

  if (oldSpHash !== currentSpHash && currentSpData.includes('BOREALIS') == false) {
    logger.info('Detected new version of steam. Updating UI Libs.')
    logger.info('New Steam sp.js hash: ' + currentSpHash)

    const borealisUI = new BorealisUI()

    const borealisUIScripts = borealisUI.decode({
      sp: currentSpData.toString(),
      libraryRoot: fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/libraryroot~sp.js')),
      login: fs.readFileSync(path.resolve(injector.detectSteamInstall(), 'steamui/login.js'))
    })

    global.keystore.writeKey('spHash', currentSpHash)

    fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Client.js'), borealisUIScripts.clientScript)
    fs.writeFileSync(path.resolve(BorealisAppdata, 'borealisUI_Server.js'), borealisUIScripts.serverScript)
  }
}

async function init () {
  const injector = new borealisInjector()

  generateUILib(injector)

  const BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

  logger.info('Initialising Borealis Injector')
  await injector.inject(BorealisAppdata)

  logger.info('Injection finished. Starting communicator.')

  const communicator = new borealisCommunicator()
  await communicator.init(injector)

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

  process.on('exit', async function () {
    logger.info('Shutting down BorealisOS')

    await injector.uninject()

    process.exit()
  })
}

init()
