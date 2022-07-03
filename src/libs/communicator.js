const logger = new (require('./log'))('Communicator')
const fetch = require('cross-fetch')

module.exports = class borealisCommunicator {
  async init (injector) {
    this.messageHooks = {}
    this.knownInstances = []
    await injector.refreshInstances()
    this.injector = injector
  }

  async recieveData (event, data) {
    logger.info(`Recieved event ${event}`)

    // Update the borealisPush function just incase any new instances have shown up.
    this.injector.refreshInstances().then(() => {
      for (const page in this.injector.instance) {
        if (!this.knownInstances.includes(page)) {
          this.injector.instance[page].exposeFunction('borealisPush', (event, data) => {
            return this.recieveData(event, data)
          })
          this.injector.instance[page].addScriptTag({ content: 'window.Borealis.setCommunicatorOnline()' })

          this.knownInstances.push(page)
        }
      }
    })

    if (event) {
      for (const hook in this.messageHooks) {
        if (event === hook) {
          return this.messageHooks[hook](data)
        }
      }
    } else {
      logger.warning('Recieved message without event.')
    }
  }

  async send (event, data) {
    // Only send to SP
    await this.injector.refreshInstances()

    if (this.injector.instance.SP) {
      this.injector.instance.SP.addScriptTag({ content: `window.__BOREALIS__.COMMUNICATE('${event}', ${JSON.stringify(data)});` })
    }
  }

  async exposeFunctions (pageInstance) {
    // Check if binding already exists, (This is a little hacky. as it's not actually apart of the pupeteer API)
    if (!pageInstance._pageBindings.has('borealisPush')) {
      await pageInstance.exposeFunction('borealisPush', (event, data) => {
        return this.recieveData(event, data)
      })
    }

    if (!pageInstance._pageBindings.has('borealisFetch')) {
      await pageInstance.exposeFunction('borealisFetch', fetch)
    }
  }

  async finaliseInit () {
    await this.injector.refreshInstances()
    for (const page in this.injector.instance) {
      await this.exposeFunctions(this.injector.instance[page])

      if (!this.injector.instance[page]) {
        return
      }

      this.injector.instance[page].addScriptTag({ content: 'window.Borealis.setCommunicatorOnline()' })

      this.knownInstances.push(page)
    }
  }

  registerEventHook (event, func) {
    this.messageHooks[event] = func
  }
}
