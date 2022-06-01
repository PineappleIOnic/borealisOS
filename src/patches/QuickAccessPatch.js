const BorealisPatch = require('../borealisPatch')
const fs = require('fs')

module.exports = class QuickAccessPatch extends BorealisPatch {
  constructor () {
    super()
    this.name = 'QuickAccessPatch'
    this.patchFiles = [
      'steamui/sp.js'
    ]
  }

  getPatchFiles () {
    return this.patchFiles
  }

  patch (file) {
    // Run patches...
    let fileData = fs.readFileSync(file)

    fileData = this.hookFunc(fileData, '.filter((A=>!!A));', ' window.__BOREALIS__.quickAccessHook(Q);')

    // Also add borealis modified tag.
    fileData = '/* BOREALIS MODIFIED */' + fileData

    // Write fileData.
    fs.writeFileSync(file, fileData)
  }
}
