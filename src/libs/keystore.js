const { resolve } = require('path')
const fs = require('fs')
const logger = new (require('./log'))('keystore')

module.exports = class Keystore {
  constructor (configName) {
    const fileName = (configName || 'borealisData') + '.json'

    const BorealisAppdata = resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'), 'borealisOS')

    this.data = {}
    this.path = resolve(BorealisAppdata, fileName)

    if (!fs.existsSync(BorealisAppdata)) {
      fs.mkdirSync(BorealisAppdata, { recursive: true })
      fs.writeFileSync(this.path, JSON.stringify({}, null, 2))
    } else {
      try {
        this.data = JSON.parse(fs.readFileSync(this.path))
      } catch {
        logger.warning(fileName + ' missing or corrupted, regenerating...')
        fs.writeFileSync(resolve(BorealisAppdata, fileName), JSON.stringify({}, null, 2))
      }
    }
  }

  writeKey (key, data) {
    this.data[key] = data
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
  }

  readKey (key) {
    return this.data[key]
  }
}
