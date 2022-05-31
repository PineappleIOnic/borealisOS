module.exports = class Spotify extends BorealisPlugin {
    // An Example Integration for BorealisOS

    constructor() {
        super();
        this.pluginInfo = {
            name: 'Spotify',
            description: 'A Spotify integration for SteamOS',
            author: "IOnicisere",
            version: "1.0.0",
            dependencies: ['borealis-core'],
            config: [
                // Config is a list of variables that you want borealis to save persistently.
                // They will be automatically saved and loaded on initialisation and accessible through
                // this.config.variableName

                // Example:
                {
                    "name": "spotify_client_id",
                    "type": "string",
                    "default": "",
                    "description": "Spotify Client ID"
                },
                {
                    "name": "spotify_client_secret",
                    "type": "string",
                    "default": "",
                    "description": "Spotify Client Secret"
                },

                // You are also able to define buttons in the plugin settings.
                {
                    "name": "spotify_login",
                    "type": "button",
                    "description": "Login to Spotify",
                    "callback": this.login // This will call this plugin's Login function.
                }
            ]
        }
    }

    async main() {
        // This is a main thread for your plugin. You can do anything here.

        this.UI.settingsPage = (props) => {
            const React = window.SP_REACT;

            return (
                <div>
                    <h1>Hello World!</h1>
                    <p>This is an example plugin.</p>
                    <p>You can edit this file to create your own plugin.</p>
                </div>
            )
        };
    }

    async login() {
    }


}