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
      thumbnail: '', // Can be URL, Base64, or SVG.
      version: '',
      dependencies: [],
      config: []
    }

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

  // Main Function, called when the plugin is loaded.
  async main () {}

  // Called when the plugin is unloaded.
  async unmount () {}

  // Called when the plugin is hot-reloaded.
  async duringHotReload () {}
}
