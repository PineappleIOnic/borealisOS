const fetch = require('cross-fetch')

module.exports = class UpdateHandler {
  constructor (injector, communicator) {
    this.communicator = communicator
    this.injector = injector
    communicator.registerEventHook('getLatestRelease', this.getLatestRelease)
    communicator.registerEventHook('applyUpdate', this.applyUpdate)
  }

  async getLatestRelease () {
    return new Promise((resolve, reject) => {
      fetch('https://api.github.com/repos/borealisOS/borealisOS/releases/latest')
        .then((data) => data.json())
        .then(data => resolve(data))
        .catch(err => {
          reject(err)
        })
    })
  }

  async applyUpdate (data) {

  }
}
