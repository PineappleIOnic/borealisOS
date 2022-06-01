const { resolve } = require('path')
const fs = require('fs')
const logger = new (require('./log'))('keystore')

module.exports = class Keystore {
  constructor () {
    // Load borealisData

    const BorealisAppdata = resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

    this.data = {}
    this.path = resolve(BorealisAppdata, 'borealisData.json')

    if (!fs.existsSync(BorealisAppdata)) {
      fs.mkdirSync(BorealisAppdata, { recursive: true })
      fs.writeFileSync(this.path, JSON.stringify({}))
    } else {
      try {
        this.data = JSON.parse(fs.readFileSync(this.path))
      } catch {
        logger.warning('borealisData.json missing or corrupted, regenerating...')
        fs.writeFileSync(resolve(BorealisAppdata, 'borealisData.json'), JSON.stringify({}))
      }
    }
  }

  writeKey (key, data) {
    this.data[key] = data
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }

  readKey (key) {
    return this.data[key]
  }
}
