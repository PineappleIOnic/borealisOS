const keystore = global.keystore;
const fs = require('fs');
const { resolve } = require('path');
const logger = new (require('./log'))('Theme Engine');

module.exports = class ThemeEngine {
    constructor(injectorInstance, communicator) {
        this.keystore = global.keystore;

        // Read all themes
        try {
            fs.accessSync(resolve('./themes'))
        } catch {
            fs.mkdirSync(resolve('./themes', { recursive: true }));
            return;
        }

        let allThemes = {};

        fs.readdirSync(resolve('./themes')).forEach(file => {
            if (fs.lstatSync(resolve('./themes'), file).isDirectory()) {
                // See if there is a meta.json
                let meta = {};
                try {
                    fs.accessSync(resolve(resolve('./themes'), file, 'meta.json'))

                    try {
                        meta = JSON.parse(fs.readFileSync(resolve(resolve('./themes'), file, 'meta.json')));

                        meta['name'].toString();
                    } catch {
                        console.warn(`Invalid meta.json for ${file}! Defaulting to folder name.`);
                        meta = {
                            name: file,
                            author: 'Unknown'
                        }
                    }
                } catch {
                    console.warn(`Missing meta.json for ${file}! Defaulting to folder name.`);
                    meta = {
                        name: file,
                        author: 'Unknown'
                    }
                }

                try {
                    fs.accessSync(resolve(resolve('./themes'), file, 'theme.css'))

                    allThemes[meta.name] =
                    {
                        contents: fs.readFileSync(resolve(resolve('./themes'), file, 'theme.css')).toString(),
                        meta: meta
                    }
                } catch {
                    console.log(`Could not find theme.css for ${file}!`);
                }


            } else {
                logger.warning(file + ' in ./themes is not in a directory. Skipping.');
            }
        });

        this.themes = allThemes;
        this.injector = injectorInstance;

        communicator.registerEventHook("setTheme", this.selectTheme.bind(this));
        communicator.registerEventHook("getThemes", () => this.themes);
        communicator.registerEventHook("currentTheme", () => { return {
            name: this.keystore.readKey('currentTheme') || 'default', 
            content: this.keystore.readKey('currentTheme') ? this.themes[this.keystore.readKey('currentTheme')].contents : ''}});

        if (this.keystore.readKey('currentTheme')) {
            this.selectTheme(this.keystore.readKey('currentTheme'))
        }
    }

    async selectTheme(name) {
        let theme = null;
        for (theme in this.themes) {
            if (this.themes[theme].meta.name === name) {
                theme = this.themes[theme]
            }
        }

        if (!theme) {
            logger.warning(`Attempted to load theme ${name} but could not find it!`);
            return;
        }

        logger.info(`Switching theme to ${name}`);
        await this.injector.refreshInstances();

        // Next load the theme into all instances.
        for (let page in this.injector.instance) {
            this.injector.instance[page].addScriptTag({ content: "window.Borealis.setTheme(`" + theme.contents + "`);" })
        }

        if (this.keystore.readKey('currentTheme') !== name) {
            this.keystore.writeKey('currentTheme', name);
        }
    }
}