/**
 * BorealisOS Plugin Class,
 * This is the base class for all plugins, please extend this class
 * to create your own plugins. This class is not meant to be used directly.
 *
 * This class is imported by default so you can simply use
 * `extends BorealisPlugin` to create your own plugin.
 */

export default class BorealisPlugin {
  constructor () {
    this.pluginInfo = {
      name: '',
      description: '',
      author: '',
      version: '',
      dependencies: [],
      config: []
    }

    // All data set in here will automatically get saved and reloaded when the plugin is loaded.
    // This is persistent data.
    this.config = {}

    // This is a helper library for registering UI elements.
    // Do not overwrite when extending.
    this.UI = {
      createOptionsPage (component) {
        // Adds a "Plugin Options" button to your plugin's entry in the settings
        // This should be a React Component and called in your constructor.

        // Example:
        // this.UI.createOptionsPage((props) => {return (<h1>Hello World!</h1>)});

        this.UI.settingsPage = component
      },

      settingsPage: null
    }
  }

  // Communication handler, called when a event for this plugin is recieved on client.
  // To send a event to a plugin from serverside make sure to prefix it with your
  // event name.

  // For instance, a plugin that is called 'spotify' will recieve events with the `spotify_` prefix.
  async handleCommunication (event, data) {}

  // Main Function, called when the plugin is loaded.
  async main () {}

  // Called when the plugin is unloaded or hot reloaded.
  async unload () {}
}
