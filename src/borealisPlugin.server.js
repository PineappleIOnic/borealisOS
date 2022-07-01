module.exports = class BorealisPluginServer {
  constructor (communicator, logger) {
    this.pluginInfo = {
      name: '',
      description: '',
      author: '',
      version: '',
      dependencies: [],
      config: []
    }
    this.communicator = communicator
    this.logger = logger
  }

  async main () {
    // This is a main initialization thread for your plugin. You can do anything here.
  }

  async unload () {
    // Called when the plugin is unloaded or hot reloaded.
  }
}
