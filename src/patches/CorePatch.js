const BorealisPatch = require('../borealisPatch')
const fs = require('fs')
const path = require('path')
const Bundler = require('../libs/bundler')
const logger = new (require('../libs/log'))('CorePatch')

module.exports = class CorePatch extends BorealisPatch {
  constructor () {
    super()
    this.name = 'corePatch'
    this.patchFiles = [
      'steamui/index.html'
    ]
    this.bundler = new Bundler()
  }

  getPatchFiles () {
    return this.patchFiles
  }

  async patch (file, steamInstall) {
    const BorealisAppdata = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')
    let fileData = fs.readFileSync(file)

    if (fileData.includes('BOREALIS MODIFIED')) {
      logger.warning(`Borealis Failed to rollback changes to ${file} on the last launch, attempting to restore backup...`)

      if (fs.existsSync(path.resolve(steamInstall, 'backups/', file))) {
        fs.copyFileSync(path.resolve(steamInstall, 'backups/', file), file)
        logger.info(`Borealis Successfully restored backup of ${file}`)
      } else {
        logger.error(`Borealis Failed to restore backup of ${file}, Refusing to patch. Please restart your steam client and try again.`)
        return
      }
    }

    if (!fs.existsSync(path.resolve(steamInstall, 'steamui/borealis'))) {
      fs.mkdirSync(path.resolve(steamInstall, 'steamui/borealis', { recursive: true }))
    }

    await this.bundler.bundle()

    fs.copyFileSync(path.resolve('./dist/bundle.js'), path.resolve(steamInstall, 'steamui/borealis/borealisCore.js'))
    fs.copyFileSync(path.resolve(BorealisAppdata, 'borealisUI_Client.js'), path.resolve(steamInstall, 'steamui/borealis/borealisUI.js'))

    const targetStringIndex = fileData.indexOf('<div style="display:none"></div>')

    fileData = fileData.slice(0, targetStringIndex + '<div style="display:none"></div>'.length) +
        '<script src="/borealis/borealisCore.js"></script>' +
        '<script src="/borealis/borealisUI.js"></script>' +
        fileData.slice(targetStringIndex + '<div style="display:none"></div>'.length, fileData.length)

    // Also add borealis modified tag.
    fileData = '<!-- BOREALIS MODIFIED -->' + fileData

    fs.writeFileSync(file, fileData)
  }
}
