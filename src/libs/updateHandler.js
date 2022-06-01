const axios = require('axios').default

module.exports = class UpdateHandler {
  constructor (injector, communicator) {
    this.communicator = communicator
    this.injector = injector
    communicator.registerEventHook('getLatestRelease', this.getLatestRelease)
    communicator.registerEventHook('applyUpdate', this.applyUpdate)
  }

  async getLatestRelease () {
    return new Promise((resolve, reject) => {
      axios.get('https://api.github.com/repos/PineappleIOnic/borealisOS/releases/latest')
        .then(response => {
          resolve(response.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  async applyUpdate (data) {

  }
}
